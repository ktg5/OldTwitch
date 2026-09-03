declare const _exports: typeof TwitchGql;
declare class TwitchGql {
    constructor(clientid: string, oauth: any);
    clientid: string;
    oauth: string;
    integToken: {
        token: string;
        expiration: number;
    };
    defHeaders: {
        "client-id": string;
    };
    /**
     * **STILL WIP**
     *
     * Runs the integrity request on the GQL API. The token that gets returned is used for some requests and it'll be saved to the current Gql class.
     * @param {string} oauth - The OAuth token used for authentication. If not provided, the instance's OAuth token will be used.
     * @returns {Promise<Integ>}
     */
    getClientInteg(oauth: string): Promise<Integ>;
    /**
     * Fetches the current user information from the Twitch GraphQL API.
     *
     * @param {string} oauth - The OAuth token used for authentication. If not provided,
     *                         the instance's OAuth token will be used.
     * @returns {Promise<User>}
     */
    getCurrentUser(oauth: string): Promise<User>;
    /**
     * Fetches the current user's notifications.
     *
     * @param {string} oauth - The OAuth token used for authentication. If not provided,
     *                         the instance's OAuth token will be used.
     * @returns {Promise<Array>} A promise that resolves to the current user's notification data.
     *                            Logs an error if the OAuth token is invalid.
     */
    getUserNotifications(oauth: string): Promise<any[]>;
    /**
     * Returns an object with two values which include badge information of the current user in the current channel
     * @param {string} channel The Twitch channel to check for badges on
     * @param {string} oauth The OAuth token for user auth
     * @returns {Promise<{
     *      selectedBadge: Badge,
     *      availableBadges: Badge[]
     * }>}
     */
    getUserBadges(channel: string, oauth: string): Promise<{
        selectedBadge: Badge;
        availableBadges: Badge[];
    }>;
    /**
     * Set the user badge to the value in `badgeId`
     * @param {string} oauth The OAuth token for user auth
     * @param {string} badgeId Badge information can be found by using `Client.getUserBadges`
     * @param {number} badgeVersion Badge information can be found by using `Client.getUserBadges`
     * @returns {Promise<Badge>}
     */
    setUserBadge(oauth: string, badgeId: string, badgeVersion: number): Promise<Badge>;
    /**
     * Send a message to a channel
     * @param {string} oauth The OAuth token for user auth
     * @param {number} channelID The Twitch channel ID to send a message to
     * @param {string} message The Message In Question
     * @param {number} replyingTo The message ID that the user is replying to
     * @returns {Promise<ChatMessagePayload>}
     */
    sendMessage(oauth: string, channelID: number, message: string, replyingTo: number): Promise<ChatMessagePayload>;
    /**
     * Fetches the home page data from the Twitch GraphQL API.
     *
     * @param {string} [lang="en"] - The language in which to fetch the data. Defaults to `"en"`
     * @param {number} [streamsAmount] - Optional. The number of streams to fetch. Maximum is 10 within GQL. Defaults to 6 if not provided.
     * @param {number} [shelvesItemAmount] - Optional. The number of streams to fetch. Defaults to 12 if not provided.
     * @returns {Promise<HomePage>}
     */
    getHomePage(lang?: string, streamsAmount?: number, shelvesItemAmount?: number): Promise<HomePage>;
    /**
     * Fetches a list of streamers with zero viewers. This should be a feature on Twitch's main site, but fuck 'em--top streamers are more important to them.
     * This makes a call to my (ktg5's) own API hosted on my domain, working similarly to nobody.live, but in TypeScript
     * @param {number} [limit] - The limit of items to get. Defaults to 6.
     * @returns {Promise<Array<Object>>}
     */
    getZeroStreamers(limit?: number): Promise<Array<any>>;
    /**
     * Gets the directory index for the front page.
     * @param {string} oauth - Optional. The OAuth token for authentication to use for personal recommendations.
     * Can be left blank if the current GQL instance has a OAuth defined.
     * @param {number} [limit] - The limit of items to get. Defaults to 30.
     * @param {boolean} [byViewers] - If the returned data should be sorted by the amount of viewers; should be set to `true` if wanted to be.
     * @returns {Promise<GameEdge[]>}
     */
    getDirectoryIndex(oauth: string, limit?: number, byViewers?: boolean): Promise<GameEdge[]>;
    /**
     * Fetches recommended channels based on the current and past streamers.
     *
     * @param {string} oauth - Optional. The OAuth token for authentication to use for personal recommendations.
     * Can be left blank if the current GQL instance has a OAuth defined.
     * @param {Array} [CurrentPastStreamer] - Optional. An array containing the current and past channel names.
     * @returns {Promise<SideNavCategory[]>}
     */
    getSideNav(oauth: string, CurrentPastStreamer?: any[]): Promise<SideNavCategory[]>;
    /**
     * Fetches search **bar** results with the provided "string" value.
     *
     * @param {string} string - The query you'd like to search.
     * @returns {Promise<SearchSuggestion[]>}
     */
    getSearchBarData(string: string): Promise<SearchSuggestion[]>;
    /**
     * Fetches search results with the provided "string" value.
     *
     * @param {string} string - The query you'd like to search.
     * @returns {Promise<SearchData>}
     */
    getSearchData(string: string): Promise<SearchData>;
    /**
     * Fetches a channel's data from twitch.
     * @param {string} name - The name of the channel to fetch.
     * @returns {Promise<User>}
     */
    getChannel(name: string): Promise<User>;
    /**
     * Returns less information than `getChannel`, but still very useful
     * @param {string} name
     * @returns {Promise<User>}
     */
    getChannelSimple(name: string): Promise<User>;
    /**
     * Get VODs, highlights or clips from a channel.
     * @param {string} name Name of channel.
     * @param {"ARCHIVE" | "HIGHLIGHT" | "VIDEOS" | "CLIPS"} type The type of media to look for.
     * @param {number} [limit] The amount of items to return back. (Defaults to 30)
     * @param {"LAST_DAY" | "LAST_WEEK" | "LAST_MONTH" | "ALL_TIME"} [sort] This is mostly used for clips, but used to be for everything on a channels page.
     * @returns {Promise<VideoEdge[] | ClipEdge[]>}
     */
    getChannelMedia(name: string, type: "ARCHIVE" | "HIGHLIGHT" | "VIDEOS" | "CLIPS", limit?: number, sort?: "LAST_DAY" | "LAST_WEEK" | "LAST_MONTH" | "ALL_TIME"): Promise<VideoEdge[] | ClipEdge[]>;
    /**
     * Gets the list of emotes from a given channel.
     * @param {string} name - The name of the channel.
     * @returns {Promise<ChannelEmote[]>} A promise that resolves with an array of clips.
     */
    getChannelEmotes(name: string): Promise<ChannelEmote[]>;
    /**
     * Gets the image link for a channel's offline image
     * @param {string} name - The name of the channel.
     * @returns {Promise<String>}
     */
    getChannelOfflineImg(name: string): Promise<string>;
    /**
     * Gets the metadata of a given stream.
     * @param {string} name - The name of the channel.
     * @returns {Promise<StreamEdge | null>} A promise that resolves with the stream metadata if the stream is live, otherwise resolves to `null`.
     */
    getStreamMetadata(name: string): Promise<StreamEdge | null>;
    /**
     * Fetches the preview image URL of a stream for a given channel.
     *
     * @param {string} name - The name of the channel to fetch the stream preview for.
     * @returns {Promise<string|null>} A promise that resolves to the stream's preview image URL if the stream is live,
     *                                otherwise resolves to null if the stream is not live or an error occurs.
     * Logs an error if the channel name is invalid.
     */
    getStreamPreview(name: string): Promise<string | null>;
    /**
     * Checks to see if the streamer name provided is live or not.
     *
     * @param {string} name - The streamer name.
     * @returns {Promise<boolean>} A promise that resolves a boolean. (True... or False...)
     */
    getStreamStatus(name: string): Promise<boolean>;
    /**
     * Follows a stream by its ID.
     * @param {string} oauth - The user's OAuth token to use for the request.
     * Can be left blank if the current GQL instance has a OAuth defined.
     * @param {string} id - The ID of the stream to follow.
     * @param {boolean} disableNotifs - Whether to receive disableNotifs for the stream.
     * @returns {Promise<Object>} Returns a object of the "followUser" object, containing the user followed & possible errors.
     * Logs an error if the stream ID is invalid or if the disableNotifs arg is not a boolean.
     */
    followChannelId(oauth: string, id: string, disableNotifs: boolean): Promise<any>;
    /**
     * Unfollows a stream for a given OAuth token and stream ID.
     * @param {string} oauth - The user's OAuth token to use for the request.
     * Can be left blank if the current GQL instance has a OAuth defined.
     * @param {string} id - The ID of the stream to unfollow.
     * @returns {Promise<Object>} Returns a object of the "followUser" object, containing the user followed & possible errors.
     * Logs an error if the stream ID is invalid or if the OAuth token is invalid.
     */
    unfollowChannelId(oauth: string, id: string): Promise<any>;
    /**
     * Fetches the category information, streamers, videos and clips for a given category slug.
     * @param {string} slug - The slug of the category to fetch information for.
     * @param {{
     *  streamSort: 'RELEVANCE' | 'VIEWER_COUNT' | 'VIEWER_COUNT_ASC' | 'RECENT',
     *  vodSort: 'VIEWS' | 'TIME',
     *  clipSort: 'LAST_DAY' | 'LAST_WEEK' | 'LAST_MONTH' | 'ALL_TIME'
     *  tags: string[],
     *  languages: string[],
     *  filters: string[],
     *  limit: number,
     *  costreams: boolean
     * }} [args] - Optional. An object containing the following optional properties:
     * - `streamSort`: The sort type of the streamers. Defaults to `RELEVANCE`. Other values are `VIEWER_COUNT`, `VIEWER_COUNT_ASC`, and `RECENT`
     * - `vodSort`: The sort type of the videos and clips. Defaults to `VIEWS`. Other values are just `TIME`.
     * - `clipSort`: The sort type of the clips. Defaults to `LAST_WEEK`. Other values are `LAST_DAY`, `LAST_MONTH`, and `ALL_TIME`.
     * - `tags`: An array of strings containing the tags to filter the streamers by.
     * - `languages`: An array of strings containing the languages to filter the streamers by.
     * - `filters`: An array of strings containing the filters to apply on the streamers.
     * - `limit`: The number of streamers to fetch. Defaults to 100.
     * @returns {Promise<GameEdge>} A promise that resolves to an object containing the category information, streamers, videos and clips.
     * Logs an error if the slug is invalid.
     */
    getCategoryMedia(slug: string, args?: {
        streamSort: "RELEVANCE" | "VIEWER_COUNT" | "VIEWER_COUNT_ASC" | "RECENT";
        vodSort: "VIEWS" | "TIME";
        clipSort: "LAST_DAY" | "LAST_WEEK" | "LAST_MONTH" | "ALL_TIME";
        tags: string[];
        languages: string[];
        filters: string[];
        limit: number;
        costreams: boolean;
    }): Promise<GameEdge>;
    /**
     * Fetches the category information for a given slug.
     *
     * @param {string} slug - The slug of the category to fetch information for.
     * @returns {Promise<GameEdge>} A promise that resolves to the category information.
     * Logs an error if the slug is invalid.
     */
    getCategory(slug: string): Promise<GameEdge>;
    /**
     * Fetches streamers for a given tag.
     *
     * @param {string | <string[]>} tags - Either a list of tags or just a single tag.
     * @returns {Promise<StreamEdge[]>} - A list of objects with the streamers within the tags provided.
     * - Logs & returns an error if the tag is invalid.
     */
    getTagStreamers(tags: any): Promise<StreamEdge[]>;
    /**
     * Fetches VOD info from twitch given a VOD ID.
     * @param {string} id - The VOD ID.
     * @returns {Promise<VideoEdge>} - An object containing the VOD info, or an object with an errors property if an error occurred.
     */
    getVodInfo(id: string): Promise<VideoEdge>;
    /**
     * Fetches the comments for a given VOD. The comments are returned as an array of
     * objects, each containing the comment's ID, timestamp, body, and author's login.
     * @param {string} id - The ID of the VOD to fetch comments from
     * @returns {Promise<VideoComment[]>} - A promise that resolves to an array of comment objects
     */
    getVodMessages(id: string): Promise<VideoComment[]>;
    /**
     * @param {string} slug - The slug of the clip to fetch information for.
     * @returns {Promise<ClipEdge>} - A promise that resolves to an object containing the clip's information. The object will contain the following properties:
     */
    getClip(slug: string): Promise<ClipEdge>;
}
