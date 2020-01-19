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

    Navigation.mergeOptions(componentId, {
      topBar: {
        title: {
          text: 'otherRecipient'
        }
      }
    });

    return () => {
      keyboardWillShowEventListener.remove();
      keyboardWillHideEventListener.remove();
    };
  }, [keyboardWillShow, keyboardWillHide, componentId]);

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
      }
    }
  );

  const userId = get(viewer, 'userId');

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
        data={messageEdges}
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
