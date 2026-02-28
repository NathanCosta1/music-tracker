interface ItunesArtist {
    artistId: number;
    artistName: string;
    primaryGenreName: string;
    artistLinkUrl: string;
} export type { ItunesArtist };

interface Release {
    id: number;
    title: string;
    display_artist_name: string;
    artwork_url: string;
    release_date: string;
    type: string;
    explicitness: boolean;
    track_count: number;
    release_url: string;
} export type { Release };
