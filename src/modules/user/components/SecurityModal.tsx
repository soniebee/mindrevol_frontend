import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, Mail, KeyRound, ArrowRight, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { userService } from '../services/user.service';
import { BlockedUsersModal } from './BlockedUsersModal';
import { toast } from 'react-hot-toast'; 

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  
  // Main view state
  const [view, setView] = useState<'MENU' | 'PASSWORD' | 'BLOCK'>('MENU');
  
  // OTP flow state in the PASSWORD view
  const [otpStep, setOtpStep] = useState<'INIT' | 'VERIFY'>('INIT');
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Reset state when closing or switching tabs
  const resetForm = () => {
    setOtpStep('INIT');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setIsLoading(false);
  };

  // --- SEND OTP FLOW ---
  const handleSendOtp = async () => {
    if (!user?.email) return toast.error("User email not found");
    
    setIsLoading(true);
    try {
      await userService.sendOtp(user.email);
      toast.success(`Verification code has been sent to ${user.email}`);
      setOtpStep('VERIFY');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send the code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- PASSWORD UPDATE FLOW ---
  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
        return toast.error("Confirmation password does not match");
    }
    if (newPassword.length < 6) {
        return toast.error("Password must be at least 6 characters long");
    }
    if (otp.length < 6) {
        return toast.error("Please enter the 6-digit OTP code");
    }

    setIsLoading(true);
    try {
        await userService.updatePasswordWithOtp({ 
            otp, 
            newPassword 
        });
        toast.success("Password updated successfully!");
        resetForm();
        setView('MENU'); // Return to the menu after success
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Update failed. Please check the OTP code again.");
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
             {view !== 'MENU' && (
                <button 
                    onClick={() => {
                        if (view === 'PASSWORD' && otpStep === 'VERIFY') {
                            setOtpStep('INIT'); // Nếu đang ở bước Verify thì back về Init
                        } else {
                            setView('MENU'); // Nếu không thì về Menu chính
                            resetForm();
                        }
                    }} 
                    className="text-zinc-400 hover:text-white"
                >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
             )}
             <h2 className="text-lg font-bold text-white flex items-center gap-2">
                 {view === 'PASSWORD' ? "Password management" : (view === 'BLOCK' ? "Blocked users" : "Security")}
             </h2>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-zinc-400" /></button>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar">
            
            {/* --- MAIN MENU VIEW --- */}
            {view === 'MENU' && (
                <div className="space-y-2">
                    <button 
                        onClick={() => setView('PASSWORD')}
                        className="w-full flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors text-left group"
                    >
                        <div className="flex items-center gap-3">
                            <KeyRound className="w-5 h-5 text-blue-400" />
                            <div>
                                <div className="font-bold text-white">Password</div>
                                <div className="text-xs text-zinc-500 group-hover:text-zinc-400">
                                    Set up or change your login password
                                </div>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600" />
                    </button>

                    <button 
                        onClick={() => setView('BLOCK')}
                        className="w-full flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors text-left group"
                    >
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="w-5 h-5 text-red-400" />
                            <div>
                                <div className="font-bold text-white">Blocked users</div>
                                <div className="text-xs text-zinc-500 group-hover:text-zinc-400">
                                    Manage the users you have blocked
                                </div>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600" />
                    </button>
                </div>
            )}

            {/* --- VIEW: PASSWORD (Logic OTP) --- */}
            {view === 'PASSWORD' && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                    {otpStep === 'INIT' ? (
                        // STEP 1: Send OTP
                        <div className="text-center space-y-6 py-4">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-8 h-8 text-blue-500" />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">Security verification</h3>
                                <p className="text-zinc-400 text-sm px-4">
                                    To keep your account safe, we need to send a verification code to your email before changing the password.
                                </p>
                            </div>

                            <div className="bg-zinc-900 p-4 rounded-xl flex items-center gap-3 border border-white/5 mx-2">
                                <div className="p-2 bg-zinc-800 rounded-lg shrink-0">
                                    <Mail className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div className="text-left overflow-hidden min-w-0">
                                    <div className="text-xs text-zinc-500">Code delivery email</div>
                                    <div className="text-sm font-medium text-white truncate" title={user?.email}>
                                        {user?.email}
                                    </div>
                                </div>
                            </div>

                            <Button 
                                onClick={handleSendOtp} 
                                isLoading={isLoading}
                                className="w-full h-11 font-bold text-base mt-4"
                            >
                                Send verification code
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    ) : (
                        // STEP 2: Enter OTP and new password
                        <div className="space-y-5">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-white">Set a new password</h3>
                                <p className="text-xs text-zinc-500">
                                    Enter the OTP code sent to your email
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400 ml-1">Verification code (OTP)</label>
                                <Input 
                                    value={otp} 
                                    onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0,6))}
                                    className="bg-zinc-900 text-center text-lg tracking-[0.5em] font-mono border-zinc-700 focus:border-blue-500 h-12" 
                                    placeholder="000000"
                                    autoFocus
                                />
                            </div>

                            <div className="grid gap-4 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400 ml-1">New password</label>
                                    <Input 
                                        type="password" 
                                        value={newPassword} 
                                        onChange={e => setNewPassword(e.target.value)} 
                                        className="bg-zinc-900 border-zinc-700 focus:border-blue-500"
                                        placeholder="Enter new password..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400 ml-1">Confirm password</label>
                                    <Input 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={e => setConfirmPassword(e.target.value)} 
                                        className="bg-zinc-900 border-zinc-700 focus:border-blue-500"
                                        placeholder="Re-enter password..."
                                    />
                                </div>
                            </div>

                            <Button 
                                onClick={handleSubmit} 
                                isLoading={isLoading} 
                                disabled={!otp || !newPassword || !confirmPassword}
                                className="w-full h-11 font-bold mt-4"
                            >
                                Save changes
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* --- VIEW: BLOCK LIST --- */}
            {view === 'BLOCK' && (
                <BlockedUsersModal />
            )}
        </div>
      </div>
    </div>,
    document.body
  );
};