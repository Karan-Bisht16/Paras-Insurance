import { ObjectId } from 'mongodb';
// importing models
import SIP from '../models/sip.model.js';
import Client from '../models/client.model.js';
import Employee from '../models/employee.model.js';

// working
const createSip = async (req, res) => {
    try {
        const { formData, id } = req.body.formData;
        const { personalDetails, financialDetails } = formData;
        if (
            !personalDetails?.firstName ||
            !personalDetails?.contact?.email ||
            !personalDetails?.contact?.phone
        ) return res.status(400).json({ message: 'First Name, Email, and Phone are required.' });

        const sip = await SIP.create({
            clientId: id,
            personalDetails, financialDetails,
            stage: 'Interested'
        });

        const client = await Client.findByIdAndUpdate(
            id,
            {
                $push: {
                    interactionHistory: {
                        type: 'SIP Requested',
                        description: 'A request to start a new SIP has been submitted.',
                    },
                }
            },
            { new: true }
        );

        if (!client) return res.status(404).json({ message: 'Client not found.' });

        res.status(200).json(sip);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working
const uploadSipMedia = async (req, res) => {
    try {
        const { sipId } = req.body;
        const filesArray = req.files;
        const sip = await SIP.findById(sipId);
        
        for (let file of filesArray) {
            const fieldName = file.fieldname;
            if (fieldName === 'panCard') {
                sip.financialDetails.panCardURL = `${process.env.BACK_END_URL}/uploads/${file.filename}`;
            } else if (fieldName === 'aadhaar') {
                sip.financialDetails.aadhaarURL = `${process.env.BACK_END_URL}/uploads/${file.filename}`;
            } else if (fieldName === 'cancelledCheque') {
                sip.financialDetails.accountDetails.cancelledChequeURL = `${process.env.BACK_END_URL}/uploads/${file.filename}`;
            }
        }
        
        await sip.save();
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working
const fetchSips = async (req, res) => {
    try {
        const { clientId } = req.query;
        const currentClientId = req.client._id;
        if (clientId !== currentClientId.toString()) {
            const isCurrentClientEmployee = await Employee.findOne({ clientId: currentClientId.toString() });

            if (!isCurrentClientEmployee) return res.status(400).json({ message: 'Unauthorised action.' });

            const client = await Client.findById(clientId);
            if (!client) return res.status(404).json({ message: 'No client found.' });
        }

        const clientSip = await SIP.find({ clientId: new ObjectId(clientId) });

        res.status(200).json(clientSip);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working
const fetchAllUnassignedSips = async (req, res) => {
    try {
        const unassignedSips = await SIP.aggregate([
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
                    personalDetails: 1,
                    financialDetails: 1,
                    stage: 1,
                    sipDocumentURL: 1,
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

        res.status(200).json(unassignedSips);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const fetchAllAssignedSips = async (req, res) => {
    try {
        const assignedSips = await SIP.aggregate([
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
                    personalDetails: 1,
                    financialDetails: 1,
                    stage: 1,
                    assignedBy: 1,
                    sipDocumentURL: 1,
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

        res.status(200).json(assignedSips);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const updateSip = async (req, res) => {
    try {
        const clientId = req.client._id;
        const isCurrentClientEmployee = await Employee.findOne({ clientId: clientId });
        if (!isCurrentClientEmployee) return res.status(400).json({ message: 'Unauthorised access' });

        const { formData, selectedSipId } = req.body;
        const { personalDetails, financialDetails } = formData;
    
        if (
            !personalDetails?.firstName ||
            !personalDetails?.contact?.email ||
            !personalDetails?.contact?.phone
        ) return res.status(400).json({ message: 'First Name, Email, and Phone are required.' });

        const updatedSip = await SIP.findByIdAndUpdate(selectedSipId,
            { $set: { personalDetails, financialDetails } },
            { new: true }
        );

        if (!updatedSip) return res.status(404).json({ message: 'SIP not found!' });

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
}
// working LATER: 'assignedBy' should be an ObjectId (but then import csv will be affected)
const assignSip = async (req, res) => {
    try {
        const { assignSipID, formData } = req.body;
        const { expiryDate, policyNo } = formData;
        const sip = await SIP.findByIdAndUpdate(assignSipID, {
            $set: {
                stage: 'Assigned',
                expiryDate: expiryDate,
                sipNo: policyNo,
                assignedBy: `${req.client?.personalDetails?.firstName} ${req.client?.personalDetails?.lastName}`
            }
        }, { new: true });
        await Client.findByIdAndUpdate(
            sip.clientId,
            {
                $push: {
                    interactionHistory: {
                        type: 'Assigned SIP',
                        description: `A SIP was assigned to the client`
                    }
                },
                $set: { userType: 'Client' }
            }
        );
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const uploadAssignSipMedia = async (req, res) => {
    try {
        const { assignSipID } = req.body;
        const file = req.files[0];
        const sip = await SIP.findById(assignSipID);
        if (!sip) return res.status(404).json({ message: 'SIP not found.' });

        sip.sipDocumentURL = `${process.env.BACK_END_URL}/uploads/${file.filename}`;
        await sip.save();
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};

export {
    createSip,
    uploadSipMedia,
    fetchSips,
    fetchAllUnassignedSips,
    fetchAllAssignedSips,
    updateSip,
    assignSip,
    uploadAssignSipMedia,
}