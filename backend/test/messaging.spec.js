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

describe('Messaging Test', () => {
  let leo;
  const leoCache = new InMemoryCache();
  let leoWsLink;
  let leoApolloClient;
  let leoClient;
  let ozer;
  const ozerCache = new InMemoryCache();
  let ozerWsLink;
  let ozerApolloClient;
  let ozerClient;

  before('Dropping database and populate it', async () => {
    await dropDatabase();
    await initializeServer();
    await signUp(Leo);
    await signUp(Ozer);
    leo = await signIn({ username: Leo.username, password: Leo.password });
    leo = leo.signIn.user;
    ozer = await signIn({ username: Ozer.username, password: Ozer.password });
    ozer = ozer.signIn.user;
    console.log('leo', leo);
    console.log('ozer', ozer);
    leoWsLink = new WebSocketLink({
      uri: 'ws://localhost:4000/graphql',
      webSocketImpl: WebSocket,
      options: {
        connectionCallback: () => {
          console.log(`Leo's ws is connected to the wss successfully.`);
        },
        connectionParams: () => ({
          authToken: leo.jwt
        })
      }
    });
    leoApolloClient = new ApolloClient({ link: leoWsLink, cache: leoCache });
    leoClient = () => leoApolloClient;
    ozerWsLink = new WebSocketLink({
      uri: 'ws://localhost:4000/graphql',
      webSocketImpl: WebSocket,
      options: {
        connectionCallback: () => {
            console.log(`Ozer's ws is connected to the wss successfully.`);
        },
        connectionParams: () => ({
          authToken: ozer.jwt
        })
      }
    });
    ozerApolloClient = new ApolloClient({ link: ozerWsLink, cache: ozerCache });
    ozerClient = () => ozerApolloClient;

    leoWsLink.subscriptionClient.connect();
    ozerWsLink.subscriptionClient.connect();

    await delay(1000);
  });

  after('Close Mongo Connection and close the server.', done => {
    killServer().then(() => done());
  });

  it(`Leo and Ozer subscribed to messageCreated successfully and their state equals to ready.
  Ozer creates a conversation with Leo and it has a uuid.
  Ozer sends a message which is 'Hi Leo' and Leo answers back him with 'Hi Ozer'.`, async () => {
    const leoMessageSubscription = await leoClient()
      .subscribe({
        query: gql`
          subscription MessageCreated {
            messageCreated {
              id
              content
              conversation {
                id
              }
              sender {
                id
              }
            }
          }
        `
      })
      .subscribe({
        next: data => {
            console.log('Leo Message Subscription -> ', data);
            expect(data.data.messageCreated.content).to.equal('Hi Leo');
        },
        error: err => console.log('error: ', err)
      });

    const ozerMessageSubscription = await ozerClient()
      .subscribe({
        query: gql`
          subscription MessageCreated {
            messageCreated {
              id
              content
              conversation {
                id
              }
              sender {
                id
              }
            }
          }
        `
      })
      .subscribe({
        next: data => {
            console.log('Ozer Message Subscription -> ', data);
            expect(data.data.messageCreated.content).to.equal('Hi Ozer');
        },
        error: err => console.log('error: ', err)
      });

      expect(leoMessageSubscription._state).to.equal('ready');
      expect(ozerMessageSubscription._state).to.equal('ready');
      
    const conversation = await ozerClient().mutate({
      mutation: gql`
        mutation CreateConversation($receiverId: String!) {
          createConversation(receiverId: $receiverId) {
            state
            conversationData {
              id
              recipients {
                id
                name
              }
              messages {
                id
                content
                sender {
                  id
                }
              }
            }
          }
        }
      `,
      variables: {
        receiverId: leo.id
      }
    });

    console.log(
      'conversation.id -> ',
      conversation.data.createConversation.conversationData.id
    );

    expect(conversation.data.createConversation.conversationData.id).to.not.equal('' || undefined || null);

    await ozerClient().mutate({
      mutation: gql`
        mutation SendMessage($content: String!, $conversationId: String) {
          sendMessage(content: $content, conversationId: $conversationId) {
            state
            messageData {
              id
              content
              conversation {
                id
              }
              sender {
                id
              }
            }
          }
        }
      `,
      variables: {
        content: 'Hi Leo',
        conversationId: conversation.data.createConversation.conversationData.id
      }
    });

    await leoClient().mutate({
        mutation: gql`
          mutation SendMessage($content: String!, $conversationId: String) {
            sendMessage(content: $content, conversationId: $conversationId) {
              state
              messageData {
                id
                content
                conversation {
                  id
                }
                sender {
                  id
                }
              }
            }
          }
        `,
        variables: {
          content: 'Hi Ozer',
          conversationId: conversation.data.createConversation.conversationData.id
        }
      });
  });
});
