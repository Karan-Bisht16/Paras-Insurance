import { useContext, useMemo, useState } from 'react';
import { Tooltip } from '@mui/material';
import { Edit, Delete, FilterAltOutlined, AddCircleOutlineOutlined, SearchOutlined } from '@mui/icons-material';
// importing api end-points
import { editCompany } from '../../../api';
// importing contexts
import { SnackBarContext } from '../../../contexts/SnackBar.context';
// importing components
import CompanyPolicyModal from './CompanyPolicyModal';
import CompanyForm from './CompanyForm';

const CompanyTable = ({ companiesData, onAddPolicy, onRemovePolicy, onDelete, reload }) => {
    const { setSnackbarState, setSnackbarValue } = useContext(SnackBarContext);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const companiesPerPage = 10;

    const filteredCompaniesData = useMemo(() => {
        return companiesData.filter(company => {
            const searchMatch =
                company?.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company?.contactInfo?.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company?.contactInfo?.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company?.contactInfo?.email.includes(searchTerm);

            const statusMatch = filterStatus === 'ALL' || company?.companyStatus?.toLowerCase() === filterStatus.toLowerCase();

            return searchMatch && statusMatch;
        });
    }, [searchTerm, filterStatus, companiesData]);

    const totalPages = Math.ceil(filteredCompaniesData.length / companiesPerPage);
    const indexOfLastCompany = currentPage * companiesPerPage;
    const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
    const currentCompaniesData = filteredCompaniesData.slice(indexOfFirstCompany, indexOfLastCompany);

    const nextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const prevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const [showEditCompanyForm, setShowEditCompanyForm] = useState(false);
    const [editCompanyFormData, setEditCompanyFormData] = useState({
        companyName: '',
        companyType: 'Corporate',
        companyStatus: 'Active',
        companyDescription: '',
        companyRegistrationNo: '',
        companyWebsite: '',
        companyAddress: '',
    });
    const handleEditCompanyFormDataChange = (event) => {
        const { name, value } = event.target;
        setEditCompanyFormData(prevEditCompanyFormData => ({
            ...prevEditCompanyFormData, [name]: value
        }));
    };
    const handleOpenEditCompanyForm = (companyData) => {
        setEditCompanyFormData(companyData);
        setShowEditCompanyForm(true);
    }
    const handleCloseEditCompanyForm = () => {
        setEditCompanyFormData({});
        setShowEditCompanyForm(false);
    }

    const handleEditCompany = async () => {
        try {
            await editCompany(editCompanyFormData);
            setSnackbarValue({ message: 'Company Details updated!', status: 'success' });
            setSnackbarState(true);
            reload();
            return false;
        } catch (error) {
            return error?.response?.data?.message;
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <input
                        type="text" placeholder="Search by company name, contact person, email, or phone..."
                        value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button className="p-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none ">
                        <SearchOutlined className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    <select
                        value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                    <FilterAltOutlined className="h-4 w-4" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 whitespace-nowrap">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Company Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Registration Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Policies Offered
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentCompaniesData.map((company, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{company?.companyName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{company?.companyType}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{company?.companyRegistrationNo}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500">
                                        {company?.companyPoliciesProvided?.length === 0 ?
                                            <div>No data available</div>
                                            :
                                            company?.companyPoliciesProvided?.map((policy, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedPolicy({ policy, company })}
                                                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1 hover:bg-blue-200 cursor-pointer"
                                                >
                                                    {policy.policyName}
                                                </button>
                                            ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${company?.companyStatus === 'Active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-600'
                                        }`}>
                                        {company?.companyStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex space-x-2">
                                        <button className="text-green-600 hover:text-green-900">
                                            <Tooltip title='Add policies'>
                                                <AddCircleOutlineOutlined onClick={() => onAddPolicy(company?._id)} />
                                            </Tooltip>
                                        </button>
                                        <button className="p-1 border border-gray-300 rounded-md shadow-sm text-blue-600 hover:text-blue-900 hover:bg-gray-50 focus:outline-none">
                                            <Tooltip title='Edit details'>
                                                <Edit onClick={() => handleOpenEditCompanyForm(company)} />
                                            </Tooltip>
                                        </button>
                                        <button className="p-1 border border-gray-300 rounded-md shadow-sm text-red-600 hover:text-red-900 hover:bg-gray-50 focus:outline-none ">
                                            <Tooltip title='Delete record'>
                                                <Delete onClick={() => onDelete(company?._id)} />
                                            </Tooltip>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {selectedPolicy && (
                    <CompanyPolicyModal
                        policyData={selectedPolicy}
                        onClose={() => setSelectedPolicy(null)}
                        onRemovePolicy={onRemovePolicy}
                    />
                )}
            </div>
            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-700">
                    Showing {indexOfFirstCompany + 1} to {Math.min(indexOfLastCompany, filteredCompaniesData.length)} of {filteredCompaniesData.length} results
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none  disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none  disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {showEditCompanyForm &&
                <CompanyForm
                    formData={editCompanyFormData}
                    handleChange={handleEditCompanyFormDataChange}
                    onClose={handleCloseEditCompanyForm}
                    onSubmit={handleEditCompany}
                    label='Edit Details'
                />
            }
        </div>
    );
}

export default CompanyTable;