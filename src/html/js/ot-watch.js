/// <reference path="ot-hermes.d.ts" />
/// <reference path="ot-webmain.js" />


var stream, channelData, videosData, clipsData;

const channelTabs = ["videos", "clips"];

// Main function
async function setIframeVideo (args) {
    console.log(`setIframeVideo:`, args)
    if (typeof(args) != "object") return "Invalid args";
    if (!args.type) return "Invalid args";

    /** @type { HTMLIFrameElement } */
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


        // Side page
        const sidePageSortBar = new SortBar(document.querySelector('[data-a-target="sort-bar"]'));
        const sidePageLoading = new LoadingSpinner(sidePageSortBar.div, true);
        let sidePageRoot = document.querySelector(`[data-target="watch-side-page"]`);
        // Load the desired data of a streamer on watch page
        async function loadStreamerSidePage(sideargs) {
            if (!sideargs.elmnt) return alert("Invalid element");
            if (!sideargs.tab) return alert("Invalid tab");

            let divInject = document.querySelector(`[data-a-target="directory-data-container"] .tw-tower`);
            clearPageData();

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


            function clearPageData(forceSpinner) {
                divInject.innerHTML = "";
                sidePageLoading.toggle(forceSpinner !== null && typeof forceSpinner == "boolean" ? forceSpinner : true);
            }


            // Set sort bar data depending on page
            switch (sideargs.tab) {
                case "clips":
                    sidePageSortBar.setOptions([
                        {
                            id: "clips",
                            textBeforeSelect: lang.page['show-from'],
                            selections: [
                                {
                                    id: "last_day",
                                    displayName: lang.page['last-day'],
                                    onSelect: async (d) => {
                                        clearPageData();
                                        setTabData(await gql.getChannelMedia(args.channel, "CLIPS", 30, "LAST_DAY"));
                                    }
                                },
                                {
                                    id: "last_week",
                                    displayName: lang.page['last-week'],
                                    onSelect: async (d) => {
                                        clearPageData();
                                        setTabData(await gql.getChannelMedia(args.channel, "CLIPS", 30, "LAST_WEEK"));
                                    }
                                },
                                {
                                    id: "last_month",
                                    displayName: lang.page['last-month'],
                                    onSelect: async (d) => {
                                        clearPageData();
                                        setTabData(await gql.getChannelMedia(args.channel, "CLIPS", 30, "LAST_MONTH"));
                                    }
                                },
                                {
                                    id: "all_time",
                                    displayName: lang.page['all-time'],
                                    onSelect: async (d) => {
                                        clearPageData();
                                        setTabData(await gql.getChannelMedia(args.channel, "CLIPS", 30, "ALL_TIME"));
                                    }
                                }
                            ]
                        }
                    ])
                break;

                case "videos":
                    sidePageSortBar.setOptions([
                        {
                            id: "vod",
                            textBeforeSelect: "Show all",
                            selections: [
                                {
                                    id: "videos",
                                    displayName: lang.page['video-tab'],
                                    onSelect: async (d) => {
                                        clearPageData();
                                        setTabData(await gql.getChannelMedia(args.channel, "VIDEOS"));
                                    }
                                },
                                {
                                    id: "archives",
                                    displayName: lang.page['archives'],
                                    onSelect: async (d) => {
                                        clearPageData();
                                        setTabData(await gql.getChannelMedia(args.channel, "ARCHIVE"));
                                    }
                                },
                                {
                                    id: "highlights",
                                    displayName: lang.page['highlights'],
                                    onSelect: async (d) => {
                                        clearPageData();
                                        setTabData(await gql.getChannelMedia(args.channel, "HIGHLIGHT"));
                                    }
                                }
                            ]
                        }
                    ])
                break;
            };


            // set data
            function setTabData(data) {
                if (!data) return alert("setTabData: Invalid data");

                clearPageData(false);
                // Check if there wasn't any data from the GQL request
                if (data.length < 1) return divInject.innerHTML = `<h4 style="max-width: 100%; width: 100%;">There doesn't seem to be anything here...</h4>`;
                // Make HTML
                else data.forEach(item => {
                    // href
                    let itemHref, itemType;
                    let itemId = item.slug ? item.slug : item.id;
                    if (item.__typename == "Clip") { itemHref = `https://www.twitch.tv/${channelData.login}/clip/${itemId}`; itemType = "clip"; }
                    else if (item.__typename == "Video") { itemHref = `https://www.twitch.tv/${channelData.login}/video/${itemId}`; itemType = "video"; }

                    // subtext - game category
                    let itemSubtext = "";
                    if (item.game) itemSubtext = `<a href="https://www.twitch.tv/directory/category/${item.game.slug}">${item.game.displayName ? item.game.displayName : item.game.name}</a>`;

                    // subtext 2
                    let itemSubtext2 = "";
                    let vodDateTxt;
                    if (itemType == "clip") itemSubtext2 = `<p class="item-subtext tw-font-size-7">
    ${lang.page["clipped-by"].replace('&OLDTTV{CREATOR}&', `<a href="https://www.twitch.tv/${item.curator.login}">${item.curator.displayName}</a>`)}
</p>`;
                    else if (itemType == "video") {
                        const vodDate = new Date(item.publishedAt);
                        vodDateTxt = formatDate(vodDate).usFormat;
                        itemSubtext2 = `<p class="item-subtext tw-font-size-7" title="${vodDateTxt}">${calcDateDiffToTxt(currentDate, vodDate)} ago</p>`;
                    }

                    let streamerDiv = document.createElement('div');
                    streamerDiv.className = "directory-item";
                    streamerDiv.innerHTML = `
                    <div class="tw-mg-b-2" id="${itemId}">
                        <div class="tw-mg-b-05" ${vodDateTxt ? `title="${vodDateTxt}"` : ""}>
                            <figure class="tw-aspect tw-aspect--16x9 tw-aspect--align-top">
                                <a href="${itemHref}">
                                    <img class="tw-image tw-absolute tw-full-width" src="${item.animatedPreviewURL ? item.animatedPreviewURL : item.thumbnailURL}">
                                </a>
                            </figure>
                        </div>
                        <div class="item-info">
                            ${item.game ? `<a href="https://www.twitch.tv/directory/category/${item.game.slug}" style="display: contents;"><img class="tw-image item-category-img" src="${item.game.boxArtURL}"></a>` : ""}
                            <div class="item-text">
                                <p class="item-name" title="${item.title}"><a href="${itemHref}">${item.title}</a></p>
                                <p class="item-subtext tw-font-size-7">${itemSubtext}</p>
                                ${itemSubtext2}
                            </div>
                        </div>
                    </div>
                    `;
                    divInject.appendChild(streamerDiv);


                    // Divs
                    const elmnt = document.querySelector(`.tw-mg-b-2[id="${itemId}"`);
                    const figureDiv = elmnt.querySelector('.tw-mg-b-05 figure');
                    const figMaxHeight = figureDiv.clientHeight;
                    const thumbDiv = figureDiv.querySelector('.tw-image');
                    const thumbLength = Math.round(thumbDiv.clientHeight / figMaxHeight);


                    // For animated previews--aka make 'em scroll!
                    if (item.animatedPreviewURL) {
                        // Set thumb preview (just the middle one)
                        function setThumbPosDefault() {
                            const calc = figMaxHeight * (thumbLength / 2);
                            thumbDiv.style.top = `-${calc}px`;
                        }
                        setThumbPosDefault();

                        // Scroll thumbnail preview
                        let scrollInt;
                        elmnt.addEventListener('mouseover', (e) => {
                            let i = 0;

                            function scrollThumb() {
                                // Get current i & height
                                let calc = figMaxHeight * i;
                                // If calc is short of calculator--ok actually, if `calc` is more than the thumbnail preview image
                                if (calc > thumbDiv.clientHeight) {
                                    calc = 0;
                                    i = 0;
                                }

                                // Set pos
                                thumbDiv.style.top = `-${calc}px`;

                                // End
                                i++;
                            }
                            scrollThumb();
                            scrollInt = setInterval(() => scrollThumb(), 800);
                        });

                        // Clear past scroller & set back to default
                        elmnt.addEventListener('mouseout', (e) => {
                            clearInterval(scrollInt);
                            setThumbPosDefault();
                        });
                    }
                });
            }

            // check tab type & go to the set data function
            sidePageRoot.classList.remove("tw-hide");
            switch (sideargs.tab) {
                case "videos":
                    setTabData(await gql.getChannelMedia(args.channel, "VIDEOS"));
                break;
            
                case "clips":
                    setTabData(await gql.getChannelMedia(args.channel, "CLIPS"));
                break;
            }
        }

        // Go to main page on watch page
        function goToMain() {
            document.querySelectorAll('.channel-header__item--selected').forEach(item => item.classList.remove("channel-header__item--selected"));

            document.querySelector(`[data-a-target="user-channel-header-item"]`).classList.add("channel-header__user--selected");
            playerRoot.classList.remove("player-popout");
            sidePageRoot.classList.add("tw-hide");

            // reset location path
            const url = new URL(window.location.toString());
            let pathSplit = url.pathname.split('/');
            if (pathSplit.length >= 3) {
                // make a new path split that goes to two instead of whatever we currently have
                const pastPathSplit = [...pathSplit];
                pathSplit = [];
                const maxPath = 2;
                let i = 0;
                pastPathSplit.forEach((path) => {
                    if (i < maxPath) {
                        pathSplit.push(path);
                        i++;
                    }
                });
                // set pathname back to url
                url.pathname = pathSplit.toString().replace(',', '/');
            }
            history.pushState({}, '', url);
            history.replaceState({}, '', url);
        }

        
        // Channel tabs
        if (args.type == "stream") {
            // Open tab if location.pathname contains a `channel-header-item`
            const url = new URL(window.location.toString());
            const pathSplit = url.pathname.split('/');

            if (pathSplit.length >= 3) {
                let tab = pathSplit[2];
                let elmnt = document.querySelector(`[data-a-target="${tab}-channel-header-item"]`);

                if (elmnt) loadStreamerSidePage({elmnt: elmnt, tab: tab});
            }

            // On channel tab click, open it's tab
            document.addEventListener("click", async (e) => {
                let closestTarget = e.target.closest(`[data-target="channel-header-item"]`);
    
                if (closestTarget) {
                    e.preventDefault();

                    // if the clicked tab is the user tab
                    if (closestTarget.getAttribute("data-a-target") == "user-channel-header-item") goToMain();
                    // else if a normal tab
                    else if (closestTarget.href) {
                        loadStreamerSidePage({elmnt: closestTarget, tab: closestTarget.getAttribute('data-a-target').split('-channel-header-item')[0]});
                        // Add URL
                        const url = new URL(window.location.toString());
                        url.href = closestTarget.href;
                        history.pushState({}, '', url);
                        history.replaceState({}, '', url);
                    }
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
            clipBoardButton.querySelector(`.tw-tooltip`).innerHTML = lang.page["clipboard-btn-press"];
        });
        clipBoardButton.addEventListener("mouseout", () => {
            clipBoardButton.querySelector(`.tw-tooltip`).innerHTML = lang.page["clipboard-btn"];
        });
        // text boxes
        document.querySelector(`[data-share-text="embed-channel"] .tw-input`).value = `<iframe src="https://player.twitch.tv/?channel=${channelData.login}&parent=localhost" frameborder="0" allowfullscreen="true" scrolling="no" height="315" width="100%"></iframe>`;
        document.querySelector(`[data-share-text="embed-chat"] .tw-input`).value = `<iframe src="https://www.twitch.tv/embed/${channelData.login}/chat?parent=localhost" frameborder="0" scrolling="no" height="315" width="100%"></iframe>`;
    }


    const totalViewsDiv = document.querySelector('[data-a-target="total-views-count"]');
    const timeDiv = document.querySelector(`[data-a-target="time-count"]`);

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
                console.log("channelData: ", channelData);
                if (!channelData) showError({ id: 404 });
                
                videosData = await gql.getChannelMedia(args.channel, "VIDEOS");
                console.log("videosData: ", videosData);

                // set streamer info
                function addStremerInfo(funargs) {
                    if (funargs == null || !funargs.includes("not-first-init")) {
                        // defaults
                        notFirstInit();

                        // panels
                        let panelsContainer = document.querySelector(`.channel-panels-container`);
                        channelData.panels.forEach(panel => {
                            // check if the current panel is a blank panel
                            if (panel.type === "EXTENSION") return;
                            if (panel.description === null && panel.title === null && panel.imageURL === null && panel.linkURL === null) return;

                            // insert panel
                            let panelDiv = document.createElement("div");
                            panelDiv.className = "default-panel"
                            panelDiv.setAttribute("data-a-target", `panel-${panelsContainer.childElementCount}`);
                            panelDiv.innerHTML = `
${panel.linkURL ? `<a data-test-selector="link_url_panel" class="tw-link" rel="noopener noreferrer" target="_blank" href="${panel.linkURL}">` : ""}
    ${panel.title ? `<h3 data-test-selector="title_panel" class="tw-title">${panel.title}</h3>`: ""}
    ${panel.imageURL ? `<img data-test-selector="image_panel" src="${panel.imageURL}">` : ""}
${panel.linkURL ? "</a>" : ""}
${panel.description ? `
<div data-test-selector="description_panel">
    <div class="tw-typeset">
        <div class="panel-description">
            ${twitchMarkdown(panel.description)}
        </div>
    </div>
</div>
` : ""}
                            `;

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
                        document.querySelector(`[data-a-target="team-name"]`).parentElement.href = `https://www.twitch.tv/team/${channelData.primaryTeam.name}`;
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
                        if (funargs == null || !funargs.includes("not-first-init")) {
                            const clockStat = timeDiv.querySelector('.tw-stat__value');
                            const startedAt = new Date(channelData.stream.startedAt);
                            let currentTime = new Date();

                            streamClock = setInterval(() => {
                                currentTime = new Date();
                                clockStat.innerHTML = getDateDiff(currentTime, startedAt);
                            }, 1000);
                            clockStat.innerHTML = getDateDiff(currentTime, startedAt);
                            timeDiv.parentElement.classList.remove('tw-hide');
                        }
                    } else {
                        clearInterval(streamClock);
                        streamClock = null;
                        // Hide all stream info
                        document.querySelector(`.channel-info-bar__action-container .tw-tooltip-wrapper`).classList.add("tw-hide");
                        document.querySelector(`.tw-stat[data-a-target="viewer-count"]`).parentElement.classList.add("tw-hide");
                        timeDiv.parentElement.classList.add("tw-hide");
                    }
                    if (videosData.length > 0) document.querySelector(`[data-a-target="videos-channel-header-item"] .channel-header__item-count span`).innerHTML = videosData.length;
                }
                addStremerInfo();


                // Make a TwitchHermes listener to listen for stream data changes
                const hermes = new TwitchHermes(Number(channelData.id), 'all');

                // Stream end
                hermes.on('data', async (d) => {
                    switch (d.type) {
                        case "stream-down":
                            channelData.stream = null;
                            channelData.live = false;

                            addStremerInfo(['not-first-init']);
                        break;

                        // Stream info update
                        case "broadcast_settings_update":
                            const dataOnEvent = await gql.getChannelSimple(d.channel);
                            console.log(`dataOnEvent: `, dataOnEvent);
        
                            channelData.broadcastSettings = dataOnEvent.broadcastSettings;
                            channelData.stream = dataOnEvent.stream;
                            if (channelData.stream == null) channelData.live = false;
                            console.log(`edited channelData: `, channelData);
        
                            addStremerInfo(['not-first-init']);
                        break;

                        // Viewer count update
                        case "viewcount":
                            // check if stream data is there
                            if (channelData.stream == null) {
                                const dataOnEvent = await gql.getChannelSimple(channelData.login);
                                console.log(`dataOnEvent: `, dataOnEvent);

                                channelData.live = true;
                                channelData.broadcastSettings = dataOnEvent.broadcastSettings;
                                channelData.stream = dataOnEvent.stream;
                            }

                            // Set viewercount
                            channelData.stream.viewersCount = d.viewers;
                            addStremerInfo(['not-first-init']);
                        break;

                        // On raid sent
                        case "raid_go_v2":
                            location.href = `/${d.raid.target_login}`;
                        break;
                    }
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
            /** @type { Document } */
            let chatIframeDoc,
            /** @type { Window } */
                chatIframeWindow;
            chatOnLoad = (e) => {
                chatIframeDoc = chatIframe.contentDocument;
                chatIframeWindow = chatIframe.contentWindow;
                const html = document.querySelector('html');
                const Ifhtml = chatIframeDoc.querySelector('html');


                // Set chatroot element
                const chatRootIds = {
                    id: 'oldtwitch-css',
                    class: 'oldtwitch-chatroot'
                }
                var chatRoot = document.querySelector(`#${chatRootIds.id}.${chatRootIds.class}`);
                if (chatRoot === null) {
                    chatRoot = chatIframeDoc.createElement('style');
                    chatRoot.id = 'oldtwitch-css';
                    chatRoot.classList.add('oldtwitch-chatroot');
                    chatIframeDoc.head.appendChild(chatRoot);
                }
                


                // Check for whether if the theme has been changed
                let prevTheme;
                const themeChangeInt = setInterval(() => {
                    if (prevTheme !== currentTheme) {
                        themeClassCheck = '';
                        themeClassReplace = '';

                        switch (currentTheme) {
                            // dark
                            case 1:
                                chatRoot.innerHTML = `
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

                                themeClassCheck = 'tw-root--theme-light';
                                themeClassReplace = 'tw-root--theme-dark';
                            break;
                        
                            // light
                            case 0:
                                chatRoot.innerHTML = `
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

                                themeClassCheck = 'tw-root--theme-dark';
                                themeClassReplace = 'tw-root--theme-light';
                            break;
                        }


                        const themeClassInt = setInterval(() => {
                            const chatIfHtml = chatIframeDoc.querySelector('html');
                            if (chatIfHtml.classList.contains(themeClassCheck)) {
                                chatIfHtml.classList.remove(themeClassCheck);
                                chatIfHtml.classList.add(themeClassReplace);
                            }

                            if (chatIfHtml.classList.contains(themeClassReplace)) {
                                console.log('chat iframe classname replace complete');
                                clearInterval(themeClassInt);
                            }
                        }, 500);
                    }

                    prevTheme = currentTheme;
                }, 1000);
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
                console.log("vodData: ", vodData);
                if (!vodData) return showError({ id: 404 });

                channelData = await gql.getChannel(vodData.owner.login);
                videosData = await gql.getChannelMedia(vodData.owner.login, "VIDEOS");
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
                    timeDiv.parentElement.classList.remove('tw-hide');
                    timeDiv.querySelector('.tw-stat__value').innerHTML = `${calcDateDiffToTxt(currentDate, new Date(vodData.createdAt))} ago`;
                }
                addStremerInfo();

                // header btn
                document.querySelector('.channel-header__user').addEventListener('click', () => location.href = `/${channelData.login}`);
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
                clipData = await gql.getClip(args.slug);
                console.log("clipData: ", clipData);
                // check to see if clip exists or not
                if (!clipData) return showError({ id: 404 });

                channelData = await gql.getChannel(clipData.broadcaster.login);
                videosData = await gql.getChannelMedia(clipData.broadcaster.login, "VIDEOS");
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
                const decodeTime = `${Math.floor(clipSeconds / 3600)}h${Math.floor((clipSeconds % 3600) / 60)}m${clipSeconds % 60}s`;
                vodButton.querySelector('button').addEventListener('click', e => { location.href = `https://twitch.tv/${channelData.login}/video/${clipData.video.id}?t=${decodeTime}` });
                // add edit button if owner of clip
                if (userData) if (
                    clipData.curator.displayName == userData.displayName
                    || clipData.broadcaster.displayName == userData.displayName
                ) {
                    const editButton = document.querySelector('[data-a-target="editclip-button"]');
                    editButton.classList.remove('tw-hide');
                    editButton.querySelector('button').addEventListener('click', e => { location.href = `https://www.twitch.tv/${clipData.curator.login}/clip/${args.slug}?editclip&newttv` });
                }

                // header btn
                document.querySelector('.channel-header__user').addEventListener('click', () => location.href = `/${channelData.login}`);
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


    // Set channel headers
    const channelHeaders = document.querySelectorAll('[data-target="channel-header-item"]');
    channelHeaders.forEach((channelHeader) => {
        const channelName = location.pathname.split('/')[1];
        if (channelHeader.href) channelHeader.href = channelHeader.href.replace('__CHANNEL__', channelName);
    });
}

// Check pathname
const pathname = location.pathname;
const pathnameSplit = pathname.split("/");
// Check for videos
const videoCheck1 = !pathname.startsWith("/video/") && pathname.includes("/video/");
const videoCheck2 = pathname.startsWith("/videos/");
// Check link for clips
const clipCheck1 = location.host == "clips.twitch.tv";
const clipCheck2 = pathnameSplit.length > 1 && pathname.includes("/clip/")
// Okay go!!!!!
let arg1 = pathnameSplit[pathnameSplit.length - 1].split("?")[0];
switch (true) {
    // Check if link is a video
    case videoCheck1:
    case videoCheck2:
        if (videoCheck1) pathname.split("/video/").pop();
        else if (videoCheck2) pathname.split("/videos/").pop();
        if (pathname.includes("?")) arg1 = arg1.split("?")[0];
        setIframeVideo({ type: "video", id: arg1 });
    break;

    // Check if link is a clip
    case clipCheck1:
    case clipCheck2:
        if (clipCheck1) setIframeVideo({ type: "clip", slug: pathnameSplit.pop(), channel: null });
        else if (clipCheck2) setIframeVideo({ type: "clip", slug: pathname.split("clip/").pop(), channel: arg1 });
    break;

    // Probably just a stream
    default:
        arg1 = pathnameSplit[1];
        if (arg1.includes("?")) arg1 = arg1.split("?")[0];
        setIframeVideo({ type: "stream", channel: arg1 });
    break;
}
