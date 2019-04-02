import http from 'http';
import { promisify } from 'util';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import JWT from 'jsonwebtoken';
import { execute, subscribe } from 'graphql';
import { ApolloServer } from 'apollo-server-express';
import User from './db/models/User'; // eslint-disable-line
import Conversation from './db/models/Conversation'; // eslint-disable-line
import Message from './db/models/Message'; // eslint-disable-line

// Getting base GraphQL Schema
import schema from './schema';
import { validateToken } from './helpers/Authenticator';

const PORT = 4000;
mongoose.Promise = global.Promise;

const initializeServer = async () => {

  mongoose.connect(
    'mongodb://localhost:27017/mateMessage',
    { useNewUrlParser: true }
  );

  await mongoose.connection
    .once('open', () => console.log('Connected to MongoLab instance.'))
    .on('error', error => {
      console.log('Error connecting to MongoLab:', error);
      throw error;
    });

  /** BASE Express server definition **/
  const app = express();

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, connection }) => {

      if (connection) {
        return connection.context;
      }

      // get the user token from the headers
      if (req && req.headers && req.headers.authorization) {
        const token = req.headers.authorization.replace('Bearer ', '');
        if (token) {
          return validateToken(token).then(result => {
            if (result && result.id) {
              return User.findById(result.id, { password: 0 }).then(user => {
                if (user) {
                  console.log('The request is authenticated!');
                  return {
                    state: true,
                    deneme: true,
                    user
                  };
                }
              });
            }
            return { state: false, user: null };
          })
        }
        return { state: false, user: null };
      }
      console.log('The request do not have a token!');
      return { state: false, user: null };
    },
    subscriptions: {
      onConnect: (connectionParams, webSocket) => {
        console.log('socket-onConnect!', connectionParams);
        if (connectionParams.authToken) {
          const { authToken } = connectionParams;
          return validateToken(authToken)
            .then(result => {
              if (result && result.id) {
                return User.findById(result.id, { password: 0 }).then(user => {
                  if (user) {
                    console.log('Socket connection is established!');
                    return {
                      user
                    };
                  }
                  return webSocket.close();
                });
              }
            })
            .catch(err => {
              console.log('ERROR AT SOCKET CONNECTION -> ', err);
              webSocket.close();
            });
        }
        webSocket.close();
      }
    }
  });

  apolloServer.applyMiddleware({ app });

  const httpServer = http.createServer(app);
  apolloServer.installSubscriptionHandlers(httpServer);

  httpServer.listen = promisify(httpServer.listen);

  return httpServer.listen(PORT).then(() => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
    );
    console.log(
      `🚀 Subscriptions ready at ws://localhost:${PORT}${
        apolloServer.subscriptionsPath
      }`
    );
    return;
  });
};

initializeServer()
  .then(() => {
    console.log('The server is initialized successfully !');
  })
  .catch(err => {
    console.log('ERROR AT INITIALIZE SERVER', err);
  });
