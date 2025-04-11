window.addEventListener('load', () => {
    console.log(`Hello from OldTwitch!!!`);


    // Add return to OldTwitch button
    let oldTwitchButton = document.createElement('button');
    oldTwitchButton.classList.add(`GOdqv`);
    oldTwitchButton.innerHTML = `Return to OldTwitch`;

    // Insert to page
    document.querySelector(`.Layout-sc-1xcs6mc-0.fNSfLT`).insertBefore(oldTwitchButton, document.querySelector(`.Layout-sc-1xcs6mc-0.fNSfLT`));

    // Button on click
    oldTwitchButton.addEventListener('click', () => {
        // Split the "nooldttv" from location.search
        let searchParams = new URLSearchParams(location.search);
        searchParams.delete('nooldttv');
        location.search = searchParams.toString();
    });
});