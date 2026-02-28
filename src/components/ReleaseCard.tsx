import Image from 'next/image';
import { Release } from '@/lib/types';

export default function ReleaseCard({ release }: { release: Release }) {
    const formattedDate = new Date(release.release_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const highResArtwork = release.artwork_url.replace('100x100bb.jpg', '600x600bb.jpg');

    return (
        <a 
            href={release.release_url} 
            target="_blank" // New tab
            rel="noopener noreferrer" // No reference to site
            className="group flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300 w-full shadow-md hover:shadow-xl"
        >
            {/* Div 1: Album Art */}
            <div className="shrink-0 relative w-32 h-32 overflow-hidden rounded-xl shadow-lg border border-zinc-800">
                <Image 
                    src={highResArtwork} 
                    alt={`${release.title} cover`} 
                    width={600}
                    height={600}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Div 2: Info */}
            <div className="flex flex-col justify-center flex-1 w-full pt-1">
                {/* Title and E for explicit */}
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-xl text-white leading-tight">
                        {release.title}
                    </h3>
                    {release.explicitness && (
                        <span className="bg-zinc-700 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                            E
                        </span>
                    )}
                </div>
                
                {/* Nice formatting for name */}
                <p className="text-zinc-400 font-medium text-base mb-3">
                    {release.display_artist_name}
                </p>

                {/* Metadata (Release type, Release date, # tracks) */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-500">
                    <span className="bg-zinc-800 px-2 py-1 rounded-md uppercase tracking-widest text-zinc-300">
                        {release.type}
                    </span>
                    <span>•</span>
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span>{release.track_count} tracks</span>
                </div>
                
            </div>
        </a>
    );
}