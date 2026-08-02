import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../config/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const JudgeRegister = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const isTokenMissing = useMemo(() => !token, [token]);

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invitation token is missing');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/judge-invitations/register', { ...data, token });
      toast.success('Judge account created. Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Failed to register from invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 page-glow">
      <div className="w-full max-w-md">
        <p className="text-[11px] tracking-[0.32em] uppercase text-primary-soft/80 mb-4 font-medium">
          Invitation
        </p>
        <h1 className="text-3xl font-display font-semibold tracking-tight">Judge registration</h1>
        <p className="text-sm text-muted mt-3 leading-relaxed">
          Create your judge account using the secure invitation link.
        </p>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/25 to-transparent my-8" />

        {isTokenMissing ? (
          <p className="text-sm text-danger">Invalid or missing invitation token.</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="firstName"
              label="First name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              id="lastName"
              label="Last name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
            <Input
              id="email"
              type="email"
              label="Email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="password"
              type="password"
              label="Password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full" isLoading={isSubmitting}>
              Create judge account
            </Button>
          </form>
        )}

        <p className="text-xs text-muted mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-primary-soft hover:text-white transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default JudgeRegister;
