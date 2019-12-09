import React, {useCallback} from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import {Navigation} from "react-native-navigation";
import { ThemeProvider } from 'emotion-theming';
import StyledText from "../../UI/StyledText";
import {theme} from "../../theme/theme";

const MatePreview = ({ componentId, userId }) => {
    console.log('MatePreview : ', componentId);

    const onPress = useCallback(async () => {
        await Navigation.dismissOverlay(componentId);
    }, [componentId]);

    return (
        <ThemeProvider theme={theme}>
            <View style={{ marginTop: 200, backgroundColor: 'gray' }}>
                <StyledText color="primary">
                    Mate Preview
                </StyledText>
                <Button title="Cancel" onPress={onPress}  />
            </View>
        </ThemeProvider>
    );
};

export default MatePreview;