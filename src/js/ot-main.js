// cool-ass ascii art i guess lmao
var styles1 = [
    'background: linear-gradient(rgb(103, 23, 149),rgb(56, 2, 87))'
    , 'color: white'
    , 'display: block'
    , 'font-size: 18px'
    , 'text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)'
    , 'box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 5px 3px -5px rgba(0, 0, 0, 0.5), 0 -13px 5px -10px rgba(255, 255, 255, 0.4) inset'
    , 'line-height: 25px'
    , 'font-weight: bold'
].join(';');
var styles2 = [
    'background: linear-gradient(#0629d3, #022c57)'
    , 'border: 5px solid rgb(255 255 255 / 10%)'
    , 'color: white'
    , 'display: block'
    , 'text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)'
    , 'box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 5px 3px -5px rgba(0, 0, 0, 0.5), 0 -13px 5px -10px rgba(255, 255, 255, 0.4) inset'
].join(';');
var styles3 = [
    'background: linear-gradient(#06d316, #075702)'
    , 'border: 5px solid rgb(255 255 255 / 10%)'
    , 'color: white'
    , 'display: block'
    , 'text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)'
    , 'box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 5px 3px -5px rgba(0, 0, 0, 0.5), 0 -13px 5px -10px rgba(255, 255, 255, 0.4) inset'
].join(';');
console.log(`%cOldTwitch is up and running!`, styles1)
console.log(`%cIf you enabled some of the debug stuff, or wanna look at what the extension is doing, search for "ot-" in the console to get everything!`, styles2)

// Shortcuts
if (navigator.userAgent.includes("Chrome")) browser = chrome;
const storage = browser.storage.sync;
const extension = browser.extension;
const runtime = browser.runtime;
const extensionLocation = runtime.getURL('').slice(0, -1);
var userConfig;

// Default config
const def_ot_config = {
    // Basic settings.
    year: '2018',
    showReleaseNotes: true,
};

// Get the user config
getConfig();
function getConfig() {
	storage.get(['OTConfig'], async function(result) {
		if (result == undefined || Object.keys(result).length == 0) {
			await storage.set({OTConfig: def_ot_config});
			userConfig = await storage.get(['OTConfig']);
            console.log(`%cOLDTTV USER DATA (reset to default):`, styles3, userConfig);
            window.location.reload();
		} else {
			userConfig = result.OTConfig;
            console.log(`%cOLDTTV USER DATA:`, styles3, userConfig);
		}
	});
}


// Block Twitch scripts from adding their own stuff within the inject
function blockScriptElements(element) {
    if (element.tagName === 'SCRIPT') {
        element.type = 'javascript/blocked';
        const beforeScriptExecuteListener = function (event) {
            if (element.getAttribute('type') === 'javascript/blocked') {
                event.preventDefault();
            }
            element.removeEventListener('beforescriptexecute', beforeScriptExecuteListener);
        }
        element.addEventListener('beforescriptexecute', beforeScriptExecuteListener);
        element.remove();
    }
}
// A MutationObserver which uses the "blockScriptElements" function to stop scripts from OG site.
const blockingObserver = new MutationObserver((changes) => {
    changes.forEach((change) => {
        if (change.type === 'childList' && change.addedNodes.length > 0) {
            change.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    blockScriptElements(node);
                    node.querySelectorAll('script').forEach(blockScriptElements);
                }
            });
        }
    });
});
// Start observing the page for script changes.
blockingObserver.observe(document.documentElement, { childList: true, subtree: true });


// Remove the html element so that we can inject our own
let html = document.querySelector('html');
if (html) {
    html.innerHTML = '';
// Keep running until we can remove the html
} else {
    let removeInt = setInterval(() => {
        html = document.querySelector('html');
        if (html) {
            clearInterval(removeInt);
            html.innerHTML = '';
        };
    }, 10);
};


let firstInit = false;
async function handlePageChange () {
    // First, let's see what page we're working with.
    var injectTarget = '';
    var injectJSTargets = [];
    switch (true) {
        case location.pathname == "/":
            injectTarget = runtime.getURL(`html/index.html`);
            injectJSTargets.push(runtime.getURL('html/src/ot-gql.js'));
            injectJSTargets.push(runtime.getURL('html/lib/twitch-v1.js'));
            injectJSTargets.push(runtime.getURL('html/src/ot-webmain.js'));
        break;

        case location.pathname.startsWith("/search"):
            injectTarget = runtime.getURL('html/search.html');
            injectJSTargets.push(runtime.getURL('html/src/ot-gql.js'));
            injectJSTargets.push(runtime.getURL('html/lib/twitch-v1.js'));
            injectJSTargets.push(runtime.getURL('html/src/ot-webmain.js'));
            injectJSTargets.push(runtime.getURL('html/src/ot-search.js'));
        break;

        case location.pathname.startsWith("/directory"):
            if (location.pathname.startsWith("/directory/category")) injectTarget = runtime.getURL('html/directory/category.html');
            else injectTarget = runtime.getURL('html/directory/index.html');
            injectJSTargets.push(runtime.getURL('html/src/ot-gql.js'));
            injectJSTargets.push(runtime.getURL('html/lib/twitch-v1.js'));
            injectJSTargets.push(runtime.getURL('html/src/ot-webmain.js'));
            injectJSTargets.push(runtime.getURL('html/src/ot-directory.js'));
        break;

        case location.pathname.startsWith("/oldtwitch"):
            injectTarget = runtime.getURL('html/oldtwitch.html');
            injectJSTargets.push(runtime.getURL('lib/coloris.min.js'));
            injectJSTargets.push(runtime.getURL('html/src/ot-gql.js'));
            injectJSTargets.push(runtime.getURL('html/src/ot-webmain.js'));
            injectJSTargets.push(runtime.getURL('html/src/ot-settings.js'));
        break;

        default:
            injectTarget = runtime.getURL(`html/watch.html`);
            injectJSTargets.push(runtime.getURL('html/src/ot-gql.js'));
            injectJSTargets.push(runtime.getURL('html/lib/twitch-v1.js'));
            injectJSTargets.push(runtime.getURL('html/src/ot-webmain.js'));
            injectJSTargets.push(runtime.getURL('html/src/ot-watch.js'));
        break;
    }

    // Now it's time to inject our own HTML
    fetch(`${injectTarget}`).then(async data => {
        let currentVersion = await fetch(runtime.getURL('ver.txt')).then(res => res.text());

        // Inject HTML
        let htmlText = await data.text();
        htmlText = htmlText.replace('<body', `<body oldttv="${extensionLocation}" oldttv-ver="${currentVersion}"`);
        htmlText = htmlText.replace(/__([a-zA-Z0-9_]+)__/g, (match, key) => {
            switch (key) {
                case "EXTENSION_URL":
                return extensionLocation;

                default:
                return match;
            }
        });

        if (firstInit == false) {
            // First time inject - replace all
            html.innerHTML = htmlText;
            firstInit = true;
        } else {
            // Subsequent time inject - get the ".twilight-main" in both the current & incoming HTML and replace the innerHTML
            let currentMain = document.querySelector(".twilight-main");
            let newMain = html.querySelector(".twilight-main");
            currentMain.innerHTML = newMain.innerHTML;
        }


        // Check for any script elements with the "oldttv-js" id; if found, remove them
        let oldttvJS = document.querySelectorAll('script[id="oldttv-js"]');
        if (oldttvJS.length > 0) {
            oldttvJS.forEach(e => e.remove());
        };

        // Inject JS
        if (injectJSTargets.length > 0) injectJSTargets.forEach(jsTargets => {
            let srcDoc = document.createElement('script');
            srcDoc.id = 'oldttv-js';
            srcDoc.async = "";
            srcDoc.src = jsTargets;
            document.head.append(srcDoc);
        });

        // Stop observer
        blockingObserver.disconnect();


        // Check config
        if (userConfig.darkMode == true || window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) html.classList.add(`tw-theme--dark`);
    });
}

// Initial injection when the page first loads
handlePageChange();
