import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = user.id; 
        const feedQuery = `
            SELECT DISTINCT R.*
            FROM users U, releases R, follows F, artist_releases AR
            WHERE U.id = $1
                AND F.artist_id = AR.artist_id
                AND AR.release_id = R.id
            ORDER BY release_date DESC
            LIMIT 50;
        `;
        
        const { rows } = await pool.query(feedQuery, [userId])

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