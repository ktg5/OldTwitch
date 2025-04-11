setTimeout(async () => {
    
    // ###### search bar ######

    let searchBar = document.querySelector('[data-a-target="nav-search-input"]');
    let searchBarInput = searchBar.querySelector('.tw-input');
    let searchBarBalloon = searchBar.parentElement.querySelector('.tw-balloon');


    // click event if there's a value
    searchBarInput.addEventListener('click', async (e) => {
        if (searchBarInput.value != "") {
            searchBarBalloon.classList.remove('tw-hide');
        }
    });

    // input detection
    let sendGQLTimeout;
    searchBarInput.addEventListener('input', async (e) => {
        clearTimeout(sendGQLTimeout);

        if (document.activeElement == searchBarInput) {
            if (searchBarInput.value != "") {
                searchBarBalloon.classList.remove('tw-hide');

                sendGQLTimeout = setTimeout(async () => {
                    let searchBarData = await gql.getSearchBarData(`${searchBarInput.value}`);
                    console.log("searchBarData: ", searchBarData);

                    // set balloon's content to spinner
                    let searchContent = searchBarBalloon.querySelector(`.simplebar-content`);
                    searchContent.innerHTML = `
                        <div class="tw-full-width tw-full-height tw-align-items-center tw-flex tw-justify-content-center">
                            <div class="tw-loading-spinner"></div>
                        </div>
                    `;
                    let noDataTxt = `
                        <div class="tw-full-width tw-pd-t-2 tw-pd-b-2">
                            <div class="search-results-panel__notice-wrap tw-full-height tw-z-above tw-align-items-center tw-flex tw-flex-column tw-flex-grow-1 tw-justify-content-center">
                                <div class="tw-c-text-alt-2  tw-flex-shrink-1 tw-align-center">
                                    <figure class="tw-svg">
                                        <svg class="tw-svg__asset tw-svg__asset--deadglitch tw-svg__asset--inherit" width="46px" height="48px" version="1.1" viewBox="0 0 30 30" x="0px" y="0px">
                                            <g>
                                                <path d="M26,17.4589613 L26,3 L4,3 L4,22.0601057 L10.0032868,22.0601057 L10.0032868,26 L14.0004537,22.0601057 L21.3322933,22.0601057 L26,17.4589613 L26,17.4589613 Z M21.0896458,26.0850335 L15.1583403,26.0850335 L11.2051771,30 L7.24798611,30 L7.24798611,26.0850335 L0,26.0850335 L0,5.21746493 L1.97773958,0 L29,0 L29,18.2620736 L21.0896458,26.0850335 L21.0896458,26.0850335 Z"></path>
                                                <path d="M20.8587626,12.1710126 L22.4052753,13.7175252 L23.7175252,12.4052753 L22.1710126,10.8587626 L23.7175252,9.31224999 L22.4052753,8 L20.8587626,9.54651264 L19.31225,8 L18,9.31224999 L19.5465126,10.8587626 L18,12.4052753 L19.31225,13.7175252 L20.8587626,12.1710126 Z M11.8587626,12.1710126 L13.4052753,13.7175252 L14.7175252,12.4052753 L13.1710126,10.8587626 L14.7175252,9.31224999 L13.4052753,8 L11.8587626,9.54651264 L10.31225,8 L9,9.31224999 L10.5465126,10.8587626 L9,12.4052753 L10.31225,13.7175252 L11.8587626,12.1710126 Z"></path>
                                            </g>
                                        </svg>
                                    </figure>
                                </div>
                                <h4 class="tw-align-center tw-mg-t-1" data-test-selector="search-error-message">Search couldn't find anything</h4>
                                <p class="">Please try a different search query</p>
                            </div>
                            <div class="scrollable-trigger__wrapper">
                                <div class="scrollable-trigger__trigger-area scrollable-trigger__trigger-area--up" style="height: 100px;"></div>
                            </div>
                        </div>
                    `;

                    // insert data into the search thing lmao
                    if (searchBarData.length == 0) return searchContent.innerHTML = noDataTxt;
                    else {
                        searchContent.innerHTML = `<div class="tw-full-width tw-full-height tw-pd-t-05 tw-pd-b-05"></div>`;
                        searchContent = searchContent.children[0];

                        searchBarData.forEach(elmnt => {
                            // html elmnt
                            let elmntHtml = document.createElement('div');
                            elmntHtml.classList.add('search-result', 'tw-full-width', 'tw-align-items-center');
    
                            // make innerhtml
                            elmntHtml.innerHTML = `<div class="search-result__title">${elmnt.text}</div>`;
                            if (elmnt.content) switch (elmnt.content.__typename) {
                                case "SearchSuggestionChannel":
                                    elmntHtml.innerHTML = `
                                        <div class="search-result__avatar tw-avatar tw-avatar--size-40">
                                            <img src="${elmnt.content.profileImageURL}">
                                        </div>
                                        <div class="search-result__title">${elmnt.text}</div>
                                    `;
                                break;
    
                                case "SearchSuggestionCategory":
                                    elmntHtml.innerHTML = `
                                        <div class="search-result__cover tw-avatar">
                                            <img src="${elmnt.content.boxArtURL}">
                                        </div>
                                        <div class="search-result__title">${elmnt.text}</div>
                                    `;
                                break;
                            }

                            // insert html
                            searchContent.appendChild(elmntHtml);

                            // add click event
                            elmntHtml.addEventListener('click', () => {
                                if (elmnt.content) switch (elmnt.content.__typename) {
                                    case "SearchSuggestionChannel":
                                        location.href = `/${elmnt.content.login}`;
                                    break;
    
                                    case "SearchSuggestionCategory":
                                        location.href = `/directory/category/${elmnt.content.game.slug}`;
                                    break;
                                } else location.href = `/${elmnt.text}`;
                            });
                        });
                    }
                }, 200);
            } else searchBarBalloon.classList.add('tw-hide');
        }
    });

    // confirm search button & enter action
    searchBarInput.addEventListener('keydown', async (e) => {
        if (e.key == 'Enter') {
            if (searchBarInput.value != "") location.href = `/search?term=${searchBarInput.value}`;
        }
    });
    searchBar.querySelector(`.tw-input__icon-group`).addEventListener('click', async (e) => {
        if (searchBarInput.value != "") location.href = `/search?term=${searchBarInput.value}`;
    });


    // ###### search page ######

    if (location.pathname == "/search") {
        let searchParams = new URLSearchParams(location.search);
        let searchTerm = searchParams.get('term');
        if (searchTerm) {
            
            // get search results
            let searchResults = await gql.getSearchData(searchTerm);
            console.log("searchResults: ", searchResults);

            // set page title
            document.title = `"${searchTerm}" - ${document.title}`; 


            let insertDiv = document.querySelector(`[data-a-target="search-inject"]`);
            if (searchResults) {
                // remove flex from insert div
                insertDiv.classList.remove('tw-flex');

                // make search result lists
                insertDiv.innerHTML = `
                    <div class="search-result-list tw-mg-b-6" data-target="channels-search-results">
                        <h3 class="search-result-list__title tw-mg-b-1">Channels</h3>
                        <div class="search-result-list__data tw-tower"></div>
                    </div>
                    <div class="search-result-list tw-mg-b-6" data-target="categories-search-results">
                        <h3 class="search-result-list__title tw-mg-b-1">Categories</h3>
                        <div class="search-result-list__data"></div>
                    </div>
                    <div class="search-result-list tw-mg-b-6" data-target="vods-search-results">
                        <h3 class="search-result-list__title tw-mg-b-1">Past videos</h3>
                        <div class="search-result-list__data"></div>
                    </div>
                `;
                let insertDivs = [];
                for (const key in insertDiv.children) {
                    if (Object.hasOwnProperty.call(insertDiv.children, key)) {
                        const element = insertDiv.children[key];
                        insertDivs.push(element.querySelector(`.search-result-list__data`));
                    }
                }

                // insert data into html
                for (const key in searchResults) {
                    if (Object.hasOwnProperty.call(searchResults, key)) {
                        const keyData = searchResults[key];
                        
                        if (keyData) switch (key) {
                            case "channels":
                                keyData.forEach(elmnt => {
                                    console.log(elmnt);
                                    insertDivs[0].innerHTML += `
                                        <div class="search-result tw-flex tw-full-width tw-mg-t-1 tw-mg-b-1" href="/${elmnt.login}">
                                            <a class="search-result__image">
                                                <img src="${elmnt.stream.previewImageURL}">
                                            </a>
                                            <div class="search-result__info">
                                                <a class="search-result__title">
                                                    <h4>${elmnt.displayName}</h4>
                                                </a>
                                                <a class="search-result__subtitle" href="/directory/category/${elmnt.stream.game.slug}">${elmnt.stream.game.name}</a>
                                                <div class="search-result__subtitle">${elmnt.stream.viewersCount} viewers</div>
                                                <div class="search-result__subtitle">${elmnt.broadcastSettings.title}</div>
                                            </div>
                                        </div>
                                    `;
                                });
                            break;
    
                            case "games":
                                keyData.forEach(elmnt => {
                                    insertDivs[1].innerHTML += `
                                        <div class="search-result tw-flex tw-full-width tw-mg-t-1 tw-mg-b-1" href="/directory/category/${elmnt.slug}">
                                            <a class="search-result__image">
                                                <img src="${elmnt.boxArtURL}">
                                            </a>
                                            <div class="search-result__info">
                                                <a class="search-result__title">
                                                    <h4>${elmnt.name}</h4>
                                                </a>
                                                <div class="search-result__subtitle">${elmnt.viewersCount} viewers</div>
                                            </div>
                                        </div>
                                    `;
                                });
                            break;
    
                            case "videos":
                                keyData.forEach(elmnt => {
                                    insertDivs[2].innerHTML += `
                                        <div class="search-result tw-flex tw-full-width tw-mg-t-1 tw-mg-b-1" href="/videos/${elmnt.id}">
                                            <a class="search-result__image">
                                                <img src="${elmnt.previewThumbnailURL}">
                                            </a>
                                            <div class="search-result__info">
                                                <a class="search-result__title">
                                                    <h4>${elmnt.title}</h4>
                                                </a>
                                            </div>
                                        </div>
                                    `;
                                });
                            break;
                        }
                    }
                }

                // add click events for each search result
                let searchResultsDivs = document.querySelectorAll(`.search-result`);
                searchResultsDivs.forEach(elmnt => {
                    elmnt.addEventListener('click', () => {
                        location.href = elmnt.getAttribute('href');
                    });
                    elmnt.querySelector(`.search-result__image`).href = elmnt.getAttribute('href');
                    elmnt.querySelector(`.search-result__title`).href = elmnt.getAttribute('href');
                });
            }

        } else location.href = "/";
    }

}, 150);