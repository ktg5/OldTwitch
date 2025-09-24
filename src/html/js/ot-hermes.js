// Topics
const HermesTopics = {
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


// Main
class Hermes extends EventTarget {
    /**
     * @type {WebSocket}
     */
    #socket;
    #eventTarget = new EventTarget();
    #userid;
    #topics;


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


    // Re-init websocket connection
    #reInit() {
        try {
            this.#socket.close();
        } catch {}
        this.#connect(true);
    }


    /**
     * Connect to all topics
     * @param {boolean} [notFirstInit] 
     */
    #connect(notFirstInit) {
        const anonId = "kimne78kx3ncx6brgo4mv6wki5h1ko";
        const hermesUrl = `wss://hermes.twitch.tv/v1?clientId=${anonId}`;
        this.#socket = new WebSocket(hermesUrl);


        // OPEN IT UP!!!!!!!!!!!!!!!!!!!
        this.#socket.addEventListener('open', () => {
            // Init topics
            if (this.#topics) this.#topics.forEach(topic => { this.addTopic(topic) });

            // When we get info back from Twitch
            this.#socket.addEventListener('message', (event) => {
                let message = null;
                const wsData = JSON.parse(event.data);
                // If it's just a keepalive, it's just confirming we're still here
                if (wsData.type == "welcome") return;
                if (wsData.type == "authenticateResponse") return;
                if (wsData.type == 'subscribeResponse') return;
                // return console.log('ot-hermes: Got topic-add (aka subscribeResponse) respnose: ', data.subscribeResponse)
                if (wsData.type == "keepalive") return;
                // return console.log('ot-hermes: Got "keepalive" response back from Twitch.');
                // On any errors
                if (wsData.error && wsData.error != '') return console.error(`ot-hermes: Hermes returned error on response:`, wsData.error);
                // Hermes wants us to use a new link.
                if (wsData.reconnect) {
                    console.log('ot-hermes: Got "reconnect" data. Making new connection...');
                    return this.#reInit();
                }


                // Get message data
                if (wsData.notification && wsData.notification.pubsub) {
                    // console.log("HERMES DEBUG :: RETURNED TYPE: ", JSON.parse(wsData.notification.pubsub).type);
                    message = JSON.parse(wsData.notification.pubsub);
                }
                // console.log('HERMES DEBUG :: RETURNED DATA: ', message);
                // Send it out if we found it
                if (message != null) this.#emit('data', message);
                else console.warn(`ot-hermes: Unknown data received: `, wsData);
            });


            // Send init to clients
            if (!notFirstInit) this.#emit('init');


            // Remake socket when 24 hours pass since creation
            setInterval(() => {
                console.log('ot-hermes: Making new connection to account for possible no data after specific time...');
                this.#reInit();
            }, 24 * 60 * 60 * 1000);
        });
    }


    /**
     * Creates a Twitch Hermes listener
     * @param {number} userid
     * @param {"all" | [string]} [topics]
     * @returns 
     */
    constructor(userid, topics) {
        super();


        // Checks
        if (!userid || typeof userid !== 'number') return console.error('"userid" is either not defined or not a number/int.');
        this.#userid = userid;

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
            else if (
                typeof topics !== "object"
                || topics.constructor !== [].constructor
            ) return console.error('"topics" is either undefined or is not a JSON list. You can find all the topics via the "Hermes.topics" object.')
        }
        this.#topics = topics;


        // Goto connect
        this.#connect();
    }


    // Listen to a new topic
    addTopic(topic) {
        if (
            !topic.startsWith('leaderboard-events-v1')
        ) topic = `${topic}.${this.#userid}`;

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
     * @param {string} event
     * @param {(data: EventPayloads[K]) => void} callback
     */
    on(event, callback) {
        this.#eventTarget.addEventListener(event, (e) => {
            callback(e.detail);
        });
    }
    
    /**
     * @param {string} event
     * @param {(data: EventPayloads[K]) => void} callback
     */
    off(event, callback) {
        this.#eventTarget.removeEventListener(event, callback);
    }


    /**
     * Close this session
     * @returns {void}
     */
    close() {
        this.#socket.close();
    }
}
