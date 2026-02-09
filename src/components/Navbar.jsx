import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import logo from '../assets/logo.png';
import { User, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
    const { user, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show login button if we're already on the login page
    const isOnLoginPage = location.pathname === '/mentor-login';

    const handleLogout = async () => {
        try {
            await signOut();
            toast.success('Logged out successfully');
            navigate('/');
        } catch (error) {
            toast.error('Error logging out');
        }
        setIsMenuOpen(false);
    };

    return (
        <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/">
                    <img src={logo} alt="UnchaAI" className="h-12 w-auto" />
                </Link>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 p-1 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold overflow-hidden">
                                    {user.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6" />
                                    )}
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
                                    <div className="px-4 py-2 border-b border-slate-50">
                                        <p className="text-sm font-semibold text-slate-800 truncate">
                                            {user.user_metadata?.full_name || 'Mentor'}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                    </div>



                                    <Link
                                        to="/mentor-profile"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        Edit Profile
                                    </Link>

                                    <div className="border-t border-slate-50 my-1"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : !isOnLoginPage && (
                        <Link
                            to="/mentor-login"
                            className="bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-lg hover:shadow-brand-500/30"
                        >
                            Mentor Login
                        </Link>
                    )}
                </div>
            </div>

            {/* Overlay to close menu when clicking outside */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </nav>
    );
}
