import { ObjectId } from 'mongodb';
// importing models
import Client from "../models/client.model.js";
import GeneralInsurance from "../models/generalInsurance.model.js";
import Employee from '../models/employee.model.js';

// working
const createGeneralInsurance = async (req, res) => {
    try {
        const { formData, id } = req.body.formData;
        const { personalDetails, financialDetails, policyType } = formData;
        if (
            !personalDetails?.firstName ||
            !personalDetails?.contact?.email ||
            !personalDetails?.contact?.phone
        ) return res.status(400).json({ message: 'First Name, Email, and Phone are required.' });

        const generalInsurance = await GeneralInsurance.create({
            clientId: id,
            policyType,
            personalDetails, financialDetails,
            stage: 'Interested'
        });

        res.status(200).json(generalInsurance);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working
const uploadGeneralInsuranceMedia = async (req, res) => {
    try {
        const { generalInsuranceId } = req.body;
        const filesArray = req.files;
        const generalInsurance = await GeneralInsurance.findById(generalInsuranceId);

        for (let file of filesArray) {
            const fieldName = file.fieldname;
            if (fieldName === 'panCard') {
                generalInsurance.financialDetails.panCardURL = `${process.env.BACK_END_URL}/uploads/${file.filename}`;
            } else if (fieldName === 'aadhaar') {
                generalInsurance.financialDetails.aadhaarURL = `${process.env.BACK_END_URL}/uploads/${file.filename}`;
            } else if (fieldName === 'cancelledCheque') {
                generalInsurance.financialDetails.accountDetails.cancelledCheque = `${process.env.BACK_END_URL}/uploads/${file.filename}`;
            }
        }

        await generalInsurance.save();
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working
const fetchGeneralInsurances = async (req, res) => {
    try {
        const { clientId } = req.query;
        const currentClientId = req.client._id;
        if (clientId !== currentClientId.toString()) {
            const isCurrentClientEmployee = await Employee.findOne({ clientId: currentClientId.toString() });

            if (!isCurrentClientEmployee) return res.status(400).json({ message: 'Unauthorised action.' });

            const client = await Client.findById(clientId);
            if (!client) return res.status(404).json({ message: 'No client found.' });
        }

        const clientGeneralInsurance = await GeneralInsurance.find({ clientId: new ObjectId(clientId) });

        res.status(200).json(clientGeneralInsurance);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working
const fetchAllUnassignedGeneralInsurances = async (req, res) => {
    try {
        const generalInsurances = await GeneralInsurance.aggregate([
            { $match: { stage: 'Interested' } },
            {
                $lookup: {
                    from: 'clients',
                    localField: 'clientId',
                    foreignField: '_id',
                    as: 'clientDetails'
                }
            },
            { $unwind: '$clientDetails' },
            {
                $project: {
                    _id: 1,
                    clientId: 1,
                    policyType: 1,
                    personalDetails: 1,
                    financialDetails: 1,
                    stage: 1,
                    generalInsuranceDocumentURL: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    'clientDetails.userType': 1,
                    'clientDetails.personalDetails.firstName': 1,
                    'clientDetails.personalDetails.lastName': 1,
                    'clientDetails.personalDetails.contact.email': 1,
                    'clientDetails.personalDetails.contact.phone': 1,
                    'clientDetails.personalDetails.dob': 1,
                    'clientDetails.personalDetails.gender': 1,
                    'clientDetails.personalDetails.address': 1,
                    'clientDetails.financialDetails.panCardNo': 1,
                    'clientDetails.financialDetails.aadhaarNo': 1,
                    'clientDetails.financialDetails.accountDetails': 1,
                    'clientDetails.KYC': 1
                }
            }
        ]);

        res.status(200).json(generalInsurances);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working
const fetchAllAssignedGeneralInsurances = async (req, res) => {
    try {
        const generalInsurances = await GeneralInsurance.aggregate([
            { $match: { stage: 'Assigned' } },
            {
                $lookup: {
                    from: 'clients',
                    localField: 'clientId',
                    foreignField: '_id',
                    as: 'clientDetails'
                }
            },
            { $unwind: '$clientDetails' },
            {
                $project: {
                    _id: 1,
                    clientId: 1,
                    policyType: 1,
                    personalDetails: 1,
                    financialDetails: 1,
                    stage: 1,
                    assignedBy: 1,
                    generalInsuranceDocumentURL: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    'clientDetails.userType': 1,
                    'clientDetails.personalDetails.firstName': 1,
                    'clientDetails.personalDetails.lastName': 1,
                    'clientDetails.personalDetails.contact.email': 1,
                    'clientDetails.personalDetails.contact.phone': 1,
                    'clientDetails.personalDetails.dob': 1,
                    'clientDetails.personalDetails.gender': 1,
                    'clientDetails.personalDetails.address': 1,
                    'clientDetails.financialDetails.panCardNo': 1,
                    'clientDetails.financialDetails.aadhaarNo': 1,
                    'clientDetails.financialDetails.accountDetails': 1,
                    'clientDetails.KYC': 1
                }
            }
        ]);

        res.status(200).json(generalInsurances);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working LATER: 'assignedBy' should be an ObjectId (but then import csv will be affected)
const assignGeneralInsurance = async (req, res) => {
    try {
        const { assignGeneralInsuranceID, formData } = req.body;
        const { expiryDate, policyNo } = formData;
        const generalInsurance = await GeneralInsurance.findByIdAndUpdate(assignGeneralInsuranceID, {
            $set: {
                stage: 'Assigned',
                expiryDate: expiryDate,
                generalInsuranceNo: policyNo,
                assignedBy: `${req.client?.personalDetails?.firstName} ${req.client?.personalDetails?.lastName}`
            }
        }, { new: true });
        await Client.findByIdAndUpdate(
            generalInsurance.clientId,
            {
                $push: {
                    interactionHistory: {
                        type: 'Assigned General Insurance',
                        description: `A General Insurance (${generalInsurance?.policyType}) was assigned to the client`
                    }
                },
                $set: { userType: 'Client' }
            }
        );
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const uploadAssignGeneralInsuranceMedia = async (req, res) => {
    try {
        const { assignGeneralInsuranceID } = req.body;
        const file = req.files[0];
        const generalInsurance = await GeneralInsurance.findById(assignGeneralInsuranceID);
        if (!generalInsurance) return res.status(404).json({ message: 'General Insurance not found.' });

        generalInsurance.generalInsuranceDocumentURL = `${process.env.BACK_END_URL}/uploads/${file.filename}`;
        await generalInsurance.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};

export {
    createGeneralInsurance,
    uploadGeneralInsuranceMedia,
    fetchGeneralInsurances,
    fetchAllUnassignedGeneralInsurances,
    fetchAllAssignedGeneralInsurances,
    assignGeneralInsurance,
    uploadAssignGeneralInsuranceMedia
}