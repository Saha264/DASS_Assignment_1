import { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';

const ParticipantProfile = () => {
    const [profile, setProfile] = useState({
        firstName: '', lastName: '', contactNumber: '', password: '',
        preferences: { areasOfIntersest: [], followedOrganizers: [] }
    });
    const [allOrganizers, setAllOrganizers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const availableInterests = ['Coding', 'Web Dev', 'AI/ML', 'Design', 'Music', 'Dance', 'Sports', 'Gaming'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, organizersRes] = await Promise.all([
                    API.get('/participants/profile'),
                    API.get('/organizers/public')
                ]);
                
                // Map followed organizers to array of IDs for the state
                const followedIds = profileRes.data.preferences?.followedOrganizers?.map(org => org._id || org) || [];
                
                setProfile({
                    firstName: profileRes.data.firstName || '',
                    lastName: profileRes.data.lastName || '',
                    contactNumber: profileRes.data.contactNumber || '',
                    password: '',
                    preferences: {
                        areasOfIntersest: profileRes.data.preferences?.areasOfIntersest || [],
                        followedOrganizers: followedIds
                    }
                });
                setAllOrganizers(organizersRes.data || []);
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to load profile data.' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleInterestToggle = (interest) => {
        const currentInterests = [...profile.preferences.areasOfIntersest];
        if (currentInterests.includes(interest)) {
            currentInterests.splice(currentInterests.indexOf(interest), 1);
        } else {
            currentInterests.push(interest);
        }
        setProfile({ ...profile, preferences: { ...profile.preferences, areasOfIntersest: currentInterests } });
    };

    const handleFollowToggle = (orgId) => {
        const currentFollows = [...profile.preferences.followedOrganizers];
        if (currentFollows.includes(orgId)) {
            currentFollows.splice(currentFollows.indexOf(orgId), 1);
        } else {
            currentFollows.push(orgId);
        }
        setProfile({ ...profile, preferences: { ...profile.preferences, followedOrganizers: currentFollows } });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            setMessage({ type: '', text: '' });
            
            const payload = { ...profile };
            if (!payload.password) delete payload.password;

            await API.put('/participants/profile', payload);
            setMessage({ type: 'success', text: 'Profile & Preferences saved successfully!' });
            setProfile(prev => ({ ...prev, password: '' }));

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile & Preferences</h1>
            <p className="text-gray-600 mb-8">Personalize your Felicity experience. This information helps us recommend events to you!</p>

            {message.text && (
                <div className={`mb-6 p-4 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Basic Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Personal Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input type="text" required className="w-full border rounded-md p-2" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input type="text" required className="w-full border rounded-md p-2" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                            <input type="text" required className="w-full border rounded-md p-2" value={profile.contactNumber} onChange={e => setProfile({...profile, contactNumber: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Change Password (Optional)</label>
                            <input type="password" placeholder="Leave blank to keep current" className="w-full border rounded-md p-2 bg-gray-50" minLength="6" value={profile.password} onChange={e => setProfile({...profile, password: e.target.value})} />
                        </div>
                    </div>
                </div>

                {/* 2. Areas of Interest */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800">Areas of Interest</h2>
                    <p className="text-sm text-gray-500 mb-4">Select the domains you are interested in. We'll highlight related events.</p>
                    <div className="flex flex-wrap gap-3">
                        {availableInterests.map(interest => (
                            <button 
                                key={interest} type="button" 
                                onClick={() => handleInterestToggle(interest)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                                    profile.preferences.areasOfIntersest.includes(interest) 
                                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200' 
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {profile.preferences.areasOfIntersest.includes(interest) ? '✓ ' : '+ '}{interest}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Clubs to Follow */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800">Follow Clubs & Organizers</h2>
                    <p className="text-sm text-gray-500 mb-4">You'll never miss an update or drop from the clubs you follow.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {allOrganizers.map(org => {
                            const isFollowing = profile.preferences.followedOrganizers.includes(org._id);
                            return (
                                <div key={org._id} className={`border rounded-lg p-4 flex flex-col justify-between transition-colors ${isFollowing ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <div>
                                        <div className="font-bold text-gray-900">{org.organizerName}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-widest mt-1 mb-2">{org.category}</div>
                                        <p className="text-xs text-gray-600 line-clamp-2">{org.description}</p>
                                    </div>
                                    <button 
                                        type="button" onClick={() => handleFollowToggle(org._id)}
                                        className={`mt-4 w-full py-1.5 rounded text-sm font-medium transition-colors ${
                                            isFollowing ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={updating} className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-md hover:bg-indigo-700 transition disabled:bg-indigo-400">
                        {updating ? 'Saving...' : 'Save Profile & Preferences'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ParticipantProfile;
