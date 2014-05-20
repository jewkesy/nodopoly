Nodopoly
========

Online Monopoly game using NodeJS and MongoDB

##Prerequisites
- MongoDB 2.6
- NodeJS
- Express 4
- Jade
- socket.io

##Installation
Apply the dependencies
```
$ npm install
```

Create the initial MongoDB database and collection and insert the game board properties
```
$ mongoimport --db nodopoly --drop --collection gameBoard--file setup/gameBoard.json --jsonArray
```

##Configuration
```
$ cp config.json.example config.json
$ nano config.json
```
Apply the necessary configuration settings

##Run the application
```
$ npm start
```

##Play!
http://127.0.0.1:3000
