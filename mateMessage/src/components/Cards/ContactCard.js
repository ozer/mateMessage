import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { Avatar } from 'react-native-elements';
import { getInitials } from '../../helpers/mates';

const ContactCard = (props) => {
  const { person, onPress } = props;
  const { name, avatarUrl } = person;

  const press = () => {
    onPress(person);
  }

  return (
    <TouchableOpacity
      onPress={press}
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
        title={getInitials(person)}
        source={avatarUrl ? { uri: avatarUrl } : null}
      />
      <View style={{ marginLeft: 8, marginRight: 8, justifyContent: 'center' }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{name}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ContactCard;
