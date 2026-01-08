// Default config
async function getDefaults() {
    return new Promise(async (resolve, reject) => {
        await fetch(runtime.getURL('default_config.json')).then(async rawData => {
            let data = await rawData.json();

            resolve(data);
        });
    });
}

// Get the user config
var userConfig;
async function getUserConfig(atend) {
    return new Promise(async (resolve, reject) => {
        async function reset() {
            userConfig = await getDefaults();
            storage.set({ OTConfig: userConfig });
            if (atend) atend();
        }

        storage.get(['OTConfig'], async (res) => {
            if (res) return reset();
            userConfig = res.OTConfig;
            if (userConfig) {
                // Check if the userConfig doesn't have any unknown values
                const defConfig = await getDefaults();
                for (const key in userConfig) {
                    if (defConfig[key] == undefined) {
                        reset();
                        // alert('Your user config was found to have unknown values. For security, it has been reset.');
                        return;
                    }
                }
                if (atend) atend();
            } else reset();
        });
    });
}
