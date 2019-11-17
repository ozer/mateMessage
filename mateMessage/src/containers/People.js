import React, { useState, useEffect } from "react";
import { Text, View, FlatList } from "react-native";
import { Query, withApollo } from "react-apollo";
import { ConversationsQuery, Users } from "../queries/Feed";
import ChatContactCard from "../components/Cards/ChatContactCard";
import { Navigation } from "react-native-navigation";
import ContactCard from "../components/Cards/ContactCard";
import { CreateConversation } from "../mutations/Message";

const ZeroStatePeopleList = () => (
  <View style={{ flex: 1, justifyContent: "center", flexDirection: "column" }}>
    <Text style={{ fontSize: 28, color: "black" }}>Invite your mates!</Text>
  </View>
);

class People extends React.Component {
  state = {
    searchText: "",
    isFocused: false
  };

  componentDidMount() {
    this.navigationEventListener = Navigation.events().bindComponent(this);
  }

  componentWillUnmount() {
    if (this.navigationEventListener) {
      this.navigationEventListener.remove();
    }
  }

  searchBarUpdated({ text, isFocused }) {
    try {
      this.setState({
        searchText: text,
        isFocused
      });
    } catch (e) {
      console.log("ERROR AT SEARCH BAR UPDATED", e);
    }
  }

  onPress = person => () => {
    try {
      console.log("Person touched! -> ", person);
      const { id } = person;
      const { props } = this;
      const { client } = props;
      client
        .mutate({ mutation: CreateConversation, variables: { receiverId: id } })
        .then(result => {
          console.log("CreateConvo -> ", result);
          if (result && result.data) {
            const { data } = result;
            if (data.createConversation) {
              const { createConversation } = data;
              if (
                createConversation.state &&
                createConversation.conversationData
              ) {
                const { conversationData } = createConversation;
                const conversations = client.readQuery({
                  query: ConversationsQuery
                });
                console.log("I have read the query -> ", conversations);
                const { feed } = conversations;
                const convIndex = feed.findIndex(
                  conv => conv.id === conversationData.id
                );
                if (convIndex < 0) {
                  feed.push(conversationData);
                  client.writeQuery({
                    query: ConversationsQuery,
                    data: conversations
                  });
                } else {
                  console.log("Conversation with this person already exists!");
                }
              }
            }
          }
        });
    } catch (e) {
      console.log("ERROR AT CREATE CONVO", e);
    }
  };

  filteredPeople = list => {
    if (list && list.length) {
      const { state } = this;
      const { searchText } = state;
      return list.filter(person =>
        person.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return [];
  };

  render() {
    const { state, filteredPeople } = this;
    const { searchText, isFocused } = state;
    return (
      <Query query={Users}>
        {({ loading, error, data, refetch }) => {
          if (loading) {
            return (
              <View>
                <Text>Loading...</Text>
              </View>
            );
          }
          if (error) {
            console.log("ERROR AT QUERY PEOPLE", error);
            return (
              <View>
                <Text>Something went wrong!</Text>
              </View>
            );
          }
          return (
            <View style={{ flex: 1, flexDirection: "column" }}>
              <FlatList
                refreshing={false}
                ListEmptyComponent={ZeroStatePeopleList}
                onRefresh={() => {
                  console.log("onRefresh!");
                  if (!isFocused) {
                    refetch();
                  }
                }}
                data={filteredPeople(data.people)}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <ContactCard
                    key={item.id}
                    person={item}
                    onPress={this.onPress(item)}
                  />
                )}
              />
            </View>
          );
        }}
      </Query>
    );
  }
}

export default withApollo(People);
