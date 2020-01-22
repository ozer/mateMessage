import { post, AUTH_API_URL } from '../utils/request';

export const signIn = async ({ username = '', password = '' }) => {
  try {
    const url = `${AUTH_API_URL}/signIn`;
    const data = { username, password };
    const response = await post({ url, data });
    return response;
  } catch (e) {
    throw e;
  }
};

export const signUp = async ({ email, name, username, password }) => {
  try {
    const url = `${AUTH_API_URL}/signUp`;
    const response = await post({
      url,
      data: { email, name, username, password }
    });
    return response;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
