[![CircleCI](https://circleci.com/gh/ozercevikaslan/mateMessage/tree/master.svg?style=svg)](https://circleci.com/gh/ozercevikaslan/mateMessage/tree/master)

# mateMessage 😎
## Messaging application built with GraphQL and React Native

## Tech Stack
* Node Graph API using Apollo Server with **Relay Definitions and Connections**.
* MongoDB
* React Native structured with RNN using Apollo Client.

#### Soon, there will be a video.

#### Soon, the integration test will be developed again.

## Instructions to start the server for development.
* cd ./backend && yarn
* Make sure Mongo server is running on localhost at default port.
* Run the server for development -> cd ./backend && yarn dev

## Instructions to start the server for production.
* cd ./backend && yarn
* Make sure you have pm2 installed as globally. (yarn add pm2 -g)
* Inspect the pm2Config.json file.
* Cluster setting is set default 0 which lets pm2 to create many instances as it can so, inspect the package.json to change. [pm2 Cluster Mode](http://pm2.keymetrics.io/docs/usage/cluster-mode/)
* Run the server for production -> yarn prod


## Instructions to start mateMessage on iOs.
* The app was built specifically for iOS environment. Note it down that it may have an error at android build.
* cd ./mateMessage && yarn
* cd ./ios && pod install
* Run mateMessage -> react-native run-ios


## Known Issues:
* There is no typing...
* Few rnn issues such as largeTitle goes away with a bit delay.

## Future work:
* Relay pagination will be implemented to work with MongoDB.
