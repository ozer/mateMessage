import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text
} from 'react-native';
import { encode as btoa } from 'base-64';
import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import get from 'lodash.get';
import { SendMessage } from '../../mutations/Message';
import { Viewer } from '../../queries/Viewer';

const ConversationInput = ({ conversationId }) => {
  const [content, changeText] = useState('');

  // read userId from the cache.
  const {
    data: { viewer }
  } = useQuery(Viewer, { fetchPolicy: 'cache-only' });
  const userId = get(viewer, 'userId') || '';

  const [sendMessage] = useMutation(SendMessage, {
    variables: { content, conversationId },
    onError: err => {
      console.log('SendMessage Mutation Error: [', err, ']');
    },
    optimisticResponse: {
      sendMessage: {
        __typename: 'Message',
        id: new Date().getTime().toString(),
        messageId: new Date().getTime().toString(),
        senderId: userId,
        conversationId,
        content,
        isOptimistic: true
      }
    },
    update: (cache, { data }) => {
      const isOptimistic = data.sendMessage.isOptimistic;
      const encodedConversationId = btoa(`Conversation:${conversationId}`);
      const convo = cache.readFragment({
        id: encodedConversationId,
        fragment: gql`
          fragment ConversationInputConversation on Conversation {
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
          __typename: 'Message',
          messageId: data.sendMessage.messageId,
          senderId: data.sendMessage.senderId,
          conversationId,
          content: data.sendMessage.content,
          onFlight: !!isOptimistic
        },
        __typename: 'MessageEdge'
      };

      convo.messages.edges.unshift(newMessage);

      return cache.writeFragment({
        id: encodedConversationId,
        fragment: gql`
          fragment ConversationInputConversation on Conversation {
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
    changeText('');
    return sendMessage();
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
    flexDirection: 'row',
    backgroundColor: '#f1f1f4',
    paddingBottom: 20,
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: 'gray'
  },
  input: {
    marginVertical: 10,
    paddingVertical: 5,
    borderRadius: 10,
    fontSize: 18,
    paddingHorizontal: 18,
    flex: 1,
    lineHeight: 20,
    backgroundColor: '#ffffff'
  },
  send: {
    alignSelf: 'center',
    color: 'lightseagreen',
    fontWeight: 'bold',
    padding: 16
  }
});

export default ConversationInput;
