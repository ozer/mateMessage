import React, { memo, useState, useCallback } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Text,
    KeyboardAvoidingView,
    SafeAreaView
} from 'react-native';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import { SendMessage } from '../../mutations/Message';

const ConversationInput = ({ conversationId }) => {

    const [content, changeText] = useState('');

    const [
        sendMessage,
        { loading: mutationLoading, error: mutationError },
    ] = useMutation(SendMessage, { variables: { content, conversationId } });


    const onPressSend = useCallback(
        () => {
            changeText('');
            sendMessage();
        },
        [content, changeText],
    );

    return (
        <View style={{ ...styles.footer }}>
            <TouchableOpacity>
                {/* <MaterialIcon
                    style={{ ...styles.send, color: 'blue' }}
                    name="add"
                    size={20}
                /> */}
            </TouchableOpacity>
            <TextInput
                keyboardAppearance="dark"
                multiline
                returnKeyType="next"
                value={content}
                onChangeText={changeText}
                style={styles.input}
            />
            <TouchableOpacity
                disabled={!content}
                onPress={onPressSend}
            >
                <Text>
                    Send
            </Text>
                {/* <MaterialIcon
                    style={{ ...styles.send, color: 'blue' }}
                    name="send"
                    size={20}
                /> */}
            </TouchableOpacity>
        </View>
    )
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