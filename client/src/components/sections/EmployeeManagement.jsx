import { useContext, useEffect, useState } from 'react';
import { Add } from '@mui/icons-material';
import { ClientContext } from '../../contexts/Client.context';
import { addEmployee, fetchAllEmployees, removeEmployeeAccess } from '../../api';
import EmployeeTable from './employees/EmployeeTable';
import EmployeeForm from './employees/EmployeeForm';
import { Button } from '@mui/material';

const EmployeeManagement = () => {
    const [showForm, setShowForm] = useState(false);

    const [employeesData, setEmployeesData] = useState([]);
    const { condenseClientInfo } = useContext(ClientContext);
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
            return false;
        } catch (error) {
            console.log(error);
            const { response } = error;
            return response?.data?.message;
        }
    };

    const handleRemoveAccess = async (employeeId) => {
        try {
            await removeEmployeeAccess({ employeeId });
            setEmployeesData(prevEmployeesData => prevEmployeesData.filter((employee) => employee._id !== employeeId));
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
                {condenseClientInfo.role === 'SuperAdmin'
                    &&
                    <Button
                        onClick={() => setShowForm(true)}
                        className="!text-white !bg-gray-900 !flex !justify-center !items-center !gap-6 hover:opacity-95"
                    >
                        <Add />
                        Add New Employee
                    </Button>
                }
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-6 ">
                    <EmployeeTable
                        employeesData={employeesData}
                        onRemoveAccess={handleRemoveAccess}
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