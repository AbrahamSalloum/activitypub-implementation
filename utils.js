const { https } = require('follow-redirects');
const crypto = require('crypto')
require('dotenv').config()
const axios = require('axios');

function VerifySignature(req, res, next) {
    const re = new RegExp(/^(.+?)="(.+?)"$/);

    const data = req.body;

    const header = req.headers

    const signatureArray = header.signature.split(',')
    const signatureObject = {}
    for (let signatureheaderItem of signatureArray) {

        let h = re.exec(signatureheaderItem)
        if (h) {
            signatureObject[h[1]] = h[2].replace(/^(.*)$/, "$1")

        }

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
                console.log(result, header['digest'] == `SHA-256=${dataHash}`)
                const digestMatch = `SHA-256=${dataHash}` == header['digest']
                if (result && digestMatch) {
                    next()
                } else {
                    console.log("signature does not match. ")
                    res.status(401).send("signature does not match. ")
                }

            });
    })
        .on("error", err => {
            console.log("Error: " + err.message);
        });

}

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


async function getdatafromurl(url){


    return axios.get(url, { 
    headers: {'Accept':'application/ld+json'}
    })


    
}



const privateKey = process.env.PRIVATEKEY.replace(/\\n/g, '\n') || undefined;
module.exports = { VerifySignature, post, getdatafromurl}

