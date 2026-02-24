import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import API from '../../api/axiosConfig';
import useAuthStore from '../../store/authStore';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const OrganizerDashboard = () => {
    const { userInfo, logout } = useAuthStore();
    const [activeTab, setActiveTab] = useState('events'); // 'profile' | 'events' | 'overview'

    // --- Profile State ---
    const [profile, setProfile] = useState({
        organizerName: '',
        category: '',
        description: '',
        contactEmail: '',
        discordWebhook: '',
        password: ''
    });
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // --- Events State ---
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [eventsError, setEventsError] = useState(null);

    // Initial Load
    useEffect(() => {
        fetchProfile();
        fetchEvents();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await API.get('/organizers/profile');
            setProfile({
                organizerName: data.organizerName || '',
                category: data.category || '',
                description: data.description || '',
                contactEmail: data.contactEmail || '',
                discordWebhook: data.discordWebhook || '',
                password: ''
            });
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Failed to load profile');
        }
    };

    const fetchEvents = async () => {
        try {
            const { data } = await API.get('/events/organizer');
            setEvents(data);
        } catch (err) {
            setEventsError(err.response?.data?.message || 'Failed to fetch events');
        } finally {
            setLoadingEvents(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setUpdatingProfile(true);
            setProfileError('');

            const updateData = { ...profile };
            if (!updateData.password) {
                delete updateData.password;
            }

            await API.put('/organizers/profile', updateData);
            setSuccessMsg('Profile updated successfully!');
            setProfile(prev => ({ ...prev, password: '' }));

            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setUpdatingProfile(false);
        }
    };

    // Helper function to group events by status
    const filterEventsByStatus = (statusList) => {
        return events.filter(event => statusList.includes(event.status));
    };

    const draftEvents = filterEventsByStatus(['Draft']);
    const activeEvents = filterEventsByStatus(['Published', 'Ongoing']);
    const pastEvents = filterEventsByStatus(['Completed', 'Closed']);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your club profile, events, and track attendees.</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-4">
                    <span className="text-indigo-600 font-medium hidden sm:inline">{userInfo?.name}</span>
                    <NavLink
                        to="/organizer/events/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        + Create New Event
                    </NavLink>
                    <button onClick={logout} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors text-sm font-medium">
                        Logout
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`${activeTab === 'events' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        My Events ({events.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Analytics Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`${activeTab === 'profile' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Club Settings
                    </button>
                </nav>
            </div>

            {/* TAB: PROFILE SETTINGS */}
            {activeTab === 'profile' && (
                <div className="bg-white shadow-sm rounded-lg border border-gray-100 p-6 md:p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Club Information & Settings</h2>

                    {profileError && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{profileError}</div>}
                    {successMsg && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">{successMsg}</div>}

                    <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-3xl">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Club/Organizer Name</label>
                                <input
                                    type="text"
                                    value={profile.organizerName}
                                    onChange={(e) => setProfile({ ...profile, organizerName: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-500"
                                    disabled
                                    title="Contact Admin to change Organizer Name"
                                />
                                <p className="mt-1 text-xs text-gray-400">Name can only be changed by an Admin.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                                <input
                                    type="email"
                                    required
                                    value={profile.contactEmail}
                                    onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-500"
                                    disabled
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={profile.category}
                                onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-500"
                                disabled
                            >
                                <option value="Technical">Technical Club</option>
                                <option value="Cultural">Cultural Club</option>
                                <option value="Sports">Sports Node</option>
                                <option value="Fest Team">Felicity Core Team</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Club Description</label>
                            <textarea
                                required
                                rows={4}
                                value={profile.description}
                                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <hr className="my-6 border-gray-200" />

                        <h3 className="text-lg font-medium text-gray-900 mb-4">Integrations & Security</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Discord Webhook URL (Optional)</label>
                            <input
                                type="url"
                                value={profile.discordWebhook}
                                onChange={(e) => setProfile({ ...profile, discordWebhook: e.target.value })}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="https://discord.com/api/webhooks/..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Update Password (Optional)</label>
                            <input
                                type="password"
                                value={profile.password}
                                onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Leave blank to keep current password"
                                minLength="6"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={updatingProfile}
                                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 shadow-sm disabled:bg-indigo-400 transition-colors"
                            >
                                {updatingProfile ? 'Saving Changes...' : 'Save Profile Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB: EVENTS GRID */}
            {activeTab === 'events' && (
                <div>
                    {loadingEvents ? (
                        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                    ) : eventsError ? (
                        <div className="mb-4 p-4 rounded-md bg-red-50 text-red-700">{eventsError}</div>
                    ) : (
                        <div className="space-y-12">
                            {/* Active Events */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                    Active & Published Events
                                </h2>
                                {activeEvents.length === 0 ? (
                                    <p className="text-gray-500 italic bg-white p-6 rounded-lg border border-gray-200">No active events currently.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {activeEvents.map(event => <EventCard key={event._id} event={event} />)}
                                    </div>
                                )}
                            </section>

                            {/* Draft Events */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                                    Drafts (Not Visible to Public)
                                </h2>
                                {draftEvents.length === 0 ? (
                                    <p className="text-gray-500 italic bg-white p-6 rounded-lg border border-gray-200">No drafts currently.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {draftEvents.map(event => <EventCard key={event._id} event={event} />)}
                                    </div>
                                )}
                            </section>

                            {/* Past Events */}
                            <section className="opacity-75">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                                    Past Events
                                </h2>
                                {pastEvents.length === 0 ? (
                                    <p className="text-gray-500 italic bg-white p-6 rounded-lg border border-gray-200">No past events yet.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {pastEvents.map(event => <EventCard key={event._id} event={event} />)}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: OVERVIEW ANALYTICS */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="bg-white p-5 shadow rounded-lg border border-gray-100 flex items-center">
                            <div className="bg-indigo-100 rounded-md p-3 mr-4 text-indigo-600">📊</div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Total Events Hosted</div>
                                <div className="text-2xl font-semibold text-gray-900">{pastEvents.length}</div>
                            </div>
                        </div>

                        <div className="bg-white p-5 shadow rounded-lg border border-gray-100 flex items-center">
                            <div className="bg-green-100 rounded-md p-3 mr-4 text-green-600">🚀</div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Active Events</div>
                                <div className="text-2xl font-semibold text-gray-900">{activeEvents.length}</div>
                            </div>
                        </div>

                        <div className="bg-white p-5 shadow rounded-lg border border-gray-100 flex items-center">
                            <div className="bg-yellow-100 rounded-md p-3 mr-4 text-yellow-600">📝</div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Drafts Pending</div>
                                <div className="text-2xl font-semibold text-gray-900">{draftEvents.length}</div>
                            </div>
                        </div>

                        <div className="bg-white p-5 shadow rounded-lg border border-gray-100 flex items-center">
                            <div className="bg-pink-100 rounded-md p-3 mr-4 text-pink-600">💰</div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Total Revenue</div>
                                <div className="text-lg font-semibold text-gray-400">Coming in Task 4</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-lg p-8 text-center border border-gray-100 mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Detailed Registration Analytics</h3>
                        <p className="text-gray-500">Detailed line charts and registration exports will unlock when we implement participant registration in Task 4!</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Reusable Sub-Component for the Event Cards
const EventCard = ({ event }) => {
    const navigate = useNavigate();

    const statusColors = {
        Draft: 'bg-yellow-100 text-yellow-800',
        Published: 'bg-blue-100 text-blue-800',
        Ongoing: 'bg-green-100 text-green-800',
        Completed: 'bg-purple-100 text-purple-800',
        Closed: 'bg-gray-100 text-gray-800',
    };
    return (
        <div className="bg-white border text-left border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
            <div className={`h-2 w-full ${event.eventType === 'Merchandise' ? 'bg-purple-500' : 'bg-indigo-500'}`}></div>
            <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[event.status] || 'bg-gray-100'}`}>
                        {event.status}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{event.eventType}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{event.eventName}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{event.description}</p>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                        📅 {format(new Date(event.eventStartDate), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center">
                        👥 Limit: {event.registrationLimit}
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 mt-auto">
                <button
                    className="w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                    onClick={() => navigate(`/organizer/events/${event._id}`)}
                >
                    Manage Event →
                </button>
            </div>
        </div>
    );
};

export default OrganizerDashboard;
