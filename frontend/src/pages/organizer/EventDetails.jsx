import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axiosConfig';
import { format } from 'date-fns';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchEventData();
    }, [id]);

    const fetchEventData = async () => {
        try {
            setLoading(true);
            const [eventRes, attendeesRes] = await Promise.all([
                API.get(`/events/${id}`),
                API.get(`/events/${id}/attendees`)
            ]);
            setEvent(eventRes.data);
            setAttendees(attendeesRes.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load event details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!window.confirm(`Are you sure you want to change the event status to ${newStatus}?`)) return;

        try {
            setUpdating(true);
            const { data } = await API.put(`/events/${id}`, { status: newStatus });
            setEvent(data);
            // Optionally show a success toast here
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">{error}</div>;
    if (!event) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <button onClick={() => navigate('/organizer')} className="text-indigo-600 hover:text-indigo-800 font-medium mb-2 inline-flex items-center">
                &larr; Back to Dashboard
            </button>

            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600 rounded-full">{event.eventType}</span>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${event.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : event.status === 'Published' ? 'bg-blue-100 text-blue-800' : event.status === 'Ongoing' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            Status: {event.status}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.eventName}</h1>
                    <p className="text-gray-600 max-w-2xl">{event.description}</p>
                </div>

                {/* Status Controls */}
                <div className="mt-6 md:mt-0 flex flex-col gap-2 min-w-[200px] border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                    <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Event Actions</h3>
                    {event.status === 'Draft' && (
                        <button onClick={() => handleStatusChange('Published')} disabled={updating} className="w-full py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 font-medium transition-colors">🚀 Publish Event</button>
                    )}
                    {event.status === 'Published' && (
                        <button onClick={() => handleStatusChange('Ongoing')} disabled={updating} className="w-full py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 font-medium transition-colors">▶️ Mark as Ongoing</button>
                    )}
                    {event.status === 'Ongoing' && (
                        <button onClick={() => handleStatusChange('Completed')} disabled={updating} className="w-full py-2 bg-purple-600 text-white rounded-md shadow-sm hover:bg-purple-700 font-medium transition-colors">✅ Mark as Completed</button>
                    )}
                    {['Draft', 'Published'].includes(event.status) && (
                        <button onClick={() => handleStatusChange('Closed')} disabled={updating} className="w-full py-2 mt-2 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 font-medium transition-colors">✖️ Close / Cancel Event</button>
                    )}
                </div>
            </div>

            {/* Quick Info Grid - Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Date & Time</div>
                    <div className="font-semibold text-gray-900">{format(new Date(event.eventStartDate), 'MMM dd, yyyy')}</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Registrations / Sales</div>
                    <div className="font-semibold text-gray-900 text-2xl">{attendees.length}</div>
                    <div className="text-sm text-gray-600">{event.registrationLimit} Capacity Limit</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Eligibility Target</div>
                    <div className="font-semibold text-gray-900">{event.eligibility}</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Estimated Revenue</div>
                    <div className="font-semibold text-green-600 text-2xl">{event.fee === 0 ? 'Free Event' : `₹${event.fee * attendees.length}`}</div>
                    <div className="text-sm text-gray-600">{event.fee === 0 ? 'No entry fee' : `₹${event.fee} per person`}</div>
                </div>
            </div>

            {/* Attendees and Analytics section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Participant Management</h2>
                    <button className="px-4 py-2 border border-blue-200 text-blue-600 bg-blue-50 rounded-md font-medium text-sm">Download CSV Export</button>
                </div>

                <div className="p-12 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Participant list is locked 🔒</h3>
                    <p className="text-gray-500 max-w-md mx-auto">The detailed participant table, payment verification, and team management modules will be built in <b>Task 4</b> when we implement the user registration portal!</p>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
