import React, { useEffect, useCallback } from 'react';
import { View, Text, Button, FlatList, ScrollView } from 'react-native';
import { useQuery, useSubscription, useApolloClient } from '@apollo/react-hooks';
import { Feed } from '../../queries/Feed';
import { MessageCreated } from '../../subscriptions/Message';
import { ChatRow } from '../../UI';

const ConversationList = () => {

    useSubscription(MessageCreated, {
        onSubscriptionData: ({ client, subscriptionData }) => {
            console.log('we got an incoming message', subscriptionData);
            if (!subscriptionData.data) {
                return;
            }
            const { messageCreated } = subscriptionData.data;
            const convoId = messageCreated.conversation.id;
            console.log('convoId -> ', messageCreated);
            const cachedConvos = client.readQuery({
                query: Feed,
            });
            const convoIndex = cachedConvos.feed.findIndex((c) => c.id === convoId);
            if (convoIndex > -1) {
                const convo = cachedConvos.feed[convoIndex];
                console.log('convo -> ', convo);
                convo.messages.push({
                    __typename: 'Message',
                    content: messageCreated.content,
                    id: messageCreated.id,
                });
                cachedConvos.feed.splice(convoIndex, 1);
                return client.writeQuery({ query: Feed, data: { feed: [convo, ...cachedConvos.feed] } });
            }
            return client.writeQuery({
                query: Feed, data: {
                    feed: [
                        {
                            id: convoId,
                            messages: [{
                                __typename: 'Message',
                                content: messageCreated.content,
                                id: messageCreated.id,
                            }],
                            recipients: messageCreated.conversation.recipients,
                            __typename: 'Conversation'
                        },
                        ...cachedConvos.feed
                    ]
                }
            });
        },
    });

    const { loading, error, data: conversations } = useQuery(Feed);

    console.log('loading -> ', loading);

    const onPress = ({ item }) => { };

    if (loading) {
        return (
            <View>
                <Text>Loading!</Text>
            </View>
        );
    }

    if (error) {
        return
        (
            <View>
                <Text>Error Occurred</Text>
            </View>
        );
    }

    const renderItem = ({ item: chat }) => {
        let lastM = '';
        if (!chat.messages.length) {
            lastM = '';
        } else {
            const { length } = chat.messages;
            lastM = chat.messages[length - 1].content;
        }

        return (
            <ChatRow onPress={onPress} chat={chat} lastM={lastM} />
        )
    }

    console.log('render!');

    return (
        <View>
            <Text>{'Conversation List'}</Text>
            <FlatList
                data={conversations.feed}
                keyExtractor={item => item.id}
                renderItem={renderItem}
            />
        </View>
    );
};

export default ConversationList;