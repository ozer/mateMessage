import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Animated
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { withApollo, Query } from 'react-apollo';
import gql from 'graphql-tag';
import ConversationInput from '../components/Conversation/ConversationInput';

import { ConversationsQuery, FindConversation } from '../queries/Feed';
import { Person } from '../queries/Auth';
import ChatContactCard from './Conversations';
import ConversationBubble from '../components/Conversation/ConversationBubble';

const renderFooter = () => (
  <View style={{ height: 10, flex: 1, flexDirection: 'row' }} />
);

class Conversation extends React.Component {
  flatListRef = null;

  constructor(props) {
    super(props);
    this.state = {
      messageText: '',
      Me: null,
      otherRecipient: null,
      error: false
    };

    this.keyboardHeight = new Animated.Value(0);
  }

  componentWillMount() {
    try {
      this.keyboardWillShowSub = Keyboard.addListener(
        'keyboardWillShow',
        this.keyboardWillShow
      );
      this.keyboardWillHideSub = Keyboard.addListener(
        'keyboardWillHide',
        this.keyboardWillHide
      );
      const { props } = this;
      const { conversationId, client } = props;
      const Conv = client.readQuery({
        query: FindConversation
      });
      const Me = client.readQuery({ query: Person });
      if (Conv && Conv.feed && Conv.feed.length) {
        const m = Conv.feed.find(c => c.id === conversationId);
        console.log('Conv -> ', Conv);
        const { recipients } = m;
        const otherRecipient = recipients.find(recipient => {
          console.log('recipient -> ', recipient);
          console.log('Me => ', Me);
          if (recipient.id.toString() !== Me.id.toString()) {
            return recipient;
          }
        });
        this.setState({
          Me,
          otherRecipient
        });
        console.log('Navigation merge options!', otherRecipient.name);
        Navigation.mergeOptions('Conversation', {
          topBar: {
            title: {
              text: otherRecipient.name
            }
          }
        });
      }
    } catch (e) {
      console.log('error -> ', e);
      this.setState({
        error: true
      });
    }
  }

  componentWillUnmount() {
    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
  }

  keyboardWillShow = event => {
    Animated.parallel([
      Animated.timing(this.keyboardHeight, {
        duration: event.duration,
        toValue: event.endCoordinates.height
      })
    ]).start();
  };

  keyboardWillHide = event => {
    Animated.parallel([
      Animated.timing(this.keyboardHeight, {
        duration: event.duration,
        toValue: 0
      })
    ]).start();
  };

  onMessageTextChange = value => {
    this.setState({ messageText: value });
  };

  ConversationZeroState = () => {
    return (
      <View>
        <Text>Start Messaging!</Text>
      </View>
    );
  };

  keyExtractor = item => item.id;

  handleScroll = event => {
    event.persist();
    // console.log('scroll event -> ', event);
  };

  render() {
    const { onMessageTextChange, state, props, handleScroll } = this;
    const { messageText, otherRecipient, Me, error } = state;
    return (
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: '#ffffff',
          paddingBottom: this.keyboardHeight
        }}
      >
        {error ? (
          <View />
        ) : (
          <Query
            query={FindConversation}
            variables={{ id: props.conversationId }}
          >
            {({ loading, error, data }) => {
              if (loading) {
                console.log('Loading!');
              }
              if (error) {
                console.log('Error ->', error);
              }
              const conversation =
                data && data.feed
                  ? data.feed.find(c => c.id === props.conversationId)
                  : {};
              const { messages } = conversation;
              return (
                <View style={{ flex: 1, backgroundColor: '#f1f1f4' }}>
                  {messages && messages.length ? (
                    <FlatList
                      initialNumToRender={10}
                      onScroll={handleScroll}
                      ref={ref => (this.flatListRef = ref)}
                      ListEmptyComponent={this.ConversationZeroState}
                      ListFooterComponent={renderFooter()}
                      onContentSizeChange={event => {
                        // console.log('onContentSizeChange -> ', event);
                        this.flatListRef.scrollToEnd({ animated: true });
                      }}
                      onLayout={event => {
                        // console.log('onLayout -> ', event);
                        this.flatListRef.scrollToEnd({ animated: true });
                      }}
                      data={messages}
                      renderItem={({ item }) => (
                        <ConversationBubble message={item} me={Me} />
                      )}
                      keyExtractor={this.keyExtractor}
                    />
                  ) : null}
                </View>
              );
            }}
          </Query>
        )}
        <ConversationInput
          otherRecipient={otherRecipient}
          onChangeText={onMessageTextChange}
          messageText={messageText}
          conversationId={props.conversationId}
          personId={Me && Me.id ? Me.id : null}
        />
      </Animated.View>
    );
  }
}

export default withApollo(Conversation);
