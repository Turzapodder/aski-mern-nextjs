'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLoginUserMutation, useGetUserQuery } from '@/lib/services/auth';
import { useAppDispatch } from '@/lib/hooks';
import { setUserProfile } from '@/lib/features/auth/authSlice';
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/';
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [loginUser, { isLoading: isLoggingIn }] = useLoginUserMutation();
  const { data: userData, isLoading: isCheckingAuth } = useGetUserQuery();

  // If already authenticated as admin, redirect
  useEffect(() => {
    if (userData?.user) {
      const isAdmin = Array.isArray(userData.user.roles) && userData.user.roles.includes('admin');
      if (isAdmin) {
        dispatch(setUserProfile(userData.user));
        router.replace(nextPath);
      }
    }
  }, [userData, router, nextPath, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const result: any = await loginUser({ email, password, role: 'admin' }).unwrap();
      const user = result?.user || result?.data?.user;

      if (user) {
        const isAdmin = Array.isArray(user.roles) && user.roles.includes('admin');
        if (!isAdmin) {
          setError('Access denied. This portal is for administrators only.');
          return;
        }
        dispatch(setUserProfile(user));
        router.push(nextPath);
      }
    } catch (err: any) {
      const message = err?.data?.message || err?.message || 'Login failed. Please try again.';
      setError(message);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-600 mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Aski Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to the administration panel</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aski.com"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                disabled={isLoggingIn}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  disabled={isLoggingIn}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          This portal is for authorized administrators only.
        </p>
      </div>
    </div>
  );
}
