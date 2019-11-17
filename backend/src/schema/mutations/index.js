import mongoose from 'mongoose';
import {
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';
import User from '../../db/models/User';
import Message from '../../db/models/Message';
import {
  CreateConversationResponse,
  SearchResponse,
  SendMessageResponse,
  SignInResponse,
  SignUpResponse
} from '../types/ResponseTypes';
import Conversation from '../../db/models/Conversation';
import {
  publish,
  publishConversation,
  publishMessage,
  sendMessageToRecipients
} from '../subscriptions';
import { generateToken } from '../../helpers/Authenticator';
import UserType from '../types/UserType';
import ConversationType from '../types/ConversationType';

const mutations = new GraphQLObjectType({
  name: 'mutation',
  fields: () => ({
    sendMessage: {
      type: SendMessageResponse,
      args: {
        content: { type: GraphQLString },
        conversationId: { type: GraphQLString },
        recipientId: { type: GraphQLString }
      },
      resolve: async (
        parentValue,
        { conversationId, content, recipientId },
        context
      ) => {
        if (context && context.user) {
          const { user } = context;
          if (!conversationId && recipientId) {
            const existingConvo = await Conversation.findOne({
              $and: [
                { 'recipients.recipient': recipientId },
                { 'recipients.recipient': context.user.id }
              ],
            }).populate({
              path: 'recipients.recipient',
              select: ['email', 'name']
            });
            console.log('existingConvo -> ', existingConvo);
            if (existingConvo) {
              const newMessage = new Message();
              newMessage.sender = user.id;
              newMessage.content = content;
              existingConvo.messages.push(newMessage);
              const a = await existingConvo.save();
              sendMessageToRecipients({
                recipients: existingConvo.recipients,
                content,
                senderId: user.id,
                conversationId: existingConvo.id,
                messageId: newMessage.id
              });
              return a;
            }
          }
          const convo = await Conversation.findById(conversationId);
          if (convo) {
            const newMessage = new Message();
            newMessage.sender = user.id;
            newMessage.content = content;
            convo.messages.push(newMessage);
            const updatedConvo = await convo.save();
            console.log('newMessage -> ', newMessage);
            sendMessageToRecipients({
              recipients: updatedConvo.recipients,
              content,
              senderId: user.id,
              conversationId: updatedConvo.id,
              messageId: newMessage.id
            });
            return updatedConvo;
          }
          if (recipientId) {
            let newConvo = new Conversation();
            newConvo.recipients.push({ recipient: user.id });
            newConvo.recipients.push({ recipient: recipientId });
            const newMessage = new Message();
            newMessage.sender = user.id;
            newMessage.content = content;
            newConvo.messages.push(newMessage);
            newConvo = await newConvo.save();
            sendMessageToRecipients({
              recipients: newConvo.recipients,
              content,
              senderId: user.id,
              conversationId: newConvo.id,
              messageId: newMessage.id
            });
            return newConvo;
          }
          return null;
        }
        return null;
      }
    },
    createConversation: {
      type: ConversationType,
      args: {
        recipient: { type: GraphQLString }
      },
      resolve: async (parentValue, { recipient }, context) => {
        if (context && context.user) {
          console.log('createConversation');
          const existingConvo = await Conversation.find({
            $and: [
              { 'recipients.recipient': context.user.id },
              { 'recipients.recipient': recipient }
            ]
          });
          if (
            existingConvo.filter(convo => convo.recipients.length === 2).length
          ) {
            return existingConvo[0];
          }
          let newConvo = new Conversation();
          newConvo.recipients.push({ recipient: context.user.id });
          newConvo.recipients.push({ recipient });
          newConvo = await newConvo.save();
          return newConvo;
        }
        return null;
      }
    },
    createGroupConversation: {
      type: ConversationType,
      args: {
        recipients: { type: new GraphQLList(GraphQLString) }
      },
      resolve: async (parentValue, { recipients }, context) => {
        console.log('createGroupConversation');
        if (context && context.user) {
          let newConvo = new Conversation();
          newConvo.recipients.push({ recipient: context.user.id });
          recipients.map(recipient => {
            newConvo.recipients.push({ recipient });
          });
          newConvo = await newConvo.save();
          console.log(newConvo);
          return newConvo;
        }
        return null;
      }
    },
    signUp: {
      type: SignUpResponse,
      args: {
        email: { type: GraphQLString },
        name: { type: GraphQLString },
        username: { type: GraphQLString },
        password: { type: GraphQLString }
      },
      resolve(parentValue, { email, name, username, password }) {
        console.log('SignUp Mutation -> ', username);
        return User.findOne({ username }).then(user => {
          console.log('user -> ', user);
          if (!user) {
            console.log('Not Existing');
            return User.create({
              name,
              email,
              password,
              username
            }).then(result => {
              if (result) {
                return {
                  state: true,
                  message: 'Sign up is successful.',
                  user: result
                };
              }
            });
          }
          console.log('user Exists');
          return new Error('User registered with this email exists.');
        });
      }
    },
    signIn: {
      type: SignInResponse,
      args: {
        username: { type: GraphQLString },
        password: { type: GraphQLString }
      },
      resolve(parentValue, { username, password }, context) {
        console.log('SignIn Mutation');
        return User.findOne({ username, password }, { password: 0 }).then(
          async user => {
            if (user) {
              const token = await generateToken(user);
              user.jwt = token;
              await user.save();
              return {
                state: true,
                message: 'Sign in is successful.',
                user
              };
            }
            return {
              state: false,
              message: 'Wrong credentials.',
              user: null
            };
          }
        );
      }
    },
    isTokenAuthenticated: {
      type: SignInResponse,
      resolve(parentValue, _, context) {
        if (context && context.state && context.user) {
          const { user } = context;
          return { state: true, user };
        }
        return { state: false, user: null };
      }
    }
  })
  // fields: {
  //   signUp: {
  //     type: SignUpResponse,
  //     args: {
  //       email: { type: GraphQLString },
  //       name: { type: GraphQLString },
  //       username: { type: GraphQLString },
  //       password: { type: GraphQLString }
  //     },
  //     resolve(parentValue, { email, name, username, password }) {
  //       console.log('SignUp Mutation -> ', username);
  //       return User.findOne({ username }).then(user => {
  //         console.log('user -> ', user);
  //         if (!user) {
  //           console.log('Not Existing');
  //           return User.create({
  //             name,
  //             email,
  //             password,
  //             username
  //           }).then(result => {
  //             if (result) {
  //               return {
  //                 state: true,
  //                 message: 'Sign up is successful.',
  //                 user: result
  //               };
  //             }
  //           });
  //         }
  //         console.log('user Exists');
  //         return new Error('User registered with this email exists.');
  //       });
  //     }
  //   },
  //   isTokenAuthenticated: {
  //     type: SignInResponse,
  //     resolve(parentValue, { }, context) {
  //       if (context && context.state && context.user) {
  //         const { user } = context;
  //         return { state: true, user };
  //       }
  //       return { state: false, user: null };
  //     }
  //   },
  //   signIn: {
  //     type: SignInResponse,
  //     args: {
  //       username: { type: GraphQLString },
  //       password: { type: GraphQLString }
  //     },
  //     resolve(parentValue, { username, password }, context) {
  //       console.log('SignIn Mutation');
  //       return User.findOne({ username, password }, { password: 0 }).then(
  //         async user => {
  //           if (user) {
  //             const token = await generateToken(user);
  //             user.jwt = token;
  //             await user.save();
  //             return {
  //               state: true,
  //               message: 'Sign in is successful.',
  //               user
  //             };
  //           }
  //           return {
  //             state: false,
  //             message: 'Wrong credentials.',
  //             user: null
  //           };
  //         }
  //       );
  //     }
  //   },
  //   search: {
  //     type: SearchResponse,
  //     args: {
  //       searchPhrase: { type: GraphQLString }
  //     },
  //     resolve(parentValue, { searchPhrase }, context) {
  //       console.log('SearchPhrase -> ', searchPhrase);
  //       console.log(`'(\s+${searchPhrase}|^${searchPhrase})`);
  //       return User.find(
  //         { name: { $regex: `^${searchPhrase}` } },
  //         { password: 0 }
  //       ).then(searchResult => {
  //         console.log('searchResult -> ', searchResult);
  //         return {
  //           state: true,
  //           searchData: searchResult
  //         };
  //       });
  //     }
  //   },
  //   cc: {
  //     type: CreateConversationResponse,
  //     args: {
  //       receiverId: { type: GraphQLString },
  //     },
  //     resolve: (parentValue, { receiverId }, context) => {
  //       if (context && context.user && receiverId) {
  //
  //       }
  //       return null;
  //     }
  //   },
  //   createConversation: {
  //     type: CreateConversationResponse,
  //     args: {
  //       receiverId: { type: GraphQLString }
  //     },
  //     resolve(parenValue, { receiverId }, context) {
  //       console.log('createConversation -> ', receiverId);
  //       if (context && context.user && receiverId) {
  //         const { user } = context;
  //         const { _id } = user;
  //         console.log('OK!', _id);
  //         return Conversation.find({
  //           $and: [
  //             {
  //               recipients: {
  //                 $in: [_id]
  //               }
  //             },
  //             {
  //               recipients: {
  //                 $in: [receiverId]
  //               }
  //             }
  //           ]
  //         })
  //           .then(foundConversation => {
  //             console.log('Found conversation -> ', foundConversation);
  //             if (foundConversation && foundConversation.length) {
  //               return {
  //                 state: true,
  //                 conversationData: foundConversation
  //               };
  //             }
  //             const cc = new Conversation({ recipients: [_id, receiverId] });
  //             return cc.save().then(newConversation => {
  //               return newConversation
  //                 .populate(['recipients'])
  //                 .execPopulate()
  //                 .then(populatedNewConversation => {
  //                   publishConversation({
  //                     conversationId: populatedNewConversation._id,
  //                     receiverId,
  //                     recipients: populatedNewConversation.recipients
  //                   });
  //                   return {
  //                     state: true,
  //                     conversationData: populatedNewConversation
  //                   };
  //                 });
  //             });
  //           })
  //           .catch(e => {
  //             console.log('ERROR AT FIND CONVERSATION', e);
  //             return {
  //               state: false,
  //               conversationData: null
  //             };
  //           });
  //       }
  //       return {
  //         state: false,
  //         conversationData: null
  //       };
  //     }
  //   },
  //   sendMessage: {
  //     type: SendMessageResponse,
  //     args: {
  //       content: { type: GraphQLString },
  //       conversationId: { type: GraphQLString }
  //     },
  //     resolve(parentValue, { content, conversationId }, context) {
  //       console.log('sendMessage');
  //       console.log('content -> ', content);
  //       if (context && context.user) {
  //         return Conversation.findById(conversationId).then(conversation => {
  //           const { _id } = context.user;
  //           const message = new Message({
  //             conversationId: conversation._id,
  //             sender: _id,
  //             content
  //           });
  //           console.log('New message -> ', message);
  //           conversation.messages.push(message);
  //           return conversation.save().then(conv => {
  //             const otherRecipient = conversation.recipients.find(
  //               recipient => recipient.toString() !== _id.toString()
  //             );
  //             console.log('otherRecipient -> ', otherRecipient);
  //             publishMessage({
  //               receiverId: otherRecipient,
  //               content,
  //               conversationId: conversation._id,
  //               senderId: _id,
  //               messageId: message._id
  //             });
  //             return {
  //               state: true,
  //               messageData: {
  //                 id: message._id,
  //                 content: content,
  //                 conversation: {
  //                   id: conversation._id
  //                 },
  //                 sender: {
  //                   id: _id
  //                 }
  //               }
  //             };
  //           });
  //         });
  //         return {
  //           state: false,
  //           messageData: null
  //         };
  //       }
  //       return {
  //         state: false,
  //         messageData: null
  //       };
  //     }
  //   }
  // }
});

export default mutations;
