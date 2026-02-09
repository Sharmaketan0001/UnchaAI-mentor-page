import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate } from 'react-router-dom';
import { isConfigured } from './lib/supabaseClient';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import MentorForm from './components/MentorForm';
import MentorLogin from './components/MentorLogin';
import MentorAvailability from './components/MentorAvailability';
import MentorProfile from './components/MentorProfile';

// Landing Page incorporating existing Hero, Benefits, Form
const LandingPage = () => (
  <main>
    <Hero />
    <Benefits />
    <div className="bg-white py-16" id="mentor-form">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Form</h2>
          <p className="text-slate-600">Fill in your details to get started.</p>
        </div>
        <MentorForm />
      </div>
    </div>
  </main>
);

function App() {
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-red-100">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Configuration Required</h2>
          <p className="text-slate-600 mb-6">
            Supabase credentials are missing. Please create a <code className="bg-slate-100 px-2 py-1 rounded">.env</code> file in the project root with the following variables:
          </p>
          <div className="bg-slate-900 text-slate-200 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-6">
            <div>VITE_SUPABASE_URL=...</div>
            <div>VITE_SUPABASE_ANON_KEY=...</div>
          </div>
          <p className="text-sm text-slate-500">
            Restart the development server after creating the file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Toaster position="top-center" />

      {/* Dynamic Navbar */}
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/mentor-login" element={<MentorLogin />} />
        <Route path="/mentor-availability" element={<MentorAvailability />} />
        <Route path="/mentor-profile" element={<MentorProfile />} />
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <footer className="bg-brand-900 text-brand-100 py-12 px-6 text-center">
        <p>&copy; {new Date().getFullYear()} UnchaAI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
