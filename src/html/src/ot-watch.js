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
                // name & pfp
                document.querySelector(`.channel-header__user .tw-image`).src = streamData.profileImageURL;
                placeholderToText(document.querySelector(`.channel-header__user .tw-placeholder-wrapper`), streamData.displayName);
                // ints
                document.querySelector(`.channel-header__item[data-a-target="followers-channel-header-item"] .channel-header__item-count .tw-font-size-5`).innerHTML = 69;
                if (streamData.live) {
                    document.querySelector(`.channel-info-bar__action-container .tw-tooltip-wrapper`).classList.remove("tw-hide");
                    document.querySelector(`.tw-stat[data-a-target="total-views-count"] .tw-stat__value`).innerHTML = streamData.stream.viewersCount;
                } else {
                    document.querySelector(`.channel-info-bar__action-container .tw-tooltip-wrapper`).classList.add("tw-hide");
                }
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