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


export async function DELETE(request: NextRequest) {
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