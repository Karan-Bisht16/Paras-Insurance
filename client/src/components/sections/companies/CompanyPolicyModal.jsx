import { useState } from 'react';
import { Close } from '@mui/icons-material';
import { Button, TextField } from '@mui/material';

const CompanyPolicyModal = ({ policyData, onClose, onRemovePolicy }) => {
    const [error, setError] = useState('');
    const { policy, company } = policyData;

    const handleRemovePolicy = async () => {
        const errorMessage = await onRemovePolicy({ companyId: company._id, policyId: policy._id });
        if (!errorMessage) { onClose() }
        else { setError(errorMessage) }
    }

    return (
        <div className='fixed z-[1000] inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4' onClick={() => onClose()}>
            <div
                onClick={(event) => event.stopPropagation()}
                className='bg-white rounded-lg w-full max-w-4xl max-h-[80vh] no-scrollbar overflow-y-scroll'
            >
                <div className='flex justify-between items-center px-6 py-4 border-b'>
                    <h2 className='text-xl font-semibold'>{policy.policyName}</h2>
                    <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
                        <Close />
                    </button>
                </div>

                <div className='px-6 pt-2 pb-6'>
                    <div className='mb-3'>
                        <p className='text-sm text-gray-600'>Offered by: <strong>{company.companyName}</strong></p>
                    </div>

                    <TextField
                        label='Policy Type'
                        slotProps={{ input: { readOnly: true } }}
                        value={policy.policyType}
                        className='w-full !mt-2'
                    />

                    <div className='my-2 mx-1'>
                        <h3 className='font-medium'>Policy Description:</h3>
                        <div className='mx-4'>
                            <p className='text-gray-600'>{policy.policyDescription}</p>
                        </div>
                    </div>

                    <div className='mb-5 mx-1'>
                        <h3 className='font-medium'>Policy Features:</h3>
                        <div className='mx-4'>
                            {policy.policyFeatures.split(',').map((feature, index) => (
                                <p key={index} className='text-gray-600'>{index + 1}. {feature.trim()}</p>
                            ))}
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-4'>
                        <TextField
                            label='Coverage Type'
                            slotProps={{ input: { readOnly: true } }}
                            value={policy.coverageType}
                        />
                        <TextField
                            label='Coverage Amount'
                            slotProps={{ input: { readOnly: true } }}
                            value={`₹ ${policy.coverageAmount}`}
                        />
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-4'>
                        <TextField
                            label='Premium Type'
                            slotProps={{ input: { readOnly: true } }}
                            value={policy.premiumType}
                        />
                        <TextField
                            label='Premium Amount'
                            slotProps={{ input: { readOnly: true } }}
                            value={`₹ ${policy.premiumAmount}`}
                        />
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-4'>
                        <TextField
                            label='Name'
                            slotProps={{ input: { readOnly: true } }}
                            value={policy?.contactPerson?.name}
                        />
                        <TextField
                            label='Phone (excluding +91)'
                            slotProps={{ input: { readOnly: true } }}
                            value={policy?.contactPerson?.phone}
                        />
                        <TextField
                            label='Email'
                            slotProps={{ input: { readOnly: true } }}
                            value={policy?.contactPerson?.email}
                        />
                    </div>

                    <div className='mt-2 flex justify-end space-x-3'>
                        <Button
                            type='button'
                            onClick={handleRemovePolicy}
                            className='!text-white !bg-gray-900  hover:opacity-95'
                        >
                            Remove Policy
                        </Button>
                    </div>

                    <div className='relative'>
                        {error && <span className='absolute bottom-0 text-sm text-red-600'>{error}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CompanyPolicyModal;