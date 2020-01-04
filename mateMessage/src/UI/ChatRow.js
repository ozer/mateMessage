import React, { useMemo } from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { Avatar } from "react-native-elements";
import { getInitials } from "../helpers/mates";
import { getConvoInitials } from "../helpers/convos";

const ChatRow = ({ onPress, conversationId, title, subtitle }) => {
  const rowPress = () => {
    onPress(conversationId);
  };

  return (
    <TouchableOpacity
      onPress={rowPress}
      style={{
        flexDirection: "row",
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 16,
        paddingRight: 16
      }}
    >
      <Avatar rounded size="medium" title={"CO"} />
      <View
        style={{
          marginLeft: 8,
          marginRight: 8,
          justifyContent: "center",
          flexDirection: "column"
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "bold" }}>{title}</Text>
        <Text numberOfLines={1} style={{ fontSize: 12 }}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChatRow;
