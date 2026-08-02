import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { signupSchema } from '../../validations/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import BrandLogo from '../../components/BrandLogo';
import { ArrowLeft, Rocket, Users, Trophy } from 'lucide-react';
const authBackground = 'https://res.cloudinary.com/dcle8c2mz/image/upload/v1785705666/hackverse/page-backgrounds/auth-hackverse-bg.png';

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
    defaultValues: {
      role: 'participant',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await signup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role || 'participant',
        password: data.password,
      });
      toast.success('Account created! Check your email for the verification code.');
      const cooldown = result?.resendCooldown || result?.otpExpiresIn || 180;
      navigate(`/verify-email?email=${encodeURIComponent(data.email.trim().toLowerCase())}`, {
        state: { resendCooldown: cooldown },
      });
    } catch (err) {
      toast.error(err.message || 'Registration failed. Email might already exist.');
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

        <div className="relative z-10 flex flex-col items-center text-center gap-6 my-6">
          <div className="float-slow pulse-glow rounded-3xl p-2">
            <BrandLogo to={null} size="hero" showText={false} />
          </div>
          <div className="max-w-md">
            <h2 className="text-3xl xl:text-4xl font-display font-bold leading-tight">
              Create, Build, and Evaluate seamlessly.
            </h2>
            <p className="text-sm text-muted mt-4 leading-relaxed">
              Join organizers, developers, and judges running academic hackathons on HackVerse.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
            {[
              { icon: Rocket, label: 'Launch' },
              { icon: Users, label: 'Team up' },
              { icon: Trophy, label: 'Win' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl ring-1 ring-white/[0.08] bg-white/[0.03] p-3">
                  <Icon size={18} className="mx-auto text-primary-soft" />
                  <p className="text-[11px] text-muted mt-2">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="relative z-10 text-xs text-muted font-mono tracking-widest uppercase">HackVerse // Join Gate</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="relative flex flex-col justify-center px-6 sm:px-10 xl:px-20 py-10"
      >
        <div className="max-w-lg w-full mx-auto rounded-2xl bg-[#09090B]/88 p-6 sm:p-8 shadow-2xl shadow-black/50 ring-1 ring-white/[0.08] backdrop-blur-md">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-secondary mb-8 w-fit">
            <ArrowLeft size={14} /> Back to home
          </Link>

          <div className="lg:hidden mb-8 flex justify-center">
            <BrandLogo size="xl" showText={false} />
          </div>

          <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold">Join HackVerse</h1>
            <p className="text-sm text-muted mt-2">Create an account to start building.</p>
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
              placeholder="dev@hackverse.io"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-muted uppercase tracking-wide">Account Type</span>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 rounded-xl ring-1 ring-white/[0.08] px-3 py-2.5 text-sm cursor-pointer hover:bg-white/[0.04] hover:ring-primary/40 transition-colors">
                  <input type="radio" value="participant" className="accent-primary" {...register('role')} />
                  Participant
                </label>
                <label className="flex items-center gap-2 rounded-xl ring-1 ring-white/[0.08] px-3 py-2.5 text-sm cursor-pointer hover:bg-white/[0.04] hover:ring-primary/40 transition-colors">
                  <input type="radio" value="organizer" className="accent-primary" {...register('role')} />
                  Organizer
                </label>
              </div>
              {errors.role && <span className="text-xs text-danger font-medium">{errors.role.message}</span>}
            </div>

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
              Create Account
            </Button>
          </form>

          <p className="text-sm text-muted text-center">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-soft hover:underline">
              Log In
            </Link>
          </p>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default Signup;
