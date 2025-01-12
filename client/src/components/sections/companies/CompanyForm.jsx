import { useState } from 'react';
import { Button, MenuItem, TextField } from '@mui/material';
import { Close } from '@mui/icons-material';

// LATER: add companyTaxId
const CompanyForm = ({ formData, handleChange, onClose, onSubmit, label }) => {
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const errorMessage = await onSubmit(formData);
        if (!errorMessage) { onClose() }
        else { setError(errorMessage) }
    };

    return (
        <div className="fixed z-[1000] inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                onClick={(event) => event.stopPropagation()}
                className="bg-white rounded-lg w-full max-w-2xl"
            >
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold">{label}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <Close />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 pb-4">
                    <div className="mt-4 grid grid-cols-1 gap-4">
                        <TextField
                            label="Company Name" name="companyName" variant="outlined" required
                            InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                            value={formData.companyName} onChange={handleChange}
                        />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <TextField
                            label="Company Type" name="companyType" select variant="outlined" required
                            InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                            defaultValue={formData.companyType} value={formData.companyType} onChange={handleChange}
                        >
                            <MenuItem value='Corporate'>Corporate</MenuItem>
                            <MenuItem value='Enterprise'>Enterprise</MenuItem>
                            <MenuItem value='SME'>SME</MenuItem>
                        </TextField>
                        <TextField
                            label="Company Status" name="companyStatus" select variant="outlined" required
                            InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                            defaultValue={formData.companyStatus} value={formData.companyStatus} onChange={handleChange}
                        >
                            <MenuItem value='Active'>Active</MenuItem>
                            <MenuItem value='Inactive'>Inactive</MenuItem>
                        </TextField>
                    </div>

                    <div className="mt-4">
                        <TextField
                            label="Company Description" name="companyDescription" required
                            multiline rows={3}
                            InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                            value={formData.companyDescription} onChange={handleChange}
                            className="w-full"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <TextField
                            label="Company Registration No." name="companyRegistrationNo" variant="outlined" required
                            InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                            value={formData.companyRegistrationNo} onChange={handleChange}
                        />
                        <TextField
                            label="Company Website" name="companyWebsite" variant="outlined"
                            value={formData.companyWebsite} onChange={handleChange}
                        />
                    </div>

                    <div className="mt-4">
                        <TextField
                            label="Company Address" name="companyAddress" required
                            multiline rows={3}
                            InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                            value={formData.companyAddress} onChange={handleChange}
                            className="w-full"
                        />
                    </div>

                    <div className="mt-2 flex justify-end space-x-3">
                        <Button
                            type="submit" variant='contained'
                            className="!text-white !bg-gray-900 hover:opacity-95"
                        >
                            {label}
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

export default CompanyForm;