import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signupSchema } from '../../validations/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await signup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      toast.success('Registration successful! Please login to your new account.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Email might already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-6">
      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 max-w-4xl w-full">
        {/* Left Side: Tagline & Artwork */}
        <div className="bg-surfaceDark text-white p-8 md:p-12 flex flex-col justify-between gap-8">
          <div className="flex items-center gap-2 text-teal-200 font-bold text-lg select-none">
            <div className="bg-primary text-white p-1 rounded-lg">
              <Sparkles size={16} />
            </div>
            <span>HackVerse</span>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold leading-tight">Create, Build, and Evaluate seamlessly.</h2>
            <p className="text-sm text-slate-300">
              Join a network of academic innovators, expert developers, and judges pushing project engineering to new heights.
            </p>
          </div>

          <svg className="w-full h-32 text-slate-700" fill="currentColor" viewBox="0 0 400 120">
            <rect width="400" height="120" rx="8" className="fill-slate-700" />
            <circle cx="200" cy="60" r="40" className="text-primary" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="200" y1="20" x2="200" y2="100" stroke="currentColor" strokeWidth="2" />
            <line x1="160" y1="60" x2="240" y2="60" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-secondary">Join Platform</h1>
            <p className="text-xs text-slate-400 mt-1">Create a participant account to register for hackathons.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="firstName"
                label="First Name"
                placeholder="John"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                id="lastName"
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="example@hackverse.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isSubmitting}>
              Register Account
            </Button>
          </form>

          <p className="text-xs text-slate-500 text-center">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
