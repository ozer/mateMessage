import React from 'react';
import { TouchableOpacity } from 'react-native';
import StyledView from './StyledView';
import StyledText from './StyledText';

const NetworkStatusBar = ({ visible }) => {

  if (visible) {
    return (
      <StyledView style={{ height: 40 }}>
        <TouchableOpacity
          style={{
            height: 40,
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'yellow'
          }}
        >
          <StyledText>Offline</StyledText>
        </TouchableOpacity>
      </StyledView>
    );
  }
  return null;
};

export default NetworkStatusBar;
