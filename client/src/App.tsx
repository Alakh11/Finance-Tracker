import { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin, googleLogout, type CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import Layout from './components/Layout'; 
import Dashboard from './components/Dashboard'; // Import Dashboard
import BudgetPlanner from './components/BudgetPlanner'; // Import Budget
import { Wallet } from 'lucide-react';
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- Session Restore ---
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        try {
            const decoded: any = jwtDecode(token);
            setUser({ name: decoded.name, email: decoded.email, picture: decoded.picture });
        } catch (e) {
            localStorage.removeItem('auth_token');
        }
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

  // --- LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <GoogleOAuthProvider clientId="577129960094-dvqmurtgvtui2s2kunj7m73togc94kll.apps.googleusercontent.com">
           <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
              <div className="mb-6 flex justify-center">
                <div className="p-3 bg-blue-100 rounded-full"><Wallet className="w-8 h-8 text-blue-600" /></div>
              </div>
              <h1 className="text-2xl font-bold mb-2 text-gray-900">Welcome to FinTrack</h1>
              <p className="text-gray-500 mb-6">Track your wealth, expenses, and goals in one place.</p>
              <div className="flex justify-center">
                 <GoogleLogin onSuccess={handleLogin} onError={() => console.log('Login Failed')} />
              </div>
           </div>
        </GoogleOAuthProvider>
      </div>
    );
  }

  // --- MAIN APP ---
  return (
    <Layout 
      user={user} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      handleLogout={handleLogout}
    >
      {/* 1. Dashboard View */}
      {activeTab === 'dashboard' && <Dashboard user={user} />}

      
      {activeTab === 'analytics' && (
        <div className="text-center py-20"><h2 className="text-gray-400">Analytics Coming Soon</h2></div>
      )}
      {activeTab === 'budget' && <BudgetPlanner user={user} />}

      {activeTab === 'transactions' && (
   <div className="text-center py-20">
      <h2 className="text-xl font-bold text-gray-700">All Transactions</h2>
      <p className="text-gray-400">Detailed list coming soon...</p>
   </div>
)}
    </Layout>
  );
}

export default App;