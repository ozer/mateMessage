import React, { useEffect, useCallback, useRef } from "react";
import { View, Text, Button, FlatList, ScrollView } from "react-native";
import {
  useQuery,
  useSubscription,
  useApolloClient
} from "@apollo/react-hooks";
import { Feed } from "../../queries/Feed";
import { MessageCreated } from "../../subscriptions/Message";
import { ChatRow } from "../../UI";
import { Navigation } from "react-native-navigation";
import gql from "graphql-tag";

const ConversationList = ({ componentId }) => {
  const goToConversation = useCallback(
    convo => {
      return Navigation.push(componentId, {
        component: {
          name: "Conversation",
          id: "Conversation",
          passProps: {
            conversationId: convo.id,
            componentId: componentId
          },
          options: {
            bottomTabs: {
              visible: false
            }
          }
        }
      });
    },
    [componentId]
  );

  const { loading, error, data: conversations } = useQuery(Feed);

  useSubscription(MessageCreated, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      console.log("we got a message!", subscriptionData);
      if (!subscriptionData.data) {
        return;
      }
      const { messageCreated } = subscriptionData.data;
      const convoId = messageCreated.conversation.id;
      const convo = client.readFragment({
        fragment: gql`
          fragment FeedFragment on Conversation {
            id
            messages {
              id
              content
              onFlight @client
            }
            recipients {
              id
              name
              email
            }
          }
        `,
        id: convoId
      });

      convo.messages.push({
        __typename: "Message",
        content: messageCreated.content,
        id: messageCreated.id,
        onFlight: false
      });

      return client.writeFragment({
        id: convoId,
        fragment: gql`
          fragment FeedFragment on Conversation {
            id
            messages {
              id
              content
              onFlight @client
            }
            recipients {
              id
              name
              email
            }
          }
        `,
        data: {
          ...convo
        }
      });
    }
  });

  if (loading) {
    return (
      <View>
        <Text>Loading!</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>Error Occurred</Text>
      </View>
    );
  }

  const renderItem = ({ item: chat }) => {
    let lastM = "";
    if (!chat.messages.length) {
      lastM = "Say Hi!";
    } else {
      const { length } = chat.messages;
      lastM = chat.messages[length - 1].content;
    }

    return <ChatRow onPress={goToConversation} chat={chat} lastM={lastM} />;
  };
  return (
    <View style={{ flex: 1 }}>
      <Text>{"Conversation List"}</Text>
      <FlatList
        data={conversations.feed}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

ConversationList.options = () => ({
  topBar: {
    searchBarHiddenWhenScrolling: true
  }
});

export default ConversationList;
