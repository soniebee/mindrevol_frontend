import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Eye, EyeOff, Lock, KeyRound, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePasswordForm } from '../hooks/usePasswordForm';

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Helper to build initials from full name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
};

export const PasswordForm = () => {
  const {
    form, email, userInfo, isLoading, error,
    forgotStatus, showPassword, toggleShowPassword,
    onSubmit, handleBack, handleSwitchToOtp, handleForgotPassword,
  } = usePasswordForm();
  const shouldReduceMotion = useReducedMotion();
  const { register, formState: { errors } } = form;

  const stage = (delay = 0) => (
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.24, delay, ease: EASE_OUT },
        }
  );

  return (
    <div className="flex flex-col space-y-6">

      {/* ── Back button ── */}
      <motion.div {...stage()}>
        <button
          type="button"
          onClick={handleBack}
          className="group -ml-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>
      </motion.div>

      {/* ── User card ── */}
      <motion.div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5" {...stage(0.04)}>
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {userInfo?.avatarUrl ? (
            <img
              src={userInfo.avatarUrl}
              alt={userInfo.fullname}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white ring-2 ring-white shadow-sm">
              {userInfo?.fullname ? getInitials(userInfo.fullname) : '?'}
            </div>
          )}
          {/* Online dot */}
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {userInfo?.fullname || 'Hello!'}
          </p>
          <p className="truncate text-xs text-slate-500">{email}</p>
        </div>

        {/* Auth provider badge (for social account) */}
        {userInfo?.authProvider && userInfo.authProvider !== 'EMAIL' && (
          <span className="flex-shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600 border border-blue-100">
            {userInfo.authProvider}
          </span>
        )}
      </motion.div>

      {/* ── Form ── */}
      <motion.form onSubmit={onSubmit} className="space-y-4" {...stage(0.08)}>
        {/* Password field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">Password</label>
          <div className="relative group">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoFocus
              disabled={isLoading}
              error={errors.password?.message}
              className="h-12 rounded-xl border-slate-200 bg-white pl-11 pr-12 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 shadow-none"
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              tabIndex={-1}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Error message */}
        <AnimatePresence initial={false}>
          {error && (
            <motion.div
              key="login-error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600"
            >
              <span>⚠️</span>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <Button
          type="submit"
          isLoading={isLoading}
          className="group h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-semibold text-white transition-all duration-300 hover:from-blue-500 hover:to-indigo-500 hover:shadow-[0_8px_24px_rgba(37,99,235,0.3)] active:scale-[0.98]"
        >
          <KeyRound className="mr-2 h-4 w-4" />
          Sign in
        </Button>
      </motion.form>

      {/* ── Forgot password ── */}
      <motion.div className="text-center" {...stage(0.12)}>
        <AnimatePresence mode="wait">
          {forgotStatus === 'sent' ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              Password reset link sent!
            </motion.div>
          ) : (
            <motion.button
              key="link"
              type="button"
              onClick={handleForgotPassword}
              disabled={forgotStatus === 'loading'}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {forgotStatus === 'loading' && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              Forgot password?
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Divider ── */}
      <motion.div className="relative" {...stage(0.16)}>
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-medium text-slate-400">or</span>
        </div>
      </motion.div>

      {/* ── OTP switch ── */}
      <motion.div
        {...stage(0.2)}
        whileHover={shouldReduceMotion ? undefined : { y: -1, scale: 1.01 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      >
        <Button
          type="button"
          variant="outline"
          onClick={handleSwitchToOtp}
          disabled={isLoading}
          className="h-12 w-full rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
        >
          <MessageSquare className="mr-2 h-4 w-4 text-slate-500" />
          Sign in with OTP code
        </Button>
      </motion.div>

    </div>
  );
};
