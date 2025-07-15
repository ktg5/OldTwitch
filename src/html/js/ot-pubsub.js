// pubsub topics
const pubSubTopics = {
    "streamUpdate": "broadcast-settings-update"
};


// generate a nonce within twitch's format
function generateNonce(length = 30) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let nonce = '';
    for (let i = 0; i < length; i++) {
        nonce += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return nonce;
}


// main
const pubSubWs = 'wss://pubsub-edge.twitch.tv/v1';
class PubSub extends EventTarget {
    #socket = new WebSocket(pubSubWs);
    #nonce = generateNonce();
    userid;
    #eventTarget = new EventTarget();

    constructor(userid, topics) {
        // Init
        super();
        if (!userid || typeof userid !== "number") return console.error("ot-pubsub: \"userid\" isn't a integer.");
        this.userid = userid;


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
            }
        });

        // When we get info back from twitch
        this.#socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            var message;
            if (data.data && data.data.message) message = data.data.message;

            // If it's just a response, it's probaby just confirming we're in
            if (data.type == "RESPONSE" && data.error == '') return console.log('ot-pubsub: Got response back from PubSub with no errors.');
            else if (data.error && data.error != '') return console.error(`ot-pubusb: PubSub returned error on response:`, data.error);

            // Other events
            let eventName;
            switch (true) {
                case data.data.topic.startsWith(pubSubTopics.streamUpdate):
                    eventName = pubSubTopics.streamUpdate;
                break;
            
                default:
                    console.warn('ot-pubsub: Message from PubSub which does not have a event return action:', data.data);
                    // alert('ot-pubsub: check console for new data');
                break;
            }
            // Send it out if we found it
            if (eventName != null) {
                this.#emit(eventName, message)
            }
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