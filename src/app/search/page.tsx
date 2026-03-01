'use client'

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import SearchCard from '@/components/SearchCard';
import { ItunesArtist } from '@/lib/types';
import Link from 'next/link';

export default function SearchPage() {
    const [results, setResults] = useState<ItunesArtist[]>([]);

    return (
        <main className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Search for Artists</h1>
                <Link 
                    href="/" 
                    className="bg-blue-500 border px-4 py-2"
                >
                    Home
                </Link>
            </div>
            <SearchBar onResultsFound={setResults} />

            <div className='mt-8 gap-3 flex flex-col'>
               {results.length > 0 && results.map((artist) => (
                    <SearchCard key={artist.artistId} artist={artist} />  
               ))}          
            </div>
        </main>
    )
}
  


  
