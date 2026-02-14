import { ItunesArtist } from '@/lib/types';

function handleFollow(artist: ItunesArtist){
    console.log("Attemping to follow:", artist.artistName)
}

export default function SearchResults({ results }: { results: ItunesArtist[] }) {
    return (
        <div className="mt-8">
            <p className="mb-4 text-gray-600">{results.length} artists found</p>
            {/* Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.map((artist) => (
                    /* Card for each artist */
                    <div 
                        key={artist.artistId} 
                        className="border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
                    >
                        <div> 
                            <h3 className="font-bold text-lg text-black">{artist.artistName}</h3>
                            <p  className="text-sm text-gray-500">{artist.primaryGenreName}</p>
                        </div>

                        <button
                            onClick={() => handleFollow(artist)}
                            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                        >
                            Follow
                        </button>
                    </div>
                ))}

            </div>
        </div>
    )
}