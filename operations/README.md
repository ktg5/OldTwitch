# [For GQL stuff, please go to the `gql` folder. :)](gql)


## so what is Hermes?

within Twitch's internal list of websockets & apis, Hermes is a websocket that is hosted under `wss://hermes.twitch.tv/v1`. which on the main twitch site, is used for getting PubSub events and more.

it's not meant to send information to the servers--that would be the GQL's usage--but instead basically be a event listener for when a PubSub topic is received for the selected channel.


## how do i listen for events?

either you can look at the `ot-hermes.js` file & use that to get information.

or... build something yourself & understand it more:
* create a `new WebSocket` and add a `clientId` search var into the Hermes WS url, aka `wss://hermes.twitch.tv/v1?clientId=[id]`.
* make sure to save the WebSocket to a const or var so that you can send the socket either more topics or add a message event listener.
    * if you don't want to make event listeners, you can watch it's sent & received messages within your browser's network tab.

to listen to topics, you'll have to send a message to the websocket. for the specific topic to listen to, you need the topic name & channel/user id somewhere in the topic string. for exmaple:
* most PubSub topics go by `[topic-name].[user-id]`. so if we were to listen to channel point rewards on someone's channel, it'd be `community-points-channel-v1.[user-id]`.
* there's some topics that have their own format, like the topic for when the chat leaderboard changes, which is `leaderboard-events-v1.sub-gifts-sent-[user-id]-WEEK`. why? don't know at all, but it makes for a kinda confusing system sometimes.
* **each topic returns data differently.** recommend just returning the `Message.notification` stringed JSON object.
* some topics can also return different types, like the `raid` topic, which returns `raid_update_v2` & `raid_cancel_v2`. or predications, which return `event-created` & `event-updated`.

here's also some message types you might see:
* `keepalive` - basically a heartbeat--making sure the websocket is still connected
* `subscribeResponse` - check if the subscribe message went through under the message's data via `Message.subscribeResponse.result`. if the result returns `ok`, that means it's good. else, you messed up.
* `notification` - you got data back from Twitch! check the data under `Message.notification` & make sure to parse the stringed JSON object.


## here's some example stuff in JS:

```js
const socket = new WebSocket(`wss://hermes.twitch.tv/v1?clientId=[id]`);

// Have to wait for the socket to be open before sending a message
socket.addEventListener('open', () => {
    // Init message
    const message = {
        type: "subscribe", // "subscribe" to a topic
        id: "parent-reward-redeem", // this can be anything
        subscribe: {
            id: "node-reward-redeem", // this too. unsure if this & the parent id can be the same? probably can, but i'd just set 'em to two different ids
            type: "pubsub", // what socket or service we want Hermes to message
            pubsub: {
                topic: "community-points-channel-v1.[user-id]" // topics are explained above
            }
        },
        timestamp: (new Date()).toISOString()
    }

    // Send message to socket
    this.#socket.send(JSON.stringify(message));
});
```


## [recommended page for understanding twitch (inspect.cool)](https://inspect.cool/2018/08/31/twitch/)