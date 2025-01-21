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
        const sampleData = `_id,policyId,clientId,stage,policyDocumentURL,createdAt,updatedAt,assignedBy,expiryDate,policyNo,origin,data.lastName,data.firstName,data.email,data.phone,data.heightLife,data.weightLife,data.motherNameLife,data.qualificationsLife,data.sumInsuredLife,data.natureOfWorkLife,data.annualIncomeLife,data.nameOfCompanyLife,data.industryOfBusinessLife,data.typeOfCompanyLife,data.habitsLife,data.nomineeNameLife,data.nomineeDoBLife,data.nomineeRelationLife,data.panCardLife,data.aadhaarCardLife,data.livePhotoLife,data.cancelledChequeLife,data.itrWithCoiLife,data.dobHealth,data.heightHealth,data.weightHealth,data.educationHealth,data.occupationHealth,data.annualIncomeHealth,data.sumInsuredHealth,data.substanceUseHealth,data.streetHealth,data.cityHealth,data.stateHealth,data.countryHealth,data.pincodeHealth,data.nomineeNameHealth,data.nomineeDoBHealth,data.nomineeRelationHealth,data.panCardHealth,data.aadhaarCardHealth,data.cancelledChequeHealth,data.membersHealth,data.1memberFirstNameHealth,data.1memberLastNameHealth,data.1memberDobHealth,data.1memberHeightHealth,data.1memberWeightHealth,data.1memberPhoneHealth,data.1memberRelationHealth,data.1memberSubstanceUseHealth,data.2memberFirstNameHealth,data.2memberLastNameHealth,data.2memberDobHealth,data.2memberHeightHealth,data.2memberWeightHealth,data.2memberPhoneHealth,data.2memberRelationHealth,data.2memberSubstanceUseHealth,data.3memberFirstNameHealth,data.3memberLastNameHealth,data.3memberDobHealth,data.3memberHeightHealth,data.3memberWeightHealth,data.3memberPhoneHealth,data.3memberRelationHealth,data.3memberSubstanceUseHealth,data.passportNoTravel,data.passportTravelTravel,data.ticketsTravel,data.diseaseTravel,data.sumInsuredTravel,data.membersTravel,data.1memberNameTravel,data.1memberDOBTravel,data.1memberRelationTravel,data.1memberDiseaseTravel,data.2memberNameTravel,data.2memberDOBTravel,data.2memberRelationTravel,data.2memberDiseaseTravel,data.3memberNameTravel,data.3memberDOBTravel,data.3memberRelationTravel,data.3memberDiseaseTravel,data.existingPolicyVehicle,data.claimPreviousYearVehicle,data.rcVehicle,data.sumInsuredVehicle
678b6b8d90df2d206c4e8cc1,6749f62acc685fd8ec7c2260,6786913e1e6b3f954a9b69f3,Interested,,2025-01-18T08:51:25.491Z,2025-01-18T08:51:26.057Z,,,,AssignedBySystem,Kumar,Raj,rk0346101@gmail.com,8285202094,a,a,a,a,a,a,a,a,a,Proprietorship,Drinking,a,02-01-2025,Spouse,http://localhost:8080/uploads/panCardLife-ce427844-dc1e-4fd9-bf39-118c7296fec1.jpg,http://localhost:8080/uploads/aadhaarCardLife-296a6740-1cc5-4360-a626-d13464f24b65.jpg,http://localhost:8080/uploads/livePhotoLife-cfb033b8-ab56-4347-bb59-92b0b68cd79d.avif,http://localhost:8080/uploads/cancelledChequeLife-c7d808ad-a96d-48df-8ff5-a5e0b5bb564a.webp,http://localhost:8080/uploads/itrWithCoiLife-26c0c89f-0074-41ca-bef0-7cdd47eef405.webp,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
678b6be790df2d206c4e8cf1,6749f86bcc685fd8ec7c2264,6786913e1e6b3f954a9b69f3,Interested,,2025-01-18T08:52:55.518Z,2025-01-18T08:52:56.263Z,,,,AssignedBySystem,Kumar,Raj,rk0346101@gmail.com,8285202094,,,,,,,,,,,,,,,,,,,,06-01-2025,a,a,a,a,a,a,Drinking,House No 299,New Delhi,Delhi,India,110063,a,01-01-2025,Son,http://localhost:8080/uploads/panCardHealth-159cb2ce-85e0-4dd6-ba70-b6a79cfeeb27.jpg,http://localhost:8080/uploads/aadhaarCardHealth-6dcd322d-ecae-4802-8187-5564f19e5882.jpg,http://localhost:8080/uploads/cancelledChequeHealth-cff18f1b-f604-4644-97d9-0d9e94c3e73b.webp,3,a,a,07-01-2025,a,a,a,Son,Drinking,a,a,01-01-2025,a,a,a,Son,Drinking,a,a,04-01-2025,a,a,a,Daughter,Drinking,,,,,,,,,,,,,,,,,,,,,,
678b6c7a90df2d206c4e8d5c,674dc05b0a6d0dae5168609c,6786b7e0dc98d8e43482bd62,Interested,,2025-01-18T08:55:22.079Z,2025-01-18T08:55:22.384Z,,,,AssignedBySystem,Sharma,Aayush,aayush@rashtechnologies.com,9582245232,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,123,http://localhost:8080/uploads/passportTravelTravel-48236c54-e00b-4fa0-9e48-b009fccf1dd2.jpg,6,Yes,c,3,c,04-01-2025,Spouse,Yes,c,15-01-2025,Mother,Yes,c,04-01-2025,Mother-in-law,No,,,,
678b6cc190df2d206c4e8e52,678570834b3769ddaf1920e3,6786b898dc98d8e43482bd99,Interested,,2025-01-18T08:56:33.360Z,2025-01-18T08:56:33.749Z,,,,AssignedBySystem,Singh,Harlene,harlenesingh@gmail.com,8178982677,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,http://localhost:8080/uploads/existingPolicyVehicle-2f8a64a9-f6cb-448e-8412-a0f9eb6ebf5e.webp,Yes,http://localhost:8080/uploads/rcVehicle-9fbc5075-284f-4269-bf5f-ae1387a7f5ca.png,d
678b6d1d90df2d206c4e8ea2,6777932ef2013d3cfcc27347,6786b898dc98d8e43482bd98,Assigned,http://localhost:8080/uploads/policyDocument-3f9c277d-db24-46b8-bc19-ec64d3ded53c.pdf,2025-01-18T08:58:05.958Z,2025-01-18T08:58:06.133Z,,26-01-2025,1325815667,UploadedByUser,Jain,Rahul,rahul@rashtechnologies.com,9971162789,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
`;

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
                            reload={getAllAssignedSips}
                        />
                    }{(tabIndex === 2) &&
                        <AssignedSipsTable
                            assignedSips={assignedGeneralInsurances}
                            reload={getAllAssignedGeneralInsurances}
                            isGeneralInsurance={true}
                        />
                    }
                </div>
            </div>
        </div>
    );
}

export default PolicyManagement;