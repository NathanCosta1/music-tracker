import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = user.id; 

        const tagParam = request.nextUrl.searchParams.get('tag');
        const scopeParam = request.nextUrl.searchParams.get('scope');

        if (scopeParam && scopeParam !== 'artist' && scopeParam !== 'release') {
            return NextResponse.json(
                { error: "Invalid scope parameter. Must be 'artist' or 'release'." }, 
                { status: 400 }
            );
        }

        let rows;
        if (tagParam && scopeParam === "artist") {
            const feedQuery = `
                SELECT DISTINCT R.*
                FROM users U, releases R, follows F, artist_releases AR, artist_tags AT, tags T
                WHERE U.id = $1                      -- Filter for current user
                    AND F.user_id = U.id             -- Join follows & users
                    AND F.artist_id = AR.artist_id   -- Join artist_releases & follows (artist_id from followed artist)
                    AND AR.release_id = R.id         -- Join releases & artist_releases
                    AND F.artist_id = AT.artist_id   -- Join artist_tags to the followed artist
                    AND AT.tag_id = T.id             -- Join artist_tags & tags
                    AND T.name ILIKE $2              -- Filter tags by name
                    AND T.scope = 'artist'           -- Filter tags by scope
                    AND T.user_id = U.id             -- Filter tags by user
                ORDER BY R.release_date DESC
                LIMIT 200;
            `;
            ({ rows } = await pool.query(feedQuery, [
                userId, 
                tagParam
            ]));

        } else if (tagParam && scopeParam === "release"){
            const feedQuery = `
                SELECT DISTINCT R.*
                FROM users U, releases R, follows F, artist_releases AR, release_tags RT, tags T
                WHERE U.id = $1                      -- Filter for current user
                    AND F.user_id = U.id             -- Join follows & users
                    AND F.artist_id = AR.artist_id   -- Join artist_releases & follows
                    AND AR.release_id = R.id         -- Join releases & artist_releases
                    AND R.id = RT.release_id         -- Join release_tags to the specific release
                    AND RT.tag_id = T.id             -- Join release_tags & tags
                    AND T.name ILIKE $2              -- Filter tags by name
                    AND T.scope = 'release'          -- Filter tags by scope
                    AND T.user_id = U.id             -- Filter tags by user
                ORDER BY R.release_date DESC
                LIMIT 200;
            `;
            ({ rows } = await pool.query(feedQuery, [
                userId, 
                tagParam
            ]));

        } else {
            const feedQuery = `
                SELECT DISTINCT R.*
                FROM users U, releases R, follows F, artist_releases AR
                WHERE U.id = $1
                    AND F.user_id = U.id
                    AND F.artist_id = AR.artist_id
                    AND AR.release_id = R.id
                ORDER BY R.release_date DESC
                LIMIT 200;
            `;          
            ({ rows } = await pool.query(feedQuery, [userId]));
        }

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