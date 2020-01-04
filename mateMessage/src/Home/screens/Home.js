import React, { useEffect } from "react";
import StyledView from "../../UI/StyledView";
import StyledText from "../../UI/StyledText";
import { useQuery } from "@apollo/react-hooks";
import { Viewer } from "../../queries/Viewer";
import { Navigation } from "react-native-navigation";
import HomeHeader from "../../UI/HomeHeader";
import { getInitials } from "../../helpers/mates";
import { SafeAreaView } from "react-native";

const Home = ({ componentId }) => {
  const {
    data: { viewer },
    loading
  } = useQuery(Viewer);

  const name = viewer && viewer.name ? viewer.name : "";
  const initials = getInitials(name);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StyledView marginTop={32}>
        <HomeHeader name={name} initials={initials} />
      </StyledView>
    </SafeAreaView>
  );
};

Home.options = () => ({
  topBar: {
    visible: true,
    drawBehind: true
  }
});

export default Home;
