import React, { memo, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  SafeAreaView
} from 'react-native';
import { Mutation } from 'react-apollo';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { SendMessage } from '../../mutations/Message';
import { ConversationsQuery } from '../../queries/Feed';

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

const ConversationInput = props => {
  // React-Hooks will be used in RN 0.59 version.
  // const [messageText, setMessageText] = useState('');
  // const handleMessageChange = value => setMessageText(value);

  const { onChangeText, messageText, conversationId, otherRecipient, personId } = props;

  const [mText, changeText] = useState('');

  // console.log('otherRecipient -> ', otherRecipient);

  return (
    <Mutation
      onError={err =>
        console.log('err at send message ', err.graphQLErrors, err.networkError)
      }
      mutation={SendMessage}
      variables={{ content: mText, conversationId }}
      // optimisticResponse={{
      //   __typename: 'Mutation',
      //   sendMessage: {
      //     __typename: 'SendMessageResponse',
      //     state: true,
      //     messageData: {
      //       id: 'randomid',
      //       content: messageText,
      //       loading: true,
      //       __typename: 'MessageType',
      //       conversation: {
      //         id: conversationId,
      //         __typename: 'ConversationType'
      //       },
      //       sender: {
      //         id: personId,
      //         __typename: 'UserType'
      //       }
      //     },
      //   },
      // }}
    >
      {sendMessage => (
        <View style={{ ...styles.footer }}>
          <TouchableOpacity>
            <MaterialIcon
              style={{ ...styles.send, color: 'blue' }}
              name="add"
              size={20}
            />
          </TouchableOpacity>
          <TextInput
            keyboardAppearance="dark"
            multiline
            returnKeyType="next"
            value={mText}
            onChangeText={changeText}
            style={styles.input}
          />
          <TouchableOpacity
            disabled={!mText}
            onPress={() => {
              changeText('');
              sendMessage({
                variables: {
                  content: mText,
                  conversationId
                }
              });
            }}
          >
            <MaterialIcon
              style={{ ...styles.send, color: 'blue' }}
              name="send"
              size={20}
            />
          </TouchableOpacity>
        </View>
      )}
    </Mutation>
  );
};

export default memo(ConversationInput);
