import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axiosConfig';
import { format } from 'date-fns';
import MerchandisePurchaseForm from '../../components/events/MerchandisePurchaseForm';

const ParticipantEventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchEventData();
    }, [id]);

    const fetchEventData = async () => {
        try {
            setLoading(true);
            const { data } = await API.get(`/events/public/${id}`);
            setEvent(data);

            try {
                const statusRes = await API.get(`/events/${id}/check-registration`);
                setRegistrationStatus(statusRes.data);
            } catch (err) {
                console.log('User might not be logged in or check failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load event details.');
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (label, value) => {
        setFormData({ ...formData, [label]: value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            setRegistering(true);
            setError(null);
            const { data } = await API.post(`/events/${id}/register`, { customFormData: formData });

            setSuccessMsg('Successfully registered!');
            setRegistrationStatus({ isRegistered: true, ticket: data });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setRegistering(false);
        }
    };


    const handlePurchaseSuccess = (orderData) => {
        setSuccessMsg('Payment proof submitted successfully! The organizer will verify it shortly.');
        // We set isRegistered to true to trigger the "Confirmed/Pending" UI block
        setRegistrationStatus({ isRegistered: true, ticket: orderData });
    };





    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (!event) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">{error || 'Event not found'}</div>;

    const isRegistrationOpen = ['Published', 'Ongoing'].includes(event.status) && new Date() <= new Date(event.registrationDeadline);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button onClick={() => navigate('/dashboard')} className="text-indigo-600 hover:text-indigo-800 font-medium mb-6 inline-flex items-center">
                &larr; Back to Events
            </button>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>}
            {successMsg && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">{successMsg}</div>}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={`h-3 w-full ${event.eventType === 'Merchandise' ? 'bg-purple-500' : 'bg-indigo-500'}`}></div>
                <div className="p-8">

                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mr-2 ${event.eventType === 'Merchandise' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'}`}>{event.eventType}</span>
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-800 rounded-full">{event.eligibility}</span>
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{event.eventName}</h1>
                    <p className="text-lg text-gray-500 mb-6 border-b pb-6">Organized by <span className="font-semibold text-gray-800">{event.organizer?.organizerName}</span></p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">About the Event</h3>
                                <p className="text-gray-600 whitespace-pre-line leading-relaxed">{event.description}</p>
                            </div>

                            {event.tags && event.tags.length > 0 && event.tags[0] && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {event.tags[0].split(',').map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm">{tag.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4 h-fit">
                            <div>
                                <div className="text-sm text-gray-500">Date & Time</div>
                                <div className="font-bold text-gray-900">{format(new Date(event.eventStartDate), 'MMM dd, yyyy')}</div>
                                <div className="text-gray-900">{format(new Date(event.eventStartDate), 'h:mm a')}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Registration Closes</div>
                                <div className="font-bold text-red-600">{format(new Date(event.registrationDeadline), 'MMM dd, h:mm a')}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Entry Fee</div>
                                <div className="font-bold text-2xl text-green-600">{event.fee === 0 ? 'Free' : `₹${event.fee}`}</div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-8 mt-8 border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Registration</h3>

                        {registrationStatus?.isRegistered ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
                                <div>
                                    <div className="inline-block px-3 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full mb-2">✓ Confirmed</div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-1">Your Ticket is Ready!</h4>
                                    <div className="text-sm text-gray-600 font-medium">Ticket ID: <span className="font-mono font-bold text-indigo-600 ml-1">{registrationStatus.ticket.ticketId}</span></div>
                                </div>
                                <img src={registrationStatus.ticket.qrCodeUrl} alt="QR Code" className="w-24 h-24 rounded border-2 border-white shadow-sm" />
                            </div>
                        ) : !isRegistrationOpen ? (
                            <div className="bg-yellow-50 text-yellow-800 p-6 rounded-lg border border-yellow-200 text-center font-medium">
                                {event.eventType === 'Merchandise'
                                    ? "Purchases for this merchandise drop are currently closed. (Check the deadline!)"
                                    : "Registration for this event is currently closed."}
                            </div>
                        ) : event.eventType === 'Merchandise' ? (
                            <MerchandisePurchaseForm event={event} onPurchaseSuccess={handlePurchaseSuccess} />
                        ) : (

                            <form onSubmit={handleRegister} className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                                {event.customFormFields && event.customFormFields.length > 0 && (
                                    <div className="mb-6 space-y-4">
                                        <h4 className="font-bold text-gray-800 border-b pb-2">Organizer requires additional details:</h4>
                                        {event.customFormFields.map((field, idx) => (
                                            <div key={idx}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                                </label>
                                                {field.type === 'text' && (
                                                    <input type="text" required={field.required} onChange={(e) => handleFieldChange(field.label, e.target.value)} className="w-full border rounded-md p-2" />
                                                )}
                                                {field.type === 'dropdown' && (
                                                    <select required={field.required} onChange={(e) => handleFieldChange(field.label, e.target.value)} className="w-full border rounded-md p-2 bg-white">
                                                        <option value="">Select an option...</option>
                                                        {field.optionsText && field.optionsText.split(',').map((opt, i) => (
                                                            <option key={i} value={opt.trim()}>{opt.trim()}</option>
                                                        ))}
                                                    </select>
                                                )}
                                                {field.type === 'checkbox' && (
                                                    <div className="flex items-center mt-1">
                                                        <input type="checkbox" required={field.required} onChange={(e) => handleFieldChange(field.label, e.target.checked)} className="h-4 w-4 text-indigo-600 cursor-pointer" />
                                                        <span className="ml-2 text-sm text-gray-600">I confirm this requirement</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button type="submit" disabled={registering} className="w-full py-3 bg-indigo-600 text-white font-bold text-lg rounded-lg hover:bg-indigo-700 shadow-md transition disabled:bg-indigo-400">
                                    {registering ? 'Confirming...' : 'Complete Registration'}
                                </button>
                                <p className="text-xs text-center text-gray-500 mt-3">By registering, you agree to share your profile details with {event.organizer?.organizerName}.</p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParticipantEventDetails;
