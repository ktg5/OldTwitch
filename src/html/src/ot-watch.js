var stream;
var streamData;

// Main function
async function setIframeVideo (args) {
    if (typeof(args) != "object") return "Invalid args";
    if (!args.type) return "Invalid args";

    let iframe = document.querySelector(".video-player-iframe");
    let chatIframe = document.querySelector(".chat-iframe");

    switch (args.type) {
        case "stream":
            if (!args.name) return "Invalid args";

            localStorage.setItem("oldttv-lastchannel", localStorage.getItem("oldttv-currentchannel"));
            localStorage.setItem("oldttv-currentchannel", args.name);

            // set stream
            let vodExec = () => {
                new Twitch.Player("stream-insert", {
                    channel: args.name,
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

            let gqlAction = async () => {
                streamData = await gql.getChannel(args.name);
                videosData = await gql.getChannelVideos(args.name);
                clipsData = await gql.getChannelClips(args.name);
                console.log("streamData: ", streamData);

                // set streamer info
                function addStremerInfo(funcargs) {
                    if (funcargs == null || !funcargs.includes("not-first-init")) {
                        // name & pfp
                        document.querySelector(`.channel-header__user .tw-image`).src = streamData.profileImageURL;
                        placeholderToText(document.querySelector(`.channel-header__user .tw-placeholder-wrapper`), streamData.displayName);

                        // panels
                        let panelsContainer = document.querySelector(`.channel-panels-container`);
                        streamData.panels.forEach(panel => {
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

                        // check if user is following streamer
                        for (const channelInt in channels) {
                            if (channels[channelInt].type == "RECS_FOLLOWED_SECTION") {
                                channels[channelInt].items.forEach(channel => {
                                    if (channel.user.login == args.name) {
                                        let followButton = document.querySelector(`[data-a-target="follow-button"]`);
                                        followButton.className = "tw-button--hollow";
                                        followButton.querySelector(`.tw-button__text`).innerHTML = "Following";
                                    };
                                });
                            };
                        };
                    }

                    // strings
                    document.querySelector(`[data-a-target="stream-title"]`).innerHTML = streamData.broadcastSettings.title;
                    if (streamData.broadcastSettings.game) {
                        document.querySelector(`[data-a-target="category-holder"]`).classList.remove("tw-hide");
                        document.querySelector(`[data-a-target="category-title"]`).innerHTML = streamData.broadcastSettings.game.displayName;
                        document.querySelector(`[data-a-target="category-title"]`).parentElement.href = `https://www.twitch.tv/directory/category/${streamData.broadcastSettings.game.slug}`;    
                    }
                    if (streamData.primaryTeam) {
                        document.querySelector(`[data-a-target="team-holder"]`).classList.remove("tw-hide");
                        document.querySelector(`[data-a-target="team-name"]`).innerHTML = streamData.primaryTeam.displayName;
                        document.querySelector(`[data-a-target="team-name"]`).parentElement.href = `https://www.twitch.tv/team/${streamData.primaryTeam.name}?nooldttv`;
                    }

                    // imgs
                    if (streamData.broadcastSettings.game) {
                        document.querySelector(`.tw-category-cover`).classList.remove("tw-hide");
                        document.querySelector(`.tw-category-cover`).src = streamData.broadcastSettings.game.avatarURL;
                    }

                    // ints
                    document.querySelector(`[aria-describedby="228759886d06d5fdd94e8a05596b023b"]`).parentElement.classList.remove("tw-hide");
                    document.querySelector(`.channel-header__item[data-a-target="followers-channel-header-item"] .channel-header__item-count span`).innerHTML = streamData.followerCount;
                    if (streamData.live) {
                        document.querySelector(`.channel-info-bar__action-container .tw-tooltip-wrapper`).classList.remove("tw-hide");
                        document.querySelector(`.tw-stat[data-a-target="viewer-count"] .tw-stat__value`).innerHTML = streamData.stream.viewersCount;
                    } else {
                        document.querySelector(`.channel-info-bar__action-container .tw-tooltip-wrapper`).classList.add("tw-hide");
                    }
                    if (videosData.length > 0) document.querySelector(`[data-a-target="videos-channel-header-item"] .channel-header__item-count span`).innerHTML = videosData.length;
                }

                // add interval to check streamer data
                let streamerCheck = setInterval(async () => {
                    streamData = await gql.getChannel(args.name);
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
    }
}


// Check pathname
switch (true) {
    case location.pathname.startsWith("/videos/"):
        arg1 = location.pathname.split("/videos/").pop();
        if (arg1.includes("?")) arg1 = arg1.split("?")[0];
        setIframeVideo({ type: "video", id: arg1 });
    break;

    default:
        arg1 = location.pathname.split("/").pop();
        if (arg1.includes("?")) arg1 = arg1.split("?")[0];
        setIframeVideo({ type: "stream", name: arg1 });
    break;
}