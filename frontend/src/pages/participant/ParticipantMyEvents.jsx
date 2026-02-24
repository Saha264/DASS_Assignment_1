import { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ParticipantMyEvents = () => {
    const [registrations, setRegistrations] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'history', 'merch'
    const [selectedTicket, setSelectedTicket] = useState(null); // For the modal

    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const [regRes, orderRes] = await Promise.all([
                API.get('/events/participant/registrations'),
                API.get('/events/participant/orders')
            ]);
            setRegistrations(regRes.data || []);
            setOrders(orderRes.data || []);
        } catch (err) {
            console.error("Failed to load history", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

    const today = new Date();

    // Categorize data
    const upcomingEvents = registrations.filter(reg => new Date(reg.event?.eventStartDate) >= today && reg.status === 'Confirmed');
    const pastEvents = registrations.filter(reg => new Date(reg.event?.eventStartDate) < today || reg.status === 'Cancelled');

    const renderRegistrationCard = (reg, isPast) => (
        <div key={reg._id} className="bg-white border text-left border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col group relative">
            <div className="h-2 w-full bg-indigo-500"></div>
            <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${reg.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {reg.status}
                    </span>
                    <span className="text-xs font-medium text-gray-500">{format(new Date(reg.event.eventStartDate), 'MMM dd, yyyy')}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{reg.event.eventName}</h3>
                <p className="text-xs text-indigo-600 font-mono bg-indigo-50 p-1 inline-block rounded border border-indigo-100 mt-2">ID: {reg.ticketId}</p>
            </div>
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center transition-colors">
                <button onClick={() => navigate(`/participant/events/${reg.event._id}`)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    View Event
                </button>
                {!isPast && reg.status === 'Confirmed' && (
                    <button onClick={() => setSelectedTicket(reg)} className="text-sm font-bold bg-indigo-600 px-3 py-1.5 rounded text-white hover:bg-indigo-700">
                        Show Ticket
                    </button>
                )}
            </div>
        </div>
    );

    const renderOrderCard = (order) => (
        <div key={order._id} className="bg-white border text-left border-purple-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative">
            <div className="h-2 w-full bg-purple-500"></div>
            <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${order.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            order.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                        }`}>
                        {order.status === 'Pending' ? 'Verification Pending' : order.status}
                    </span>
                    <span className="text-xs text-gray-400">{format(new Date(order.createdAt), 'MMM dd')}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1 border-b pb-2 mb-2">{order.event.eventName}</h3>

                <div className="text-sm text-gray-600">
                    <div><span className="font-semibold text-gray-700">Item:</span> {order.merchandiseName}</div>
                    {(order.variantRequested?.size || order.variantRequested?.color) && (
                        <div><span className="font-semibold text-gray-700">Variant:</span> {order.variantRequested.size} {order.variantRequested.color}</div>
                    )}
                    <div><span className="font-semibold text-gray-700">Qty:</span> {order.quantity}</div>
                </div>
            </div>

            {order.status === 'Approved' && order.qrCodeUrl && (
                <div className="bg-purple-50 px-5 py-3 border-t border-purple-100 flex justify-between items-center">
                    <p className="text-xs font-mono font-bold text-purple-700">{order.ticketId}</p>
                    <button onClick={() => setSelectedTicket(order)} className="text-sm font-bold bg-purple-600 px-3 py-1.5 rounded text-white hover:bg-purple-700">
                        View Pass
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Dashboard</h1>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
                <button onClick={() => setActiveTab('upcoming')} className={`py-3 px-6 font-medium text-sm transition-colors ${activeTab === 'upcoming' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Upcoming Events ({upcomingEvents.length})
                </button>
                <button onClick={() => setActiveTab('history')} className={`py-3 px-6 font-medium text-sm transition-colors ${activeTab === 'history' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Past / Cancelled ({pastEvents.length})
                </button>
                <button onClick={() => setActiveTab('merch')} className={`py-3 px-6 font-medium text-sm transition-colors ${activeTab === 'merch' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Merchandise Orders ({orders.length})
                </button>
            </div>

            {/* Content Area */}
            <div className="mb-12">
                {activeTab === 'upcoming' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingEvents.length > 0 ? (
                            upcomingEvents.map(r => renderRegistrationCard(r, false))
                        ) : (
                            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                No upcoming events found. Go discover some!
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
                        {pastEvents.length > 0 ? (
                            pastEvents.map(r => renderRegistrationCard(r, true))
                        ) : (
                            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                You have no past event history.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'merch' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.length > 0 ? (
                            orders.map(renderOrderCard)
                        ) : (
                            <div className="col-span-full py-12 text-center text-gray-500 bg-purple-50 rounded-lg border border-dashed border-purple-200 text-purple-600">
                                No merchandise orders found. Represent your clubs in style!
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Floating Ticket Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={() => setSelectedTicket(null)}>
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className={`p-6 text-center text-white ${selectedTicket.merchandiseName ? 'bg-purple-600' : 'bg-indigo-600'}`}>
                            <h2 className="text-2xl font-bold mb-1">{selectedTicket.event.eventName}</h2>
                            <p className="text-white/80 font-medium">{format(new Date(selectedTicket.event.eventStartDate), 'MMMM dd, yyyy')}</p>
                        </div>
                        <div className="p-8 flex flex-col items-center">
                            <p className="text-sm text-gray-500 mb-4 uppercase tracking-widest font-bold">Official Pass</p>
                            <img src={selectedTicket.qrCodeUrl} alt="QR Code" className="w-48 h-48 border-4 border-white shadow-sm rounded-lg mb-6" />
                            <div className={`text-xl font-mono font-bold tracking-widest px-4 py-2 rounded-lg border-2 ${selectedTicket.merchandiseName ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                                {selectedTicket.ticketId}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                            <button onClick={() => setSelectedTicket(null)} className="text-gray-500 font-medium hover:text-gray-800">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParticipantMyEvents;
