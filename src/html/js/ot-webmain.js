var userConfig = JSON.parse(localStorage.getItem('oldttv'));
var styles3 = [
    'background: linear-gradient(#06d316, #075702)'
    , 'border: 5px solid rgb(255 255 255 / 10%)'
    , 'color: white'
    , 'display: block'
    , 'text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)'
    , 'box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 5px 3px -5px rgba(0, 0, 0, 0.5), 0 -13px 5px -10px rgba(255, 255, 255, 0.4) inset'
].join(';');
console.log(`%cOLDTTV USER DATA:`, styles3, userConfig);

var tabsClosed = JSON.parse(localStorage.getItem("oldttv-tabsClosed"));
if (tabsClosed == null) {
    localStorage.setItem("oldttv-tabsClosed", JSON.stringify({
        left: false,
        right: false
    }));
    tabsClosed = JSON.parse(localStorage.getItem("oldttv-tabsClosed"));
}

extensionLocation = document.querySelector('body').getAttribute('oldttv');
var latestVersionUrl = `https://raw.githubusercontent.com/ktg5/OldTwitch/refs/heads/main/src/ver.txt`;
var darkTheme = false;
const html =  document.querySelector('html');

// Check for dark theme
if (
    (
        userConfig.forceLightMode == true
        && userConfig.forceWhichLightMode == '1'
    )
    || (
        (userConfig.forceLightMode == undefined || userConfig.forceLightMode == false)
        && window.matchMedia
        && window.matchMedia('(prefers-color-scheme: dark)').matches
    )
) {
    html.classList.add(`tw-theme--dark`);
    darkTheme = true;
}


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


// Formats a given number with a leading zero if it's less than 10
function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// Get the difference between two dates
function getDateDiff(d1, d2) {
    // Calculate the absolute difference in milliseconds
    let diffMs = Math.abs(d1.getTime() - d2.getTime());

    // Convert milliseconds to seconds, minutes, and hours
    let diffSeconds = Math.floor(diffMs / 1000);
    let hours = Math.floor(diffSeconds / 3600);
    diffSeconds %= 3600; // Remaining seconds after extracting hours
    let minutes = Math.floor(diffSeconds / 60);
    let seconds = diffSeconds % 60; // Remaining seconds after extracting minutes

    // Format hours, minutes, and seconds with leading zeros
    const formattedHours = padZero(hours);
    const formattedMinutes = padZero(minutes);
    const formattedSeconds = padZero(seconds);

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}


// Get Oauth token via the user's cookies.
// 
// If you're looking at this and worried about security, you can read through
// all the functions & fetches in the `ot-gql.js` file. All the fetches that
// pass through your OAuth token are within that file and take the argument
// name `oauth`. I don't want your account, I have nothing to do with your
// account, and if I did you won't be able to install this extension in the
// first place. (That is if you downloaded the extension from a browser
// extension store)
var userData, oauth, deviceId;
if (document.cookie.split('auth-token=')[1]) {
    oauth = document.cookie.split('auth-token=')[1].split(";")[0];
} else {
    oauth = null
}
if (document.cookie.split('unique_id')[1]) {
    deviceId = document.cookie.split('unique_id=')[1].split(";")[0];
} else {
    deviceId = null
}


// Add navbar if found
let navbar = document.querySelector(".top-nav");
if (navbar) {
    fetch(`${extensionLocation}/html/${userConfig.year}/global/topnav.html`).then(async data => {
        // Inject HTML
        let htmlText = await data.text();
        textToHtml(htmlText, navbar);

        // On click handlers
        document.querySelector('button[data-a-target="newtwitch-button"]').addEventListener('click', (e) => {
            if (location.search.includes('?')) location.search += "&nooldttv";
            else location.search = "?nooldttv";
        });


        let loginButton = document.querySelector('[data-a-target="login-button"]');
        let signupButton = document.querySelector('[data-a-target="signup-button"]');
        // Do stuff with gql
        if (oauth != null) {
            let gqlAction = async () => {
                userData = await gql.getCurrentUser(oauth);
                console.log(`userData: `, userData);
            
                if (userData != null) {
                    // ### set user info
                    // remove login & signup buttons
                    loginButton.parentElement.remove();
                    signupButton.parentElement.remove();

                    // name & pfp
                    let targetCard = document.createElement('div');
                    targetCard.classList.add("user-info", "tw-relative");
                    targetCard.insertAdjacentHTML('beforeend', `
                        <button>
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
                        </button>

                        <div class="tw-balloon tw-balloon--sm tw-balloon--down tw-balloon--right tw-block tw-absolute tw-hide" data-a-target="overflow-menu">
                            <div class="tw-balloon__tail tw-overflow-hidden tw-absolute">
                                <div class="tw-balloon__tail-symbol tw-border-t tw-border-r tw-border-b tw-border-l tw-border-radius-small tw-c-background  tw-absolute"></div>
                            </div>
                            <div class="tw-border-t tw-border-r tw-border-b tw-border-l tw-elevation-1 tw-border-radius-small tw-c-background">
                                <div class="tw-pd-1">
                                    <a href="https://www.twitch.tv/${userData.displayName}" class="tw-interactable" data-a-target="channel-link">
                                        <div class="tw-pd-x-1 tw-pd-y-05">Channel</div>
                                    </a>
                                    <a href="https://dashboard.twitch.tv/u/${userData.displayName}/home" class="tw-interactable" data-a-target="dashboard-link">
                                        <div class="tw-pd-x-1 tw-pd-y-05">Creator Dashboard</div>
                                    </a>
                                    <a href="https://www.twitch.tv/subscriptions" class="tw-interactable" data-a-target="subscriptions-link">
                                        <div class="tw-pd-x-1 tw-pd-y-05">Subscriptions</div>
                                    </a>
                                    <a href="https://www.twitch.tv/inventory" class="tw-interactable" data-a-target="inventory-link">
                                        <div class="tw-pd-x-1 tw-pd-y-05">Drops & Inventory</div>
                                    </a>
                                    <a href="https://www.twitch.tv/oldtwitch" class="tw-interactable" data-a-target="oldtwitch-settings-link">
                                        <div class="tw-pd-x-1 tw-pd-y-05">OldTwitch Configuration</div>
                                    </a>
                                    <a href="https://www.twitch.tv/settings" class="tw-interactable" data-a-target="settings-link">
                                        <div class="tw-pd-x-1 tw-pd-y-05">Settings</div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    `);

                    document.querySelector(`[data-a-target="user-card"]`).appendChild(targetCard);
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
        } else {
            loginButton.addEventListener('click', () => { popupAction({ type: "login" }) });
            signupButton.addEventListener('click', () => { popupAction({ type: "signup" }) });
            document.querySelector('[data-a-target="signup-note"] button').addEventListener('click', () => { popupAction({ type: "signup" }) });
        }
    });
}
// Add sidebar if found
let sidebar = document.querySelector(".side-nav");
var channels;
if (sidebar) {
    fetch(`${extensionLocation}/html/${userConfig.year}/global/sidenav.html`).then(async data => {
        // Inject HTML
        let htmlText = await data.text();
        textToHtml(htmlText, sidebar);


        // Get channels
        channels = await gql.getSideNavData(oauth, [localStorage.getItem("oldttv-currentchannel"), localStorage.getItem("oldttv-lastchannel")]);
        let followsDiv = document.querySelector(".tw-mg-b-1 .channel-list");
        let featuresDiv = document.querySelector(".tw-mg-b-2 .channel-list");
        let streamerFeaturesDiv = document.querySelector(".tw-mg-b-3 .channel-list");
        console.log('allChannels: ', channels);

        // Turn on lists in sidebar if detected
        for (const channelList of channels) {
            let targetDiv;
            switch (channelList.id) {
                case "provider-side-nav-followed-channels-1":
                    followsDiv.parentElement.classList.remove("tw-hide");
                break;

                case "provider-side-nav-recommended-streams-1":
                    featuresDiv.parentElement.classList.remove("tw-hide");
                break;

                case "provider-side-nav-similar-streamer-currently-watching-1":
                    streamerFeaturesDiv.parentElement.classList.remove("tw-hide");
                    let streamerFeaturesDivTitle = document.querySelector(`.tw-mg-b-3 [data-a-target="side-nav-header-expanded"] .tw-c-text-alt`);
                    streamerFeaturesDivTitle.innerHTML = streamerFeaturesDivTitle.innerHTML.replace("[__STREAMER__]", localStorage.getItem("oldttv-currentchannel"));
                break;
            }
        }

        // Set channels in the left sidebar
        for (const channelList of channels) {
            let targetDiv;
            switch (channelList.id) {
                case "provider-side-nav-followed-channels-1":
                    targetDiv = followsDiv;
                break;

                case "provider-side-nav-recommended-streams-1":
                    targetDiv = featuresDiv;
                break;

                case "provider-side-nav-similar-streamer-currently-watching-1":
                    targetDiv = streamerFeaturesDiv;
                break;
            }

            channelList.items.forEach(stream => {
                let channelDiv;

                if (stream === null) return console.warn('null stream, possibly banned or deleted: ', stream);
                switch (stream.__typename) {
                    case "Stream":
                        let categoryTxt, viewCountTxt = null;
                        if (stream.game) categoryTxt = stream.game.displayName;
                        if (stream.viewersCount) viewCountTxt = stream.viewersCount;

                        // make div
                        channelDiv = document.createElement("a");
                        channelDiv.classList.add("channel");

                        // sometimes the gql returns null, idk why it even pulls it, but whatever.
                        if (!stream.broadcaster) return console.warn('no user, stream: ', stream);

                        channelDiv.href = `https://twitch.tv/${stream.broadcaster.login}`;
                        if (stream.broadcaster) channelDiv.title = stream.broadcaster.broadcastSettings.title;
                        channelDiv.innerHTML = `
                        <figure class="tw-avatar tw-avatar--size-30">
                            <div class="tw-overflow-hidden">
                                <img class="tw-image" src="${stream.broadcaster.profileImageURL}">
                            </div>
                        </figure>
                        <div class="channel-info">
                            <div class="left">
                                <span class="title">${stream.broadcaster.displayName}</span>
                                <span class="category">${categoryTxt ? categoryTxt : ""}</span>
                            </div>
                            <div class="right">
                                ${viewCountTxt ? viewCountTxt : "0"}
                            </div>
                        </div>
                        `;
                        targetDiv.appendChild(channelDiv);
                    break;

                    case "User":
                        // make div
                        channelDiv = document.createElement("a");
                        channelDiv.classList.add("channel");
        
                        channelDiv.href = `https://twitch.tv/${stream.login}`;
                        if (stream.content) channelDiv.title = stream.broadcastSettings.title;
                        channelDiv.innerHTML = `
                        <figure class="tw-avatar tw-avatar--size-30">
                            <div class="tw-overflow-hidden">
                                <img class="tw-image" src="${stream.profileImageURL}">
                            </div>
                        </figure>
                        <div class="channel-info">
                            <div class="left">
                                <span class="title">${stream.displayName}</span>
                            </div>
                            <div class="right tw-hide"}"></div>
                        </div>
                        `;
                        targetDiv.appendChild(channelDiv);
                    break;

                    default:
                        alert('You pulled new data I don\'t know about yet! Check your console & report it to the GitHub! Thanks!');
                        console.warn(`Hey! Right here! You pulled a new data type that I don't know about: ${stream.__typename}`, stream);
                    break;
                }
            });
        }
    });
}


// Show errors & stuff
function showError(args) {
    if (!args || !args.id) return console.error("Invalid");

    let mainDiv = document.querySelector('.twilight-main');

    if (mainDiv && args.id) {
        // css insert
        let style = document.createElement("style");
        style.innerHTML = `
            /* error css */

            [data-a-target="right-column-chat-bar"] {
                display: none !important;
            }
        `
        document.head.appendChild(style);

        // html insert
        switch (args.id) {
            case 404:
                mainDiv.innerHTML = `
                    <div class="tw-pd-3">
                        <h2>Not found.<h2>
                    </div>
                `;
            break;
        }
    }
}


// Account popup
let ifDoc, ifWindow, ifInterval;
let ifLoaded = false;
let closePopupClickListener = (e) => {
    if (document.querySelector('.oldttv-popup')) if (!e.target.closest(`.oldttv-popup iframe`)) closePopupAction();
};
let closePopupKeyListener = (e) => {
    if (document.querySelector('.oldttv-popup')) if (e.key == 'Escape') closePopupAction();
};
// Show account popup
function popupAction(args) {
    if (!args || !args.type) return console.error("Invalid");


    // Find or make the popup window
    let popupWindow = document.querySelector('.oldttv-popup');
    if (!popupWindow) {
        popupWindow = document.createElement('div');
        popupWindow.classList.add('oldttv-popup');
        popupWindow.innerHTML = `
            <div class="oldttv-popup__content">
                <h4 class="tw-md-mg-b-1">Click anywhere or press the "Escape" key to close this window.</h4>
                <h2 class="tw-md-mg-b-1" data-a-target="oldttv-popup-if-wait" style="max-width">Pleae wait for the iframe to load. If you feel like this goes on for too long, <a href="https://github.com/ktg5/OldTwitch/issues">please report it with the action you tried to do</a>.</h2>
                <iframe class="tw-hide" data-a-target="oldttv-popup-if" src="" width="520" height="300" style="background: black"></iframe>
            </div>
        `;
        document.body.appendChild(popupWindow);
    }
    let popupWindowIF = popupWindow.querySelector('iframe');

    // Add content depending on the "type" value
    switch (args.type) {
        case "signup":
            popupWindowIF.src = "/signup";
            args.resizeTarget = '.simplebar-content .Layout-sc-1xcs6mc-0';
        break;
    
        case "login":
            popupWindowIF.src = "/login";
            args.resizeTarget = '.simplebar-content .Layout-sc-1xcs6mc-0';
        break;

        case 'editclip':
            if (!args.clip && typeof args.clip !== "object") {
                console.error(`popupAction error`);
                return alert('stop lel');
            }
            popupWindowIF.src = `https://www.twitch.tv/${args.clip.host}/clip/${args.clip.id}?editclip&nooldttv`;
            args.resizeTarget = '#clip-editor-modal';
        break;
    }


    // iframe listener
    popupWindowIF.addEventListener('load', (e) => {
        // If first init since creation
        if (ifLoaded == false) {
            // Vars
            ifDoc = popupWindowIF.contentDocument;
            ifWindow = popupWindowIF.contentWindow;

            ifLoaded = true;
            // Swap form button stuff
            function initSwapButtons() {
                // Find the form div first to figure out what form we're in
                let formDiv;
                let tempInt = setInterval(() => {
                    formDiv = ifDoc.querySelector('form');
                    if (formDiv) {
                        continueFunc();
                        clearInterval(tempInt);
                    }
                }, 10);

                // Do logic depending on what form
                function continueFunc() {
                    if (formDiv.getAttribute('name') == "login-submit-form") {
                        ifDoc.querySelector('.kBhFFG').addEventListener('click', () => { initSwapButtons() });
                    } else if (formDiv.getAttribute('data-test-selector') == "signup-form") {
                        ifDoc.querySelector('.jirWOp').addEventListener('click', () => { initSwapButtons() });
                    }
                }
            }

            // Init & resize popup to fit with target
            if (!args.clip) initSwapButtons();
            let foundDiv = false;
            ifInterval = setInterval(() => {
                let targetDiv = ifDoc.querySelector(args.resizeTarget);
                if (targetDiv) {
                    // Unhide everything & start resizin'!
                    foundDiv = true;
                    popupWindow.querySelector('[data-a-target="oldttv-popup-if-wait"]').classList.add('tw-hide');
                    popupWindowIF.classList.remove('tw-hide');
                    if (args.clip) {
                        popupWindowIF.width = window.innerWidth / 1.25;
                        popupWindowIF.height = window.innerHeight / 1.05;
                    } else {
                        popupWindowIF.height = targetDiv.clientHeight;
                    }
                } else {
                    // Close popup if we already found our div
                    if (foundDiv == true) { closePopupAction(); };
                }
            }, 10);

            // Close listener
            setTimeout(() => {
                document.addEventListener('click', closePopupClickListener);
                ifWindow.addEventListener('keydown', closePopupKeyListener);
            }, 50);
        // Else, close & reload the whole page
        } else {
            closePopupAction();
            document.location.reload();
        }
    });
}

function closePopupAction() {
    // Clear iframe interval
    clearInterval(ifInterval);

    // Clear vars
    ifDoc = undefined;
    lastIfURL = undefined;
    ifInterval = undefined;
    ifLoaded = false;

    // Remove popup
    document.querySelector('.oldttv-popup').remove();

    // Remove event listener(s)
    document.removeEventListener('click', closePopupClickListener);
}


// On load
var currentVersion;
setTimeout(async () => {

    // Delete 3rd-party CSS
    setInterval(() => {
        document.querySelectorAll('link[rel="stylesheet"]').forEach(e => {
            switch (true) {
                case e.href.includes('clips-main.css'):
                    e.remove();
                break;
            }
        });
    }, 1000);

    if (oauth) {
        let style = document.createElement("style");
        style.innerHTML = `
            /* error css */

            [data-a-target="signup-note"] {
                display: none !important;
            }
        `
        document.head.appendChild(style);
    }

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
        if (debug) console.log("notification debug: ", debug);
        makeNotification(`The current version of OldTwitch you're on is out-of-date. Click the "Update" button to go to the latest update.`, [
            {
                key: "update",
                text: "Update",
                action: () => location.href = "https://github.com/ktg5/OldTwitch/releases/latest"
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
                tabsClosed.left = false;
            } else {
                sideNav.classList.add(`side-nav--collapsed`);
                sideNavArrow.classList.add(`side-nav__toggle-visibility--open`);
                tabsClosed.left = true;
            }
            localStorage.setItem("oldttv-tabsClosed", JSON.stringify(tabsClosed));
        });
    }
    if (tabsClosed.left) {
        let sideNav = document.querySelector(`.side-nav`);
        sideNav.classList.add(`side-nav--collapsed`);
        sideNavArrow.classList.add(`side-nav__toggle-visibility--open`);
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
    if (tabsClosed.right) {
        let rightNav = document.querySelector(`.right-column`);
        rightNav.classList.add(`right-column--collapsed`);
        rightNavArrow.classList.add(`right-column__toggle-visibility--open`);
    }

    // Extend button in left sidebar
    let extendButton = document.querySelector(`.channel-list-extend`);
    let unextendButton = document.querySelector(`.channel-list-unextend`);
    if (extendButton) {
        extendButton.addEventListener('click', (e) => {
            let forceData = channelListDiv.getAttribute('data-target');
            if (forceData) {
                switch (forceData) {
                    case "force-all":
                        channelListDiv.removeAttribute('data-target');
                    break;
                
                    default:
                        channelListDiv.setAttribute('data-target', 'force-all');
                    break;
                }
            } else {
                unextendButton.classList.remove(`tw-hide`);
                channelListDiv.setAttribute('data-target', 'first-20');
            }
        });
    }
    // Unextend button in left sidebar
    if (unextendButton) {
        unextendButton.classList.add(`tw-hide`);
        unextendButton.addEventListener('click', (e) => {
            let forceData = channelListDiv.getAttribute('data-target');
            if (forceData) {
                switch (forceData) {
                    case "force-all":
                        unextendButton.classList.remove(`tw-hide`);
                        channelListDiv.setAttribute('data-target', 'first-20');
                    break;
                
                    default:
                        unextendButton.classList.add(`tw-hide`);
                        channelListDiv.removeAttribute('data-target');
                    break;
                }
            } else {
                unextendButton.classList.add(`tw-hide`);
                channelListDiv.removeAttribute('data-target');
            }
        });
    }


    // Set balloon toggles
    document.querySelectorAll('.tw-balloon').forEach(balloon => {
        let balloonToggler = balloon.parentElement.children[0];
        document.addEventListener('click', (e) => {
            if (
                (e.target === balloon || balloon.contains(e.target)) || 
                (e.target === balloonToggler || balloonToggler.contains(e.target))
            ) {
                if (balloonToggler.getAttribute("data-a-target") != "nav-search-input") balloon.classList.remove('tw-hide');
            } else balloon.classList.add('tw-hide');
        });
    });


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
                document.querySelector(`.streamer-pfp`).innerHTML = `<a href="https://twitch.tv/${featuredStreams[i].broadcaster.login}"><img class="tw-image" src="${featuredStreams[i].broadcaster.profileImageURL}"></a>`;
                document.querySelector(`.item-name`).innerHTML = `<a style="color: #b8b5c0;" href="https://twitch.tv/${featuredStreams[i].broadcaster.login}">${featuredStreams[i].broadcaster.displayName}</a>`;
                document.querySelector(`.streamer-category`).innerHTML = `<a href="https://twitch.tv/directory/category/${featuredStreams[i].game.slug}">${featuredStreams[i].game.displayName}</a>`;
                document.querySelector(`.streamer-desc`).innerHTML = "";
                document.querySelector(`.streamer-tags`).innerHTML = "";
                featuredStreams[i].freeformTags.forEach(streamTag => {
                    document.querySelector(`.streamer-tags`).innerHTML += `<a class="search-tag" href="https://twitch.tv/directory/all/tags/${streamTag.name}">${streamTag.name}</a>`;
                });
            }

            // other channelssesese below main
            for (let i = 0; i < featuredStreams.length; i++) {
                const featuredStream = featuredStreams[i];
                
                let targetDiv = document.querySelector(`.tw-flex.tw-flex-nowrap.tw-pd-x-05.tw-pd-y-1`).children[i];
                if (targetDiv) {
                    targetDiv.title = `${featuredStream.broadcaster.displayName} - ${featuredStream.game.displayName}`;
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
            topGamesGrid.children[i].querySelector(`figure`).innerHTML = `<a href="https://twitch.tv/directory/category/${game.categorySlug}"><img class="tw-image" src="${game.boxArtURL}"></a>`;
            // title
            topGamesGrid.children[i].querySelector(`.game-title`).innerHTML = `<a href="https://twitch.tv/directory/category/${game.categorySlug}">${game.displayName}</a>`;
            // tags
            // topGamesGrid.children[i].querySelector(`.game-tags`).innerHTML = "";
            // game.gameTags.forEach(gameTag => {
            //     topGamesGrid.children[i].querySelector(`.game-tags`).innerHTML += `<a class="game-tag" href="https://twitch.tv/directory/all/tags/${gameTag.tagName}">${gameTag.localizedName}</a>`;
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
                topStreamersGrid.children[i].querySelector(`figure`).innerHTML = `<a href="https://twitch.tv/${channel.broadcaster.login}"><img class="tw-image" src="${channel.previewImageURL}"></a>`;
                // title
                topStreamersGrid.children[i].querySelector(`.item-name`).innerHTML = `<a href="https://twitch.tv/${channel.broadcaster.login}">${channel.broadcaster.displayName}</a>`;
                // viewers
                topStreamersGrid.children[i].querySelector(`.item-subtext`).innerHTML = `${channel.viewersCount} viewers on ${channel.broadcaster.displayName}`;
            }
        }

    };
    
}, 150);