import React from 'react';
import StyledView from "../../UI/StyledView";
import StyledText from "../../UI/StyledText";
import {useQuery} from "@apollo/react-hooks";
import {Viewer} from "../../queries/Viewer";

const Home = () => {

    const { data: {viewer}, loading } = useQuery(Viewer);

    return (
        <StyledView>
            {
                loading ? null : <StyledText>
                    Hi, {viewer.name}!
                </StyledText>
            }
        </StyledView>
    );
};

export default Home;