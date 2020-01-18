import { Navigation } from 'react-native-navigation';

export const navigateToConversation = async ({ componentId, conversationId }) => {
  return Navigation.push(componentId, {
    component: {
      name: 'Conversation',
      id: 'Conversation',
      passProps: {
        conversationId: conversationId,
      },
      options: {
        bottomTabs: {
          visible: false
        }
      }
    }
  });
};