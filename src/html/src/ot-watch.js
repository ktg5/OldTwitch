var stream, channelData, videosData, clipsData;

var channelTabs = ["videos", "clips"];

// Main function
async function setIframeVideo (args) {
    if (typeof(args) != "object") return "Invalid args";
    if (!args.type) return "Invalid args";

    let chatIframe = document.querySelector(".chat-iframe");
    let playerRoot = document.querySelector(`[data-target="main-root"]`);

    async function notFirstInit() {
        // name & pfp
        document.querySelector(`.channel-header__user .tw-image`).src = channelData.profileImageURL;
        document.querySelector(`.channel-header__user-avatar-name`).innerHTML = `<span class="tw-font-size-5">${channelData.displayName}</span>`;

        // check if user is following streamer
        let followButton = document.querySelector(`[data-a-target="follow-button"]`);
        for (const channelInt in channels) {
            if (channels[channelInt].type == "RECS_FOLLOWED_SECTION") {
                channels[channelInt].items.forEach(channel => {
                    if (channel.user.login.toLowerCase() == channelData.login.toLowerCase()) {
                        followButton.className = "tw-button--hollow";
                        followButton.querySelector(`.tw-button__text`).innerHTML = "Following";
                    };
                });
            };
        };
        // add event listener to follow button to follow & unfollow
        followButton.addEventListener("click", () => {
            if (followButton.classList.contains("tw-button--hollow")) {
                // Following, so unfollow
                gql.unfollowChannelId(oauth, channelData.id);
                followButton.classList.remove("tw-button--hollow");
                followButton.classList.add("tw-button");
            } else {
                // Not following, so follow
                gql.followChannelId(oauth, channelData.id, false);
                followButton.classList.remove("tw-button");
                followButton.classList.add("tw-button--hollow");
            }
        });


        let sidePageRoot = document.querySelector(`[data-target="watch-side-page"]`);
        // Load the desired data of a streamer on watch page
        async function loadStreamerSidePage(sideargs) {
            if (!sideargs.elmnt) return alert("Invalid element");
            if (!sideargs.tab) return alert("Invalid tab");

            // clear old data
            let divInject = document.querySelector(`[data-a-target="directory-data-container"] .tw-tower`);
            divInject.innerHTML = "";

            let currentClickedTab = document.querySelector('.channel-header__user--selected');
            if (currentClickedTab == null) currentClickedTab = document.querySelector('.channel-header__item--selected');
            // remove active tab
            if (currentClickedTab) {
                currentClickedTab.classList.remove("channel-header__user--selected");
                currentClickedTab.classList.remove("channel-header__item--selected");
            }
            // make player popout
            sideargs.elmnt.classList.add("channel-header__item--selected");
            playerRoot.classList.add("player-popout");


            // set data
            function setTabData(data) {
                if (!data) return alert("Invalid data");
                if (data.length < 1) return divInject.innerHTML = `<h4 style="max-width: 100%; width: 100%;">There doesn't seem to be anything here...</h4>`;

                data.forEach(item => {
                    console.log(item);
                    // href
                    let itemHref, itemType;
                    if (item.__typename == "Clip") { itemHref = `https://www.twitch.tv/${channelData.login}/clips/${item.slug}`; itemType = "clip"; }
                    else if (item.__typename == "Video") { itemHref = `https://www.twitch.tv/videos/${item.id}`; itemType = "video"; }

                    // subtext - game category
                    let itemSubtext = `<a href="https://www.twitch.tv/directory/category/${item.game.slug}">${item.game.displayName ? item.game.displayName : item.game.name}</a>`;

                    // subtext 2
                    let itemSubtext2;
                    if (itemType == "clip") itemSubtext2 = `<p class="item-subtext tw-font-size-7">Clipped by <a href="https://www.twitch.tv/${item.curator.login}">${item.curator.displayName}</a></p>`;

                    let streamerDiv = document.createElement('div');
                    streamerDiv.className = "directory-item";
                    streamerDiv.innerHTML = `
                    <div class="tw-mg-b-2">
                        <div class="tw-mg-b-05">
                            <figure class="tw-aspect tw-aspect--16x9 tw-aspect--align-top">
                                <a href="${itemHref}">
                                    <img class="tw-image" src="${item.animatedPreviewURL ? item.animatedPreviewURL : item.thumbnailURL}">
                                </a>
                            </figure>
                        </div>
                        <div class="item-info">
                            <a href="https://www.twitch.tv/directory/category/${item.game.slug}" style="display: contents;"><img class="tw-image item-category-img" src="${item.game.boxArtURL}"></a>
                            <div class="item-text">
                                <p class="item-name"><a href="${itemHref}">${item.title}</a></p>
                                <p class="item-subtext tw-font-size-7">${itemSubtext}</p>
                                ${itemSubtext2}
                            </div>
                        </div>
                    </div>
                    `;
                    divInject.appendChild(streamerDiv);
                });
            }

            // check tab type & go to the set data function
            switch (sideargs.tab) {
                case "videos":
                    sidePageRoot.classList.remove("tw-hide");
                    setTabData(videosData);
                break;
            
                case "clips":
                    sidePageRoot.classList.remove("tw-hide");

                    if (!clipsData) clipsData = await gql.getChannelClips(args.channel);
                    setTabData(clipsData);
                break;
            }
        }

        // Go to main page on watch page
        function goToMain() {
            document.querySelectorAll('.channel-header__item--selected').forEach(item => item.classList.remove("channel-header__item--selected"));

            document.querySelector(`[data-a-target="user-channel-header-item"]`).classList.add("channel-header__user--selected");
            playerRoot.classList.remove("player-popout");
            sidePageRoot.classList.add("tw-hide");
            location.hash = "";
        }

        
        // only go for stream type
        if (args.type == "stream") {
            // go to tab if found
            if (location.hash.length > 0) {
                let tab = location.hash.split("#")[1];
                let elmnt = document.querySelector(`[data-a-target="${tab}-channel-header-item"]`);

                if (elmnt) loadStreamerSidePage({elmnt: elmnt, tab: tab});
            }

            // Make topbar buttons worky
            document.addEventListener("click", async (e) => {
                let closestTarget = e.target.closest(`[data-target="channel-header-item"]`);
    
                if (closestTarget) {
                    // if the clicked tab is the user tab
                    if (closestTarget.getAttribute("data-a-target") == "user-channel-header-item") goToMain();
                    // else if a normal tab
                    else if (closestTarget.href) {
                        loadStreamerSidePage({elmnt: closestTarget, tab: closestTarget.getAttribute('data-a-target').split('-channel-header-item')[0]});
                    }
                }
            });
        } else {
            document.addEventListener("click", async (e) => {
                let closestTarget = e.target.closest(`[data-target="channel-header-item"]`);

                if (closestTarget) {
                    setTimeout(() => {
                        // change location.href
                        location.href = `${location.origin}/${channelData.login}${location.hash ? `${location.hash}` : ""}`;
                    }, 10);
                }
            });
        }


        // Make popout stream work
        document.addEventListener("click", async (e) => {
            if (playerRoot.classList.contains("player-popout")) {
                if (e.target.closest(`.persistent-player`)) {
                    goToMain();
                }
            }
        });


        // check if channel name is the same as the current user
        if (channelData.displayName != userData.displayName) document.querySelector(`[data-a-target="follow-button"]`).parentElement.classList.remove("tw-hide");
        let subButton = document.querySelector(`[data-a-target="subscribe-button"]`).parentElement;
        if (channelData.roles.isAffiliate || channelData.roles.isPartner) {
            subButton.classList.remove("tw-hide");
            subButton.href = `https://www.twitch.tv/subs/${channelData.login}`;
        }

        // make share button work
        let shareButton = document.querySelector(`[data-a-target="share-button"]`);
        let shareButtonBalloon = document.querySelector(`[data-a-target="share-balloon"]`);
        document.addEventListener("click", (e) => {
            if (e.target.closest(`[data-a-target="share-button"]`)) return shareButtonBalloon.classList.toggle("tw-hide");
            else if (e.target.closest(`[data-a-target="share-balloon"]`)) return;
            else shareButtonBalloon.classList.add("tw-hide");
        });
        // buttons
        let clipBoardButton = document.querySelector(`[data-share-button="clipboard"]`);
        clipBoardButton.addEventListener("click", () => {
            navigator.clipboard.writeText(`https://www.twitch.tv/${channelData.login}`);
            clipBoardButton.querySelector(`.tw-tooltip`).innerHTML = "Copied to clipboard";
        });
        clipBoardButton.addEventListener("mouseout", () => {
            clipBoardButton.querySelector(`.tw-tooltip`).innerHTML = "Copy to clipboard";
        });
        // text boxes
        document.querySelector(`[data-share-text="embed-channel"] .tw-input`).value = `<iframe src="https://player.twitch.tv/?channel=${channelData.login}&parent=localhost" frameborder="0" allowfullscreen="true" scrolling="no" height="315" width="100%"></iframe>`;
        document.querySelector(`[data-share-text="embed-chat"] .tw-input`).value = `<iframe src="https://www.twitch.tv/embed/${channelData.login}/chat?parent=localhost" frameborder="0" scrolling="no" height="315" width="100%"></iframe>`;
    }

    switch (args.type) {
        case "stream":
            if (!args.channel) return "Invalid args";

            // Enable divs
            document.querySelector(`[data-a-target="right-column-chat-bar"]`).classList.remove("tw-hide");
            document.querySelector(`.channel-header`).classList.remove("tw-hide");

            localStorage.setItem("oldttv-lastchannel", localStorage.getItem("oldttv-currentchannel"));
            localStorage.setItem("oldttv-currentchannel", args.channel);

            // set stream
            vodExec = () => {
                new Twitch.Player("iframe-insert", {
                    channel: args.channel,
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
                channelData = await gql.getChannel(args.channel);
                videosData = await gql.getChannelVods(args.channel);
                console.log("channelData: ", channelData);

                // set streamer info
                function addStremerInfo(funcargs) {
                    if (funcargs == null || !funcargs.includes("not-first-init")) {
                        // defaults
                        notFirstInit();

                        // panels
                        let panelsContainer = document.querySelector(`.channel-panels-container`);
                        channelData.panels.forEach(panel => {
                            // check if the current panel is a blank panel
                            if (panel.description == null && panel.title == null && panel.imageURL == null && panel.linkURL == null) return;

                            // insert panel
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
                    // document.querySelector(`[data-a-target="total-views-count"]`).parentElement.parentElement.classList.remove("tw-hide");
                    document.querySelector(`.channel-header__item[data-a-target="followers-channel-header-item"] .channel-header__item-count span`).innerHTML = channelData.followerCount;
                    if (channelData.live) {
                        document.querySelector(`.channel-info-bar__action-container .tw-flex`).classList.remove("tw-hide");
                        document.querySelector(`.channel-info-bar__action-container .tw-tooltip-wrapper`).classList.remove("tw-hide");
                        document.querySelector(`.tw-stat[data-a-target="viewer-count"] .tw-stat__value`).innerHTML = channelData.stream.viewersCount;
                    } else {
                        document.querySelector(`.channel-info-bar__action-container .tw-tooltip-wrapper`).classList.add("tw-hide");
                        document.querySelector(`.tw-stat[data-a-target="viewer-count"]`).parentElement.classList.add("tw-hide");
                    }
                    if (videosData.length > 0) document.querySelector(`[data-a-target="videos-channel-header-item"] .channel-header__item-count span`).innerHTML = videosData.length;
                }

                // add interval to check streamer data
                let streamerCheck = setInterval(async () => {
                    channelData = await gql.getChannel(args.channel);
                    addStremerInfo(['not-first-init']);
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
            chatIframe.src = `https://www.twitch.tv/embed/${args.channel}/chat?parent=twitch.tv`;
        break;
    
        case "video":
            if (!args.id) return "Invalid args";

            // Enable divs
            document.querySelector(`.channel-header`).classList.remove("tw-hide");

            // Get possible timecode args
            let timecode = "0h0m0s";
            if (location.search.includes("&t=")) timecode = location.search.split("&t=").pop();

            // set stream
            vodExec = () => {
                new Twitch.Player("iframe-insert", {
                    video: args.id,
                    muted: false,
                    time: timecode
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
                videosData = await gql.getChannelVods(vodData.owner.login);
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
                    document.querySelector(`.channel-info-bar__action-container .tw-flex`).classList.remove("tw-hide");
                    document.querySelector(`[data-a-target="total-views-count"]`).parentElement.parentElement.classList.remove("tw-hide");
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
                videosData = await gql.getChannelVods(clipData.broadcaster.login);
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
                    document.querySelector(`.channel-info-bar__action-container .tw-flex`).classList.remove("tw-hide");
                    document.querySelector(`[data-a-target="total-views-count"]`).parentElement.parentElement.classList.remove("tw-hide");
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
        else setIframeVideo({ type: "stream", channel: arg1 });
    break;
}
