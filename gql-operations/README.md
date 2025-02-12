## from my understanding,

* all requests require a client id, which is either the user's id, or this: `kimne78kx3ncx6brgo4mv6wki5h1ko`
    * must be put in the headers as `client-id`
* requests that have data about the current user logged in require the "auth-token" that is located in the browser's cookies.
    * header: `authorization`
* there's a header called `x-device-id` that is required for some data? doesn't have to be valid, but can be found in cookies under `unique_id` or `unique_id_durable`
* a body is required to get the data you want, i've been making a list of all the `operationName`'s that i can find from gql requests under the `operations.json` file. test the bodies yourself and look for the data you want.
    * `src/html/src/ot-gql.js` uses some of the "important" operations, such as user info, streamer info, user's followed channels, etc. you can look at that file for examples and stuff.