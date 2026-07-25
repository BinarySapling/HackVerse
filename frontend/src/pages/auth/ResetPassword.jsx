import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length < 8) return toast.error('Password must be at least 8 characters long.');
    if (password !== confirmPassword) return toast.error("Passwords don't match.");

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Password has been reset successfully!');
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white border border-border rounded-lg shadow-sm p-8 max-w-md w-full flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-secondary">Reset Password</h1>
          <p className="text-xs text-slate-500 mt-1">Please enter your new password below.</p>
        </div>

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

        <div className="text-center">
          <Link to="/login" className="text-xs font-semibold text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
