let anonId = "kimne78kx3ncx6brgo4mv6wki5h1ko";
class Gql {
    clientid = "";
    oauth = "";
    integToken = {
        token: "",
        expiration: 0
    };

    constructor(clientid, oauth) {
        this.clientid = clientid;
        this.oauth = oauth;
    }


    /**
     * **STILL WIP**
     * 
     * Runs the integrity request on the GQL API. The token that gets returned is used for some requests and it'll be saved to the current Gql class.
     * @param {string} oauth - The OAuth token used for authentication. If not provided, the instance's OAuth token will be used.
     * @returns {Promise<Object>} A promise that resolves to the integrity check data.
     *                            Logs an error if the OAuth token is invalid.
     */
    async getClientInteg(oauth) {
        if (this.oauth != undefined) oauth = this.oauth;
        if (!oauth) return console.error(`"oauth" is required but returned null.`);

        return new Promise(async (resolve, reject) => {
            await fetch("https://gql.twitch.tv/integrity", {
                "headers": {
                    "authorization": `OAuth ${oauth}`,
                    "client-id": this.clientid,
                    "x-device-id": "0",
                },
                "body": null,
                "method": "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                if (data.errors) resolve({ errors: data.errors });
                else {
                    this.integToken.token = data.token;
                    this.integToken.expiration = data.expiration;
                    resolve(data);
                }
            })
        });
    }


    /**
     * Fetches the current user information from the Twitch GraphQL API.
     *
     * @param {string} oauth - The OAuth token used for authentication. If not provided, 
     *                         the instance's OAuth token will be used.
     * @returns {Promise<Object>} A promise that resolves to the current user data.
     *                            Logs an error if the OAuth token is invalid.
     */
    async getCurrentUser(oauth) {
        if (this.oauth != undefined) oauth = this.oauth;
        if (!oauth) return console.error(`"oauth" is required but returned null.`);

        return new Promise(async (resolve, reject) => {
            await fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "authorization": `OAuth ${oauth}`,
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


    /**
     * Fetches the home page data from the Twitch GraphQL API.
     *
     * @param {string} lang - The language in which to fetch the data.
     * @param {number} streamsAmount - Optional. The number of streams to fetch. Maximum is 10 within GQL. Defaults to 6 if not provided.
     * @param {number} shelvesItemAmount - Optional. The number of streams to fetch. Defaults to 12 if not provided.
     * @returns {Promise<Object>} A promise that resolves to an object containing featured streams and shelf data.
     *                            Logs any errors if encountered during the fetch.
     */
    async getHomePage(lang, streamsAmount, shelvesItemAmount) {
        // if (!lang) return console.error("Invaild args");

        if (!streamsAmount) {
            streamsAmount = 6;
            console.warn("streams amount arg not set, going with \"8\".");
        }

        if (!shelvesItemAmount) {
            shelvesItemAmount = 12;
            console.warn("shelves amount arg not set, going with \"8\".");
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
                            "language": lang,
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
                            "itemsPerRow": shelvesItemAmount,
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

                data.forEach(element => {
                    if (element.errors) {
                        console.error(`gql.getHomePage erorr:`, element.errors);
                        resolve({ errors: element.errors });
                    }
                });

                let featuredStreamsData = [];
                data[0].data.featuredStreams.forEach(stream => {
                    featuredStreamsData.push(stream.stream);
                });

                let shelvesData = {};
                data[1].data.shelves.edges.forEach(shelf => {
                    let shelfData = [];
                    shelf.node.content.edges.forEach(edge => {
                        shelfData.push(edge.node);
                    });

                    shelvesData[shelf.node.title.key] = shelfData;
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
     * Gets the directory index for the front page.
     * @param {string} oauth - Optional. The OAuth token for authentication to use for personal recommendations.
     * Can be left blank if the current GQL instance has a OAuth defined.
     * @param {number} [limit] - The limit of items to get. Defaults to 30.
     * @returns {Promise.<Array.<Object>>} A promise that resolves to an array of directory objects.
     */
    async getDirectoryIndex(oauth, limit) {
        let Headers = {
            "client-id": this.clientid,
            "x-device-id": "0"
        }
        if (this.oauth != undefined) oauth = this.oauth;
        if (oauth) Headers.authorization = `OAuth ${oauth}`;

        if (!limit) {
            limit = 30;
            console.warn("limit arg not set, going with \"30\".");
        }

        return new Promise(async (resolve, reject) => {
            await fetch("https://gql.twitch.tv/gql", {
                headers: Headers,
                body: JSON.stringify({
                    "operationName": "BrowsePage_AllDirectories",
                    "variables": {
                        "limit": 30,
                        "options": {
                            "recommendationsContext": {
                            "platform": "web"
                            },
                            // "requestID": "JIRA-VXP-2397",
                            "sort": "RELEVANCE",
                            "tags": []
                        }
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "2f67f71ba89f3c0ed26a141ec00da1defecb2303595f5cda4298169549783d9e"
                        }
                    }
                }),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                if (data.errors || data.error) resolve({ errors: data.errors ? data.errors : data.message });
                else {
                    let cleanData = [];

                    data.data.directoriesWithTags.edges.forEach(edge => {
                        cleanData.push(edge.node);
                    });
                    resolve(cleanData);
                }
            })
        });
    }


    /**
     * Fetches recommended channels based on the current and past streamers.
     *
     * @param {string} oauth - Optional. The OAuth token for authentication to use for personal recommendations.
     * Can be left blank if the current GQL instance has a OAuth defined.
     * @param {Array} [CurrentPastStreamer] - Optional. An array containing the current and past channel names.
     * @returns {Promise<Object>} A promise that resolves to the personal recommendations data.
     */
    async getRecommends(oauth, CurrentPastStreamer) {
        if (!CurrentPastStreamer) return console.error(`"CurrentPastStreamer" is required but returned null.`);

        let currentChannel, pastChannel;
        if (CurrentPastStreamer && Array.isArray(CurrentPastStreamer)) {
            currentChannel = CurrentPastStreamer[0];
            pastChannel = CurrentPastStreamer[1];
        }

        let Headers = {
            "client-id": this.clientid,
            "x-device-id": "0"
        }
        if (this.oauth != undefined) oauth = this.oauth;
        if (oauth) Headers.authorization = `OAuth ${oauth}`;

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
                headers: Headers,
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
        if (!name) return console.error(`"name" is required but returned null.`);

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

                if (data.errors) resolve({ errors: data.errors });
                else {
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

                    await fetch("https://gql.twitch.tv/gql", {
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
                }
            });
        });
    }

    /**
     * @description Gets a list of videos from a channel.
     * @param {string} name The name of the channel.
     * @param {number} [limit=100] Optional. The limit of videos to get. Defaults to `100`.
     * @returns {Promise.<Array.<Object>>} A promise that resolves to an array of video objects.
     */
    async getChannelVods(name, limit) {
        if (!name) return console.error(`"name" is required but returned null.`);

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

                let cleanData = [];
                for (let i = 0; i < data.data.user.videos.edges.length; i++) {
                    const element = data.data.user.videos.edges[i];
                    cleanData[i] = element.node;
                }
                resolve(cleanData);
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
        if (!name) return console.error(`"name" is required but returned null.`);

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

                let cleanData = [];
                for (let i = 0; i < data.data.user.clips.edges.length; i++) {
                    const element = data.data.user.clips.edges[i];
                    cleanData[i] = element.node;
                }
                resolve(cleanData);
            });
        });
    }

    /**
     * @description Gets the metadata of a given stream.
     * @param {string} name - The name of the channel.
     * @returns {Promise<Object|null>} A promise that resolves with the stream metadata if the stream is live, otherwise resolves to `null`.
     */
    async getStreamMetadata(name) {
        if (!name) return console.error(`"name" is required but returned null.`);

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
        if (!name) return console.error(`"name" is required but returned null.`);

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

    async getStreamStatus(name) {
        if (!name) return console.error(`"name" is required but returned null.`);

        return new Promise(async (resolve, reject) => {
            await fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "client-id": this.clientid,
                },
                body: JSON.stringify({
                    "operationName": "StreamRefetchManager",
                    "variables": {
                        "channel": name
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "ecdcb724b0559d49689e6a32795e6a43bba4b2071b5e762a4d1edf2bb42a6789"
                        }
                    }
                }),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                if (data.errors) resolve({ errors: data.errors });
                if (data.data.user.stream != null) resolve(true);
                else resolve(false);
            });
        });
    }

    /**
     * @description Follows a stream by its ID.
     * @param {string} oauth - The user's OAuth token to use for the request.
     * Can be left blank if the current GQL instance has a OAuth defined.
     * @param {string} id - The ID of the stream to follow.
     * @param {boolean} disableNotifs - Whether to receive disableNotifs for the stream.
     * @returns {Promise<Object>} Returns a object of the "followUser" object, containing the user followed & possible errors.
     * Logs an error if the stream ID is invalid or if the disableNotifs arg is not a boolean.
     */
    async followChannelId(oauth, id, disableNotifs) {
        if (this.oauth != undefined) oauth = this.oauth;
        if (!oauth) return console.error(`"oauth" is required but returned null.`);
        if (!id) return console.error(`"id" is required but returned null.`);
        if (disableNotifs && typeof disableNotifs !== 'boolean') return console.error(`"disableNotifs" must be a boolean.`);
        else if (!disableNotifs) console.warn(`"disableNotifs" arg not set, going with false.`);

        return new Promise(async (resolve, reject) => {
            if (this.integToken.token == "" ||
                this.integToken.token != "" && Date.now() > this.integToken.expiration)
            {
                await this.getClientInteg(oauth);
            }

            await fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "authorization": `OAuth ${oauth}`,
                    "client-id": this.clientid,
                    "client-integrity": this.integToken.token,
                    "x-device-id": "0",
                },
                body: JSON.stringify({
                    "operationName": "FollowButton_FollowUser",
                    "variables": {
                        "input": {
                            "disableNotifications": disableNotifs ? disableNotifs : false,
                            "targetID": id
                        }
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "800e7346bdf7e5278a3c1d3f21b2b56e2639928f86815677a7126b093b2fdd08"
                        }
                    }
                }),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                if (data.errors) resolve({ errors: data.errors });
                else resolve(data.data.followUser);
            });
        });
    }

    
    /**
     * Unfollows a stream for a given OAuth token and stream ID.
     * @param {string} oauth - The user's OAuth token to use for the request.
     * Can be left blank if the current GQL instance has a OAuth defined.
     * @param {string} id - The ID of the stream to unfollow.
     * @returns {Promise<Object>} Returns a object of the "followUser" object, containing the user followed & possible errors.
     * Logs an error if the stream ID is invalid or if the OAuth token is invalid.
     */
    async unfollowChannelId(oauth, id) {
        if (this.oauth != undefined) oauth = this.oauth;
        if (!oauth) return console.error(`"oauth" is required but returned null.`);
        if (!id) return console.error(`"id" is required but returned null.`);

        return new Promise(async (resolve, reject) => {
            if (this.integToken.token == "" ||
                this.integToken.token != "" && Date.now() > this.integToken.expiration)
            {
                await this.getClientInteg(oauth);
            }

            await fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "authorization": `OAuth ${oauth}`,
                    "client-id": this.clientid,
                    "client-integrity": this.integToken.token,
                    "x-device-id": "0",
                },
                body: JSON.stringify({
                    "operationName": "FollowButton_UnfollowUser",
                    "variables": {
                        "input": {
                            "targetID": id
                        }
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "f7dae976ebf41c755ae2d758546bfd176b4eeb856656098bb40e0a672ca0d880"
                        }
                    }
                }),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();
                console.log(data);

                if (data.errors) resolve({ errors: data.errors });
                else resolve(data.data.unfollowUser);
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
        if (!query) return console.error(`"query" is required but returned null.`);

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
    async getAllCategoryData(slug, args) {
        if (!slug) return console.error(`"slug" is required but returned null.`);

        let argStreamSort = "RELEVANCE";
        let argVodSort = "VIEWS";
        let argClipSort = "LAST_WEEK";
        let argTags, argLang, argFilters, argLimit;

        if (args) {
            if (args instanceof Object) return console.error(`"args" must be an object.`);

            if (args.streamSort) argStreamSort = args.streamSort;
            else console.warn("sort arg not set, going with \"RELEVANCE\".");
            if (args.vodSort) argVodSort = args.vodSort;
            else console.warn("sort arg not set, going with \"VIEWS\".");
            if (args.vodSort) argVodSort = args.vodSort;
            else console.warn("sort arg not set, going with \"LAST_WEEK\".");
            if (args.tags) argTags = args.tags;
            if (args.languages) argLang = args.languages;
            if (args.filters) argFilters = args.filters;
            if (args.limit) argLimit = args.limit;
            else console.warn("limit arg not set, going with 100.");
        }

        return new Promise(async (resolve, reject) => {
            fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "client-id": this.clientid,
                },
                body: JSON.stringify([
                    {
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
                    },
                    {
                        "operationName": "DirectoryPage_Game",
                        "variables": {
                            "imageWidth": 50,
                            "slug": slug,
                            "options": {
                                "includeRestricted": [
                                    "SUB_ONLY_LIVE"
                                ],
                                "sort": argStreamSort,
                                "recommendationsContext": {
                                    "platform": "web"
                                },
                                "freeformTags": null,
                                "tags": argTags ? argTags : [],
                                "broadcasterLanguages": argLang ? argLang : [],
                                "systemFilters": argFilters ? argFilters : []
                            },
                            "sortTypeIsRecency": false,
                            "limit": argLimit ? argLimit : 100,
                            "includeIsDJ": true
                        },
                        "extensions": {
                            "persistedQuery": {
                                "version": 1,
                                "sha256Hash": "c7c9d5aad09155c4161d2382092dc44610367f3536aac39019ec2582ae5065f9"
                            }
                        }
                    },
                    {
                        "operationName": "DirectoryVideos_Game",
                        "variables": {
                            "includePreviewBlur": true,
                            "slug": slug,
                            "videoLimit": argLimit ? argLimit : 100,
                            "languages": argLang,
                            "videoSort": argVodSort
                        },
                        "extensions": {
                            "persistedQuery": {
                                "version": 1,
                                "sha256Hash": "f19b861ed9c767a1c231be8f757958005cd537a6e9730bc01c6b4735c2eaf211"
                            }
                        }
                    },
                    {
                        "operationName": "ClipsCards__Game",
                        "variables": {
                            "categorySlug": slug,
                            "limit": argLimit ? argLimit : 100,
                            "criteria": {
                                "languages": argLang ? argLang : [],
                                "filter": argClipSort,
                                "shouldFilterByDiscoverySetting": true
                            }
                        },
                        "extensions": {
                            "persistedQuery": {
                                "version": 1,
                                "sha256Hash": "ebcf54afb9aa5d6cec8aad2c35b84e2737a109dac5b184308aae73a27d176707"
                            }
                        }
                    }
                ]),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();

                if (data.errors) resolve({ errors: data.errors });
                else {
                    let streamsData = [], videosData = [], clipsData = [];
                    data[1].data.game.streams.edges.forEach(stream => {
                        streamsData.push(stream.node);
                    });
                    data[2].data.game.videos.edges.forEach(video => {
                        videosData.push(video.node);
                    });
                    data[3].data.game.clips.edges.forEach(clip => {
                        clipsData.push(clip.node);
                    });

                    let cleanData = {
                        ...data[0].data.game,
                        streams: streamsData,
                        videos: videosData,
                        clips: clipsData
                    };
                    resolve(cleanData);
                }
            })
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
        if (!slug) return console.error(`"slug" is required but returned null.`);

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
    async getCategoryStreamers(slug, args) {
        if (!slug) return console.error(`"slug" is required but returned null.`);

        let argSort = "RELEVANCE";
        let argTags, argLang, argFilters, argLimit;

        if (args) {
            if (args instanceof Object) return console.error(`"args" must be an object.`);

            if (args.sort) argSort = args.sort;
            else console.warn("sort arg not set, going with \"RELEVANCE\".");
            if (args.tags) argTags = args.tags;
            if (args.languages) argLang = args.languages;
            if (args.filters) argFilters = args.filters;
            if (args.limit) argLimit = args.limit;
            else console.warn("limit arg not set, going with 100.");
        }

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
                            "sort": argSort,
                            "recommendationsContext": {
                                "platform": "web"
                            },
                            "freeformTags": null,
                            "tags": argTags ? argTags : [],
                            "broadcasterLanguages": argLang ? argLang : [],
                            "systemFilters": argFilters ? argFilters : []
                        },
                        "sortTypeIsRecency": false,
                        "limit": argLimit ? argLimit : 100,
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
                else {
                    let cleanData = [];
                    data.data.game.streams.edges.forEach(stream => {
                        cleanData.push(stream.node);
                    });

                    resolve(cleanData);
                };
            });
        });
    }

    /**
     * Fetches streamers for a given tag.
     *
     * @param {string | <Array<string>>} tags - Either a list of tags or just a single tag.
     * @returns {Promise<Array<Object>>} - A list of objects with the streamers within the tags provided.
     * - Logs & returns an error if the tag is invalid.
     */
    async getTagStreamers(tags) {
        if (!tags) return console.error(`"tags" is required but returned null.`);
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
        if (!id) return console.error(`"id" is required but returned null.`);

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
        if (!id) return console.error(`"id" is required but returned null.`);

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
        if (!slug) return console.error(`"slug" is required but returned null.`);

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