import React from 'react';
import { SafeAreaView } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery } from '@apollo/react-hooks';
import StyledView from '../../UI/StyledView';
import HomeHeader from '../../UI/HomeHeader';
import { getInitials } from '../../helpers/mates';
import NetworkStatusBar from '../../UI/NetworkStatusBar';
import { HomeQuery } from '../../queries/HomeQuery';
import { StyledText } from '../../UI';

const Home = () => {
  const { isInternetReachable, isConnected } = useNetInfo();

  const { data, loading } = useQuery(HomeQuery, {});

  const { viewer = {} } = data || {};

  const name = viewer && viewer.name ? viewer.name : '';
  const messageCount = viewer && viewer.messageCount;
  const initials = getInitials(name);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NetworkStatusBar visible={!isInternetReachable || !isConnected} />
      <StyledView marginTop={32}>
        <HomeHeader name={name} initials={initials} />
        <StyledView paddingX={16} marginTop={16}>
          <StyledText fontSize={16}>
            {`You have sent ${messageCount || 0} messages so far!`}
          </StyledText>
        </StyledView>
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
