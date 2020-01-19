import { createHttpLink } from 'apollo-link-http';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/api/graphql'
});

export default httpLink;