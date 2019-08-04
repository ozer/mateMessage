import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  StyleSheet
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Subscription, Query, withApollo } from 'react-apollo';
import ChatContactCard from '../components/Cards/ChatContactCard';
import { ConversationsQuery } from '../queries/Feed';
import { ConversationCreated, MessageCreated } from '../subscriptions/Message';
import { Person } from '../queries/Auth';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  row: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  avatar: {
    borderRadius: 20,
    width: 40,
    height: 40,
    marginRight: 10
  },
  rowText: {
    flex: 1
  },
  message: {
    fontSize: 18
  },
  sender: {
    fontWeight: 'bold',
    paddingRight: 10
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#eee'
  },
  input: {
    paddingHorizontal: 20,
    fontSize: 18,
    flex: 1
  },
  send: {
    alignSelf: 'center',
    color: 'lightseagreen',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 20
  }
});

class Conversations extends Component {
  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);
    this.state = {
      text: '',
      messages: [],
      personId: '',
      refreshIndicator: false
    };
  }

  componentWillMount() {
    const { props } = this;
    const { client } = props;
    try {
      const Me = client.readQuery({ query: Person });
      console.log('Me -> ', Me);
      if (Me && Me.id) {
        this.setState({
          personId: Me.id
        });
      }
    } catch (e) {
      console.log('ERROR AT READ PERSON QUERY', e);
    }
  }

  navigationButtonPressed({ buttonId }) {
    console.log('buttonId -> ', buttonId);
  }

  onEndEditing = () => {
    this.setState(prevState => ({
      ...prevState,
      messages: [...prevState.messages, 'deneme']
    }));
  };

  onFocusSearchBar = () => {
    console.log('onFocusSearchBar');
    Navigation.showOverlay({
      component: {
        name: 'navigation.playground.SearchResult',
        options: {
          topBar: {
            visible: false
          },
          overlay: {
            interceptTouchOutside: true
          }
        }
      }
    });
  };

  onPress = item => () => {
    console.log('Mate touched! -> ', item);
    Navigation.push('ConversationTabStack', {
      component: {
        name: 'navigation.playground.Conversation',
        id: 'Conversation',
        passProps: {
          conversationId: item.id
        },
        options: {
          bottomTabs: {
            visible: false
          }
        }
      }
    });
  };

  displayRefreshIndicator = () => {
    this.setState(prevState => ({
      ...prevState,
      refreshIndicator: !prevState.refreshIndicator
    }));
  };

  render() {
    const { state, displayRefreshIndicator } = this;
    const { personId, refreshIndicator } = state;

    return (
      <View style={{ flex: 1 }}>
        <Query query={ConversationsQuery} fetchPolicy={'network-only'}>
          {({ loading, error, data, refetch }) => {
            if (loading) {
              console.log('Loading!');
            }
            if (error) {
              console.log('Error ->', error);
            }
            console.log('Conversations Data -> ', data);
            if (data && data.feed && data.feed.length) {
              return (
                <FlatList
                  refreshing={refreshIndicator}
                  onRefresh={async () => {
                    displayRefreshIndicator();
                    console.log('onRefresh!');
                    await refetch();
                    displayRefreshIndicator();
                  }}
                  data={data.feed}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => {
                    console.log('item -> ', item);
                    if (
                      item.recipients &&
                      item.recipients.length &&
                      item.messages &&
                      item.messages.length
                    ) {
                      const { recipients, messages } = item;
                      const otherRecipient = recipients.find(
                        recipient => recipient.id !== personId
                      );
                      return (
                        <ChatContactCard
                          key={item.id}
                          otherRecipient={otherRecipient}
                          lastMessage={
                            messages && messages.length
                              ? messages[messages.length - 1].content
                              : ''
                          }
                          onPress={this.onPress(item)}
                        />
                      );
                    }
                  }}
                />
              );
            }
            return (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <Text
                  style={{ textAlign: 'center', fontSize: 28, color: 'black' }}
                >
                  Find a Mate to Start Chat!
                </Text>
              </View>
            );
          }}
        </Query>
        <Subscription
          subscription={MessageCreated}
          onSubscriptionData={options => {
            if (
              options &&
              options.subscriptionData &&
              options.subscriptionData.data &&
              options.subscriptionData.data.messageCreated
            ) {
              const { subscriptionData } = options;
              const { data } = subscriptionData;
              const { messageCreated } = data;
              console.log(
                'messageCreated from Subscription -> ',
                messageCreated
              );
              const { conversation, sender } = messageCreated;
              const feed = options.client.readQuery({
                query: ConversationsQuery
              });
              const conversationIndex = feed.feed.findIndex(
                obj => obj.id === conversation.id
              );
              const foundConversation = feed.feed[conversationIndex];
              foundConversation.messages.push({
                content: messageCreated.content,
                id: messageCreated.id,
                sender,
                __typename: 'MessageType'
              });
              console.log('foundConversation -> ', foundConversation);
              options.client.writeQuery({
                query: ConversationsQuery,
                data: feed
              });
            }
          }}
        />
      </View>
    );
  }
}

export default withApollo(Conversations);
