var stream;
var channelData;

// Main function
async function setIframeVideo (args) {
    if (typeof(args) != "object") return "Invalid args";
    if (!args.type) return "Invalid args";

    let chatIframe = document.querySelector(".chat-iframe");

    async function notFirstInit() {
        // name & pfp
        document.querySelector(`.channel-header__user .tw-image`).src = channelData.profileImageURL;
        placeholderToText(document.querySelector(`.channel-header__user .tw-placeholder-wrapper`), channelData.displayName);

        // check if user is following streamer
        for (const channelInt in channels) {
            if (channels[channelInt].type == "RECS_FOLLOWED_SECTION") {
                channels[channelInt].items.forEach(channel => {
                    if (channel.user.login == args.channel) {
                        let followButton = document.querySelector(`[data-a-target="follow-button"]`);
                        followButton.className = "tw-button--hollow";
                        followButton.querySelector(`.tw-button__text`).innerHTML = "Following";
                    };
                });
            };
        };

        // check if channel name is the same as the current user
        if (channelData.displayName != userData.displayName) document.querySelector(`[data-a-target="follow-button"]`).parentElement.classList.remove("tw-hide");
        if (channelData.roles.isAffiliate || channelData.roles.isPartner) document.querySelector(`[data-a-target="subscribe-button"]`).parentElement.classList.remove("tw-hide");
    }

    switch (args.type) {
        case "stream":
            if (!args.name) return "Invalid args";

            // Enable divs
            document.querySelector(`[data-a-target="right-column-chat-bar"]`).classList.remove("tw-hide");
            document.querySelector(`.channel-header`).classList.remove("tw-hide");

            localStorage.setItem("oldttv-lastchannel", localStorage.getItem("oldttv-currentchannel"));
            localStorage.setItem("oldttv-currentchannel", args.name);

            // set stream
            vodExec = () => {
                new Twitch.Player("iframe-insert", {
                    channel: args.name,
                    muted: false
                });
            }
            if (Twitch !== undefined) {
                vodExec();
            } else {
                let tempInit = setInterval(() => {
                    if (Twitch) {
                        vodExec();
                        clearInterval(tempInit);
                    }
                }, 50);
            }

            gqlAction = async () => {
                channelData = await gql.getChannel(args.name);
                videosData = await gql.getChannelVideos(args.name);
                clipsData = await gql.getChannelClips(args.name);
                console.log("channelData: ", channelData);

                // set streamer info
                function addStremerInfo(funcargs) {
                    if (funcargs == null || !funcargs.includes("not-first-init")) {
                        // defaults
                        notFirstInit();

                        // panels
                        let panelsContainer = document.querySelector(`.channel-panels-container`);
                        channelData.panels.forEach(panel => {
                            let panelDiv = document.createElement("div");
                            panelDiv.className = "default-panel"
                            panelDiv.setAttribute("data-a-target", `panel-${panelsContainer.childElementCount}`);
                            if (panel.type == "EXTENSION") {
                                panelDiv.innerHTML = `<kbd>[ OldTwitch ]: An Twitch Extension was detected here, it will not be added because I don't know how to add them yet. This might be temporary, so just keep your hopes up in future updates.</kbd>`
                            } else {
                                panelDiv.innerHTML = `
                                ${panel.title ? `<h3 data-test-selector="title_panel" class="tw-title">${panel.title}</h3>` : ""}
                                <a data-test-selector="link_url_panel" class="tw-link" rel="noopener noreferrer" target="_blank"${panel.linkURL ? ` href="${panel.linkURL}"` : ""}><img data-test-selector="image_panel"${panel.imageURL ? ` src="${panel.imageURL}"` : ""}></a>
                                ${panel.description ? `
                                    <div data-test-selector="description_panel">
                                        <div class="tw-typeset">
                                            <div class="panel-description">
                                                <p>${panel.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ` : ""}
                                `;
                            }

                            panelsContainer.appendChild(panelDiv);
                        });

                        document.title = channelData.displayName + " - " + document.title;
                    }

                    // strings
                    document.querySelector(`[data-a-target="video-title"]`).innerHTML = channelData.broadcastSettings.title;
                    if (channelData.broadcastSettings.game) {
                        document.querySelector(`[data-a-target="category-holder"]`).classList.remove("tw-hide");
                        document.querySelector(`[data-a-target="category-title"]`).innerHTML = channelData.broadcastSettings.game.displayName;
                        document.querySelector(`[data-a-target="category-title"]`).parentElement.href = `https://www.twitch.tv/directory/category/${channelData.broadcastSettings.game.slug}`;    
                    }
                    if (channelData.primaryTeam) {
                        document.querySelector(`[data-a-target="team-holder"]`).classList.remove("tw-hide");
                        document.querySelector(`[data-a-target="team-name"]`).innerHTML = channelData.primaryTeam.displayName;
                        document.querySelector(`[data-a-target="team-name"]`).parentElement.href = `https://www.twitch.tv/team/${channelData.primaryTeam.name}?nooldttv`;
                    }

                    // imgs
                    if (channelData.broadcastSettings.game) {
                        document.querySelector(`.tw-category-cover`).classList.remove("tw-hide");
                        document.querySelector(`.tw-category-cover`).src = channelData.broadcastSettings.game.avatarURL;
                    }

                    // ints
                    document.querySelector(`[aria-describedby="228759886d06d5fdd94e8a05596b023b"]`).parentElement.classList.remove("tw-hide");
                    document.querySelector(`.channel-header__item[data-a-target="followers-channel-header-item"] .channel-header__item-count span`).innerHTML = channelData.followerCount;
                    if (channelData.live) {
                        document.querySelector(`.channel-info-bar__action-container .tw-tooltip-wrapper`).classList.remove("tw-hide");
                        document.querySelector(`.tw-stat[data-a-target="viewer-count"] .tw-stat__value`).innerHTML = channelData.stream.viewersCount;
                    } else {
                        document.querySelector(`.channel-info-bar__action-container .tw-tooltip-wrapper`).classList.add("tw-hide");
                    }
                    if (videosData.length > 0) document.querySelector(`[data-a-target="videos-channel-header-item"] .channel-header__item-count span`).innerHTML = videosData.length;
                }

                // add interval to check streamer data
                let streamerCheck = setInterval(async () => {
                    channelData = await gql.getChannel(args.name);
                    addStremerInfo(['not-first-init']);
                    console.log("streamercheck");
                }, 60000);
                addStremerInfo();
            };
            if (gql) {
                gqlAction();
            } else {
                let tempInit = setInterval(() => {
                    if (gql) {
                        gqlAction();
                        clearInterval(tempInit);
                    }
                }, 50);
            }


            // set chat
            chatIframe.src = `https://www.twitch.tv/embed/${args.name}/chat?parent=twitch.tv`;
        break;
    
        case "video":
            if (!args.id) return "Invalid args";

            // Enable divs
            document.querySelector(`.channel-header`).classList.remove("tw-hide");

            // set stream
            vodExec = () => {
                new Twitch.Player("iframe-insert", {
                    video: args.id,
                    muted: false
                });
            }
            if (Twitch !== undefined) {
                console.log(Twitch);
                vodExec();
            } else {
                let tempInit = setInterval(() => {
                    if (Twitch) {
                        vodExec();
                        clearInterval(tempInit);
                    }
                }, 50);
            }

            gqlAction = async () => {
                vodData = await gql.getVodInfo(args.id);
                console.log("vodData: ", vodData);
                channelData = await gql.getChannel(vodData.owner.login);
                videosData = await gql.getChannelVideos(vodData.owner.login);
                clipsData = await gql.getChannelClips(vodData.owner.login);
                console.log("channelData: ", channelData);

                // set streamer info
                async function addStremerInfo() {
                    notFirstInit();

                    // strings
                    document.querySelector(`[data-a-target="video-title"]`).innerHTML = vodData.title;
                    document.title = `"${vodData.title}" - ${document.title}`;
                    if (vodData.game) {
                        document.querySelector(`[data-a-target="category-holder"]`).classList.remove("tw-hide");
                        document.querySelector(`[data-a-target="category-title"]`).innerHTML = vodData.game.name;
                        document.querySelector(`[data-a-target="category-title"]`).parentElement.href = `https://www.twitch.tv/directory/category/${vodData.game.slug}`;    
                    }

                    // imgs
                    if (vodData.game) {
                        gameData = await gql.getCategory(vodData.game.slug);
                        console.log(gameData);
                        document.querySelector(`.tw-category-cover`).classList.remove("tw-hide");
                        document.querySelector(`.tw-category-cover`).src = gameData.avatarURL;
                    }

                    // ints
                    document.querySelector(`[data-a-target="total-views-count"]`).parentElement.parentElement.classList.remove("tw-hide");
                    document.querySelector(`[data-a-target="total-views-count"]`).parentElement.classList.remove("tw-hide");
                    document.querySelector(`.channel-header__item[data-a-target="followers-channel-header-item"] .channel-header__item-count span`).innerHTML = channelData.followerCount;
                    if (videosData.length > 0) document.querySelector(`[data-a-target="videos-channel-header-item"] .channel-header__item-count span`).innerHTML = videosData.length;

                    document.querySelector(`.tw-stat[data-a-target="viewer-count"]`).classList.add("tw-hide");
                    document.querySelector(`[data-a-target="total-views-count"] .tw-stat__value`).innerHTML = vodData.viewCount;
                }
                addStremerInfo();
            };
            if (gql) {
                gqlAction();
            } else {
                let tempInit = setInterval(() => {
                    if (gql) {
                        gqlAction();
                        clearInterval(tempInit);
                    }
                }, 50);
            }
        break;

        case "clip":
            if (!args.slug) return "Invalid args";

            // Enable divs
            document.querySelector(`.channel-info-bar__action-container .tw-tooltip-wrapper`).classList.add("tw-hide");
            document.querySelector(`.channel-header`).classList.remove("tw-hide");

            // set iframe
            let iframe = document.createElement('iframe');
            iframe.src = `https://clips.twitch.tv/embed?clip=${args.slug}&parent=${location.hostname}`;
            document.querySelector(`#iframe-insert`).appendChild(iframe);

            gqlAction = async () => {
                clipData = await gql.getClipInfo(args.slug);
                console.log("clipData: ", clipData);
                channelData = await gql.getChannel(clipData.broadcaster.login);
                videosData = await gql.getChannelVideos(clipData.broadcaster.login);
                clipsData = await gql.getChannelClips(clipData.broadcaster.login);
                console.log("channelData: ", channelData);

                // set streamer info
                async function addStremerInfo() {
                    notFirstInit();

                    // strings
                    document.querySelector(`[data-a-target="video-title"]`).innerHTML = clipData.title;
                    document.title = `"${clipData.title}" - ${document.title}`;
                    if (clipData.game) {
                        document.querySelector(`[data-a-target="category-holder"]`).classList.remove("tw-hide");
                        document.querySelector(`[data-a-target="category-title"]`).innerHTML = clipData.game.displayName;
                        document.querySelector(`[data-a-target="category-title"]`).parentElement.href = `https://www.twitch.tv/directory/category/${clipData.game.slug}`;    
                    }

                    // imgs
                    if (clipData.game) {
                        document.querySelector(`.tw-category-cover`).classList.remove("tw-hide");
                        document.querySelector(`.tw-category-cover`).src = clipData.game.boxArtURL;
                    }

                    // ints
                    document.querySelector(`[data-a-target="total-views-count"]`).parentElement.parentElement.classList.remove("tw-hide");
                    document.querySelector(`[data-a-target="total-views-count"]`).parentElement.classList.remove("tw-hide");
                    document.querySelector(`.channel-header__item[data-a-target="followers-channel-header-item"] .channel-header__item-count span`).innerHTML = channelData.followerCount;
                    if (videosData.length > 0) document.querySelector(`[data-a-target="videos-channel-header-item"] .channel-header__item-count span`).innerHTML = videosData.length;

                    document.querySelector(`.tw-stat[data-a-target="viewer-count"]`).classList.add("tw-hide");
                    document.querySelector(`[data-a-target="total-views-count"] .tw-stat__value`).innerHTML = clipData.viewCount;
                }
                addStremerInfo();
            };
            if (gql) {
                gqlAction();
            } else {
                let tempInit = setInterval(() => {
                    if (gql) {
                        gqlAction();
                        clearInterval(tempInit);
                    }
                }, 50);
            }
        break;
    }
}


// Check pathname
let pathname = location.pathname;
switch (true) {
    case pathname.startsWith("/videos/"):
        arg1 = pathname.split("/videos/").pop();
        if (arg1.includes("?")) arg1 = arg1.split("?")[0];
        setIframeVideo({ type: "video", id: arg1 });
    break;

    default:
        arg1 = pathname.split("/")[1];
        if (arg1.includes("?")) arg1 = arg1.split("?")[0];
        if (pathname.split("/").length > 1 && pathname.includes("/clip/")) setIframeVideo({ type: "clip", slug: pathname.split("clip/").pop(), channel: arg1 })
        else setIframeVideo({ type: "stream", name: arg1 });
    break;
}