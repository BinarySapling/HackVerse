import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../config/axios';
import Card from '../../components/ui/Card';
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
    <div className="max-w-lg mx-auto py-10">
      <Card className="p-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-secondary">Judge Registration</h1>
          <p className="text-sm text-slate-500">
            Create your judge account using the secure invitation link.
          </p>
        </div>

        {isTokenMissing ? (
          <p className="text-sm text-red-500">Invalid or missing invitation token.</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input id="firstName" label="First Name" error={errors.firstName?.message} {...register('firstName')} />
            <Input id="lastName" label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
            <Input id="email" type="email" label="Email" error={errors.email?.message} {...register('email')} />
            <Input id="password" type="password" label="Password" error={errors.password?.message} {...register('password')} />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Creating account...' : 'Create Judge Account'}
            </Button>
          </form>
        )}

        <p className="text-xs text-slate-500">
          Already registered? <Link to="/login" className="text-primary underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
};

export default JudgeRegister;
