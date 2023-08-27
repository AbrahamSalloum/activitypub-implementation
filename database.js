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
    db.run(
        `INSERT INTO deletes (object) VALUES (?)`, [item], function(err){
          if(err){
            console.log(err)
          }
          else {
            console.log('OK')
        }
        })
  }

  function storePostObject(db, item){
    db.run(
        `INSERT INTO posts (object) VALUES (?)`, [item], function(err){
          if(err){
            console.log(err)
          }
          else {
            console.log('OK')
        }
        })
  }

  function storeFollowObject(db, item){
    db.run(
        `INSERT INTO follows (object) VALUES (?)`, [item], function(err){
          if(err){
            console.log(err)
          }
          else {
            console.log('OK')
        }
        })
  }

  function storeBlockObject(db, item){
    db.run(
        `INSERT INTO blocks (object) VALUES (?)`, [item], function(err){
          if(err){
            console.log(err)
          }
          else {
            console.log('OK')
        }
        })
  }

  function storeUndoObject(db, item){
    db.run(
        `INSERT INTO undoes (object) VALUES (?)`, [item], function(err){
          if(err){
            console.log(err)
          }
          else {
            console.log('OK')
        }
        })
  }




  function printEverything(db) {
    db.each(`SELECT * FROM deletes`, (error, row) => {
      if (error) {
        throw new Error(error.message);
      }
      console.log(row);
    });
  }
  
  function createTable(db){
    tables = [
    `CREATE TABLE deletes (ID INTEGER PRIMARY KEY AUTOINCREMENT, object   TEXT NOT NULL);`,
    `CREATE TABLE posts (ID INTEGER PRIMARY KEY AUTOINCREMENT, object   TEXT NOT NULL);`, 
    `CREATE TABLE follows (ID INTEGER PRIMARY KEY AUTOINCREMENT, object   TEXT NOT NULL);`, 
    `CREATE TABLE blocks (ID INTEGER PRIMARY KEY AUTOINCREMENT, object   TEXT NOT NULL);`,
    `CREATE TABLE undoes (ID INTEGER PRIMARY KEY AUTOINCREMENT, object   TEXT NOT NULL);`,
    ]
  
    tables.forEach(function(table){
        db.exec(table)
    })
    
  }

  module.exports = { createDbConnection, printEverything, saveObject }