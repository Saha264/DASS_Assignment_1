import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});


// Request Interceptor: Attach the JWT token to every request if it exists
API.interceptors.request.use(
    (config) => {
        //assuming we store the token and user info in local storage
        const userInfo = localStorage.getItem('userInfo');

        if (userInfo) {
            const { token } = JSON.parse(userInfo);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                //every single request will now automatically include the token so we wont have to do it manually.
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Response Interceptor: Handle global errors like expired tokens (401)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        //auto-logout if token expires or invalid
        //so if the user token happens to be expired, he will be redirected to the login screen instead of seeing a broken screen.
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;