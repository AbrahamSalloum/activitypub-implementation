const express = require('express');
const app = express();
// const fs = require('fs');
const {createDbConnection} = require('./database');
const path = require('path');//
// const { https } = require('follow-redirects');
// const crypto = require('crypto')
const {getwebfinger, getactor, getasset, getinspect, getfollowingpage, getfollowerspage, getfollowers, getfollowing, postmessage, postinbox} = require('./routefunctions.js')
const  {VerifySignature, post} = require('./utils.js')
require('dotenv').config()
app.use(express.json({ strict: false, type: '*/*' }))



app.get('/.well-known/webfinger', getwebfinger)
app.get('/actor/:userid', getactor)
app.get('/assets/:asset([^/]*)*', getasset)
app.get('/inspect', getinspect)
app.get('/following/:userid/:page', getfollowingpage)
app.get('/followers/:userid/:page', getfollowerspage)
app.get('/followers/:userid', getfollowers)
app.get('/following/:userid', getfollowing)
app.post('/inbox', VerifySignature, postinbox)
app.post('/post', postmessage)



const port = process.env.APPPORT;
const privateKey = process.env.PRIVATEKEY.replace(/\\n/g, '\n') || undefined;

if (!!privateKey == false) {
  console.error("private key must be specified in env")
  return
}


//const db = createDbConnection('./activitypub.db')
app.listen(port, () => console.log(`activitypub listening on port ${port}..."`))