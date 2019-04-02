import React from 'react';
import { View, Text } from 'react-native';

class SearchResult extends React.Component {
  render() {
    return(
      <View style={{ flex: 1, flexDirection: 'column', opacity: 0.4, backgroundColor: 'blue'}}>
        <Text>
          Search Result
        </Text>
      </View>
    )
  }
}

export default SearchResult;