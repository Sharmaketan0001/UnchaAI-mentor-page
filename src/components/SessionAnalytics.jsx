import React from 'react';
import { CheckCircle, Clock, Calendar } from 'lucide-react';

export default function SessionAnalytics({ stats, loading }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-slate-100 h-24 rounded-xl"></div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: 'Completed Sessions',
            count: stats?.completed || 0,
            subtitle: 'All time',
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-100',
            border: 'border-green-200'
        },
        {
            title: 'Pending Sessions',
            count: stats?.pending || 0,
            subtitle: 'Awaiting completion',
            icon: Clock,
            color: 'text-orange-600',
            bg: 'bg-orange-100',
            border: 'border-orange-200'
        },
        {
            title: 'Upcoming Sessions',
            count: stats?.upcoming || 0,
            subtitle: 'Scheduled',
            icon: Calendar,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            border: 'border-blue-200'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-start justify-between hover:shadow-md transition-shadow"
                >
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
                        <h3 className="text-3xl font-bold text-slate-900">{card.count}</h3>
                        <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${card.bg} flex items-center justify-center ${card.color}`}>
                        <card.icon className="w-6 h-6" />
                    </div>
                </div>
            ))}
        </div>
    );
}
