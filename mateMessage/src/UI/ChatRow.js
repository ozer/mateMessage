import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { Avatar } from 'react-native-elements';
import { getInitials } from '../helpers/mates';

const ChatRow = ({ onPress, chat, lastM }) => {

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
                title={'OC'}
            />
            <View
                style={{
                    marginLeft: 8,
                    marginRight: 8,
                    justifyContent: 'center',
                    flexDirection: 'column'
                }}
            >
                {/* <Text style={{ fontSize: 14, fontWeight: 'bold' }}>
                {otherRecipient ? otherRecipient.name : ''}
            </Text> */}
                <Text numberOfLines={1} style={{ fontSize: 12 }}>
                    {lastM}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export default ChatRow;