/**
 * DATABASE TYPES (Matches the PostgreSQL tables)
 */
export interface Artist {
    id: number;
    itunes_id: string;
    name: string;
    external_data: JSON;
    last_updated: string;
}

export interface Release {
    id: number;           // Our Serial ID
    itunes_id: string;    // Apple's ID
    title: string;
    display_artist_name: string;
    artwork_url: string;
    release_date: string;
    type: string;
    explicitness: boolean;
    track_count: number;
    release_url: string;
}

/**
 * EXTERNAL API TYPES (Matches what the iTunes API returns)
 */
export interface ItunesArtist {
    wrapperType: 'artist';
    artistId: number;
    artistName: string;
    primaryGenreName: string;
    artistLinkUrl: string;
}

export interface ItunesCollection {
    wrapperType: 'collection';
    collectionType: string;
    artistId: number;
    collectionId: number;
    artistName: string;
    collectionName: string;
    collectionViewUrl: string;
    collectionExplicitness: string;
    artworkUrl100: string;
    trackCount: number;
    releaseDate: string;
}

export type ItunesResult = ItunesArtist | ItunesCollection;