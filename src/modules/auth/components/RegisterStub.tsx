import React from 'react';
import { useAuthFlow } from '../store/AuthFlowContext';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const RegisterStub = () => {
  const { email, resetFlow } = useAuthFlow();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      className="space-y-6 text-center"
    >
      <button onClick={resetFlow} className="text-muted hover:text-white flex items-center text-sm mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>
      
      <h2 className="text-2xl font-bold text-white">Create a new account</h2>
      <p className="text-muted">It looks like <b>{email}</b> is not registered yet.</p>
      
      <div className="p-4 bg-zinc-900 rounded-lg border border-dashed border-zinc-700">
        <p className="text-sm text-zinc-400">
          (This is where the multi-step signup form will be placed: name, date of birth, avatar...)
        </p>
      </div>

      <Button onClick={() => alert('Signup flow will be implemented next!')}>
        Start profile setup
      </Button>
    </motion.div>
  );
};