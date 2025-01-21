import { Assignment, Close } from "@mui/icons-material";
import { Button, CircularProgress, Divider, TextField } from "@mui/material";
import { useState } from "react";

const UploadedPolicyForm = ({ formData, handleFormDataChange, onSubmit, onDocumentUpload, onClose }) => {
    const [error, setError] = useState('');
    const [files, setFiles] = useState({});

    const handleOpenInNew = (policyDocumentURL) => {
        window.open(policyDocumentURL, "_blank");
    }

    const [submitting, setSubmitting] = useState(false);
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        const errorMessage = await onSubmit({ formData, files });
        if (!errorMessage) { onClose() }
        else { setError(errorMessage) }
        setSubmitting(false);
    }

    return (
        <div className='fixed inset-0 !z-[1000] bg-black/10 flex justify-center items-center' onClick={onClose}>
            {submitting &&
                <div
                    onClick={(event) => event.stopPropagation()}
                    className='fixed inset-0 !z-[1000] bg-black/10 flex justify-center items-center'
                >
                    <CircularProgress />
                </div>
            }
            <div
                onClick={(event) => event.stopPropagation()}
                className='max-w-2xl w-full relative z-10 bg-white shadow-md rounded-lg h-[75vh] no-scrollbar overflow-y-scroll'
            >
                <div className='flex justify-between items-center px-6 py-4'>
                    <h2 className='text-xl font-semibold'>Uploaded by User</h2>
                    <Close onClick={onClose} className='cursor-pointer' />
                </div>
                <Divider />
                <form onSubmit={handleFormSubmit} className='py-4 px-6 space-y-4'>
                    <TextField
                        label='Expiry Date' type='date' name='expiryDate' fullWidth required
                        InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                        value={formData.expiryDate} onChange={handleFormDataChange}
                    />
                    <TextField
                        label='Policy Number' type='text' name='policyNo' fullWidth required
                        InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                        value={formData.policyNo} onChange={handleFormDataChange}
                    />

                    <Button
                        onClick={() => handleOpenInNew(formData?.policyDocumentURL)}
                        className='!flex !gap-2 !items-center !justify-center float-right mr-4 !text-white !bg-gray-900 py-1 px-2 rounded-sm hover:opacity-95'
                    >
                        Policy Document
                        <Assignment className='!size-4' />
                    </Button>
                    <input type='file' name='policyDocumentURL' accept='image/*,.pdf' onChange={onDocumentUpload} />
                    <br /><br />
                    <div className='flex justify-end'>
                        <Button
                            type='submit'
                            className='!flex !items-center !gap-2 !bg-gray-900 !text-white'
                        >
                            Submit
                        </Button>
                    </div>
                    <div className='relative'>
                        {error && <span className='absolute -bottom-6 text-sm text-red-600'>{error}</span>}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UploadedPolicyForm;