import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@apollo/react-hooks';
import { Mates as MatesQuery } from '../../queries/Mates';
import ContactCard from "../../components/Cards/ContactCard";

const ZeroStateMateList = () => {
    return (
        <View style={{ flex: 1, justifyContent: "center", flexDirection: "column" }}>
            <Text style={{ fontSize: 28, color: "black" }}>Invite your mates!</Text>
        </View>
    );
};

const MateList = () => {

    const { loading, error, data, refetch } = useQuery(MatesQuery);

    // console.log('loading -> ', loading);
    // console.log('error ', error);
    // console.log('data ', data);

    const onPress = (mate) => {
        console.log('mate -> ', mate);
    }

    return (
        <View>
            <Text>
                {'Mate List'}
            </Text>
            <FlatList
                refreshing={false}
                ListEmptyComponent={ZeroStateMateList}
                onRefresh={() => {
                    console.log("onRefresh!");
                    refetch();
                }}
                data={data.people}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <ContactCard
                        key={item.id}
                        person={item}
                        onPress={onPress}
                    />
                )}
            />
        </View>
    );
};

export default MateList;