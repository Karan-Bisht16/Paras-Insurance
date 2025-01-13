import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Divider, Tab, Tabs } from '@mui/material';
import { Assignment, AssignmentTurnedIn, Close, Download, Event, Info, List, MailOutline, OpenInNew, Person, Phone, Upload } from '@mui/icons-material';
import Spreadsheet from 'react-spreadsheet';
import * as XLSX from "xlsx";
import { tailChase } from 'ldrs';
// importing api end-points
import { fetchSips, fetchPoliciesData, fetchGeneralInsurances, uploadExisitingClientPolicy, uploadExisitingClientPolicyMedia } from '../api';
// importing contexts
import { ClientContext } from '../contexts/Client.context';
import { SnackBarContext } from '../contexts/SnackBar.context';
// importing components
import { ScrollArea } from '../components/subcomponents/ScrollArea';
import PolicyDetailModal from '../components/subcomponents/PolicyDetailModal';
import SipDetailModal from '../components/subcomponents/SipDetailModal';
import Footer from '../components/Footer';
// importing helper functions
import { toFormattedDate } from '../utils/helperFunctions';
import AssignPolicyModal from '../components/subcomponents/AssignPolicyModal';

// TODO: General Insurance table me add kardo
const ClientPolicies = () => {
    const { id } = useParams();

    const { condenseClientInfo } = useContext(ClientContext);
    const { setSnackbarState, setSnackbarValue } = useContext(SnackBarContext);
    const [isLoadingClientPolicies, setIsLoadingClientPolicies] = useState(true);
    const [isUnauthorisedAction, setIsUnauthorisedAction] = useState(false);
    const [isClientPoliciesFound, setIsClientPoliciesFound] = useState(true);
    const [clientPolicies, setClientPolicies] = useState([]);
    const [clientSips, setClientSips] = useState([]);
    const [clientGeneralInsurances, setClientGeneralInsurances] = useState([]);
    const [clientName, setClientName] = useState('');

    const getClientPoliciesAndSipsAndGeneralInsurances = async () => {
        try {
            const { status, data } = await fetchPoliciesData({ clientId: id });
            const { clientPolicies, clientFirstName, clientLastName } = data;
            setClientPolicies(clientPolicies);
            if (clientLastName) {
                setClientName(`${clientFirstName} ${clientLastName}`);
            } else {
                setClientName(`${clientFirstName}`);
            }
            const resultSips = await fetchSips({ clientId: id });
            setClientSips(resultSips?.data);

            const resultGeneralInsurances = await fetchGeneralInsurances({ clientId: id });
            setClientGeneralInsurances(resultGeneralInsurances?.data);

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
        getClientPoliciesAndSipsAndGeneralInsurances();
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

    const [isSipSelected, setIsSipSelected] = useState(false);
    const [selectedSip, setSelectedSip] = useState({})
    const selectSip = (sip) => {
        setIsSipSelected(true);
        setSelectedSip(sip)
    }

    const [isGeneralInsuranceSelected, setIsGeneralInsuranceSelected] = useState(false);
    const [selectedGeneralInsurance, setSelectedGeneralInsurance] = useState({})
    const selectGeneralInsurance = (generalInsurance) => {
        setIsGeneralInsuranceSelected(true);
        setSelectedGeneralInsurance(generalInsurance)
    }

    const handleOpenInNew = (policyDocumentURL) => {
        window.open(policyDocumentURL, "_blank");
    }

    const [isCombinedQuotationSelected, setIsCombinedQuotationSelected] = useState(false);
    const [selectedCombinedQuotation, setSelectedCombinedQuotation] = useState([]);
    const transformQuotationData = (inputArray) => {
        if (inputArray[0].length === 0) {
            inputArray.shift();
        }
        let transformedArray = [];

        let headerRow = inputArray[0].map(item => ({
            value: item || "",
            readOnly: true
        }));
        transformedArray.push(headerRow);

        inputArray.slice(1).forEach(row => {
            let transformedRow = row.map(item => ({
                value: item || "",
                readOnly: true
            }));
            transformedArray.push(transformedRow);
        });

        return transformedArray;
    }
    const selectCombinedQuotation = (combinedQuotationDetails) => {
        let combinedQuotation = combinedQuotationDetails?.quotationData;
        if (combinedQuotationDetails?.status !== 'UploadedByAdmin') {
            combinedQuotation = transformQuotationData(combinedQuotationDetails?.quotationData);
        }
        setSelectedCombinedQuotation(combinedQuotation);
        setIsCombinedQuotationSelected(true);
    }
    const closeCompanyPolicies = () => {
        setSelectedCombinedQuotation([]);
        setIsCombinedQuotationSelected(false);
    }
    const handleDownloadExcel = () => {
        const worksheetData = selectedCombinedQuotation.map((row) =>
            Array.isArray(row) ? row.map((cell) => (cell.value ? cell.value : cell)) : row
        );
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, "Quotation.xlsx");
    };

    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        firstName: condenseClientInfo?.firstName,
        lastName: condenseClientInfo?.lastName,
        email: condenseClientInfo?.email,
        phone: condenseClientInfo?.phone,
        expiryDate: '',
        policyNo: ''
    });
    const handleFormDataChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => { return { ...prevFormData, [name]: value } });
    }
    const [policyDocument, setPolicyDocument] = useState('');
    const handleDocumentUpload = (event) => {
        const file = event.target.files[0];
        setPolicyDocument(prevFiles => {
            return { ...prevFiles, 'policyDocument': file }
        });
    }
    const [isAssignPolicyModalOpen, setIsAssignPolicyModalOpen] = useState(false);
    const openAssignPolicyModal = () => {
        setIsAssignPolicyModalOpen(true);
    }
    const closeAssignPolicyModal = () => {
        setIsAssignPolicyModalOpen(false);
        setPolicyDocument('');
        setFormData({ expiryDate: '', policyNo: '' });
    }

    const handleSubmit = async () => {
        event.preventDefault();
        setError('');
        try {
            const { data } = await uploadExisitingClientPolicy({ formData });
            await uploadExisitingClientPolicyMedia({ ...policyDocument, clientPolicyId: data?._id })
            getClientPoliciesAndSipsAndGeneralInsurances();
            setSnackbarValue({ message: 'Policy Assigned!', status: 'success' });
            setSnackbarState(true);
            closeAssignPolicyModal();
        } catch (error) {
            setError(error?.response?.data?.message);
        }
    }

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
                            <div className='relative mb-6 flex justify-between'>
                                <h1 className='text-3xl text-left font-semibold text-white '>
                                    {id !== condenseClientInfo._id && (
                                        condenseClientInfo.role?.toLowerCase() === 'superadmin' ||
                                        condenseClientInfo.role?.toLowerCase() === 'admin'
                                    ) ? `${clientName}'s Policies` : 'My Policies'}
                                </h1>
                                <Button
                                    onClick={openAssignPolicyModal}
                                    className='!bg-white !text-gray-900 hover:opacity-95'
                                >
                                    <Upload className='!size-5 mr-1' />
                                    Upload Existing Policy
                                </Button>
                            </div>
                            <div className='pb-4 rounded-xl relative bg-white/95 shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
                                <Tabs
                                    value={tabIndex} onChange={handleTabIndexChange} variant="scrollable"
                                    scrollButtons="auto" TabIndicatorProps={{ style: { background: "#111827" } }}
                                >
                                    <Tab label='Policies Interested In' className='!px-8 !py-4 !text-gray-900' />
                                    <Tab label='Policies Assigned' className='!px-8 !py-4 !text-gray-900' />
                                    <Tab label='SIP(s) Interested In' className='!px-8 !py-4 !text-gray-900' />
                                    <Tab label='SIP(s) Assigned' className='!px-8 !py-4 !text-gray-900' />
                                    <Tab label='General Insurances Interested In ' className='!px-8 !py-4 !text-gray-900' />
                                    <Tab label='General Insurances Assigned' className='!px-8 !py-4 !text-gray-900' />
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
                                                <ScrollArea className='max-h-[75vh]'>
                                                    {clientPolicies.slice().reverse().map((policy, index) => (
                                                        policy.stage === 'Interested' &&
                                                        <div key={index} className='bg-white rounded-xl mb-4 px-4 shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
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
                                                                <Button
                                                                    onClick={() => selectPolicy({ data: policy?.data, format: policy?.policyDetails, stage: policy?.stage })}
                                                                    className='!flex !gap-2 !items-center !justify-center float-right !text-white !bg-gray-900 py-1 px-2 rounded-sm hover:opacity-95'
                                                                >
                                                                    Details
                                                                    <Info className='!size-4' />
                                                                </Button>
                                                                {policy?.combinedQuotationDetails && Object.keys(policy?.combinedQuotationDetails).length !== 0 &&
                                                                    <Button
                                                                        onClick={() => selectCombinedQuotation(policy?.combinedQuotationDetails)}
                                                                        className='!flex !gap-2 !items-center !justify-center float-right !mr-4 !text-white !bg-gray-900 py-1 px-2 rounded-sm hover:opacity-95'
                                                                    >
                                                                        Quotations
                                                                        <List className='!size-4' />
                                                                    </Button>
                                                                }
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
                                                <ScrollArea className='max-h-[75vh]'>
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
                                                                    <span className='text-gray-500'><strong>Expiry Date:</strong> {policy?.expiryDate}</span>
                                                                </div>
                                                                <Button
                                                                    onClick={() => selectPolicy({ data: policy?.data, format: policy?.policyDetails, stage: policy?.stage })}
                                                                    className='!ml-2 !flex !gap-2 !items-center !justify-center float-right mr-4 !text-white !bg-gray-900 py-1 px-2 rounded-sm hover:opacity-95'
                                                                >
                                                                    Details
                                                                    <Info className='!size-4' />
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleOpenInNew(policy?.policyDocumentURL)}
                                                                    className='!flex !gap-2 !items-center !justify-center float-right mr-4 !text-white !bg-gray-900 py-1 px-2 rounded-sm hover:opacity-95'
                                                                >
                                                                    Policy Certificate
                                                                    <Assignment className='!size-4' />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                            }
                                        </>
                                    } {(tabIndex === 2) &&
                                        <>
                                            <p className='text-md text-gray-500 mb-2'>Total SIPs: {clientSips.filter(sip => sip.stage === 'Interested').length}</p>
                                            {clientSips.length === 0
                                                ?
                                                <div className='bg-white mb-4 px-6 py-3 rounded-xl shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
                                                    No Sips found
                                                </div>
                                                :
                                                <ScrollArea className='max-h-[75vh]'>
                                                    {clientSips.slice().reverse().map((sip, index) => (
                                                        sip.stage === 'Interested' &&
                                                        <div key={index} className='bg-white rounded-xl mb-4 px-4 shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
                                                            <div className='py-3 px-2'>
                                                                <div className='flex gap-1.5 items-center mt-1 mb-0.5'>
                                                                    <Event />
                                                                    <span className='text-gray-500'><strong> Applied On:</strong> {toFormattedDate(sip.createdAt)}</span>
                                                                </div>
                                                                <div className='flex gap-1.5 items-center mt-1 mb-0.5'>
                                                                    <MailOutline />
                                                                    <span className='text-gray-500'><strong> SIP Email:</strong> {sip?.personalDetails?.contact?.email}</span>
                                                                </div>
                                                                <div className='flex gap-1.5 items-center mt-1 mb-0.5'>
                                                                    <Phone />
                                                                    <span className='text-gray-500'><strong> SIP Phone:</strong> {sip?.personalDetails?.contact?.phone}</span>
                                                                </div>
                                                                <div className='flex justify-end'>
                                                                    <Button
                                                                        onClick={() => selectSip(sip)}
                                                                        className='!flex !gap-2 !items-center !justify-center !text-white !bg-gray-900 py-1 px-2 rounded-sm hover:opacity-95'
                                                                    >
                                                                        Details
                                                                        <Info className='!size-4' />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                            }
                                        </>
                                    } {(tabIndex === 3) &&
                                        <>
                                            <p className='text-md text-gray-500 mb-2'>Total SIPs: {clientSips.filter(sip => sip.stage === 'Assigned').length}</p>
                                            {clientSips.length === 0
                                                ?
                                                <div className='bg-white mb-4 px-6 py-3 rounded-xl shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
                                                    No Sips found
                                                </div>
                                                :
                                                <ScrollArea className='max-h-[75vh]'>
                                                    {clientSips.slice().reverse().map((sip, index) => (
                                                        sip.stage === 'Assigned' &&
                                                        <div key={index} className='bg-white rounded-xl mb-4 px-4 shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
                                                            <div className='py-3 px-2'>
                                                                <div className='flex gap-1.5 items-center mt-1 mb-0.5'>
                                                                    <Event />
                                                                    <span className='text-gray-500'><strong> Applied On:</strong> {toFormattedDate(sip.createdAt)}</span>
                                                                </div>
                                                                <div className='flex gap-1.5 items-center mt-1 mb-0.5'>
                                                                    <MailOutline />
                                                                    <span className='text-gray-500'><strong> SIP Email:</strong> {sip?.personalDetails?.contact?.email}</span>
                                                                </div>
                                                                <div className='flex gap-1.5 items-center mt-1 mb-0.5'>
                                                                    <Phone />
                                                                    <span className='text-gray-500'><strong> SIP Phone:</strong> {sip?.personalDetails?.contact?.phone}</span>
                                                                </div>
                                                                <div className='flex gap-2 justify-end'>
                                                                    <Button
                                                                        onClick={() => handleOpenInNew(sip?.sipDocumentURL)}
                                                                        className='!flex !gap-2 !items-center !justify-center float-right mr-4 !text-white !bg-gray-900 py-1 px-2 rounded-sm hover:opacity-95'
                                                                    >
                                                                        SIP Certificate
                                                                        <Assignment className='!size-4' />
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => selectSip(sip)}
                                                                        className='!flex !gap-2 !items-center !justify-center !text-white !bg-gray-900 py-1 px-2 rounded-sm hover:opacity-95'
                                                                    >
                                                                        Details
                                                                        <Info className='!size-4' />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                            }
                                        </>
                                    } {(tabIndex === 4) &&
                                        <>
                                            <p className='text-md text-gray-500 mb-2'>Total General Insurances: {clientGeneralInsurances.filter(generalInsurance => generalInsurance.stage === 'Interested').length}</p>
                                            {clientGeneralInsurances.length === 0
                                                ?
                                                <div className='bg-white mb-4 px-6 py-3 rounded-xl shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
                                                    No General Insurance found
                                                </div>
                                                :
                                                <ScrollArea className='max-h-[75vh]'>
                                                    {clientGeneralInsurances.slice().reverse().map((generalInsurance, index) => (
                                                        generalInsurance.stage === 'Interested' &&
                                                        <div key={index} className='bg-white rounded-xl mb-4 px-4 shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
                                                            <div className='py-3 px-2'>
                                                                <h3 className='text-xl font-semibold'>{generalInsurance?.policyType}</h3>
                                                                <div className='flex gap-1.5 items-center mt-1 mb-0.5'>
                                                                    <Event />
                                                                    <span className='text-gray-500'><strong> Applied On:</strong> {toFormattedDate(generalInsurance.createdAt)}</span>
                                                                </div>
                                                                <div className='flex gap-1.5 items-center mt-1 mb-0.5'>
                                                                    <MailOutline />
                                                                    <span className='text-gray-500'><strong> SIP Email:</strong> {generalInsurance?.personalDetails?.contact?.email}</span>
                                                                </div>
                                                                <div className='flex gap-1.5 items-center mt-1 mb-0.5'>
                                                                    <Phone />
                                                                    <span className='text-gray-500'><strong> SIP Phone:</strong> {generalInsurance?.personalDetails?.contact?.phone}</span>
                                                                </div>
                                                                <div className='flex justify-end'>
                                                                    <Button
                                                                        onClick={() => selectGeneralInsurance(generalInsurance)}
                                                                        className='!flex !gap-2 !items-center !justify-center !text-white !bg-gray-900 py-1 px-2 rounded-sm hover:opacity-95'
                                                                    >
                                                                        Details
                                                                        <Info className='!size-4' />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                            }
                                        </>
                                    } {(tabIndex === 5) &&
                                        <>
                                            <p className='text-md text-gray-500 mb-2'>Total General Insurances: {clientGeneralInsurances.filter(generalInsurance => generalInsurance.stage === 'Assigned').length}</p>
                                            {clientGeneralInsurances.length === 0
                                                ?
                                                <div className='bg-white mb-4 px-6 py-3 rounded-xl shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
                                                    No General Insurance found
                                                </div>
                                                :
                                                <ScrollArea className='max-h-[75vh]'>
                                                    {clientGeneralInsurances.slice().reverse().map((generalInsurance, index) => (
                                                        generalInsurance.stage === 'Assigned' &&
                                                        <div key={index} className='bg-white rounded-xl mb-4 px-4 shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]'>
                                                            <div className='py-3 px-2'>
                                                                <h3 className='text-xl font-semibold'>{generalInsurance?.policyType}</h3>
                                                                <div className='flex gap-1.5 items-center mt-1 mb-0.5'>
                                                                    <Event />
                                                                    <span className='text-gray-500'><strong> Applied On:</strong> {toFormattedDate(generalInsurance.createdAt)}</span>
                                                                </div>
                                                                <div className='flex gap-1.5 items-center mt-1 mb-0.5'>
                                                                    <MailOutline />
                                                                    <span className='text-gray-500'><strong> SIP Email:</strong> {generalInsurance?.personalDetails?.contact?.email}</span>
                                                                </div>
                                                                <div className='flex gap-1.5 items-center mt-1 mb-0.5'>
                                                                    <Phone />
                                                                    <span className='text-gray-500'><strong> SIP Phone:</strong> {generalInsurance?.personalDetails?.contact?.phone}</span>
                                                                </div>
                                                                <div className='flex gap-2 justify-end'>
                                                                    <Button
                                                                        onClick={() => handleOpenInNew(generalInsurance?.generalInsuranceDocumentURL)}
                                                                        className='!flex !gap-2 !items-center !justify-center float-right mr-4 !text-white !bg-gray-900 py-1 px-2 rounded-sm hover:opacity-95'
                                                                    >
                                                                        General Insurance Certificate
                                                                        <Assignment className='!size-4' />
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => selectGeneralInsurance(generalInsurance)}
                                                                        className='!flex !gap-2 !items-center !justify-center !text-white !bg-gray-900 py-1 px-2 rounded-sm hover:opacity-95'
                                                                    >
                                                                        Details
                                                                        <Info className='!size-4' />
                                                                    </Button>
                                                                </div>
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
                            {isSipSelected &&
                                <SipDetailModal
                                    label='SIP'
                                    selectedSip={selectedSip}
                                    closeModal={() => setIsSipSelected(false)}
                                />
                            }
                            {isGeneralInsuranceSelected &&
                                <SipDetailModal
                                    label={`General Insurance (${selectedGeneralInsurance?.policyType})`}
                                    selectedSip={selectedGeneralInsurance}
                                    closeModal={() => setIsGeneralInsuranceSelected(false)}
                                />
                            }
                            {isAssignPolicyModalOpen
                                &&
                                <AssignPolicyModal
                                    closeAssignPolicyModal={closeAssignPolicyModal}
                                    onSubmit={handleSubmit}
                                    formData={formData}
                                    onFormDataChange={handleFormDataChange}
                                    onDocumentUpload={handleDocumentUpload}
                                    tabIndex={3}
                                    error={error}
                                />
                            }
                            {isCombinedQuotationSelected &&
                                <div className='fixed inset-0 bg-black/10 !z-[1000] flex justify-center items-center' onClick={closeCompanyPolicies}>
                                    <div onClick={(event) => event.stopPropagation()} className='bg-white max-w-[75vw] max-h-[75vh] overflow-y-scroll no-scrollbar rounded-lg'>
                                        <div className='px-6 py-4 flex justify-between items-center'>
                                            <h2 className='text-2xl font-bold mb-2'>Quotation(s)</h2>
                                            <Close onClick={closeCompanyPolicies} className='cursor-pointer' />
                                        </div>
                                        <Divider />
                                        <div className='mx-6 mt-3 mb-4'>
                                            <Button
                                                type='button'
                                                onClick={handleDownloadExcel}
                                                className='!flex !items-center !gap-2 !bg-gray-900 !text-white float-right'
                                            >
                                                Download Excel
                                                <Download className='!size-4' />
                                            </Button>
                                            <br />
                                            <ScrollArea className='w-full mt-6 rounded-lg border-2 border-gray-900'>
                                                <div>
                                                    <Spreadsheet data={selectedCombinedQuotation} />
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
            }
            <Footer />
        </div>
    );
}

export default ClientPolicies;