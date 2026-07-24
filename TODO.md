- [x] add the whole 2018 twitch site.
    - [x] 2018: https://web.archive.org/web/20180223002421mp_/https://www.twitch.tv/, https://web.archive.org/web/20180223010527/https://www.twitch.tv/xqcow & https://youtu.be/DdQM-YauwJk?t=90s
    - [x] 2014/15: https://web.archive.org/web/20140430170345_/http://www.twitch.tv/, https://web.archive.org/web/20130930055945/http://www.twitch.tv/imaqtpie, https://static-www.adweek.com/wp-content/uploads/files/blogs/twitch-hed-2014_0.jpg
- [ ] remove/replace unused css within `2018/css/main.css`. (might just remove the unused ones tbh)

- [x] make the extension replace the select pages with custom ones.
    - [x] make the page replacer better, aka no need to fully replace or refresh the current page. (completed note: maybe don't need this for all pages, but did add this for channel tabs)

- [x] update noticer when user updates to a newer version of the extension
    - [ ] show different update notices for dev builds?

- [x] multi-language support
    - [x] get the basis down
    - [x] make documentation
    - [x] make a pirate talk language as a "sample" language lmao

- [x] get an api key or something to get the user's stats, such as following, recommends, etc. and also use for streamer stats.
- [x] ~~figure out how to get PubSub to worky~~
- [x] figure out how to get Hermes WS to worky

- [x] finish home page.

- [x] get channel list working.
    - [x] ~~channel list show all button.~~
    - [x] figure out why the following list in the channel list doesn't fetch sometimes.
    - [x] channel list show more & less buttons.

- [x] stream page.
    - [ ] optional: make custom stream player using hls.js or some shit.
    - [ ] figure out why channel points can't be redeemed over time while watching a stream.
    - [x] show list of streamer's vods & clips via a little category page added within the watch page.
    - [x] make the stupid svgs for the stuff on the stream info thingy idk what to call it lmao.
    - [x] sort bar working for this page.
        - [x] find clips by one day to all time & find videos, highlights, & archives
        - [ ] (possible addition) allow user to set amount of edges (vods/clips/etc.) to get back.
    - [ ] follow & unfollow. (might be impossible cuz of the `client-integrity` value)

- [x] discovery page.
    - [x] game pages.
        - [x] sort bar working for this page.
    - [x] the "all" discovery page found via home page or the "Browse" button.
    - [x] sort bar working for this page.

- [x] vods & clips. (base page, not like viewing a list of em on a channel)
    - [x] make clips.twitch.tv/[clip] go to OldTwitch clips page 
    - [ ] download page? (maybe for clips, not sure about vods)

- [x] subscribe button for those with sub page.
- [x] share button.
- [x] sidebar minimize buttons.

- [x] detect if a user is logged in
    - [x] make custom balloon with list of buttons that would appear when clicking

- [x] search page &/or bar.

- [x] settings page.

- [x] get 7tv to somehow inject into a embeds. (just use the ffz extension & install the 7tv plugin, works like a charm)
- [x] make scripts & css for embedded video & chat. (video & live stream css is up, chat - not yet - have to make)

