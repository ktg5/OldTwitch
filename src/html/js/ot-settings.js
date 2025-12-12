var def_ot_config;
extensionLocation = document.querySelector('body').getAttribute('oldttv-url');
  
function doSettings() {
    return new Promise((resolve, reject) => {
        let firstInit = setInterval(async () => {
            if (userConfig) {
                clearInterval(firstInit);


                // Function for making list options in a option of lists peowjiuhjnwpofnhwrpkgjnbwrfpkjwebnfpkejngerlf
                function makeListOptions(list, selectedValue) {
                    return Object.entries(list)
                        .map(([value, label]) =>
                            `<option value="${value}"${value == selectedValue ? " selected" : ""}>${label}</option>`
                        )
                        .join(" ");
                }


                // Get default config
                await demand(`${extensionLocation}/default_config.json`).then(async data => { def_ot_config = await data.json(); });

                // Get all langs
                let langOptionsJson = {};
                let langOptions = '';
                let langIndexFetch = await demand(`${extensionLocation}/lang/index.json`);
                if (langIndexFetch.ok) {
                    let langIndex = await langIndexFetch.json();
                    // For each language defined in the lang index file, get folder files
                    for (let i = 0; i < langIndex.index.length; i++) {
                        const lang = langIndex.index[i];
                        // Get lang folder
                        let langFolder = `${extensionLocation}/lang/${lang}`
                        let langFetch = await demand(`${langFolder}/index.json`)

                        // Make sure all the files required for each language are here
                        if (langFetch.ok) langOptionsJson[lang] = (await langFetch.json()).displayName;
                        else {
                            console.error(`OldTwitch Language Fetch Error: The language file(s) for \"${lang}\" couldn't be found. Fetch data: `, langFetch);
                            alert(`Error when getting the list of languages, please check the developer console. If you're not developing a language for OldTwitch, report this issue onto the GitHub please with the console log!`)
                        }
                    }

                    // Make options HTML
                    console.log(langOptionsJson);
                    langOptions = makeListOptions(langOptionsJson, userConfig.lang);
                    console.log(langOptions);
                } else alert('Extension language index file couldn\'t be demanded. Reload & try again, else report this on the GitHub!');


                // Make HTML for page
                let injectDiv = document.querySelector('.settings-options');
                async function addButton(args) {
                    let returnedNull;
                    switch (true) {
                        case !args.key:
                            returnedNull = 'key';
                            break;
                        case !args.type:
                            returnedNull = 'type';
                        break;
                        case !args.title:
                            returnedNull = 'title';
                        break;
                        case !args.desc:
                            returnedNull = 'desc';
                        break;
                    }
                    if (returnedNull) {
                        console.error(`"args.${returnedNull}" is required but returned null.`);
                        return '';
                    }
                    if (def_ot_config[args.key] == undefined) {
                        console.error(`unknown key`, args.key);
                        return '';
                    }

                    let htmlTxt;
                    switch (args.type) {
                        case 'select':
                            htmlTxt = `
                            <div class="settings-option settings-select" data-value="${userConfig[args.key]}" name="${args.key}">
                                <div class="settings-option-text">
                                    <div class="settings-option-title">${args.title}</div>
                                    <div class="settings-option-desc">${args.desc}</div>
                                </div>
                                <select class="settings-option-action settings-option-select menu-action">
                                    ${args.values}
                                </select>
                            </div>
                            `;
                        break;

                        case 'toggle':
                            htmlTxt = `
                            <div class="settings-option settings-toggle" data-value="${userConfig[args.key]}" name="${args.key}">
                                <div class="settings-option-text">
                                    <div class="settings-option-title">${args.title}</div>
                                    <div class="settings-option-desc">${args.desc}</div>
                                </div>
                                <button class="settings-option-action settings-option-toggle">
                                    <div class="light"></div>
                                </button>
                            </div>
                            `;
                        break;
                    }

                    return htmlTxt;
                }


                
                /// Yyear options
                const years = [2018, 2014];
                const yearOptions = makeListOptions(
                    Object.fromEntries(years.map(y => [y, y])),
                    userConfig.year
                );

                /// Light mode options
                const lightModes = {0: "Light", 1: "Dark"};
                const lightOptions = makeListOptions(lightModes, userConfig.forceWhichColorMode);


                // Make html
                // ${await addButton({ key: 'year', type: 'select', title: 'Select Year', desc: 'Select the year you\'d like to display.', values: yearOptions })}
                injectDiv.innerHTML = `
                    ${await addButton({ key: 'showReleaseNotes', type: 'toggle', title: 'Show Update Notes', desc: 'This option will show update notes when updated to a new version of OldTwitch.' })}
                    ${await addButton({ key: 'alertUpdates', type: 'toggle', title: 'Alert Me When Out-of-date', desc: 'Shows a banner at the top of the page to update OldTwitch. Not recommended unless not using a webstore version.' })}
                    ${await addButton({ key: 'lang', type: 'select', title: langStrings.settings.lang.title, desc: langStrings.settings.lang.desc, values: langOptions })}
                    ${await addButton({ key: 'year', type: 'select', title: langStrings.settings.year.title, desc: langStrings.settings.year.desc, values: yearOptions })}
                    ${await addButton({ key: 'forceColorMode', type: 'toggle', title: 'Force Light Mode', desc: 'OldTwitch will force the light mode that is set in the "Force Which Light Mode" option.' })}
                    ${await addButton({ key: 'forceWhichColorMode', type: 'select', title: 'Force Which Light Mode', desc: 'Will force either light or dark mode on all pages.', values: lightOptions })}
                `;


                // Make inputs work
                function setConfig(option, value) {
                    option.setAttribute('data-value', value);
                    console.log('Setting changes in config.', { option: option.getAttribute('name'), value: value })
                    // Send message to set userconfig
                    window.postMessage({
                        type: "ot-set-config",
                        config: userConfig
                    }, '*');
                }

                document.querySelectorAll('.settings-option').forEach(option => {
                    const optionAction = option.querySelector('.settings-option-action');
                    const key = option.getAttribute('name');

                    switch (true) {
                        case option.classList.contains('settings-toggle'):
                            optionAction.addEventListener('click', e => {
                                if (option.getAttribute('data-value') == 'true') userConfig[key] = false;
                                else userConfig[key] = true;
                                setConfig(option, userConfig[key]);
                            });
                        break;
                    
                        case option.classList.contains('settings-select'):
                            optionAction.querySelectorAll('option', selectOption => {
                                selectOption.addEventListener('click', e => {
                                    userConfig[key] = option.getAttribute('value');
                                    setConfig(option, userConfig[key]);
                                });
                            });
                            optionAction.addEventListener('change', e => {
                                userConfig[key] = e.target.value;
                                setConfig(option, userConfig[key]);
                            });
                        break;
                    }
                });

            }
        }, 10);
    });
}

doSettings();
