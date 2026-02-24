import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axiosConfig';
import { format } from 'date-fns';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [orders, setOrders] = useState([]); // Used for Merchandise
    const [attendees, setAttendees] = useState([]); // Used for Normal Events
    const [feedback, setFeedback] = useState([]); // Used for Event Feedback
    const [feedbackStats, setFeedbackStats] = useState({ count: 0, averageRating: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchEventData();
    }, [id]);

    const fetchEventData = async () => {
        try {
            setLoading(true);
            const { data } = await API.get(`/events/${id}`);
            setEvent(data);

            if (data.eventType === 'Merchandise') {
                const ordersRes = await API.get(`/events/${id}/orders`);
                setOrders(ordersRes.data || []);
            } else {
                const attendeesRes = await API.get(`/events/${id}/attendees`);
                setAttendees(attendeesRes.data?.attendees || []); // Placeholder for Task 4 completion
            }

            // Fetch Feedback
            try {
                const feedbackRes = await API.get(`/feedback/event/${id}`);
                setFeedback(feedbackRes.data.feedbacks || []);
                setFeedbackStats({
                    count: feedbackRes.data.count || 0,
                    averageRating: feedbackRes.data.averageRating || 0
                });
            } catch (fbErr) {
                console.warn("Could not load feedback:", fbErr);
            }

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
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleVerifyOrder = async (orderId, verificationStatus) => {
        if (!window.confirm(`Are you sure you want to ${verificationStatus.toLowerCase()} this order?`)) return;
        try {
            setUpdating(true);
            await API.put(`/events/orders/${orderId}/verify`, { status: verificationStatus });
            // Refresh orders after action
            const ordersRes = await API.get(`/events/${id}/orders`);
            setOrders(ordersRes.data || []);
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${verificationStatus.toLowerCase()} order`);
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

                    {['Draft', 'Published'].includes(event.status) && (
                        <button onClick={async () => {
                            const daysStr = window.prompt("How many days do you want to extend the deadline by?", "7");
                            if (!daysStr || isNaN(daysStr)) return;
                            try {
                                setUpdating(true);
                                const newDate = new Date(event.registrationDeadline);
                                newDate.setDate(newDate.getDate() + parseInt(daysStr));

                                const { data } = await API.put(`/events/${id}`, { registrationDeadline: newDate });
                                setEvent(data);
                                alert('Deadline extended successfully!');
                            } catch (err) {
                                alert(err.response?.data?.message || 'Failed to extend deadline');
                            } finally {
                                setUpdating(false);
                            }
                        }} disabled={updating} className="w-full py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 font-medium transition-colors mb-2">⏱️ Extend Deadline</button>
                    )}

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
                    <div className="text-sm text-gray-500 mb-1">Registrations / Orders</div>
                    <div className="font-semibold text-gray-900 text-2xl">{event.eventType === 'Merchandise' ? orders.length : attendees.length}</div>
                    <div className="text-sm text-gray-600">{event.registrationLimit} Capacity</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Fee</div>
                    <div className="font-semibold text-green-600 text-2xl">{event.fee === 0 ? 'Free' : `₹${event.fee}`}</div>
                </div>
                {['Completed', 'Closed'].includes(event.status) && (
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Average Feedback</div>
                        <div className="font-semibold text-yellow-500 text-2xl">
                            {feedbackStats.averageRating > 0 ? (
                                <>{feedbackStats.averageRating} <span className="text-sm text-gray-400">/ 5</span></>
                            ) : (
                                <span className="text-gray-400 text-lg">No Ratings</span>
                            )}
                        </div>
                        <div className="text-sm text-gray-600">{feedbackStats.count} Reviews</div>
                    </div>
                )}
            </div>

            {/* Participant Feedback Module */}
            {['Completed', 'Closed'].includes(event.status) && (
                <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 mt-8">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900">Participant Feedback</h2>
                    </div>

                    {feedback.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">No feedback submitted for this event yet.</div>
                    ) : (
                        <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2">
                            {feedback.map((fb) => (
                                <div key={fb._id} className="bg-gray-50 rounded-xl p-5 border border-gray-100 relative">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            {fb.isAnonymous ? (
                                                <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 font-bold">?</div>
                                            ) : (
                                                <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                                                    {fb.participant?.firstName?.[0]}{fb.participant?.lastName?.[0]}
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-bold text-gray-900">
                                                    {fb.isAnonymous ? 'Anonymous Participant' : `${fb.participant?.firstName} ${fb.participant?.lastName}`}
                                                </h4>
                                                <span className="text-xs text-gray-500">{format(new Date(fb.createdAt), 'MMM dd, yyyy h:mm a')}</span>
                                            </div>
                                        </div>
                                        <div className="flex text-yellow-400 text-lg">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <span key={i} className={i < fb.rating ? 'opacity-100' : 'text-gray-300'}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                    {fb.comment && <p className="text-gray-700 text-sm mt-2 italic">"{fb.comment}"</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Merchandise Payment Verification Module! */}
            {event.eventType === 'Merchandise' && (
                <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 mt-8">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900">Payment Verification Dashboard</h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">No orders placed yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                                        <th className="p-4 border-b">Participant</th>
                                        <th className="p-4 border-b">Variant</th>
                                        <th className="p-4 border-b">Payment Proof</th>
                                        <th className="p-4 border-b">Status</th>
                                        <th className="p-4 border-b">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-800">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="border-b hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="font-semibold">{order.participant?.firstName} {order.participant?.lastName}</div>
                                                <div className="text-xs text-gray-500">{order.participant?.email}</div>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                Size: {order.variantRequested?.size || 'N/A'}<br />
                                                Color: {order.variantRequested?.color || 'N/A'}<br />
                                                Qty: {order.quantity}
                                            </td>
                                            <td className="p-4">
                                                <a href={`http://localhost:5000${order.paymentProof}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-medium text-xs hover:text-indigo-800 block mb-1">
                                                    View Image ↗
                                                </a>
                                                <img src={`http://localhost:5000${order.paymentProof}`} alt="proof" className="w-16 h-16 object-cover rounded border" />
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-4 space-x-2">
                                                {order.status === 'Pending' && (
                                                    <>
                                                        <button onClick={() => handleVerifyOrder(order._id, 'Approved')} disabled={updating} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-medium">Approve</button>
                                                        <button onClick={() => handleVerifyOrder(order._id, 'Rejected')} disabled={updating} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-medium">Reject</button>
                                                    </>
                                                )}
                                                {order.status !== 'Pending' && <span className="text-gray-400 italic">Action Taken</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventDetails;
