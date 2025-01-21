import { useState, useMemo } from 'react';
import { Button, CircularProgress, Divider, Modal, TextField, Tooltip } from '@mui/material';
import { Edit, FilterAltOutlined, PersonAddAlt1, SearchOutlined, Close, OpenInNew, SystemUpdateAlt } from '@mui/icons-material';
// importing api end-points
import { create, exportClientCsv, updateProfile, uploadProfileMedia } from '../../../api';
// importing components
import UpdateProfileForm from '../../UpdateProfileForm';
// importing helper functions
import { calculateAge } from '../../../utils/helperFunctions';

const ClientTable = ({ clients, reload }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGender, setFilterGender] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const clientsPerPage = 10;

    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const searchMatch =
                client?.personalDetails?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client?.personalDetails?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client?.personalDetails?.contact?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client?.personalDetails?.contact?.phone.includes(searchTerm);

            const genderMatch = filterGender === 'ALL' || client?.personalDetails?.gender?.toLowerCase() === filterGender.toLowerCase();

            return searchMatch && genderMatch;
        });
    }, [searchTerm, filterGender, clients]);

    const totalPages = Math.ceil(filteredClients.length / clientsPerPage);
    const indexOfLastClient = currentPage * clientsPerPage;
    const indexOfFirstClient = indexOfLastClient - clientsPerPage;
    const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);

    const nextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const prevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const [error, setError] = useState('');
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: ''
    });

    const handleOpenAddClientModal = () => setIsAddClientModalOpen(true);
    const handleCloseAddClientModal = () => setIsAddClientModalOpen(false);

    const handleAddClientInputChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleAddClientSubmit = async (event) => {
        event.preventDefault();
        try {
            await create(formData);
            handleCloseAddClientModal();
            setError('');
            reload();
        } catch (error) {
            console.error('Error registering client:', error);
            setError(error?.response?.data?.message);
        }
    };

    const [clientData, setClientData] = useState({});
    const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
    const handleOpenEditClientModal = (client) => {
        setClientData(client);
        setIsEditClientModalOpen(true);
    }
    const handleCloseEditClientModal = () => setIsEditClientModalOpen(false);

    const handleEditClientSubmit = async (formData, removedFiles, files) => {
        try {
            const { status, data } = await updateProfile({ formData, removedFiles });
            const updatedClientData = data;
            if (status === 200) {
                setClientData(updatedClientData);
                const { status, data } = await uploadProfileMedia({ ...files, clientId: clientData._id });
                setClientData(data);
                if (status === 200) {
                    reload();
                    return false;
                }
            }
        } catch (error) {
            return error?.response?.data?.message;
        }
    }

    const [exportingCsv, setExportingCsv] = useState(false);
    const handleExportAndDownloadCSV = async () => {
        setExportingCsv(true);
        try {
            const response = await exportClientCsv();
            const blob = new Blob([response.data], { type: 'text/csv' });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'clients.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error(error);
        }
        setExportingCsv(false);
    };

    return (
        <div>
            <div className="flex justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button className="p-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none ">
                        <SearchOutlined className="!size-4" />
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    <select
                        value={filterGender}
                        onChange={(event) => setFilterGender(event.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="ALL">All Genders</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                    </select>
                    <FilterAltOutlined />
                    <Button
                        onClick={handleOpenAddClientModal}
                        className="!text-white !bg-gray-900 !flex !justify-center !items-center !gap-2 hover:opacity-95"
                    >
                        <PersonAddAlt1 className="!size-4" />
                        <span>Add Client</span>
                    </Button>
                    <Button
                        onClick={handleExportAndDownloadCSV}
                        disabled={exportingCsv}
                        className="!text-white !bg-gray-900 !flex !justify-center !items-center !gap-2 hover:opacity-95"
                    >
                        {exportingCsv ?
                            <CircularProgress className='!size-4 !text-white' />
                            :
                            <SystemUpdateAlt className="!size-4" />
                        }
                        <span>Export CSV</span>
                    </Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UserType</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Policies</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentClients.map((client) => (
                            <tr key={client?._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <a href={`/profile/${client?._id}`} target='_blank' className="flex gap-1 !items-center text-sm font-medium text-gray-900 cursor-pointer hover:underline">
                                        {client?.personalDetails?.firstName} {client?.personalDetails?.lastName}
                                        <Tooltip title='View profile'>
                                            <OpenInNew className='!size-4' />
                                        </Tooltip>
                                    </a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{client?.personalDetails?.contact?.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{client?.personalDetails?.contact?.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{client?.userType}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{calculateAge(client?.personalDetails?.dob)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client?.personalDetails?.gender?.toLowerCase() === 'male'
                                        ? 'bg-green-100 text-blue-800'
                                        : client?.personalDetails?.gender?.toLowerCase() === 'female' ? 'bg-red-100 text-pink-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {client?.personalDetails?.gender?.toLowerCase() === 'male' ? 'Male' : client?.personalDetails?.gender?.toLowerCase() === 'female' ? 'Female' : '-'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <a href={`/policies/${client?._id}`} target='_blank' className="flex justify-center text-sm font-medium text-gray-900 cursor-pointer hover:underline">
                                        <Tooltip title='View policies'>
                                            <OpenInNew className='!size-4' />
                                        </Tooltip>
                                    </a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <button className="p-1 border border-gray-300 rounded-md shadow-sm text-blue-600 hover:text-blue-900 hover:bg-gray-50 focus:outline-none ">
                                        <Tooltip title='Edit details'>
                                            <Edit onClick={() => handleOpenEditClientModal(client)} />
                                        </Tooltip>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-700">
                    Showing {indexOfFirstClient + 1} to {Math.min(indexOfLastClient, filteredClients.length)} of {filteredClients.length} results
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
            <Modal
                open={isAddClientModalOpen}
                onClose={handleCloseAddClientModal}
                aria-labelledby="add-client-modal"
                aria-describedby="modal-to-add-new-client"
            >
                <div className='bg-white max-w-lg  rounded-lg absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]'>
                    <div className='py-4 px-8 flex justify-between items-center'>
                        <h2 className="text-xl font-bold">Add New Client</h2>
                        <Close onClick={handleCloseAddClientModal} className='cursor-pointer' />
                    </div>

                    <Divider />
                    <form onSubmit={handleAddClientSubmit} className="space-y-4 pt-6 pb-10 px-8">
                        <TextField
                            label="First Name" name="firstName"
                            value={formData.firstName} onChange={handleAddClientInputChange}
                            required fullWidth
                        />
                        <TextField
                            label="Last Name" name="lastName"
                            value={formData.lastName} onChange={handleAddClientInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Email" name="email" type="email"
                            value={formData.email} onChange={handleAddClientInputChange}
                            required fullWidth
                        />
                        <TextField
                            label="Phone" name="phone" type='tel'
                            value={formData.phone} onChange={handleAddClientInputChange}
                            required fullWidth
                        />
                        <TextField
                            label="Password" name="password" type="password"
                            value={formData.password} onChange={handleAddClientInputChange}
                            required fullWidth
                        />
                        <Button
                            type="submit" variant="contained"
                            fullWidth
                            className="!text-white !bg-gray-900 hover:opacity-95"
                        >
                            Submit
                        </Button>

                        <div className='relative'>
                            {error && <span className='absolute -bottom-4 text-sm text-red-600'>{error}</span>}
                        </div>
                    </form>
                </div>
            </Modal>

            {isEditClientModalOpen &&
                <UpdateProfileForm
                    clientData={clientData}
                    closeUpdateProfile={handleCloseEditClientModal}
                    onSubmit={handleEditClientSubmit}
                    label='Edit Details'
                />}
        </div>
    );
}

export default ClientTable;

