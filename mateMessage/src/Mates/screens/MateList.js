import React, {useCallback} from 'react';
import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@apollo/react-hooks';
import { Mates as MatesQuery } from '../../queries/Mates';
import {Navigation} from "react-native-navigation";
import {ThemeProvider} from 'emotion-theming';
import { theme } from '../../theme/theme';
import MateRow from "../../UI/MateRow";
import StyledText from "../../UI/StyledText";

const ZeroStateMateList = () => {
    return (
        <View style={{ flex: 1, justifyContent: "center", flexDirection: "column" }}>
            <Text style={{ fontSize: 28, color: "black" }}>Invite your mates!</Text>
        </View>
    );
};

const MateList = () => {
    const { loading, error, data, refetch } = useQuery(MatesQuery);

    const onPress = (mate) => {
        console.log('mate -> ', mate);
    };

    const onLongPress = async (userId) => {
        console.log('userId -> ', userId);
        await Navigation.showOverlay({
            component: {
                id: 'MatePreview',
                name: 'MatePreview',
                options: {
                    overlay: {
                        interceptTouchOutside: true
                    },
                }
            }
        });
    };

    const onRefresh = useCallback(async () => {
        console.log('onRefresh!');
        await refetch();
    }, [refetch]);

    return (
        <ThemeProvider theme={theme}>
            <View>
                <FlatList
                    refreshing={false}
                    ListEmptyComponent={ZeroStateMateList}
                    onRefresh={onRefresh}
                    data={data.people}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <MateRow
                            key={item.id}
                            id={item.id}
                            name={item.name}
                            avatarUrl={item.avatarUrl}
                            onContactPress={onPress}
                            onContactLongPress={onLongPress}
                        />
                    )}
                />
            </View>
        </ThemeProvider>
    );
};

export default MateList;