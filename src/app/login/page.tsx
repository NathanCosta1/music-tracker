'use client'
import { useState, FormEvent, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    async function handleAuth(e: FormEvent, type: 'signup' | 'login') {
        e.preventDefault();
        setLoading(true);

        const endpoint = type === 'signup' ? '/api/signup' : '/api/login';

        const response = await fetch(endpoint,{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify( {email, password} )
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`${type} success:`, data);
            alert(`${type} successful!`);
            router.push('/'); 

        } else {
            console.error(`${type} error:`, data.error);
            alert(`Error: ${data.error}`);
        }
        setLoading(false);
    }

    return (
        <main className="p-8 max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-6">Music Tracker</h1>
            
            <form className="flex flex-col gap-4">
                <input 
                    className="border p-2 rounded text-white" 
                    type="email" 
                    placeholder="Email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />            
                <input 
                    className="border p-2 rounded text-white" 
                    type="password" 
                    placeholder="Password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                
                <div className="flex gap-2">
                    <button 
                        type="button" 
                        onClick={(e) => handleAuth(e as MouseEvent, 'signup')}
                        className="bg-blue-500 text-white p-2 rounded flex-1 disabled:bg-gray-400"
                        disabled={loading}
                    >
                        Sign Up
                    </button>
                    
                    <button 
                        type="button"
                        onClick={(e) => handleAuth(e as MouseEvent, 'login')}
                        className="bg-green-600 text-white p-2 rounded flex-1 disabled:bg-gray-400"
                        disabled={loading}
                    >
                        Log In
                    </button>
                </div>
            </form>
        </main>
    )
}