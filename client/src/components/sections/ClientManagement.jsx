import { useContext, useEffect, useState } from 'react';
import { CircularProgress, Tooltip } from '@mui/material';
import { Upload, Download } from '@mui/icons-material';
// importing api end-points
import { countAllAssignedPolicies, fetchAllClients, importClientCsv } from '../../api';
// importing contexts
import { SnackBarContext } from '../../contexts/SnackBar.context';
// importing components
import ClientTable from './clients/ClientTable';
import ClientStats from './clients/ClientStats';

const ClientManagement = () => {
    const { setSnackbarState, setSnackbarValue } = useContext(SnackBarContext);
    const [clients, setClients] = useState([]);
    const getAllClients = async () => {
        try {
            const { data } = await fetchAllClients();
            setClients(data);
        } catch (error) {
            console.error(error);
        }
    }

    const [assignedPoliciesCount, setAssignedPoliciesCount] = useState([]);
    const getCountAllAssignedPolicies = async () => {
        try {
            const { data } = await countAllAssignedPolicies();
            setAssignedPoliciesCount(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getAllClients();
        getCountAllAssignedPolicies();
    }, []);

    const reload = () => {
        getAllClients();
        getCountAllAssignedPolicies();
    }

    const [imporingCsv, setImportingCsv] = useState(false);
    const handleFileUpload = async (event) => {
        setImportingCsv(true);
        try {
            const file = event.target.files[0];
            await importClientCsv({ file });
            reload();
            setSnackbarValue({ message: `${file.name} imported successfully!`, status: 'success' });
        } catch (error) {
            setSnackbarValue({ message: error?.response?.data?.message, status: 'error' });
        }
        setImportingCsv(false);
        setSnackbarState(true);
    };

    const downloadSampleCSV = () => {
        const sampleData = `_id,userType,personalDetails.firstName,personalDetails.lastName,personalDetails.gender,personalDetails.dob,personalDetails.contact.email,personalDetails.contact.phone,personalDetails.address.street,personalDetails.address.city,personalDetails.address.state,personalDetails.address.pincode,personalDetails.address.country,personalDetails.nominee.name,personalDetails.nominee.dob,personalDetails.nominee.relationship,personalDetails.nominee.phone,financialDetails.panCardNo,financialDetails.aadhaarNo,financialDetails.accountDetails.accountNo,financialDetails.accountDetails.ifscCode,financialDetails.accountDetails.bankName,KYC
        677ad06d6150592d2da1630f,Lead,John,Doe,Male,1990-01-01,john.doe@example.com,1234567890,123 Main St,New York,NY,10001,USA,Jane Doe,1995-05-05,Sister,9876543210,ABCDE1234F,123412341234,9876543210,SBIN0001234,State Bank of India,true`;
        const blob = new Blob([sampleData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_clients.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 h-[36.5px]">
                <h1 className="text-2xl font-bold text-gray-800">Client Management ({clients?.length})</h1>
                <div className="flex gap-3 items-center">
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
                    <ClientStats clients={clients} assignedPoliciesCount={assignedPoliciesCount} />
                    <div className="mt-6">
                        <ClientTable clients={clients} reload={getAllClients} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClientManagement;