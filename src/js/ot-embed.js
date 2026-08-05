// Shortcuts
if (navigator.userAgent.includes("Chrome")) browser = chrome;
const storage = browser.storage.sync;
const extension = browser.extension;
const runtime = browser.runtime;
const extensionLocation = runtime.getURL('').slice(0, -1);
/** @type { import('../default_config.json') } */
var userConfig;


// Set userConfig -- details in ot-config.js
getUserConfig();


const html = document.querySelector('html');


setTimeout(() => {
    switch (location.hostname) {
        case "player.twitch.tv":
        case "clips.twitch.tv":
            const params = new URLSearchParams(location.search);


            // Add player CSS to head
            document.head.insertAdjacentHTML('afterbegin', `<link id="oldtwitch-css" class="oldtwitch-player" rel="stylesheet" type="text/css" href="${runtime.getURL('html/css/player.css')}">`);

            // if in a iframe
            if (window.self !== window.top) {
                let viewTwitchButton = document.querySelector(`.ScAttachedTooltipWrapper-sc-1ems1ts-0`);
                const videoInt = setInterval(() => {
                    if (viewTwitchButton) {
                        // start
                        viewTwitchButton.remove();

                        // end
                        clearInterval(videoInt);
                    } else viewTwitchButton = document.querySelector(`.ScAttachedTooltipWrapper-sc-1ems1ts-0`);
                }, 100);
            }


            // replace channel embed offline image with actual channel offline image
            if (params.get('channel') !== null) {
                fetch("https://gql.twitch.tv/gql", {
                    headers: {
                        "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
                    },
                    body: JSON.stringify({
                        "operationName": "OfflineBannerOverlay",
                        "variables": {
                            "login": params.get('channel')
                        },
                        "extensions": {
                            "persistedQuery": {
                                "sha256Hash": "64116eb1e0e2818e8d7a8afb2fa1e9a2fac5b2d1b5e8300b39209aa414f2e577",
                                "version": 1
                            }
                        }
                    }),
                    method: "POST"
                }).then(async rawData => {
                    let data = await rawData.json();
                    console.log(data);

                    if (data.errors) alert(JSON.stringify(data.errors));
                    else {
                        const img = data.data.user.offlineImageURL;
                        // create style element with offline img
                        const style = document.createElement('style');
                        style.textContent = `
.offline-embeds {
    background-image: url("${img}") !important;
}
                        `;
                        style.id = "oldtwitch-css";
                        style.classList.add("oldtwitch-offlineimg");
                        document.head.insertAdjacentElement('beforebegin', style);
                    }
                });
            }
        break;

        case 'www.twitch.tv':
            if (
                !userConfig
                || !userConfig.year
            ) setTimeout(() => location.reload(), 50);

            // Add chat CSS to head
            document.head.insertAdjacentHTML('afterbegin', `<link id="oldtwitch-css" class="oldtwitch-chat" rel="stylesheet" type="text/css" href="${runtime.getURL(`html/css/chat.css`)}">`);
            if (
                (
                    userConfig.forceColorMode == true
                    && userConfig.forceWhichColorMode == '1'
                )
                || (
                    (userConfig.forceColorMode == undefined || userConfig.forceColorMode == false)
                    && window.matchMedia
                    && window.matchMedia('(prefers-color-scheme: dark)').matches
                )
            ) {
                html.classList.remove(`tw-root--theme-light`);
                html.classList.add(`tw-root--theme-dark`);
            }
        break;
    }
}, 100);
