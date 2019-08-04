import React from 'react';
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
  //
  // const handleMessageChange = value => setMessageText(value);

  const { onChangeText, messageText, conversationId, otherRecipient, personId } = props;

  // console.log('otherRecipient -> ', otherRecipient);

  return (
    <Mutation
      onError={err =>
        console.log('err at send message ', err.graphQLErrors, err.networkError)
      }
      mutation={SendMessage}
      variables={{ content: messageText, conversationId }}
      optimisticResponse={{
         __typename: 'Mutation',
        sendMessage: {
           __typename: 'SendMessageResponse',
          state: true,
          messageData: {
            id: 'randomid',
            content: messageText,
            loading: true,
            __typename: 'MessageType',
            conversation: {
              id: conversationId,
              __typename: 'ConversationType'
            },
            sender: {
              id: personId,
              __typename: 'UserType'
            }
          },
        },
      }}
      update={async (cache, { data: { sendMessage } }) => {
        console.log('sendMessage response -> ', sendMessage);
        if (sendMessage.state && sendMessage.messageData) {
          const { messageData } = sendMessage;
          const feed = cache.readQuery({ query: ConversationsQuery });
          const { conversation, content, sender, loading } = messageData;
          const conversationIndex = feed.feed.findIndex(
            obj => obj.id === conversation.id
          );
          const foundConversation = feed.feed[conversationIndex];
          console.log('foundConvo -> ', foundConversation);
          const foundLoadingMessage = foundConversation.messages.find(msg => typeof msg.loading === 'boolean');
          console.log('foundLoadingMessage -> ', foundLoadingMessage);
          foundConversation.messages.push({
            id: messageData.id,
            content,
            sender,
            loading: !!loading,
            __typename: 'MessageType'
          });
          cache.writeQuery({ query: ConversationsQuery, data: feed });
        }
      }}
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
            value={messageText}
            onChangeText={onChangeText}
            style={styles.input}
          />
          <TouchableOpacity
            disabled={!messageText}
            onPress={() => {
              onChangeText('');
              sendMessage({
                variables: {
                  content: messageText,
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

export default ConversationInput;
