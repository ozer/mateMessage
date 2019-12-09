import http from 'http';
import { promisify } from 'util';
import express from 'express';
import mongoose from 'mongoose';
import { ApolloServer } from 'apollo-server-express';
import User from './db/models/User';
import Conversation from './db/models/Conversation';

// Getting base GraphQL Schema
import schema from './schema';
import { validateToken } from './helpers/Authenticator';

const PORT = 4000;

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
let httpServer;

export const initializeServer = async () => {
  console.log('ENVIRONMENT -> ', process.env.NODE_ENV);
  mongoose.connect(
    `mongodb://localhost:27017/${process.env.NODE_ENV}-MateMessage`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
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
        const token = req.headers.authorization.split(' ')[1];
        if (token) {
          return validateToken(token).then(result => {
            if (result && result.id) {
              return User.findById(result.id, { password: 0 }).then(user => {
                if (user) {
                  return {
                    state: true,
                    user
                  };
                }
              });
            }
            return { state: false, user: null };
          });
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

  httpServer = http.createServer(app);
  httpServer.listen = promisify(httpServer.listen);

  apolloServer.applyMiddleware({ app });
  apolloServer.installSubscriptionHandlers(httpServer);

  await httpServer.listen(PORT);

  console.log(
    `🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
  );
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`
  );
  return true;
};

export const killServer = async () => {
  if (httpServer) {
    // Closing database connection.
    await mongoose.disconnect();
    await httpServer.close();
  }
};
