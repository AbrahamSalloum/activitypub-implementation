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

app.get('/inspect', VerifySignature, async (req, res) => {
  let inbox = {}
  inbox.inbox = INBOX
  res.status(200).json(inbox)
})

app.post('/inbox', async(req, res) => {
  let item = req.body
  INBOX.push(item)
  res.status(200).json({status: "OK"})
})

app.post('/post', async (req, res) => {

  try {
    post(data, "https://mastodon.social/inbox")
    res.status(200).send(`OK`)

  } catch (error) {
    res.status(500).send(`Sad at: ${error}`)
  }
})


function post(data, endpoint) {

  digestHash = crypto.createHash('sha256').update(JSON.stringify(dataobject)).digest('base64');

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

  options = {
    hostname: 'mastodon.social',
    port: 443,
    path: '/inbox',
    method: 'POST',
    headers: {
      Host: 'mastodon.social',
      Date: 'Sat, 25 Mar 2023 03:52:55 GMT',
      Digest: 'SHA-256=24gIolZhDcU6hrltYm/BFmZv4/0oMW8Nmf35a2tvWeM=',
      Signature: 'keyId="https://abrajam.com/actor/abraham",headers="(request-target) host date digest",signature="tB1sf0DASaG0qIOItvFBhQURlRmFL0trN22TwxaZyQ97mmuLBsTlWIoErzzvckeQlut758ZzWt05FZUyEfLgBKXXhrZl/LpGxQT6pR0uPdLr8rBlmsE8Fn4UyafSaLqoFvZalvIUfobLSOy9nQkBqjaO3HLlg+B6p40iwnfsDBaO2bcQwbzABjpFyh6DgA+uEQwBjvIFGuGwIdrd3GFGCSGH3TpFg3k8mxRh8rwD+LhgzHsgfJf6dDX9Xnz4TNecFTqEEbY/8LEtjMv6J8pGPrL2i9y2wXwpDHlqRvuQL6yh7DFMyT6yMDnfG1FURNFrghBXkpWEIaVDWj9aubfB6Q=="'
    }
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

  req.write(JSON.stringify(dataobject))
  req.end()

}

function VerifySignature(req,  res, next){

    header = {
      hostname: 'mastodon.social',
      port: 443,
      path: '/inbox',
      method: 'POST',
      headers: {
        Host: 'mastodon.social',
        Date: 'Sat, 25 Mar 2023 03:52:55 GMT',
        Digest: 'SHA-256=24gIolZhDcU6hrltYm/BFmZv4/0oMW8Nmf35a2tvWeM=',
        Signature: 'keyId="https://abrajam.com/actor/abraham",headers="(request-target) host date digest",signature="tB1sf0DASaG0qIOItvFBhQURlRmFL0trN22TwxaZyQ97mmuLBsTlWIoErzzvckeQlut758ZzWt05FZUyEfLgBKXXhrZl/LpGxQT6pR0uPdLr8rBlmsE8Fn4UyafSaLqoFvZalvIUfobLSOy9nQkBqjaO3HLlg+B6p40iwnfsDBaO2bcQwbzABjpFyh6DgA+uEQwBjvIFGuGwIdrd3GFGCSGH3TpFg3k8mxRh8rwD+LhgzHsgfJf6dDX9Xnz4TNecFTqEEbY/8LEtjMv6J8pGPrL2i9y2wXwpDHlqRvuQL6yh7DFMyT6yMDnfG1FURNFrghBXkpWEIaVDWj9aubfB6Q=="'
      }
    }


    headerArray = header.headers.Signature.split(',')
    headerObject = {}
    for(headerItem of headerArray){
      headerObject[headerItem.split("=")[0]] = headerItem.split("=")[1].replace(/^"(.*)"$/, '$1')
    }

    actorFile = headerObject['keyId']
    headerKeys = headerObject['headers']
    signature = headerObject['signature']

    https.get(actorFile, (resp) => {
    let data = "";

    // A chunk of data has been recieved.
    resp.on("data", chunk => {
      data += chunk;
    });

    resp
    .on("end", () => {

      publicKey =   JSON.parse(data).publicKey.publicKeyPem 
      comarision_array = []
      for(header_compare of headerKeys.split(' ')){

        if(header_compare == '(request-target)'){
          comarision_array.push('(request-target): post /inbox')
        } else {
          comarision_array.push(`${header_compare}: ${ header.headers[header_compare.replace(/(^\w|\s\w)/g, m => m.toUpperCase())]}`)
        }

      }

      verifier = crypto.createVerify("sha256");
      verifier.update(comarision_array.join('\n'))
      result = verifier.verify(publicKey, signature, 'base64');
      dataHash = crypto.createHash('sha256').update(JSON.stringify(dataobject)).digest('base64');
      digestMatch = `SHA-256=${dataHash}` == header.headers['Digest']
      if(result && digestMatch){
        next()
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

//(new Date()).getTime()
dataobject = {
  "@context": "https://www.w3.org/ns/activitystreams",

  "id": `https://abrajam.com/post-${'1'}`,
  "type": "Create",
  "actor": "https://abrajam.com/actor/abraham",

  "object": {
    "id": `${'1'}`,
    "type": "Note",
    "published": `${'1'}`,
    "attributedTo": "https://abrajam.com/actor/abraham",
    "inReplyTo": "https://mastodon.social/@heycitizen/110076914025449350",
    "content": `<p>Hello world</p> - -${'1'}`,
    "to": "https://www.w3.org/ns/activitystreams#Public"
  }
}



app.listen(port, () => console.log(`Mailer listening on port ${port}..."`))