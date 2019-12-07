import React from "react";
import { View, Text } from "react-native";

const MessageRow = ({ onFlight, content }) => {
	if(onFlight) {
		console.log('message is not delivered yet.');
	}
  return <View>
	  <Text>
		  {`${onFlight ? 'Not Delivered' : 'Delivered'} - `}{content}
	  </Text>
  </View>;
};

export default MessageRow;
