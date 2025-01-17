import { useContext, useEffect, useState } from 'react';
import { Tab, Tabs, Tooltip } from '@mui/material';
// importing api end-points
import { assignClientPolicy, assignSip, fetchAllUnassignedGeneralInsurances, fetchAllUnassignedSips, fetchAllUnassignedPolicies, uploadAssignClientPolicyMedia, uploadAssignSipMedia, assignGeneralInsurance, uploadAssignGeneralInsuranceMedia } from '../../api';
// importing contexts
import { SnackBarContext } from '../../contexts/SnackBar.context';
// importing components
import UnassignedPoliciesTable from './dashboard/UnassignedPoliciesTable';
import UnassignedSipsTable from './dashboard/UnassignedSipsTable';
import AssignPolicyModal from '../subcomponents/AssignPolicyModal';

const Dashboard = () => {
    const { setSnackbarState, setSnackbarValue } = useContext(SnackBarContext);
    const [tabIndex, setTabIndex] = useState(0);
    const handleTabIndexChange = (event, newTabIndex) => {
        setTabIndex(newTabIndex);
    };

    const [unassignedPolicies, setUnassignedPolicies] = useState([]);
    const getAllUnassignedPolicies = async () => {
        try {
            const { data } = await fetchAllUnassignedPolicies();
            setUnassignedPolicies(data);
        } catch (error) {
            console.error(error);
        }
    }

    const [unassignedSips, setUnassignedSips] = useState([]);
    const getAllUnassignedSips = async () => {
        try {
            const { data } = await fetchAllUnassignedSips();
            setUnassignedSips(data);
        } catch (error) {
            console.error(error);
        }
    }

    const [unassignedGeneralInsurances, setUnassignedGeneralInsurances] = useState([]);
    const getAllUnassignedGeneralInsurances = async () => {
        try {
            const { data } = await fetchAllUnassignedGeneralInsurances();
            setUnassignedGeneralInsurances(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getAllUnassignedPolicies();
        getAllUnassignedSips();
        getAllUnassignedGeneralInsurances();
    }, []);

    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
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
    const [assignPolicyID, setAssignPolicyID] = useState(null);
    const [isAssignPolicyModalOpen, setIsAssignPolicyModalOpen] = useState(false);
    const openAssignPolicyModal = (id) => {
        setAssignPolicyID(id)
        setIsAssignPolicyModalOpen(true);
    }
    const closeAssignPolicyModal = () => {
        setIsAssignPolicyModalOpen(false);
        setAssignPolicyID(null)
        setPolicyDocument('');
        setFormData({ expiryDate: '', policyNo: '' });
    }

    const handleSubmit = async () => {
        event.preventDefault();
        try {
            setError('');
            if (tabIndex === 0) {
                const { status } = await assignClientPolicy({ assignPolicyID, formData });
                if (status === 200) {
                    await uploadAssignClientPolicyMedia({ ...policyDocument, assignPolicyID })
                    getAllUnassignedPolicies();
                    setSnackbarValue({ message: 'Policy Assigned!', status: 'success' });
                }
            } else if (tabIndex === 1) {
                const { status } = await assignSip({ assignSipID: assignPolicyID, formData });
                if (status === 200) {
                    await uploadAssignSipMedia({ ...policyDocument, assignSipID: assignPolicyID })
                    getAllUnassignedSips();
                    setSnackbarValue({ message: 'SIP Assigned!', status: 'success' });
                }
            } else if (tabIndex === 2) {
                const { status } = await assignGeneralInsurance({ assignGeneralInsuranceID: assignPolicyID, formData });
                if (status === 200) {
                    await uploadAssignGeneralInsuranceMedia({ ...policyDocument, assignGeneralInsuranceID: assignPolicyID })
                    getAllUnassignedGeneralInsurances();
                    setSnackbarValue({ message: 'General Insurance Assigned!', status: 'success' });
                }
            }
            setSnackbarState(true);
            closeAssignPolicyModal();
        } catch (error) {
            setError(error?.response?.data?.message);
        }
    }

    const reload = () => {
        if (tabIndex === 0) {
            getAllUnassignedPolicies();
        } else if (tabIndex === 1) {
            getAllUnassignedSips();
        } else if (tabIndex === 2) {
            getAllUnassignedGeneralInsurances();
        }
    }

    return (
        <div>
            <div className="flex justify-between items-end">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">
                    Unassigned&nbsp;
                    {(tabIndex === 0) && `Policies (${unassignedPolicies?.length})`}
                    {(tabIndex === 1) && `SIP(s) (${unassignedSips?.length})`}
                    {(tabIndex === 2) && `General Insurances (${unassignedGeneralInsurances?.length})`}
                </h1>
                <Tabs
                    value={tabIndex} onChange={handleTabIndexChange} TabIndicatorProps={{ style: { background: "#111827" } }}
                    className='absolute translate-x-[83%] bg-white rounded-t-xl'
                >
                    <Tab label='Policies' className='!px-8 !py-4 !text-gray-900' />
                    <Tab label='SIP(s)' className='!px-8 !py-4 !text-gray-900' />
                    <Tab label='General Insurances' className='!px-8 !py-4 !text-gray-900' />
                </Tabs>
                <Tooltip title='Refresh Data'>
                    <lord-icon
                        src="https://cdn.lordicon.com/jxhgzthg.json"
                        trigger="click" stroke="bold" state="loop-cycle"
                        colors="primary:#111827,secondary:#111827"
                        style={{ width: '25px', height: '25px', cursor: 'pointer', marginBottom: '1.5rem' }}
                        onClick={reload}
                    />
                </Tooltip>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    {(tabIndex === 0) &&
                        <UnassignedPoliciesTable
                            unassignedPolicies={unassignedPolicies}
                            onAssignPolicy={openAssignPolicyModal}
                            reload={getAllUnassignedPolicies}
                        />
                    } {(tabIndex === 1) &&
                        <UnassignedSipsTable
                            unassignedSips={unassignedSips}
                            onAssignSip={openAssignPolicyModal}
                            reload={getAllUnassignedSips}
                        />
                    }{(tabIndex === 2) &&
                        <UnassignedSipsTable
                            unassignedSips={unassignedGeneralInsurances}
                            onAssignSip={openAssignPolicyModal}
                            reload={getAllUnassignedGeneralInsurances}
                            isGeneralInsurance={true}
                        />
                    }
                </div>
            </div>

            {isAssignPolicyModalOpen
                &&
                <AssignPolicyModal
                    closeAssignPolicyModal={closeAssignPolicyModal}
                    onSubmit={handleSubmit}
                    formData={formData}
                    onFormDataChange={handleFormDataChange}
                    onDocumentUpload={handleDocumentUpload}
                    tabIndex={tabIndex}
                    error={error}
                />
            }
        </div>
    );
}

export default Dashboard;