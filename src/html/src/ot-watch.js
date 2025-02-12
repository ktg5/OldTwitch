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
                streamData = await gql.getStreamInfo(args.name);
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

                    // ints
                    document.querySelector(`.channel-header__item[data-a-target="followers-channel-header-item"] .channel-header__item-count .tw-font-size-5`).innerHTML = 69;
                    if (streamData.live) {
                        document.querySelector(`.channel-info-bar__action-container .tw-tooltip-wrapper`).classList.remove("tw-hide");
                        document.querySelector(`.tw-stat[data-a-target="total-views-count"] .tw-stat__value`).innerHTML = streamData.stream.viewersCount;
                    } else {
                        document.querySelector(`.channel-info-bar__action-container .tw-tooltip-wrapper`).classList.add("tw-hide");
                    }
                }

                // add interval to check streamer data
                let streamerCheck = setInterval(async () => {
                    streamData = await gql.getStreamInfo(args.name);
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