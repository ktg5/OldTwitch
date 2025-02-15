// On load
let gqlAction = async () => {

    // Only execute if on the "game" sub page
    if (location.pathname.includes('/directory/category/')) {
        // Get all game info
        let categoryData = await gql.getAllCategoryData(location.pathname.split('/directory/category/').pop());
        console.log('categoryData: ', categoryData);
        
        // Set banner?
        // unsure if this even exists anymore but it's worth a try
        // Set title
        document.querySelector(`.directory-header__title h2`).innerHTML = categoryData.displayName;
        document.querySelector(`.directory-header__title span`).classList.add("tw-hide");
        // Set box art
        document.querySelector(`.directory-header__avatar`).innerHTML = `<img class="tw-image" src="${categoryData.avatarURL}">`;

        // TODO: Make all tabs work on this shit
        // Set active tab
        document.querySelector(`[data-a-target="game-directory-live-channels-tab"]`).classList.add("directory-tabs__item--selected");
        // Add streams
        let divInject = document.querySelector(`[data-a-target="directory-root-scroller"] .tw-tower`);
        categoryData.streams.forEach(stream => {
            let streamerDiv = document.createElement('div');
            streamerDiv.className = "directory-streamer";
            streamerDiv.innerHTML = `
            <div class="tw-mg-b-2">
                <div class="tw-mg-b-05">
                    <figure class="tw-aspect tw-aspect--16x9 tw-aspect--align-top">
                        <a href="/${stream.broadcaster.login}">
                            <img class="tw-image" src="${stream.previewImageURL}">
                        </a>
                    </figure>
                </div>
                <p class="streamer-name"><a href="/${stream.broadcaster.login}">${stream.title}</a></p>
                <p class="streamer-viewers tw-font-size-7">${stream.viewersCount} viewers on ${stream.broadcaster.displayName}</p>
            </div>
            `;
            divInject.appendChild(streamerDiv);
        });
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