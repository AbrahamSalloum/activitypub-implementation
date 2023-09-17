
function createFollowRequest(info) {
  return `
    {
        "@context" : "https://www.w3.org/ns/activitystreams",
        "id" : "https://abrajam.com/follow-${id}",
        "type" : "Follow",
        "actor": "https://abrajam.com/actor/abraham",
        "object" : ${info.followobject}
      }   
    `
}


function createAccept(info) {
  return `{
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": "https://abrajam.com/reject/follows/${id}",
        "type": "Reject",
        "actor": "https://abrajam.com/actor/abraham",
        "object": ${info.acceptedobject}
      }`
}

function createLike(info) {
  return `{
        "@context": "https://www.w3.org/ns/activitystreams",
        "summary": "user liked this",
        "type": "Like",
        "actor": "https://abrajam.com/actor/abraham",
        "object": ${info.likedobject}
      }`
}

function createDelete(info) {
  return `
    {
        "@context": "https://www.w3.org/ns/activitystreams",
        "summary": "user deleted this",
        "type": "Delete",
        "actor": "https://abrajam.com/actor/abraham",
        "object": ${info.likedobject},

      }`
}

function createNote(info) {
  return `{
        "@context": "https://www.w3.org/ns/activitystreams",
        "summary": "Sally created a note",
        "type": "Create",
        "actor": "https://abrajam.com/actor/abraham",,
        "object": {
          "type": "Note",
          "name": "A Note",
          "content": ${info.notetext},
       
        }
      }`
}

function createInReplyTo(info) {
  return `{
        "@context": "https://www.w3.org/ns/activitystreams",
        "summary": "Sally created a note",
        "type": "Create",
        "actor": "https://abrajam.com/actor/abraham",,
        "object": {
          "type": "Note",
          "name": "A Simple Note",
          "content": "This is a simple note",
          "inReplyTo": ${info.inReplyTo}
        }
      }`
}

module.exports = { createFollowRequest, createAccept, createLike, createDelete, createNote, createInReplyTo }