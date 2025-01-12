import { useContext, useEffect, useState } from 'react';
import { Button, Tooltip } from '@mui/material';
import { Add } from '@mui/icons-material';
// importing contexts
import { ClientContext } from '../../contexts/Client.context';
import { SnackBarContext } from '../../contexts/SnackBar.context';
// importing api end-points
import { addEmployee, editEmployee, fetchAllEmployees, removeEmployeeAccess } from '../../api';
// importing components
import EmployeeTable from './employees/EmployeeTable';
import EmployeeForm from './employees/EmployeeForm';

const EmployeeManagement = () => {
    const [showForm, setShowForm] = useState(false);

    const [employeesData, setEmployeesData] = useState([]);
    const { condenseClientInfo } = useContext(ClientContext);
    const { setSnackbarState, setSnackbarValue } = useContext(SnackBarContext);
    const getAllEmployees = async () => {
        try {
            const { data } = await fetchAllEmployees();
            setEmployeesData(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getAllEmployees();
    }, []);

    const handleAddEmployee = async (newEmployeeData) => {
        try {
            newEmployeeData.employeeId = condenseClientInfo._id;
            const { data } = await addEmployee(newEmployeeData);
            setEmployeesData(prevEmployeesData => [...prevEmployeesData, { ...data }]);
            setSnackbarValue({ message: 'New employee added!', status: 'success' });
            setSnackbarState(true);
            return false;
        } catch (error) {
            return error?.response?.data?.message;
        }
    };

    const handleRemoveAccess = async (employeeId) => {
        try {
            const { data } = await removeEmployeeAccess({ employeeId });
            setEmployeesData(prevEmployeesData => prevEmployeesData.filter((employee) => employee?._id !== employeeId));
            setSnackbarValue({ message: data?.message, status: 'success' });
            setSnackbarState(true);
        } catch (error) {
            setSnackbarValue({ message: error?.response?.data?.message, status: 'error' });
            setSnackbarState(true);
        }
    };

    const handleEditEmployee = async (employeeData) => {
        try {
            await editEmployee({
                _id: employeeData._id,
                role: employeeData?.role,
                status: employeeData?.status,
                loginAccess: employeeData?.loginAccess
            });
            getAllEmployees();
            setSnackbarValue({ message: 'Employee details updated!', status: 'success' });
            setSnackbarState(true);
            return false;
        } catch (error) {
            return error?.response?.data?.message;
        }
    }

    return (
        <div>
            <div className='flex justify-between items-center mb-6 h-[36.5px]'>
                <h1 className='text-2xl font-bold text-gray-800'>Employee Management</h1>
                <div className='flex gap-3 items-center'>
                    {condenseClientInfo.role === 'SuperAdmin'
                        &&
                        <Button
                            onClick={() => setShowForm(true)}
                            className='!text-white !bg-gray-900 !flex !justify-center !items-center !gap-6 hover:opacity-95'
                        >
                            <Add />
                            Add New Employee
                        </Button>
                    }
                    <Tooltip title='Refresh Data'>
                        <lord-icon
                            src='https://cdn.lordicon.com/jxhgzthg.json'
                            trigger='click' stroke='bold' state='loop-cycle'
                            colors='primary:#111827,secondary:#111827'
                            style={{ width: '25px', height: '25px', cursor: 'pointer' }}
                            onClick={getAllEmployees}
                        />
                    </Tooltip>
                </div>
            </div>

            <div className='bg-white rounded-lg shadow'>
                <div className='p-6 '>
                    <EmployeeTable
                        employeesData={employeesData}
                        onRemoveAccess={handleRemoveAccess}
                        onEditEmployee={handleEditEmployee}
                    />
                </div>
            </div>

            {showForm && (
                <EmployeeForm
                    onClose={() => setShowForm(false)}
                    onSubmit={handleAddEmployee}
                />
            )}
        </div>
    );
}

export default EmployeeManagement;