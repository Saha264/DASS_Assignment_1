import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axiosConfig';

const OrganizerPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      const { data } = await API.post('/organizers/reset-password-request', { contactEmail: email });
      
      setMessage(data.message || 'Request sent to Administrator. Please await their response.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Organizer Password Reset
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Submit a request to the Admin to reset your password.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
             <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {message && (
          <div className="rounded-md bg-green-50 p-4">
             <p className="text-sm text-green-700">{message}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div>
            <label className="text-sm font-medium text-gray-700">Organizer Contact Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="club@felicity.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
            >
              {loading ? 'Submitting Request...' : 'Request Reset'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrganizerPasswordReset;
