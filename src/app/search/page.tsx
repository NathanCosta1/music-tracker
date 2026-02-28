'use client'

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import SearchCard from '@/components/SearchCard';
import { ItunesArtist } from '@/lib/types';

export default function SearchPage() {
    const [results, setResults] = useState<ItunesArtist[]>([]);

    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold mb-6">Search for Artists</h1>
            <SearchBar onResultsFound={setResults} />

            <div className='mt-8 gap-3 flex flex-col'>
               {results.length > 0 && results.map((artist) => (
                    <SearchCard key={artist.artistId} artist={artist} />  
               ))}          
            </div>
        </main>
    )
}
