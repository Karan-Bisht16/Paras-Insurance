import { useContext, useEffect, useState } from 'react';
import { Button, Tooltip } from '@mui/material';
import { Add } from '@mui/icons-material';
// importing api end-points
import { addCompanyPolicy, createCompany, deleteCompany, fetchAllCompanies, removeCompanyPolicy } from '../../api';
// importing contexts
import { SnackBarContext } from '../../contexts/SnackBar.context';
// importing components
import CompanyTable from './companies/CompanyTable';
import CompanyForm from './companies/CompanyForm';
import CompanyPolicyForm from './companies/CompanyPolicyForm';

const CompanyManagement = () => {
    const { setSnackbarState, setSnackbarValue } = useContext(SnackBarContext);
    const [companiesData, setCompaniesData] = useState([]);

    const getAllCompanies = async () => {
        try {
            const { data } = await fetchAllCompanies();
            setCompaniesData(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getAllCompanies();
    }, []);

    const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);
    const [addCompanyFormData, setAddCompanyFormData] = useState({
        companyName: '',
        companyType: 'Corporate',
        companyStatus: 'Active',
        companyDescription: '',
        companyRegistrationNo: '',
        companyWebsite: '',
        companyAddress: '',
    });
    const handleAddCompanyFormDataChange = (event) => {
        const { name, value } = event.target;
        setAddCompanyFormData(prevAddCompanyFormData => ({
            ...prevAddCompanyFormData, [name]: value
        }));
    };
    const handleAddCompany = async (newCompanyData) => {
        try {
            const { data } = await createCompany(newCompanyData);
            setCompaniesData(prevEmployeesData => [...prevEmployeesData, { ...data }]);
            setAddCompanyFormData({
                companyName: '',
                companyType: 'Corporate',
                companyStatus: 'Active',
                companyDescription: '',
                companyRegistrationNo: '',
                companyWebsite: '',
                companyAddress: '',
            });
            setSnackbarValue({ message: 'New company added!', status: 'success' });
            setSnackbarState(true);
            return false;
        } catch (error) {
            return error?.response?.data?.message;
        }
    };

    const handleDeleteCompany = async (companyId) => {
        try {
            await deleteCompany({ companyId });
            setCompaniesData(prevCompaniesData => prevCompaniesData.filter((company) => company._id !== companyId));
            setSnackbarValue({ message: 'Company removed successfully!', status: 'success' });
            setSnackbarState(true);
        } catch (error) {
            setSnackbarValue({ message: error?.response?.data?.message, status: 'error' });
            setSnackbarState(true);
        }
    };

    const [showCompanyPolicyForm, setShowCompanyPolicyForm] = useState(false);
    const handleAddCompanyPolicy = async (newCompanyPolicyData) => {
        try {
            await addCompanyPolicy({ companyId: showCompanyPolicyForm, policyData: newCompanyPolicyData });
            getAllCompanies();
            setSnackbarValue({ message: 'New company policy added!', status: 'success' });
            setSnackbarState(true);
            return false;
        } catch (error) {
            return response?.data?.message;
        }
    };

    const handleRemoveCompanyPolicy = async ({ companyId, policyId }) => {
        try {
            const { data } = await removeCompanyPolicy(companyId, policyId);
            getAllCompanies();
            setSnackbarValue({ message: 'Company policy removed successfully!', status: 'success' });
            setSnackbarState(true);
            return false;
        } catch (error) {
            return error?.response?.data?.message;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 h-[36.5px]">
                <h1 className="text-2xl font-bold text-gray-800">Company Management</h1>
                <div className='flex gap-3 items-center'>
                    <Button
                        onClick={() => setShowAddCompanyForm(true)}
                        className="!text-white !bg-gray-900 !flex !justify-center !items-center !gap-6 hover:opacity-95"
                    >
                        <Add />
                        Add New Company
                    </Button>
                    <Tooltip title='Refresh Data'>
                        <lord-icon
                            src="https://cdn.lordicon.com/jxhgzthg.json"
                            trigger="click" stroke="bold" state="loop-cycle"
                            colors="primary:#111827,secondary:#111827"
                            style={{ width: '25px', height: '25px', cursor: 'pointer' }}
                            onClick={getAllCompanies}
                        />
                    </Tooltip>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <CompanyTable
                        companiesData={companiesData}
                        onAddPolicy={(companyId) => setShowCompanyPolicyForm(companyId)}
                        onRemovePolicy={handleRemoveCompanyPolicy}
                        onDelete={handleDeleteCompany}
                        reload={getAllCompanies}
                    />
                </div>
            </div>

            {showAddCompanyForm && (
                <CompanyForm
                    formData={addCompanyFormData}
                    handleChange={handleAddCompanyFormDataChange}
                    onClose={() => setShowAddCompanyForm(false)}
                    onSubmit={handleAddCompany}
                    label='Add Company'
                />
            )}

            {showCompanyPolicyForm &&
                <CompanyPolicyForm
                    onClose={() => setShowCompanyPolicyForm(false)}
                    onSubmit={handleAddCompanyPolicy}
                />
            }
        </div>
    );
}

export default CompanyManagement;