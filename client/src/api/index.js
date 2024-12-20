import axios from 'axios';

axios.defaults.withCredentials = true;
const API = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL });

// Client
export const fetchCondenseClientInfo = () => API.get('/client/fetchCondenseInfo');
export const fetchAllClientData = (clientId) => API.get('/client/fetchAllData', { params: clientId });
export const register = (authData) => API.post('/client/register', authData);
export const login = (authData) => API.post('/client/login', authData);
export const logout = () => API.delete('/client/logout');
export const forgotPassword = (email) => API.get('/client/forgotPassword', { params: email });
export const resetPassword = (authData) => API.patch('/client/resetPassword', authData);

// Policy
export const fetchAllPolicies = () => API.get('/policy/fetchAll');
export const fetchAllPolicyFields = (policyId) => API.get('/policy/fetchAllFields', { params: policyId });

// AssignedPolicy
export const assignPolicy = (assignedPolicyData) => API.post('/assignedPolicy/assign', assignedPolicyData);