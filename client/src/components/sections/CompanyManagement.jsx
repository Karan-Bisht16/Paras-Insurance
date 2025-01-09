import { useEffect, useState } from 'react';
import { Add } from '@mui/icons-material';
import { addCompanyPolicy, createCompany, deleteCompany, fetchAllCompanies, removeCompanyPolicy } from '../../api';
import CompanyTable from './companies/CompanyTable';
import CompanyForm from './companies/CompanyForm';
import CompanyPolicyForm from './companies/CompanyPolicyForm';
import { Button } from '@mui/material';

const CompanyManagement = () => {
    const [showForm, setShowForm] = useState(false);
    const [showCompanyPolicyForm, setShowCompanyPolicyForm] = useState(false);
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

    const handleAddCompany = async (newCompanyData) => {
        try {
            const { data } = await createCompany(newCompanyData);
            setCompaniesData(prevEmployeesData => [...prevEmployeesData, { ...data }]);
            return false;
        } catch (error) {
            console.error(error);
            const { response } = error;
            return response?.data?.message;
        }
    };

    const handleDeleteCompany = async (companyId) => {
        try {
            await deleteCompany({ companyId });
            setCompaniesData(prevCompaniesData => prevCompaniesData.filter((company) => company._id !== companyId));
        } catch (error) {
            console.error(error);
            // TODO: error handling
        }
    };

    const handleAddCompanyPolicy = async (newCompanyPolicyData) => {
        try {
            const { data } = await addCompanyPolicy({ companyId: showCompanyPolicyForm, policyData: newCompanyPolicyData });
            getAllCompanies();
            return false;
        } catch (error) {
            console.error(error);
            const { response } = error;
            return response?.data?.message;
        }
    };

    const handleRemoveCompanyPolicy = async ({ companyId, policyId }) => {
        try {
            const { data } = await removeCompanyPolicy(companyId, policyId);
            getAllCompanies();
            return false;
        } catch (error) {
            console.error(error);
            const { response } = error;
            return response?.data?.message;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Company Management</h1>
                <Button
                    onClick={() => setShowForm(true)}
                    className="!text-white !bg-gray-900 !flex !justify-center !items-center !gap-6 hover:opacity-95"
                >
                    <Add />
                    Add New Company
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <CompanyTable
                        companiesData={companiesData}
                        onAddPolicy={(companyId) => setShowCompanyPolicyForm(companyId)}
                        onRemovePolicy={handleRemoveCompanyPolicy}
                        onDelete={handleDeleteCompany}
                    />
                </div>
            </div>

            {showForm && (
                <CompanyForm
                    onClose={() => setShowForm(false)}
                    onSubmit={handleAddCompany}
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