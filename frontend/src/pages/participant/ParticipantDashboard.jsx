import { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';


const ParticipantDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');

    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, [filterType]); // Re-fetch when type changes. (For search, we'll use a submit button)

    const fetchEvents = async (searchQuery = '') => {
        try {
            setLoading(true);
            let url = `/events?type=${filterType}`;
            if (searchQuery) url += `&search=${searchQuery}`;
            
            const { data } = await API.get(url);
            setEvents(data || []);
            setError(null);
        } catch (err) {
            setError('Failed to load events. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchEvents(searchTerm);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Discover Events</h1>
                    <p className="text-gray-600 mt-1">Find the best tech talks, workshops, and merch drops at Felicity!</p>
                </div>
                
                {/* Search & Filter Bar */}
                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearchSubmit} className="flex">
                        <input 
                            type="text" 
                            placeholder="Search events..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 border border-gray-300 rounded-l-md px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 font-medium">
                            Search
                        </button>
                    </form>
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        className="border border-gray-300 rounded-md px-4 py-2 bg-white text-gray-700 focus:ring-indigo-500"
                    >
                        <option value="All">All Types</option>
                        <option value="Normal">Events & Workshops</option>
                        <option value="Merchandise">Merchandise Drops</option>
                    </select>
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-6">{error}</div>}

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-4xl mb-3">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900">No events found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <div key={event._id} className="bg-white border text-left border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col group cursor-pointer hover:-translate-y-1">
                            <div className={`h-2 w-full ${event.eventType === 'Merchandise' ? 'bg-purple-500' : 'bg-indigo-500'}`}></div>
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2 py-1 text-xs font-bold rounded text-white ${event.eventType === 'Merchandise' ? 'bg-purple-500' : 'bg-indigo-500'}`}>
                                        {event.eventType}
                                    </span>
                                    <span className="text-xs font-bold text-gray-400 border border-gray-200 px-2 py-1 rounded">
                                        {event.status}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1" title={event.eventName}>{event.eventName}</h3>
                                <p className="text-sm font-medium text-gray-500 mb-3 block">by {event.organizer?.organizerName || 'Unknown Club'}</p>
                                
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">{event.description}</p>
                                
                                <div className="space-y-2 text-sm text-gray-700 font-medium">
                                    <div className="flex items-center gap-2">
                                        📅 {format(new Date(event.eventStartDate), 'MMM dd, yyyy · h:mm a')}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        🎟️ {event.fee === 0 ? <span className="text-green-600">Free Entry</span> : `₹${event.fee}`}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 flex justify-between items-center mt-auto group-hover:bg-indigo-50 transition-colors">
                                <span className="text-xs text-gray-500 font-medium">Eligibility: {event.eligibility}</span>
                                {/* This button will be fully wired up in Task 4.3 */}
                                <button className="text-sm font-bold text-indigo-600 group-hover:text-indigo-800" onClick={() => navigate(`/participant/events/${event._id}`)}>
                                    View Details →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ParticipantDashboard;
