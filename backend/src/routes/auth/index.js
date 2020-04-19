import { Router } from 'express';
import User from '../../db/models/User';
import { generateToken } from '../../helpers/Authenticator';

const router = new Router();

router.post('/signUp', async (request, response) => {
  try {
    if (
      request.body &&
      request.body.email &&
      request.body.name &&
      request.body.username &&
      request.body.password
    ) {
      const { body } = request;
      const { email, name, username, password } = body;
      const userExists = await User.findOne({ username });
      if (userExists) {
        return response
          .json('User registered with this email exists.')
          .status(400);
      }
      const user = new User({ name, email, password, username });
      await user.save();
      const token = generateToken(user);
      user.jwt = token;
      await user.save();

      return response
        .json({
          state: true,
          message: 'Sign up is successful.',
          user: {
            email: user.email,
            name: user.name,
            username: user.username,
            token: user.jwt
          }
        })
        .status(200);
    }
    return response.json('Missing Credentials').status(400);
  } catch (e) {
    return response.json('Internal Server Error').status(500);
  }
});

router.post('/signIn', async (request, response) => {
  try {
    if (request.body && request.body.username && request.body.password) {
      const { body } = request;
      const { username, password } = body;
      const user = await User.findOne({ username, password }, { password: 0 });
      if (!user) {
        return response.json('Wrong Credentials').status(401);
      }
      const token = await generateToken(user);
      user.jwt = token;
      await user.save();
      return response
        .json({
          state: true,
          message: 'Sign in is successful.',
          user,
        })
        .status(200);
    }
    return response.json('Missing Credentials').status(400);
  } catch (e) {
    return response.json('Internal Server Error').status(500);
  }
});

export default router;
