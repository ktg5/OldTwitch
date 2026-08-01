/// <reference path="ot-webmain.js" />


// On load
let gqlAction = async () => {

    // Only execute if on the "game" sub page
    if (location.pathname.includes('/directory/category/')) {

        // Get all game info
        const gameSlugWithTab = location.pathname.split('/directory/category/').pop().split('/');
        const gameSlug = gameSlugWithTab[0];
        let categoryData = await gql.getCategoryMedia(gameSlug);
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

        // Make loading spinner
        const loadingSpinner = new LoadingSpinner(document.querySelector('.simplebar-scroll-content .tw-tower').parentElement);
        // Make sortbar
        const sortBarDiv = document.querySelector('[data-a-target="sort-bar"]');
        const sortBar = new SortBar(sortBarDiv);
        sortBar.div.classList.remove('tw-mg-b-2');

        // Remove other placeholders in the sortbar area
        document.querySelector('.game-details-box').querySelectorAll('.tw-placeholder-wrapper').forEach((placeholder) => placeholder.remove());

        // Load the desired data of a streamer on watch page
        /**
         * 
         * @param {{ elmnt: HTMLElement, tab: "live-channels" | "videos" | "clips" }} sideargs 
         * @returns {void}
         */
        async function loadStreamerSidePage(sideargs) {
            if (
                !sideargs.elmnt
                || !sideargs instanceof HTMLElement
            ) {
                console.error(`directory.loadStreamerSidePage(): Invalid element--got: `, sideargs.elmnt);
                return alert("directory.loadStreamerSidePage(): Invalid element, check logs");
            }
            if (!sideargs.tab) {
                const txt = "directory.loadStreamerSidePage(): Invalid tab string";
                console.error(`${txt}--got: `, sideargs.tab);
                return alert(txt);
            }

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


            /**
             * @param {Object[]} data category data from GQL
             * @returns {void}
             */
            function setTabData(data) {
                if (!data) return alert("Invalid data");
                if (data.length < 1) return divInject.innerHTML = `<h4 style="max-width: 100%; width: 100%;" data-lang-target="no-results"></h4>`;
                divInject.innerHTML = '';
                loadingSpinner.toggle(false);

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
                            itemSubtext = String(lang.page["viewers-watching"])
                                .replace('&OLDTTV{VIEWERS}&', item.viewersCount)
                                .replace('&OLDTTV{CHANNEL}&', item.broadcaster.displayName);
                        break;

                        case "video":
                            itemSubtext = String(lang.page["video-views"]).replace('&OLDTTV{VIEWS}&', item.viewCount);
                        break;

                        case "clip":
                            itemSubtext = String(lang.page["clipped-by"]).replace('&OLDTTV{CREATOR}&', `<a href="https://www.twitch.tv/${item.curator.login}">${item.curator.displayName}</a>`);
                        break;
                    }

                    let streamerDiv = document.createElement('div');
                    streamerDiv.className = "directory-item";
                    const thumbImg = String(item.animatedPreviewURL ? item.animatedPreviewURL : item.thumbnailURL ? item.thumbnailURL : item.previewImageURL)
                        .replace('1920x1080', '640x360');
                    streamerDiv.innerHTML = `
<div class="tw-mg-b-2">
    <div class="tw-mg-b-05">
        <figure class="tw-aspect tw-aspect--16x9 tw-aspect--align-top">
            <a href="${itemHref}">
                <img class="tw-image" src="${thumbImg}">
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


            /**
             * @param {Object} data 
             */
            async function sortBarSelect(data) {
                divInject.innerHTML = '';
                loadingSpinner.toggle(true);
                console.log(data);
                return await gql.getCategoryMedia(gameSlug, data);
            }

            // check tab type & go to the set data function
            // also set sortbar info
            switch (sideargs.tab) {
                case "live-channels":
                    // first init
                    setTabData(categoryData.streams);

                    // sort bar stuff
                    sortBar.setOptions([
                        {
                            id: "streams",
                            textBeforeSelect: lang.page['sorted-by'],
                            selections: [
                                {
                                    id: "viewers",
                                    displayName: lang.page['viewers'],
                                    onSelect: async (d) => setTabData((await sortBarSelect({
                                        streamSort: "VIEWER_COUNT"
                                    })).streams)
                                },
                                {
                                    id: "viewers_low",
                                    displayName: lang.page['viewers-low'],
                                    onSelect: async (d) => setTabData((await sortBarSelect({
                                        streamSort: 'VIEWER_COUNT_ASC'
                                    })).streams)
                                },
                                {
                                    id: "recommended",
                                    displayName: lang.page['recommended'],
                                    onSelect: async (d) => setTabData((await sortBarSelect({
                                        streamSort: 'RELEVANCE'
                                    })).streams),
                                    selected: true
                                },
                                {
                                    id: "recent",
                                    displayName: lang.page['recent'],
                                    onSelect: async (d) => setTabData((await sortBarSelect({
                                        streamSort: 'RECENT'
                                    })).streams)
                                }
                            ]
                        }
                    ]);
                break;
    
                case "videos":
                    // first init
                    setTabData(categoryData.videos);

                    // sort bar stuff
                    sortBar.setOptions([
                        {
                            id: "videos_sort",
                            textBeforeSelect: lang.page['sorted-by'],
                            selections: [
                                {
                                    id: "views",
                                    displayName: lang.page['total-views'],
                                    onSelect: async (d) => setTabData((await sortBarSelect({
                                        vodSort: 'VIEWS'
                                    })).videos),
                                    selected: true
                                },
                                {
                                    id: "time",
                                    displayName: lang.page['recent'],
                                    onSelect: async (d) => setTabData((await sortBarSelect({
                                        vodSort: 'TIME'
                                    })).videos)
                                }
                            ]
                        }
                    ]);
                break;
            
                case "clips":
                    // first init
                    setTabData(categoryData.clips);

                    // sort bar stuff
                    sortBar.setOptions([
                        {
                            id: "clips",
                            textBeforeSelect: lang.page['show-from'],
                            selections: [
                                {
                                    id: "last_day",
                                    displayName: lang.page['last-day'],
                                    onSelect: async (d) => setTabData((await sortBarSelect({
                                        clipSort: 'LAST_DAY'
                                    })).clips)
                                },
                                {
                                    id: "last_week",
                                    displayName: lang.page['last-week'],
                                    onSelect: async (d) => setTabData((await sortBarSelect({
                                        clipSort: 'LAST_WEEK'
                                    })).clips),
                                    selected: true
                                },
                                {
                                    id: "last_month",
                                    displayName: lang.page['last-month'],
                                    onSelect: async (d) => setTabData((await sortBarSelect({
                                        clipSort: 'LAST_MONTH'
                                    })).clips)
                                },
                                {
                                    id: "all_time",
                                    displayName: lang.page['all-time'],
                                    onSelect: async (d) => setTabData((await sortBarSelect({
                                        clipSort: 'ALL_TIME'
                                    })).clips)
                                }
                            ]
                        }
                    ]);
                break;
            }
        }


        // go to tab if found
        if (gameSlugWithTab.length > 1) {
            console.log(gameSlugWithTab);
            let tab = gameSlugWithTab[1];
            let elmnt = document.querySelector(`[data-a-target="game-directory-${tab}-tab"]`);
            loadStreamerSidePage({elmnt: elmnt, tab: tab});
        } else {
            let elmnt = document.querySelector(`[data-a-target="game-directory-live-channels-tab"]`);
            loadStreamerSidePage({elmnt: elmnt, tab: "live-channels"});
        }

        // Make topbar buttons worky
        document.querySelectorAll('.directory-tabs__item').forEach((tabItem) => {
            tabItem.href = tabItem.href.replace('__SLUG__', gameSlug);

            tabItem.addEventListener('click', (e) => {
                e.preventDefault();

                // set location
                history.pushState({}, '', tabItem.href);
                history.replaceState({}, '', tabItem.href);

                loadStreamerSidePage({elmnt: tabItem, tab: tabItem.getAttribute('data-a-target').split('game-directory-')[1].split('-tab')[0]});
            });
        });

    } else {

        // Set page title
        setTimeout(() => document.title = `${String(lang.page['all-categories-page-title']) - Twitch}`, 100);

        // Get directory index data
        let directoryData = await gql.getDirectoryIndex(oauth, 30);
        console.log("directoryData: ", directoryData);

        // Make sort bar
        const directorySorter = new SortBar(document.querySelector('[data-a-target="sort-bar"]'), [
            {
                id: "categories",
                textBeforeSelect: String(lang.page['sorted-by']),
                selections: [
                    {
                        id: "recommended",
                        displayName: String(lang.page['recommended']),
                        onSelect: async (d) => {
                            clearPageData();
                            setDirectoryPage(await gql.getDirectoryIndex(oauth, 30));
                        }
                    },
                    {
                        id: "viewers",
                        displayName: String(lang.page['viewers']),
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
                gameItem.querySelector('.game-tags').textContent = lang.page['game-viewers'].replace('&OLDTTV{GAME_VIEWERS}&', item.viewersCount);
    
                injectDiv.appendChild(gameItem);
            });
        }
        setDirectoryPage(directoryData);

    }

}


let tempInit = setInterval(() => {
    if (
        gql
        && lang.page['game-viewers']
    ) {
        gqlAction();
        clearInterval(tempInit);
    }
}, 50);
