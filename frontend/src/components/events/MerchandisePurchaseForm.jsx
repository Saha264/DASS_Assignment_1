import { useState } from 'react';
import API from '../../api/axiosConfig';

const MerchandisePurchaseForm = ({ event, onPurchaseSuccess }) => {
    const [formData, setFormData] = useState({
        size: '',
        color: '',
        quantity: 1
    });
    const [paymentProof, setPaymentProof] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            setPaymentProof(file);
            setError(null);
        } else {
            setPaymentProof(null);
            setError("Please select a valid image file (JPG, PNG)");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!paymentProof) {
            setError("Payment proof is required");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            // Important: We must use FormData because we are sending a file via multipart/form-data
            const submitData = new FormData();
            submitData.append('size', formData.size);
            submitData.append('color', formData.color);
            submitData.append('quantity', formData.quantity);
            submitData.append('paymentProof', paymentProof);

            const { data } = await API.post(`/events/${event._id}/purchase`, submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            onPurchaseSuccess(data);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit purchase order');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-purple-50 p-6 rounded-xl border border-purple-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-indigo-500"></div>

            <div className="mb-6">
                <h3 className="text-xl font-bold text-purple-900 mb-1">Purchase Details</h3>
                <p className="text-purple-700 text-sm">Please provide your variant preferences and upload a screenshot of your payment transfer.</p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm font-medium">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {event.merchandiseDetails?.variants && event.merchandiseDetails.variants.some(v => v.size && v.size.trim() !== '') && (
                    <div>
                        <label className="block text-sm font-medium text-purple-900 mb-1">Select Size *</label>
                        <select required value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} className="w-full border-purple-200 rounded-md p-2 bg-white focus:ring-purple-500 focus:border-purple-500">
                            <option value="">Choose a size...</option>
                            {[...new Set(event.merchandiseDetails.variants.map(v => v.size).filter(s => s && s.trim() !== ''))].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                )}

                {event.merchandiseDetails?.variants && event.merchandiseDetails.variants.some(v => v.color && v.color.trim() !== '') && (
                    <div>
                        <label className="block text-sm font-medium text-purple-900 mb-1">Select Color *</label>
                        <select required value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-full border-purple-200 rounded-md p-2 bg-white focus:ring-purple-500 focus:border-purple-500">
                            <option value="">Choose a color...</option>
                            {[...new Set(event.merchandiseDetails.variants.map(v => v.color).filter(c => c && c.trim() !== ''))].map(color => (
                                <option key={color} value={color}>{color}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="bg-white p-4 rounded-lg border border-purple-100 mb-6">
                <label className="block text-sm font-bold text-gray-800 mb-2">Upload Payment Screenshot *</label>
                <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-3 text-purple-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                            </svg>
                            <p className="mb-2 text-sm text-purple-700 font-semibold">{paymentProof ? paymentProof.name : "Click to upload proof"}</p>
                            <p className="text-xs text-purple-500">PNG, JPG up to 5MB</p>
                        </div>
                        <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} required />
                    </label>
                </div>
            </div>

            <button type="submit" disabled={submitting} className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-70">
                {submitting ? 'Uploading Proof...' : 'Submit Purchase Request'}
            </button>
        </form>
    );
};

export default MerchandisePurchaseForm;
