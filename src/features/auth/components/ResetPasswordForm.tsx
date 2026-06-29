import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [showPassword, setShowPassword] = useState(false);
  const [completed, setCompleted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      toast.error('Invalid reset link. Request a new one.');
      return;
    }

    try {
      await authService.resetPassword(token, values.newPassword);
      setCompleted(true);
      toast.success('Password updated successfully.');
    } catch {
      toast.error('Invalid or expired reset link. Please request a new one.');
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">Invalid link</h2>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          This password reset link is missing or invalid.
        </p>
        <Link
          to="/forgot-password"
          className="inline-block mt-6 text-sm text-[var(--color-primary)] hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success-muted)] mx-auto mb-4">
          <CheckCircle2 className="h-6 w-6 text-[var(--color-success)]" />
        </div>
        <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">Password updated</h2>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          You can now sign in with your new password.
        </p>
        <Button className="mt-6" onClick={() => navigate('/login', { replace: true })}>
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">Set new password</h2>
        <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)]">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="New password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter new password"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register('newPassword')}
        />

        <Input
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
          Update password
        </Button>
      </form>
    </div>
  );
};
