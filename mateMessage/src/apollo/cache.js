import { AsyncStorage } from 'react-native';
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { CachePersistor } from 'apollo-cache-persist';
import { decode } from 'base-64';
import introspectionQueryResultData from '../fragmentTypes';

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData,
});

export const cache = new InMemoryCache({
  dataIdFromObject: object => object.id,
  fragmentMatcher,
  cacheRedirects: {
    Query: {
      node: (_, args, { getCacheKey }) => {
        console.log('args: ', args);
        const { id } = args;
        const decoded = decode(id);
        const [type] = decoded.split(':');
        return getCacheKey({ __typename: type, id: args.id });
      },
    },
  }
});

export const cachePersistor = new CachePersistor({
  cache,
  storage: AsyncStorage,
});