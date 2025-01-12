import { useState } from 'react';
import { Button, MenuItem, Switch, TextField } from '@mui/material';
import { Close } from '@mui/icons-material';

// LATER: ManagerId
const EmployeeForm = ({ onClose, onSubmit }) => {
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        managerId: '',
        role: 'Admin',
        loginAccess: true,
        status: 'Active',
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name === 'loginAccess') {
            setFormData(prevFormData => ({
                ...prevFormData, 'loginAccess': event.target.checked
            }));
        } else {
            setFormData(prevFormData => ({
                ...prevFormData, [name]: value
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        const errorMessage = await onSubmit(formData);
        if (!errorMessage) { onClose() }
        else { setError(errorMessage) }
    };

    return (
        <div className='fixed inset-0 !z-[1000] bg-black bg-opacity-50 flex items-center justify-center p-4' onClick={onClose}>
            <div
                onClick={(event) => event.stopPropagation()}
                className='bg-white rounded-lg w-full max-w-2xl'
            >
                <div className='flex justify-between items-center px-6 py-4 border-b'>
                    <h2 className='text-xl font-semibold'>Add New Employee</h2>
                    <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
                        <Close />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='px-6 py-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <TextField
                            label='First Name' name='firstName' required
                            InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                            value={formData.firstName} onChange={handleChange}
                        />
                        <TextField
                            label='Last Name' name='lastName'
                            value={formData.lastName} onChange={handleChange}
                        />
                        <TextField
                            type='email' label='Email' name='email' required
                            InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                            value={formData.email} onChange={handleChange}
                        />
                        <TextField
                            type='tel' label='Phone' name='phone' required
                            InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                            value={formData.phone} onChange={handleChange}
                        />
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6'>
                        <TextField
                            label='Role' name='role' select variant='outlined' required
                            InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                            defaultValue={formData.role} value={formData.role} onChange={handleChange}
                        >
                            <MenuItem value='Admin'>Admin</MenuItem>
                            <MenuItem value='SuperAdmin'>Super Admin</MenuItem>
                        </TextField>
                        <TextField
                            label='Status' name='status' select variant='outlined' required
                            InputLabelProps={{ sx: { '.MuiInputLabel-asterisk': { color: 'red' } } }}
                            defaultValue={formData.status} value={formData.status} onChange={handleChange}
                        >
                            <MenuItem value='Active'>Active</MenuItem>
                            <MenuItem value='Inactive'>Inactive</MenuItem>
                        </TextField>

                        <div className='flex justify-between items-center'>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Login Access &nbsp;<span className='text-red-600'>*</span>
                            </label>
                            <Switch name='loginAccess' checked={formData.loginAccess} onChange={handleChange} />
                        </div>
                    </div>

                    <div className='mt-6 flex justify-end space-x-3'>
                        <Button
                            type='submit'
                            className='!text-white !bg-gray-900 hover:opacity-95'
                        >
                            Add Employee
                        </Button>
                    </div>

                    <div className='relative'>
                        {error && <span className='absolute bottom-0 text-sm text-red-600'>{error}</span>}
                    </div>

                    <p className='text-gray-600'>The employee password will be [firstName]@[lastName]</p>
                </form>
            </div>
        </div>
    );
}

export default EmployeeForm;