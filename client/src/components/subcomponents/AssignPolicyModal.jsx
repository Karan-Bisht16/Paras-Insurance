import { useState } from "react";
import { Button, Divider, TextField } from "@mui/material";
import { Close } from "@mui/icons-material";

const AssignPolicyModal = ({ closeAssignPolicyModal, onSubmit, formData, onFormDataChange, onDocumentUpload, tabIndex, error }) => {
    const [submitting, setSubmitting] = useState(false);
    const handleSubmit = async () => {
        setSubmitting(true);
        await onSubmit();
        setSubmitting(false);
    }

    return (
        <div className='fixed inset-0 bg-black/10 !z-[1000] flex justify-center items-center' onClick={closeAssignPolicyModal}>

            <div onClick={(event) => event.stopPropagation()} className='bg-white max-w-[75vw] max-h-[75vh] rounded-lg'>
                {submitting &&
                    <div className='fixed inset-0 bg-black/10 !z-[2000] flex justify-center items-center'>
                    </div>
                }
                <div className='px-6 py-4 flex gap-16 justify-between items-center'>
                    <h3 className='text-xl font-semibold'>
                        Enter&nbsp;
                        {(tabIndex === 0) && 'Policy Assigenment'}
                        {(tabIndex === 1) && 'SIP Assigenment'}
                        {(tabIndex === 2) && 'General Insurance Assigenment'}
                        {(tabIndex === 3) && 'Policy'}
                        &nbsp;Details
                    </h3>
                    <Close onClick={closeAssignPolicyModal} className='cursor-pointer' />
                </div>
                <Divider />
                <form onSubmit={handleSubmit} className='px-6 py-4'>
                    {(tabIndex === 3) &&
                        <div className="grid grid-cols-2 gap-2">
                            <TextField
                                type='text' label='First Name' name='firstName' required
                                InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                                value={formData.firstName} onChange={onFormDataChange}
                                className='w-full !mb-2'
                            />
                            <TextField
                                type='text' label='Last Name' name='lastName' required
                                InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                                value={formData.lastName} onChange={onFormDataChange}
                                className='w-full !mb-2'
                            />
                            <TextField
                                type='text' label='Email' name='email' required
                                InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                                value={formData.email} onChange={onFormDataChange}
                                className='w-full !mb-2'
                            />
                            <TextField
                                type='text' label='Phone (excluding +91)' name='phone' required
                                InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                                value={formData.phone} onChange={onFormDataChange}
                                className='w-full !mb-2'
                            />
                        </div>
                    }
                    <p className='font-semibold mb-1'>
                        {(tabIndex === 0) && 'Policy'}
                        {(tabIndex === 1) && 'SIP'}
                        {(tabIndex === 2) && 'General Insurance'}
                        {(tabIndex === 3) && 'Policy'}
                        &nbsp;Expiry Date <span className="text-red-600">*</span>
                    </p>
                    <TextField
                        type='date' name='expiryDate' required
                        value={formData.expiryDate} onChange={onFormDataChange}
                        className='w-full !mb-4'
                    />
                    {(tabIndex !== 3) &&
                        <p className='font-semibold mb-1'>
                            {(tabIndex === 0) && 'Policy'}
                            {(tabIndex === 1) && 'SIP'}
                            {(tabIndex === 2) && 'General Insurance'}
                            &nbsp;Number <span className="text-red-600">*</span>
                        </p>
                    }
                    <TextField
                        type='text' label={tabIndex === 3 ? 'Policy Number' : ''} name='policyNo' required
                        InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                        value={formData.policyNo} onChange={onFormDataChange}
                        className='w-full !mb-4'
                    />
                    <p className='font-semibold mb-1'>
                        Upload&nbsp;
                        {(tabIndex === 0) && 'Policy'}
                        {(tabIndex === 1) && 'SIP'}
                        {(tabIndex === 2) && 'General Insurance'}
                        &nbsp;Document <span className="text-red-600">*</span>
                    </p>
                    <input required type='file' name='policyDocumentURL' accept='image/*,.pdf' onChange={onDocumentUpload} />
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
                        {error && <span className='absolute bottom-0 text-sm text-red-600'>{error}</span>}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AssignPolicyModal;