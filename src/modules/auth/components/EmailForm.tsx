import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEmailForm } from '../hooks/useEmailForm';
import { Mail, ArrowRight } from 'lucide-react';

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const EmailForm = () => {
  const { form, isLoading, error, onSubmit, social } = useEmailForm();
  const shouldReduceMotion = useReducedMotion();
  const { register, formState: { errors } } = form;
  const emailError = errors.email?.message;

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
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div className="space-y-2" {...stage()}>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sign in or create an account</h1>
        <p className="text-sm text-slate-500">Join millions of people building better daily habits.</p>
      </motion.div>

      {/* ── Email Field ── */}
      <motion.form onSubmit={onSubmit} className="space-y-4" {...stage(0.04)}>
        <div className="space-y-2">
          <div className="relative group">
            <Mail className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
            <Input
              {...register('email')}
              placeholder="you@example.com"
              autoFocus
              aria-invalid={Boolean(emailError)}
              disabled={isLoading}
              className="h-12 rounded-xl border-slate-200 bg-white pl-12 text-base placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
            />
          </div>
          {emailError && <p className="ml-1 text-xs font-medium text-red-500">{emailError}</p>}
        </div>

        <AnimatePresence initial={false}>
          {error && (
            <motion.div
              key="email-error"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600"
            >
              <span>⚠️</span>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          isLoading={isLoading}
          className="group h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-semibold text-white transition-all duration-300 hover:from-blue-500 hover:to-indigo-500 hover:shadow-[0_10px_30px_rgba(37,99,235,0.3)] active:scale-95"
        >
          <span className="flex items-center justify-center gap-2">
            Continue
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </span>
        </Button>
      </motion.form>

      {/* ── Divider ── */}
      <motion.div className="relative" {...stage(0.08)}>
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-medium text-slate-400">
            or continue with
          </span>
        </div>
      </motion.div>

      {/* ── Social Buttons ── */}
      <motion.div className="grid grid-cols-3 gap-3" {...stage(0.12)}>
        {[
          {
            name: 'google',
            label: 'Google',
            icon: (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            ),
            onClick: () => social.google(),
          },
          {
            name: 'facebook',
            label: 'Facebook',
            icon: (
              <svg className="h-5 w-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 22v-8h2.7l.5-3h-3.2V9.1c0-.9.3-1.5 1.5-1.5h1.8V4.9c-.3 0-1.4-.1-2.6-.1-2.6 0-4.2 1.6-4.2 4.4V11H8v3h2.5v8h3z" />
              </svg>
            ),
            onClick: social.facebook,
          },
          {
            name: 'apple',
            label: 'Apple',
            icon: (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 13.3c0-2.1 1.8-3.1 1.9-3.2-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.7.8-3.5 2-.7 1.2-1.3 3.3-.5 5.5.4 1.1 1 2.3 1.9 2.3.8 0 1.2-.5 2.3-.5 1.1 0 1.4.5 2.3.5.9 0 1.5-1.1 1.9-2.2.5-1.3.7-2.5.7-2.7-.1 0-1.9-.7-1.9-2.9zm-2.1-6.1c.3-.4.6-1.1.5-1.7-.5 0-1.2.3-1.6.7-.3.4-.6 1-.5 1.6.6.1 1.3-.2 1.6-.6z" />
              </svg>
            ),
            onClick: social.apple,
          },
        ].map((btn) => (
          <motion.div
            key={btn.name}
            whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
          >
            <Button
              variant="outline"
              type="button"
              onClick={btn.onClick}
              isLoading={isLoading}
              className="h-12 w-full rounded-xl border-slate-200 bg-white p-0 hover:bg-slate-50"
              aria-label={`Continue with ${btn.label}`}
            >
              {btn.icon}
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Agreement ── */}
      <motion.p className="text-center text-xs text-slate-500" {...stage(0.16)}>
        By continuing, you agree to our{' '}
        <a href="#" className="text-blue-600 hover:underline">
          Terms
        </a>{' '}
        and{' '}
        <a href="#" className="text-blue-600 hover:underline">
          Privacy Policy
        </a>
      </motion.p>
    </div>
  );
};