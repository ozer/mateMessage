import React from "react";
import { Avatar } from "react-native-elements";
import StyledView from "./StyledView";
import StyledText from "./StyledText";
import Separator from "./Separator";

const HomeHeader = ({ name, initials, avatar }) => {
  return (
    <StyledView paddingX={16}>
      <StyledText fontSize={16}>{`${new Date().toLocaleString("en-us", {
        weekday: "long"
      })}, ${new Date().getDate()} ${new Date().toLocaleString("en-us", {
        month: "long"
      })}`}</StyledText>
      <StyledView
        alignItems="center"
        flexDirection="row"
        justifyContent="space-between"
      >
        <StyledText fontSize={24}>{`Hi, ${name}!`}</StyledText>
        <Avatar
          rounded
          size="medium"
          title={initials}
          source={avatar ? { uri: avatar } : null}
        />
      </StyledView>
    </StyledView>
  );
};

export default HomeHeader;
