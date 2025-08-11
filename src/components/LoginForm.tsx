import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { WorkerAccount } from '../types/inventory';

interface LoginFormProps {
  onLogin: (userType: 'regular' | 'worker', workerData?: WorkerAccount) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loginType, setLoginType] = useState<'regular' | 'worker'>('regular');

  const checkWorkerAccount = async (username: string, password: string): Promise<WorkerAccount | null> => {
    try {
      const { data, error } = await supabase
        .from('worker_accounts')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        username: data.username,
        password: data.password,
        role: data.role,
        permissions: data.permissions,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setInfoMessage('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    if (isSignUp && password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    // Check for worker account login
    if (loginType === 'worker') {
      const workerAccount = await checkWorkerAccount(email, password);
      if (workerAccount) {
        onLogin('worker', workerAccount);
        return;
      } else {
        setError('Invalid worker credentials');
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          setError(error.message);
        } else {
          setError('');
          setSuccessMessage('Account created successfully! You can now sign in.');
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message === 'Email not confirmed' || error.message.includes('email_not_confirmed')) {
            setError('Please check your email inbox (including spam/junk folders) for a confirmation link and click it to activate your account before signing in.');
            setShowResendConfirmation(true);
          } else {
            setError(error.message);
            setShowResendConfirmation(false);
          }
        } else {
          // Ensure user data isolation by checking authentication
          if (data.user) {
            console.log('User authenticated:', data.user.id);
          }
          onLogin('regular');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }

    setIsLoading(false);
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setResendLoading(true);
    setError('');
    setSuccessMessage('');
    setInfoMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setError(error.message);
      } else {
        setError('');
        setInfoMessage('Confirmation email sent! Please check your inbox and spam folder.');
      }
    } catch (err) {
      setError('Failed to resend confirmation email');
    }

    setResendLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Plastic Raw Materials System</p>
        </div>

        {/* Login Type Selector */}
        <div className="mb-6">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => {
                setLoginType('regular');
                setError('');
                setSuccessMessage('');
                setInfoMessage('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginType === 'regular'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('worker');
                setIsSignUp(false);
                setError('');
                setSuccessMessage('');
                setInfoMessage('');
                setShowResendConfirmation(false);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginType === 'worker'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Worker Login
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {loginType === 'worker' ? 'Username' : 'Email Address'}
            </label>
            <input
              type={loginType === 'worker' ? 'text' : 'email'}
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
              placeholder={loginType === 'worker' ? 'Enter your username' : 'Enter your email address'}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-10 sm:pr-12 text-sm sm:text-base"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
              {showResendConfirmation && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resendLoading}
                    className="text-blue-600 hover:text-blue-800 underline text-sm disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : 'Resend Confirmation Email'}
                  </button>
                </div>
              )}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {successMessage}
            </div>
          )}

          {infoMessage && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
              {infoMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 sm:py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center text-sm sm:text-base"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {isSignUp ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        {loginType === 'regular' && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccessMessage('');
                setInfoMessage('');
                setShowResendConfirmation(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        )}

        {loginType === 'worker' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Worker Accounts:</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>worker1</strong> / pass123</p>
              <p><strong>worker2</strong> / pass123</p>
              <p><strong>worker3</strong> / pass123</p>
              <p><strong>worker4</strong> / pass123</p>
              <p><strong>worker5</strong> / pass123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;