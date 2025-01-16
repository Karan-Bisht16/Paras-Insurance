import { useContext, useEffect, useState } from 'react';
import { CircularProgress, Tab, Tabs, Tooltip } from '@mui/material';
// importing api end-points
import { fetchAllAssignedGeneralInsurances, fetchAllAssignedPolicies, fetchAllAssignedSips, importClientPolicyCsv } from '../../api';
// importing contexts
import { SnackBarContext } from '../../contexts/SnackBar.context';
// importing components
import AssignedPoliciesTable from './policies/AssignedPoliciesTable';
import AssignedSipsTable from './policies/AssignedSipsTable';
import { Download, Upload } from '@mui/icons-material';

const PolicyManagement = () => {
    const { setSnackbarState, setSnackbarValue } = useContext(SnackBarContext);
    const [tabIndex, setTabIndex] = useState(0);
    const handleTabIndexChange = (event, newTabIndex) => {
        setTabIndex(newTabIndex);
    };

    const [assignedPolicies, setAssignedPolicies] = useState([]);
    const getAllAssignedPolicies = async () => {
        try {
            const { data } = await fetchAllAssignedPolicies();
            setAssignedPolicies(data);
        } catch (error) {
            console.error(error);
        }
    }

    const [assignedSips, setAssignedSips] = useState([]);
    const getAllAssignedSips = async () => {
        try {
            const { data } = await fetchAllAssignedSips();
            setAssignedSips(data);
        } catch (error) {
            console.error(error);
        }
    }

    const [assignedGeneralInsurances, setAssignedGeneralInsurances] = useState([]);
    const getAllAssignedGeneralInsurances = async () => {
        try {
            const { data } = await fetchAllAssignedGeneralInsurances();
            setAssignedGeneralInsurances(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getAllAssignedPolicies();
        getAllAssignedSips();
        getAllAssignedGeneralInsurances();
    }, []);

    const reload = () => {
        if (tabIndex === 0) {
            getAllAssignedPolicies();
        } else if (tabIndex === 1) {
            getAllAssignedSips();
        } else if (tabIndex === 2) {
            getAllAssignedGeneralInsurances();
        }
    }

    const [imporingCsv, setImportingCsv] = useState(false);
    const handleFileUpload = async (event) => {
        setImportingCsv(true);
        try {
            const file = event.target.files[0];
            await importClientPolicyCsv({ file });
            reload();
            setSnackbarValue({ message: `${file.name} imported successfully!`, status: 'success' });
        } catch (error) {
            setSnackbarValue({ message: error?.response?.data?.message, status: 'error' });
        }
        setImportingCsv(false);
        setSnackbarState(true);
    };

    const downloadSampleCSV = () => {
        const sampleData = `_id,policyId,clientId,stage,policyDocumentURL,createdAt,updatedAt,assignedBy,expiryDate,policyNo,origin,data.firstName,data.lastName,data.email,data.phone,data.role,data.loginAccess,data.dob,data.gender,data.insurancePlan,data.street,data.city,data.state,data.PINCODE,data.country,data.substanceUse,data.disease,data.1nomineeName,data.1nomineeDOB,data.1nomineeRelation,data.1nomineeDisease,data.age,data.sumInsured,data.1memberFirstName,data.1memberLastName,data.1memberGender,data.1memberAge,data.1memberRelation,data.1memberSubstanceUse,data.passportNo,data.tickets
        67828d3c55fde81a1702d8a1,6777932ef2013d3cfcc27347,677ad0e3198ff6af3c393c86,Interested,,2025-01-11T15:24:44.239Z,2025-01-11T15:27:43.082Z,,,,,Gautum,Gulati,tvpgits@gmail.com,9971280816,Client,true,,,,,,110063,,,,Yes,,,,,,,,,,,,,,,,,,
        6782916d50c47627311ae372,6749f62acc685fd8ec7c2260,677ad0e3198ff6af3c393c86,Assigned,policyDocument-4261804a-1358-48de-984b-8ecccc679d62.jpg,2025-01-11T15:42:37.201Z,2025-01-11T17:18:35.220Z,Kiran Bisht,2025-01-25,,,Gautum,Gulati,tvpgits@gmail.com,9971280816,Client,true,1999-01-01,Male,Term Plan,House No 299,New Delhi,Delhi,110063,India,,,,,,,,,,,,,,,,,,
        67843a81cc232732a91d8f94,6749f86bcc685fd8ec7c2264,677ad0e3198ff6af3c393c86,Interested,,2025-01-12T21:56:17.031Z,2025-01-12T21:56:17.031Z,,,,,Gautum,Gulati,tvpgits@gmail.com,9971280816,Client,true,,,,,,New Delhi,Delhi,,,,Drink,,Me,,58,100,john,,Male,89,Father,[Smoke Drink Tobacco],4564,2`;
        
        const blob = new Blob([sampleData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_clientPolicies.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="flex justify-between items-end">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">
                    Assigned&nbsp;
                    {(tabIndex === 0) && `Policies (${assignedPolicies?.length})`}
                    {(tabIndex === 1) && `SIP(s) (${assignedSips?.length})`}
                    {(tabIndex === 2) && `General Insurances (${assignedGeneralInsurances?.length})`}
                </h1>
                <Tabs
                    value={tabIndex} onChange={handleTabIndexChange} TabIndicatorProps={{ style: { background: "#111827" } }}
                    className='absolute translate-x-[83%] bg-white rounded-t-xl'
                >
                    <Tab label='Policies' className='!px-8 !py-4 !text-gray-900' />
                    <Tab label='SIP(s)' className='!px-8 !py-4 !text-gray-900' />
                    <Tab label='General Insurances' className='!px-8 !py-4 !text-gray-900' />
                </Tabs>
                <div className="flex gap-3 items-center mb-6">
                    <label className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center gap-2 justify-between hover:bg-green-700 cursor-pointer">
                        {imporingCsv ?
                            <CircularProgress className='!size-6 !text-white' />
                            :
                            <Upload />
                        }
                        Import CSV
                        <input
                            type="file" accept=".csv" disabled={imporingCsv}
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                    <button
                        onClick={downloadSampleCSV}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-2 justify-between hover:bg-blue-700"
                    >
                        <Download />
                        Sample CSV
                    </button>
                    <Tooltip title='Refresh Data'>
                        <lord-icon
                            src="https://cdn.lordicon.com/jxhgzthg.json"
                            trigger="click" stroke="bold" state="loop-cycle"
                            colors="primary:#111827,secondary:#111827"
                            style={{ width: '25px', height: '25px', cursor: 'pointer' }}
                            onClick={reload}
                        />
                    </Tooltip>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    {(tabIndex === 0) &&
                        <AssignedPoliciesTable
                            assignedPolicies={assignedPolicies}
                            reload={getAllAssignedPolicies}
                        />
                    } {(tabIndex === 1) &&
                        <AssignedSipsTable
                            assignedSips={assignedSips}
                        />
                    }{(tabIndex === 2) &&
                        <AssignedSipsTable
                            assignedSips={assignedGeneralInsurances}
                            isGeneralInsurance={true}
                        />
                    }
                </div>
            </div>
        </div>
    );
}

export default PolicyManagement;