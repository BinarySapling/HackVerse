import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address.');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Password reset link sent to your email!');
    }, 1500);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white border border-border rounded-lg shadow-sm p-8 max-w-md w-full flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-secondary">Forgot Password</h1>
          <p className="text-xs text-slate-500 mt-1">Enter your registered email to receive a password reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            type="email"
            label="Email Address"
            placeholder="example@hackverse.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Send Reset Link
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

export default ForgotPassword;
