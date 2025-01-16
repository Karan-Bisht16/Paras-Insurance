import { useContext, useEffect, useState } from 'react';
import { Tooltip } from '@mui/material';
// importing contexts
import { SnackBarContext } from '../../contexts/SnackBar.context';
// importing api end-points
import { fetchAllRequestCallbacks, resolveRequestCallback } from '../../api';
// importing components
import CallbackTable from './callbacks/CallbackTable';

const RequestCallback = () => {
    const [callbackData, setCallbackData] = useState([]);
    const { setSnackbarState, setSnackbarValue } = useContext(SnackBarContext);
    const getAllCallbacks = async () => {
        try {
            const { data } = await fetchAllRequestCallbacks();
            setCallbackData(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getAllCallbacks();
    }, []);

    const handleResolved = async ({ clientId, notesId }) => {
        try {
            const { data } = await resolveRequestCallback({ clientId, notesId });
            getAllCallbacks();
            setSnackbarValue({ message: 'Status updated to resolved!', status: 'success' });
            setSnackbarState(true);
        } catch (error) {
            setSnackbarValue({ message: error?.response?.data?.message, status: 'error' });
            setSnackbarState(true);
        }
    };

    return (
        <div>
            <div className='flex justify-between items-center mb-6 h-[36.5px]'>
                <h1 className='text-2xl font-bold text-gray-800'>Request Callbacks ({callbackData.length})</h1>
                <div className='flex gap-3 items-center'>
                    <Tooltip title='Refresh Data'>
                        <lord-icon
                            src='https://cdn.lordicon.com/jxhgzthg.json'
                            trigger='click' stroke='bold' state='loop-cycle'
                            colors='primary:#111827,secondary:#111827'
                            style={{ width: '25px', height: '25px', cursor: 'pointer' }}
                            onClick={getAllCallbacks}
                        />
                    </Tooltip>
                </div>
            </div>

            <div className='bg-white rounded-lg shadow'>
                <div className='p-6 '>
                    <CallbackTable
                        callbackData={callbackData}
                        onResolved={handleResolved}
                    />
                </div>
            </div>
        </div>
    );
}

export default RequestCallback;