import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, FlatList, Keyboard, Text, View } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { encode as btoa } from 'base-64';
import get from 'lodash.get';
import { MessageRow } from '../../UI';
import ConversationInput from '../containers/ConversationInput';

const Conversation = ({ conversationId, componentId }) => {
  console.log('conversationNodeId: ', btoa(`Conversation:${conversationId}`));

  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const keyboardWillShow = event => {
    Animated.parallel([
      Animated.timing(keyboardHeight, {
        duration: event.duration,
        toValue: event.endCoordinates.height
      })
    ]).start();
  };
  const keyboardWillHide = event => {
    console.log('keyboardWillHide');
    Animated.parallel([
      Animated.timing(keyboardHeight, {
        duration: event.duration,
        toValue: 0
      })
    ]).start();
  };
  useEffect(() => {
    const keyboardWillShowEventListener = Keyboard.addListener(
      'keyboardWillShow',
      keyboardWillShow
    );
    const keyboardWillHideEventListener = Keyboard.addListener(
      'keyboardWillHide',
      keyboardWillHide
    );

    return () => {
      keyboardWillShowEventListener.remove();
      keyboardWillHideEventListener.remove();
    };
  }, [keyboardWillShow, keyboardWillHide, componentId]);

  const {
    data: { viewer }
  } = useQuery(
    gql`
      query Conversation_Viewer {
        viewer {
          id
          userId
        }
      }
    `,
    { fetchPolicy: 'cache-first', returnPartialData: true }
  );

  const {
    data: { node },
    loading,
    fetchMore
  } = useQuery(
    gql`
      query Conversation_Conversation(
        $id: ID!
        $messagesFirst: Int
        $messageCursor: Cursor
      ) {
        node(id: $id) {
          id
          __typename
          ...Convo
        }
      }

      ${ConversationFragments.paginatedConversation}
    `,
    {
      fetchPolicy: 'cache-and-network',
      returnPartialData: true,
      variables: {
        id: btoa(`Conversation:${conversationId}`),
        messagesFirst: 20
      }
    }
  );

  const userId = get(viewer, 'userId');
  const recipients = get(node, 'recipients') || [];
  const pageInfo = get(node, 'messages.pageInfo') || {};
  const messageEdges = get(node, 'messages.edges') || [];

  useEffect(() => {
    if (recipients.length === 2) {
      const other = recipients.find(recipient => recipient.userId !== userId);
      Navigation.mergeOptions(componentId, {
        topBar: {
          title: {
            text: other.name
          }
        }
      });
    }
  }, [conversationId, componentId, recipients, userId]);

  const EmptyList = () => (
    <View>
      <Text> Say Hi!</Text>
    </View>
  );

  const renderItem = useCallback(
    ({ item: { node } }) => {
      return (
        <MessageRow
          content={node.content}
          onFlight={node.onFlight}
          self={node.senderId === userId}
          created_at={node.created_at}
        />
      );
    },
    [userId]
  );

  if (!messageEdges.length && loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: '#ffffff',
        paddingBottom: keyboardHeight
      }}
    >
      <FlatList
        initialNumToRender={10}
        ListEmptyComponent={EmptyList}
        keyExtractor={item => item.node.messageId}
        data={messageEdges}
        automaticallyAdjustContentInsets
        renderItem={renderItem}
        onEndReachedThreshold={0}
        onEndReached={async () => {
          const lastMessage = messageEdges[messageEdges.length - 1];
          if (pageInfo.hasNextPage) {
            const lastMessageCursor = lastMessage.cursor;
            await fetchMore({
              variables: {
                messageCursor: lastMessageCursor,
                first: 20
              },
              updateQuery: (previousResult, { fetchMoreResult }) => {
                const fetchMoreResult_node = fetchMoreResult.node;

                return fetchMoreResult_node.messages.edges.length
                  ? {
                      node: {
                        ...fetchMoreResult_node,
                        messages: {
                          ...fetchMoreResult_node.messages,
                          edges: [
                            ...previousResult.node.messages.edges,
                            ...fetchMoreResult.node.messages.edges
                          ]
                        }
                      }
                    }
                  : previousResult;
              }
            });
          }
        }}
        inverted
      />
      <ConversationInput conversationId={conversationId} />
    </Animated.View>
  );
};

export const ConversationFragments = {
  paginatedConversation: gql`
    fragment Convo on Conversation {
      __typename
      id
      conversationId
      title
      recipients {
        id
        userId
        name
      }
      messages(first: $messagesFirst, order: -1, before: $messageCursor)
        @connection(key: "messages") {
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        edges {
          __typename
          cursor
          node {
            id
            messageId
            conversationId
            senderId
            content
            created_at
            onFlight @client
            __typename
          }
        }
      }
    }
  `,
  conversation: gql`
    fragment Convo on Conversation {
      __typename
      id
      conversationId
      title
      recipients {
        id
        userId
        name
      }
      messages(first: 20, order: -1) @connection(key: "messages") {
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        edges {
          __typename
          cursor
          node {
            id
            messageId
            conversationId
            senderId
            content
            created_at
            onFlight @client
            __typename
          }
        }
      }
    }
  `
};

export default Conversation;
