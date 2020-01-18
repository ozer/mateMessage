import React from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import StyledView from "./StyledView";
import StyledText from "./StyledText";

const MessageRow = ({ onFlight, content, self }) => {
  if (onFlight) {
    console.log("message is not delivered yet.");
  }
  return (
    <StyledView
      paddingX={2}
      paddingY={1}
      margin={1}
      flex={1}
      flexDirection={"row"}
      borderRadius={4}
      backgroundColor={self ? "blue" : "gray"}
      alignSelf={self ? "flex-end" : "flex-start"}
    >
      {self && onFlight ? <Icon name={"clock-o"} size={16} /> : null}
      <StyledText style={{ marginLeft: 10 }}>{content}</StyledText>
    </StyledView>
  );
};

export default MessageRow;
