var stream, channelData, videosData, clipsData;

const channelTabs = ["videos", "clips"];

// Main function
async function setIframeVideo (args) {
    console.log(`setIframeVideo:`, args)
    if (typeof(args) != "object") return "Invalid args";
    if (!args.type) return "Invalid args";

    let chatIframe = document.querySelector(".chat-iframe");
    let playerRoot = document.querySelector(`[data-target="main-root"]`);

    // Add data to page that's for every path
    async function notFirstInit() {
        // name & pfp
        document.querySelector(`.channel-header__user .tw-image`).src = channelData.profileImageURL;
        document.querySelector(`.channel-header__user-avatar-name`).innerHTML = `<span class="tw-font-size-5">${channelData.displayName}</span>`;

        // check if user is following streamer
        let followButton = document.querySelector(`[data-a-target="follow-button"]`);
        for (const channelInt in channels) {
            if (channels[channelInt].id == "provider-side-nav-followed-channels-1") {
                channels[channelInt].items.forEach(channel => {
                    if (channel == null) return;
                    if (channel.broadcaster == null) channel.broadcaster = channel;
                    if (channel.broadcaster.login.toLowerCase() == channelData.login.toLowerCase()) {
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
                    // href
                    let itemHref, itemType;
                    if (item.__typename == "Clip") { itemHref = `https://www.twitch.tv/${channelData.login}/clips/${item.slug}`; itemType = "clip"; }
                    else if (item.__typename == "Video") { itemHref = `https://www.twitch.tv/videos/${item.id}`; itemType = "video"; }

                    // subtext - game category
                    let itemSubtext = `<a href="https://www.twitch.tv/directory/category/${item.game.slug}">${item.game.displayName ? item.game.displayName : item.game.name}</a>`;

                    // subtext 2
                    let itemSubtext2 = "";
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

        
        // Channel tabs
        if (args.type == "stream") {
            // Open tab if location.hash contains a `channel-header-item`
            if (location.hash.length > 0) {
                let tab = location.hash.split("#")[1];
                let elmnt = document.querySelector(`[data-a-target="${tab}-channel-header-item"]`);

                if (elmnt) loadStreamerSidePage({elmnt: elmnt, tab: tab});
            }

            // On channel tab click, open it's tab
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
            // If not on the channel's page (aka a clip or vod of their own)
            document.addEventListener("click", async (e) => {
                let closestTarget = e.target.closest(`[data-target="channel-header-item"]`);

                if (closestTarget) {
                    setTimeout(() => {
                        // Go to their channel w/ the location.hash that'll be used to open the channel tab automatically
                        // See the stuff above
                        location.href = `https://twitch.tv/${channelData.login}${location.hash ? `${location.hash}` : ""}`;
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
        if (userData) if (channelData.displayName != userData.displayName) document.querySelector(`[data-a-target="follow-button"]`).parentElement.classList.remove("tw-hide");
        let subButton = document.querySelector(`[data-a-target="subscribe-button"]`).parentElement;
        if (channelData.roles.isAffiliate || channelData.roles.isPartner) {
            subButton.classList.remove("tw-hide");
            subButton.href = `https://www.twitch.tv/subs/${channelData.login}`;
        }

        // buttons
        let clipBoardButton = document.querySelector(`[data-share-button="clipboard"]`);
        clipBoardButton.addEventListener("click", () => {
            navigator.clipboard.writeText(location.href);
            clipBoardButton.querySelector(`.tw-tooltip`).innerHTML = "Copied to clipboard";
        });
        clipBoardButton.addEventListener("mouseout", () => {
            clipBoardButton.querySelector(`.tw-tooltip`).innerHTML = "Copy to clipboard";
        });
        // text boxes
        document.querySelector(`[data-share-text="embed-channel"] .tw-input`).value = `<iframe src="https://player.twitch.tv/?channel=${channelData.login}&parent=localhost" frameborder="0" allowfullscreen="true" scrolling="no" height="315" width="100%"></iframe>`;
        document.querySelector(`[data-share-text="embed-chat"] .tw-input`).value = `<iframe src="https://www.twitch.tv/embed/${channelData.login}/chat?parent=localhost" frameborder="0" scrolling="no" height="315" width="100%"></iframe>`;
    }

    const totalViewsDiv = document.querySelector('[data-a-target="total-views-count"]');

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

            let streamClock;
            gqlAction = async () => {
                channelData = await gql.getChannel(args.channel);
                if (!channelData) showError({ id: 404 })
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
                            if (panel.type !== "EXTENSION") if (panel.description == null && panel.title == null && panel.imageURL == null && panel.linkURL == null) return;

                            // insert panel
                            let panelDiv = document.createElement("div");
                            panelDiv.className = "default-panel"
                            panelDiv.setAttribute("data-a-target", `panel-${panelsContainer.childElementCount}`);
                            if (panel.type !== "EXTENSION") {
                                panelDiv.innerHTML = `
                                ${panel.linkURL ? `<a data-test-selector="link_url_panel" class="tw-link" rel="noopener noreferrer" target="_blank" href="${panel.linkURL}">` : ""}
                                    ${panel.title ? `<h3 data-test-selector="title_panel" class="tw-title">${panel.title}</h3>`: ""}
                                    ${panel.imageURL ? `<img data-test-selector="image_panel" src="${panel.imageURL}">` : ""}
                                ${panel.linkURL ? "</a>" : ""}
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
                    document.querySelector(`.channel-header__item[data-a-target="followers-channel-header-item"] .channel-header__item-count span`).innerHTML = channelData.followerCount;
                    if (channelData.live) {
                        document.querySelector(`.channel-info-bar__action-container .tw-flex`).classList.remove("tw-hide");
                        document.querySelector(`.channel-info-bar__action-container .tw-tooltip-wrapper`).classList.remove("tw-hide");
                        document.querySelector(`.tw-stat[data-a-target="viewer-count"] .tw-stat__value`).innerHTML = channelData.stream.viewersCount;

                        
                        // clock
                        if (funcargs == null || !funcargs.includes("not-first-init")) {
                            const clockStat = document.querySelector('[data-a-target="current-time"] .tw-stat__value');
                            const startedAt = new Date(channelData.stream.startedAt);
                            let currentTime = new Date();

                            streamClock = setInterval(() => {
                                currentTime = new Date();
                                clockStat.innerHTML = getDateDiff(currentTime, startedAt);
                            }, 1000);
                            clockStat.innerHTML = getDateDiff(currentTime, startedAt);
                            clockStat.parentElement.parentElement.classList.remove('tw-hide');
                        }
                    } else {
                        clearInterval(streamClock);
                        streamClock = null;
                        // Hide all stream info
                        document.querySelector(`.channel-info-bar__action-container .tw-tooltip-wrapper`).classList.add("tw-hide");
                        document.querySelector(`.tw-stat[data-a-target="viewer-count"]`).parentElement.classList.add("tw-hide");
                        document.querySelector(`.tw-stat[data-a-target="current-time"]`).parentElement.classList.add("tw-hide");
                    }
                    if (videosData.length > 0) document.querySelector(`[data-a-target="videos-channel-header-item"] .channel-header__item-count span`).innerHTML = videosData.length;

                }
                addStremerInfo();


                // Make a Hermes listener to listen for stream data changes
                const hermes = new Hermes(Number(channelData.id), 'all');

                // Stream end
                hermes.on('stream_end', async (d) => {
                    channelData.stream = null;
                    channelData.live = false;

                    addStremerInfo(['not-first-init']);
                });

                // Stream info update
                hermes.on('stream_info_update', async (d) => {
                    const dataOnEvent = await gql.getChannelSimple(d.channel);
                    console.log(`dataOnEvent: `, dataOnEvent);

                    channelData.broadcastSettings = dataOnEvent.broadcastSettings;
                    channelData.stream = dataOnEvent.stream;
                    if (channelData.stream == null) channelData.live = false;
                    console.log(`edited channelData: `, channelData);

                    addStremerInfo(['not-first-init']);
                });

                // Viewer count update
                hermes.on('viewcount', async (d) => {
                    channelData.stream.viewersCount = d.viewers;
                    addStremerInfo(['not-first-init']);
                });
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
            let chatIframeDoc, chatIframeWindow;
            chatOnLoad = (e) => {
                chatIframeDoc = chatIframe.contentDocument;
                chatIframeWindow = chatIframe.contentWindow;

                // Check for dark mode
                const HTMLDiv = document.querySelector('html');
                const IfHTMLDiv = chatIframeDoc.querySelector('html');
                if (HTMLDiv.classList.contains('tw-theme--dark')) {
                    // Make sure the stupid browser sets the damn theme
                    setInterval(() => {
                        if (
                            darkTheme
                            && IfHTMLDiv.classList.contains('tw-root--theme-light')
                        ) {
                            IfHTMLDiv.classList.remove('tw-root--theme-light');
                            IfHTMLDiv.classList.add('tw-root--theme-dark');
                        }
                    }, 1000);

                    let customRoot = chatIframeDoc.createElement('style');
                    customRoot.innerHTML = `
                    :root {
                        --color-background-body: #0e0c13 !important;
                        --color-background-base: #0e0c13 !important;
                        --color-background-float: #0e0c13 !important;
                        --color-background-alt:  #2c2541 !important;
                        --color-background-alt-2: #2c2541 !important;
                        --color-text-base: #ebe9ee !important;
                        --color-text-label: #ebe9ee !important;
                        --color-text-alt: #b8b5c0 !important;
                        --color-text-alt-2: #b8b5c0 !important;
                        --color-fill-current: rgb(216 216 222) !important;
                        --color-text-link: #a070ea !important;
                        --color-border-input: #392e5c !important;
                        --color-border-input-hover: #635199 !important;
                        --color-background-input-checkbox-checked-background: black !important;
                        --color-border-input-checkbox: rgb(216 216 227 / 95%) !important;
                        --color-border-input-checkbox-hover: var(--color-border-input-checkbox-checked) !important;
                    }
                    `;
                    chatIframeDoc.head.appendChild(customRoot);
                } else {
                    let customRoot = chatIframeDoc.createElement('style');
                    customRoot.innerHTML = `
                    :root {
                        --color-background-body: #efeef1 !important;
                        --color-background-base: #efeef1 !important;
                        --color-background-float: #efeef1 !important;
                        --color-background-alt: #efeef1 !important;
                        --color-background-alt-2: #efeef1 !important;
                        --color-text-base: black !important;
                        --color-text-label: black !important;
                        --color-text-alt: #616064 !important;
                        --color-text-alt-2: #616064 !important;
                        --color-fill-current: white !important;
                        --color-text-link: #6616e0 !important;
                        --color-border-input: #635199 !important;
                        --color-border-input-hover: #392e5c !important;
                        --color-background-input-checkbox-checked-background: black !important;
                        --color-border-input-checkbox: rgb(216 216 227 / 95%) !important;
                        --color-border-input-checkbox-hover: var(--color-border-input-checkbox-checked) !important;
                    }
                    `;
                    chatIframeDoc.head.appendChild(customRoot);
                }
            };
            chatIframe.addEventListener('load', chatOnLoad);
        break;
    
        case "video":
            if (!args.id) return "Invalid args";

            // Enable divs
            totalViewsDiv.classList.remove('tw-hide');
            totalViewsDiv.parentElement.classList.remove('tw-hide');
            document.querySelector(`.channel-header`).classList.remove("tw-hide");

            // Get possible timecode args
            let timecode = "0h0m0s";
            if (location.search.includes("t=")) timecode = location.search.split("t=").pop();

            // set stream
            vodExec = () => {
                new Twitch.Player("iframe-insert", {
                    video: args.id,
                    muted: false,
                    time: timecode
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
                vodData = await gql.getVodInfo(args.id);
                if (!vodData) return showError({ id: 404 });
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
                        document.querySelector(`.tw-category-cover`).classList.remove("tw-hide");
                        document.querySelector(`.tw-category-cover`).src = gameData.avatarURL;
                    }

                    // ints
                    document.querySelector(`.channel-info-bar__action-container .tw-flex`).classList.remove("tw-hide");
                    document.querySelector(`.channel-header__item[data-a-target="followers-channel-header-item"] .channel-header__item-count span`).innerHTML = channelData.followerCount;
                    if (videosData.length > 0) document.querySelector(`[data-a-target="videos-channel-header-item"] .channel-header__item-count span`).innerHTML = videosData.length;

                    document.querySelector(`.tw-stat[data-a-target="viewer-count"]`).classList.add("tw-hide");
                    totalViewsDiv.querySelector(`.tw-stat__value`).innerHTML = vodData.viewCount;
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
            var clipData;

            if (!args.slug) return "Invalid args";

            // Enable divs
            totalViewsDiv.classList.remove('tw-hide');
            totalViewsDiv.parentElement.classList.remove('tw-hide');
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
                document.querySelector(`.channel-header__item[data-a-target="followers-channel-header-item"] .channel-header__item-count span`).innerHTML = channelData.followerCount;
                if (videosData.length > 0) document.querySelector(`[data-a-target="videos-channel-header-item"] .channel-header__item-count span`).innerHTML = videosData.length;

                document.querySelector(`.tw-stat[data-a-target="viewer-count"]`).classList.add("tw-hide");
                totalViewsDiv.querySelector(`.tw-stat__value`).innerHTML = clipData.viewCount;

                // extra
                // watch vod button
                const vodButton = document.querySelector('[data-a-target="vodview-button"]');
                vodButton.classList.remove('tw-hide');
                const clipSeconds = clipData.videoOffsetSeconds;
                const decodeTime = `${Math.floor(clipSeconds / 3600)}h${Math.floor((clipSeconds % 3600) / 60)}m${clipSeconds % 60 - 30}s`;
                vodButton.querySelector('button').addEventListener('click', e => { location.href = `https://twitch.tv/videos/${clipData.video.id}?t=${decodeTime}` });
                // add edit button if owner of clip
                if (
                    clipData.curator.displayName == userData.displayName
                    || clipData.broadcaster.displayName == userData.displayName
                ) {
                    const editButton = document.querySelector('[data-a-target="editclip-button"]');
                    editButton.classList.remove('tw-hide');
                    editButton.querySelector('button').addEventListener('click', e => { location.href = `https://www.twitch.tv/${clipData.curator.login}/clip/${args.slug}?editclip&nooldttv` });
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
        else if (location.host == "clips.twitch.tv") setIframeVideo({ type: "clip", slug: pathname.split("/").pop(), channel: null })
        else setIframeVideo({ type: "stream", channel: arg1 });
    break;
}
