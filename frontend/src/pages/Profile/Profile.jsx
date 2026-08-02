import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PageHeader, { SoftDivider } from '../../components/ui/PageHeader';
import api from '../../config/axios';
import toast from 'react-hot-toast';
import { Camera, Mail, Shield } from 'lucide-react';
import { resolveAssetUrl } from '../../utils/assetUrl';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters'),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .refine((val) => /[A-Z]/.test(val), {
        message: 'Password must contain at least one uppercase letter',
      })
      .refine((val) => /[a-z]/.test(val), {
        message: 'Password must contain at least one lowercase letter',
      })
      .refine((val) => /[0-9]/.test(val), {
        message: 'Password must contain at least one digit',
      })
      .refine((val) => /[^a-zA-Z0-9]/.test(val), {
        message: 'Password must contain at least one special character',
      }),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const Profile = () => {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarError, setAvatarError] = useState('');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
      setAvatarPreview(user.avatar ? resolveAssetUrl(user.avatar) : null);
    }
  }, [user, resetProfile]);

  if (!user) return null;

  const persistUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem('user', JSON.stringify(nextUser));
  };

  const onSaveProfile = async (data) => {
    setIsSavingProfile(true);
    try {
      const response = await api.patch('/users/me', {
        firstName: data.firstName,
        lastName: data.lastName,
      });
      const updated = response.data;
      persistUser({ ...user, ...updated });
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const validateAvatarFile = (file) => {
    if (!file) return 'Please choose an image file.';
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      return 'Only JPEG, PNG, WebP, or GIF images are allowed.';
    }
    if (file.size > MAX_AVATAR_BYTES) {
      return 'Image must be 2MB or smaller.';
    }
    return '';
  };

  const onAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const validationMessage = validateAvatarFile(file);
    if (validationMessage) {
      setAvatarError(validationMessage);
      return;
    }

    setAvatarError('');
    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);
    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.patch('/users/me', formData);
      const updated = response.data;
      persistUser({ ...user, ...updated });
      setAvatarPreview(resolveAssetUrl(updated.avatar));
      toast.success('Profile photo updated.');
    } catch (err) {
      setAvatarPreview(user.avatar ? resolveAssetUrl(user.avatar) : null);
      toast.error(err.message || 'Failed to upload photo.');
    } finally {
      URL.revokeObjectURL(localPreview);
      setIsUploadingAvatar(false);
    }
  };

  const onChangePassword = async (data) => {
    setIsSubmittingPassword(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success('Password updated successfully.');
      reset();
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="relative flex flex-col max-w-3xl">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Your account details, photo, and security settings."
      />

      <SoftDivider />

      <section className="pt-10 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt=""
                className="h-20 w-20 rounded-2xl object-cover ring-1 ring-white/10 shadow-[0_0_28px_rgba(124,58,237,0.25)]"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-primary/90 text-white flex items-center justify-center font-display font-semibold text-2xl shadow-[0_0_28px_rgba(124,58,237,0.3)]">
                {user.firstName?.[0]?.toUpperCase()}
                {user.lastName?.[0]?.toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-[#14101c] ring-1 ring-white/15 text-primary-soft hover:text-white inline-flex items-center justify-center transition-colors disabled:opacity-60"
              aria-label="Upload profile photo"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={onAvatarChange}
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-display font-semibold tracking-tight">
              {user.firstName} {user.lastName}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="primary" className="capitalize">
                {user.role}
              </Badge>
              {isUploadingAvatar && (
                <span className="text-xs text-muted">Uploading photo…</span>
              )}
            </div>
            {avatarError && (
              <p className="mt-2 text-xs text-danger font-medium">{avatarError}</p>
            )}
            <p className="mt-2 text-xs text-muted">JPEG, PNG, WebP, or GIF · max 2MB</p>
          </div>
        </div>

        <form
          onSubmit={handleProfileSubmit(onSaveProfile)}
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl"
        >
          <Input
            id="firstName"
            label="First name"
            error={profileErrors.firstName?.message}
            {...registerProfile('firstName')}
          />
          <Input
            id="lastName"
            label="Last name"
            error={profileErrors.lastName?.message}
            {...registerProfile('lastName')}
          />
          <div className="sm:col-span-2 pt-1">
            <Button type="submit" isLoading={isSavingProfile} disabled={!isProfileDirty}>
              Save profile
            </Button>
          </div>
        </form>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="flex items-start gap-3">
            <Mail className="text-primary-soft/80 mt-0.5" size={18} />
            <div>
              <p className="text-[11px] tracking-[0.16em] uppercase text-muted/75">Email</p>
              <p className="text-sm font-medium mt-1.5 break-all">{user.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="text-primary-soft/80 mt-0.5" size={18} />
            <div>
              <p className="text-[11px] tracking-[0.16em] uppercase text-muted/75">Role</p>
              <p className="text-sm font-medium mt-1.5 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

      <section className="pb-4">
        <p className="soft-section-label mb-2">Security</p>
        <h3 className="text-xl font-display font-semibold tracking-tight">Change password</h3>
        <p className="text-sm text-muted mt-2 mb-8 max-w-md">
          Use a strong password with upper, lower, number, and special character.
        </p>

        <form onSubmit={handleSubmit(onChangePassword)} className="flex flex-col gap-4 max-w-md">
          <Input
            id="currentPassword"
            type="password"
            label="Current password"
            placeholder="••••••••"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <Input
            id="newPassword"
            type="password"
            label="New password"
            placeholder="••••••••"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            id="confirmPassword"
            type="password"
            label="Confirm new password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <div className="pt-2">
            <Button type="submit" isLoading={isSubmittingPassword}>
              Update password
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Profile;
