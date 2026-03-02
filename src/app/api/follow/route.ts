import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ItunesResult, ItunesCollection } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// API calls everything "Album" so rough estimate of type based on track number (sadly lose granularity w/ EP designation)
function determineType(title: string, trackCount: number): string {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('- ep')) return 'ep';
    if (lowerTitle.includes('- single')) return 'single';
    return trackCount <= 3 ? 'single' : 'album';
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            redirect('/login');
        }

        const userId = user.id; 
        const { artist } = await request.json();
        const artistItunesId = artist.artistId.toString();
        const name = artist.artistName;
        const externalData = artist;

        // Step 1: Follow artist
        const artistQuery = `
            INSERT INTO artists (itunes_id, name, external_data) 
            VALUES ($1, $2, $3)
            ON CONFLICT (itunes_id)
            DO UPDATE SET last_updated = NOW()
            RETURNING id;
        `;

        const artistQueryResult = await pool.query(artistQuery, [
            artistItunesId, 
            name, 
            externalData
        ]);
        const internalArtistId = artistQueryResult.rows[0].id;

        const followQuery = `
            INSERT INTO follows (user_id, artist_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, artist_id) DO NOTHING;
        `;
        
        await pool.query(followQuery, [userId, internalArtistId]);

        // Step 2: Insert artist's releases into DB
        const releases_url = `https://itunes.apple.com/lookup?id=${artistItunesId}&entity=album`;

        const response = await fetch(releases_url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }

        const releaseData = await response.json();

        // API returns artist as first object even when searching for albums. Filter this out
        const artistReleases = releaseData.results.filter((item: ItunesResult): item is ItunesCollection => {
            return item.wrapperType === 'collection';
        });        
        console.log("Releases:", artistReleases);

        // Loop through each release to perform steps 2 & 3
        for (const release of artistReleases){
            const releaseItunesId = release.collectionId.toString();
            const title = release.collectionName.toString();
            const trackCount = release.trackCount
            const type = determineType(title, release.trackCount);
            const explicitness = release.collectionExplicitness === 'explicit';
            const releaseDate = new Date(release.releaseDate);
            const displayArtistName = release.artistName.toString();
            const artworkUrl = release.artworkUrl100;
            const releaseLink = release.collectionViewUrl;
            const externalData = JSON.stringify(release);
            
            const releaseQuery = `
                INSERT INTO releases (itunes_id, title, track_count, type, explicitness, release_date, display_artist_name, artwork_url, release_url, external_data)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (itunes_id) 
                DO UPDATE SET last_updated = NOW()
                RETURNING id;
            `;

            const releaseQueryResult = await pool.query(releaseQuery, [
                releaseItunesId,
                title,
                trackCount,
                type,
                explicitness,
                releaseDate,
                displayArtistName,
                artworkUrl,
                releaseLink,
                externalData
            ]);
            const internalReleaseId = releaseQueryResult.rows[0].id;

            // Step 3: Insert artist releationship to their releases into DB (needs seperate table to handle collab projects)
            const artistReleasesQuery = `
                INSERT INTO artist_releases (artist_id, release_id)
                VALUES ($1, $2)
                ON CONFLICT (artist_id, release_id) DO NOTHING
            `;
            
            await pool.query(artistReleasesQuery, [internalArtistId, internalReleaseId]);
        }

        return NextResponse.json({ success: true, artistId: internalArtistId });

    } catch (error: unknown) {
        console.error("Error:", error);

        const message = error instanceof Error ? error.message : "An unknown error occured.";

        return NextResponse.json(
            { error: "Failed to follow artist", details: message }, 
            { status: 500 }   
        );

    }

}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { artist } = await request.json();
        const artistItunesId = artist.artistId.toString();

        const userId = user.id; 
        const unfollowQuery = `
            DELETE FROM follows 
            WHERE user_id = $1 
                AND artist_id = (SELECT id FROM artists WHERE itunes_id = $2);
        `;
        
        const { rows } = await pool.query(unfollowQuery, [userId, artistItunesId])

        return NextResponse.json({ success: true, feed: rows});

    } catch (error: unknown) {
        console.error("Error:", error);

        const message = error instanceof Error ? error.message : "An unknown error occured.";

        return NextResponse.json(
            { error: "Failed to delete artist", details: message }, 
            { status: 500 }   
        );

    }
}