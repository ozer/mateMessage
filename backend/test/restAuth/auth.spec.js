import { describe, before, it, after } from 'mocha';
import { expect } from 'chai';
import { signIn, signUp } from '../apiHelper/auth';
import { initializeServer, killServer } from '../../src/server';
import { dropDatabase } from '../utils/db';
import { Leo } from '../utils/data';
import { validateToken } from '../../src/helpers/Authenticator';

describe('mateMessage AUTH REST API TEST', () => {
  before(async () => {
    console.log('First thing first, Cleaning the database...');
    await dropDatabase();
    console.log('Dropped db');
  });

  after('Close Mongo Connection and close the server.', done => {
    killServer().then(() => done());
  });

  describe('Authentication Testing', () => {
    let token = '';

    it('The server initialize successfully and returns true.', async () => {
      const server = await initializeServer();
      console.log('The server is initialized successfully !');
      expect(server).to.equal(true);
    });

    it('Successful SignUp returns state as true and the user object without password.', async () => {
      const { data } = await signUp(Leo);
      expect(data.state).to.equal(true);
      expect(data.user.username).to.equal(Leo.username);
      expect(data.user.name).to.equal(Leo.name);
      expect(data.user.email).to.equal(Leo.email);
      expect(data.user.token).to.not.equal(null || undefined);
      expect(data.user.password).to.equal(undefined);
    });

    it('Returns null when you try to sign up with the same credentials.', async () => {
      const { data } = await signUp(Leo);
      expect(data).to.equal('User registered with this email exists.');
    });

    it('Successful SignIn returns state as true and the user object without password.', async () => {
      const { data } = await signIn({
        username: Leo.username,
        password: Leo.password
      });

      expect(data.state).to.equal(true);
      expect(data.user.username).to.equal(Leo.username);
      expect(data.user.jwt).to.not.equal('');
      expect(data.user.password).to.equal(undefined);
      token = data.user.jwt;
    });

    it('validateToken', async () => {
      const user = await validateToken(token);
      expect(user.username).to.equal(Leo.username);
    })
  });
});
