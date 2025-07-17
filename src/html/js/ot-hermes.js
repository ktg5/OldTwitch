// Topics
const HermesTopics = {
    streamUpdate: "broadcast-settings-update", // has event listener
    rewardRedeem: "community-points-channel-v1", // has event listener
    streamChat: "stream-chat-room-v1",
    charityDonation: 'charity-campaign-donation-events-v1',
    videoPlaybackId: 'video-playback-by-id',
    pinnedMsg: 'pinned-chat-updates-v1',
    predication: 'predictions-channel-v1', // has event listener
    sharedChat: 'shared-chat-channel-v1',
    raid: 'raid', // has event listener(s)
    creatorGoals: 'creator-goals-events-v1',
    giftSub: 'channel-sub-gifts-v1',
    shoutout: 'shoutout',
    requestToJoin: 'request-to-join-channel-v1',
    hypeTrain: 'hype-train-events-v2',
    channelBounty: 'channel-bounty-board-events.cta',
    poll: 'polls', // has event listener
    guestStarChannel: 'guest-star-channel-v1',
    leaderBoardBits: (id) => {
        return `leaderboard-events-v1.bits-usage-by-channel-v1-${id}-WEEK`;
    },
    leaderBoardGiftSubs: (id) => {
        return `leaderboard-events-v1.sub-gifts-sent-${id}-WEEK`;
    },
    leaderBoardClips: (id) => {
        return `leaderboard-events-v1.clips-${id}`;
    }
}


// Event type
/**
 * @typedef {"stream_down" | "stream_info_update" | "viewcount" | "reward_redeem" |
 *           "clips_leaderboard_update" | "poll" | "event_created" | "event_updated" |
 *           "raid_update" | "raid_cancel" | "hype_train_update" | "hype_train_lvl_up" |
 *           "sub_gifts_sent" | "bits"} HermesEvents
 */


// Main
const hermesUrl = `wss://hermes.twitch.tv/v1?clientId=${anonId}`; // anonId defined at the top of ot-gql.js
class Hermes extends EventTarget {
    #socket = new WebSocket(hermesUrl);
    #eventTarget = new EventTarget();
    userid;
    userTopics;


    #generateId(length = 22) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        let id = '';
        for (let i = 0; i < length; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    #generateTimestamp() {
        let time = new Date();
        return time.toISOString();
    }

    #handleEventName(message) {
        let eventName = null;

        if (!message.type) {
            if (message.event.domain) message.type = message.event.domain;
        }

        /* 
         * ##############################
         * UPDATE THE FUCKING TYPEDEF WHEN ADDING MORE IN HERE FFS
         * I KNOW YOU'LL FUCKING FORGET IT & YOU'LL BE LIKE, "where's my auto-fill????", YOU DUMBASS
         * ##############################
         */
        switch (message.type) {
            case "stream-down":
                eventName = "stream_down";
            break;
            case "broadcast_settings_update":
                eventName = 'stream_info_update';
            break;
            case "viewcount":
                eventName = message.type;
            break;

            case "reward-redeemed":
                eventName = 'reward_redeem';
            break;

            case "clips-leaderboard-update":
                eventName = "clips_leaderboard_update";
            break;

            case "POLL_CREATE":
                eventName = 'poll';
            break;

            case "event-created":
                eventName = 'event_created';
            break;
            case 'event-updated':
                eventName = 'event_updated';
            break;

            case "raid_update_v2":
                eventName = 'raid_update';
            break;
            case "raid_cancel_v2":
                eventName = 'raid_cancel';
            break;

            case "hype-train-progression":
                eventName = 'hype_train_update';
            break;
            case "hype-train-level-up":
                eventName = 'hype_train_lvl_up';
            break;

            case "sub-gifts-sent":
                eventName = 'sub_gifts_sent'
            break;

            case "bits-usage-by-channel-v1":
                eventName = 'bits';
            break;
        

            default:
                console.log('ot-hermes: Got a notification message that doesn\'t have a [custom] event name (yet), using the type returned: ', {
                    type: message.type,
                    message: message
                });
                eventName = message.type;
            break;
        }

        return eventName;
    }



    constructor(userid, topics) {
        super();


        // Checks
        if (!userid || typeof userid !== 'number') return console.error('"userid" is either not defined or not a number/int.');
        this.userid = userid;

        // Get all HermesTopics to put em into userTopics
        const tempTopics = [];
        for (const key in HermesTopics) {
            if (Object.hasOwnProperty.call(HermesTopics, key)) {
                const element = HermesTopics[key];
                
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
            // Auth user with socket if oauth is found
            if (oauth !== null) {
                const message = {
                    id: "ot-" + this.#generateId(),
                    type: "authenticate",
                    authenticate: {
                        token: oauth
                    },
                    timestamp: this.#generateTimestamp()
                };

                this.#socket.send(JSON.stringify(message));
            }


            // Init topics
            if (topics) topics.forEach(topic => { this.addTopic(topic) });


            // When we get info back from Twitch
            this.#socket.addEventListener('message', (event) => {
                const data = JSON.parse(event.data);
                // If it's just a keepalive, it's just confirming we're still here
                if (data.type == "welcome") return console.log('ot-hermes: Hermes said, "welcome"!');
                if (data.type == "authenticateResponse") return console.log('ot-hermes: Authenticate user to Hermes complete!!');
                if (data.type == "keepalive") return;
                // return console.log('ot-hermes: Got "keepalive" response back from Twitch.');
                if (data.type == 'subscribeResponse') return;
                // return console.log('ot-hermes: Got topic-add (aka subscribeResponse) respnose: ', data.subscribeResponse)
                // On any errors
                if (data.error && data.error != '') return console.error(`ot-hermes: Hermes returned error on response:`, data.error);


                // Get message data
                var message = JSON.parse(data.notification.pubsub);

                // Events known types
                let eventName = this.#handleEventName(message);

                message.eventName = eventName;
                // Send it out if we found it
                if (eventName != null) {
                    // console.log('HERMES DEBUG :: RETURNED DATA: ', message);
                    this.#emit(eventName, message);
                    this.#emit('all', message);
                }
            });
        });
    }


    // Listen to a new topic
    addTopic(topic) {
        if (
            !topic.startsWith('leaderboard-events-v1')
        ) topic = `${topic}.${this.userid}`;

        const message = {
            type: "subscribe",
            id: "ot-parent-" + this.#generateId(),
            subscribe: {
                id: "ot-" + this.#generateId(),
                type: "pubsub",
                pubsub: {
                    topic: topic
                }
            },
            timestamp: this.#generateTimestamp()
        }

        this.#socket.send(JSON.stringify(message));
    }


    // Send event
    #emit(event, data) {
        // Emit to any client listening to the "event" via this.on
        const customEvent = new CustomEvent(event, {
            detail: data
        });
        this.#eventTarget.dispatchEvent(customEvent);
    }

    // On event
    /**
     * @template {HermesEvents} K
     * @param {K} event
     * @param {(data: EventPayloads[K]) => void} callback
     */
    on(event, callback) {
        this.#eventTarget.addEventListener(event, (e) => {
            callback(e.detail);
        });
    }
    
    // Disable event
    off(event, callback) {
        this.#eventTarget.removeEventListener(event, callback);
    }
}