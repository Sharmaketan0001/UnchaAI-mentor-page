import React from 'react';
import { ArrowDown } from 'lucide-react';

export default function Hero() {
    const scrollToForm = () => {
        document.getElementById('mentor-form').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative bg-brand-500 text-white py-24 px-6 md:px-12 overflow-hidden">
            {/* Background Blobs - lighter orange for subtle effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-brand-400 blur-3xl opacity-50"></div>
                <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-brand-600 blur-3xl opacity-50"></div>
            </div>

            <div className="relative max-w-4xl mx-auto text-center z-10">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-white tracking-tight drop-shadow-sm">
                    Become a Mentor at UnchaAI
                </h1>
                <p className="text-xl md:text-2xl text-brand-50 mb-10 max-w-2xl mx-auto font-light">
                    Teach IIT-JEE & NEET students and earn by sharing your knowledge. Join our comprehensive mentoring platform.
                </p>

                <button
                    onClick={scrollToForm}
                    className="group bg-white text-brand-600 font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:bg-brand-50 hover:scale-105 flex items-center mx-auto gap-2"
                >
                    Apply Now
                    <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </button>
            </div>
        </section>
    );
}
