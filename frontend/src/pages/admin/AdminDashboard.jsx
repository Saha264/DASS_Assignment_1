import { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import useAuthStore from '../../store/authStore';

const AdminDashboard = () => {
    const { userInfo, logout } = useAuthStore();
    const [activeTab, setActiveTab] = useState('organizers'); // 'organizers' | 'requests'
    
    // Organizers State
    const [organizers, setOrganizers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Password Requests State
    const [resetRequests, setResetRequests] = useState([]);
    const [loadingReqs, setLoadingReqs] = useState(false);

    // Global State
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    
    // Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        organizerName: '',
        category: 'Technical',
        description: '',
        contactEmail: ''
    });
    const [newCredentials, setNewCredentials] = useState(null);

    useEffect(() => {
        if (activeTab === 'organizers') fetchOrganizers();
        if (activeTab === 'requests') fetchResetRequests();
    }, [activeTab]);

    const fetchOrganizers = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/admin/organizers');
            setOrganizers(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch organizers');
        } finally {
            setLoading(false);
        }
    };

    const fetchResetRequests = async () => {
        try {
            setLoadingReqs(true);
            const { data } = await API.get('/admin/password-requests');
            setResetRequests(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch password requests');
        } finally {
            setLoadingReqs(false);
        }
    };

    const handleCreateOrganizer = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            setNewCredentials(null);
            const { data } = await API.post('/admin/organizers', formData);
            
            setNewCredentials({ email: data.contactEmail, password: data.initialPassword });
            setSuccessMsg('Organizer created successfully!');
            setFormData({ organizerName: '', category: 'Technical', description: '', contactEmail: '' });
            setShowForm(false);
            
            fetchOrganizers();
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create organizer');
        }
    };

    const handleDeleteOrganizer = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
            try {
                await API.delete(`/admin/organizers/${id}`);
                setSuccessMsg('Organizer deleted successfully!');
                fetchOrganizers();
                setTimeout(() => setSuccessMsg(''), 3000);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete organizer');
            }
        }
    };

    const handleProcessRequest = async (id, status) => {
        if (window.confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) {
            try {
                const { data } = await API.put(`/admin/password-requests/${id}`, { status });
                setSuccessMsg(`Request ${status.toLowerCase()} successfully!`);
                
                // If approved, show the new password so admin can share it
                if (status === 'Approved' && data.request.newPasswordGenerated) {
                    setNewCredentials({ 
                        email: data.request.organizer.contactEmail, 
                        password: data.request.newPasswordGenerated 
                    });
                }
                
                fetchResetRequests();
                setTimeout(() => setSuccessMsg(''), 5000);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to process request');
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-lg shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage platform organizers and system settings</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-indigo-600 font-medium">{userInfo?.email}</span>
                    <button onClick={logout} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors">
                        Logout
                    </button>
                </div>
            </div>

            {/* Dashboard Navigation Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200 pb-2">
                <button 
                  onClick={() => setActiveTab('organizers')}
                  className={`px-4 py-2 font-medium rounded-md transition-colors ${activeTab === 'organizers' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Manage Organizers
                </button>
                <button 
                  onClick={() => setActiveTab('requests')}
                  className={`px-4 py-2 font-medium rounded-md transition-colors ${activeTab === 'requests' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Password Requests 
                  {resetRequests.filter(req => req.status === 'Pending').length > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {resetRequests.filter(req => req.status === 'Pending').length}
                      </span>
                  )}
                </button>
            </div>

            {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>}
            {successMsg && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">{successMsg}</div>}

            {/* Credentials Modal (Used for both Creation and Password Resets) */}
            {newCredentials && (
                <div className="mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md">
                    <h3 className="text-lg font-bold text-yellow-800 mb-2">Save These Credentials!</h3>
                    <p className="text-sm text-yellow-700 mb-4">
                        The action was successful. The password below will only be shown <strong>once</strong>. Please securely share it with the club.
                    </p>
                    <div className="bg-white p-4 rounded border border-yellow-200 font-mono text-sm">
                        <p><strong>Login Role:</strong> Organizer</p>
                        <p><strong>Email:</strong> {newCredentials.email}</p>
                        <p><strong>Temporary Password:</strong> {newCredentials.password}</p>
                    </div>
                    <button onClick={() => setNewCredentials(null)} className="mt-4 text-sm text-yellow-800 underline">Dismiss</button>
                </div>
            )}

            {/* TAB: ORGANIZERS */}
            {activeTab === 'organizers' && (
                <>
                    <div className="mb-4 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">Organizers Directory ({organizers.length})</h2>
                        <button 
                            onClick={() => setShowForm(!showForm)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            {showForm ? 'Cancel Creation' : '+ Add New Organizer'}
                        </button>
                    </div>

                    {showForm && (
                        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Organizer Account</h3>
                            <form onSubmit={handleCreateOrganizer} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
                                        <input type="text" required value={formData.organizerName} onChange={(e) => setFormData({...formData, organizerName: e.target.value})} className="w-full rounded-md border border-gray-300 px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                                        <input type="email" required value={formData.contactEmail} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} className="w-full rounded-md border border-gray-300 px-3 py-2" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full rounded-md border border-gray-300 px-3 py-2">
                                            <option value="Technical">Technical Club</option>
                                            <option value="Cultural">Cultural Club</option>
                                            <option value="Sports">Sports Node</option>
                                            <option value="Fest Team">Felicity Core Team</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea required rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full rounded-md border border-gray-300 px-3 py-2" />
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700">Submit</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
                        {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : organizers.length === 0 ? <div className="p-8 text-center text-gray-500">No organizers.</div> : (
                            <ul className="divide-y divide-gray-200">
                                {organizers.map((org) => (
                                    <li key={org._id} className="p-6 hover:bg-gray-50 flex justify-between">
                                        <div>
                                            <div className="flex gap-3 mb-1"><h4 className="text-lg font-bold text-gray-900">{org.organizerName}</h4><span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{org.category}</span></div>
                                            <p className="text-sm text-gray-600">{org.description}</p>
                                            <p className="text-sm text-gray-500 mt-1">{org.contactEmail}</p>
                                        </div>
                                        <div>
                                            <button onClick={() => handleDeleteOrganizer(org._id, org.organizerName)} className="text-sm text-red-600 hover:text-red-900">Remove</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}

            {/* TAB: PASSWORD REQUESTS */}
            {activeTab === 'requests' && (
                <>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Password Reset Requests</h2>
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
                        {loadingReqs ? <div className="p-8 text-center text-gray-500">Loading Requests...</div> : resetRequests.length === 0 ? <div className="p-8 text-center text-gray-500">No requests found.</div> : (
                            <ul className="divide-y divide-gray-200">
                                {resetRequests.map((req) => (
                                    <li key={req._id} className="p-6 hover:bg-gray-50">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="text-md font-bold text-gray-900 mb-1">
                                                    Organizer: {req.organizer ? req.organizer.organizerName : 'Deleted Organizer'}
                                                </h4>
                                                <p className="text-sm text-gray-600">Email: {req.organizer ? req.organizer.contactEmail : 'N/A'}</p>
                                                <p className="text-xs text-gray-400 mt-1">Requested {new Date(req.createdAt).toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {/* Status Badge */}
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                                    req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                    req.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                                    'bg-red-100 text-red-800 border-red-200'
                                                }`}>
                                                    {req.status}
                                                </span>

                                                {/* Action Buttons (Only if pending) */}
                                                {req.status === 'Pending' && req.organizer && (
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleProcessRequest(req._id, 'Approved')}
                                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                                        >
                                                            Approve & Reset
                                                        </button>
                                                        <button 
                                                            onClick={() => handleProcessRequest(req._id, 'Rejected')}
                                                            className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
