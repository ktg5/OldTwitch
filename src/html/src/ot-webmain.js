var extensionLocation = document.querySelector('body').getAttribute('oldttv');
var latestVersionUrl = `https://raw.githubusercontent.com/ktg5/oldttv/refs/heads/main/src/ver.txt`;


// Inject requested text to element's innerhtml
async function textToHtml(text, element) {
    text = text.replace(/__([a-zA-Z0-9_]+)__/g, (match, key) => {
        switch (key) {
            case "EXTENSION_URL":
            return extensionLocation;
    
            default:
            return match;
        }
    });
    element.innerHTML = text;
}


// Make a notification on the top of the page
function makeNotification(text, actions) {
    document.querySelector('body').insertAdjacentHTML('afterbegin', `
        <div class="oldttv-notifi">
            <div class="content">${text}</div>
            <div class="actions"></div>
        </div>
    `);
    let notification = document.querySelector('.oldttv-notifi');
    let actionsDiv = document.querySelector('.oldttv-notifi .actions');

    if (actions) {
        console.log(actions);
        for (const action of actions) {
            actionsDiv.innerHTML += `
            <div class="tw-mg-r-1">
                <button class="tw-button" data-a-target="oldtwitch-notifi-${action.key}-button">
                    <span class="tw-button__text" data-a-target="tw-button-text">${action.text}</span>
                </button>
            </div>
            `;

            document.querySelector(`[data-a-target="oldtwitch-notifi-${action.key}-button"]`).addEventListener('click', () => {
                action.callback();
                notification.remove();
            });
        }
    }
    actionsDiv.innerHTML += `
    <div class="tw-mg-r-1">
        <button class="tw-button" data-a-target="oldtwitch-notifi-close-button">
            <span class="tw-button__text" data-a-target="tw-button-text">Close</span>
        </button>
    </div>
    `;
    document.querySelector('[data-a-target="oldtwitch-notifi-close-button"]').addEventListener('click', () => {
        notification.remove();
    });
}


// Get current user info
// Get Oauth
var userData, oauth;
if (document.cookie.split('auth-token=')[1]) {
    oauth = document.cookie.split('auth-token=')[1].split(";")[0];
} else {
    oauth = null
}
// Do stuff with gql
if (oauth != null) {
    let gqlAction = async () => {
        userData = await gql.getCurrentUser(oauth);
        console.log(`userData: `, userData);
    
        if (userData != null) {
            // check that html is here
            let loginButton = document.querySelector('[data-a-target="login-button"]');
            let actionAfterHtmlInit = () => {
                // set user info
                // remove login & signup buttons
                loginButton.parentElement.remove();
                document.querySelector('[data-a-target="signup-button"]').parentElement.remove();
                // name & pfp
                let targetCard = document.querySelector(`[data-a-target="user-card"]`).insertAdjacentHTML('beforeend', `
                    <a class="user-info" href="https://www.twitch.tv/${userData.displayName}">
                        <div class="tw-align-items-center tw-flex tw-flex-shrink-0 tw-flex-nowrap">
                            <div class="channel-header__user-avatar channel-header__user-avatar--active tw-align-items-stretch tw-flex tw-flex-shrink-0 tw-mg-r-1">
                                <div class="tw-relative">
                                    <figure class="tw-avatar tw-avatar--size-30">
                                        <div class="tw-overflow-hidden">
                                            <img class="tw-image" src="${userData.profileImageURL}">
                                        </div>
                                    </figure>
                                </div>
                            </div>
                            <div class="tw-align-items-center">
                                <span>
                                    <span>${userData.displayName}</span>
                                </span>
                            </div>
                        </div>
                    </a>
                `);
            }
            if (loginButton) {
                actionAfterHtmlInit();
            } else {
                let tempInit = setInterval(() => {
                    if (loginButton) {
                        actionAfterHtmlInit();
                        clearInterval(tempInit);
                    }
                }, 50);
            }
        }  
    }
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
}


// Add navbar if found
let navbar = document.querySelector(".top-nav");
if (navbar) {
    fetch(`${extensionLocation}/html/global/topnav.html`).then(async data => {
        // Inject HTML
        let htmlText = await data.text();
        textToHtml(htmlText, navbar);

        // On click handlers
        document.querySelector('button[data-a-target="newtwitch-button"]').addEventListener('click', (e) => {
            if (location.search.includes('?')) location.search += "&nooldttv";
            else location.search = "?nooldttv";
        });
    });
}
// Add sidebar if found
let sidebar = document.querySelector(".side-nav");
var channels;
if (sidebar) {
    fetch(`${extensionLocation}/html/global/sidenav.html`).then(async data => {
        // Inject HTML
        let htmlText = await data.text();
        textToHtml(htmlText, sidebar);


        // Get channels
        channels = await gql.getRecommends(oauth, [localStorage.getItem("oldttv-currentchannel"), localStorage.getItem("oldttv-lastchannel")]);
        let followsDiv = document.querySelector(".tw-mg-b-1 .channel-list");
        let featuresDiv = document.querySelector(".tw-mg-b-2 .channel-list");
        let streamerFeaturesDiv = document.querySelector(".tw-mg-b-3 .channel-list");
        console.log('allChannels: ', channels);

        // Turn on lists in sidebar if detected
        for (const channelList of channels) {
            let targetDiv;
            switch (channelList.type) {
                case "RECS_FOLLOWED_SECTION":
                    followsDiv.parentElement.classList.remove("tw-hide");
                break;

                case "RECOMMENDED_SECTION":
                    featuresDiv.parentElement.classList.remove("tw-hide");
                break;

                case "SIMILAR_SECTION":
                    streamerFeaturesDiv.parentElement.classList.remove("tw-hide");
                    let streamerFeaturesDivTitle = document.querySelector(`.tw-mg-b-3 [data-a-target="side-nav-header-expanded"] .tw-c-text-alt`);
                    streamerFeaturesDivTitle.innerHTML = streamerFeaturesDivTitle.innerHTML.replace("[__STREAMER__]", localStorage.getItem("oldttv-currentchannel"));
                break;
            }
        }

        // Set channels in the left sidebar
        for (const channelList of channels) {
            let targetDiv;
            switch (channelList.type) {
                case "RECS_FOLLOWED_SECTION":
                    targetDiv = followsDiv;
                break;

                case "RECOMMENDED_SECTION":
                    targetDiv = featuresDiv;
                break;

                case "SIMILAR_SECTION":
                    targetDiv = streamerFeaturesDiv;
                break;
            }

            channelList.items.forEach(channel => {
                let categoryTxt, viewCountTxt = null;
                // console.log(channel);
                if (channel.content) {
                    if (channel.content.game) categoryTxt = channel.content.game.displayName;
                    if (channel.content.viewersCount) viewCountTxt = channel.content.viewersCount;
                }
                // console.log(viewCountTxt);

                // make div
                let channelDiv = document.createElement("a");
                channelDiv.classList.add("channel");
                channelDiv.href = `/${channel.user.login}`;
                if (channel.content) channelDiv.title = channel.content.broadcaster ? channel.content.broadcaster.broadcastSettings.title : "";
                channelDiv.innerHTML = `
                <figure class="tw-avatar tw-avatar--size-30">
                    <div class="tw-overflow-hidden">
                        <img class="tw-image" src="${channel.user.profileImageURL}">
                    </div>
                </figure>
                <div class="channel-info">
                    <div class="left">
                        <span class="title">${channel.user.displayName}</span>
                        <span class="category">${categoryTxt ? categoryTxt : ""}</span>
                    </div>
                    <div class="right ${viewCountTxt ? "" : "tw-hide"}">
                        ${viewCountTxt ? viewCountTxt : ""}
                    </div>
                </div>
                `;
                targetDiv.appendChild(channelDiv);
            });
        }
    });
}


// On load
var currentVersion;
setTimeout(async () => {
    currentVersion = document.body.getAttribute(`oldttv-ver`);
    console.log("currentVersion: ", currentVersion);
    let currentDevBuild;
    let isDev = false;
    if (document.body.getAttribute(`oldttv-ver`).includes("dev")) {
        isDev = true;
        currentDevBuild = currentVersion.split("dev")[1].split(":")[0];
        currentVersion = currentVersion.split(":").pop();
    }
    // Pull latest version from GitHub files
    let latestVersion = await fetch(latestVersionUrl).then(res => res.text());
    console.log("latestVersion: ", latestVersion);
    let latestDevBuild;
    let latestIsDev = false;
    if (latestVersion.includes("dev")) {
        latestIsDev = true;
        latestDevBuild = latestVersion.split("dev")[1].split(":")[0];
        latestVersion = latestVersion.split(":").pop();
    }
    // Basic checking
    let latestParts = latestVersion.split(".").map(Number);
    let currentParts = currentVersion.split(".").map(Number);
    if (!isDev && !latestIsDev || isDev && latestIsDev || isDev && !latestIsDev) {
        // Check differences between versions
        for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
            if (isDev && latestIsDev || !isDev && !latestIsDev || isDev && !latestIsDev) {
                let selectCurrent = currentParts[i] || 0;  // Default to 0 if version1 is shorter
                let selectLatest = latestParts[i] || 0;  // Default to 0 if version2 is shorter

                if (selectCurrent < selectLatest) updateNotification("public");
                else if ((selectCurrent && selectLatest) !== 0 && selectCurrent <= selectLatest && currentDevBuild < latestDevBuild) updateNotification("dev build");;
            }
        }
    }

    // Make update notification
    function updateNotification(debug) {
        if (debug) console.log(debug);
        makeNotification(`The current version of OldTwitch you're on is out-of-date. Click the "Update" button to go to the latest update.`, [
            {
                key: "update",
                text: "Update",
                action: () => location.href = "https://github.com/ktg5/oldttv/releases/latest"
            }
        ]);
    }


    let channelListDiv = document.querySelector(".channel-list");
    // Set side stuff clicks
    // Left
    let sideNavArrow = document.querySelector(`[data-a-target="side-nav-arrow"]`);
    if (sideNavArrow) {
        sideNavArrow.addEventListener('click', (e) => {
            let sideNav = document.querySelector(`.side-nav`);
            if (sideNav.classList.contains(`side-nav--collapsed`)) {
                sideNav.classList.remove(`side-nav--collapsed`);
                sideNavArrow.classList.remove(`side-nav__toggle-visibility--open`);
            } else {
                sideNav.classList.add(`side-nav--collapsed`);
                sideNavArrow.classList.add(`side-nav__toggle-visibility--open`);
            }
        });
    }
    // Right
    let rightNavArrow = document.querySelector(`[data-a-target="right-column__toggle-collapse-btn"]`);
    if (rightNavArrow) {
        rightNavArrow.addEventListener('click', (e) => {
            let rightNav = document.querySelector(`.right-column`);
            if (rightNav.classList.contains(`right-column--collapsed`)) {
                rightNav.classList.remove(`right-column--collapsed`);
                rightNavArrow.classList.remove(`right-column__toggle-visibility--open`);
            } else {
                rightNav.classList.add(`right-column--collapsed`);
                rightNavArrow.classList.add(`right-column__toggle-visibility--open`);
            }
        });
    }

    // Show all buttons in left sidebar
    let showAllButton = document.querySelector(`.channel-list-force-all`);
    if (showAllButton) {
        showAllButton.addEventListener('click', (e) => {
            if (channelListDiv.getAttribute('force-all')) channelListDiv.removeAttribute('force-all');
            else channelListDiv.setAttribute('force-all', 'true');
        });
    }


    // If index page, do index page things
    if (location.pathname == "/") {

        // Do home apge stuff
        let homePageData = await gql.getHomePage("en"); // todo: allow user to change lang to whatever they want
        console.log('homePageData: ', homePageData);
    
        // Set first featured stream
        let featuredStreams = homePageData.featuredStreams;
        let featuredStreamFigure = document.querySelector(`.anon-front__featured-section figure`);
        featuredStreamFigure.id = "iframe-insert";
        featuredStreamFigure.innerHTML = '';
        let featuredStreamIframe;
        vodExec = () => {

            function setHeaderStream(i) {
                // reset iframe
                document.querySelector(`#iframe-insert`).innerHTML = "";
                
                // iframe
                featuredStreamIframe = new Twitch.Player("iframe-insert", {
                    channel: featuredStreams[i].broadcaster.login,
                    muted: false
                });

                // channel details
                document.querySelector(`.streamer-pfp`).innerHTML = `<a href="/${featuredStreams[i].broadcaster.login}"><img class="tw-image" src="${featuredStreams[i].broadcaster.profileImageURL}"></a>`;
                document.querySelector(`.item-name`).innerHTML = `<a style="color: #b8b5c0;" href="/${featuredStreams[i].broadcaster.login}">${featuredStreams[i].broadcaster.displayName}</a>`;
                document.querySelector(`.streamer-category`).innerHTML = `<a href="/directory/category/${featuredStreams[i].game.slug}">${featuredStreams[i].game.displayName}</a>`;
                document.querySelector(`.streamer-desc`).innerHTML = "";
                document.querySelector(`.streamer-tags`).innerHTML = "";
                featuredStreams[i].freeformTags.forEach(streamTag => {
                    document.querySelector(`.streamer-tags`).innerHTML += `<a class="search-tag" href="/directory/all/tags/${streamTag.name}">${streamTag.name}</a>`;
                });
            }

            // other channelssesese below main
            for (let i = 0; i < featuredStreams.length; i++) {
                const featuredStream = featuredStreams[i];
                
                let targetDiv = document.querySelector(`.tw-flex.tw-flex-nowrap.tw-pd-x-05.tw-pd-y-1`).children[i];
                if (targetDiv) {
                    targetDiv.style.cursor = "pointer";
                    targetDiv.innerHTML = `<img class="tw-image" src="${featuredStream.previewImageURL}">`;
                    if (i == 0) targetDiv.classList.add("channel-selected");
                    targetDiv.addEventListener('click', (e) => {
                        if (document.querySelector(`.channel-selected`)) document.querySelector(`.channel-selected`).classList.remove("channel-selected");
                        targetDiv.classList.add("channel-selected");
                        setHeaderStream(i);
                    });
                }
            }

            // set default
            setHeaderStream(0);

        };
        if (Twitch !== undefined) {
            vodExec();
        } else {
            let tempInit = setInterval(() => {
                if (Twitch) {
                    vodExec();
                    clearInterval(tempInit);
                };
            }, 50);
        };

        // Shelves
        // Top Games
        let topGamesGrid = document.querySelector(`.tw-pd-x-1 .tw-grid`);
        for (let i = 0; i < homePageData.shelves.TopGamesForYou.length; i++) {
            const game = homePageData.shelves.TopGamesForYou[i];

            // covert art
            topGamesGrid.children[i].querySelector(`figure`).innerHTML = `<a href="/directory/category/${game.categorySlug}"><img class="tw-image" src="${game.boxArtURL}"></a>`;
            // title
            topGamesGrid.children[i].querySelector(`.game-title`).innerHTML = `<a href="/directory/category/${game.categorySlug}">${game.displayName}</a>`;
            // tags
            // topGamesGrid.children[i].querySelector(`.game-tags`).innerHTML = "";
            // game.gameTags.forEach(gameTag => {
            //     topGamesGrid.children[i].querySelector(`.game-tags`).innerHTML += `<a class="game-tag" href="/directory/all/tags/${gameTag.tagName}">${gameTag.localizedName}</a>`;
            // });
            // viewers
            topGamesGrid.children[i].querySelector(`.game-tags`).innerHTML = `${game.viewersCount} viewers`;
        }

        // Top Channels
        let topStreamersGrid = document.querySelector(`.tw-pd-x-2 .tw-tower`);
        for (let i = 0; i < homePageData.shelves.TopLiveChannelsYouMayLikeLoggedOut.length; i++) {
            const channel = homePageData.shelves.TopLiveChannelsYouMayLikeLoggedOut[i];

            if (topStreamersGrid.children[i]) {
                // covert art
                topStreamersGrid.children[i].querySelector(`figure`).innerHTML = `<a href="/${channel.broadcaster.login}"><img class="tw-image" src="${channel.previewImageURL}"></a>`;
                // title
                topStreamersGrid.children[i].querySelector(`.item-name`).innerHTML = `<a href="/${channel.broadcaster.login}">${channel.broadcaster.displayName}</a>`;
                // viewers
                topStreamersGrid.children[i].querySelector(`.item-subtext`).innerHTML = `${channel.viewersCount} viewers on ${channel.broadcaster.displayName}`;
            }
        }

    };
}, 150);