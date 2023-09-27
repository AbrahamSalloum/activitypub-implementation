const { db, PrintAllStored, saveObject } = require('./database');
const path = require('path');
const { post, getdatafromurl} = require('./utils.js')
const fs = require('fs');

getwebfinger = async (req, res) => {

    try {

        fs.readFile('./.well-known/webfinger', 'utf8', (err, data) => {
            acct = req.query.acct
           
            if (err) {
                console.error(err);
                return;
            }
            res.status(200).json(JSON.parse(data));
        });

    } catch (err) {
        res.status(500).send(`${err} Sad at: ${Date.now()}`)
    }

}

getactor = async (req, res) => {

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

}

getasset = async (req, res) => {

    try {
        filename = path.join(__dirname, `/assets/${req.params.asset}`)
        res.sendFile(filename)

    } catch (error) {
        res.status(500).send(`Sad at: ${error}`)
    }

}

getinspect = async (req, res) => {

    PrintAllStored(db).then(function (rows) {
        console.log(rows)
        res.status(200).send(rows)
    })


}


getfollowspage = async(req, res) => {
    followslist = atob(req.params.page)
    try {
     let x = await getdatafromurl(followslist)
    
     res.status(200).json(x.data)
    } catch(err) {
     console.log(err)
    }
    
    return 
}


getfollowingpage = async (req, res) => {
    
    followerlist = atob(req.params.page)
    try {
     let x = await getdatafromurl(followerlist)
     
     res.status(200).json(x.data)
    } catch(err) {
     console.log(err)
    }
    
    return 
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



}

getfollowers = async (req, res) => {

   followerlist = atob(req.params.userid)
   try {
    let x = await getdatafromurl(followerlist)

    res.status(200).json(x.data)
   } catch(err) {
    console.log(err)
   }
    
    // followers = {
    //     "@context": "https://www.w3.org/ns/activitystreams",
    //     "id": "https://abrajam.com/followers/b",
    //     "type": "OrderedCollection",
    //     "totalItems": 9,
    //     "first": "https://abrajam.com/followers/b/1"
    // }

    

}

getfollowing = async (req, res) => {

    followslist = atob(req.params.userid)
    try {
     let x = await getdatafromurl(followslist)
     res.status(200).json(x.data)
    } catch(err) {
     console.log(err)
    }

    return

    following = {
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": "https://abrajam.com/following/b",
        "type": "OrderedCollection",
        "totalItems": 12,
        "first": "https://abrajam.com/following/b/1"
    }

    res.status(200).json(following)

}

postmessage = async (req, res) => {

    const data = req.body;

    try {

        post(data, "https://mastodon.social/inbox")
        res.status(200).send(`OK`)

    } catch (error) {
        console.log(error)
        res.status(500).send(`Sad at: ${error}`)
    }

}

postinbox = async (req, res) => {

    let object = req.body
    saveObject(db, object)

    PrintAllStored(db).then(function (rows) {
        console.log(rows)
        res.status(200).send(rows)
    })

}

module.exports = {
    getwebfinger,
    getactor,
    getasset,
    getinspect,
    getfollowingpage,
    getfollowspage,
    getfollowers,
    getfollowing,
    postmessage,
    postinbox
}