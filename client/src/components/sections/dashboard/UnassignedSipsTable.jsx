import { useContext, useMemo, useState } from 'react';
import { Checkbox, Tooltip } from '@mui/material';
import { Edit, OpenInNew, SearchOutlined, Visibility } from '@mui/icons-material';
// importing api end-points
import { updateGeneralInsurance, updateSip, uploadGeneralInsuranceMedia, uploadSipMedia } from '../../../api';
// importing contexts
import { SnackBarContext } from '../../../contexts/SnackBar.context';
// importing components
import SipDetailModal from '../../subcomponents/SipDetailModal';
import UpdateProfileForm from '../../UpdateProfileForm';
// importing helper functions
import { toFormattedDate } from '../../../utils/helperFunctions';

const UnassignedSipsTable = ({ unassignedSips, onAssignSip, reload, isGeneralInsurance }) => {
    const { setSnackbarState, setSnackbarValue } = useContext(SnackBarContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const nextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };
    const prevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const filteredUnassignedSips = useMemo(() => {
        return unassignedSips.filter(unassignedSip => {
            const searchMatch =
                unassignedSip?.clientDetails?.personalDetails?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                unassignedSip?.clientDetails?.personalDetails?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                unassignedSip?.clientDetails?.personalDetails?.contact?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                unassignedSip?.clientDetails?.personalDetails?.contact?.phone.includes(searchTerm);

            let sipMatch = true;
            return searchMatch && sipMatch;
        });
    }, [searchTerm, unassignedSips]);

    const totalPages = Math.ceil(filteredUnassignedSips.length / itemsPerPage);
    const indexOfLastClient = currentPage * itemsPerPage;
    const indexOfFirstClient = indexOfLastClient - itemsPerPage;
    const currentUnassignedPolicies = filteredUnassignedSips.slice(indexOfFirstClient, indexOfLastClient);

    const [isSipSelected, setIsSipSelected] = useState(false);
    const [selectedSip, setSelectedSip] = useState(null);
    const handleSelectSip = (sipData) => {
        setSelectedSip(sipData);
        setIsSipSelected(true);
    };

    const [isSipSelectedForEdit, setIsSipSelectedForEdit] = useState(false);
    const [selectedSipForEdit, setSelectedSipForEdit] = useState({});
    const [selectedSipId, setSelectedSipId] = useState('');

    const [selectedGeneralInsurancePolicyTypeForEdit, setSelectedGeneralInsurancePolicyTypeForEdit] = useState('');
    const handleOpenSipForEdit = (sipData) => {
        if (isGeneralInsurance) setSelectedGeneralInsurancePolicyTypeForEdit(sipData.policyType);
        setSelectedSipId(sipData._id);
        setSelectedSipForEdit({ personalDetails: sipData.personalDetails, financialDetails: sipData.financialDetails });
        setIsSipSelectedForEdit(true);
    };

    const handleCloseSipForEdit = () => {
        setSelectedSipId('');
        setSelectedSipForEdit({});
        setIsSipSelectedForEdit(false);
    };

    const handleEditSipSubmit = async (formData, removedFiles, files, policyType) => {
        try {
            if (!isGeneralInsurance) {
                await updateSip({ formData, removedFiles, selectedSipId });
                await uploadSipMedia({ ...files, sipId: selectedSipId });
                setSnackbarValue({ message: 'SIP details updated successfully!', status: 'success' });
            } else {
                await updateGeneralInsurance({ formData, removedFiles, selectedGeneralInsuranceId: selectedSipId, policyType });
                await uploadGeneralInsuranceMedia({ ...files, generalInsuranceId: selectedSipId });
                setSnackbarValue({ message: 'General insurance details updated successfully!', status: 'success' });
            }
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
                                Client Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                DoB
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Gender
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Initiated On
                            </th>
                            {isGeneralInsurance &&
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                            }
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Assign
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentUnassignedPolicies.map((sip, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <a href={`/profile/${sip?.clientId}`} target='_blank' className="flex gap-1 !items-center text-sm font-medium text-gray-900 cursor-pointer hover:underline">
                                        {sip?.clientDetails?.personalDetails?.firstName} {sip?.clientDetails?.personalDetails?.lastName}
                                        <Tooltip title='View profile'>
                                            <OpenInNew className='!size-4' />
                                        </Tooltip>
                                    </a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{sip?.clientDetails?.personalDetails?.contact?.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{sip?.clientDetails?.personalDetails?.contact?.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{toFormattedDate(sip?.clientDetails?.personalDetails?.dob) || ''}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{sip?.clientDetails?.personalDetails?.gender}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{toFormattedDate(sip?.createdAt)}</div>
                                </td>
                                {isGeneralInsurance &&
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{sip?.policyType}</div>
                                    </td>
                                }
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <button className="text-gray-600 hover:text-blue-900 mr-2">
                                        <Tooltip title={`View ${isGeneralInsurance ? 'general Insurance' : 'SIP'} details`}>
                                            <Visibility onClick={() => handleSelectSip(sip)} />
                                        </Tooltip>
                                    </button>
                                    <button className="p-1 border border-gray-300 rounded-md shadow-sm text-blue-600 hover:text-blue-900 ml-1 focus:outline-none">
                                        <Tooltip title={`Edit ${isGeneralInsurance ? 'general Insurance' : 'SIP'} details`}>
                                            <Edit onClick={() => handleOpenSipForEdit(sip)} />
                                        </Tooltip>
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <button className="text-green-600 hover:text-green-900">
                                        <Tooltip title={`Assign ${isGeneralInsurance ? 'General Insurance' : 'SIP'}`}>
                                            <Checkbox onChange={() => onAssignSip(sip._id)} checked={false} />
                                        </Tooltip>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-700">
                        Showing {indexOfFirstClient + 1} to {Math.min(indexOfLastClient, filteredUnassignedSips.length)} of {filteredUnassignedSips.length} results
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

                {isSipSelected &&
                    <SipDetailModal
                        label={isGeneralInsurance ? `General Insurance (${selectedSip?.policyType})` : 'SIP'}
                        selectedSip={selectedSip}
                        closeModal={() => setIsSipSelected(false)}
                    />
                }
                {isSipSelectedForEdit &&
                    <UpdateProfileForm
                        clientData={selectedSipForEdit}
                        closeUpdateProfile={handleCloseSipForEdit}
                        onSubmit={handleEditSipSubmit}
                        includePolicyType={isGeneralInsurance}
                        initialPolicyType={isGeneralInsurance ? selectedGeneralInsurancePolicyTypeForEdit : ''}
                        label={isGeneralInsurance ? `Update General Insurance (${selectedGeneralInsurancePolicyTypeForEdit})` : 'Update SIP'}
                        excludeEmployementDetails={true}
                    />
                }
            </div>
        </div>
    );
};

export default UnassignedSipsTable;