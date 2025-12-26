import { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin, googleLogout, type CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import Layout from './components/Layout'; 
import Dashboard from './components/Dashboard'; 
import BudgetPlanner from './components/BudgetPlanner'; 
import Analytics from './components/Analytics'; 
import Transactions from './components/Transactions'; 
import Goals from './components/Goals';
import { Wallet } from 'lucide-react';
import type { User } from './types';
import CategoryManager from './components/CategoryManager';
import Recurring from './components/Recurring';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

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

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAFAF9]">
        <GoogleOAuthProvider clientId="577129960094-dvqmurtgvtui2s2kunj7m73togc94kll.apps.googleusercontent.com">
           <div className="bg-white p-8 rounded-[2rem] shadow-xl text-center max-w-sm w-full border border-stone-100">
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200"><Wallet className="w-8 h-8 text-white" /></div>
              </div>
              <h1 className="text-2xl font-bold mb-2 text-stone-800">Welcome to FinTrack</h1>
              <div className="flex justify-center mt-6">
                 <GoogleLogin onSuccess={handleLogin} onError={() => console.log('Login Failed')} />
              </div>
           </div>
        </GoogleOAuthProvider>
      </div>
    );
  }

  return (
    <Layout user={user} activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout}>
      {activeTab === 'dashboard' && <Dashboard user={user} />}
      {activeTab === 'budget' && (
          <div className="space-y-12">
              <BudgetPlanner user={user} />
          </div>
      )}
      {activeTab === 'goals' && <Goals user={user} />}
      {activeTab === 'transactions' && <Transactions user={user} />}
      {activeTab === 'analytics' && <Analytics user={user} />}
      {activeTab === 'categories' && <CategoryManager user={user} />}
      {activeTab === 'recurring' && <Recurring user={user} />}
    </Layout>
  );
}

export default App;