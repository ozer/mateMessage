import React, { memo, useState, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text
} from "react-native";
import { encode as btoa } from "base-64";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { SendMessage } from "../../mutations/Message";

const ConversationInput = ({ conversationId }) => {
  const [content, changeText] = useState("");

  const [
    sendMessage,
    { loading: mutationLoading, error: mutationError }
  ] = useMutation(SendMessage, {
    variables: { content, conversationId },
    onError: err => {
      console.log("SendMessage Mutation Error: [", err, "]");
    },
    optimisticResponse: {
      sendMessage: {
        __typename: "Message",
        id: new Date().getTime().toString(),
        messageId: new Date().getTime().toString(),
        senderId: "5debbf8682140b15dfa46d15",
        conversationId,
        content,
        isOptimistic: true
      }
    },
    update: (cache, { data }) => {
      const isOptimistic = data.sendMessage.isOptimistic;
      const encodedConversationId = btoa(`Conversation:${conversationId}`);
      console.log("isOptimistic -> ", isOptimistic);
      console.log("update!!", data);
      const convo = cache.readFragment({
        id: encodedConversationId,
        fragment: gql`
          fragment ConversationInputConversation on Conversation {
            id
            conversationId
            messages {
              edges {
                node {
                  __typename
                  id
                  messageId
                  senderId
                  conversationId
                  content
                  onFlight @client
                }
              }
            }
          }
        `
      });

      const newMessage = {
        node: {
          id: data.sendMessage.id,
          __typename: "Message",
          messageId: data.sendMessage.messageId,
          senderId: data.sendMessage.senderId,
          conversationId,
          content: data.sendMessage.content,
          onFlight: !!isOptimistic
        },
        __typename: "MessageEdge"
      };

      convo.messages.edges.push(newMessage);

      return cache.writeFragment({
        id: encodedConversationId,
        fragment: gql`
          fragment ConversationInputConversation on Conversation {
            id
            conversationId
            messages {
              edges {
                node {
                  __typename
                  id
                  messageId
                  senderId
                  conversationId
                  content
                  onFlight @client
                }
              }
            }
          }
        `,
        data: convo
      });
    }
  });

  const onPressSend = useCallback(() => {
    changeText("");
    return sendMessage({ content, conversationId });
  }, [content, conversationId, changeText]);

  return (
    <View style={{ ...styles.footer }}>
      <TextInput
        keyboardAppearance="dark"
        multiline
        returnKeyType="next"
        value={content}
        onChangeText={changeText}
        style={styles.input}
      />
      <TouchableOpacity disabled={!content} onPress={onPressSend}>
        <Text>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    backgroundColor: "#f1f1f4",
    paddingBottom: 20,
    borderStyle: "solid",
    borderTopWidth: 1,
    borderTopColor: "gray"
  },
  input: {
    marginVertical: 10,
    paddingVertical: 5,
    borderRadius: 10,
    fontSize: 18,
    paddingHorizontal: 18,
    flex: 1,
    lineHeight: 20,
    backgroundColor: "#ffffff"
  },
  send: {
    alignSelf: "center",
    color: "lightseagreen",
    fontWeight: "bold",
    padding: 16
  }
});

export default ConversationInput;
