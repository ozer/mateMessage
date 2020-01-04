import React, { useEffect, useCallback, useRef } from "react";
import { View, Text, Button, FlatList, ScrollView } from "react-native";
import { useQuery, useSubscription } from "@apollo/react-hooks";
import { Navigation } from "react-native-navigation";
import gql from "graphql-tag";
import get from "lodash.get";
import { encode as btoa } from "base-64";
import { MessageCreated } from "../../subscriptions/Message";
import { ChatRow } from "../../UI";
import {
  getChatSubtitle,
  getChatTitleByRecipients
} from "../../helpers/convos";

const ConversationList = ({ componentId }) => {
  const goToConversation = useCallback(
    conversationId => {
      return Navigation.push(componentId, {
        component: {
          name: "Conversation",
          id: "Conversation",
          passProps: {
            conversationId: conversationId,
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

  const {
    loading,
    error,
    data: { viewer }
  } = useQuery(ConversationListQuery);
  const feedEdges = get(viewer, "feed.edges");

  useSubscription(MessageCreated, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      console.log("subscriptionData", subscriptionData);
      if (!subscriptionData.data) {
        return;
      }
      const { messageCreated } = subscriptionData.data;
      const convoId = messageCreated.conversationId;
      const encodedConversationId = btoa(`Conversation:${convoId}`);
      const convo = client.readFragment({
        fragment: gql`
          fragment ConversationListConversation on Conversation {
            id
            conversationId
            messages {
              edges {
                node {
                  id
                  messageId
                  senderId
                  conversationId
                  content
                  onFlight @client
                  __typename
                }
              }
            }
          }
        `,
        id: encodedConversationId
      });

      const newMessageNode = {
        __typename: "Message",
        id: messageCreated.id,
        messageId: messageCreated.messageId,
        senderId: messageCreated.senderId,
        conversationId: convoId,
        content: messageCreated.content,
        onFlight: false
      };

      convo.messages.edges.push({
        node: newMessageNode,
        __typename: "MessageEdge"
      });

      return client.writeFragment({
        id: encodedConversationId,
        fragment: gql`
          fragment ConversationListConversation on Conversation {
            id
            conversationId
            messages {
              edges {
                node {
                  id
                  messageId
                  senderId
                  conversationId
                  content
                  onFlight @client
                  __typename
                }
              }
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

  const renderItem = ({ item: { node } }) => {
    const conversationId = get(node, "conversationId") || "";
    const title = get(node, "title") || "";
    const recipients = get(node, "recipients") || [];
    const messages = get(node, "messages") || [];

    return (
      <ChatRow
        onPress={goToConversation}
        conversationId={conversationId}
        title={title || getChatTitleByRecipients(recipients)}
        subtitle={getChatSubtitle(messages)}
      />
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={feedEdges}
        keyExtractor={item => item.node.conversationId}
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

const ConversationListQuery = gql`
  query ConversationListQuery {
    viewer {
      id
      feed {
        edges {
          node {
            id
            conversationId
            title
            recipients {
              id
              name
            }
            messages {
              edges {
                node {
                  id
                  content
                  senderId
                  conversationId
                  messageId
                  onFlight @client
                  __typename
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default ConversationList;
