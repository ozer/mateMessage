import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, FlatList, Keyboard, Text, View } from "react-native";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import get from "lodash.get";
import { MessageRow } from "../../UI";
import ConversationInput from "../containers/ConversationInput";

const Conversation = ({ componentId, conversationId }) => {
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const keyboardWillShow = event => {
    console.log("keyboardWillShow");
    Animated.parallel([
      Animated.timing(keyboardHeight, {
        duration: event.duration,
        toValue: event.endCoordinates.height
      })
    ]).start();
  };

  const keyboardWillHide = event => {
    console.log("keyboardWillHide");
    Animated.parallel([
      Animated.timing(keyboardHeight, {
        duration: event.duration,
        toValue: 0
      })
    ]).start();
  };

  useEffect(() => {
    const keyboardWillShowEventListener = Keyboard.addListener(
      "keyboardWillShow",
      keyboardWillShow
    );
    const keyboardWillHideEventListener = Keyboard.addListener(
      "keyboardWillHide",
      keyboardWillHide
    );

    return () => {
      keyboardWillShowEventListener.remove();
      keyboardWillHideEventListener.remove();
    };
  }, [keyboardWillShow, keyboardWillHide]);

  const {
    data: { viewer }
  } = useQuery(
    gql`
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
            }
          }
        }
      }
    `,
    { fetchPolicy: "cache-only" }
  );
  const feedEdges = get(viewer, "feed.edges") || [];
  const conversation = feedEdges.find(c => c.node.conversationId === conversationId);
  const messageEdges = get(conversation, "node.messages.edges");

  const EmptyList = () => (
    <View>
      <Text> Say Hi!</Text>
    </View>
  );

  const renderItem = ({ item: { node } }) => {
    if (node.onFlight) {
      console.log("onFlight!");
    }
    return <MessageRow content={node.content} onFlight={node.onFlight} />;
  };

  console.log("conversation Render!");

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
        paddingBottom: keyboardHeight
      }}
    >
      <FlatList
        ListEmptyComponent={EmptyList}
        keyExtractor={item => item.node.messageId}
        data={messageEdges}
        renderItem={renderItem}
      />
      <ConversationInput conversationId={conversationId} />
    </Animated.View>
  );
};

export default Conversation;
