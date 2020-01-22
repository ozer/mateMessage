import axios from 'axios';
export const GRAPH_API_URL = `http://localhost:4000/api/graphql`;
export const AUTH_API_URL = `http://localhost:4000/api/auth`;
export const SUBSCRIPTION_URL = `ws://localhost:4000/api/graphql`;

export const post = async ({ url, data }) => {
  return axios({
    method: 'POST',
    url,
    data
  });
};
