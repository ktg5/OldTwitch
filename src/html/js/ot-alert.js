/// <reference path="ot-webmain.js" />
/// <reference path="ot-settings.js" />


// types
/**
 * @typedef AlertData
 * @prop {string} title Title of alert
 * @prop {string} desc Description of alert
 * @prop {string} img Link to image
 * @prop {string} [imgbg] A background image.
 *      Should be used if either you want a background color for the `img` var,
 *      or just want the `img` to take up the whole screen
 * @prop {AlertAction[]} [actions] A list of actions
 */

/**
 * @typedef AlertAction
 * @prop {string} key
 * @prop {string} text
 * @prop {(e: PointerEvent) => any} callback
 */


// global functions
/**
 * default function for making actions for either a `Alert` or `BannerAlert` class
 * @param {Alert | BannerAlert} alert 
 * @param {AlertAction[]} [actions]
 */
function makeAlertActions(alert, actions) {
    const div = alert.getDiv();
    const actionsDiv = div.querySelector('.actions');
    let skipDef = false;

    if (
        actions
        && Array.isArray(actions)
    ) {
        for (const action of actions) {
            action.key = action.key.toLowerCase();
            if (action.key === 'close') skipDef = true;

            actionsDiv.insertAdjacentHTML('beforeend', `
<div class="tw-mg-l-1">
    <button class="tw-button" data-a-target="oldttv-alert-${action.key}-button">
        <span class="tw-button__text" data-a-target="tw-button-text">${action.text}</span>
    </button>
</div>
            `);

            const actionDiv = actionsDiv.querySelector(`[data-a-target="oldttv-alert-${action.key}-button"]`);
            // debug:
            // console.log(action.key, actionDiv);
            actionDiv.addEventListener('click', (e) => {
                action.callback(e);
                alert.kill();
            });
        }
    }
    // Make default action
    if (!skipDef) {
        actionsDiv.insertAdjacentHTML('beforeend', `
<div class="tw-mg-l-1">
    <button class="tw-button" data-a-target="oldttv-banneralert-close-button">
        <span class="tw-button__text" data-lang-target="close-btn" data-a-target="tw-button-text"></span>
    </button>
</div>
        `);
        actionsDiv.querySelector('[data-a-target="oldttv-banneralert-close-button"]').addEventListener('click', () => {
            alert.kill();
        });
    }
}


// actual alert making things xdd
class Alert {
    #div = document.createElement('div');


    /**
     * Make a full screen notification in the center of the screen
     * @param {AlertData} data A object with data this class takes in. Make sure to include a `title` & `desc` value
     */
    constructor(data) {
        // Checks
        if (
            !data.title
            || !data.desc
        ) return new Error(`ot-alert.Alert: either "title" or "desc" variables are either not defined. these variables are required`);


        // Make div
        this.#div.classList.add('oldttv-alert-container');
        this.#div.innerHTML = `
<div class="oldttv-alert">
    <div class="side-0" ${data.color ? `style="background: ${String(data.imgbg)}"` : ""}>
        <div class="img">
            <img src="${String(data.img)}">
        </div>
    </div>
    <div class="side-1">
        <div class="content">
            <h2>${String(data.title)}</h2>
            <p>${marked.parse(String(data.desc))}</p>
        </div>
        <div class="actions"></div>
    </div>
</div>
        `;

        // Add action elements if actions
        makeAlertActions(this, data.actions ? data.actions : null);


        // Append
        document.querySelector('body').insertAdjacentElement('afterbegin', this.#div);
    }

    /**
     * @returns {HTMLDivElement}
     */
    getDiv() {
        return this.#div;
    }

    kill() {
        return this.#div.remove();
    }
}


class BannerAlert {
    #div = document.createElement('div');


    /**
     * Make a notification on the top of the page
     * @param {string} text The title/text of the notification
     * @param {AlertAction[]} actions A list of actions
     */
    constructor(text, actions) {
        if (typeof text !== 'string') return new Error(`ot-alert.BannerAlert: the param, "text" is not a string`);


        // Make element
        this.#div.classList.add('oldttv-banneralert');
        this.#div.innerHTML = `
<div class="oldttv-banneralert">
    <div class="content">${text}</div>
    <div class="actions"></div>
</div>
        `;

        // Add action elements if actions
        makeAlertActions(this, actions);

        // Append
        document.querySelector('body').insertAdjacentElement('afterbegin', this.#div);
    }

    /**
     * @returns {HTMLDivElement}
     */
    getDiv() {
        return this.#div;
    }

    kill() {
        return this.#div.remove();
    }
}
