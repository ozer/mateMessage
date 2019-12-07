import React, { memo } from "react";
import { View, Text } from "react-native";

const ChatBubble = ({ me, content, senderName, senderId, delivered }) => {
  if (!content) {
    return null;
  }

  return (
    <View
      style={{
        justifyContent: me ? "flex-end" : "flex-start",
        flexDirection: "row",
        marginVertical: 5,
        marginHorizontal: 10
      }}
    >
      {delivered ? (
        <View>
          <Text>Loading</Text>
        </View>
      ) : null}
      <View
        style={{
          backgroundColor: me.id ? "#00BFA5" : "white",
          borderStyle: "solid",
          borderRadius: 20,
          paddingVertical: 3,
          paddingHorizontal: 3
        }}
      >
        <Text style={{ paddingHorizontal: 12, textAlign: "left" }}>
          {content}
        </Text>
      </View>
    </View>
  );
};

export default ChatBubble;
