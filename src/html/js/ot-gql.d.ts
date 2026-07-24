declare const _exports: typeof TwitchGql;
declare class TwitchGql {
    constructor(clientid: string, oauth: any);
    clientid: string;
    oauth: string;
    integToken: {
        token: string;
        expiration: number;
    };
    /**
     * **STILL WIP**
     *
     * Runs the integrity request on the GQL API. The token that gets returned is used for some requests and it'll be saved to the current Gql class.
     * @param {string} oauth - The OAuth token used for authentication. If not provided, the instance's OAuth token will be used.
     * @returns {Promise<Object>} A promise that resolves to the integrity check data.
     *                            Logs an error if the OAuth token is invalid.
     */
    getClientInteg(oauth: string): Promise<any>;
    /**
     * Fetches the current user information from the Twitch GraphQL API.
     *
     * @param {string} oauth - The OAuth token used for authentication. If not provided,
     *                         the instance's OAuth token will be used.
     * @returns {Promise<Object>} A promise that resolves to the current user data.
     *                            Logs an error if the OAuth token is invalid.
     */
    getCurrentUser(oauth: string): Promise<any>;
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
     * @returns {Promise<Object>} Returns `selectedBadge`--current user badge--& `availableBadges`--all badges that the user can apply
     */
    getUserBadges(oauth: string, channel: string): Promise<any>;
    /**
     * Set the user badge to the value in `badgeId`
     * @param {string} oauth The OAuth token for user auth
     * @param {string} badgeId Badge information can be found by using `Client.getUserBadges`
     * @param {number} badgeVersion Badge information can be found by using `Client.getUserBadges`
     * @returns {Promise<Object>} Returns the `selectedBadge` object, aka the badge selected
     */
    setUserBadge(oauth: string, badgeId: string, badgeVersion: number): Promise<any>;
    /**
     * Send a message to a channel
     * @param {string} oauth The OAuth token for user auth
     * @param {number} channelID The Twitch channel ID to send a message to
     * @param {string} message The Message In Question
     * @param {number} replyingTo The message ID that the user is replying to
     * @returns {Promise<Object>} Returns `sendChatMessage`
     */
    sendMessage(oauth: string, channelID: number, message: string, replyingTo: number): Promise<any>;
    /**
     * Fetches the home page data from the Twitch GraphQL API.
     *
     * @param {string} [lang="en"] - The language in which to fetch the data. Defaults to `"en"`
     * @param {number} [streamsAmount] - Optional. The number of streams to fetch. Maximum is 10 within GQL. Defaults to 6 if not provided.
     * @param {number} [shelvesItemAmount] - Optional. The number of streams to fetch. Defaults to 12 if not provided.
     * @returns {Promise<Object>} A promise that resolves to an object containing featured streams and shelf data.
     *                            Logs any errors if encountered during the fetch.
     */
    getHomePage(lang?: string, streamsAmount?: number, shelvesItemAmount?: number): Promise<any>;
    /**
     * Fetches a list of streamers with zero viewers. This should be a feature on Twitch's main site, but fuck 'em--top streamers are more important to them.
     * This makes a call to my (ktg5's) own API hosted on my domain, working similarly to nobody.live, but in TypeScript
     * @param {number} [limit] - The limit of items to get. Defaults to 6.
     * @returns {Promise.<Array.<Object>>} A promise that resolves to an array of streamer objects.
     */
    getZeroStreamers(limit?: number): Promise<Array<any>>;
    /**
     * Gets the directory index for the front page.
     * @param {string} oauth - Optional. The OAuth token for authentication to use for personal recommendations.
     * Can be left blank if the current GQL instance has a OAuth defined.
     * @param {number} [limit] - The limit of items to get. Defaults to 30.
     * @param {boolean} [byViewers] - If the returned data should be sorted by the amount of viewers; should be set to `true` if wanted to be.
     * @returns {Promise.<Array.<Object>>} A promise that resolves to an array of directory objects.
     */
    getDirectoryIndex(oauth: string, limit?: number, byViewers?: boolean): Promise<Array<any>>;
    /**
     * Fetches recommended channels based on the current and past streamers.
     *
     * @param {string} oauth - Optional. The OAuth token for authentication to use for personal recommendations.
     * Can be left blank if the current GQL instance has a OAuth defined.
     * @param {Array} [CurrentPastStreamer] - Optional. An array containing the current and past channel names.
     * @returns {Promise<Object>} A promise that resolves to the personal recommendations data.
     */
    getSideNav(oauth: string, CurrentPastStreamer?: any[]): Promise<any>;
    /**
     * Fetches search **bar** results with the provided "string" value.
     *
     * @param {string} string - The query you'd like to search.
     * @returns {Promise<Array>} A promise that resolves search **bar** data with the provided "string" value.
     */
    getSearchBarData(string: string): Promise<any[]>;
    /**
     * Fetches search results with the provided "string" value.
     *
     * @param {string} string - The query you'd like to search.
     * @returns {Promise<Array>} A promise that resolves search data with the provided "string" value.
     */
    getSearchData(string: string): Promise<any[]>;
    /**
     * Fetches a channel's data from twitch.
     * @param {string} name - The name of the channel to fetch.
     * @returns {Promise<Object>} A promise that resolves with the channel's data.
     */
    getChannel(name: string): Promise<any>;
    getChannelSimple(name: any): Promise<any>;
    /**
     * @typedef {"ARCHIVE" | "HIGHLIGHT" | "VIDEOS" | "CLIPS"} MediaType
     * @typedef {"LAST_DAY" | "LAST_WEEK" | "LAST_MONTH" | "ALL_TIME"} ClipsSort
     */
    /**
     * Get VODs, highlights or clips from a channel.
     * @param {string} name Name of channel.
     * @param {MediaType} type The type of media to look for.
     * @param {number} [limit] The amount of items to return back. (Defaults to 30)
     * @param {ClipsSort} [sort] This is mostly used for clips, but used to be for everything on a channels page.
     * @returns {object} Returns a list of objects that include data for each media fetched.
     */
    getChannelMedia(name: string, type: "ARCHIVE" | "HIGHLIGHT" | "VIDEOS" | "CLIPS", limit?: number, sort?: "LAST_DAY" | "LAST_WEEK" | "LAST_MONTH" | "ALL_TIME"): object;
    /**
     * @description Gets the list of emotes from a given channel.
     * @param {string} name - The name of the channel.
     * @returns {Promise<Array<Object>>} A promise that resolves with an array of clips.
     */
    getChannelEmotes(name: string): Promise<Array<any>>;
    /**
     * @description Gets the metadata of a given stream.
     * @param {string} name - The name of the channel.
     * @returns {Promise<Object|null>} A promise that resolves with the stream metadata if the stream is live, otherwise resolves to `null`.
     */
    getStreamMetadata(name: string): Promise<any | null>;
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
     * @description Follows a stream by its ID.
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
     * @description Searches for streams, games, videos, channels, and related live channels based on a given query.
     * @param {string} query - The search query.
     * @returns {Promise<Object>} A promise that resolves with an object containing the results of the search query.
     * Logs an error if the query is invalid.
     */
    search(query: string): Promise<any>;
    /**
     * @description Fetches the category information, streamers, videos and clips for a given category slug.
     * @param {string} slug - The slug of the category to fetch information for.
     * @param {Object} [args] - Optional. An object containing the following optional properties:
     * - streamSort: The sort type of the streamers. Defaults to `RELEVANCE`. Other values are `VIEWER_COUNT`, `VIEWER_COUNT_ASC`, and `RECENT`
     * - vodSort: The sort type of the videos and clips. Defaults to `VIEWS`. Other values are just `TIME`.
     * - clipSort: The sort type of the clips. Defaults to `LAST_WEEK`. Other values are `LAST_DAY`, `LAST_MONTH`, and `ALL_TIME`.
     * - tags: An array of strings containing the tags to filter the streamers by.
     * - languages: An array of strings containing the languages to filter the streamers by.
     * - filters: An array of strings containing the filters to apply on the streamers.
     * - limit: The number of streamers to fetch. Defaults to 100.
     * @returns {Promise<Object>} A promise that resolves to an object containing the category information, streamers, videos and clips.
     * Logs an error if the slug is invalid.
     */
    getAllCategoryData(slug: string, args?: any): Promise<any>;
    /**
     * Fetches the category information for a given slug.
     *
     * @param {string} slug - The slug of the category to fetch information for.
     * @returns {Promise<Object>} A promise that resolves to the category information.
     * Logs an error if the slug is invalid.
     */
    getCategory(slug: string): Promise<any>;
    /**
     * Fetches the streamers for a given category.
     *
     * @param {string} slug - The slug of the category to fetch streamers for.
     * @param {Object} [args] - Optional. An object containing the following optional properties:
     * - sort: The sort type of the streamers. Defaults to `RELEVANCE`. Other values are `VIEWER_COUNT`, `VIEWER_COUNT_ASC`, and `RECENT`.
     * - tags: An array of strings containing the tags to filter the streamers by.
     * - languages: An array of strings containing the languages to filter the streamers by.
     * - filters: An array of strings containing the filters to apply on the streamers.
     * - limit: The number of streamers to fetch. Defaults to 100.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of streamer objects.
     */
    getCategoryStreamers(slug: string, args?: any): Promise<Array<any>>;
    /**
     * Fetches streamers for a given tag.
     *
     * @param {string | <Array<string>>} tags - Either a list of tags or just a single tag.
     * @returns {Promise<Array<Object>>} - A list of objects with the streamers within the tags provided.
     * - Logs & returns an error if the tag is invalid.
     */
    getTagStreamers(tags: any): Promise<Array<any>>;
    /**
     * Fetches VOD info from twitch given a VOD ID.
     * @param {string} id - The VOD ID.
     * @returns {Promise<Object>} - An object containing the VOD info, or an object with an errors property if an error occurred.
     */
    getVodInfo(id: string): Promise<any>;
    /**
     * @param {string} id - The ID of the VOD to fetch comments from
     * @returns {Promise<Object[]>} - A promise that resolves to an array of comment objects
     * @description
     * Fetches the comments for a given VOD. The comments are returned as an array of
     * objects, each containing the comment's ID, timestamp, body, and author's login.
     */
    getVodMessages(id: string): Promise<any[]>;
    /**
     * @param {string} slug - The slug of the clip to fetch information for.
     * @returns {Promise<Object>} - A promise that resolves to an object containing the clip's information. The object will contain the following properties:
     */
    getClip(slug: string): Promise<any>;
}
