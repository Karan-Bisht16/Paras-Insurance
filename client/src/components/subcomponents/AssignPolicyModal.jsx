import { Button, Divider, TextField } from "@mui/material";
import { Close } from "@mui/icons-material";

const AssignPolicyModal = ({ closeAssignPolicyModal, onSubmit, formData, onFormDataChange, onDocumentUpload, tabIndex, error }) => {
    return (
        <div className='fixed inset-0 bg-black/10 !z-[1000] flex justify-center items-center' onClick={closeAssignPolicyModal}>
            <div onClick={(event) => event.stopPropagation()} className='bg-white max-w-[75vw] max-h-[75vh] rounded-lg'>
                <div className='px-6 py-4 flex gap-16 justify-between items-center'>
                    <h3 className='text-xl font-semibold'>
                        Enter&nbsp;
                        {(tabIndex === 0) && 'Policy'}
                        {(tabIndex === 1) && 'SIP'}
                        {(tabIndex === 2) && 'General Insurance'}
                        &nbsp;Assigenment Details
                    </h3>
                    <Close onClick={closeAssignPolicyModal} className='cursor-pointer' />
                </div>
                <Divider />
                <form onSubmit={onSubmit} className='px-6 py-4'>
                    <p className='font-semibold mb-1'>
                        {(tabIndex === 0) && 'Policy'}
                        {(tabIndex === 1) && 'SIP'}
                        {(tabIndex === 2) && 'General Insurance'}
                        &nbsp;Expiry Date
                    </p>
                    <TextField
                        type='date' name='expiryDate' required
                        value={formData.expiryDate} onChange={onFormDataChange}
                        className='w-full !mb-4'
                    />
                    <p className='font-semibold mb-1'>
                        {(tabIndex === 0) && 'Policy'}
                        {(tabIndex === 1) && 'SIP'}
                        {(tabIndex === 2) && 'General Insurance'}
                        &nbsp;Number
                    </p>
                    <TextField
                        type='text' name='policyNo' required
                        value={formData.policyNo} onChange={onFormDataChange}
                        className='w-full !mb-4'
                    />
                    <p className='font-semibold mb-1'>
                        Upload&nbsp;
                        {(tabIndex === 0) && 'Policy'}
                        {(tabIndex === 1) && 'SIP'}
                        {(tabIndex === 2) && 'General Insurance'}
                        &nbsp;Document
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