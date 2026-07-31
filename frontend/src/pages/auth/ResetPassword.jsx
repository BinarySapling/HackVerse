import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../config/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('Reset link is missing or invalid.');
    if (password.length < 8) return toast.error('Password must be at least 8 characters long.');
    if (password !== confirmPassword) return toast.error("Passwords don't match.");

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password has been reset. Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Could not reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-display font-semibold tracking-tight">Reset password</h1>
          <p className="text-sm text-muted mt-2">Enter your new password below.</p>
        </div>

        {!token ? (
          <p className="text-sm text-danger text-center">
            This reset link is invalid. Request a new one from{' '}
            <Link to="/forgot-password" className="underline">
              forgot password
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="password"
              type="password"
              label="New Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              id="confirmPassword"
              type="password"
              label="Confirm New Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
              Reset Password
            </Button>
          </form>
        )}

        <div className="text-center">
          <Link to="/login" className="text-xs font-semibold text-primary-soft hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
