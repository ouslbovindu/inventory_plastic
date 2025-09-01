import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import { supabase } from './lib/supabase';
import { WorkerAccount } from './types/inventory';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState<'regular' | 'worker'>('regular');
  const [workerData, setWorkerData] = useState<WorkerAccount | null>(null);

  useEffect(() => {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not found');
      setIsLoading(false);
      return;
    }

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      
      // Only clear tokens if there's an invalid session, not just no session
      if (session && !session.user) {
        console.log('Invalid session detected, signing out');
        supabase.auth.signOut();
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setIsAuthenticated(!!session);
      
      // Handle sign out
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (type: 'regular' | 'worker', worker?: WorkerAccount) => {
    setIsAuthenticated(true);
    setUserType(type);
    if (type === 'worker' && worker) {
      setWorkerData(worker);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserType('regular');
    setWorkerData(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard 
          onLogout={handleLogout} 
          userType={userType}
          workerData={workerData}
        />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;