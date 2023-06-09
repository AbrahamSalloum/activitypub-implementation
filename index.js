const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const https = require('https')
const crypto = require('crypto')
const url = require('url')

require('dotenv').config()
app.use(express.json({ strict: false, type: '*/*' }))
const INBOX = []

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

app.get('/inspect', async (req, res) => {
  
  let inbox = {}
  inbox.inbox = INBOX
  res.status(200).json(inbox)

})

app.get('/following/:userid/:page', async (req, res) => {

  if (req.params.page == 1) {
    following = {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://abrajam.com/following/b/1",
      "type": "OrderedCollectionPage",
      "totalItems": 2,

      "partOf": "https://abrajam.com/following/b",
      "orderedItems": [
        "https://mastodon.social/users/Gargron",
        "https://mastodon.archive.org/users/brewsterkahle"
      ]
    }
  }

  res.status(200).json(following)

})

app.get('/followers/:userid/:page', async (req, res) => {

  if (req.params.page == 1) {
    followers = {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://abrajam.com/followers/b/1",
      "type": "OrderedCollectionPage",
      "totalItems": 9,
      "partOf": "https://abrajam.com/followers/b",
      "orderedItems": [
        "https://pettingzoo.co/users/Cinnamonthecat",
        "https://mstdn.social/users/RollingStone"

      ]
  }
}

  res.status(200).json(followers)

})

app.get('/followers/:userid', async (req, res) => {

  followers =  {
    "@context": "https://www.w3.org/ns/activitystreams",
    "id": "https://abrajam.com/followers/b",
    "type": "OrderedCollection",
    "totalItems": 9,
    "first": "https://abrajam.com/followers/b/1"
}

  res.status(200).json(followers)

})

app.get('/following/:userid', async (req, res) => {

  following = {
    "@context": "https://www.w3.org/ns/activitystreams",
    "id": "https://abrajam.com/following/b",
    "type": "OrderedCollection",
    "totalItems": 12,
    "first": "https://abrajam.com/following/b/1"
  }

  res.status(200).json(following)

})

app.post('/inbox', VerifySignature, async (req, res) => {

  let item = req.body

  INBOX.push(item)
  console.log(INBOX)
  res.status(200).json({ status: "OK" })

})

app.post('/post', async (req, res) => {

  const data = req.body;

  try {

    post(data, "https://mastodon.social/inbox")
    res.status(200).send(`OK`)

  } catch (error) {
    console.log(error)
    res.status(500).send(`Sad at: ${error}`)
  }
  
})

function post(data, endpoint) {

  const digestHash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('base64');

  const urlinfo = new URL(endpoint)
  const date = (new Date()).toUTCString()
  const signed_string = `(request-target): post /inbox\nhost: ${urlinfo.hostname}\ndate: ${date}\ndigest: SHA-256=${digestHash}`

  const signer = crypto.createSign('sha256');
  signer.update(signed_string);
  signer.end();
  const signature = signer.sign(privateKey);
  const header = `keyId="https://abrajam.com/actor/abraham",headers="(request-target) host date digest",signature="${signature.toString('base64')}"`


  const options = {
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

  const req = https.request(options, (res) => {

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

function VerifySignature(req, res, next) {

  const data = req.body;
  const header = req.headers

  const signatureArray = header.signature.split(',')
  const signatureObject = {}
  for (signatureheaderItem of signatureArray) {
    signatureObject[signatureheaderItem.split("=")[0]] = signatureheaderItem.split("=")[1].replace(/^"(.*)"$/, '$1')
  }

  const actorFile = signatureObject['keyId']
  const signatureheaderKeys = signatureObject['headers']
  const signature = signatureObject['signature']

  const options = {
    headers: {
      'Accept': 'application/activity+json'
    },
  }

  https.get(actorFile, options, (resp) => {
    let actorFile = "";

    resp.on("data", chunk => {
      actorFile += chunk;
    });

    resp
      .on("end", () => {

        const publicKey = JSON.parse(actorFile)?.publicKey?.publicKeyPem
        if (!publicKey) return
        const comarision_array = []

        for (header_compare of signatureheaderKeys.split(' ')) {

          if (header_compare == '(request-target)') {
            comarision_array.push('(request-target): post /inbox')
          } else {
            comarision_array.push(`${header_compare}: ${header[header_compare]}`)
          }

        }

        const verifier = crypto.createVerify("sha256");
        const comparethis = comarision_array.join('\n')
        verifier.update(comparethis)
        const result = verifier.verify(publicKey, signature, 'base64');

        const dataHash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('base64');
        const digestMatch = `SHA-256=${dataHash}` == header['digest']
        if (result && digestMatch) {
          next()
        } else {
          res.status(401).send("signature does not match. ")
        }

      });
  })
    .on("error", err => {
      console.log("Error: " + err.message);
    });

}


const port = process.env.APPPORT;
const privateKey = process.env.PRIVATEKEY.replace(/\\n/g, '\n') || undefined;

if (!!privateKey == false) {
  console.error("private key must be specified in env")
  return
}

app.listen(port, () => console.log(`activitypub listening on port ${port}..."`))