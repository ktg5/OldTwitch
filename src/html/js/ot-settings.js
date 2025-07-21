var def_ot_config;
extensionLocation = document.querySelector('body').getAttribute('oldttv');
  
function doSettings() {
    return new Promise((resolve, reject) => {
        let firstInit = setInterval(async () => {
            if (userConfig) {
                clearInterval(firstInit);


                await fetch(`${extensionLocation}/default_config.json`).then(async data => { def_ot_config = await data.json(); });

                let injectDiv = document.querySelector('.settings-options');
                // HTML maker
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


                /// Get year options for menu
                var years = [2018, 2014];
                var yearOptions = '';
                years.forEach(element => {
                    if (element == userConfig['year']) {
                        yearOptions += `<option value="${element}" selected>${element}</option> `
                    } else {
                        yearOptions += `<option value="${element}">${element}</option> `
                    }
                });
                /// Get light mode options for menu
                var lightModes = {0:"Light", 1:"Dark"};
                var lightOptions = '';
                for (const value in lightModes) {
                    if (Object.hasOwnProperty.call(lightModes, value)) {
                        const txt = lightModes[value];
                        
                        if (value == userConfig['forceWhichLightMode']) {
                            lightOptions += `<option value="${value}" selected>${txt}</option> `
                        } else {
                            lightOptions += `<option value="${value}">${txt}</option> `
                        }
                    }
                }
                console.log(lightOptions);


                // Make html
                // ${await addButton({ key: 'year', type: 'select', title: 'Select Year', desc: 'Select the year you\'d like to display.', values: yearOptions })}
                injectDiv.innerHTML = `
                    ${await addButton({ key: 'showReleaseNotes', type: 'toggle', title: 'Show Update Notes', desc: 'This option will show update notes when updated to a new version of OldTwitch.' })}
                    ${await addButton({ key: 'alertUpdates', type: 'toggle', title: 'Alert Me When Out-of-date', desc: 'Shows a banner at the top of the page to update OldTwitch. Not recommended unless not using a webstore version.' })}
                    ${await addButton({ key: 'forceLightMode', type: 'toggle', title: 'Force Light Mode', desc: 'OldTwitch will force the light mode that is set in the "Force Which Light Mode" option.' })}
                    ${await addButton({ key: 'forceWhichLightMode', type: 'select', title: 'Force Which Light Mode', desc: 'Will force either light or dark mode on all pages.', values: lightOptions })}
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
