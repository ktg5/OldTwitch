var extensionLocation = document.querySelector('body').getAttribute('oldttv');


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
if (sidebar) {
    fetch(`${extensionLocation}/html/global/sidenav.html`).then(async data => {
        // Inject HTML
        let htmlText = await data.text();
        textToHtml(htmlText, sidebar);

        // On click handlers
        document.querySelector('button.side-nav__toggle-visibility').addEventListener('click', (e) => {
            
        });
    });
}