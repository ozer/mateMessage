import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { Avatar } from 'react-native-elements';
import { getInitials } from '../../helpers/mates';

const ChatContactCard = props => {
  const { onPress, lastMessage, otherRecipient } = props;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 8,
        paddingRight: 8
      }}
    >
      <Avatar
        rounded
        size="medium"
        title={getInitials(otherRecipient)}
        source={
          otherRecipient && otherRecipient.avatarUrl
            ? { uri: otherRecipient.avatarUrl }
            : null
        }
      />
      <View
        style={{
          marginLeft: 8,
          marginRight: 8,
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>
          {otherRecipient ? otherRecipient.name : ''}
        </Text>
        {lastMessage ? (
          <Text numberOfLines={1} style={{ fontSize: 12 }}>
            {lastMessage}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default ChatContactCard;
