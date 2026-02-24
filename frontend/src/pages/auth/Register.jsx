import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    participantType: 'IIIT',
    collegeName: 'IIIT Hyderabad',
    contactNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [validationError, setValidationError] = useState('');

  const navigate = useNavigate();
  const { register, userInfo, isLoading, error } = useAuthStore();

  useEffect(() => {
    if (userInfo) {
       navigate('/dashboard');
    }
  }, [navigate, userInfo]);

  //this function is called when the user types in any field.
  //instead of making a separate function for each field, we use a single function to handle all the fields.
  //we use the name attribute of the input field to identify which field is being updated and when we do [name], we are accessing the property of the object with the key name and assigning it the value that was entered
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-fill college name if IIIT is selected otherwise let user enter any college
    if (name === 'participantType') {
      if (value === 'IIIT') {
        setFormData(prev => ({ ...prev, collegeName: 'IIIT Hyderabad', participantType: value }));
      } else {
        setFormData(prev => ({ ...prev, collegeName: '', participantType: value }));
      }
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (formData.password !== formData.confirmPassword) {
      return setValidationError('Passwords do not match');
    }

    // This validation ONLY applies if they selected 'IIIT' in the dropdown
    if (formData.participantType === 'IIIT' && 
        !formData.email.endsWith('@iiit.ac.in') && 
        !formData.email.endsWith('@students.iiit.ac.in') &&
        !formData.email.endsWith('@research.iiit.ac.in')) {
      return setValidationError('IIIT participants must use an @iiit.ac.in email');
    }

    try {
      // Create a copy without confirmPassword as it is not needed for the backend
      //so all the fields except confirmPassword are stored in registerData
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
    } catch (err) {
      // Error handled by Zustand
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Participant Registration
          </h2>
        </div>

        {(error || validationError) && (
          <div className="rounded-md bg-red-50 p-4">
             <p className="text-sm text-red-700">{validationError || error}</p>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={submitHandler}>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Participant Type</label>
            <select name="participantType" value={formData.participantType} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              <option value="IIIT">IIIT Student</option>
              <option value="Non-IIIT">Non-IIIT Participant</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            {formData.participantType === 'IIIT' && <p className="mt-1 text-xs text-gray-500"></p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">College Name</label>
              <input type="text" name="collegeName" required disabled={formData.participantType === 'IIIT'} value={formData.collegeName} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Contact Number</label>
              <input type="text" name="contactNumber" required value={formData.contactNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <input type="password" name="confirmPassword" required minLength="6" value={formData.confirmPassword} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isLoading} className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400">
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
