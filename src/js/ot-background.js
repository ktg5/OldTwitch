if (navigator.userAgent.includes("Chrome")) browser = chrome;
var storage = browser.storage.sync;
var extension = browser.extension;
var runtime = browser.runtime;


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

				// Send back data
				const resultData = {
					ok: true,
					status: res.status,
					body
				}
				console.log('ok', resultData);
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
