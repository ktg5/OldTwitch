## from my understanding,

* all requests require a client id, which is either the user's id, or this: `kimne78kx3ncx6brgo4mv6wki5h1ko`
    * must be put in the headers as `client-id`
* some requests such as following (and possibly more but i haven't checked) require a `client-integrity` header. these integrity tokens expire every 13 hours or when a token is used.
* requests that have data about the current user logged in require the `auth-token` that is located in the browser's cookies.
    * header: `authorization`
* a body is required to get the data you want, i've been making a list of all the `operationName`'s that i can find from gql requests under the `operations.json` file. test the bodies yourself and look for the data you want.
    * `src/html/js/ot-gql.js` uses some of the "important" operations, such as streamer info, recommended channels, home page stuff, etc. you can look at that file for examples and stuff.

## optional stuffs
* there's a header called `x-device-id` that is required for some "personal" data for the api to return. doesn't have to be valid, but it can be found in the user's cookies under `unique_id` or `unique_id_durable`
* some operations can use the `cursor` value. when decoded from b64 (base-64), it will return a JSON object. i did try to see what gets changed each request that includes this `cursor` value, but i keep getting the following:
```json
"errors": [
    {
        "message": "failed integrity check",
        "path": [
            "game",
            "streams"
        ]
    }
],
```
of course in this example i was trying to get streams from a specific game category, but whatever this thing is, it would be really cool to crack & use for the OldTwitch project.

## [recommended page for understanding twitch (inspect.cool)](https://inspect.cool/2018/08/31/twitch/)