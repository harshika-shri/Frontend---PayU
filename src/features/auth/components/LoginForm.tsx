import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.username, values.password);
      navigate('/dashboard', { replace: true });
    } catch {
      toast.error('Invalid credentials. Please try again.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[var(--color-primary)]">
            <span className="text-xs font-bold text-white">P</span>
          </div>
          <span className="text-sm font-semibold text-[var(--color-foreground)] tracking-tight">PayU Finance</span>
        </div>
        <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">Sign in</h2>
        <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)]">
          Enter your credentials to access the system
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Username"
          placeholder="Enter your username"
          autoComplete="username"
          error={errors.username?.message}
          {...register('username')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
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
          {...register('password')}
        />

        <Button
          type="submit"
          className="w-full mt-2"
          loading={isSubmitting}
          leftIcon={<LogIn className="h-4 w-4" />}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
        <Link to="/forgot-password" className="text-[var(--color-primary)] hover:underline">
          Forgot password?
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-[var(--color-muted-foreground)]">
        Contact your administrator to create an account.
      </p>
    </div>
  );
};
