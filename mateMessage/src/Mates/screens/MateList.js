import React, { useCallback } from 'react';
import { View, Text, FlatList, ActionSheetIOS } from 'react-native';
import {
  ActionSheetProvider,
  useActionSheet
} from '@expo/react-native-action-sheet';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { Navigation } from 'react-native-navigation';
import { ThemeProvider } from 'emotion-theming';
import get from 'lodash.get';
import { theme } from '../../theme/theme';
import MateRow from '../../UI/MateRow';
import { CreateConversation } from '../../mutations/Message';
import { ConversationListQuery } from '../../Conversations/screens/ConversationList';
import { navigateToConversation } from '../../Conversations/navHelper';

const ZeroStateMateList = () => {
  return (
    <View
      style={{ flex: 1, justifyContent: 'center', flexDirection: 'column' }}
    >
      <Text style={{ fontSize: 28, color: 'black' }}>Invite your mates!</Text>
    </View>
  );
};

const MateList = ({ componentId }) => {
  const { showActionSheetWithOptions } = useActionSheet();

  const [
    createConversation,
    { loading: createConversationLoading }
  ] = useMutation(CreateConversation, {
    update: async (cache, { data: { createConversation } }) => {
      console.log('createConversation -> ', createConversation);
      if (createConversation) {
        const { conversationId } = createConversation;
        const data = cache.readQuery({
          query: ConversationListQuery
        });
        const { viewer } = data;
        const convos = viewer.feed;
        if (
          convos.edges.findIndex(
            item =>
              item.node.conversationId !== conversationId
          ) < 0
        ) {
          convos.edges.push({
            node: createConversation,
            __typename: 'ConversationEdge'
          });
          cache.writeQuery({
            query: ConversationListQuery,
            data: {
              viewer: {
                ...viewer,
                feed: convos
              }
            }
          });
        }

        await navigateToConversation({ componentId, conversationId });
      }
    }
  });

  const {
    data: { viewer },
    refetch
  } = useQuery(MateListQuery);

  const edges = get(viewer, 'mates.edges') || [];

  const onPress = useCallback(
    mate => {
      console.log('onPress', mate);
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Send Message', 'Close'],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1
        },
        async buttonIndex => {
          if (!buttonIndex) {
            await createConversation({ variables: { recipientId: mate } });
          }
        }
      );
    },
    [showActionSheetWithOptions]
  );

  const onLongPress = async mate => {
    await Navigation.showOverlay({
      component: {
        id: 'MatePreview',
        name: 'MatePreview',
        options: {
          overlay: {
            interceptTouchOutside: true
          }
        },
        passProps: {
          userId: mate
        }
      }
    });
  };

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <ActionSheetProvider>
      <ThemeProvider theme={theme}>
        <View style={{ flex: 1 }}>
          <FlatList
            refreshing={false}
            ListEmptyComponent={ZeroStateMateList}
            onRefresh={onRefresh}
            data={edges}
            keyExtractor={item => item.node.userId}
            renderItem={({ item: { node } }) => (
              <MateRow
                id={node.userId}
                name={node.name}
                onContactPress={onPress}
                onContactLongPress={onLongPress}
              />
            )}
          />
        </View>
      </ThemeProvider>
    </ActionSheetProvider>
  );
};

const MateListQuery = gql`
  query Viewer {
    viewer {
      id
      mates {
        edges {
          node {
            id
            userId
            name
            email
          }
        }
      }
    }
  }
`;

export default MateList;
