const fs = require('fs');
const sqlite3 = require("sqlite3").verbose();

 function createDbConnection(filepath) {
    if (fs.existsSync(filepath)) {
      console.log("Connection with SQLite has been established");
      return new sqlite3.Database(filepath);
    } else {
      const db = new sqlite3.Database(filepath, (error) => {
        if (error) {
          return console.error(error.message);
        }
        createTable(db);
      });
      console.log("Connection with SQLite has been established");
      return db;
    }
  }

  function saveObject(db, object) {
    let type = object.type.toUpperCase()
    let item = JSON.stringify(object)

    if(type.toUpperCase() == "DELETE"){
        storeDeleteObject(db, item)
        db.each('SELECT * FROM deletes', function(err, row) {
            console.log(err, row)
        })
    }

    if(type.toUpperCase() == "POST"){ 
        storePostObject(db, item)
    }

    if(type.toUpperCase() == "FOLLOW"){ 
        storeFollowObject(db, item)
    }   

    if(type.toUpperCase() == "BLOCK"){ 
        storeBlockObject(db, item)
    } 

    if(type.toUpperCase() == "UNDO"){ 
        storeUndoObject(db, item)
    } 
    
    



  }

  function storeDeleteObject(db, item){
    db.each(`INSERT INTO deletes (object) VALUES (?)`, [item], callbk)
  }

  function storePostObject(db, item){
    db.each(`INSERT INTO posts (object) VALUES (?)`, [item], callbk)
  }

  function storeFollowObject(db, item){
    db.each(`INSERT INTO follows (object) VALUES (?)`, [item], callbk)
  }

  function storeBlockObject(db, item){
    db.each(`INSERT INTO blocks (object) VALUES (?)`, [item], callbk)
  }

  function storeUndoObject(db, item){
    db.each(`INSERT INTO undoes (object) VALUES (?)`, [item], callbk)
  }

  function callbk(err, row) {
    console.log(err, row)
  }





  
  function createTable(db){
    tables = [
    `CREATE TABLE deletes (ID INTEGER PRIMARY KEY AUTOINCREMENT, object TEXT NOT NULL);`,
    `CREATE TABLE posts (ID INTEGER PRIMARY KEY AUTOINCREMENT, object TEXT NOT NULL);`, 
    `CREATE TABLE follows (ID INTEGER PRIMARY KEY AUTOINCREMENT, object TEXT NOT NULL);`, 
    `CREATE TABLE blocks (ID INTEGER PRIMARY KEY AUTOINCREMENT, object TEXT NOT NULL);`,
    `CREATE TABLE undoes (ID INTEGER PRIMARY KEY AUTOINCREMENT, object TEXT NOT NULL);`,
    ]
  
    tables.forEach(function(table){
        db.exec(table)
    })
    
  }

  module.exports = { createDbConnection, saveObject }