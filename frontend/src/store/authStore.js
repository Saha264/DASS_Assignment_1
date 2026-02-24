import { create } from 'zustand';
import API from '../api/axiosConfig';

const userInfoFromStorage = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;

const useAuthStore = create((set) => ({
    userInfo: userInfoFromStorage,
    isLoading: false,
    error: null,


    //login action
    login: async (email, password, role) => {
        //set the loading
        set({ isLoading: true, error: null });
        try {
            //make the API call and get data={emial,password,role}
            const { data } = await API.post('/auth/login', { email, password, role });

            //store data in local storage and remove loading
            set({ userInfo: data, isLoading: false });
            localStorage.setItem('userInfo', JSON.stringify(data));

            return data;

        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            set({ error: message, isLoading: false });
            throw new Error(message);
        }
    },

    //register participant action
    register: async (participantData) => {
        set({ isLoading: true, error: null });
        try {
            //make the API call and get data=participantData(defined in authController.js in backend)
            const { data } = await API.post('/auth/register', participantData);

            set({ userInfo: data, isLoading: false });
            localStorage.setItem('userInfo', JSON.stringify(data));

            return data;
        } catch (error) {
            const message = error.response?.data?.message || 'registration failed';
            set({ error: message, isLoading: false });
            throw new Error(message);
        }
    },

    //logout action
    logout: () => {
        localStorage.removeItem('userInfo');
        set({ userInfo: null });
    }



}));

export default useAuthStore;