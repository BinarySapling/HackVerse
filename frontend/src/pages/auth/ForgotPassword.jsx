import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../config/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import BrandLogo from '../../components/BrandLogo';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address.');
    setIsLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      if (response?.data?.resetUrl) {
        toast.success('Email is not configured locally. Opening your reset link.');
        window.location.href = response.data.resetUrl;
        return;
      }
      toast.success('If that email is registered, a reset link has been sent.');
    } catch (err) {
      toast.error(err.message || 'Could not send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 max-w-md w-full flex flex-col gap-6"
      >
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-secondary w-fit">
          <ArrowLeft size={14} /> Back to login
        </Link>
        <div className="flex justify-center">
          <BrandLogo to={null} size="xl" showText={false} />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-display font-semibold tracking-tight">Forgot password</h1>
          <p className="text-sm text-muted mt-2">Enter your email to receive a password reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            type="email"
            label="Email Address"
            placeholder="dev@hackverse.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Send Reset Link
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
