var browser: any;
if (navigator.userAgent.includes("Chrome")) browser = chrome; else browser;
var storage = browser.storage.sync;
var extension = browser.extension;
var runtime = browser.runtime;

// On extension update
runtime.onInstalled.addListener((reason: { previousVersion: any; reason: any; }) => {
	storage.get(['OTConfig'], function(result: { OTConfig: any; }) {
		var userConfig = result.OTConfig;
		// Check to see if user would like to get release notes
		if (userConfig.showReleaseNotes !== false) {
			// Check if previous version is not equal to current version
			if (reason.previousVersion !== runtime.getManifest().version) {
				// Make sure that only these specific reasons can create tabs
				switch (reason.reason) {
					case 'install':
						browser.tabs.create({
							url: `./html/${reason.reason}.html`
						});
					break;

					case 'update':
						browser.tabs.create({
							url: `./html/${reason.reason}.html`
						});
					break;
				}
			}
		}
	});
});