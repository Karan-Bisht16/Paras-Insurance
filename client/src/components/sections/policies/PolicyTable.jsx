import { useMemo, useState } from 'react';
import { Tooltip } from '@mui/material';
import { OpenInNew, SearchOutlined, Visibility } from '@mui/icons-material';
// importing api end-points
import { toFormattedDate } from '../../../utils/helperFunctions';
// importing components
import PolicyDetailModal from '../../subcomponents/PolicyDetailModal';

const PolicyTable = ({ assignedPolicies, reload }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const nextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };
    const prevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const filteredAssignedPolicies = useMemo(() => {
        return assignedPolicies.filter(assignedPolicy => {
            const searchMatch =
                assignedPolicy.clientDetails.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                assignedPolicy.clientDetails.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                assignedPolicy.clientDetails.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                assignedPolicy.clientDetails.phone.includes(searchTerm);

            let policyMatch = true;
            return searchMatch && policyMatch;
        });
    }, [searchTerm, assignedPolicies]);

    const totalPages = Math.ceil(filteredAssignedPolicies.length / itemsPerPage);
    const indexOfLastClient = currentPage * itemsPerPage;
    const indexOfFirstClient = indexOfLastClient - itemsPerPage;
    const currentAssignedPolicies = filteredAssignedPolicies.slice(indexOfFirstClient, indexOfLastClient);

    const [isPolicySelected, setIsPolicySelected] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const handleSelectPolicy = (policyData) => {
        setSelectedPolicy(policyData);
        setIsPolicySelected(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <input
                        type="text" placeholder="Search by name, email, or phone..."
                        value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button className="p-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none ">
                        <SearchOutlined className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 whitespace-nowrap">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Policy Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Policy Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Assigned On
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Assigned By
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentAssignedPolicies.map((policy, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{policy?.format?.policyName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{policy?.format?.policyType}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <a href={`/profile/${policy?.clientId}`} target='_blank' className="flex gap-1 !items-center text-sm text-gray-500 cursor-pointer hover:underline">
                                        {policy.clientDetails.firstName} {policy.clientDetails.lastName}
                                        <Tooltip title='View profile'>
                                            <OpenInNew className='!size-4' />
                                        </Tooltip>
                                    </a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{policy.clientDetails.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{policy.clientDetails.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{toFormattedDate(policy.createdAt)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <button className="text-blue-600 hover:text-blue-900">
                                        <Tooltip title='View policy details'>
                                            <Visibility onClick={() => handleSelectPolicy(policy)} />
                                        </Tooltip>
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{policy.assignedBy}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-700">
                        Showing {indexOfFirstClient + 1} to {Math.min(indexOfLastClient, filteredAssignedPolicies.length)} of {filteredAssignedPolicies.length} results
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>

                {isPolicySelected &&
                    <PolicyDetailModal
                        selectedPolicy={selectedPolicy}
                        closeModal={() => setIsPolicySelected(false)}
                    />
                }
            </div>
        </div>
    );
};

export default PolicyTable;