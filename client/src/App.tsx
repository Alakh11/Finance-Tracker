import { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { ShieldCheck } from 'lucide-react';
import type { User } from './types';
import iconNew from './assets/iconNew.png';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        try {
            const decoded: any = jwtDecode(token);
            setUser({ name: decoded.name, email: decoded.email, picture: decoded.picture });
        } catch (e) { localStorage.removeItem('auth_token'); }
    }
  }, []);

  const handleLogin = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      localStorage.setItem('auth_token', credentialResponse.credential);
      const decoded: any = jwtDecode(credentialResponse.credential);
      setUser({ name: decoded.name, email: decoded.email, picture: decoded.picture });
    }
  };



  if (!user) {
    return (
      <div 
        className="h-screen w-full flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')` }}
      >
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>

        <GoogleOAuthProvider clientId="577129960094-dvqmurtgvtui2s2kunj7m73togc94kll.apps.googleusercontent.com">
           <div className="relative bg-white/90 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl text-center max-w-md w-full mx-4 border border-white/50 animate-fade-in-up">
              <div className="mb-8 flex justify-center">
                <div className="p-5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 rounded-2xl shadow-lg shadow-blue-500/30 transform -rotate-6">
                    <img src={iconNew} className="w-12 h-12" alt="Logo" />
                </div>
              </div>
              <h1 className="text-3xl font-extrabold mb-3 text-slate-800 tracking-tight">FinTrack</h1>
              <p className="text-slate-500 mb-8 font-medium">Master your money with <br/> intelligent tracking and insights.</p>
              <div className="flex justify-center">
                 <GoogleLogin onSuccess={handleLogin} onError={() => console.log('Login Failed')} shape="pill" size="large" />
              </div>
              <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <ShieldCheck className="w-4 h-4" /> Secure & Private
              </div>
           </div>
        </GoogleOAuthProvider>
      </div>
    );
  }

  // --- Render Router with User Context ---
  return <RouterProvider router={router} context={{ user }} />;
}

export default App;