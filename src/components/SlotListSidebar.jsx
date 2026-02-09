import React from 'react';
import { Clock, Calendar, Video, Trash2, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SlotListSidebar({ slots, onDeleteSlot }) {
    // Group slots by day for cleaner display
    const slotsByDay = {};
    slots.forEach(slot => {
        if (!slotsByDay[slot.day_of_week]) slotsByDay[slot.day_of_week] = [];
        slotsByDay[slot.day_of_week].push(slot);
    });


    // Sort days starting from today (or just 0-6)
    const sortedDays = Object.keys(slotsByDay).sort((a, b) => parseInt(a) - parseInt(b));

    return (
        <div className="h-full flex flex-col bg-white border-l border-slate-200 w-80 shrink-0">

            {/* Available Slots List */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 sticky top-0 bg-white z-10 py-2">
                    Active Slots ({slots.length})
                </h3>

                {slots.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-sm text-slate-400">No availability set</p>
                        <p className="text-xs text-slate-400 mt-1">Click "+ Add" to start</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedDays.map(dayIndex => (
                            <div key={dayIndex}>
                                <h4 className="text-xs font-bold text-slate-400 mb-2 ml-1">{DAYS[dayIndex]}</h4>
                                <div className="space-y-2">
                                    {slotsByDay[dayIndex]
                                        .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                        .map(slot => (
                                            <div key={slot.id} className="group flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg hover:border-brand-300 hover:shadow-sm transition-all">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-8 bg-green-400 rounded-full"></div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-700">
                                                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Weekly</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onDeleteSlot(slot.id)}
                                                    className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Delete Slot"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
