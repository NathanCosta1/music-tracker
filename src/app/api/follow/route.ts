import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const { artist } = await request.json();
        const itunesId = artist.artistId.toString();
        const name = artist.artistName;
        const externalData = artist;

        // UPSERT
        const artistQuery = `
            INSERT INTO artists (itunes_id, name, external_data) 
            VALUES ($1, $2, $3)
            ON CONFLICT (itunes_id)
            DO UPDATE SET last_updated = NOW()
            RETURNING id;
        `;

        const artistResult = await pool.query(artistQuery, [itunesId, name, externalData]);
        const internalArtistId = artistResult.rows[0].id;

        const followQuery = `
            INSERT INTO follows (user_id, artist_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING;
        `;
        
        // ONCE I DO AUTH, UPDATE THE HARDCODED VALUE
        await pool.query(followQuery, [1, internalArtistId]);

        return NextResponse.json({ success: true, artistId: internalArtistId });

    } catch (error: unknown) {
        console.error("DB Error:", error);

        const message = error instanceof Error ? error.message : "An unknown error occured.";

        return NextResponse.json(
            { error: "Failed to follow artist", details: message }, 
            { status: 500 }   
        );

    }

}