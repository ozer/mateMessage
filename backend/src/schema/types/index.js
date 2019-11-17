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
      type: new GraphQLList(UserType),
      resolve(parentValue, args, context) {
        console.log('users query!');
        return User.find({ username: { $ne: null } }, { password: 0 });
      }
    },
    me: {
      type: UserType,
      resolve(parentValue, args, context) {
        console.log('Me Query -> ', context);
        if (context.state && context.user) {
          return context.user;
        }
        return null;
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
    getConversation: {
      name: 'getConversation',
      type: ConversationType,
      args: { id: { type: GraphQLString } },
      resolve: (parentValue, args, context) => {
        console.log('getConversation');
        if (context && context.user) {
          const { user } = context;
          const { _id } = user;
          return Conversation.find({
            recipients: {
              $in: [_id, args.id]
            }
          })
            .populate(['recipients', 'messages.sender'])
            .sort({ 'messages.created_at': 'desc' })
            .then(conversations => {
              console.log('Conversations in the system', conversations);
              return conversations;
            });
        }
      },
    },
    feed: {
      type: new GraphQLList(ConversationType),
      args: { id: { type: GraphQLString } },
      resolve: async (parentValue, args, context) => {
        console.log('Fetching feed!');
        console.log('args', args);
        if (context && context.user) {
          if (args && args.id) {
            const { user } = context;
            return Conversation.findById(args.id)
              .sort({ 'messages.created_at': 'desc' })
              .populate({ path: 'recipients.recipient' })
              .then(conversations => {
                return [conversations];
              });
          }
          const { user } = context;
          const convos = await Conversation.find({
            $and: [
              { 'recipients.recipient': user.id },
            ]
          }).populate({
            path: 'recipients.recipient',
            select: ['email', 'name']
          })
            .slice({ messages: -50 })
            .sort({ 'messages.created_at': 'desc' });
          console.log('convos.length -> ', convos.length);
          return convos;
        }
        return null;
      }
    },
    isTokenAuthenticated: {
      type: UserType,
      resolve(parentValue, _, context) {
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
