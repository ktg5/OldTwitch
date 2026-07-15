declare class TwitchHermes extends EventTarget {
    /**
     * Creates a Twitch TwitchHermes listener
     * @param {number} userid
     * @param {"all" | [string]} [topics]
     * @returns
     */
    constructor(userid: number, topics?: "all" | [string]);
    userTopics: any[];
    addTopic(topic: any): void;
    /**
     * @param {string} event
     * @param {(data: EventPayloads[K]) => void} callback
     */
    on(event: string, callback: (data: EventPayloads[K]) => void): void;
    /**
     * @param {string} event
     * @param {(data: EventPayloads[K]) => void} callback
     */
    off(event: string, callback: (data: EventPayloads[K]) => void): void;
    /**
     * Close this session
     * @returns {void}
     */
    close(): void;
    #private;
}
