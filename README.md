[![CircleCI](https://circleci.com/gh/ozer/mateMessage/tree/master.svg?style=svg)](https://circleci.com/gh/ozercevikaslan/mateMessage/tree/master)

# mateMessage 😎
## Messaging application built with GraphQL and React Native

## Tech Stack
* Node Graph API using Apollo Server with **Relay Definitions and Connections**.
* MongoDB
* React Native structured with RNN using Apollo Client.

## Highlights on the Backend
* `Relay` Node Definitions and Array Connections.
* MongoDB `Cursor` Based Pagination using `Relay` Array Connection Args.
* The usage of `dataLoader`.
* GraphQL Subscriptions.

## Highlights on the App
* Local Cache Management.
* Offline Message Sending and Sync when the app is back online(Without killing the app for now :) ).
* React & Apollo Hooks.
* Nice examples of React Native Navigation library.

#### Soon, there will be a video.

#### I focused mostly on making this app work and see how this tech stack dances in a harmony.
#### I'll try to add as many tests as when I have time for it.

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
* There is no `typing`. I wish I had started with `TypeScript`.
* Few rnn issues, some of them are open issues on the gitHub.

## Future work:
* Make `backend` dockerized so the rest api for auth, graphql and graph subscriptions will be three seperate node instances. I believe `this is the way` for it to be `scalable`.
* Obviously, polishing UI...
* UI for creating a group conversation.
