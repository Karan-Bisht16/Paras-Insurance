// importing models
import mongoose, { Mongoose } from 'mongoose';
import Client from '../models/client.model.js';
import Employee from '../models/employee.model.js';
// importing helper functions
import { generateAccessAndRefreshTokens } from '../utils/helperFunctions.js';

// LATER: to convert a client into an employee 
const createEmployee = async (req, res) => {
    try {
        const newEmployee = await Employee.create(req.body);
        res.status(200).json(newEmployee);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const addEmployee = async (req, res) => {
    try {
        const { employeeId, firstName, lastName, email, phone, role, managerId, status, loginAccess } = req.body;
        const employee = await Employee.findOne({ clientId: employeeId });

        if (employee.role !== 'SuperAdmin') return res.status(400).json({ message: 'Unauthorised action.' });

        const isClientEmailUnique = await Client.findOne({ 'personalDetails.contact.email': email });
        if (isClientEmailUnique) return res.status(400).json({ message: 'Email already registered.' });

        const isClientPhoneUnique = await Client.findOne({ 'personalDetails.contact.phone': phone });
        if (isClientPhoneUnique) return res.status(400).json({ message: 'Phone already registered.' });

        const newClient = await Client.create({
            userType: 'Employee',
            password: `${firstName}@${lastName}`,
            personalDetails: {
                firstName: firstName,
                lastName: lastName,
                contact: {
                    email: email,
                    phone: phone
                },
            }
        });

        const newEmployee = await Employee.create({
            clientId: newClient._id, managerId, status, role, loginAccess
        });

        const returnData = {
            _id: newEmployee._id.toString(),
            clientId: newEmployee.clientId.toString(),
            firstName: newClient.personalDetails?.firstName || '',
            lastName: newClient.personalDetails?.lastName || '',
            email: newClient.personalDetails?.contact?.email || '',
            phone: newClient.personalDetails?.contact?.phone || '',
            role: newEmployee.role || '',
            managerID: newEmployee.managerID ? newEmployee.managerID.toString() : null,
            status: newEmployee.status || '',
            statusChangedBy: newEmployee.statusChangedBy || '',
            loginAccess: newEmployee.loginAccess || false,
            createdAt: newEmployee.createdAt || '',
            updatedAt: newEmployee.updatedAt || '',
            __v: newEmployee.__v || 0
        };

        await generateAccessAndRefreshTokens(newClient);
        res.status(200).json(returnData);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const fetchAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.aggregate([
            {
                $lookup: {
                    from: 'clients',
                    localField: 'clientId',
                    foreignField: '_id',
                    as: 'clientData'
                }
            },
            {
                $unwind: {
                    path: '$clientData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    firstName: '$clientData.personalDetails.firstName',
                    lastName: '$clientData.personalDetails.lastName',
                    email: '$clientData.personalDetails.contact.email',
                    phone: '$clientData.personalDetails.contact.phone',
                }
            },
            {
                $project: {
                    clientData: 0
                }
            }
        ]);

        res.status(200).json(employees);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const editEmployee = async (req, res) => {
    try {
        const { _id, role, status, loginAccess } = req.body;
        const currentClientId = req.client._id;

        const isCurrentClientEmployee = await Employee.findOne({ clientId: currentClientId });

        if (!isCurrentClientEmployee || isCurrentClientEmployee?.role?.toLowerCase() !== 'superadmin') {
            return res.status(400).json({ message: 'Unauthorised action.' });
        }
        const updatedEmployee = await Employee.findByIdAndUpdate(_id, {
            $set: {
                role: role,
                status: status,
                loginAccess: loginAccess,
                statusChangedBy: isCurrentClientEmployee._id
            }
        }, { new: true });

        if (!updatedEmployee) return res.status(404).json({ error: 'Employee not found' });

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
}
// working 
const removeEmployeeAccess = async (req, res) => {
    try {
        const { employeeId } = req.query;
        const currentClientId = req.client._id;

        const isCurrentClientEmployee = await Employee.findOne({ clientId: currentClientId.toString() });

        if (!isCurrentClientEmployee || isCurrentClientEmployee?.role?.toLowerCase() !== 'superadmin') {
            return res.status(400).json({ message: 'Unauthorised action.' });
        }
        const currentEmployeeId = isCurrentClientEmployee._id;

        if (employeeId === currentEmployeeId.toString()) {
            return res.status(400).json({ message: `Cannot change one's own access` });
        }

        const removedEmployee = await Employee.findByIdAndDelete(employeeId);

        if (!removedEmployee) return res.status(404).json({ error: 'Employee not found' });

        // LATER: Check if employee has any assigned policies then based on that set userType to 'Lead' or 'Client'
        await Client.findByIdAndUpdate(removedEmployee.clientId, { $set: { userType: 'Lead' } });

        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};

export {
    createEmployee,
    addEmployee,
    fetchAllEmployees,
    editEmployee,
    removeEmployeeAccess,
};