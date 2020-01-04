import mongoose from 'mongoose';
import {
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';
import User from '../../db/models/User';
import { SignInResponse, SignUpResponse } from '../types/ResponseTypes';
import { generateToken } from '../../helpers/Authenticator';
import { sendMessageMutation } from './sendMessage/sendMessageMutation';
import { createConversationMutation } from './createConversation/createConversationMutation';
import { createGroupConversationMutation } from './createGroupConversation/createGroupConversationMutation';
import {sendIsTypingMutation} from "./sendIsTyping/sendIsTypingMutation";

const mutations = new GraphQLObjectType({
  name: 'mutation',
  fields: () => ({
    sendMessage: sendMessageMutation,
    sendIsTyping:  sendIsTypingMutation,
    createConversation: createConversationMutation,
    createGroupConversation: createGroupConversationMutation,
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
          if (!user) {
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
                user,
                jwt: user.jwt
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
});

export default mutations;
