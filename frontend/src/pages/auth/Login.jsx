import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginSchema } from '../../validations/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import BrandLogo from '../../components/BrandLogo';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.firstName}!`);
      const redirect = searchParams.get('redirect');
      if (redirect && redirect.startsWith('/')) {
        navigate(redirect);
      } else {
        navigate(`/dashboard/${user.role}`);
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-6">
      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 max-w-4xl w-full">
        {/* Left Side: Tagline & SVG */}
        <div className="bg-surfaceDark text-white p-8 md:p-12 flex flex-col justify-between gap-8">
          <BrandLogo size="lg" />

          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold leading-tight">Elevating Hackathons to the Next Level.</h2>
            <p className="text-sm text-slate-300">
              Log in to access dashboards, register for hackathons, review submissions, and manage teams dynamically.
            </p>
          </div>

          {/* Simple Decorative Grid SVG */}
          <svg className="w-full h-32 text-slate-700" fill="currentColor" viewBox="0 0 400 120">
            <rect width="400" height="120" rx="8" className="fill-slate-700" />
            <circle cx="50" cy="60" r="10" className="text-primary" />
            <circle cx="150" cy="60" r="10" className="text-primary opacity-50" />
            <circle cx="250" cy="60" r="10" className="text-primary opacity-25" />
            <circle cx="350" cy="60" r="10" className="text-primary opacity-10" />
            <line x1="50" y1="60" x2="350" y2="60" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-secondary">Account Login</h1>
            <p className="text-xs text-slate-400 mt-1">Please enter your credentials to access the platform.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="example@hackverse.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isSubmitting}>
              Sign In
            </Button>
          </form>

          <p className="text-xs text-slate-500 text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
