import React from 'react';
import { Coins, Clock, Home, Award } from 'lucide-react';

export default function Benefits() {
    const benefits = [
        {
            icon: Coins,
            title: "Earn by Teaching",
            description: "Set your own hourly rates and earn for every session you conduct with students."
        },
        {
            icon: Clock,
            title: "Flexible Schedule",
            description: "Work on your own time. You decide when you are available to mentor."
        },
        {
            icon: Home,
            title: "Work from Home",
            description: "Connect with students from anywhere. All you need is a laptop and internet connection."
        },
        {
            icon: Award,
            title: "Impact Futures",
            description: "Guide the next generation of IIT-JEE and NEET aspirants to achieve their dreams."
        }
    ];

    return (
        <section className="py-20 px-6 bg-white">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-brand-900 mb-12">Why Mentor with UnchaAI?</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="bg-brand-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-brand-100">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 text-brand-500 shadow-sm">
                                <benefit.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-brand-900 mb-2">{benefit.title}</h3>
                            <p className="text-slate-700">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
