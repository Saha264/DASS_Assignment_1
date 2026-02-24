import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axiosConfig';

const EventCreation = () => {
    const navigate = useNavigate();

    // Core Event Data State
    const [eventData, setEventData] = useState({
        eventName: '',
        description: '',
        eventType: 'Normal', // Normal | Merchandise
        eligibility: 'Open to All',
        registrationDeadline: '',
        eventStartDate: '',
        eventEndDate: '',
        registrationLimit: '',
        fee: '',
        tags: '', // Comma separated string for UX
        isTeamEvent: false,
        teamSize: 1
    });

    // Merchandise Variants State
    const [merchandiseName, setMerchandiseName] = useState('');
    const [purchaseLimit, setPurchaseLimit] = useState(1);
    const [variants, setVariants] = useState([]);

    // Dynamic Form Builder State (Normal Events)
    const [customFields, setCustomFields] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Handlers for Merchandise Variables
    const addVariantRow = () => {
        setVariants([...variants, { size: '', color: '', stock: '' }]);
    };
    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };
    const removeVariantRow = (index) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    // Handlers for Dynamic Form Builder
    const addCustomField = () => {
        setCustomFields([...customFields, {
            label: '',
            type: 'text',
            optionsText: '', // Helper text for CSV options
            required: false
        }]);
    };
    const handleCustomFieldChange = (index, field, value) => {
        const updatedFields = [...customFields];
        updatedFields[index][field] = value;
        setCustomFields(updatedFields);
    };
    const removeCustomField = (index) => {
        setCustomFields(customFields.filter((_, i) => i !== index));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Formatting payloads before send
            const payload = {
                ...eventData,
                registrationLimit: Number(eventData.registrationLimit),
                fee: Number(eventData.fee) || 0,
                // Split tags string into actual array
                tags: eventData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
            };

            if (payload.eventType === 'Merchandise') {
                payload.merchandiseDetails = {
                    itemName: merchandiseName,
                    purchaseLimitPerParticipant: Number(purchaseLimit),
                    variants: variants.map(v => ({
                        ...v,
                        stock: Number(v.stock) || 0
                    }))
                };
            } else {
                // Map the custom fields to match backend schema
                payload.customFormFields = customFields.map((field, idx) => ({
                    label: field.label,
                    type: field.type,
                    required: field.required,
                    order: idx,
                    // If it's a dropdown, split the text input into an array of options
                    options: field.type === 'dropdown' ? field.optionsText.split(',').map(opt => opt.trim()).filter(Boolean) : []
                }));
            }

            // The Event is created as 'Draft' on the backend by default.
            await API.post('/events', payload);

            // On success, redirect them to the dashboard where they can see their new draft
            navigate('/organizer');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event draft');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event Profile</h1>
            <p className="text-gray-600 mb-8">Set up your event details. All events are saved as Drafts until you explicitly publish them.</p>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">

                {/* Section 1: Core Details */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Core Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                            <input
                                required type="text"
                                value={eventData.eventName} onChange={(e) => setEventData(prev => ({ ...prev, eventName: e.target.value }))}
                                className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
                            <select
                                value={eventData.eventType} onChange={(e) => setEventData(prev => ({ ...prev, eventType: e.target.value }))}
                                className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2 border bg-gray-50"
                            >
                                <option value="Normal">Normal Registration/Ticket</option>
                                <option value="Merchandise">Physical Merchandise Sale</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                            <textarea
                                required rows="4"
                                value={eventData.description} onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                            ></textarea>
                        </div>
                        {eventData.eventType === 'Normal' && (
                            <div className="md:col-span-2 flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox" id="isTeamEvent"
                                        checked={eventData.isTeamEvent}
                                        onChange={(e) => setEventData(prev => ({ ...prev, isTeamEvent: e.target.checked }))}
                                        className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="isTeamEvent" className="font-medium text-gray-800">Is this a Hackathon / Team Event?</label>
                                </div>
                                {eventData.isTeamEvent && (
                                    <div className="flex items-center gap-2 ml-4 border-l pl-4 border-gray-300">
                                        <label className="text-sm font-medium text-gray-700">Required Team Size:</label>
                                        <input
                                            type="number" min="1"
                                            value={eventData.teamSize}
                                            onChange={(e) => setEventData(prev => ({ ...prev, teamSize: Number(e.target.value) }))}
                                            className="w-20 border-gray-300 rounded-md p-1 border text-center"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 2: Logistics */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Scheduling & Limits</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline *</label>
                            <input
                                required type="date"
                                value={eventData.registrationDeadline} onChange={(e) => setEventData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                                className="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Start Time *</label>
                            <input
                                required type="date"
                                value={eventData.eventStartDate} onChange={(e) => setEventData(prev => ({ ...prev, eventStartDate: e.target.value }))}
                                className="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Event End Time *</label>
                            <input
                                required type="date"
                                value={eventData.eventEndDate} onChange={(e) => setEventData(prev => ({ ...prev, eventEndDate: e.target.value }))}
                                className="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity/Limit *</label>
                            <input
                                required type="number" min="1"
                                value={eventData.registrationLimit} onChange={(e) => setEventData(prev => ({ ...prev, registrationLimit: e.target.value }))}
                                className="w-full border border-gray-300 rounded-md p-2"
                                placeholder="eg. 150"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Fee (₹)</label>
                            <input
                                type="number" min="0" placeholder="0 for Free"
                                value={eventData.fee} onChange={(e) => setEventData(prev => ({ ...prev, fee: e.target.value }))}
                                className="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Target</label>
                            <select
                                value={eventData.eligibility} onChange={(e) => setEventData(prev => ({ ...prev, eligibility: e.target.value }))}
                                className="w-full border border-gray-300 rounded-md p-2"
                            >
                                <option value="Open to All">Open to All</option>
                                <option value="IIIT Students Only">IIIT Students Only</option>
                                <option value="BTech First Year Only">BTech First Year Only</option>
                            </select>
                        </div>
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search Tags</label>
                            <input
                                type="text" placeholder="e.g. coding, workshop, fun, free"
                                value={eventData.tags} onChange={(e) => setEventData(prev => ({ ...prev, tags: e.target.value }))}
                                className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3A: Merchandise Specifics */}
                {eventData.eventType === 'Merchandise' && (
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                        <h2 className="text-xl font-semibold text-purple-900 mb-4">Merchandise Inventory Configuration</h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm text-purple-800 font-medium mb-1">Merchandise Name *</label>
                                <input
                                    required type="text" placeholder="e.g., Felicity Winter Hoodie"
                                    value={merchandiseName} onChange={(e) => setMerchandiseName(e.target.value)}
                                    className="w-full border border-purple-200 rounded p-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-purple-800 font-medium mb-1">Max Purchases per user *</label>
                                <input
                                    required type="number" min="1"
                                    value={purchaseLimit} onChange={(e) => setPurchaseLimit(e.target.value)}
                                    className="w-full border border-purple-200 rounded p-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm text-purple-800 font-bold border-b border-purple-200 pb-1">Stock Variations (Size/Color)</label>
                            {variants.map((v, i) => (
                                <div key={i} className="flex gap-3 items-center">
                                    <input placeholder="Size (eg. S, M, XL)" className="flex-1 p-2 border rounded" required value={v.size} onChange={e => handleVariantChange(i, 'size', e.target.value)} />
                                    <input placeholder="Color (eg. Black)" className="flex-1 p-2 border rounded" value={v.color} onChange={e => handleVariantChange(i, 'color', e.target.value)} />
                                    <input placeholder="Stock Qty *" type="number" required min="1" className="w-24 p-2 border rounded" value={v.stock} onChange={e => handleVariantChange(i, 'stock', e.target.value)} />
                                    <button type="button" onClick={() => removeVariantRow(i)} className="text-red-500 p-2 hover:bg-red-50 rounded">✖</button>
                                </div>
                            ))}
                            <button type="button" onClick={addVariantRow} className="text-sm font-semibold text-purple-700 bg-white border border-purple-200 px-3 py-1.5 rounded hover:bg-purple-100">
                                + Add Variant Row
                            </button>
                        </div>
                    </div>
                )}

                {/* Section 3B: Normal Event Dynamic Form Builder */}
                {eventData.eventType === 'Normal' && (
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-center mb-4 border-b border-blue-200 pb-2">
                            <h2 className="text-xl font-semibold text-blue-900">Dynamic Registration Form Builder</h2>
                            <span className="text-xs bg-blue-200 text-blue-800 py-1 px-2 rounded-full font-semibold">Tier A Feature</span>
                        </div>
                        <p className="text-sm text-blue-700 mb-4">
                            You can ask participants for additional information during registration by adding custom fields to the form below.
                            Basic info (Name, Email, College) is collected automatically.
                        </p>

                        <div className="space-y-4 mb-4">
                            {customFields.map((field, i) => (
                                <div key={i} className="bg-white p-4 rounded-md border border-blue-200 shadow-sm relative">
                                    <button type="button" onClick={() => removeCustomField(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                        ✖
                                    </button>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">Field Question / Label *</label>
                                            <input required className="w-full text-sm p-2 border rounded" placeholder="e.g., Which framework do you use?" value={field.label} onChange={e => handleCustomFieldChange(i, 'label', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">Input Type</label>
                                            <select className="w-full text-sm p-2 border rounded bg-gray-50" value={field.type} onChange={e => handleCustomFieldChange(i, 'type', e.target.value)}>
                                                <option value="text">Short Text</option>
                                                <option value="dropdown">Dropdown Options</option>
                                                <option value="checkbox">Checkbox (Yes/No)</option>
                                                <option value="file">File Upload (PDF/Image)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {field.type === 'dropdown' && (
                                        <div className="mt-3">
                                            <label className="block text-xs font-bold text-gray-600 mb-1">Dropdown Options (Comma separated) *</label>
                                            <input required className="w-full text-sm p-2 border rounded border-blue-300 focus:ring-blue-400" placeholder="e.g., React, Vue, Angular, Svelte" value={field.optionsText} onChange={e => handleCustomFieldChange(i, 'optionsText', e.target.value)} />
                                        </div>
                                    )}

                                    <div className="mt-3 flex items-center">
                                        <input type="checkbox" id={`req-${i}`} className="w-4 h-4 text-blue-600 rounded" checked={field.required} onChange={e => handleCustomFieldChange(i, 'required', e.target.checked)} />
                                        <label htmlFor={`req-${i}`} className="ml-2 text-sm text-gray-700 font-medium">Make this field required to register</label>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" onClick={addCustomField} className="w-full py-2 border-2 border-dashed border-blue-300 text-blue-600 font-bold rounded-lg hover:bg-blue-100 hover:border-blue-400 transition-colors">
                            + Add Custom Form Field
                        </button>
                    </div>
                )}

                <div className="pt-6 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-lg shadow-md transition-colors disabled:bg-indigo-400"
                    >
                        {loading ? 'Saving Draft...' : 'Create Event Draft'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EventCreation;

