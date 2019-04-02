import mongoose from 'mongoose';
import { GraphQLID, GraphQLObjectType, GraphQLString } from 'graphql';
import UserType from '../types/UserType';
import {
  CreateConversationResponse,
  SearchResponse,
  SendMessageResponse,
  SignInResponse,
  SignUpResponse
} from '../types/ResponseTypes';
import { publish, publishConversation, publishMessage } from '../subscriptions';
import { generateToken } from '../../helpers/Authenticator';

const User = mongoose.model('User');
const Conversation = mongoose.model('Conversation');
const Message = mongoose.model('Message');

const mutations = new GraphQLObjectType({
  name: 'mutation',
  fields: {
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
    isTokenAuthenticated: {
      type: SignInResponse,
      resolve(parentValue, {}, context) {
        if (context && context.state && context.user) {
          const { user } = context;
          return { state: true, user };
        }
        return { state: false, user: null };
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
    search: {
      type: SearchResponse,
      args: {
        searchPhrase: { type: GraphQLString }
      },
      resolve(parentValue, { searchPhrase }, context) {
        console.log('SearchPhrase -> ', searchPhrase);
        console.log(`'(\s+${searchPhrase}|^${searchPhrase})`);
        return User.find(
          { name: { $regex: `^${searchPhrase}` } },
          { password: 0 }
        ).then(searchResult => {
          console.log('searchResult -> ', searchResult);
          return {
            state: true,
            searchData: searchResult
          };
        });
      }
    },
    createConversation: {
      type: CreateConversationResponse,
      args: {
        receiverId: { type: GraphQLString }
      },
      resolve(parenValue, { receiverId }, context) {
        console.log('createConversation -> ', receiverId);
        if (context && context.user && receiverId) {
          const { user } = context;
          const { _id } = user;
          console.log('OK!', _id);
          return Conversation.find({
            $and: [
              {
                recipients: {
                  $in: [_id]
                }
              },
              {
                recipients: {
                  $in: [receiverId]
                }
              }
            ]
          })
            .then(foundConversation => {
              console.log('Found conversation -> ', foundConversation);
              if (foundConversation && foundConversation.length) {
                return {
                  state: true,
                  conversationData: foundConversation
                };
              }
              const cc = new Conversation({ recipients: [_id, receiverId] });
              return cc.save().then(newConversation => {
                return newConversation
                  .populate(['recipients'])
                  .execPopulate()
                  .then(populatedNewConversation => {
                    publishConversation({
                      conversationId: populatedNewConversation._id,
                      receiverId,
                      recipients: populatedNewConversation.recipients
                    });
                    return {
                      state: true,
                      conversationData: populatedNewConversation
                    };
                  });
              });
              // return Conversation.create({
              //   recipients: [_id, receiverId]
              // }).then(async newConversation => {
              //   console.log('New conversation is created! ->', newConversation);
              //   const aa = await newConversation.populate(['recipients']);
              //   console.log('aaaa -> ', aa);
              //   publishConversation({
              //     conversationId: newConversation._id,
              //     receiverId,
              //     recipients: newConversation.recipients
              //   });
              //   return {
              //     state: true,
              //     conversationData: newConversation
              //   };
              // });
            })
            .catch(e => {
              console.log('ERROR AT FIND CONVERSATION', e);
              return {
                state: false,
                conversationData: null
              };
            });
        }
        return {
          state: false,
          conversationData: null
        };
      }
    },
    sendMessage: {
      type: SendMessageResponse,
      args: {
        content: { type: GraphQLString },
        conversationId: { type: GraphQLString }
      },
      resolve(parentValue, { content, conversationId }, context) {
        console.log('sendMessage');
        console.log('content -> ', content);
        if (context && context.state && context.user) {
          return Conversation.findById(conversationId).then(conversation => {
            const { _id } = context.user;
            const message = new Message({
              conversationId: conversation._id,
              sender: _id,
              content
            });
            console.log('New message -> ', message);
            conversation.messages.push(message);
            return conversation.save().then(conv => {
              const otherRecipient = conversation.recipients.find(
                recipient => recipient.toString() !== _id.toString()
              );
              console.log('otherRecipient -> ', otherRecipient);
              publishMessage({
                receiverId: otherRecipient,
                content,
                conversationId: conversation._id,
                senderId: _id,
                messageId: message._id
              });
              return {
                state: true,
                messageData: {
                  id: message._id,
                  content: content,
                  conversation: {
                    id: conversation._id
                  },
                  sender: {
                    id: _id
                  }
                }
              };
            });
          });
          return {
            state: false,
            messageData: null
          };
        }
        return {
          state: false,
          messageData: null
        };
      }
    }
  }
});

export default mutations;