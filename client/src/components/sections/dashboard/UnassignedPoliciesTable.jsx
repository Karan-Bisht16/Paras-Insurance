import { useContext, useMemo, useState } from 'react';
import { Button, Checkbox, Tooltip } from '@mui/material';
import { DoneAllOutlined, Edit, Info, InfoOutlined, OpenInNew, PostAddOutlined, SearchOutlined, Upload, Visibility } from '@mui/icons-material';
import Spreadsheet from "react-spreadsheet";
import * as XLSX from 'xlsx';
// importing api end-points
import { sendCombinedQuotation, updateClientPolicy, uploadUpdateClientPolicyMedia } from '../../../api';
// importing contexts
import { SnackBarContext } from '../../../contexts/SnackBar.context';
// importing components
import { ScrollArea } from '../../subcomponents/ScrollArea';
import PolicyDetailModal from '../../subcomponents/PolicyDetailModal';
import EditPolicyModal from '../../subcomponents/EditPolicyModal';
// importing helper functions
import { toFormattedDate } from '../../../utils/helperFunctions';
import CombinedQuotationDetails from './CombinedQuotationDetailsModal';

const UnassignedPoliciesTable = ({ unassignedPolicies, onAssignPolicy, reload }) => {
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

    const filteredUnassignedPolicies = useMemo(() => {
        return unassignedPolicies.filter(unassignedPolicy => {
            const searchMatch =
                unassignedPolicy.clientDetails.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                unassignedPolicy.clientDetails.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                unassignedPolicy.clientDetails.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                unassignedPolicy.clientDetails.phone.includes(searchTerm);

            let policyMatch = true;
            return searchMatch && policyMatch;
        });
    }, [searchTerm, unassignedPolicies]);

    const totalPages = Math.ceil(filteredUnassignedPolicies.length / itemsPerPage);
    const indexOfLastClient = currentPage * itemsPerPage;
    const indexOfFirstClient = indexOfLastClient - itemsPerPage;
    const currentUnassignedPolicies = filteredUnassignedPolicies.slice(indexOfFirstClient, indexOfLastClient);

    const [isPolicySelected, setIsPolicySelected] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const handleSelectPolicy = (policyData) => {
        setSelectedPolicy(policyData);
        setIsPolicySelected(true);
    };

    const handleUploadExcel = () => {
        document.getElementById(`excelUpload`)?.click();
    }

    const [combinedQuotationData, setCombinedQuotationData] = useState([]);
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
            const formattedData = sheetData.map((row) =>
                row.map((cell) => ({
                    value: cell || '',
                    readOnly: true
                }))
            );

            setCombinedQuotationData(formattedData);
        };
        reader.readAsBinaryString(file);
        document.getElementById(`excelUploadFileName`).textContent = file.name
    }

    // const [selectedCompanyPolicies, setSelectedCompanyPolicies] = useState([]);
    // const transformData = (inputArray) => {
    //     if (inputArray[0].length === 0) {
    //         inputArray.shift();
    //     }
    //     let transformedArray = [];
    //     let headerRow = inputArray[0].map(item => ({
    //         value: item || "",
    //         readOnly: true
    //     }));
    //     transformedArray.push(headerRow);
    //     inputArray.slice(1).forEach(row => {
    //         let transformedRow = row.map(item => ({
    //             value: item || "",
    //             readOnly: true
    //         }));
    //         transformedArray.push(transformedRow);
    //     });
    //     return transformedArray;
    // }
    // const selectCombinedQuotation = (quotation) => {
    // setSelectedCompanyPolicies(transformData(quotation));
    // setIsCombinedQuotationSelected(true);
    // }
    // const closeCompanyPolicies = () => {
    //     setSelectedCompanyPolicies([]);
    //     setIsCombinedQuotationSelected(false);
    // }
    // const handleDownloadExcel = () => {
    //     const worksheetData = selectedCompanyPolicies.map((row) =>
    //         Array.isArray(row) ? row.map((cell) => (cell.value ? cell.value : cell)) : row
    //     );
    //     const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    //     const workbook = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    //     XLSX.writeFile(workbook, "Quotation.xlsx");
    // };
    // {isCombinedQuotationSelected &&
    //     <div className='fixed inset-0 bg-black/10 !z-[1000] flex justify-center items-center' onClick={closeCompanyPolicies}>
    //         <div onClick={(event) => event.stopPropagation()} className='bg-white max-w-[75vw] max-h-[75vh] rounded-lg'>
    //             <div className='px-6 py-4 flex justify-between items-center'>
    //                 <h2 className='text-2xl font-bold mb-2'>Quotation(s)</h2>
    //                 {/* <Close onClick={closeCompanyPolicies} className='cursor-pointer' /> */}
    //             </div>
    //             <Divider />
    //             <div className='mx-6 mt-3 mb-4'>
    //                 <Button
    //                     type='button'
    //                     onClick={handleDownloadExcel}
    //                     className='!flex !items-center !gap-2 !bg-gray-900 !text-white float-right'
    //                 >
    //                     Download Excel
    //                     <Download className='!size-4' />
    //                 </Button>
    //                 <br />
    //                 <ScrollArea className='w-full mt-6'>
    //                     <div>
    //                         <Spreadsheet data={selectedCompanyPolicies} />
    //                     </div>
    //                 </ScrollArea>
    //             </div>
    //         </div>
    //     </div>
    // }
    const [isCombinedQuotationSelected, setIsCombinedQuotationSelected] = useState(false);
    const [clientPolicyIdForExcel, setClientPolicyIdForExcel] = useState('');
    const handleOpenSendCombinedQuotationModal = (clientPolicyId) => {
        setClientPolicyIdForExcel(clientPolicyId);
        setIsCombinedQuotationSelected(true);
    }
    const handleCloseSendCombinedQuotationModal = () => {
        setIsCombinedQuotationSelected(false);
        setCombinedQuotationData([]);
    }

    const handleSendCombinedQuotation = async () => {
        try {
            await sendCombinedQuotation({ clientPolicyId: clientPolicyIdForExcel, combinedQuotationData });
            handleCloseSendCombinedQuotationModal();
            reload();
            setSnackbarValue({ message: 'Quotation sent to Client!', status: 'success' });
            setSnackbarState(true);
        } catch (error) {
            setSnackbarValue({ message: error?.response?.data?.message, status: 'error' });
            setSnackbarState(true);
        }
    };

    const [combinedQuotationDetails, setCombinedQuotationDetails] = useState({});
    const [isCombinedQuotationDetailsSelected, setIsCombinedQuotationDetailsSelected] = useState(false);
    const handleOpenCombinedQuotationDetails = (policy, combinedQuotationDetails, associatedPoCs) => {
        setSelectedPolicy(policy);
        setCombinedQuotationDetails({ combinedQuotationDetails, associatedPoCs });
        setIsCombinedQuotationDetailsSelected(true);
    }
    const handleCloseCombinedQuotationDetails = () => {
        setSelectedPolicy(null);
        setCombinedQuotationDetails({});
        setIsCombinedQuotationDetailsSelected(false);
    }

    const [isPolicySelectedForEdit, setIsPolicySelectedForEdit] = useState(false);
    const [selectedPolicyForEdit, setSelectedPolicyForEdit] = useState({});
    const [selectedPolicyFieldsForEdit, setSelectedPolicyFieldsForEdit] = useState({});
    const [selectedPolicyId, setSelectedPolicyId] = useState('');
    const handleOpenPolicyForEdit = (policyData) => {
        setSelectedPolicyId(policyData._id);
        setSelectedPolicyForEdit(policyData.data);
        setSelectedPolicyFieldsForEdit(policyData.format?.policyForm);
        setIsPolicySelectedForEdit(true);
    };
    const handleClosePolicyForEdit = () => {
        setSelectedPolicyId('');
        setSelectedPolicyForEdit({});
        setSelectedPolicyFieldsForEdit({});
        setIsPolicySelectedForEdit(false);
    };

    const handleEditPolicySubmit = async ({ formData, files }) => {
        try {
            const { status } = await updateClientPolicy({ formData, selectedPolicyId });
            if (status === 200) {
                await uploadUpdateClientPolicyMedia({ ...files, selectedPolicyId: selectedPolicyId });
            }
            reload();
            setSnackbarValue({message: 'Policy details updated successfully!', status: 'success'});
            setSnackbarState(true);
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
                                Initiated On
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quotation
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Assign
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentUnassignedPolicies.map((policy, index) => (
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
                                    <button className="text-gray-600 hover:text-blue-900 mr-2">
                                        <Tooltip title='View policy details'>
                                            <Visibility onClick={() => handleSelectPolicy(policy)} />
                                        </Tooltip>
                                    </button>
                                    <button className="p-1 border border-gray-300 rounded-md shadow-sm text-blue-600 hover:text-blue-900 ml-1 focus:outline-none">
                                        <Tooltip title='View policy details'>
                                            <Edit onClick={() => handleOpenPolicyForEdit(policy)} />
                                        </Tooltip>
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <button className='text-gray-600 mr-2'>
                                        <Tooltip title='More Details'>
                                            <InfoOutlined className='!size-4' onClick={
                                                () => handleOpenCombinedQuotationDetails(
                                                    policy,
                                                    policy?.combinedQuotationDetails,
                                                    policy?.associatedPoCs,
                                                )} />
                                        </Tooltip>
                                    </button>
                                    <button className="p-1 border border-gray-300 rounded-md shadow-sm text-green-600 hover:text-green-900 focus:outline-none">
                                        {(policy?.combinedQuotationDetails && Object.keys(policy?.combinedQuotationDetails).length !== 0 && policy?.combinedQuotationDetails?.status !== 'Pending')
                                            ?
                                            <Tooltip title='Quotation Sent to user'>
                                                <DoneAllOutlined />
                                            </Tooltip>
                                            :
                                            <Tooltip title='Enter quotation' >
                                                <PostAddOutlined onClick={() => handleOpenSendCombinedQuotationModal(policy._id)} />
                                            </Tooltip>
                                        }
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <button className="text-green-600 hover:text-green-900">
                                        <Tooltip title='Policy assigned'>
                                            <Checkbox onChange={() => onAssignPolicy(policy._id)} checked={false} />
                                        </Tooltip>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-700">
                        Showing {indexOfFirstClient + 1} to {Math.min(indexOfLastClient, filteredUnassignedPolicies.length)} of {filteredUnassignedPolicies.length} results
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

                {isCombinedQuotationSelected && (
                    <div className="fixed !z-[1000] inset-0 bg-black/10 flex justify-center items-center">
                        <div className="relative top-10 mx-auto p-5 border w-full lg:w-[50vw] shadow-lg rounded-md bg-white">
                            <input id='excelUpload' type='file' multiple={false} accept='.xlsx,.xls,.csv' onChange={handleFileUpload} className='opacity-0 absolute pointer-events-none' />
                            <div className='bg-gray-100 rounded-md p-4'>
                                <div className="my-8 flex flex-col gap-2 items-center cursor-pointer text-center text-xl" onClick={handleUploadExcel}>
                                    <Upload className='!size-16' />
                                    Upload Excel file to be sent as quotation.<br />
                                    Supported formats: .xlsx, .xls, .csv
                                </div>
                            </div>
                            <p id='excelUploadFileName'></p>
                            <ScrollArea className='max-h-[50vh]'>
                                {combinedQuotationData.length !== 0 && (
                                    <div>
                                        <h2>Imported Excel:</h2>
                                        <Spreadsheet data={combinedQuotationData} setData={setCombinedQuotationData} className='!w-full border-2 border-gray-900 rounded-lg' />
                                    </div>
                                )}
                            </ScrollArea>
                            <div className='w-full flex justify-end mt-2'>
                                <button
                                    type='button'
                                    onClick={handleCloseSendCombinedQuotationModal}
                                    className='px-4 py-2 uppercase rounded-md text-gray-900 bg-white mr-2 border-2 border-gray-900 hover:opacity-95'
                                >Cancel</button>
                                <Button
                                    disabled={combinedQuotationData.length === 0}
                                    onClick={handleSendCombinedQuotation}
                                    className='!px-4 !text-white !bg-gray-900 !hover:opacity-95'
                                >Send
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {isPolicySelected &&
                    <PolicyDetailModal
                        selectedPolicy={selectedPolicy}
                        closeModal={() => setIsPolicySelected(false)}
                    />
                }

                {isCombinedQuotationDetailsSelected &&
                    <CombinedQuotationDetails
                        selectedPolicy={selectedPolicy}
                        details={combinedQuotationDetails}
                        onClose={handleCloseCombinedQuotationDetails}
                        reload={reload}
                    />
                }

                {isPolicySelectedForEdit &&
                    <EditPolicyModal
                        formFields={selectedPolicyFieldsForEdit}
                        formData={selectedPolicyForEdit}
                        setFormData={setSelectedPolicyForEdit}
                        onSubmit={handleEditPolicySubmit}
                        onClose={handleClosePolicyForEdit}
                    />
                }
            </div>
        </div>
    );
};

export default UnassignedPoliciesTable;