import http from 'http';
import { promisify } from 'util';
import express from 'express';
import mongoose from 'mongoose';
import { ApolloServer } from 'apollo-server-express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import User from './db/models/User';
import restAPI from './routes';

// Getting base GraphQL Schema
import schema from './schema';
import { validateToken } from './helpers/Authenticator';
import { buildContext } from './schema/context';

const PORT = 4000;

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', function(coll, method, query) {
    console.log('[query]: ', query, ' from [collection]: ', coll);
  });
}
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
  app.use(helmet());
  app.use(bodyParser.json());
  app.use('/api', restAPI);

  const apolloServer = new ApolloServer({
    schema,
    context: buildContext,
    subscriptions: {
      path: '/api/graphql',
      onConnect: (connectionParams, webSocket) => {
        if (connectionParams.authToken) {
          const { authToken } = connectionParams;
          return validateToken(authToken)
            .then(result => {
              if (result && result.id) {
                return User.findById(result.id, { password: 0 }).then(user => {
                  if (user) {
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

  apolloServer.applyMiddleware({ app, path: '/api/graphql' });
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
