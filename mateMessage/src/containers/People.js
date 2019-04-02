import React, { useState, useEffect } from 'react';
import { Text, View, FlatList } from 'react-native';
import { Query, withApollo } from 'react-apollo';
import { ConversationsQuery, Users } from '../queries/Feed';
import ChatContactCard from '../components/Cards/ChatContactCard';
import { Navigation } from 'react-native-navigation';
import ContactCard from '../components/Cards/ContactCard';
import { CreateConversation } from '../mutations/Message';

class People extends React.Component{

  state = {
    searchText: '',
    isFocused: false,
  };

  componentDidMount() {
    Navigation.mergeOptions('People', {
      topBar: {
        searchBar: true,
        searchBarHiddenWhenScrolling: true,
        hideNavBarOnFocusSearchBar: true,
        searchBarPlaceholder: 'Search'
      }
    });
    this.navigationEventListener = Navigation.events().bindComponent(this);
  }

  componentWillMount() {
    // Not mandatory
    if (this.navigationEventListener) {
      this.navigationEventListener.remove();
    }
  }

  searchBarUpdated({text, isFocused}) {
    try{
      console.log('Text -> ', text);
      console.log('isFocused -> ', isFocused);
      this.setState({
        searchText: text,
        isFocused
      });
    } catch (e) {
      console.log('ERROR AT SEARCH BAR UPDATED', e);
    }
  };


  onPress = person => () => {
    try {
      console.log('Person touched! -> ', person);
      const { id } = person;
      const { props } = this;
      const { client } = props;
      client.mutate({ mutation: CreateConversation, variables: { receiverId: id }})
        .then(result => {
          console.log('CreateConvo -> ', result);
          if (result && result.data) {
            const { data } = result;
            if (data.createConversation) {
              const { createConversation } = data;
              if (createConversation.state && createConversation.conversationData) {
                const { conversationData } = createConversation;
                const conversations = client.readQuery({ query: ConversationsQuery });
                console.log('I have read the query -> ', conversations);
                const { feed } = conversations;
                const convIndex = feed.findIndex(conv => conv.id === conversationData.id);
                if (convIndex < 0) {
                  feed.push(conversationData);
                  client.writeQuery({ query: ConversationsQuery, data: conversations });
                } else {
                  console.log('Conversation with this person already exists!');
                }
              }
            }
          }
        })

    } catch (e) {
      console.log('ERROR AT CREATE CONVO', e);
    }
  };

  render() {
    const { state } = this;
    const { searchText, isFocused} = state;
    return (
      <Query query={Users} fetchPolicy={'network-only'} >
        {({ loading, error, data, refetch }) => {
          if (loading) {
            return (
              <View>
                <Text>
                  Loading...
                </Text>
              </View>
            )
          }
          if (error) {
            console.log('ERROR AT QUERY PEOPLE');
            return (
              <View>
                <Text>
                  Something went wrong!
                </Text>
              </View>
            )
          }
          console.log('Loading -> ', loading);
          console.log('Data -> ', data);
          const filteredPeople = data.people.filter(person => person.name.includes(searchText.toString().toLowerCase()));
          return (
            <View style={{flex: 1}}>
              <FlatList
                refreshing={false}
                onRefresh={() => {
                  console.log('onRefresh!');
                  if (!isFocused) {
                    refetch();
                  }
                }}
                data={filteredPeople}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <ContactCard key={item.id} person={item} onPress={this.onPress(item)} />}
              />
            </View>
          )
        }}
      </Query>
    );

  }
};

export default withApollo(People);