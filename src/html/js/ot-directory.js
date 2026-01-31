// On load
let gqlAction = async () => {

    // Only execute if on the "game" sub page
    if (location.pathname.includes('/directory/category/')) {

        // Get all game info
        let categoryData = await gql.getAllCategoryData(location.pathname.split('/directory/category/').pop());
        console.log('categoryData: ', categoryData);

        // Set page title
        document.title = categoryData.displayName + " - " + document.title;
        
        // Set banner?
        // unsure if this even exists anymore but it's worth a try
        // Set title
        document.querySelector(`.directory-header__title h2`).innerHTML = categoryData.displayName;
        document.querySelector(`.directory-header__title .tw-placeholder-wrapper`).classList.add("tw-hide");
        // Set subtitle
        document.querySelector(`.directory-header__title`).innerHTML += `
            <span>${categoryData.followersCount} followers • ${categoryData.viewersCount} viewers</span>
        `;
        // Set box art
        document.querySelector(`.directory-header__avatar`).innerHTML = `<img class="tw-image" src="${categoryData.avatarURL}">`;

        // Set active tab
        document.querySelector(`[data-a-target="game-directory-live-channels-tab"]`).classList.add("directory-tabs__item--selected");
        // Add streams
        let divInject = document.querySelector(`[data-a-target="directory-root-scroller"] .tw-tower`);

        // Load the desired data of a streamer on watch page
        async function loadStreamerSidePage(sideargs) {
            if (!sideargs.elmnt) return alert("Invalid element");
            if (!sideargs.tab) return alert("Invalid tab");

            // clear old data
            divInject.innerHTML = "";

            let selectedTabName = "directory-tabs__item--selected"
            let currentClickedTab = document.querySelector(`.${selectedTabName}`);
            if (currentClickedTab == null) currentClickedTab = document.querySelector(`.${selectedTabName}`);
            // remove active tab
            if (currentClickedTab) {
                currentClickedTab.classList.remove(selectedTabName);
                currentClickedTab.classList.remove(selectedTabName);
            }
            // add new active tab
            sideargs.elmnt.classList.add(selectedTabName);


            // set data
            function setTabData(data) {
                if (!data) return alert("Invalid data");
                if (data.length < 1) return divInject.innerHTML = `<h4 style="max-width: 100%; width: 100%;">There doesn't seem to be anything here...</h4>`;

                data.forEach(item => {
                    // href
                    let itemHref, itemType;
                    switch (item.__typename) {
                        case "Stream":
                            itemHref = `https://www.twitch.tv/${item.broadcaster.login}`;
                            itemType = "stream";
                        break;

                        case "Clip":
                            itemHref = `https://www.twitch.tv/${item.broadcaster.login}/clips/${item.slug}`;
                            itemType = "clip";
                        break;

                        case "Video":
                            itemHref = `https://www.twitch.tv/videos/${item.id}`;
                            itemType = "video";
                        break;
                    }

                    // subtext - game category
                    let itemSubtext = "";
                    switch (itemType) {
                        case "stream":
                            itemSubtext = `${item.viewersCount} viewers on ${item.broadcaster.displayName}`;
                        break;

                        case "video":
                            itemSubtext = `${item.viewCount} views`;
                        break;

                        case "clip":
                            itemSubtext = `Clipped by <a href="https://www.twitch.tv/${item.curator.login}">${item.curator.displayName}</a>`;
                        break;
                    }

                    let streamerDiv = document.createElement('div');
                    streamerDiv.className = "directory-item";
                    streamerDiv.innerHTML = `
                    <div class="tw-mg-b-2">
                        <div class="tw-mg-b-05">
                            <figure class="tw-aspect tw-aspect--16x9 tw-aspect--align-top">
                                <a href="${itemHref}">
                                    <img class="tw-image" src="${item.animatedPreviewURL ? item.animatedPreviewURL : item.thumbnailURL ? item.thumbnailURL : item.previewImageURL}">
                                </a>
                            </figure>
                        </div>
                        <div class="item-info">
                            <div class="item-text">
                                <p class="item-name"><a href="${itemHref}">${item.title}</a></p>
                                <p class="item-subtext tw-font-size-7">${itemSubtext}</p>
                            </div>
                        </div>
                    </div>
                    `;
                    divInject.appendChild(streamerDiv);
                });
            }

            // check tab type & go to the set data function
            switch (sideargs.tab) {
                case "live-channels":
                    setTabData(categoryData.streams);
                break;
    
                case "videos":
                    setTabData(categoryData.videos);
                break;
            
                case "clips":
                    setTabData(categoryData.clips);
                break;
            }
        }


        // go to tab if found
        if (location.hash.length > 0) {
            let tab = location.hash.split("#")[1];
            let elmnt = document.querySelector(`[data-a-target="game-directory-${tab}-tab"]`);

            if (elmnt) loadStreamerSidePage({elmnt: elmnt, tab: tab});
        } else {
            let elmnt = document.querySelector(`[data-a-target="game-directory-live-channels-tab"]`);
            if (elmnt) loadStreamerSidePage({elmnt: elmnt, tab: "live-channels"});
        }

        // Make topbar buttons worky
        document.addEventListener("click", async (e) => {
            let closestTarget = e.target.closest(`.directory-tabs__item`);

            if (closestTarget && closestTarget.href) loadStreamerSidePage({elmnt: closestTarget, tab: closestTarget.getAttribute('data-a-target').split('game-directory-')[1].split('-tab')[0]});
        });

    } else {

        // Set page title
        setTimeout(() => document.title = langStrings.page['all-categories-page-title'], 100);

        // Get directory index data
        let directoryData = await gql.getDirectoryIndex(oauth, 30);
        console.log("directoryData: ", directoryData);

        // Make sort bar
        const directorySorter = new SortBar(document.querySelector('[data-a-target="sort-bar"]'), [
            {
                id: "categories",
                textBeforeSelect: langStrings.page['sorted-by'],
                selections: [
                    {
                        id: "recommended",
                        displayName: langStrings.page['recommended'],
                        onSelect: async (d) => {
                            clearPageData();
                            setDirectoryPage(await gql.getDirectoryIndex(oauth, 30));
                        }
                    },
                    {
                        id: "viewers",
                        displayName: langStrings.page['viewers'],
                        onSelect: async (d) => {
                            clearPageData();
                            setDirectoryPage(await gql.getDirectoryIndex(oauth, 30, true));
                        }
                    }
                ]
            }
        ]);
        const sidePageLoading = new LoadingSpinner(directorySorter.div, true);

        let injectDiv = document.querySelector(`[data-a-target="directory-inject"]`);
        function clearPageData(forceSpinner) {
            injectDiv.innerHTML = "";
            sidePageLoading.toggle(forceSpinner !== null && typeof forceSpinner == "boolean" ? forceSpinner : true);
        }

        // Inject HTML
        // Make sure grid is there
        function addDirectoryGrid() {
            injectDiv.innerHTML = `<div class="tw-grid"></div>`;
            injectDiv = injectDiv.children[0];
        };
        if (!injectDiv.classList.contains('tw-grid')) {
            if (injectDiv.children.length < 1) addDirectoryGrid();
            else if (injectDiv.children[0].classList.contains('tw-grid')) injectDiv = injectDiv.children[0];
            else {
                for (let i = 0; i < injectDiv.children.length; i++) {
                    const element = injectDiv.children[i];
                    element.remove();
                }
                addDirectoryGrid();
            }
        }

        // Add data into grid
        function setDirectoryPage(directoryData) {
            directoryData.forEach(item => {
                let gameItem = document.createElement("div");
                gameItem.classList.add("tw-col-2");
                gameItem.innerHTML = `
                    <div class="tw-mg-b-4">
                        <div class="tw-mg-b-05">
                            <figure class="tw-aspect tw-aspect--3x4 tw-aspect--align-top"><a href="/directory/category/${item.slug}"><img class="tw-image" src="${item.avatarURL}"></a></figure>
                        </div>
                        <p class="game-title"><a href="/directory/category/${item.slug}">${item.displayName}</a></p>
                        <p class="game-tags tw-font-size-7"></p>
                    </div>
                `;
                gameItem.querySelector('.game-tags').innerText = langStrings.page['game-viewers'].replace('&OLDTTV{GAME_VIEWERS}&', item.viewersCount);
    
                injectDiv.appendChild(gameItem);
            });
        }
        setDirectoryPage(directoryData);

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