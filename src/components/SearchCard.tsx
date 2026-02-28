import { ItunesArtist } from '@/lib/types';

async function handleFollow(artist: ItunesArtist){
    console.log("Attemping to follow:", artist.artistName)
    const response = await fetch('/api/follow',{
        method: "POST",
        body: JSON.stringify( {artist} )
    });

    if (response.ok){
        console.log("Followed:", artist.artistName)
    } else {
        console.log("Error following:", artist.artistName)
    }
}

export default function SearchResults({ artist }: { artist: ItunesArtist }) {
    return (
    <div className="flex flex-col gap-3">
        <div
        key={artist.artistId}
        className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition"
        >
        {/* Left: Artist card */}
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300" />
            <div>
                <h3 className="font-semibold text-black">{artist.artistName}</h3>
                <p className="text-sm text-gray-500">{artist.primaryGenreName}</p>
            </div>
        </div>

        {/* Right: Button */}
        <button
            onClick={() => handleFollow(artist)}
            className="px-4 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md"
        >
            Follow
        </button>
        </div>
    </div>

    )
}