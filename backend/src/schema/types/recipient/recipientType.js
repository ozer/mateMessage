import {GraphQLObjectType, GraphQLString} from 'graphql';
import {Types} from "mongoose";
import {idMapping} from "../../../helpers/mapping";

const recipientType = new GraphQLObjectType({
    name: 'Recipient',
    fields: () => ({
        id: {
            type: GraphQLString,
            resolve: idMapping
        },
        name: {
            type: GraphQLString,
        },
    }),
});

export default recipientType;