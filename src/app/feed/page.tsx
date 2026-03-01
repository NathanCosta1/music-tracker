"use client";

import ReleaseCard from '@/components/ReleaseCard'; 
import { Release } from '@/lib/types';
import { useSearchParams } from 'next/navigation'
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function FeedPage() {
    const [releases, setReleases] = useState<Release[]>([]);
    const [loading, setLoading] = useState(true);

    const searchParams = useSearchParams()    
    const activeTab = searchParams.get('tab') || 'past';

    useEffect(() => {
        async function loadData() {
            try {
                const results = await fetch('/api/feed');
                const data = await results.json();
                if (data.success) {
                    setReleases(data.feed);
                }
            } catch (error) {
                console.error("Error getting followed releases:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);
    
    const now = new Date();
    const pastReleases = releases.filter(r => new Date(r.release_date) <= now);
    const upcomingReleases = releases.filter(r => new Date(r.release_date) > now);

    const displayList = activeTab === 'past' ? pastReleases : upcomingReleases;

    let content;
    
    if (loading) {
        content = <p>Loading ...</p>;
    } else if (displayList.length > 0) {
        content = displayList.map((release) => (<ReleaseCard key={release.id} release={release} />));
    } else {
        content = <p>No {activeTab} releases found.</p>;
    }

    return (
        <main className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Release Timeline</h1>
                <Link 
                    href="/" 
                    className="bg-blue-500 border px-4 py-2"
                >
                    Home
                </Link>
            </div>
            <div className="flex gap-4 mb-8 border-b border-gray-700">
                <Link 
                    href="/feed?tab=past"
                    className={`pb-2 px-4 font-medium transition-colors ${
                        activeTab === 'past' 
                        ? 'border-b-2 border-blue-500 text-blue-500' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    Past Releases
                </Link>
                <Link 
                    href="/feed?tab=upcoming"
                    className={`pb-2 px-4 font-medium transition-colors ${
                        activeTab === 'upcoming' 
                        ? 'border-b-2 border-blue-500 text-blue-500' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    Upcoming
                </Link>
            </div>
            <div className="flex flex-col gap-4">
                {content}
            </div>
        </main>
    );
}