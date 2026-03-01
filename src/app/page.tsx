'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const handleLogout = async () => {
    const response = await fetch('/api/logout', { method: 'POST' })
    if (response.ok) {
      router.push('/login')
      router.refresh() 
    }
  }

  return (
    <main className="max-w-md mx-auto p-8 font-sans">
      <h1 className="text-2xl font-bold mb-6 border-b pb-2 text-white">
        Music Tracker Hub
      </h1>
      
      <ul className="space-y-4 mb-8">
        <li>
          <Link href="/search" className="text-blue-400">
            Search for Artists
          </Link>
        </li>
        <li>
          <Link href="/feed" className="text-blue-400">
            View My Feed
          </Link>
        </li>
      </ul>

      <div className="pt-6 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="text-red-400 text-sm border border-red-900 p-2 rounded"
        >
          Logout of Account
        </button>
      </div>
    </main>
  );
}