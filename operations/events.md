# twitch hermes & pubsub event names & returned data

### `stream-down`
stream's down/ended
### `broadcast_settings_update`
stream title or game has been updated
```json
// The data returned from this is pretty bad, use `gql.getChannel()` or `getChannelSimple()` when getting this event
{
    "type": "broadcast_settings_update",
    "channel_id": "236362061",
    "channel": "ktg5_",
    "old_status": "lololololololol", // Stream title
    "status": "lololololololol",
    "old_game": "Bejeweled 3", // Twitch category display name
    "game": "Just Chatting",
    "old_game_id": 29708, // Twitch category ID (Might want to figure out how to get category data from ID & not slug)
    "game_id": 509658
}
```
### `viewcount`
stream viewer count update
```json
{
    "type": "viewcount",
    "server_time": 0, // Current time in UNIX
    "viewers": 9000,
    "collaboration_status": "none", // Shared chat stuff here & below
    "collaboration_viewers": 0,
    "costream_status": "",
    "costream_viewers": 0
}
```
### `updated_room`
shared chat updates pretty sure
### `commercial`
what do you think this is
### `pin-message`
channel mods have pinned a message to the chat
```json
{
    "type": "pin-message",
    "data": {
        "id": "", // Returns UUID
        "pinned_by": {
            "id": "", // User ID
            "display_name": ""
        },
        "message": {
            "id": "", // Returns same UUID as previous `id` string
            "sender": {
                "id": "", // UID
                "display_name": "",
                "badges": [
                    {
                        "id": "broadcaster",
                        "version": "1"
                    },
                    {
                        "id": "subscriber",
                        "version": "3048"
                    },
                    {
                        "id": "marathon-reveal-runner",
                        "version": "1"
                    }
                ],
                "chat_color": "" // User primary color
            },
            "content": {
                "text": "lol", // Actual message
                "fragments": [ // Unsure what this is tbh
                    {
                        "text": "lol"
                    }
                ]
            },
            "type": "MOD",
            "starts_at": 0, // UNIX timestamp
            "updated_at": 0, // Same as `starts_at`
            "ends_at": 1, // Different UNIX timestamp
            "sent_at": 0 // Same as `starts_at`
        }
    }
}
```
### `unpin-message`
```json
{
    "type": "unpin-message",
    "data": {
        "id": "", // Returns UUID
        "unpinned_by": {
            "id": "", // User ID
            "display_name": ""
        },
        "reason": "UNPIN"
    }
}
```
### `chat_rich_embed`
not the `/announce` command. but when a clip link is sent, a embed gets sent in chat
```json
{
    "type":"chat_rich_embed",
    "data":{
        "message_id":"", // UUID
        "request_url":"", // Clip link
        "author_name":"", // Clip author
        "thumbnail_url":"", // Clip thumbnail
        "title":"",
        "twitch_metadata":{
            "clip_metadata":{
                "game":"", // Category display name
                "channel_display_name":"", // User display name for where the clip is sourced
                "slug":"", // Clip slug
                "id":"", // Clip ID
                "broadcaster_id":"",
                "curator_id":"" // Clip author ID
            }
        }
    }
}
```
### `reward-redeemed`
viewer redeemed a reward on the channel
```json
{
    "type": "reward-redeemed",
    "data": {
        "timestamp": "", // Returns JS timecode
        "redemption": {
            "id": "", // Returns UUID
            "user": { // The user that redeemed the reward
                "id": "", // Yes, this is a string, not a number for some reason
                "login": "",
                "display_name": ""
            },
            "channel_id": "", // This & the other `channel_id` in the `reward` object return the same ID
            "redeemed_at": "", // Returns JS timecode
            "reward": {
                "id": "", // Returns UUID
                "channel_id": "",
                "title": "", // Reward name
                "prompt": "", // Reward description
                "cost": 0, // Channel point cost to redeem
                "is_user_input_required": false, // If the user needs to put a message with their redeem
                "is_sub_only": false,
                "image": { // If there isn't a custom image for the reward, this will return null
                    "url_1x": "", // URLs
                    "url_2x": "",
                    "url_4x": ""
                },
                "default_image": { // Does not return null ever
                    "url_1x": "", // URLs
                    "url_2x": "",
                    "url_4x": ""
                },
                "background_color": "", // Color for reward
                "is_enabled": true,
                "is_paused": false,
                "is_in_stock": true,
                "max_per_stream": {
                    "is_enabled": false,
                    "max_per_stream": 0
                },
                "should_redemptions_skip_request_queue": false,
                "template_id": null,
                "updated_for_indicator_at": "", // Returns JS timecode
                "max_per_user_per_stream": {
                    "is_enabled": false,
                    "max_per_user_per_stream": 0
                },
                "global_cooldown": {
                    "is_enabled": false,
                    "global_cooldown_seconds": 0
                },
                "redemptions_redeemed_current_stream": null,
                "cooldown_expires_at": null
            },
            "status": "UNFULFILLED",
            "cursor": ""
        }
    }
}
```
### `clips-leaderboard-update`
update to the clip views leaderboard
```json
{
    "type": "clips-leaderboard-update",
    "broadcaster_id": "", // User ID of where the clip is sourced
    "time_unit": "DAY", // Returns an enum either being "DAY", "WEEK" or "MONTH"
    "end_time": 0, // UNIX timestamp
    "new_leaderboard": [
        {
            "rank": 1, // User placement on leaderboard
            "curator_id": "", // Clip creator ID
            "curator_display_name": "",
            "curator_login": "",
            "clip_id": "",
            "clip_slug": "", // Used for getting clip info (aka `gql.getClip()`)
            "clip_asset_id": "", // UUID used for getting clip thumbnail
            "clip_title": "",
            "clip_thumbnail_url": "", // URL
            "clip_url": "", // URL
            "score": 69 // View count on clip
        }
        // ... More of the same object with the rank going up & score going down; max: 5
    ]
}
```
### `POLL_CREATE`
channel poll data
```json
{
    "type": "POLL_CREATE",
    "data": {
        "poll": {
            "poll_id": "", // UUID 
            "owned_by": "", // User ID of the channel where the poll is happening
            "created_by": "", // User ID of poll creator
            "title": "test", // Poll title
            "started_at": "", // JS timestamp
            "ended_at": "", // User ID; Returns null if not ended
            "ended_by": "", // User ID; Returns null if not ended
            "duration_seconds": 180, // How long the poll lasts in seconds
            "settings": {
                "multi_choice": {
                    "is_enabled": true
                },
                "bits_votes": { // If users can add votes by bits
                    "is_enabled": false,
                    "cost": 0
                },
                "channel_points_votes": { // If users can add votes by channel points
                    "is_enabled": true,
                    "cost": 500
                }
            },
            "status": "ACTIVE",
            "choices": [
                {
                    "choice_id": "", // UUID 
                    "title": "test1", // Choice name
                    "votes": {
                        "total": 0,
                        "bits": 0, // Additional votes
                        "channel_points": 0, // Additional votes
                        "base": 0 // Total count
                    },
                    "tokens": { // Total amount of bits &/or points used by viewers
                        "bits": 0,
                        "channel_points": 0
                    },
                    "total_voters": 0
                }
                // ... Returns more objects if more choices
            ],
            // *** For all choices
            "votes": {
                "total": 0,
                "bits": 0,
                "channel_points": 0,
                "base": 0
            },
            "tokens": {
                "bits": 0,
                "channel_points":0
            },
            "total_voters": 0,
            // *** End
            "remaining_duration_milliseconds": 0,
            "top_contributor": "", // User ID; Returns null if none
            "top_bits_contributor": "", // User ID; Returns null if none
            "top_channel_points_contributor": "" // User ID; Returns null if none
        }
    }
}
```
`POLL_UPDATE`, `POLL_COMPLETE`, `POLL_TERMINATE` & `POLL_ARCHIVE` return the same data as `POLL_CREATE`
### `event-created` & `event-updated`
for channel predictions
```json
{
    "type": "event-updated",
    "data":{
        "timestamp":"", // JS timestamp
        "event":{
            "id":"", // UUID
            "channel_id":"", // User ID of where the prediction is happening
            "created_at":"", // JS timestamp
            "created_by":{
                "type":"USER",
                "user_id":"",
                "user_display_name":"",
                "extension_client_id":null
            },
            "ended_at":"", // JS timestamp
            "ended_by":{
                "type":"USER",
                "user_id":"",
                "user_display_name":"",
                "extension_client_id":null
            },
            "locked_at":"", // JS timestamp
            "locked_by":{
                "type":"USER",
                "user_id":"",
                "user_display_name":"",
                "extension_client_id":null
            },
            "outcomes":[
                {
                    "id":"", // UUID
                    "color":"BLUE",
                    "title":"Sandbox",
                    "total_points":3257551,
                    "total_users":837,
                    "top_predictors":[
                        {
                            "id":"", // Returns a 64 character string
                            "event_id":"", // UUID 1
                            "outcome_id":"", // UUID 2
                            "channel_id":"", // User ID of where the event is happening
                            "points":250000, // Points spent
                            "predicted_at":"", // JS timestamp 1
                            "updated_at":"", // JS timestamp 2
                            "user_id":"", // Predictor user ID
                            "result":null,
                            "user_display_name":"" // Predictor display name
                        },
                    ],
                    "badge":{ // Chat badge that users will get from selecting this outcome
                        "version":"blue-1",
                        "set_id":"predictions"
                    }
                },
                // ... Will return at least two outcomes; max: 10
            ],
            "prediction_window_seconds":1800,
            "status":"RESOLVE_PENDING",
            "title":"", // Prediction name
            "winning_outcome_id":"" // UUID of the current winning outcome
        }
    }
}
```
### `slot-settings-changed`
could be used for multiple things, but is used for streaming together calls
```json
{
    "type": "slot-settings-changed",
    "data": {
        "session_id": "", // Returns a 27 character string. Will be the same ID as streaming together call ID
        "slot": {
            "id": "0", // Possibly for possition in call
            "audio": { // If call is using microphones
                "is_host_enabled": false,
                "is_guest_enabled": false,
                "is_available": false
            },
            "video": { // If call is using cameras
                "is_host_enabled": false,
                "is_guest_enabled": false,
                "is_available": false
            },
            "is_live": true, // Not for if the call creator is streaming, 'cuz this is true even when not live streaming
            "is_pinned": false,
            // *** User info
            "user_id": "",
            "login": "",
            "display_name": "",
            "profile_images": {
                "150x150": "", // Returns URL for all in this table
                "28x28": "",
                "300x300": "",
                "50x50": "",
                "600x600": "",
                "70x70": "",
                "96x96": ""
            },
            "primary_color_hex": "", // User's primary chat color without the `0x` or `#` at the start
            // *** Ends
            "participant_id": "", // Returns a 12 character ID
            "contributor_id": "", // Returns a 12 character ID
            "host_volume": null, // Returns null if streamer has call audio disabled or doesn't activate call audio by default
            "assigned_at": "", // Returns JS timecode
            "updated_at": "", // Returns JS timecode
            "status": "SLOT_LIVE"
        }
    }
}
```
### `call-started`
when a streaming together call has started
```json
{
    "type": "call-started",
    "data": {
        "session_id": "" // Returns a 27 character string
    }
}
```
### `call-ended`
```json
{
    "type": "call-started",
    "data": {
        "session_id": "", // Returns a 27 character string
        "reason": "manually_ended"
    }
}
```
### `session-started`, `session-created` & `session-ended` might be for streaming together/shared chat stuff but kinda forgot
### `goal_updated`
when a streamer's goal progress has changed (follows, subs)
### `raid_update_v2`
sends out every second when a raid is upcoming
```json
{
    "type": "raid_update_v2",
    "raid": {
        "id": "", // Returns UUID
        "creator_id": "0", // User ID for raid creator
        "source_id": "1", // User ID for raider
        "target_id": "2", // User ID for user to be raided
        "target_login": "",
        "target_display_name": "",
        "target_profile_image": "", // Returns URL that expires when the raid is completed or cancelled
        "transition_jitter_seconds": 0,
        "force_raid_now_seconds": 90,
        "viewer_count": 2
    }
}
```
`raid_cancel_v2` & `raid_go_v2` (when raid is raiding lol) return the same data as `raid_update_v2`
### `hype-train-approaching`
when a hype train is close to happening
```json
{
    "type":"hype-train-approaching",
    "data":{
        "channel_id":"", // User ID of where hype train is happening
        "goal":5,
        "events_remaining_durations":{
            "1":86
        },
        "level_one_rewards":[
            {
                "type":"EMOTE",
                "id":"emotesv2_[32_character_string]", // ID used for emote image--which can be used like `https://static-cdn.jtvnw.net/emoticons/v2/[emoteId]/default/light/1.0` (1.0 to 4.0)
                "group_id":"",
                "reward_level":0,
                "set_id":"", // Emote set UUID
                "token":"", // Emote name
                "reward_end_date":"0001-01-01T00:00:00Z" // JS timstamp (what is this timestamp tf)
            },
        ],
        "creator_color":"FFBF00", // Hex color (without `0x` or `#`) for the streamer that the hype train is happening on
        "participants":[ // A list of strings that have user IDs in them
            "191003780"
        ],
        "approaching_hype_train_id":"", // Raid UUID
        "is_golden_kappa_train":false,
        "expires_at":"", // JS timestamp
        "potential_rewards":[
            {
                "__typename":"HypeTrainPotentialReward",
                "id":"4:emotesv2_[32_character_string]",
                "level":4,
                "value":{
                    "__typename":"HypeTrainEmoteReward",
                    "id":"emotesv2_[32_character_string]",
                    "type":"EMOTE",
                    "emote":{
                        "__typename":"Emote",
                        "id":"emotesv2_[32_character_string]",
                        "token":"" // Emote name
                    }
                }
            },
        ],
        "is_treasure_train":false,
        "is_boost_train":false
    }
}
```
### `hype-train-start`
when a hype train has started
```json
// Too lazy to really go through all of this. You can probably figure it out yourself
{
    "type":"hype-train-start",
    "data":{
        "__typename":"HypeTrainExecution",
        "id":"", // Raid UUID
        "startedAt":"2025-08-31T21:14:28.203436091Z",
        "expiresAt":"2025-08-31T21:19:28.203436091Z",
        "updatedAt":"2025-08-31T21:14:28.203436091Z",
        "endedAt":null,
        "endReason":"IN_PROGRESS",
        "isGoldenKappaTrain":false,
        "progress":{
            "__typename":"HypeTrainProgress",
            "id":"", // Raid UUID
            "goal":3000,
            "progression":2500,
            "total":2500,
            "level":{
                "__typename":"HypeTrainLevel",
                "id":"71092938:HARD:1",
                "value":1,
                "goal":3000,
                "rewards":[
                    {
                        "__typename":"HypeTrainEmoteReward",
                        "id":"emotesv2_bbbf6d16d9964fcbba2d965a7eea942f",
                        "type":"EMOTE",
                        "emote":{
                            "__typename":"Emote",
                            "id":"emotesv2_bbbf6d16d9964fcbba2d965a7eea942f",
                            "token":"ConfettiHype"
                        }
                    },
                ]
            },
            "allTimeHighState":"NONE"
        },
        "conductors":[],
        "config":{
            "__typename":"HypeTrainConfig",
            "id":"71092938:[Raid-UUID]",
            "willUseCreatorColor":true,
            "primaryHexColor":"FFBF00",
            "conductorRewards":[ // Rewards for who has sent the most during the hype train
                {
                    "__typename":"HypeTrainConductorReward",
                    "source":"BITS", // Enum--can be "BITS", "SUBS" or "UNKNOWN"
                    "type":"CURRENT", // Enum--can be "CURRENT" or "FORMER'
                    "rewards":[
                        {
                            "__typename":"HypeTrainBadgeReward",
                            "id":"1",
                            "type":"BADGE",
                            "badge":{
                                "__typename":"Badge",
                                "id":"aHlwZS10cmFpbjsxOzcxMDkyOTM4",
                                "setID":"hype-train",
                                "imageURL":"https://static-cdn.jtvnw.net/badges/v1/fae4086c-3190-44d4-83c8-8ef0cbe1a515/2"
                            }
                        }
                    ]
                },
                {
                    "__typename":"HypeTrainConductorReward",
                    "source":"BITS",
                    "type":"FORMER",
                    "rewards":[
                        {
                            "__typename":"HypeTrainBadgeReward",
                            "id":"2",
                            "type":"BADGE",
                            "badge":{
                                "__typename":"Badge",
                                "id":"aHlwZS10cmFpbjsyOzcxMDkyOTM4",
                                "setID":"hype-train",
                                "imageURL":"https://static-cdn.jtvnw.net/badges/v1/9c8d038a-3a29-45ea-96d4-5031fb1a7a81/2"
                            }
                        }
                    ]
                }
                // ... Goes on more
            ],
            "participationConversionRates":[
                {
                    "__typename":"HypeTrainParticipationConversionRate",
                    "action":"UNKNOWN",
                    "source":"UNKNOWN",
                    "value":0
                },
                {
                    "__typename":"HypeTrainParticipationConversionRate",
                    "action":"CHEER",
                    "source":"BITS",
                    "value":1
                },
                {
                    "__typename":"HypeTrainParticipationConversionRate",
                    "action":"POLLS",
                    "source":"BITS",
                    "value":1
                },
                // *** Copied for Tier 2 & 3
                {
                    "__typename":"HypeTrainParticipationConversionRate",
                    "action":"TIER_1_GIFTED_SUB",
                    "source":"SUBS",
                    "value":500 // Goes 500, 1000, 2500
                },
                {
                    "__typename":"HypeTrainParticipationConversionRate",
                    "action":"TIER_1_SUB",
                    "source":"SUBS",
                    "value":500
                },
                // *** End
            ],
            "calloutEmote":{
                "__typename":"Emote",
                "id":"emotesv2_6f8b5741535344bf947ae6eea28c56c7",
                "token":"LilTrickster"
            },
            "difficulty":"HARD",
            "difficultySettings":[
                {
                    "__typename":"HypeTrainDifficultySettings",
                    "difficulty":"HARD",
                    "maxLevel":237
                }
            ],
            "potentialRewards":[
                {
                    "__typename":"HypeTrainPotentialReward",
                    "id":"1:emotesv2_bbbf6d16d9964fcbba2d965a7eea942f",
                    "level":1,
                    "value":{
                        "__typename":"HypeTrainEmoteReward",
                        "id":"emotesv2_bbbf6d16d9964fcbba2d965a7eea942f",
                        "type":"EMOTE",
                        "emote":{
                            "__typename":"Emote",
                            "id":"emotesv2_bbbf6d16d9964fcbba2d965a7eea942f",
                            "token":"ConfettiHype"
                        }
                    }
                },
                // ... A million more similar to object above
            ],
            "kickoff":{
                "__typename":"HypeTrainKickoffConfig",
                "minPoints":100
            }
        },
        "allTimeHigh":{
            "__typename":"HypeTrainCompleted",
            "goal":100000,
            "progression":79600,
            "total":558600,
            "level":{
                "__typename":"HypeTrainLevel",
                "id":"71092938:HARD:16",
                "value":16
            }
        },
        "isFastMode":false,
        "participations":[
            {
                "__typename":"HypeTrainParticipation",
                "source":"SUBS",
                "action":"TIER_1_SUB",
                "quantity":5
            }
        ],
        "sharedHypeTrainDetails":null,
        "isTreasureTrain":false
    }
}
```
### `hype-train-conductor-update`
when a user has sent bits or a sub to a channel with a hype train happening
```json
{
    "type":"hype-train-conductor-update",
    "data":{
        "id":"[Raid-UUID]-SUBS",
        "source":"SUBS",
        "user":{ // User info of subscriber
            "id":"",
            "login":"",
            "display_name":"",
            "profile_image_url":""
        },
        "participations":{
            "SUBS.TIER_1_SUB":1
        }
    }
}
```
### `hype-train-progression`
when a hype train's progress has changed
```json
{
    "type":"hype-train-progression",
    "data":{
        "id":"", // Raid UUID
        // *** User that sent subs or bits for hype train
        "user_id":"",
        "user_login":"",
        "user_display_name":"",
        "user_profile_image_url":"",
        // *** End
        "sequence_id":3500,
        "action":"TIER_1_SUB",
        "source":"SUBS",
        "quantity":1,
        "progress":{
            "level":{
                "value":2,
                "goal":7000,
                "rewards":[
                    {
                        "type":"EMOTE",
                        "id":"emotesv2_44b6eb2a20e44887bb8b158869671619",
                        "group_id":"",
                        "reward_level":0,
                        "set_id":"c999183a-25db-4819-aab4-622f20a29e76",
                        "token":"ImSpiraling",
                        "reward_end_date":"0001-01-01T00:00:00Z"
                    },
                    // ... More & more
                ]
            },
            "value":500,
            "goal":4000,
            "total":3500,
            "remaining_seconds":47,
            "all_time_high_state":"NONE"
        },
        "initiator_currency":null,
        "is_fast_mode":false,
        "expires_at":"2025-08-31T21:20:46.428445102Z",
        "sharedProgress":null,
        "is_large_event":false,
        "is_boost_train":false,
        "treasureTrainDetails":null
    }
}
```
### `hype-train-level-up`
hype train level has went up
### `sub-gifts-sent` & `mystery-gift-purchase`
gifted subs sent to streamer
### `bits-usage-by-channel-v1`
when bits get sent to streamer
### `slot-subscribers-deleted`, `slot-assignments-changed` & `slot-settings-changed`
might return same data but have not ran into this for a moment
