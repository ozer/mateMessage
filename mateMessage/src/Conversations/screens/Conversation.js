import React, { useEffect, useMemo, useRef, useState } from "react";
import { useApolloClient, useQuery } from "@apollo/react-hooks";
import { Animated, FlatList, Keyboard, Text, View } from "react-native";
import { Feed } from "../../queries/Feed";
import { MessageRow } from "../../UI";
import ConversationInput from "../containers/ConversationInput";
import gql from "graphql-tag";

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

  // const client = useApolloClient();
  const { data } = useQuery(Feed, { fetchPolicy: "cache-and-network" });
  const conversation = data.feed.find(c => c.id === conversationId);

  // const conversation = client.readFragment({
  //   fragment: gql`
  //     fragment FeedFragment on Conversation {
  //       id
  //       messages {
  //         id
  //         content
  //         onFlight @client
  //       }
  //       recipients {
  //         id
  //         name
  //         email
  //       }
  //     }
  //   `,
  //   id: conversationId
  // });

  const EmptyList = () => (
    <View>
      <Text> Say Hi!</Text>
    </View>
  );

  const renderItem = ({ item: message }) => {
    if (message.onFlight) {
      console.log("onFlight!");
    }
    return <MessageRow content={message.content} onFlight={message.onFlight} />;
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
        data={conversation.messages}
        renderItem={renderItem}
      />
      <ConversationInput conversationId={conversationId} />
    </Animated.View>
  );
};

export default Conversation;
