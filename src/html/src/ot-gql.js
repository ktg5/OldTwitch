let anonId = "kimne78kx3ncx6brgo4mv6wki5h1ko";
class Gql {
    clientid = "";
    oauth = "";

    constructor(clientid, oauth) {
        this.clientid = clientid;
        this.oauth = oauth;
    }


    /**
     * Fetches the current user information from the Twitch GraphQL API.
     *
     * @param {string} Oauth - The OAuth token used for authentication. If not provided, 
     *                         the instance's OAuth token will be used.
     * @returns {Promise<Object>} A promise that resolves to the current user data.
     *                            Logs an error if the OAuth token is invalid.
     */
    async getCurrentUser(Oauth) {
        if (!Oauth) return console.error("Invaild args");

        if (this.oauth != undefined) Oauth = this.oauth;

        return new Promise(async (resolve, reject) => {
            await fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "authorization": `OAuth ${Oauth}`,
                    "client-id": this.clientid,
                    "x-device-id": "0",
                },
                body: JSON.stringify({
                    "operationName": "EmbedPlayer_UserData",
                    "variables": {},
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "1b191097b0dc6c9c129049d0de6ff5f9c3a920f6bd250633b5ac0124c0c52d6e"
                        }
                    }
                }),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                if (data.errors) resolve({ errors: data.errors });
                else resolve(data.data.currentUser);
            });
        });
    }


    async getHomePage(lang, streamsAmount) {
        // if (!lang) return console.error("Invaild args");

        if (!streamsAmount) {
            streamsAmount = 6;
            console.warn("amount arg not set, going with \"8\".");
        }

        return new Promise(async (resolve, reject) => {
            await fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "client-id": this.clientid,
                    "x-device-id": "0"
                },
                body: JSON.stringify([
                    {
                        "operationName": "FeaturedContentCarouselStreams",
                        "variables": {
                            "language": "en",
                            "first": streamsAmount,
                            "acceptedMature": true
                        },
                        "extensions": {
                            "persistedQuery": {
                                "version": 1,
                                "sha256Hash": "663a12a5bcf38aa3f6f566e328e9e7de44986746101c0ad10b50186f768b41b7"
                            }
                        }
                    },
                    {
                        "operationName": "Shelves",
                        "variables": {
                            "imageWidth": 50,
                            "itemsPerRow": streamsAmount,
                            "langWeightedCCU": true,
                            "platform": "web",
                            "limit": 3,
                            "requestID": "",
                            "includeIsDJ": true,
                            "context": {
                                "clientApp": "twilight",
                                "location": "home",
                                "referrerDomain": "",
                                "viewportHeight": 1081,
                                "viewportWidth": 1697
                            },
                            "verbose": false
                        },
                        "extensions": {
                            "persistedQuery": {
                                "version": 1,
                                "sha256Hash": "96e73675b8cf36556ca3b06c51fe8804667bfaf594d05e503c7c7ff5176723fe"
                            }
                        }
                    }
                ]),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                let featuredStreamsData = [];
                data[0].data.featuredStreams.forEach(stream => {
                    featuredStreamsData.push(stream.stream);
                });

                let shelvesData = [];
                data[1].data.shelves.edges.forEach(shelf => {
                    let shelfData = [];
                    shelf.node.content.edges.forEach(edge => {
                        shelfData.push(edge.node);
                    });

                    shelvesData.push(JSON.parse(`{"${shelf.node.title.key}":${JSON.stringify(shelfData)}}`));
                });

                if (data.errors) resolve({ errors: data.errors });
                else resolve({
                    featuredStreams: featuredStreamsData,
                    shelves: shelvesData
                });
            })
        });
    }


    /**
     * Fetches recommended channels based on the current and past streamers.
     *
     * @param {string} Oauth - The OAuth token for authentication.
     * @param {Array} [CurrentPastStreamer] - Optional. An array containing the current and past channel names.
     * @returns {Promise<Object>} A promise that resolves to the personal recommendations data.
     */
    async getRecommends(Oauth, CurrentPastStreamer) {
        if (!Oauth || !CurrentPastStreamer) return console.error("Invaild args");

        if (this.oauth) Oauth = this.oauth;
        let currentChannel, pastChannel;
        if (CurrentPastStreamer && Array.isArray(CurrentPastStreamer)) {
            currentChannel = CurrentPastStreamer[0];
            pastChannel = CurrentPastStreamer[1];
        }

        let Body = {
            "operationName": "PersonalSections",
            "variables": {
                "input": {
                    "sectionInputs": [
                        "RECS_FOLLOWED_SECTION",
                        "RECOMMENDED_COLLABS_SECTION",
                        "RECOMMENDED_SECTION",
                        "SIMILAR_SECTION"
                    ],
                    "recommendationContext": {
                        "channelName": "",
                        "lastChannelName": "",
                        "pageviewLocation": "channel",
                    },
                    "contextChannelName": ""
                },
                "creatorAnniversariesFeature": false,
                "withFreeformTags": false
            },
            "extensions": {
                "persistedQuery": {
                    "version": 1,
                    "sha256Hash": "4c3776186239b845f100e5d989a4823f8586c899fb5e7cd856efabd2405b998c"
                }
            }
        }
        if (currentChannel) {
            Body.variables.input.recommendationContext.channelName = currentChannel;
            Body.variables.input.contextChannelName = currentChannel;
        } if (pastChannel) {
            Body.variables.input.recommendationContext.lastChannelName = pastChannel;
        }

        return new Promise(async (resolve, reject) => {
            await fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "authorization": `OAuth ${Oauth}`,
                    "client-id": this.clientid,
                    "x-device-id": "0",
                },
                body: JSON.stringify(Body),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                if (data.errors) resolve({ errors: data.errors });
                else resolve(data.data.personalSections);
            });
        })
    }
    

    /**
     * Fetches a channel's data from twitch.
     * @param {string} name - The name of the channel to fetch.
     * @returns {Promise<Object>} A promise that resolves with the channel's data.
     * The data object contains the following properties:
     * - live: A boolean indicating if the channel is live.
     * - ...all user data from Twitch.
     * - watchParty: The channel's watch party data.
     * - chatRules: The channel's chat rules.
     * - description: The channel's description.
     * - primaryColor: The channel's primary color.
     * - followerCount: The channel's follower count.
     * - roles: The channel's roles.
     * - schedule: The channel's schedule.
     * - primaryTeam: The channel's primary team.
     * - panels: The channel's panels.
     * 
     * If the channel is live, the data object also contains the following properties:
     * - broadcastSettings.game: The game that the channel is streaming.
     */
    async getChannel(name) {
        if (!name) return console.error("Invaild args");

        return new Promise(async (resolve, reject) => {   
            await fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "client-id": this.clientid,
                },
                body: JSON.stringify([
                    {
                        "operationName": "VideoPlayerStreamInfoOverlayChannel",
                        "variables": {
                            "channel": name
                        },
                        "extensions": {
                            "persistedQuery": {
                                "version": 1,
                                "sha256Hash": "198492e0857f6aedead9665c81c5a06d67b25b58034649687124083ff288597d"
                            }
                        }
                    },
                    {
                        "operationName": "ActiveWatchParty",
                        "variables": {
                            "channelLogin": name
                        },
                        "extensions": {
                            "persistedQuery": {
                                "version": 1,
                                "sha256Hash": "4a8156c97b19e3a36e081cf6d6ddb5dbf9f9b02ae60e4d2ff26ed70aebc80a30"
                            }
                        }
                    },
                    {
                        "operationName": "Chat_ChannelData",
                        "variables": {
                            "channelLogin": name
                        },
                        "extensions": {
                            "persistedQuery": {
                                "version": 1,
                                "sha256Hash": "3c445f9a8315fa164f2d3fb12c2f932754c2f2c129f952605b9ec6cf026dd362"
                            }
                        }
                    },
                    {
                        "operationName": "ChannelRoot_AboutPanel",
                        "variables": {
                            "channelLogin": name,
                            "skipSchedule": false,
                            "includeIsDJ": true
                        },
                        "extensions": {
                            "persistedQuery": {
                                "version": 1,
                                "sha256Hash": "0df42c4d26990ec1216d0b815c92cc4a4a806e25b352b66ac1dd91d5a1d59b80"
                            }
                        }
                    }
                ]),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();
                let isLive = data[0].data.user.stream != null;

                let gameSlug;
                if (data[0].data.user.broadcastSettings.game) gameSlug = data[0].data.user.broadcastSettings.game.slug;
                let cleanData = {
                    live: isLive,
                    ...data[0].data.user,
                    watchParty: data[1].data.user.activeWatchParty,
                    chatRules: data[2].data.channel.chatSettings.rules,
                    description: data[3].data.user.description,
                    primaryColor: data[3].data.user.primaryColorHex,
                    followerCount: data[3].data.user.followers.totalCount,
                    roles: data[3].data.user.roles,
                    schedule: data[3].data.user.channel.schedule,
                    primaryTeam: data[3].data.user.primaryTeam
                };
                if (gameSlug) cleanData.broadcastSettings.game = await this.getCategory(gameSlug);

                if (data.errors) resolve({ errors: data.errors });
                else await fetch("https://gql.twitch.tv/gql", {
                    headers: {
                        "client-id": this.clientid,
                    },
                    body: JSON.stringify({
                        "operationName": "ChannelPanels",
                        "variables": {
                            "id": data[0].data.user.id
                        },
                        "extensions": {
                            "persistedQuery": {
                                "version": 1,
                                "sha256Hash": "06d5b518ba3b016ebe62000151c9a81f162f2a1430eb1cf9ad0678ba56d0a768"
                            }
                        }
                    }),
                    method: "POST"
                }).then(async rawDataT => {
                    let dataT = await rawDataT.json();

                    cleanData = {
                        ...cleanData,
                        panels: dataT.data.user.panels
                    }

                    if (data.errors) resolve({ errors: data.errors });
                    else resolve(cleanData);
                });
            });
        });
    }

    /**
     * @description Gets a list of videos from a channel.
     * @param {string} name The name of the channel.
     * @param {number} [limit=100] Optional. The limit of videos to get. Defaults to `100`.
     * @returns {Promise.<Array.<Object>>} A promise that resolves to an array of video objects.
     */
    async getChannelVideos(name, limit) {
        if (!name) return console.error("Invaild args");

        return new Promise(async (resolve, reject) => {
            await fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "client-id": this.clientid,
                },
                body: JSON.stringify({
                    "operationName": "FilterableVideoTower_Videos",
                    "variables": {
                        "includePreviewBlur": false,
                        "limit": limit ? limit : 100,
                        "channelOwnerLogin": name,
                        "broadcastType": "ARCHIVE",
                        "videoSort": "TIME"
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "acea7539a293dfd30f0b0b81a263134bb5d9a7175592e14ac3f7c77b192de416"
                        }
                    }
                }),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                if (data.errors) resolve({ errors: data.errors });
                else resolve(data.data.user.videos.edges);
            });
        });
    }

    /**
     * @description Gets a list of clips from a given channel.
     * @param {string} name - The name of the channel.
     * @param {string} [filter] - Optional. The filter to apply to the clips. Can be set to `LAST_DAY`, `LAST_WEEK, `LAST_MONTH, or `ALL_TIME. Defaults to "LAST_WEEK".
     * @param {number} [limit=100] - Optional. The number of clips to return. Defaults to `100`.
     * @returns {Promise<Array<Object>>} A promise that resolves with an array of clips.
     */
    async getChannelClips(name, filter, limit) {
        if (!name) return console.error("Invaild args");

        // "filter": "LAST_MONTH",
        // "filter": "LAST_DAY",
        // "filter": "ALL_TIME",
        let filterTxt = "LAST_WEEK";
        if (filter) filterTxt = filter;
        else console.warn("filter arg not set, going with \"LAST_WEEK\".");

        return new Promise(async (resolve, reject) => {
            await fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "client-id": this.clientid,
                },
                body: JSON.stringify({
                    "operationName": "ClipsCards__User",
                    "variables": {
                        "login": name,
                        "limit": limit ? limit : 100,
                        "criteria": {
                            "filter": filterTxt,
                            "shouldFilterByDiscoverySetting": true
                        },
                        "cursor": null
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "4eb8f85fc41a36c481d809e8e99b2a32127fdb7647c336d27743ec4a88c4ea44"
                        }
                    }
                }),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                if (data.errors) resolve({ errors: data.errors });
                else resolve(data.data.user.clips.edges);
            });
        });
    }

    /**
     * @description Gets the metadata of a given stream.
     * @param {string} name - The name of the channel.
     * @returns {Promise<Object|null>} A promise that resolves with the stream metadata if the stream is live, otherwise resolves to `null`.
     */
    async getStreamMetadata(name) {
        if (!name) return console.error("Invaild args");

        return new Promise(async (resolve, reject) => {
            await fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "client-id": this.clientid,
                },
                body: JSON.stringify({
                    "operationName": "VideoPlayerStreamMetadata",
                    "variables": {
                        "channel": name
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "248fee6868e983c4e7b69074e888960f77735bd21a1d4a1d882b55f45d30a420"
                        }
                    }
                }),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                if (data.errors) resolve({ errors: data.errors });
                if (data.data.user.stream == null) {
                    resolve(null);
                } else {
                    let cleanData = {
                        ...data.data.user.stream
                    };
                    resolve(cleanData);
                }
            });
        });
    }

    /**
     * Fetches the preview image URL of a stream for a given channel.
     * 
     * @param {string} name - The name of the channel to fetch the stream preview for.
     * @returns {Promise<string|null>} A promise that resolves to the stream's preview image URL if the stream is live,
     *                                otherwise resolves to null if the stream is not live or an error occurs.
     * Logs an error if the channel name is invalid.
     */
    async getStreamPreview(name) {
        if (!name) return console.error("Invaild args");

        return new Promise(async (resolve, reject) => {
            await fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "client-id": this.clientid,
                },
                body: JSON.stringify({
                    "operationName": "VideoPreviewOverlay",
                    "variables": {
                        "login": name
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "9515480dee68a77e667cb19de634739d33f243572b007e98e67184b1a5d8369f"
                        }
                    }
                }),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                if (data.errors) resolve({ errors: data.errors });
                if (data.data.user.stream != null) {
                    let cleanData = data.data.user.stream.previewImageURL;
                    resolve(cleanData);
                } else {
                    resolve(null);
                }
            });
        });
    }


    /**
     * @description Searches for streams, games, videos, channels, and related live channels based on a given query.
     * @param {string} query - The search query.
     * @returns {Promise<Object>} A promise that resolves with an object containing the results of the search query.
     * Logs an error if the query is invalid.
     */
    async search(query) {
        if (!query) return console.error("Invaild args");

        return new Promise(async (resolve, reject) => {
            fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "client-id": this.clientid,
                },
                body: JSON.stringify({
                    "operationName": "SearchResultsPage_SearchResults",
                    "variables": {
                        "platform": "web",
                        "query": query,
                        "options": {
                            "targets": null,
                            "shouldSkipDiscoveryControl": false
                        },
                        "requestID": "",
                        "includeIsDJ": true
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "f6c2575aee4418e8a616e03364d8bcdbf0b10a5c87b59f523569dacc963e8da5"
                        }
                    }
                }),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                if (data.errors) resolve({ errors: data.errors });
                else resolve({
                    channels: data.data.searchFor.channels.edges,
                    channelsWithTag: data.data.searchFor.channelsWithTag.edges,
                    games: data.data.searchFor.games.edges,
                    videos: data.data.searchFor.videos.edges,
                    relatedLiveChannels: data.data.searchFor.relatedLiveChannels
                });
            });
        });
    }


    /**
     * Fetches the category information for a given slug.
     *
     * @param {string} slug - The slug of the category to fetch information for.
     * @returns {Promise<Object>} A promise that resolves to the category information.
     * Logs an error if the slug is invalid.
     */
    async getCategory(slug) {
        if (!slug) return console.error("Invaild args");

        return new Promise(async (resolve, reject) => {
            fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "client-id": this.clientid,
                },
                body: JSON.stringify({
                    "operationName": "Directory_DirectoryBanner",
                    "variables": {
                        "slug": slug
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "822ecf40c2a77568d2b223fd5bc4dfdc9c863f081dd1ca7611803a5330e88277"
                        }
                    }
                }),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                if (data.errors) resolve({ errors: data.errors });
                else resolve(data.data.game);
            })
        });
    }


    /**
     * Fetches streamers for a given category.
     *
     * @param {string} slug - The category slug.
     * @param {string} [sort] - Optional. The sort type. Defaults to "RELEVANCE".
     * @param {{
     *     tags: string[],
     *     languages: string[],
     *     filters: string[],
     *     limit: number
     * }} [args] - Optional. Args for the query.
     * @returns {Promise<Array<Object>>} - The streamers.
     */
    async getCategoryStreamers(slug, sort, args) {
        if (!slug) return console.error("Invaild args");

        // "sort": "VIEWER_COUNT",
        // "sort": "VIEWER_COUNT_ASC",
        // "sort": "RECENT",
        let sortTxt = "RELEVANCE";
        if (sort) sortTxt = sort;
        else console.warn("sort arg not set, going with \"RELEVANCE\".");

        return new Promise(async (resolve, reject) => {
            fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "client-id": this.clientid,
                },
                body: JSON.stringify({
                    "operationName": "DirectoryPage_Game",
                    "variables": {
                        "imageWidth": 50,
                        "slug": slug,
                        "options": {
                            "includeRestricted": [
                                "SUB_ONLY_LIVE"
                            ],
                            "sort": sortTxt,
                            "recommendationsContext": {
                                "platform": "web"
                            },
                            "freeformTags": null,
                            "tags": args.tags ? args.tags : [],
                            "broadcasterLanguages": args.languages ? args.languages : [],
                            "systemFilters": args.filters ? args.filters : []
                        },
                        "sortTypeIsRecency": false,
                        "limit": args.limit ? args.limit : 100,
                        "includeIsDJ": true
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "c7c9d5aad09155c4161d2382092dc44610367f3536aac39019ec2582ae5065f9"
                        }
                    }
                }),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                if (data.errors) resolve({ errors: data.errors });
                else resolve(data.data.game.streams.edges);
            });
        });
    }

    /**
     * Fetches streamers for a given tag.
     *
     * @param {string | <Array<string>>} tags - Either a list of tags or just a single tag.
     * @returns {Promise<Array<Object>>} - The streamers.
     * Logs an error if the tag is invalid.
     */
    async getTagStreamers(tags) {
        if (!tags) return console.error("Invaild args");
        if (!Array.isArray(tags)) tags = [tags]; 

        return new Promise((resolve, reject) => {
            fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "client-id": this.clientid,
                },
                body: JSON.stringify({
                    "operationName": "BrowsePage_Popular",
                    "variables": {
                        "imageWidth": 50,
                        "limit": 30,
                        "platformType": "all",
                        "options": {
                            "sort": "RELEVANCE",
                            "freeformTags": tags,
                            "tags": [],
                            "recommendationsContext": {
                                "platform": "web"
                            },
                            "requestID": "",
                            "broadcasterLanguages": []
                        },
                        "sortTypeIsRecency": false,
                        "includeIsDJ": true
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "75a4899f0a765cc08576125512f710e157b147897c06f96325de72d4c5a64890"
                        }
                    }
                }),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                if (data.errors) resolve({ errors: data.errors });
                else resolve(data.data.streams.edges);
            });
        });
    }


    /**
     * Fetches VOD info from twitch given a VOD ID.
     * @param {string} id - The VOD ID.
     * @returns {Promise<Object>} - An object containing the VOD info, or an object with an errors property if an error occurred.
     */
    async getVodInfo(id) {
        return new Promise(async (resolve, reject) => {
            fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "client-id": this.clientid,
                },
                body: JSON.stringify({
                    "operationName": "AdRequestHandling",
                    "variables": {
                        "isLive": false,
                        "login": "",
                        "isVOD": true,
                        "vodID": `${id}`,
                        "isCollection": false,
                        "collectionID": ""
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "61a5ecca6da3d924efa9dbde811e051b8a10cb6bd0fe22c372c2f4401f3e88d1"
                        }
                    }
                }),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                await fetch("https://gql.twitch.tv/gql", {
                    headers: {
                        "client-id": this.clientid,
                    },
                    body: JSON.stringify({
                        "operationName": "VideoMetadata",
                        "variables": {
                            "channelLogin": data.data.video.owner.login,
                            "videoID": id
                        },
                        "extensions": {
                            "persistedQuery": {
                                "version": 1,
                                "sha256Hash": "45111672eea2e507f8ba44d101a61862f9c56b11dee09a15634cb75cb9b9084d"
                            }
                        }
                    }),
                    method: "POST"
                }).then(async rawDataT => {
                    let dataT = await rawDataT.json();

                    if (dataT.errors) resolve({ errors: dataT.errors });
                    else resolve(dataT.data.video);
                });
            });
        });
    }

    /**
     * @param {string} id - The ID of the VOD to fetch comments from
     * @returns {Promise<Object[]>} - A promise that resolves to an array of comment objects
     * @description
     * Fetches the comments for a given VOD. The comments are returned as an array of
     * objects, each containing the comment's ID, timestamp, body, and author's login.
     */
    async getVodMessages(id) {
        return new Promise((resolve, reject) => {
            fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "client-id": this.clientid,
                },
                body: JSON.stringify({
                    "operationName": "VideoCommentsByOffsetOrCursor",
                    "variables": {
                        "videoID": id,
                        "contentOffsetSeconds": 0
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "b70a3591ff0f4e0313d126c6a1502d79a1c02baebb288227c582044aa76adf6a"
                        }
                    }
                }),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                if (data.errors) resolve({ errors: data.errors });
                else resolve(data.data.video.comments.edges);
            });
        });
    }


    /**
     * @param {string} slug - The slug of the clip to fetch information for.
     * @returns {Promise<Object>} - A promise that resolves to an object containing the clip's information. The object will contain the following properties:
     */
    async getClipInfo(slug) {
        return new Promise(async (resolve, reject) => {
            fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "client-id": this.clientid,
                },
                body: JSON.stringify({
                    "operationName": "ShareClipRenderStatus",
                    "variables": {
                        "slug": slug
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "f130048a462a0ac86bb54d653c968c514e9ab9ca94db52368c1179e97b0f16eb"
                        }
                    }
                }),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                if (data.errors) resolve({ errors: data.errors });
                else resolve(data.data.clip);
            });
        });
    }
}

var gql = new Gql(anonId);