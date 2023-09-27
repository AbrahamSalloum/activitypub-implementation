const express = require('express');
const app = express();
const { getwebfinger, getactor, getasset, getinspect, getfollowingpage, getfollowspage, getfollowers, getfollowing, postmessage, postinbox } = require('./routefunctions.js')
const { VerifySignature } = require('./utils.js')
require('dotenv').config()
app.use(express.json({ strict: false, type: '*/*' }))


app.get('/.well-known/webfinger', getwebfinger)
app.get('/actor/:userid', getactor)
app.get('/assets/:asset([^/]*)*', getasset)
app.get('/inspect', getinspect)

app.get('/followerslist/:page', getfollowingpage)
app.get('/followers/:userid', getfollowers)

app.get('/following/:userid', getfollowing)
app.get('/followinglist/:page', getfollowspage)


app.post('/inbox', VerifySignature, postinbox)
app.post('/post', postmessage)


const port = process.env.APPPORT;
const privateKey = process.env.PRIVATEKEY.replace(/\\n/g, '\n') || undefined;

if (!!privateKey == false) {
  console.error("private key must be specified in env")
  return
}

app.listen(port, () => console.log(`activitypub listening on port ${port}..."`))