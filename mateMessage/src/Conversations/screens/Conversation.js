import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, FlatList, Keyboard, Text, View } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { useApolloClient, useQuery } from '@apollo/react-hooks';
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
    const otherRecipient = conversationFromCache.recipients
      .filter(recipient => recipient.id !== userId)
      .map(recipient => recipient.name)
      .join(',');

    Navigation.mergeOptions(componentId, {
      topBar: {
        title: {
          text: otherRecipient
        }
      }
    });

    return () => {
      keyboardWillShowEventListener.remove();
      keyboardWillHideEventListener.remove();
    };
  }, [
    keyboardWillShow,
    keyboardWillHide,
    conversationFromCache,
    componentId,
    userId
  ]);
  const apolloClient = useApolloClient();

  const {
    data: { viewer }
  } = useQuery(
    gql`
      query ConversationListQuery {
        viewer {
          id
          userId
        }
      }
    `,
    { fetchPolicy: 'cache-only', returnPartialData: true }
  );

  const conversationFromCache = apolloClient.readFragment({
    fragment: ConversationFragments.conversation,
    id: btoa(`Conversation:${conversationId}`)
  });

  const {
    data: { node },
    loading
  } = useQuery(
    gql`
      query Conversation($id: ID!) {
        node(id: $id) {
          id
          __typename
          ...Convo
        }
      }

      ${ConversationFragments.conversation}
    `,
    {
      variables: {
        id: btoa(`Conversation:${conversationId}`)
      },
    }
  );

  const userId = get(viewer, 'userId');

  const messageEdgesFromCache = get(conversationFromCache, 'messages.edges');
  const messageEdges = get(node, 'messages.edges') || [];

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
        />
      );
    },
    [userId]
  );

  if (!messageEdges.length && !messageEdgesFromCache.length && loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  console.log('conversation Render!', userId);

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
        data={messageEdges.length ? messageEdges : messageEdgesFromCache}
        renderItem={renderItem}
        onEndReached={() => console.log('reached to the end!')}
        inverted
      />
      <ConversationInput conversationId={conversationId} />
    </Animated.View>
  );
};

export const ConversationFragments = {
  conversation: gql`
    fragment Convo on Conversation {
      __typename
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
            conversationId
            senderId
            content
            onFlight @client
            __typename
          }
        }
      }
    }
  `
};

export default Conversation;
