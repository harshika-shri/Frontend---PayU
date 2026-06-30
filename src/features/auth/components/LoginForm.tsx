import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { normalizeRole } from '../constants/userRole';
import { getHomeRouteForRole } from '../utils/getHomeRoute';
import type { DecodedToken } from '../types/auth.types';
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
      const token = Cookies.get('access_token');

      if (token) {
        const decoded = jwtDecode<DecodedToken>(token);
        navigate(getHomeRouteForRole(normalizeRole(decoded.role)), { replace: true });
        return;
      }

      navigate('/dashboard', { replace: true });
    } catch {
      toast.error('Invalid credentials. Please try again.');
    }
  };

  return (
    <div>
      <div className="mb-7 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Sign in to your account
        </p>
      </div>

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
