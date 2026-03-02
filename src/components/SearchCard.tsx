'use client'

import { ItunesArtist } from '@/lib/types';
import { useState } from 'react';

export default function SearchResults({ artist, initialFollowed }: { artist: ItunesArtist, initialFollowed: boolean }) {
    const[isFollowing, setIsFollowing] = useState(initialFollowed);


    async function toggleFollow(){
        let method;
        if (isFollowing){
            method = "DELETE";
            console.log("Attemping to unfollow:", artist.artistName);

        } else {
            method = "POST";
            console.log("Attemping to follow:", artist.artistName);  
        }

        const response = await fetch('/api/follow',{
            method: method,
            body: JSON.stringify( {artist} )
        });

        if (response.ok){
            console.log("Success");
            setIsFollowing(!isFollowing);
        } else {
            console.log("Error");
        }
    }

    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300" />
                <div>
                    <h3 className="font-semibold text-black">{artist.artistName}</h3>
                </div>
            </div>

            <button
                onClick={toggleFollow}
                className={`px-4 py-1.5 text-sm rounded-md text-white ${
                    isFollowing ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                }`}
            >
                {isFollowing ? "Unfollow" : "Follow"}
            </button>
        </div>
    )
}