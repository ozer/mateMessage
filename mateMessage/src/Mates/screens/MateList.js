import React, { useCallback } from "react";
import {View, Text, FlatList, ActionSheetIOS} from "react-native";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { Navigation } from "react-native-navigation";
import { ThemeProvider } from "emotion-theming";
import get from "lodash.get";
import { theme } from "../../theme/theme";
import MateRow from "../../UI/MateRow";

const ZeroStateMateList = () => {
  return (
    <View
      style={{ flex: 1, justifyContent: "center", flexDirection: "column" }}
    >
      <Text style={{ fontSize: 28, color: "black" }}>Invite your mates!</Text>
    </View>
  );
};

const MateList = () => {
  const {
    loading,
    error,
    data: { viewer },
    refetch
  } = useQuery(MateListQuery);

  console.log("viewer", viewer);

  const edges = get(viewer, "mates.edges") || [];
  console.log("edges ", edges);

  const onPress = mate => {
    console.log("mate -> ", mate);
    ActionSheetIOS.showActionSheetWithOptions({
      options: ['Cancel', 'Create Conversation'],
      estructiveButtonIndex: 1,
      cancelButtonIndex: 0,
    }, (buttonIndex => {
      if (buttonIndex === 1) {
        console.log('create conversation!');
      }
    }));
  };

  const onLongPress = async userId => {
    await Navigation.showOverlay({
      component: {
        id: "MatePreview",
        name: "MatePreview",
        options: {
          overlay: {
            interceptTouchOutside: true
          }
        }
      }
    });
  };

  const onRefresh = useCallback(async () => {
    console.log("onRefresh!");
    await refetch();
  }, [refetch]);

  return (
    <ThemeProvider theme={theme}>
      <View>
        <FlatList
          refreshing={false}
          ListEmptyComponent={ZeroStateMateList}
          onRefresh={onRefresh}
          data={edges}
          keyExtractor={item => item.node.userId}
          renderItem={({ item: { node } }) => (
            <MateRow
              id={node.userId}
              name={node.name}
              onContactPress={onPress}
              onContactLongPress={onLongPress}
            />
          )}
        />
      </View>
    </ThemeProvider>
  );
};

const MateListQuery = gql`
  query Viewer {
    viewer {
      id
      mates {
        edges {
          node {
            id
            userId
            name
            email
          }
        }
      }
    }
  }
`;

export default MateList;
