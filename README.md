nodopoly
========

Online Monopoly game using NodeJS and MongoDB



##Notes

Create the initial MongoDB database and collection and insert the game board properties
```
$ mongoimport --db nodopoly  --drop --collection gameBoard  --file setup/gameBoard.json  --jsonArray
