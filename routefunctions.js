const { db, PrintAllStored, saveObject } = require('./database');
const path = require('path');
const { post } = require('./utils.js')

getwebfinger = async (req, res) => {

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

getfollowingpage = async (req, res) => {

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

}

getfollowerspage = async (req, res) => {

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

}

getfollowers = async (req, res) => {

    followers = {
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": "https://abrajam.com/followers/b",
        "type": "OrderedCollection",
        "totalItems": 9,
        "first": "https://abrajam.com/followers/b/1"
    }

    res.status(200).json(followers)

}

getfollowing = async (req, res) => {

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
    getfollowerspage,
    getfollowers,
    getfollowing,
    postmessage,
    postinbox
}