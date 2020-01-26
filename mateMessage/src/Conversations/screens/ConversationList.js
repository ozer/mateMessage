import React, { useCallback } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import get from 'lodash.get';
import { encode as btoa } from 'base-64';
import { useNetInfo } from '@react-native-community/netinfo';
import {
  ConversationCreated,
  MessageCreated
} from '../../subscriptions/Message';
import { ChatRow, StyledView, StyledText } from '../../UI';
import {
  getChatSubtitle,
  getChatTitleByRecipients
} from '../../helpers/convos';
import { ConversationFragments } from './Conversation';
import { navigateToConversation } from '../navHelper';
import NetworkStatusBar from '../../UI/NetworkStatusBar';
import { theme } from '../../theme/theme';
import { ThemeProvider } from 'emotion-theming';

const ConversationListZeroStateComponent = () => {
  return (
    <StyledView>
      <StyledText>Send Message To Mates!</StyledText>
    </StyledView>
  );
};

const ConversationList = ({ componentId }) => {
  const { isInternetReachable, isConnected } = useNetInfo();

  const goToConversation = useCallback(
    conversationId => {
      return navigateToConversation({ componentId, conversationId });
    },
    [componentId]
  );

  const {
    loading,
    data: { viewer },
    fetchMore
  } = useQuery(ConversationListQuery, {
    returnPartialData: true,
    variables: {
      first: 20,
      order: -1,
      messagesFirst: 10
    },
    onError: e => {
      console.log('error: ', e);
    }
  });
  const feedEdges = get(viewer, 'feed.edges');
  const pageInfo = get(viewer, 'feed.pageInfo');

  useSubscription(MessageCreated, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      console.log('subscriptionData[messageCreated]: ', subscriptionData);
      if (!subscriptionData.data || !subscriptionData.data.messageCreated) {
        return;
      }
      const { messageCreated } = subscriptionData.data;
      const convoId = messageCreated.conversationId;
      const encodedConversationId = btoa(`Conversation:${convoId}`);
      const convo = client.readFragment({
        fragment: ConversationFragments.conversation,
        id: encodedConversationId
      });
      console.log('existing convo', convo);

      if (
        convo.messages &&
        convo.messages.edges &&
        convo.messages.edges.length
      ) {
        const newMessageNode = {
          __typename: 'Message',
          id: messageCreated.id,
          messageId: messageCreated.messageId,
          senderId: messageCreated.senderId,
          conversationId: convoId,
          content: messageCreated.content,
          created_at: messageCreated.created_at,
          onFlight: false
        };

        convo.messages.edges.unshift({
          node: newMessageNode,
          __typename: 'MessageEdge'
        });
        console.log('newMessageNode', newMessageNode);

        return client.writeFragment({
          id: encodedConversationId,
          fragment: ConversationFragments.conversation,
          data: {
            ...convo
          }
        });
      }
    }
  });

  useSubscription(ConversationCreated, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      if (
        !subscriptionData.data ||
        !subscriptionData.data.conversationCreated
      ) {
        return;
      }
      console.log(
        'subscriptionData[conversationCreated]: ',
        subscriptionData.data.conversationCreated.messages
      );
      const { conversationCreated } = subscriptionData.data;
      const data = client.readQuery({ query: ConversationListQuery });
      const { viewer } = data;
      const { feed } = viewer;
      feed.edges.push({
        node: conversationCreated,
        __typename: 'ConversationEdge'
      });
      client.writeQuery({
        query: ConversationListQuery,
        data: {
          viewer: {
            ...viewer,
            feed
          }
        }
      });
    }
  });

  const renderItem = ({ item: { node } }) => {
    const conversationId = get(node, 'conversationId') || '';
    const title = get(node, 'title') || '';
    const recipients = get(node, 'recipients') || [];
    const messages = get(node, 'messages') || [];

    return (
      <ChatRow
        onPress={goToConversation}
        conversationId={conversationId}
        title={title || getChatTitleByRecipients(recipients)}
        subtitle={getChatSubtitle(messages)}
      />
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <NetworkStatusBar visible={!isInternetReachable || !isConnected} />
      <View style={{ flex: 1 }}>
        <FlatList
          ListEmptyComponent={ConversationListZeroStateComponent}
          data={feedEdges}
          keyExtractor={item => item.node.conversationId}
          renderItem={renderItem}
          refreshing={false}
          onEndReachedThreshold={0}
          onEndReached={async () => {
            console.log('pageInfo: ', pageInfo);
            if (pageInfo.hasNextPage) {
              const lastConvoCursor = feedEdges[feedEdges.length - 1].cursor;
              console.log(
                '[onEndReached from ConversationList]: lastConvoCursor: ',
                lastConvoCursor
              );
              await fetchMore({
                variables: {
                  first: 20,
                  order: -1,
                  cursor: lastConvoCursor,
                  messagesFirst: 10
                },
                updateQuery: (previousResult, { fetchMoreResult }) => {
                  const fetchMoreResult_viewer = fetchMoreResult.viewer;

                  return fetchMoreResult_viewer.feed.edges.length
                    ? {
                        viewer: {
                          ...fetchMoreResult_viewer,
                          feed: {
                            ...fetchMoreResult_viewer.feed,
                            edges: [
                              ...previousResult.viewer.feed.edges,
                              ...fetchMoreResult_viewer.feed.edges
                            ]
                          }
                        }
                      }
                    : previousResult;
                }
              });
            }
          }}
        />
      </View>
    </ThemeProvider>
  );
};

ConversationList.options = () => ({
  topBar: {
    searchBarHiddenWhenScrolling: true
  }
});

const ConversationListFragments = {
  conversationConnection: gql`
    fragment ConversationList_ConversationConnection on ConversationConnection {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          __typename
          ...Convo
        }
      }
    }

    ${ConversationFragments.paginatedConversation}
  `
};

export const ConversationListQuery = gql`
  query ConversationListQuery(
    $first: Int
    $order: Int
    $cursor: Cursor
    $messagesFirst: Int
    $messageCursor: Cursor
  ) {
    viewer {
      id
      feed(first: $first, before: $cursor, order: $order) {
        ...ConversationList_ConversationConnection
      }
    }
  }

  ${ConversationListFragments.conversationConnection}
`;

export default ConversationList;
