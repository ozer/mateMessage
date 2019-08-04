[![CircleCI](https://circleci.com/gh/ozercevikaslan/mateMessage/tree/master.svg?style=svg)](https://circleci.com/gh/ozercevikaslan/mateMessage/tree/master)

# mateMessage 😎
## Simple messaging application built with React Native, Apollo-GraphQL, Node, Express and MongoDB.

#### You can preview the demo of the application using the [link](https://drive.google.com/file/d/1FJxg8oMDytmNWWlmI8vrOAc_W1FvT6Kb/view?usp=sharing)

#### Now, you can read & run API Tests in backend folder.
* #### cd ./backend && npm run test

## Instructions to start the server for development.
* cd ./backend && npm i
* Make sure Mongo server is running on localhost at default port.
* Run the server for development -> cd ./backend && npm run start:dev

## Instructions to start the server for production.
* cd ./backend && npm i
* Make sure you have pm2 installed as globally. (npm i -g pm2)
* Inspect the pm2Config.json file.
* Cluster setting is set default 0 which lets pm2 to create many instances as it can so, inspect the package.json to change. [pm2 Cluster Mode](http://pm2.keymetrics.io/docs/usage/cluster-mode/)
* Run the server for production -> npm run start:prod


## Instructions to start mateMessage on iOs.
* The app was built specifically for iOS environment. Note it down that it may have an error at android build.
* cd ./mateMessage && npm i
* Run mateMessage -> react-native run-ios


## Known Issues:
* #### Subscription mechanism at back-end side needs to be reviewed and improved.


## Future work:
* #### The UI will be improved.
* #### The application is only using the useState react hook. I will try to use React Hooks in as many components as possible.

* #### MongoDB Schemas will be gathered into single table as it's a NoSQL best practice.
