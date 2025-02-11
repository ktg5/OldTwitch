let anonId = "kimne78kx3ncx6brgo4mv6wki5h1ko";
class Gql {
    clientid = "";
    oauth = "";

    constructor(clientid, oauth) {
        this.clientid = clientid;
        this.oauth = oauth;
    }


    async getUserInfo(Oauth) {
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
    

    async getStreamInfo(name) {
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
                    }
                ]),
                method: "POST"
            }).then(async rawData => {
                let data = await rawData.json();
                let isLive = data[0].data.user.stream != null;

                let cleanData = {
                    live: isLive,
                    ...data[0].data.user,
                    watchParty: data[1].data.user.activeWatchParty,
                    chatRules: data[2].data.channel.chatSettings.rules
                };
    
                resolve(cleanData);
            });
        });
    }

    async getStreamMetadata(name) {
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
                        stream: data.data.user.stream
                    };
                    resolve(cleanData);
                }
            });
        });
    }

    async getStreamPreview(name) {
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
}

var gql = new Gql(anonId);