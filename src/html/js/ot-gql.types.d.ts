/**
 * Integ
 */
type Integ = {
    expiration: number
    request_id: string
    token: string
};

/**
 * Badge
 */
type Badge = {
    id: string
    clickAction: "VISIT_URL" | null
    clickURL: string | null
    image1x: string
    image2x: string
    image4x: string
    setID: string
    title: string
    version: string
    __typename: "Badge"
};

type ChatMessage = {
    /** Returns in a UUID-like string */
    "id": string,
    "__typename": "ChatMessage"
}

/**
 * Sent Message
 */
type ChatMessagePayload = {
    /** unknown what this returns atm */
    "dropReason": any,
    "message": ChatMessage,
    "__typename": "SendChatMessagePayload"
}

/**
 * Home Page
 */
type HomePage = {
    "featuredStreams": StreamEdge[],
    "shelves": {
        "TopLiveChannelsYouMayLikeLoggedOut": StreamEdge[],
        "TopGamesForYou": GameEdge[],
        "just-chatting-irl-streams": StreamEdge[]
    }
}

/**
 * Side Nav Data
 */
type SideNavCategory = {
    id: string,
    items: Array<GameEdge> | Array<StreamEdge>,
    title: ShelfTitle
}

/**
 * Searchbar Return Data
 */
type SearchSuggestion = {
    text: string,
    /** Returns a UUID like string */
    id: string,
    content: SearchSuggestionChannel | null,
    matchingCharacters: {
        "start": number,
        "end": number,
        "__typename": "SearchSuggestionHighlight"
    },
    __typename: "SearchSuggestion"
}

/**
 * Search Suggestion - Channel
 */
type SearchSuggestionChannel = {
    id: string,
    isLive: boolean,
    isVerified: boolean,
    login: string,
    profileImageURL: string,
    user: User,
    __typename: SearchSuggestionChannel
}

/**
 * Used for `gql.getSearchData`
 */
type SearchData = {
    banners: any,
    channels: User[],
    channelsWithTag: User[],
    games: GameEdge[],
    relatedLiveChannels: User[],
    videos: VideoEdge[]
}

/**
 * 
 */
type ShelfTitle = {
    "fallbackLocalizedTitle": string,
    "key": string,
    "localizedTitleTokens": Array<{
        "node": {
            "text": string,
            "__typename": "TextToken"
        },
        "__typename": "TitleTokenEdge"
    }>,
    "__typename": "ShelfTitle"
}

/**
 * Costream Stuff
 */
type CostreamData = {
    "costreamersCount": number,
    "organizer": User,
    "role": "ORGANIZER" | null,
    "topCostreamers": StreamEdge[],
    "totalViewersCount": number,
    "__typename": "CostreamDetails"
}

/**
 * Game information
 */
type GameEdge = {
    boxArtURL: string;
    id: string;
    slug: string;
    displayName: string;
    name: string;
    viewersCount?: number | null,
    gameTags?: EdgeTag[],
    originalReleaseDate?: string | null,
    coverURL?: string | null,
    clips?: ClipEdge[],
    description?: string,
    followersCount?: number,
    igdbURL?: string,
    prestoID?: any,
    streams?: StreamEdge[],
    tags?: EdgeTag[],
    videos?: VideoEdge[],
    __typename: "Game";
};

/**
 * Broadcast ID represented as a string
 */
type BroadcastIdOnly = {
    id: string;
    __typename: "BroadcastIdOnly";
};

/**
 * Twitch user roles (which this seems like it's barely used)
 */
type UserRoles = {
    isPartner: boolean,
    __typename: "UserRoles"
}

/**
 * Broadcast Settings
 */
type BroadcastSettings = {
    id: string,
    title: string,
    __typename: "BroadcastSettings"
}

/**
 * User information
 */
type User = {
    id: string;
    login?: string;
    displayName?: string;
    profileImageURL?: string;
    primaryColorHex?: string;
    roles?: UserRoles;
    broadcastSettings?: BroadcastSettings,
    profileURL?: string,
    stream?: StreamEdge,
    live?: boolean,
    __typename: "User";
};

/**
 * Channel Emotes
 */
type ChannelEmote = {
    "id": string
    "setid": string,
    "name": string,
    "imageURL": string,
    "assetType": "ANIMATED" | "STATIC",
    "__typename": "Emote"
}

/**
 * ?
 */
type VideoSelfEdge = {
    "isRestricted": boolean,
    /** unsure what this exactly can return atm */
    "viewingHistory": null,
    "__typename": "VideoSelfEdge"
}

/**
 * VOD Comment
 */
type VideoComment = {
    /** Returns in a UUID-like string */
    "id": string,
    "commenter": User,
    "contentOffsetSeconds": 27,
    /** Formated as YYYY-MM-DDTHH:SS:??? */
    "createdAt": string,
    "message": {
        "fragments": {
            "emote": any,
            "text": string,
            "__typename": "VideoCommentMessageFragment"
        }[],
        "userBadges": Badge[],
        /** Returns in HEX */
        "userColor": string,
        "__typename": "VideoCommentMessage"
    },
    "__typename": "VideoComment"
}

/**
 * Shared chat users
 */
type GuestStarParticipants = {
    "guests": User[],
    "sessionIdentifier": string,
    "__typename": "GuestStarParticipants"
}

/**
 * Edge/Stream Tags
 */
type EdgeTag = {
    id: string;
    name: string;
    __typename: 'FreeformTag';
}

/**
 * Stream Edge
 */
type StreamEdge = {
    id: string;
    type?: string;
    viewersCount?: number,
    previewImageURL?: string,
    verticalPreviewImageURL?: string,
    width?: number,
    height?: number,
    isDualFormat?: boolean,
    curatedTags?: EdgeTag[] | null,
    freeformTags?: EdgeTag[] | null,
    broadcaster?: User;
    game?: GameEdge | null,
    /** Formated as YYYY-MM-DDTHH:SS:??? */
    createdAt?: string,
    /** unsure what this is atm */
    contentClassificationLabels?: Array<any>,
    costreamDetails?: CostreamData | null,
    isEncrypted?: boolean,
    __typename: "Stream"
}

/**
 * Video Edge
 */
type VideoEdge = {
    animatedPreviewURL?: string;
    game: GameEdge | null;
    broadcastIdentifier?: BroadcastIdOnly,
    id: string;
    "lengthSeconds": number,
    "owner": User
    "previewThumbnailURL": string,
    /** Replace `{width}` & `{height}` with whatever pixels you want */
    templatePreviewThumbnailURL?: string,
    /** Formated as YYYY-MM-DDTHH:SS:??? */
    "publishedAt"?: string,
    /** Formated as YYYY-MM-DDTHH:SS:??? */
    createdAt?: string,
    "self"?: VideoSelfEdge,
    "title": string,
    "viewCount": number,
    "resourceRestriction"?: any,
    "contentTags"?: EdgeTag[],
    __typename: 'Video';
}

/**
 * Clip Edge
 */
type ClipEdge = {
    id: string;
    slug: string;
    url: string;
    embedURL: string;
    title: string;
    viewCount: number;
    language: string;
    curator: User;
    game: GameEdge | null;
    broadcastIdentifier: BroadcastIdOnly;
    broadcaster: User;
    thumbnailURL: string;
    /** Formated as YYYY-MM-DDTHH:SS:??? */
    createdAt: string;
    durationSeconds: number,
    "champBadge": null,
    "isFeatured": true,
    "isAutoCurated": false,
    "guestStarParticipants": GuestStarParticipants,
    __typename: 'Clip';
}
