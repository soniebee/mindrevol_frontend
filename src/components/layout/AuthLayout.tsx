import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-white font-sans">
      {/* Left: Hero Section */}
      <div className="relative hidden w-[55%] flex-col justify-center overflow-hidden lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />

        <motion.div
          className="pointer-events-none absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-blue-400/30 blur-[100px]"
          animate={shouldReduceMotion ? undefined : {
            y: [0, 40, 0],
            x: [0, 20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-1/4 -right-32 h-96 w-96 rounded-full bg-purple-400/30 blur-[100px]"
          animate={shouldReduceMotion ? undefined : {
            y: [0, -40, 0],
            x: [0, -20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 px-10 py-10">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-8"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/15 px-4 py-2 backdrop-blur-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <span className="bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-lg font-bold text-transparent">M</span>
                </div>
                <span className="text-sm font-semibold text-white">MindRevol</span>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-tight text-white">
                Your journey to
                <br />
                self-growth
                <br />
                <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-blue-200 bg-clip-text text-transparent">
                  starts here.
                </span>
              </h1>
              <p className="max-w-md text-lg text-white/80">
                Connect with others, build better habits, and celebrate your wins every single day. Join thousands growing together.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              {[
                { icon: '✨', text: 'Track daily progress' },
                { icon: '🤝', text: 'Connect with friends' },
                { icon: '🏆', text: 'Celebrate milestones' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                  className="flex items-center gap-3 text-white/90"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-6 border-t border-white/20 pt-6">
              {[
                { num: '50K+', label: 'Active users' },
                { num: '1M+', label: 'Habits tracked' },
                { num: '4.9⭐', label: 'App rating' },
              ].map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-xl font-bold text-white">{stat.num}</p>
                  <p className="text-xs text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right: Form Section */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6 py-8 sm:px-12">
        <div className="mb-8 text-center lg:hidden">
          <h1 className="text-3xl font-bold text-slate-900">MindRevol</h1>
          <p className="mt-2 text-sm text-slate-500">Your growth platform</p>
        </div>

        <motion.section
          className="w-full max-w-[460px] rounded-3xl border border-white/40 bg-white/90 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-9"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: 20 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.section>

        <p className="mt-6 text-center text-xs text-slate-500">
          By signing up, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;

