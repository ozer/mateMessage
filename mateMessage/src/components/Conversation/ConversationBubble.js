import React, { memo } from 'react';
import { View, Text } from 'react-native';

const ConversationBubble = props => {
  const { message, me } = props;
  const { content, sender, loading } = message;
  if (me && me.id && sender && sender.id) {
    return (
      <View
        style={{
          justifyContent: me.id === sender.id ? 'flex-end' : 'flex-start',
          flexDirection: 'row',
          marginVertical: 5,
          marginHorizontal: 10
        }}
      >
        {loading ? (
          <View>
            <Text>Loading</Text>
          </View>
        ) : null}
        <View
          style={{
            backgroundColor: me.id === sender.id ? '#00BFA5' : 'white',
            borderStyle: 'solid',
            borderRadius: 20,
            paddingVertical: 3,
            paddingHorizontal: 3
          }}
        >
          <Text style={{ paddingHorizontal: 12, textAlign: 'left' }}>
            {content}
          </Text>
        </View>
      </View>
    );
  }
  return null;
};

export default memo(ConversationBubble);
