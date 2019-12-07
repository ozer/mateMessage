import { GraphQLObjectType, GraphQLList, GraphQLString } from 'graphql';
import mongoose, { ObjectId } from 'mongoose';
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
      }
    },
    feed: {
      type: new GraphQLList(ConversationType),
      args: { id: { type: GraphQLString } },
      resolve: async (parentValue, args, context) => {
        console.log('Fetching feed!');
        console.log('args', args);
        if (context && context.user) {
          if (args && args.id) {
            return Conversation.findById(args.id)
              .sort({ 'messages.created_at': 'desc' })
              .populate({ path: 'recipients.recipient' })
              .then(conversations => {
                return [conversations];
              });
          }
          const { user } = context;
          console.log('userId -> ', typeof user.id, user.id);

          const cs = await Conversation.aggregate([
            {
              $match: {
                recipients: {
                  $in: [mongoose.Types.ObjectId(user.id)]
                }
              }
            },
            {
              $lookup: {
                from: 'Message',
                localField: 'id',
                foreignField: 'conversation',
                as: 'messages'
              }
            }
          ]);

          console.log('cs -> ', cs.length);

          const convos = await Conversation.find({
            $and: [{ recipients: user.id }]
          })
            .populate({
              path: 'recipients',
              select: ['email', 'name']
            })
            .slice({ messages: -50 })
            .sort({ 'messages.created_at': 'desc' });

          convos.forEach(convo => {
            const meIdx = convo.recipients.findIndex(r => r.id === user.id);
            convo.recipients.splice(meIdx, 1);
          });
          console.log('convos.length -> ', convos.length);
          return cs;
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
