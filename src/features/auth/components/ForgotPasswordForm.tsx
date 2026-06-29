import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await authService.forgotPassword(values.email);
      setSubmitted(true);
      toast.success('Check your email for reset instructions.');
    } catch {
      toast.error('Unable to process request. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success-muted)] mx-auto mb-4">
          <Mail className="h-6 w-6 text-[var(--color-success)]" />
        </div>
        <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">Check your email</h2>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          If an account exists for that address, we sent a link to reset your password.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 mt-6 text-sm text-[var(--color-primary)] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">Forgot password</h2>
        <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)]">
          Enter your account email and we will send you a link to set a new password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-[var(--color-muted-foreground)]">
        <Link to="/login" className="text-[var(--color-primary)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
};
