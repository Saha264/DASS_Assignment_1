import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Login = () => {

  //the values for each field are saved locally before pressing the actual sign in button.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Participant');

  const navigate = useNavigate();


  const { login, userInfo, isLoading, error } = useAuthStore();

  useEffect(() => {
    // Redirect if already logged in
    //If the Global Store gets a user,we immediately kick the user out of the login page and into their dashboard.
    if (userInfo) {
      if (userInfo.role === 'Admin') navigate('/admin');
      else if (userInfo.role === 'Organizer') navigate('/organizer');
      else navigate('/dashboard');
    }
  }, [navigate, userInfo]);

  //this function is called when the sign in button is pressed and passes our local variables to the login function in the authStore.
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await login(email, password, role);
    } catch (err) {
      // Error is handled by Zustand store
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Felicity
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="Participant">Participant</option>
                <option value="Organizer">Organizer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm space-y-2">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Register here (Participants Only)
            </Link>
          </p>
          <p className="text-gray-600">
            Forgot your Organizer password?{' '}
            <Link to="/organizer/reset-password" className="font-medium text-indigo-600 hover:text-indigo-500">
              Request Reset
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
