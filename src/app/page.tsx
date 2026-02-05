import { pool } from '@/lib/db';
import SearchBar from '@/components/SearchBar'

export default async function Home() {
  const userId = 1;

  const query = `
    SELECT artists.name, artists.external_data
    FROM artists
    JOIN follows on artists.id = follows.artist_id
    WHERE follows.user_id = $1
  `;

  const { rows:followedArtists } = await pool.query(query, [userId]);

  return (
    <main className="p-10">
      <div><SearchBar></SearchBar></div>
      <h1 className="text-3xl font-bold mb-6 text-blue-600">My Following List</h1>

      <div className="grid gap-4">
        {followedArtists.length === 0 ? (
          <p>Not following anyone yet.</p>
        ) : (
          followedArtists.map((artist) => (
            <div key={artist.name} className="p-4 border rounded-lg shadow-sm bg-white">
              <h2 className="text -xl font-semibold text-black">{artist.name}</h2>
              {/* accessing the JSONB data */}
              <p className="text-gray-500">Genre: {artist.external_data?.genre}</p>
            </div> 
          ))
        )}
      </div>
    </main>
  );
}