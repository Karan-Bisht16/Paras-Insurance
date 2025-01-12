import axios from 'axios';

axios.defaults.withCredentials = true;
const API = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL });

// Client - DONE
export const register = (authData) => API.post('/client/register', authData);
export const login = (authData) => API.post('/client/login', authData);
export const create = (authData) => API.post('/client/create', authData);
export const fetchCondenseClientInfo = () => API.get('/client/fetchCondenseInfo');
export const fetchProfileData = (clientId) => API.get('/client/fetchProfileData', { params: clientId });
export const fetchPoliciesData = (clientId) => API.get('/client/fetchPoliciesData', { params: clientId });
export const fetchAllClients = () => API.get('/client/fetchAll');
export const updateProfile = (formData) => API.post('/client/updateProfile', { formData });
export const uploadProfileMedia = (media) => API.post('/client/uploadProfileMedia', media, {
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});
export const logout = () => API.delete('/client/logout');
export const deleteProfile = () => API.delete('/client/deleteProfile');
export const forgotPassword = (email) => API.get('/client/forgotPassword', { params: email });
export const resetPassword = (authData) => API.patch('/client/resetPassword', authData);
export const findClient = (formData) => API.post('/client/find', formData);
export const exportClientCsv = () => API.get('/client/exportCsv', {
    headers: {
        'Accept': 'text/csv',
    },
    responseType: 'blob'
});
export const importClientCsv = (media) => API.post('/client/importCsv', media, {
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});

// Policy - DONE
export const fetchAllPolicies = () => API.get('/policy/fetchAll');
export const fetchAllPolicyFields = (policyId) => API.get('/policy/fetchAllFields', { params: policyId });
export const fetchEveryPolicyId = () => API.get('/policy/fetchEveryPolicyId');

// ClientPolicy
export const createClientPolicy = (clientPolicyData) => API.post('/clientPolicy/createClientPolicy', clientPolicyData);
export const fetchClientPolicy = (clientPolicyId) => API.get('/clientPolicy/fetchClientPolicy', { params: clientPolicyId });
export const fetchAllUnassignedPolicies = () => API.get('/clientPolicy/fetchAllUnassigned');
export const fetchAllAssignedPolicies = () => API.get('/clientPolicy/fetchAllAssigned');
export const countAllAssignedPolicies = () => API.get('/clientPolicy/countAllAssigned');
export const assignClientPolicy = (data) => API.post('/clientPolicy/assignClientPolicy', data);
export const uploadAssignClientPolicyMedia = (media) => API.post('/clientPolicy/uploadAssignClientPolicyMedia', media, {
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});
export const sendCombinedQuotation = (formData) => API.put('/clientPolicy/sendCombinedQuotation', formData);
export const exportClientPolicyCsv = () => API.get('/clientPolicy/exportCsv', {
    headers: {
        'Accept': 'text/csv',
    },
    responseType: 'blob'
});
export const importClientPolicyCsv = (media) => API.post('/clientPolicy/importCsv', media, {
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});
// export const addAvailableCompanyPolicies = (formData) => API.post('/clientPolicy/addAvailableCompany', formData);

// Employee - DONE
export const addEmployee = (formData) => API.post('/employee/add', formData);
export const fetchAllEmployees = () => API.get('/employee/fetchAll');
export const editEmployee = (formData) => API.put('/employee/edit', formData);
export const removeEmployeeAccess = (employeeId) => API.delete('/employee/removeAccess', { params: employeeId });

// Company - DONE
export const createCompany = (formData) => API.post('/company/create', formData);
export const fetchAllCompanies = () => API.get('/company/fetchAll');
export const editCompany = (formData) => API.put('/company/edit', formData);
export const deleteCompany = (companyId) => API.delete('/company/delete', { params: companyId });
export const addCompanyPolicy = (formData) => API.post('/company/addPolicy', formData);
export const removeCompanyPolicy = (companyId, policyId) => API.delete('/company/removePolicy', { params: { companyId, policyId } });
// export const fetchCompanyPoliciesByType = (clientId, policyType) => API.get('/company/fetchPolicyByType', { params: { clientId, policyType } });

// Quotation - DONE (Admin should be able to view current quotation and send it manually)
export const createQuotation = (formData) => API.post('/quotation/create', { formData });

// SIP - DONE
export const createSip = (formData) => API.post('/sip/create', { formData });
export const uploadSipMedia = (media) => API.post('/sip/uploadMedia', media, {
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});
export const fetchSips = (clientId) => API.get('/sip/fetchSips', { params: clientId });
export const fetchAllUnassignedSips = () => API.get('/sip/fetchAllUnassigned');
export const fetchAllAssignedSips = () => API.get('/sip/fetchAllAssigned');
export const assignSip = (data) => API.post('/sip/assignSip', data);
export const uploadAssignSipMedia = (media) => API.post('/sip/uploadAssignSipMedia', media, {
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});

// General Insurance - DONE
export const createGeneralInsurance = (formData) => API.post('/generalInsurance/create', { formData });
export const uploadGeneralInsuranceMedia = (media) => API.post('/generalInsurance/uploadMedia', media, {
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});
export const fetchGeneralInsurances = (clientId) => API.get('/generalInsurance/fetchGeneralInsurances', { params: clientId });
export const fetchAllUnassignedGeneralInsurances = () => API.get('/generalInsurance/fetchAllUnassigned');
export const fetchAllAssignedGeneralInsurances = () => API.get('/generalInsurance/fetchAllAssigned');
export const assignGeneralInsurance = (data) => API.post('/generalInsurance/assignGeneralInsurance', data);
export const uploadAssignGeneralInsuranceMedia = (media) => API.post('/generalInsurance/uploadAssignGeneralInsuranceMedia', media, {
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});
