import React, { memo, useState, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text
} from "react-native";
import { useMutation } from "@apollo/react-hooks";
import { SendMessage } from "../../mutations/Message";
import { FeedFragment } from "../../fragments/Feed";

const ConversationInput = ({ conversationId }) => {
  const [content, changeText] = useState("");

  const [
    sendMessage,
    { loading: mutationLoading, error: mutationError }
  ] = useMutation(SendMessage, {
    variables: { content, conversationId },
	  onError: (err) => {
    	console.log('SendMessage Mutation Error: [', err, ']');
	  },
    optimisticResponse: {
      sendMessage: {
        __typename: "Message",
        content: content,
        id: Math.random().toString(),
        isOptimistic: true
      }
    },
    update: (cache, { data }) => {
      console.log("update!!", data);
      const convo = cache.readFragment({
        id: conversationId,
        fragment: FeedFragment
      });
      const isOptimistic = data.sendMessage.isOptimistic;
      console.log("isOptimistic -> ", isOptimistic);
      convo.messages.push({
        __typename: "Message",
        id: data.sendMessage.id,
        content: data.sendMessage.content,
        onFlight: !!isOptimistic
      });
      return cache.writeFragment({
        id: conversationId,
        fragment: FeedFragment,
        data: {
          ...convo
        }
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
