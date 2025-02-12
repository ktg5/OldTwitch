let anonId = "kimne78kx3ncx6brgo4mv6wki5h1ko";
class Gql {
    clientid = "";
    oauth = "";

    constructor(clientid, oauth) {
        this.clientid = clientid;
        this.oauth = oauth;
    }


    async getUserInfo(Oauth) {
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
                resolve(data.data.currentUser);
            });
        });
    }


    async getRecommends(Oauth, CurrentPastStreamer) {
        if (!Oauth || !CurrentPastStreamer) return console.error("Invaild args");

        if (this.oauth) Oauth = this.oauth;
        let currentChannel, pastChannel;
        if (CurrentPastStreamer && Array.isArray(CurrentPastStreamer)) {
            currentChannel = CurrentPastStreamer[0];
            pastChannel = CurrentPastStreamer[1];
        }

        return new Promise(async (resolve, reject) => {
            await fetch("https://gql.twitch.tv/gql", {
                headers: {
                    "authorization": `OAuth ${Oauth}`,
                    "client-id": this.clientid,
                    "x-device-id": "0",
                },
                body: JSON.stringify({
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
                                "channelName": `${currentChannel}`,
                                "lastChannelName": `${pastChannel}`,
                                "pageviewLocation": "channel",
                            },
                            "contextChannelName": `${currentChannel}`
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
                }),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();
                resolve(data.data.personalSections);
            });
        })
    }
    

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

                    resolve(cleanData);
                });
            });
        });
    }

    async getChannelVideos(name) {
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
                        "limit": 100,
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
                resolve(data.data.user.videos.edges);
            });
        });
    }

    async getChannelClips(name, filter) {
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
                        "limit": 100,
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
                resolve(data.data.user.clips.edges);
            });
        });
    }

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
                if (data.data.user.stream != null) {
                    let cleanData = data.data.user.stream.previewImageURL;
                    resolve(cleanData);
                } else {
                    resolve(null);
                }
            });
        });
    }


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
                        "requestID": "a0423443-24d1-4ab4-8238-f1bea7d46a77",
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
                resolve({
                    channels: data.data.searchFor.channels.edges,
                    channelsWithTag: data.data.searchFor.channelsWithTag.edges,
                    games: data.data.searchFor.games.edges,
                    videos: data.data.searchFor.videos.edges,
                    relatedLiveChannels: data.data.searchFor.relatedLiveChannels
                });
            });
        });
    }


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
                resolve(data.data.game);
            })
        });
    }

    async getCategoryStreamers(slug, sort) {
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
                            // "requestID": "JIRA-VXP-2397",
                            "freeformTags": null,
                            "tags": [],
                            "broadcasterLanguages": [
                                "EN"
                            ],
                            "systemFilters": []
                        },
                        "sortTypeIsRecency": false,
                        "limit": 30,
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
                resolve(data.data.game.streams.edges);
            })
        });
    }
}

var gql = new Gql(anonId);