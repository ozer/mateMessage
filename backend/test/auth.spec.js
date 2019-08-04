import { expect } from 'chai';
import WebSocket from 'ws';
import ApolloClient from 'apollo-client';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { WebSocketLink } from 'apollo-link-ws';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { signIn, signUp, isTokenAuthenticated } from './api/auth';
import { initializeServer, killServer } from '../src/server';
import { dropDatabase } from './utils/db';
import gql from 'graphql-tag';
import { Leo, Ozer } from './utils/data';

const delay = s =>
  new Promise(resolve => {
    console.log(`Delaying for ${s} ms...`);
    setTimeout(() => {
      return resolve();
    }, s);
  });

describe('mateMessage API TEST', () => {
  before(async () => {
    console.log('First thing first, Cleaning the database...');
    await dropDatabase();
    console.log('Dropped db');
  });

  after('Close Mongo Connection and close the server.', done => {
    killServer().then(() => done());
  });

  it('The server initialize successfully and returns true.', async () => {
    const server = await initializeServer();
    console.log('The server is initialized successfully !');
    expect(server).to.equal(true);
  });

  describe('Authentication Testing', () => {
    let token = '';

    it('Successful SignUp returns state as true and the user object without password.', async () => {
      const data = await signUp(Leo);
      console.log('signUp data from test -> ', data);
      expect(data.signUp.state).to.equal(true);
      expect(data.signUp.user.username).to.equal(Leo.username);
      expect(data.signUp.user.name).to.equal(Leo.name);
      expect(data.signUp.user.email).to.equal(Leo.email);
      expect(data.signUp.user.jwt).to.equal(null);
      expect(data.signUp.user.password).to.equal(undefined);
    });

    it('Returns null when you try to sign up with the same credentials.', async () => {
      const data = await signUp(Leo);
      console.log('signUp data -> ', data);
      expect(data.signUp).to.equal(null);
    });

    it('Successful SignIn returns state as true and the user object without password.', async () => {
      const data = await signIn({
        username: Leo.username,
        password: Leo.password
      });
      if (data) {
        console.log('data', data);
        const { signIn } = data;
        expect(signIn.state).to.equal(true);
        expect(signIn.user.username).to.equal(Leo.username);
        expect(signIn.user.jwt).to.not.equal(undefined || '');
        expect(signIn.user.password).to.equal(undefined);
        token = signIn.user.jwt;
      }
    });

    it('Check the user is authenticated using the JWT Token returns state as true and user object without password.', async () => {
      const data = await isTokenAuthenticated({ token });
      if (data) {
        console.log('data', data);
        const { isTokenAuthenticated } = data;
        expect(isTokenAuthenticated.state).to.equal(true);
        expect(isTokenAuthenticated.user.username).to.equal(Leo.username);
        expect(isTokenAuthenticated.user.jwt).to.not.equal(undefined || '');
        expect(isTokenAuthenticated.user.password).to.equal(undefined);
      }
    });

    it(`${
      Leo.name
    } should be able to open a secure websocket connection to the server.`, async function() {
      this.timeout(5000);
      let connected = false;

      const link = new WebSocketLink({
        uri: 'ws://localhost:4000/graphql',
        webSocketImpl: WebSocket,
        options: {
          connectionCallback: () => {
            console.log('Connection callback!');
            connected = true;
            expect(connected).to.equal(true);
          },
          connectionParams: () => ({
            authToken: token
          })
        }
      });

      const cache = new InMemoryCache();
      const apollo = new ApolloClient({
        link,
        cache,
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'ignore'
          },
          query: {
            errorPolicy: 'all'
          }
        }
      });

      const client = () => apollo;

      // Connect to WebSocket Server.
      await link.subscriptionClient.connect();
    });
  });
});
