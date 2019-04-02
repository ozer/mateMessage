import { GraphQLObjectType, GraphQLList, GraphQLString } from 'graphql';
import mongoose from 'mongoose';
import UserType from './UserType';
import ConversationType from './ConversationType';

const User = mongoose.model('User');
const Conversation = mongoose.model('Conversation');

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    users: {
      type: GraphQLList(UserType),
      resolve(parentValue, args, context) {
        console.log('users query!');
        return User.find({ username: { $ne: null } });
      }
    },
    people: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args, context) {
        const { user } = context;
        const { _id } = user;
        console.log('My Id -> ', _id);
        return User.find({ username: { $ne: null }, _id: { $ne: _id } });
      }
    },
    myConversations: {
      type: new GraphQLList(ConversationType),
      resolve(parentValue, args, context) {
        if (context && context.state && context.user) {
          const { user } = context;
          const { _id } = user;
          return Conversation.find().then(conversations => {
            console.log('Conversations in the system -> ', conversations);
            return conversations;
          });
        }
        return Conversation.find().then(conversations => conversations);
      }
    },
    feed: {
      type: new GraphQLList(ConversationType),
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args, context) {
        console.log('Fetching feed! ', context);
        if (context && context.user) {
          const { user } = context;
          const { _id } = user;
          console.log('FETCH FEED IS AUTHED', _id);
          return Conversation.find({
            recipients: {
              $in: [_id]
            }
          })
            .populate(['recipients', 'messages.sender'])
            .sort({ 'messages.created_at': 'desc' })
            .then(conversations => {
              console.log('Conversations in the system', conversations);
              return conversations;
            });
        }
        return [];
      }
    },
    isTokenAuthenticated: {
      type: UserType,
      resolve(parentValue, {}, context) {
        if (context && context.state && context.user) {
          const { user } = context;
          return user;
        }
        return null;
      }
    }
  })
});

export default RootQuery;
