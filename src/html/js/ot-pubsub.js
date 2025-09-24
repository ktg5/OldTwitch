// PubSub Topics
const PubSubTopics = {
    streamUpdate: "broadcast-settings-update",
    rewardRedeem: "community-points-channel-v1",
    streamChat: "stream-chat-room-v1",
    charityDonation: 'charity-campaign-donation-events-v1',
    videoPlaybackId: 'video-playback-by-id',
    pinnedMsg: 'pinned-chat-updates-v1',
    predication: 'predictions-channel-v1',
    sharedChat: 'shared-chat-channel-v1',
    raid: 'raid', 
    creatorGoals: 'creator-goals-events-v1',
    giftSub: 'channel-sub-gifts-v1',
    shoutout: 'shoutout',
    requestToJoin: 'request-to-join-channel-v1',
    hypeTrain: 'hype-train-events-v2',
    channelBounty: 'channel-bounty-board-events.cta',
    poll: 'polls', 
    guestStarChannel: 'guest-star-channel-v1'
}


// main
const pubSubWs = 'wss://pubsub-edge.twitch.tv/v1';
class PubSub extends EventTarget {
    #socket = new WebSocket(pubSubWs);
    #nonce = this.#generateNonce();
    #eventTarget = new EventTarget();
    userid; pingInterval;


    // generate a nonce within twitch's format
    #generateNonce(length = 30) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let nonce = '';
        for (let i = 0; i < length; i++) {
            nonce += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return nonce;
    }


    constructor(userid = 0, topics) {
        // Init
        super();
        if (!userid || typeof userid !== "number") return console.error("ot-pubsub: \"userid\" isn't a integer.");
        this.userid = userid;


        // Get all PubSubTopics to put em into userTopics
        const tempTopics = [];
        for (const key in PubSubTopics) {
            if (Object.hasOwnProperty.call(PubSubTopics, key)) {
                const element = PubSubTopics[key];
                
                switch (typeof element) {
                    case "function":
                        tempTopics.push(element(userid));
                    break;

                    case 'string':
                        tempTopics.push(element);
                    break;
                }
            }
        }
        this.userTopics = tempTopics;
        // Checks
        if (topics) {
            if (topics == 'all') topics = tempTopics;
            else if (typeof topics !== "object" || topics.constructor !== [].constructor) return console.error('"topics" is either not defined or is not a JSON list. You can find all the topics via the "Hermes.topics" object.')
        }


        // OPEN IT UP!!!!!!!!!!!!!!!!!!!
        this.#socket.addEventListener('open', () => {
            if (topics && typeof topics == "object" && topics.constructor == [].constructor) {
                const userTopics = [];
                topics.forEach(topic => {
                    userTopics.push(`${topic}.${this.userid}`);
                });

                const message = {
                    type: 'LISTEN',
                    nonce: this.#nonce,
                    data: {
                        topics: userTopics
                    }
                };
    
                this.#socket.send(JSON.stringify(message));


                // Send ping every minute so that we in there
                this.pingInterval = setInterval(() => {
                    this.#socket.send(JSON.stringify({ type: "PING" }));
                }, 60 * 1000);
            }
        });

        // When we get info back from twitch
        this.#socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            var message;
            if (data.data && data.data.message) message = data.data.message;

            // If it's just a response, it's probaby just confirming we're in
            if (data.type == "PONG") message = JSON.stringify(data);
            if (data.type == "RESPONSE" && data.error == '') return console.log('ot-pubsub: Got response back from PubSub with no errors.');
            else if (data.error && data.error != '') return console.error(`ot-pubusb: PubSub returned error on response:`, data.error);

            // Emit out to the event listener(s)
            this.#emit("data", message);
        });
        
        this.#socket.addEventListener('close', () => {
            console.log('ot-pubsub: Disconnected from Twitch PubSub.');
        });
    }


    #emit(event, data) {
        // Emit to any client listening to the "event" via this.on
        const customEvent = new CustomEvent(event, {
            detail: data
        });
        this.#eventTarget.dispatchEvent(customEvent);
    }

    on(event, callback) {
        this.#eventTarget.addEventListener(event, (e) => {
            callback(JSON.parse(e.detail));
        });
    }
    
    off(event, callback) {
        this.#eventTarget.removeEventListener(event, callback);
    }
}
