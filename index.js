const express = require('express');
const app = express();
const helmet = require("helmet");
const fs = require('fs');
const path = require('path');
const https = require('https')
const crypto = require('crypto')
const url = require('url')
const INBOX = []
require('dotenv').config()
var bodyParser = require('body-parser')

app.use(express.json({strict: false, type: '*/*'}))
//app.use(helmet());



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

app.post('/inbox', VerifySignature,  async (req, res) => { 
 
  let item = req.body
  
  INBOX.push(item)
  console.log(INBOX)
  res.status(200).json({status: "OK"})
})

app.post('/post', async (req, res) => {
  
  let data = req.body;   
   console.log("d", data)
   
  try {
     
    post(data, "https://mastodon.social/inbox")
     res.status(200).send(`OK`)

  } catch (error) {
    console.log(error)
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
     console.log("POST statusCode", res)

    res.on('data', (d) => {
      //  console.log("data", d.toString())
    })
  })

  req.on('error', (error) => {
    console.error("error", error.toString())
  })
  
  req.write(JSON.stringify(data))
  req.end()

}

function VerifySignature(req,  res, next){
  //curl --REQUEST GET --header 'Accept: application/activity+json' https://mastodon.social/users/user#main-key
  
    let data = req.body; 
    let header = req.headers


    headerArray = header.signature.split(',')
    headerObject = {}
    for(headerItem of headerArray){
      headerObject[headerItem.split("=")[0]] = headerItem.split("=")[1].replace(/^"(.*)"$/, '$1')
    }

    actorFile = headerObject['keyId']
    headerKeys = headerObject['headers']
    signature = headerObject['signature']
    
    let options = {
      headers: {
        'Accept': 'application/activity+json'
      },
    }

    https.get(actorFile, options, (resp) => {
    let dataG = "";

    resp.on("data", chunk => {
      dataG += chunk;
    });

    resp
    .on("end", () => {

      publicKey =   JSON.parse(dataG)?.publicKey?.publicKeyPem 
      if (!publicKey) return 
      comarision_array = []
      for(header_compare of headerKeys.split(' ')){

        if(header_compare == '(request-target)'){
          comarision_array.push('(request-target): post /inbox')
        } else {
          comarision_array.push(`${header_compare}: ${ header[header_compare]}`)
        }

      }
      
      verifier = crypto.createVerify("sha256");
      comparethis = comarision_array.join('\n')
      verifier.update(comparethis)
      result = verifier.verify(publicKey, signature, 'base64');
      
      dataHash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('base64');
      digestMatch = `SHA-256=${dataHash}` == header['digest']
      if(result && digestMatch){
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

if(!!privateKey == false){
  console.error("private key must be specified in env")
  return
}


app.listen(port, () => console.log(`Mailer listening on port ${port}..."`))