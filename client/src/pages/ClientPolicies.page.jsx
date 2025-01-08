import { useContext, useEffect, useState } from 'react';
import { tailChase } from 'ldrs';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Divider, Tab, Tabs } from '@mui/material';
import { Assignment, AssignmentTurnedIn, Event, Info, Person } from '@mui/icons-material';
// importing api end-points
import { fetchPoliciesData } from '../api';
// importing contexts
import { ClientContext } from '../contexts/Client.context';
// importing components
import { ScrollArea } from '../components/subcomponents/ScrollArea';
import Footer from '../components/Footer';
// importing helper functions
import { toFormattedDate } from '../utils/helperFunctions';
import PolicyDetailModal from '../components/subcomponents/PolicyDetailModal';
// import * as XLSX from "xlsx";
// import Spreadsheet from 'react-spreadsheet';
// import { Download } from '@mui/icons-material';

const ClientProfile = () => {
    const { id } = useParams();

    const navigate = useNavigate();
    const { condenseClientInfo } = useContext(ClientContext);
    const [isLoadingClientPolicies, setIsLoadingClientPolicies] = useState(true);
    const [isUnauthorisedAction, setIsUnauthorisedAction] = useState(false);
    const [isClientPoliciesFound, setIsClientPoliciesFound] = useState(true);
    const [clientPolicies, setClientPolicies] = useState(true);
    const [clientName, setClientName] = useState('');

    const getClientPolicies = async () => {
        try {
            const { data } = await fetchPoliciesData({ clientId: id });
            const { clientPolicies, clientFirstName, clientLastName } = data;
            setClientPolicies(clientPolicies);
            if (clientLastName) {
                setClientName(`${clientFirstName} ${clientLastName}`);
            } else {
                setClientName(`${clientFirstName}`);
            }
            setIsLoadingClientPolicies(false);
        } catch (error) {
            const { status } = error;
            const errorMessage = error?.response?.data?.message;
            if (status === 400 && errorMessage === 'Unauthorised action.') {
                setIsLoadingClientPolicies(false);
                setIsUnauthorisedAction(true);
            } else if (status === 404 && errorMessage === 'No client found.') {
                setIsLoadingClientPolicies(false);
                setIsClientPoliciesFound(false);
            } else {
                console.error(error);
            }
        }
    }
    useEffect(() => {
        window.scrollTo(0, 0);
        getClientPolicies();
    }, [id]);

    const [tabIndex, setTabIndex] = useState(0);
    const handleTabIndexChange = (event, newTabIndex) => {
        setTabIndex(newTabIndex);
    };

    const [isPolicySelected, setIsPolicySelected] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState({});
    const selectPolicy = (policyData) => {
        setIsPolicySelected(true);
        setSelectedPolicy(policyData);
    }

    // const [isCompanyPolicySelected, setIsCompanyPolicySelected] = useState(false);
    // const [selectedCompanyPolicies, setSelectedCompanyPolicies] = useState([]);
    // const selectCompanyPolicies = (availablePolicies) => {
    //     setIsCompanyPolicySelected(true);
    //     setSelectedCompanyPolicies(availablePolicies);
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

    tailChase.register();

    return (
        <div>
            {isLoadingClientPolicies ?
                <div className='min-h-screen flex justify-center items-center'>
                    <l-tail-chase size='40' speed='1.75' color='#111827' />
                </div>
                :
                isUnauthorisedAction ?
                    <div className="flex flex-col justify-center items-center my-16">
                        <lord-icon
                            src='https://cdn.lordicon.com/dicvhxpz.json'
                            trigger='morph'
                            stroke='bold' state='morph-cross'
                            colors='primary:#111827,secondary:#111827'
                            style={{ width: '250px', height: '250px' }}
                        />
                        <p className='text-3xl font-semibold text-gray-900'>Unauthorised action performed</p>
                    </div>
                    :
                    !isClientPoliciesFound ?
                        <div className="flex flex-col justify-center items-center my-16">
                            <lord-icon
                                src="https://cdn.lordicon.com/hwjcdycb.json"
                                trigger="hover"
                                colors='primary:#111827,secondary:#111827'
                                style={{ width: '250px', height: '250px' }}
                            />
                            <p className='text-3xl font-semibold text-gray-900'>No client found</p>
                        </div>
                        :
                        <div className='pt-8 pb-16 sm:px-16 bg-white'>
                            <div className="absolute inset-0">
                                <div className="absolute inset-0 bg-[#111827]"></div>
                                <div
                                    className="absolute inset-0 bg-white"
                                    style={{ clipPath: 'polygon(0 65%, 100% 35%, 100% 100%, 0% 100%)' }}
                                />
                            </div>
                            <h1 className='text-3xl text-left font-semibold mb-6 relative text-white '>
                                {id !== condenseClientInfo._id && (
                                    condenseClientInfo.role?.toLowerCase() === 'superadmin' ||
                                    condenseClientInfo.role?.toLowerCase() === 'admin'
                                ) ? `${clientName}'s Policies` : 'My Policies'}
                            </h1>
                            <div className='pb-4 rounded-xl relative bg-white/95 shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
                                <Tabs value={tabIndex} onChange={handleTabIndexChange} TabIndicatorProps={{ style: { background: "#111827" } }}>
                                    <Tab label='Policies Interested In' className='!px-8 !py-4 !text-gray-900' />
                                    <Tab label='Policies Assigned' className='!px-8 !py-4 !text-gray-900' />
                                </Tabs>
                                <Divider />
                                <div className='px-8 py-2'>
                                    {(tabIndex === 0) &&
                                        <>
                                            <p className='text-md text-gray-500 mb-2'>Total policies: {clientPolicies.filter(policy => policy.stage === 'Interested').length}</p>
                                            {clientPolicies.filter(policy => policy.stage === 'Interested').length === 0
                                                ?
                                                <div className='bg-white mb-4 px-6 py-3 rounded-xl shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
                                                    No issued policies
                                                </div>
                                                :
                                                <ScrollArea className='max-h-[100vh]'>
                                                    {clientPolicies.slice().reverse().map((policy) => (
                                                        policy.stage === 'Interested' &&
                                                        <div key={policy?._id} className='bg-white rounded-xl mb-4 px-4 shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
                                                            <div className='pt-3 pb-12 px-2'>
                                                                <h3 className='text-xl font-semibold'>{policy?.policyDetails?.policyName}</h3>
                                                                <div className='flex gap-1.5 items-center mt-1 mb-0.5'>
                                                                    <Person />
                                                                    <span className='text-gray-500'><strong>Applied By:</strong> {policy?.data?.email}</span>
                                                                </div>
                                                                <div className='flex gap-1.5 items-center mt-1 mb-0.5'>
                                                                    <Event />
                                                                    <span className='text-gray-500'><strong> Applied On:</strong> {toFormattedDate(policy.createdAt)}</span>
                                                                </div>
                                                                {policy.availablePolicies?.length > 0 &&
                                                                    <button
                                                                        onClick={() => selectCompanyPolicies(policy?.availablePolicies)}
                                                                        className='float-right mr-4 bg-gray-900 text-white py-1 px-2 rounded-sm hover:opacity-95'
                                                                    >Quotations</button>
                                                                }

                                                                <Button
                                                                    onClick={() => selectPolicy({ data: policy?.data, format: policy?.policyDetails, stage: policy?.stage })}
                                                                    className='!flex !gap-2 !items-center !justify-center float-right mr-4 !text-white !bg-gray-900 py-1 px-2 rounded-sm hover:opacity-95'
                                                                >
                                                                    Details
                                                                    <Info className='!size-4' />
                                                                </Button>
                                                                {/* <Button
                                                                    onClick={() => selectPolicy({ data: policy?.data, format: policy?.policyDetails, stage: policy?.stage })}
                                                                    className='!flex !gap-2 !items-center !justify-center float-right mr-4 !text-white !bg-gray-900 py-1 px-2 rounded-sm hover:opacity-95'
                                                                >
                                                                    Policy Quotation (for Interested)
                                                                    <Info className='!size-4' />
                                                                </Button> */}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                            }
                                        </>
                                    } {(tabIndex === 1) &&
                                        <>
                                            <p className='text-md text-gray-500 mb-2'>Total policies: {clientPolicies.filter(policy => policy.stage === 'Assigned').length}</p>
                                            {clientPolicies.filter(policy => policy.stage === 'Assigned').length === 0
                                                ?
                                                <div className='bg-white mb-4 px-6 py-3 rounded-xl shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
                                                    No policies assigned
                                                </div>
                                                :
                                                <ScrollArea className='max-h-[100vh]'>
                                                    {clientPolicies.slice().reverse().map((policy) => (
                                                        policy.stage === 'Assigned' &&
                                                        <div key={policy?._id} className='bg-white rounded-xl mb-4 px-4 shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
                                                            <div className='pt-3 pb-12 px-2'>
                                                                <h3 className='text-xl font-semibold'>{policy?.policyDetails?.policyName}</h3>
                                                                <div className='flex gap-1.5 items-center mt-1 mb-0.5'>
                                                                    <Person />
                                                                    <span className='text-gray-500'><strong>Applied By:</strong> {policy?.data?.email}</span>
                                                                </div>
                                                                <div className='flex gap-1.5 items-center mt-1 mb-0.5'>
                                                                    <Event />
                                                                    <span className='text-gray-500'><strong>Applied On:</strong> {toFormattedDate(policy.createdAt)}</span>
                                                                </div>
                                                                <div className='flex gap-1.5 items-center mt-1 mb-0.5'>
                                                                    <AssignmentTurnedIn />
                                                                    <span className='text-gray-500'><strong>Assigned By:</strong> {policy?.data?.assignedBy}</span>
                                                                </div>
                                                                {/* {policy.availablePolicies?.length > 0 &&
                                                                    <button
                                                                        onClick={() => selectCompanyPolicies(policy?.availablePolicies)}
                                                                        className='float-right mr-4 bg-gray-900 text-white py-1 px-2 rounded-sm hover:opacity-95'
                                                                    >Quotations</button>
                                                                } */}
                                                                <Button
                                                                    onClick={() => selectPolicy({ data: policy?.data, format: policy?.policyDetails, stage: policy?.stage })}
                                                                    className='!ml-2 !flex !gap-2 !items-center !justify-center float-right mr-4 !text-white !bg-gray-900 py-1 px-2 rounded-sm hover:opacity-95'
                                                                >
                                                                    Details
                                                                    <Info className='!size-4' />
                                                                </Button>
                                                                {/* <Button
                                                                    className='!flex !gap-2 !items-center !justify-center float-right mr-4 !text-white !bg-gray-900 py-1 px-2 rounded-sm hover:opacity-95'
                                                                >
                                                                    Policy Certificate
                                                                    <Assignment className='!size-4' />
                                                                </Button> */}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                            }
                                        </>
                                    }
                                </div>
                            </div>

                            <div className='relative bg-white/95 mt-4 p-6 rounded-xl shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
                                <h1 className='text-3xl text-left font-semibold'>
                                    Renew Policy
                                </h1>
                                <p className='mb-2'>
                                    To renew any lapsed policy, contact our customer support:
                                </p>
                                <ul>
                                    <li className='ml-2'>• <strong>Phone</strong>: +91 9876543210</li>
                                    <li className='ml-2'>• <strong>Email</strong>: support@paarasinsurance.com</li>
                                </ul>
                                <p className='mt-2'>
                                    Our team will guide you through the process of renewing your policy and provide you with the necessary information and requirements.
                                </p>
                            </div>

                            {isPolicySelected &&
                                <PolicyDetailModal
                                    selectedPolicy={selectedPolicy}
                                    closeModal={() => setIsPolicySelected(false)}
                                />
                            }
                        </div>
            }
            <Footer />
        </div>
    );
}

export default ClientProfile;