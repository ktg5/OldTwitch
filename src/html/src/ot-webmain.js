var extensionLocation = document.querySelector('body').getAttribute('oldttv');


// Replace placeholder with text
async function placeholderToText(element, text) {
    if (typeof element != "object") return console.log("Invalid args");

    if (element.classList.contains("tw-placeholder-wrapper")) {
        element.classList.remove("tw-placeholder-wrapper");
        element.innerHTML = `<span class="tw-font-size-5">${text}</span>`;
    }
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
        userData = await gql.getUserInfo(oauth);
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
                    <div class="user-info">
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
                    </div>
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
                if (channel.content.game) categoryTxt = channel.content.game.displayName;
                if (channel.content.viewersCount) viewCountTxt = channel.content.viewersCount;
                // console.log(viewCountTxt);

                // make div
                let channelDiv = document.createElement("div");
                channelDiv.classList.add("channel");
                channelDiv.title = channel.content.broadcaster ? channel.content.broadcaster.broadcastSettings.title : "";
                channelDiv.innerHTML = `
                <figure class="tw-avatar tw-avatar--size-36">
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

                channelDiv.addEventListener("click", (e) => {
                    location.pathname = `/${channel.user.login}`;
                });
            });
        }

        // On click handlers
        document.querySelector('button.side-nav__toggle-visibility').addEventListener('click', (e) => {
            
        });
    });
}
