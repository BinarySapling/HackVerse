import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../config/axios';
import Button from '../../components/ui/Button';
import BrandLogo from '../../components/BrandLogo';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const OTP_LENGTH = 6;
const DEFAULT_COOLDOWN = 180;

const formatCountdown = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const email = (searchParams.get('email') || '').trim().toLowerCase();

  const initialCooldown = Number(location.state?.resendCooldown) > 0
    ? Number(location.state.resendCooldown)
    : DEFAULT_COOLDOWN;

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(initialCooldown);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) return;
    inputsRef.current[0]?.focus();
  }, [email]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const otpValue = digits.join('');

  const handleDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    const chars = cleaned.slice(0, OTP_LENGTH - index).split('');
    const next = [...digits];
    chars.forEach((ch, offset) => {
      next[index + offset] = ch;
    });
    setDigits(next);

    const focusAt = Math.min(index + chars.length, OTP_LENGTH - 1);
    inputsRef.current[focusAt]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otpValue.length !== OTP_LENGTH) {
      toast.error('Enter the 6-digit code from your email.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Verification is always performed on the backend against Redis-stored OTP
      await api.post('/auth/verify-otp', { email, otp: otpValue });
      toast.success('Email verified! You can log in now.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      const response = await api.post('/auth/resend-otp', { email });
      const nextCooldown = response?.data?.resendCooldown || response?.data?.otpExpiresIn || DEFAULT_COOLDOWN;
      toast.success('A new code has been sent.');
      setCooldown(nextCooldown);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } catch (err) {
      const message = err.message || 'Could not resend code.';
      toast.error(message);
      const waitMatch = message.match(/wait (\d+)s/i);
      if (waitMatch) {
        setCooldown(Number(waitMatch[1]));
      }
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-sm text-muted text-center">Missing email. Sign up again to receive a code.</p>
        <Link to="/signup" className="text-primary-soft font-semibold hover:underline">
          Back to signup
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
        className="relative hidden lg:flex flex-col justify-between p-10 xl:p-14 overflow-hidden border-r border-white/[0.06] bg-surfaceDark"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10">
          <BrandLogo size="lg" />
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl xl:text-4xl font-display font-bold leading-tight">
            One quick check, then you&apos;re in.
          </h2>
          <p className="text-sm text-muted mt-4 leading-relaxed">
            We emailed a 6-digit code to verify your account. It expires in 3 minutes.
          </p>
        </div>
        <p className="relative z-10 text-xs text-muted font-mono tracking-widest uppercase">
          HackVerse // Verify
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="flex flex-col justify-center px-6 sm:px-10 xl:px-20 py-10"
      >
        <Link to="/signup" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-secondary mb-8 w-fit">
          <ArrowLeft size={14} /> Back to signup
        </Link>

        <div className="max-w-md w-full mx-auto flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold">Verify your email</h1>
            <p className="text-sm text-muted mt-2">
              Enter the code sent to <span className="text-secondary font-medium">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="flex flex-col gap-6">
            <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-11 h-12 sm:w-12 sm:h-14 rounded-xl ring-1 ring-white/[0.1] bg-white/[0.03] text-center text-lg font-semibold text-secondary focus:ring-primary/50 outline-none transition-all"
                />
              ))}
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              Verify email
            </Button>
          </form>

          <div className="text-sm text-muted text-center space-y-1">
            {cooldown > 0 ? (
              <p>
                Resend available in{' '}
                <span className="font-mono font-semibold text-primary-soft tabular-nums">
                  {formatCountdown(cooldown)}
                </span>
              </p>
            ) : (
              <p>
                Didn&apos;t get it?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-semibold text-primary-soft hover:underline disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend code'}
                </button>
              </p>
            )}
            <p className="text-xs">Code expires after 3 minutes.</p>
          </div>

          <p className="text-sm text-muted text-center">
            Already verified?{' '}
            <Link to="/login" className="font-semibold text-primary-soft hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
