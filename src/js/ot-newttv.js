window.addEventListener('load', () => {
    console.log(`Hello from OldTwitch!!!`);


    // Add return to OldTwitch button
    let oldTwitchButton = document.createElement('button');
    oldTwitchButton.classList.add('Layout-sc-1xcs6mc-0', 'eaYOCu');
    oldTwitchButton.innerHTML = `
    <div class="Layout-sc-1xcs6mc-0">
        <button class="ScCoreButton-sc-ocjdkq-0 kEIAKL">
            <div class="ScCoreButtonLabel-sc-s7h2b7-0 fLCDTs">
                <div data-a-target="tw-core-button-label-text" class="Layout-sc-1xcs6mc-0 JckMc">Return to OldTwitch</div>
            </div>
        </button>
    </div>
    `;

    // Insert to page
    document.querySelector(`.Layout-sc-1xcs6mc-0.bZYcrx`).insertBefore(oldTwitchButton, document.querySelector(`.Layout-sc-1xcs6mc-0.fNSfLT`));

    // Button on click
    oldTwitchButton.querySelector('button').addEventListener('click', () => {
        // Split the "nooldttv" from location.search
        let searchParams = new URLSearchParams(location.search);
        searchParams.delete('nooldttv');
        location.search = searchParams.toString();
    });


    // Check for search params
    if (location.search.includes('editclip')) {
        const editButtonInt = setInterval(() => {
            var editButton = document.querySelector('.reedit-clip-button button');
            if (editButton) {
                editButton.click();
                if (document.querySelector('#clip-editor-modal')) clearInterval(editButtonInt);
            }
        }, 200);
    }
});