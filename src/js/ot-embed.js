// Shortcuts
if (navigator.userAgent.includes("Chrome")) browser = chrome;
const storage = browser.storage.sync;
const extension = browser.extension;
const runtime = browser.runtime;
const extensionLocation = runtime.getURL('').slice(0, -1);
var userConfig;


setTimeout(() => {
    switch (location.hostname) {
        case "player.twitch.tv":
        case "clips.twitch.tv":
            // Add player CSS to head
            document.head.insertAdjacentHTML('afterbegin', `<link id="oldtwitch-css" class="oldtwitch-player" rel="stylesheet" type="text/css" href="${runtime.getURL('css/player.css')}">`);
        break;

        case 'www.twitch.tv':
            // Add chat CSS to head
            document.head.insertAdjacentHTML('afterbegin', `<link id="oldtwitch-css" class="oldtwitch-chat" rel="stylesheet" type="text/css" href="${runtime.getURL('css/chat.css')}">`);
        break;
    
        default:

        break;
    }
}, 100);
