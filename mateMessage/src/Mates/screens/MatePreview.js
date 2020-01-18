import React, { useCallback } from 'react';
import { View, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { encode as btoa } from 'base-64';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { Avatar } from 'react-native-elements';
import { Navigation } from 'react-native-navigation';
import { ThemeProvider } from 'emotion-theming';
import { BlurView as Blur } from '@react-native-community/blur';
import StyledText from '../../UI/StyledText';
import StyledView from '../../UI/StyledView';
import { theme } from '../../theme/theme';
import { getInitials } from '../../helpers/mates';
import { CreateConversation } from '../../mutations/Message';

const MatePreview = ({ componentId, userId }) => {
  const {
    data: { node },
    loading
  } = useQuery(
    gql`
      query User($id: ID!) {
        node(id: $id) {
          id
          ... on User {
            id
            userId
            name
            email
            __typename
          }
        }
      }
    `,
    {
      variables: {
        id: btoa(`User:${userId}`)
      }
    }
  );

  const onPress = useCallback(async () => {
    await Navigation.dismissOverlay(componentId);
  }, [componentId]);

  return (
    <ThemeProvider theme={theme}>
      <View style={styles.container}>
        <Blur blurType={'light'} style={StyleSheet.absoluteFill} />
        <StyledText textAlign={'center'} fontSize={32} color="primary">
          Mate Preview
        </StyledText>
        {loading ? (
          <StyledText>Loading...</StyledText>
        ) : (
          <StyledView alignItems={'center'} marginTop={20}>
            <Avatar rounded title={getInitials(node.name)} size={'large'} />
            <StyledText marginTop={4} fontSize={20} color="primary">
              {node.name}
            </StyledText>
            <StyledText marginTop={4} fontSize={20} color="primary">
              {node.email}
            </StyledText>
            <Button style={styles.button} title="Close" onPress={onPress} />
          </StyledView>
        )}
      </View>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    marginTop: 34,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    alignItems: 'center',
    padding: 16
  },
  sendMessage: {
    marginTop: 40
  },
  button: {
    marginTop: 34
  }
});

export default MatePreview;
