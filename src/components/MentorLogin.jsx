
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { checkMentorExistence, claimMentorProfile } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function MentorLogin() {
    const { user, loading: authLoading } = useAuth();
    const [step, setStep] = useState('phone'); // 'phone' | 'otp'
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            navigate('/mentor-availability', { replace: true });
        }
    }, [user, authLoading, navigate]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone: phone,
            });
            if (error) throw error;
            setStep('otp');
            toast.success("OTP Sent!");
        } catch (err) {
            if (err.message && (err.message.includes("Too many attempts") || err.status === 429)) {
                toast.error("Too many attempts. Please wait 60s or use a Test Phone Number.");
            } else {
                toast.error(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone: phone,
                token: otp,
                type: 'sms',
            });
            if (error) throw error;

            if (data.user) {
                // Check if mentor profile exists
                const isMentor = await checkMentorExistence(data.user.id);
                if (isMentor) {
                    toast.success("Login Successful!");
                    navigate('/mentor-availability');
                } else {
                    // Start Claim Process: Check if phone matches any unlinked (or even linked) mentor
                    const claimed = await claimMentorProfile(phone, data.user.id);
                    if (claimed) {
                        toast.success("Profile Linked! Logging in...");
                        navigate('/mentor-availability');
                    } else {
                        // Fallback: If verifying OTP worked but no profile, CREATE ONE.
                        // Ideally we should prompt user, but to unblock them we auto-create.
                        try {
                            await import('../lib/api').then(m => m.createMentorProfile(data.user.id, phone, data.user.email));
                            toast.success("Profile Created! Logging in...");
                            navigate('/mentor-availability');
                        } catch (createErr) {
                            console.error("Auto-create failed:", createErr);
                            toast.error("Could not create profile. Please contact support.");
                            await supabase.auth.signOut();
                        }
                    }
                }
            }
        } catch (err) {
            toast.error(err.message || "Verification Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-brand-600 p-6 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Mentor Login</h2>
                    <p className="text-brand-100 text-sm">Access your dashboard & availability</p>
                </div>

                <div className="p-8">
                    {step === 'phone' ? (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+91 98765 43210"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none pl-12"
                                    />
                                    <span className="absolute left-4 top-3.5 text-slate-400">📞</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Enter phone number with country code (e.g. +91)</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send OTP <ArrowRight className="w-5 h-5" /></>}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <ShieldCheck className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="text-slate-600">Enter the 6-digit code sent to <br /><span className="font-semibold text-slate-900">{phone}</span></p>
                            </div>

                            <div>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                    className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Login"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('phone')}
                                className="w-full text-slate-500 text-sm hover:text-slate-700"
                            >
                                Change Phone Number
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
