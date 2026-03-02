import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = user.id; 
        
        const body = await request.json();
        const tagName = body.tagName.toString();
        const itunesId = body.iTunesId.toString(); 
        const scope = body.scope.toString();

        const insertTagQuery = `
            INSERT INTO tags (user_id, scope, name) 
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, scope, name)
            DO UPDATE SET name = EXCLUDED.name
            RETURNING id;
        `;

        const insertTagQueryResult = await client.query(insertTagQuery, [
            userId, 
            scope,
            tagName
        ]);

        const internalTagId = insertTagQueryResult.rows[0].id;

        if (scope === 'artist') {
            const insertArtistTagQuery = `
                INSERT INTO artist_tags (tag_id, artist_id) 
                SELECT $1, id FROM artists WHERE itunes_id = $2
                ON CONFLICT (tag_id, artist_id) DO NOTHING
            `;

            await client.query(insertArtistTagQuery, [internalTagId, itunesId]);

        } else {
            const insertReleaseTagQuery = `
                INSERT INTO release_tags (tag_id, release_id) 
                SELECT $1, id FROM releases WHERE itunes_id = $2
                ON CONFLICT (tag_id, release_id) DO NOTHING
            `;

            await client.query(insertReleaseTagQuery,[internalTagId, itunesId]);
        }
        
        await client.query('COMMIT');
        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        await client.query('ROLLBACK');
        
        console.error("Error:", error);
        const message = error instanceof Error ? error.message : "An unknown error occured.";

        return NextResponse.json(
            { error: "Failed to add tag", details: message }, 
            { status: 500 }   
        );

    } finally {
        client.release();
    }
}

export async function GET(request: NextRequest) { 
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = user.id; 
        
        const scopeParam = request.nextUrl.searchParams.get('scope');

        let tagsQuery = `
            SELECT id, name, scope
            FROM tags
            WHERE user_id = $1
        `;
        const queryParams = [userId];

        if (scopeParam === 'artist' || scopeParam === 'release') { 
            tagsQuery += ` AND scope = $2`;
            queryParams.push(scopeParam);
        } else if (scopeParam) {
            return NextResponse.json(
                { error: "Invalid scope parameter. Must be 'artist' or 'release'." }, 
                { status: 400 }
            );
        }
        tagsQuery += ` ORDER BY name ASC`;
        const { rows } = await pool.query(tagsQuery, queryParams);

        return NextResponse.json({ success: true, tags: rows});

    } catch (error: unknown) {
        console.error("Error retrieving tags:", error); 

        const message = error instanceof Error ? error.message : "An unknown error occurred.";

        return NextResponse.json(
            { error: "Failed to retrieve tags", details: message }, 
            { status: 500 }   
        );

    }
}

export async function DELETE(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id; 
    const tagName = request.nextUrl.searchParams.get('tagName');
    const itunesId = request.nextUrl.searchParams.get('itunesId');
    const scope = request.nextUrl.searchParams.get('scope');

    if (!tagName || !itunesId || !scope) {
        return NextResponse.json({ error: "Missing required fields: tagName, iTunesId, or scope." }, { status: 400 });
    }
    if (scope !== 'artist' && scope !== 'release') {
        return NextResponse.json({ error: "Invalid scope. Must be 'artist' or 'release'." }, { status: 400 });
    }

    try {        
        if (scope === 'artist') {
            const unTagQuery = `
                DELETE from artist_tags 
                WHERE artist_id = (SELECT id FROM artists WHERE itunes_id = $1)
                    AND tag_id = (
                      SELECT id FROM tags 
                      WHERE user_id = $2 
                        AND scope = $3 
                        AND name = $4
                    )
            `;

            await pool.query(unTagQuery, [
                itunesId,
                userId,
                scope,
                tagName
            ]);

        } else {
            const unTagQuery = `
                DELETE from release_tags 
                WHERE release_id = (SELECT id FROM releases WHERE itunes_id = $1)
                    AND tag_id = (
                      SELECT id FROM tags 
                      WHERE user_id = $2 
                        AND scope = $3 
                        AND name = $4
                    )
            `;

            await pool.query(unTagQuery, [
                itunesId,
                userId,
                scope,
                tagName
            ]);

        }
        
        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error("Error:", error);
        const message = error instanceof Error ? error.message : "An unknown error occured.";

        return NextResponse.json(
            { error: "Failed to untag", details: message }, 
            { status: 500 }   
        );
    }
}