import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
    try {
        const feedQuery = `
            SELECT DISTINCT R.*
            FROM users U, releases R, follows F, artist_releases AR
            WHERE U.id = $1
                AND F.artist_id = AR.artist_id
                AND AR.release_id = R.id
            ORDER BY release_date DESC
            LIMIT 50;
        `;
        
        // TEMP: ONCE I DO AUTH, UPDATE THE HARDCODED VALUE
        const { rows } = await pool.query(feedQuery, [1])

        return NextResponse.json({ success: true, feed: rows});

    } catch (error: unknown) {
        console.error("Error:", error);

        const message = error instanceof Error ? error.message : "An unknown error occured.";

        return NextResponse.json(
            { error: "Failed to retrieve releases", details: message }, 
            { status: 500 }   
        );

    }

}