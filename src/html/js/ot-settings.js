var def_ot_config;
window.addEventListener("load", async () => {
    
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
        if (returnedNull) return console.error(`"args.${returnedNull}" is required but returned null.`);

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

    
    // Make html
    injectDiv.innerHTML = `
        ${await addButton({key: 'showReleaseNotes', type: 'toggle', title: 'Show Release Notes', desc: 'When enabled, this option will show release notes when updated to a new release.'})}
        ${await addButton({key: 'year', type: 'select', title: 'Select Year', desc: 'Select the year you\'d like to display.', values: yearOptions})}
    `;

    
    fetch(`${extensionLocation}/default_config.json`).then(async data => { def_ot_config = await data.json(); });

});