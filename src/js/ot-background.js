if (navigator.userAgent.includes("Chrome")) browser = chrome;
var storage = browser.storage.sync;
var extension = browser.extension;
var runtime = browser.runtime;


// Open OldTwitch settings page on extension button click
browser.action.onClicked.addListener(() => {
	browser.tabs.create({
		url: "https://twitch.tv/oldtwitch"
	});
});


// Extension socket listener
runtime.onMessage.addListener((msg, sender, sendResponse) => {
	switch (msg.type) {
		case `fetch`:
			fetch(msg.url, msg.options || {})
			.then(async res => {
				const contentType = res.headers.get("content-type");
				let body;

				// Set body depending on contentType
				if (contentType && contentType.includes("application/json")) body = await res.json();
				else body = await res.text();

				// Check if response was okay
				var isOk = true;
				if (res.status > 299 || res.status < 200) isOk = false;

				// Send back data
				const resultData = {
					ok: isOk,
					contentType,
					status: res.status,
					body
				}
				console.log('data being sent back to client: ', resultData);
				sendResponse(resultData);
			})
			.catch(err => {
				// Send back error data
				const resultData = {
					ok: false,
					error: err.message
				}
				console.error('error', resultData);
				sendResponse(resultData);
			});
		return true;
	}
});
