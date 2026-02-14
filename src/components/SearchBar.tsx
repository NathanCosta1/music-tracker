'use client'
import { useState } from 'react';
import { ItunesArtist } from '@/lib/types';

interface SearchBarProps {
    onResultsFound: (results: ItunesArtist[]) => void;
}

export default function SearchBar({ onResultsFound }: SearchBarProps) {

    const [search, setSearch] = useState("")

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSearch(e.target.value)
        console.log("Current Search Bar text:", e.target.value)
    }

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault() // Stop the text in the search bar from disappearing on page refresh (default form behavior)
        console.log("Performing Search for:", search)
        const url = `https://itunes.apple.com/search?term=${search}&entity=musicArtist`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`)
            }

            const data = await response.json();
            onResultsFound(data.results);

            console.log("Data:", data);

        } catch(error) {
          throw error;
        }
    }

    return (
        <div>
            <form onSubmit={handleSearch}>
                <input 
                    type="text" 
                    id="artist_search" 
                    className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow xs placeholder:text-body" 
                    placeholder="Search for Artists..." 
                    value={search}
                    onChange={handleChange}
                />
                <button type="submit" className="mt-2 bg-blue-600 text-white p-2 rounded">Search</button>
            </form>
        </div>

    )
}