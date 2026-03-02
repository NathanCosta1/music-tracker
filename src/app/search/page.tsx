import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { pool } from '@/lib/db'


export default async function SearchPage() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error(`Unathorized`);
        return;
    }
    const userId = user.id; 

    const getFollowedQuery = `
        SELECT A.itunes_id 
        FROM follows F, artists A
        WHERE F.user_id = $1
            AND A.id = F.artist_id;
    `;
    
    const { rows } = await pool.query(getFollowedQuery, [userId]);
    const followedIds = rows.map(row => row.itunes_id); 

    return (
        <main className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Search for Artists</h1>
                <Link href="/" className="bg-blue-500 border px-4 py-2">Home</Link>
            </div>
            <SearchBar initialFollowedIds={followedIds} />
        </main>
    )
}
  


  
