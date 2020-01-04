import React from "react";
import { useQuery } from "react-apollo";
import gql from "graphql-tag";
import { View, Text, StyleSheet } from "react-native";
import { goAuth, goHome } from "../navigation";
import { wsLink, setToken } from "../index";
import { Viewer } from "./queries/Viewer";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    padding: 20
  }
});

const SplashScreen = ({ componentId }) => {
  const {
    data: { viewer },
    loading
  } = useQuery(Viewer);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 28, color: "black", textAlign: "center" }}>
          {"Welcome, Mate!"}
        </Text>
        <Text
          style={{
            fontSize: 18,
            color: "black",
            textAlign: "center",
            marginTop: 40
          }}
        >
          {"We are settings things done for you..."}
        </Text>
      </View>
    );
  }

  if (!viewer) {
    return goAuth(componentId);
  }

  if (viewer) {
    setToken(viewer.jwt);
    wsLink.subscriptionClient.connect();
    return goHome(componentId);
  }
};

export default SplashScreen;
