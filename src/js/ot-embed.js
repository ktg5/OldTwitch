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
            // Add player CSS to head
            document.head.insertAdjacentHTML('afterbegin', `<link id="oldtwitch-css" class="oldtwitch-player" rel="stylesheet" type="text/css" href="${runtime.getURL('css/player.css')}">`);

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
