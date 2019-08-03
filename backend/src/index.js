import { initializeServer } from './server';

initializeServer()
  .then(() => {
    console.log('The server is initialized successfully !');
  })
  .catch(err => {
    console.log('ERROR AT INITIALIZE SERVER', err);
  });
