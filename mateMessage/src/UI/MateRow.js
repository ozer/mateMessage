import React, {useCallback, useMemo} from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Avatar } from 'react-native-elements';
import {getInitials} from "../helpers/mates";
import StyledText from "./StyledText";

const MateRow = ({ id, name, avatarUrl, onContactPress, onContactLongPress }) => {

    const onPress = useCallback(() => {
        onContactPress(id);
    }, [id]);

    const onLongPress = useCallback(() => {
        onContactLongPress(id);
    }, [id]);

    const initials = useMemo(() => {
        return getInitials(name);
    }, [name]);

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
                flexDirection: 'row',
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 8,
                paddingRight: 8,
            }}
        >
            <Avatar
                rounded
                size="medium"
                title={initials}
                source={avatarUrl ? { uri: avatarUrl } : null}
            />
            <View style={{ marginLeft: 8, marginRight: 8, justifyContent: 'center' }}>
                <StyledText style={{ fontSize: 14, fontWeight: 'bold' }}>{name}</StyledText>
            </View>
        </TouchableOpacity>
    );
};

export default MateRow;