import { useContext, useMemo, useState } from 'react';
import { Button, Divider, MenuItem, Switch, TextField, Tooltip } from '@mui/material';
import { tailChase } from 'ldrs';
import { Edit, FilterAltOutlined, SearchOutlined, PersonRemove, OpenInNew, Close } from '@mui/icons-material';
// importing contexts
import { ClientContext } from '../../../contexts/Client.context';

const EmployeeTable = ({ employeesData, onEditEmployee, onRemoveAccess }) => {
    const { condenseClientInfo } = useContext(ClientContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const employeePerPage = 10;

    const filteredEmployees = useMemo(() => {
        return employeesData.filter(employee => {
            const searchMatch =
                employee?.firstName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                employee?.lastName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                employee?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                employee?.phone?.includes(searchTerm);

            const roleMatch = filterRole === 'ALL' || employee?.role?.toLowerCase() === filterRole?.toLowerCase();
            const statusMatch = filterStatus === 'ALL' || employee?.status?.toLowerCase() === filterStatus?.toLowerCase();

            return searchMatch && roleMatch && statusMatch;
        });
    }, [searchTerm, filterRole, filterStatus, employeesData]);

    const totalPages = Math.ceil(filteredEmployees.length / employeePerPage);
    const indexOfLastEmployee = currentPage * employeePerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - employeePerPage;
    const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

    const nextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const prevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const [error, setError] = useState('');
    const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
    const handleOpenEditEmployeeModal = (employee) => {
        setFormData(employee);
        setIsEditEmployeeModalOpen(true);
    }
    const handleCloseEditEmployeeModal = () => setIsEditEmployeeModalOpen(false);
    const [formData, setFormData] = useState({
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
        const errorMessage = await onEditEmployee(formData);
        if (!errorMessage) { handleCloseEditEmployeeModal() }
        else { setError(errorMessage) }
    };


    tailChase.register();

    return (
        <div className='space-y-4'>
            <div className='flex justify-between mb-4'>
                <div className='flex items-center space-x-2'>
                    <input
                        type='text'
                        placeholder='Search by name, email, or phone...'
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className='px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                    />
                    <button className='p-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none '>
                        <SearchOutlined className='h-4 w-4' />
                    </button>
                </div>
                <div className='flex items-center space-x-2'>
                    <select
                        value={filterRole} onChange={(event) => setFilterRole(event.target.value)}
                        className='px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                    >
                        <option value='ALL'>All Roles</option>
                        <option value='SUPERADMIN'>Super Admin</option>
                        <option value='ADMIN'>Admin</option>
                    </select>
                    <select
                        value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}
                        className='px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                    >
                        <option value='ALL'>All Statuses</option>
                        <option value='ACTIVE'>Active</option>
                        <option value='INACTIVE'>Inactive</option>
                    </select>
                    <FilterAltOutlined className='h-4 w-4' />
                </div>
            </div>
            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Employee Name
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Role
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Email
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Phone No.
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Login Access
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Status
                            </th>
                            {condenseClientInfo.role.toLowerCase() === 'superadmin' &&
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Actions
                                </th>
                            }
                        </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                        {currentEmployees.map((employee, index) => (
                            <tr key={index}>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <a href={`/profile/${employee?.clientId}`} target='_blank' className='flex gap-1 !items-center text-sm text-gray-900 cursor-pointer hover:underline'>
                                        {employee?.firstName} {employee?.lastName}
                                        <Tooltip title='View profile'>
                                            <OpenInNew className='!size-4' />
                                        </Tooltip>
                                    </a>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee?.role?.toLowerCase() === 'superadmin'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {employee?.role?.toLowerCase() === 'superadmin' ? 'Super Admin' : 'Admin'}
                                    </span>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-500'>{employee?.email}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-500'>{employee?.phone}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-500'>{employee?.loginAccess ?
                                        'Approved'
                                        : 'Denied'

                                    }</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee?.status?.toLowerCase() === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-600'
                                        }`}>
                                        {employee?.status.charAt(0).toUpperCase() + employee?.status.slice(1)}
                                    </span>
                                </td>
                                {condenseClientInfo.role.toLowerCase() === 'superadmin' &&
                                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                                        <div className='flex space-x-2'>
                                            <button className='p-1 border border-gray-300 rounded-md shadow-sm text-blue-600 hover:text-blue-900 hover:bg-gray-50 focus:outline-none'>
                                                <Tooltip title='Edit details'>
                                                    <Edit onClick={() => handleOpenEditEmployeeModal(employee)} />
                                                </Tooltip>
                                            </button>
                                            <button className='p-1 border border-gray-300 rounded-md shadow-sm text-red-600 hover:text-red-900 hover:bg-gray-50 focus:outline-none '>
                                                <Tooltip title='Revoke employee access'>
                                                    <PersonRemove onClick={() => onRemoveAccess(employee?._id)} />
                                                </Tooltip>
                                            </button>
                                        </div>
                                    </td>
                                }
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='flex justify-between items-center mt-4'>
                <div className='text-sm text-gray-700'>
                    Showing {indexOfFirstEmployee + 1} to {Math.min(indexOfLastEmployee, filteredEmployees.length)} of {filteredEmployees.length} results
                </div>
                <div className='flex space-x-2'>
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className='px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none  disabled:opacity-50'
                    >
                        Previous
                    </button>
                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className='px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none  disabled:opacity-50'
                    >
                        Next
                    </button>
                </div>
            </div>

            {isEditEmployeeModalOpen &&
                <div className='fixed !z-[1000] inset-0 bg-black/10 flex justify-center items-center' onClick={handleCloseEditEmployeeModal}>
                    <div
                        onClick={(event) => event.stopPropagation()}
                        className='bg-white w-[25vw] rounded-lg'
                    >
                        <div className='flex justify-between items-center px-6 py-4 border-b'>
                            <h2 className='text-xl font-semibold'>Edit Details</h2>
                            <Close onClick={handleCloseEditEmployeeModal} className='cursor-pointer' />
                        </div>
                        <Divider />

                        <form onSubmit={handleSubmit} className='p-6 pb-8'>
                            <div className='grid grid-cols-1 gap-6'>
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

                            <div className='mt-6 flex justify-end'>
                                <Button
                                    type='submit'
                                    className='!text-white !bg-gray-900 hover:opacity-95'
                                >
                                    Edit Employee
                                </Button>
                            </div>
                            <div className='relative'>
                                {error && <span className='absolute -bottom-4 text-sm text-red-600'>{error}</span>}
                            </div>
                        </form>
                    </div>
                </div>
            }
        </div>
    );
}

export default EmployeeTable;