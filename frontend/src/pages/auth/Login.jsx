import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { loginSchema } from '../../validations/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import BrandLogo from '../../components/BrandLogo';
import { ArrowLeft } from 'lucide-react';
const authBackground = 'https://res.cloudinary.com/dcle8c2mz/image/upload/v1785705666/hackverse/page-backgrounds/auth-hackverse-bg.png';

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
      const message = err.message || 'Login failed. Please check your credentials.';
      const needsVerify =
        err.errorCode === 'EMAIL_NOT_VERIFIED' ||
        err.data?.verificationRequired ||
        /verify your email/i.test(message);

      if (needsVerify) {
        const email = (err.data?.email || data.email || '').trim().toLowerCase();
        toast.error('Please verify your email before logging in.');
        navigate(`/verify-email?email=${encodeURIComponent(email)}`, {
          state: { resendCooldown: 0 },
        });
        return;
      }

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src={authBackground}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#09090B]/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#09090B]/98 via-[#09090B]/78 to-[#09090B]/96" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/35 to-[#09090B]/70" />

      <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
        className="relative hidden lg:flex flex-col justify-between p-10 xl:p-14 overflow-hidden border-r border-white/[0.06]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#09090B]/75 via-[#09090B]/35 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <BrandLogo size="lg" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center gap-6 my-8">
          <div className="float-slow pulse-glow rounded-3xl p-2">
            <BrandLogo to={null} size="hero" showText={false} />
          </div>
          <div className="max-w-md">
            <span className="inline-flex rounded-full ring-1 ring-white/[0.1] px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted mb-4">
              Welcome to the frontier
            </span>
            <h2 className="text-3xl xl:text-4xl font-display font-bold leading-tight">
              The best way to predict the <span className="text-primary-soft">future</span> is to build it yourself.
            </h2>
            <p className="text-sm text-muted mt-4 leading-relaxed">
              Log in to manage hackathons, teams, submissions, and evaluations in one place.
            </p>
          </div>
        </div>

        <p className="relative z-10 text-xs text-muted font-mono tracking-widest uppercase">HackVerse // Session Gate</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="relative flex flex-col justify-center px-6 sm:px-10 xl:px-20 py-10"
      >
        <div className="max-w-md w-full mx-auto rounded-2xl bg-[#09090B]/88 p-6 sm:p-8 shadow-2xl shadow-black/50 ring-1 ring-white/[0.08] backdrop-blur-md">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-secondary mb-8 w-fit">
            <ArrowLeft size={14} /> Back to home
          </Link>

          <div className="lg:hidden mb-8 flex justify-center">
            <BrandLogo size="xl" showText={false} />
          </div>

          <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold">Welcome Back</h1>
            <p className="text-sm text-muted mt-2">Log in to your developer ecosystem</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="dev@hackverse.io"
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
              <Link to="/forgot-password" className="text-xs font-semibold text-primary-soft hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2 uppercase tracking-wide" isLoading={isSubmitting}>
              Enter the Verse
            </Button>
          </form>

          <p className="text-sm text-muted text-center">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary-soft hover:underline">
              Create an account
            </Link>
          </p>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default Login;
