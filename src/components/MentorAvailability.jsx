import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { getMentorId, fetchAvailability, deleteAvailabilitySlot, fetchSessionStats, fetchUpcomingSessions } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, Plus, Calendar as CalendarIcon, LogOut } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid/index.js';
import timeGridPlugin from '@fullcalendar/timegrid/index.js';
import interactionPlugin from '@fullcalendar/interaction/index.js';
import SlotListSidebar from './SlotListSidebar';
import AddSlotModal from './AddSlotModal';
import SessionAnalytics from './SessionAnalytics';
import UpcomingSessions from './UpcomingSessions';

export default function MentorAvailability() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [mentorId, setMentorId] = useState(null);
    const [slots, setSlots] = useState([]);
    const [sessionStats, setSessionStats] = useState(null);
    const [upcomingSessions, setUpcomingSessions] = useState([]);

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('timeGridWeek'); // 'timeGridWeek' | 'dayGridMonth'

    const navigate = useNavigate();

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/mentor-login', { replace: true });
        }
    }, [user, authLoading, navigate]);

    // Load data when user is available
    useEffect(() => {
        if (!user) return;

        const init = async () => {
            try {
                const mId = await getMentorId(user.id);
                setMentorId(mId);
                await loadSlots(mId);
                loadStats(mId);
                loadUpcomingSessions(mId);

                // Real-time listener for availability slots
                const availabilityChannel = supabase
                    .channel('availability_changes')
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'availability_slots', filter: `mentor_id=eq.${mId}` },
                        () => loadSlots(mId)
                    )
                    .subscribe();

                // Real-time listener for sessions
                const sessionsChannel = supabase
                    .channel('sessions_changes')
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'sessions', filter: `mentor_id=eq.${mId}` },
                        () => {
                            loadUpcomingSessions(mId);
                            loadStats(mId);
                        }
                    )
                    .subscribe();

                return () => {
                    supabase.removeChannel(availabilityChannel);
                    supabase.removeChannel(sessionsChannel);
                };
            } catch (err) {
                console.error("Failed to load mentor profile:", err);
                toast.error(`Could not load availability: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [user]);

    const loadSlots = async (mId) => {
        const data = await fetchAvailability(mId);
        setSlots(data);
    };

    const loadStats = async (mId) => {
        const stats = await fetchSessionStats(mId);
        setSessionStats(stats);
    };

    const loadUpcomingSessions = async (mId) => {
        const sessions = await fetchUpcomingSessions(mId);
        setUpcomingSessions(sessions);
    };

    const handleDeleteSlot = async (id) => {
        if (!confirm("Are you sure you want to delete this slot?")) return;
        try {
            await deleteAvailabilitySlot(id);
            toast.success("Slot removed");
            loadSlots(mentorId); // Optimistic update or wait for reload
        } catch (err) {
            toast.error("Failed to delete slot");
        }
    };

    // Transform slots for FullCalendar
    const events = slots.map(slot => ({
        id: slot.id,
        daysOfWeek: [slot.day_of_week], // 0-6 matches FullCalendar
        startTime: slot.start_time,
        endTime: slot.end_time,
        display: 'block',
        color: '#10b981', // Green for available
        title: 'Available'
    }));

    const handleEventClick = (info) => {
        handleDeleteSlot(info.event.id);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin w-8 h-8 text-brand-600" />
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">

            {/* Scale: Upcoming Sessions (Left) */}
            <UpcomingSessions sessions={upcomingSessions} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">

                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <CalendarIcon className="w-6 h-6 text-brand-600" /> Availability Dashboard
                        </h1>
                        <p className="text-sm text-slate-500">Manage your weekly schedule</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-5 h-5" /> Add Availability
                        </button>
                    </div>
                </header>

                {/* Calendar Wrapper */}
                <div className="flex-1 p-6 overflow-hidden flex flex-col">

                    {/* Session Analytics Cards */}
                    <SessionAnalytics stats={sessionStats} loading={!sessionStats} />

                    {/* Main Content Row: Calendar + Right Panel */}
                    <div className="flex-1 flex overflow-hidden gap-6">

                        {/* Calendar shrinks to fill available space */}
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 h-full p-4 overflow-y-auto custom-scrollbar">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="timeGridWeek"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'timeGridWeek,timeGridDay'
                                }}
                                events={events}
                                eventClick={handleEventClick}
                                eventContent={(eventInfo) => (
                                    <div className="p-1 text-xs">
                                        <div className="font-bold">{eventInfo.timeText}</div>
                                        <div>Available</div>
                                    </div>
                                )}
                                slotMinTime="06:00:00"
                                slotMaxTime="22:00:00"
                                allDaySlot={false}
                                height="100%"
                                expandRows={true}
                                stickyHeaderDates={true}
                            />
                        </div>

                        {/* Sidebar: Active Slots (Right) */}
                        <div className="h-full">
                            <SlotListSidebar
                                slots={slots}
                                onDeleteSlot={handleDeleteSlot}
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Add Slot Modal */}
            <AddSlotModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => loadSlots(mentorId)}
                mentorId={mentorId}
            />

        </div>
    );
}
