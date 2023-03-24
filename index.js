const express = require('express');
const app = express();
const helmet = require("helmet");
const fs = require('fs');
const path = require('path');
const https = require('https')
const crypto = require('crypto')
const url = require('url')

require('dotenv').config()
app.use(express.json())
app.use(helmet());



app.get('/.well-known/webfinger', async (req, res) => {
  
  try {

    fs.readFile('./.well-known/webfinger', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      res.status(200).json(JSON.parse(data));
    });

  } catch {
    res.status(500).send(`Sad at: ${Date.now()}`)
  }
})

app.get('/actor/:userid', async (req, res) => {

  try {

    fs.readFile(`./actor/${req.params.userid}`, 'utf8', (err, data) => {

      if (err) {
        console.error(err);
        return;
      }
      res.status(200).json(JSON.parse(data));
    });

  } catch {
    res.status(500).send(`Sad at: ${Date.now()}`)
  }
})

app.get('/assets/:asset([^/]*)*', async (req, res) => {

  try {
    filename = path.join(__dirname, `/assets/${req.params.asset}`)
    res.sendFile(filename)

  } catch (error) {
    res.status(500).send(`Sad at: ${error}`)
  }
})

app.get('/post', async (req, res) => {

  data = {
    "@context": "https://www.w3.org/ns/activitystreams",

    "id": `https://abrajam.com/post-${(new Date()).getTime()}`,
    "type": "Create",
    "actor": "https://abrajam.com/actor/abraham",

    "object": {
      "id": `https://abrajam.com/post-${(new Date()).getTime()}`,
      "type": "Note",
      "published": `${(new Date()).toUTCString()}`,
      "attributedTo": "https://abrajam.com/actor/abraham",
      "inReplyTo": "https://mastodon.social/@heycitizen/110076914025449350",
      "content": `<p>Hello world</p> - ${(new Date()).toUTCString()}`,
      "to": "https://www.w3.org/ns/activitystreams#Public"
    }
  }

  try {
    post(data, "https://mastodon.social/inbox")
    res.status(200).send(`OK`)

  } catch (error) {
    res.status(500).send(`Sad at: ${error}`)
  }
})


function post(data, endpoint) {

  digestHash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('base64');

  const urlinfo = new URL(endpoint)
  const date = (new Date()).toUTCString()
  const signed_string = `(request-target): post /inbox\nhost: ${urlinfo.hostname}\ndate: ${date}\ndigest: SHA-256=${digestHash}`
  
  const signer = crypto.createSign('sha256');
  signer.update(signed_string);
  signer.end();

  const signature = signer.sign(privateKey);
  const header = `keyId="https://abrajam.com/actor/abraham",headers="(request-target) host date digest",signature="${signature.toString('base64')}"`


  let options = {
    hostname: urlinfo.hostname,
    port: 443,
    path: urlinfo.pathname,
    method: 'POST',
    headers: {
      'Host': urlinfo.hostname,
      'Date': date,
      'Digest': `SHA-256=${digestHash}`,
      'Signature': header
    },
  }

  let req = https.request(options, (res) => {
     console.error("statusCode", res.statusCode)

    res.on('data', (d) => {
      console.log("data", d.toString())
    })
  })

  req.on('error', (error) => {
    console.error("error", error.toString())
  })

  req.write(JSON.stringify(data))
  req.end()

}


const port = process.env.APPPORT;
const privateKey = process.env.PRIVATEKEY.replace(/\\n/g, '\n') || undefined;

if(!!privateKey == false){
  console.error("private key must be specified in env")
  return
}

app.listen(port, () => console.log(`Mailer listening on port ${port}..."`))