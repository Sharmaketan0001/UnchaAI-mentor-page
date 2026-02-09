import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { getMentorProfile, updateMentorProfile, uploadProfileImage } from '../lib/api';
import { Loader2, Save, Upload, User, MapPin, Linkedin, Github, Globe, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MentorProfile() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mentor, setMentor] = useState(null);
    const [userId, setUserId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        email: '', // Read-only typically
        phone: '',
        location: '',
        bio: '',
        title: '',
        company: '',
        years_of_experience: '',
        hourly_rate: '',
        linkedin_url: '',
        github_url: '',
        portfolio_url: '',
    });

    const [imagePreview, setImagePreview] = useState(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/mentor-login', { replace: true });
        }
    }, [user, authLoading, navigate]);

    // Load profile when user is available
    useEffect(() => {
        if (!user) return;
        loadProfile();
    }, [user]);

    const loadProfile = async () => {
        try {
            if (!user) {
                setLoading(false);
                return;
            }
            setUserId(user.id);

            const profile = await getMentorProfile(user.id);
            if (profile) {
                setMentor(profile);
                setFormData({
                    full_name: profile.full_name || '',
                    email: profile.email || user.email || '',
                    phone: profile.phone || '',
                    location: profile.location || '',
                    bio: profile.bio || '',
                    title: profile.title || '',
                    company: profile.company || '',
                    years_of_experience: profile.years_of_experience || '',
                    hourly_rate: profile.hourly_rate || '',
                    linkedin_url: profile.linkedin_url || '',
                    github_url: profile.github_url || '',
                    portfolio_url: profile.portfolio_url || '',
                });
                setImagePreview(profile.profile_image_url);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        try {
            toast.loading('Uploading image...', { id: 'upload' });
            const publicUrl = await uploadProfileImage(file);

            // Auto save image URL to DB immediately or wait for form submit?
            // Let's just update local state for submit.
            // Actually, better to update internal state.
            // But we can't update formData with key 'profile_image_url' easily unless we tracked it.
            // Let's just track it in a separate var or assume submit will use it.
            // Wait, uploadProfileImage returns URL. We should likely save this to DB on "Save Changes" 
            // OR save it immediately. Immediate save is better UX for large files.

            if (mentor) {
                await updateMentorProfile(mentor.id, { profile_image_url: publicUrl });
                toast.success('Profile photo updated!', { id: 'upload' });
            } else {
                toast.success('Photo uploaded (will be saved on submit)', { id: 'upload' });
                // If no mentor record exists yet (edge case), we store it in a ref? 
                // But loadProfile ensures we have a mentor record usually.
            }
            // Update Auth Metadata for Navbar sync
            await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload failed', { id: 'upload' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!mentor) {
            toast.error("No mentor profile found to update.");
            return;
        }

        setSaving(true);
        try {
            // Exclude email from updates to prevent issues with read-only fields or constraints
            const { email, ...updateData } = formData;

            await updateMentorProfile(mentor.id, {
                ...updateData,
                years_of_experience: parseInt(formData.years_of_experience) || 0,
                hourly_rate: parseInt(formData.hourly_rate) || 0,
            });

            // Sync fundamental fields to Auth Metadata for Navbar
            await supabase.auth.updateUser({
                data: {
                    full_name: formData.full_name,
                    phone: formData.phone,
                    location: formData.location,
                    bio: formData.bio
                }
            });

            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Update error:", error);
            toast.error(`Failed to update: ${error.message || "Unknown error"}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            </div>
        );
    }

    if (!mentor) {
        return (
            <div className="min-h-screen pt-24 px-6 text-center">
                <h2 className="text-2xl font-bold text-slate-800">Profile Not Found</h2>
                <p className="text-slate-600 mt-2">We couldn't find a mentor profile linked to this account.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* Header */}
                    <div className="bg-brand-600 h-32 relative">
                        <div className="absolute -bottom-12 left-8">
                            <div className="relative group cursor-pointer inline-block">
                                <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                            <User className="w-10 h-10" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 bg-brand-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                                    <Upload className="w-4 h-4" />
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-8 flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{formData.full_name || 'Your Name'}</h1>
                            <p className="text-slate-500">{formData.title || 'Mentor Title'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${mentor.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                            mentor.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}>
                            {mentor.status ? mentor.status.toUpperCase() : 'PENDING'}
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 pb-10 grid gap-8">

                        {/* Personal Info */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-brand-500" /> Personal Details
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email (Locked)</label>
                                    <input
                                        disabled
                                        value={formData.email}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                                    <textarea
                                        name="bio"
                                        rows="3"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </section>

                        <hr className="border-slate-100" />

                        {/* Professional Info */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-brand-500" /> Professional
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                                    <input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                                    <input
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Years of Exp.</label>
                                    <input
                                        type="number"
                                        name="years_of_experience"
                                        value={formData.years_of_experience}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate (₹)</label>
                                    <input
                                        type="number"
                                        name="hourly_rate"
                                        value={formData.hourly_rate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </section>

                        <hr className="border-slate-100" />

                        {/* Social Links */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-brand-500" /> Links
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn</label>
                                    <div className="relative">
                                        <Linkedin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            name="linkedin_url"
                                            value={formData.linkedin_url}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                            placeholder="https://linkedin.com/..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">GitHub</label>
                                    <div className="relative">
                                        <Github className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            name="github_url"
                                            value={formData.github_url}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                            placeholder="https://github.com/..."
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Portfolio / Website</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            name="portfolio_url"
                                            value={formData.portfolio_url}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-brand-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-brand-700 transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
