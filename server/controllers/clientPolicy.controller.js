import fs from 'fs';
import ejs from 'ejs';
import path from 'path';
import axios from 'axios';
import csv from 'csvtojson';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { Parser } from '@json2csv/plainjs/index.js';
// importing models
import Client from '../models/client.model.js';
import Policy from '../models/policy.model.js';
import Company from '../models/company.model.js';
import Quotation from '../models/quotation.model.js';
import ClientPolicy from '../models/clientPolicy.model.js';
import CombinedQuotation from '../models/combinedQuotation.model.js';
// importing helper functions
import { transporter } from '../utils/helperFunctions.js';
import Employee from '../models/employee.model.js';

const __dirname = path.resolve();

// working
const processFormData = (formData) => {
    const fieldMappings = {
        dob: 'personalDetails.dob',
        gender: 'personalDetails.gender',
        street: 'personalDetails.address.street',
        city: 'personalDetails.address.city',
        state: 'personalDetails.address.state',
        pincode: 'personalDetails.address.pincode',
        country: 'personalDetails.address.country',
        panCard: 'financialDetails.pan_card',
        accountNo: 'financialDetails.accountDetails.accountNo',
        ifscCode: 'financialDetails.accountDetails.ifscCode',
        bankName: 'financialDetails.accountDetails.bankName',
        aadharNo: 'financialDetails.aadhaarNo',
        companyName: 'employmentDetails.companyName',
        designation: 'employmentDetails.designation',
        annualIncome: 'employmentDetails.annualIncome'
    };

    const result = {
        personalDetails: {
            address: {}
        },
        financialDetails: {
            accountDetails: {}
        },
        employmentDetails: {}
    };

    for (const [key, value] of Object.entries(formData)) {
        if (fieldMappings[key]) {
            const path = fieldMappings[key].split('.');
            let ref = result;

            for (let i = 0; i < path.length - 1; i++) {
                ref[path[i]] = ref[path[i]] || {};
                ref = ref[path[i]];
            }

            ref[path[path.length - 1]] = value;
        }
    }

    return result;
};
// working
const addAdditionalClientData = async (clientId, formData) => {
    try {
        const updateData = processFormData(formData);
        const updateFields = {};

        if (updateData.personalDetails) {
            for (const [key, value] of Object.entries(updateData.personalDetails)) {
                if (key === 'address') {
                    for (const [addKey, addValue] of Object.entries(value)) {
                        updateFields[`personalDetails.address.${addKey}`] = addValue;
                    }
                } else {
                    updateFields[`personalDetails.${key}`] = value;
                }
            }
        }
        if (updateData.financialDetails) {
            for (const [key, value] of Object.entries(updateData.financialDetails)) {
                if (key === 'accountDetails') {
                    for (const [accKey, accValue] of Object.entries(value)) {
                        updateFields[`financialDetails.accountDetails.${accKey}`] = accValue;
                    }
                } else {
                    updateFields[`financialDetails.${key}`] = value;
                }
            }
        }
        if (updateData.employmentDetails) {
            for (const [key, value] of Object.entries(updateData.employmentDetails)) {
                updateFields[`employmentDetails.${key}`] = value;
            }
        }

        const result = await Client.updateOne(
            { _id: new ObjectId(clientId) },
            { $set: updateFields },
            { upsert: true }
        );
        console.log(updateFields);

        console.log(`${result.matchedCount} document(s) matched the filter.`);
        console.log(`${result.modifiedCount} document(s) were updated.`);
    } catch (err) {
        console.error('Error updating data:', err);
    }
};
// working
const sendTemplateMessage = async (phoneNumber, pocName, policyType, formLink) => {
    try {
        const url = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`;

        const headers = {
            Authorization: `Bearer ${process.env.GRAPH_API_TOKEN}`,
            'Content-Type': 'application/json',
        };

        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phoneNumber,
            type: 'template',
            template: {
                name: 'paaras_quotation_template_one',
                language: { code: 'en_US' },
                components: [
                    {
                        type: "body",
                        parameters: [
                            { type: "text", text: pocName },
                            { type: "text", text: policyType },
                            { type: "text", text: formLink }
                        ]
                    }
                ]
            },
        };

        const response = await axios.post(url, payload, { headers });
        return response.data;
    } catch (error) {
        console.error('Error sending template message:', error.response?.data || error.message);
        throw error;
    }
};
// working
const sendQuotationWA = async ({ to, clientPolicyId, clientId, policyType }) => {
    for (let i = 0; i < to.length; i++) {
        const phoneNumber = `91${to[i]?.phones[0]}`;
        // const companyName = to[i]?.companyName[0];
        const pocName = to[i]?.names[0];
        const formLink = `${process.env.FRONT_END_URL}/companyForm/${clientId}/${clientPolicyId}/${to[i]._id}`;

        const result = await sendTemplateMessage(phoneNumber, pocName, policyType, formLink);
        console.log(result);
    }
};
// working
const sendQuotationMail = async ({ to, clientPolicyId, clientId, policyId, policyType }) => {
    const emailTemplate = fs.readFileSync('./assets/getQuotationEmailTemplate.ejs', 'utf-8');
    for (let i = 0; i < to.length; i++) {
        const emailContent = ejs.render(emailTemplate, {
            formLink: `${process.env.FRONT_END_URL}/companyForm/${clientId}/${clientPolicyId}/${to[i]._id}`,
            policyType: policyType,
            year: new Date().getFullYear(),
        });

        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: to[i].emails?.toString(),
            subject: 'New Quotation!',
            html: emailContent
        };
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error on Nodemailer side: ', error);
            }
        });
    }
};
// working
const createClientPolicy = async (req, res) => {
    try {
        console.log(req.body);
        const { policyId, clientId, formData } = req.body;
        const client = await Client.findById(new ObjectId(clientId));

        if (!client) return res.status(404).json({ message: 'Client not found' });

        const newClientPolicy = await ClientPolicy.create({
            policyId: policyId,
            clientId: clientId,
            data: formData,
            stage: 'Interested'
        });

        // addAdditionalClientData(clientId, data); // to update client details with new form data

        const policy = await Policy.findById(policyId);
        const policyType = policy?.policyType;

        const result = await Company.aggregate([
            { $unwind: '$companyPoliciesProvided' },
            {
                $match: {
                    $expr: {
                        $eq: [
                            { $toLower: '$companyPoliciesProvided.policyType' },
                            policyType?.toLowerCase()
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    emails: { $push: '$companyPoliciesProvided.contactPerson.email' },
                    phones: { $push: '$companyPoliciesProvided.contactPerson.phone' },
                    names: { $push: '$companyPoliciesProvided.contactPerson.name' },
                    companyName: { $push: '$companyName' }
                }
            },
            {
                $project: {
                    _id: 1,
                    emails: 1,
                    phones: 1,
                    names: 1,
                    companyName: 1,
                }
            }
        ]);
        console.log(result);

        const combinedQuotation = await CombinedQuotation.create({
            clientPolicyId: newClientPolicy._id,
            clientId: clientId,
            policyId: policyId,
            quotationData: [],
            countTotalEmails: result.length,
            countRecievedQuotations: 0,
        });

        newClientPolicy.associatedPoCs = result;
        newClientPolicy.quotation = combinedQuotation._id;
        await newClientPolicy.save();

        if (result.length > 0) {
            sendQuotationWA({ to: result, clientPolicyId: newClientPolicy._id, clientId, policyId, policyType });
            sendQuotationMail({ to: result, clientPolicyId: newClientPolicy._id, clientId, policyId, policyType });
        }

        if (policy) {
            await client.addInteraction('Interested in Policy', `Client is interested in ${policy.policyName} policy.`);
        }

        return res.status(200).json({ newClientPolicy });
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const uploadClientPolicyMedia = async (req, res) => {
    try {
        const { clientPolicyId } = req.body
        const clientPolicy = await ClientPolicy.findById(clientPolicyId);

        if (!clientPolicy) return res.status(404).json({ message: 'Client policy not found' })

        clientPolicy.data = clientPolicy.data || {};

        req.files?.forEach((file) => {
            const fieldName = file.fieldname.replace('files[', '').replace(']', '');
            const fileURL = `${process.env.BACK_END_URL}/uploads/${file.filename}`;
            clientPolicy.data[fieldName] = fileURL;
        });

        clientPolicy.markModified('data');
        await clientPolicy.save();

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const uploadExisitingClientPolicy = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, expiryDate, policyNo } = req.body?.formData;
        const clientId = req.client?._id
        const clientPolicy = await ClientPolicy.create({
            clientId: clientId,
            policyId: new ObjectId('6777932ef2013d3cfcc27347'),
            data: {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
            },
            stage: 'Assigned',
            expiryDate: expiryDate,
            policyNo: policyNo,
            origin: 'UploadedByUser',
        });

        res.status(200).json(clientPolicy);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const uploadExisitingClientPolicyMedia = async (req, res) => {
    try {
        const { clientPolicyId } = req.body;
        const file = req.files[0];
        const clientPolicy = await ClientPolicy.findById(clientPolicyId);
        if (!clientPolicy) return res.status(404).json({ message: 'Client Policy not found.' });

        clientPolicy.policyDocumentURL = `${process.env.BACK_END_URL}/uploads/${file.filename}`;
        await clientPolicy.save();
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const fetchClientPolicy = async (req, res) => {
    try {
        const { clientPolicyId } = req.query;

        const clientPolicy = await ClientPolicy.aggregate([
            { $match: { _id: new ObjectId(clientPolicyId) } },
            {
                $lookup: {
                    from: 'policies',
                    localField: 'policyId',
                    foreignField: '_id',
                    as: 'policyData'
                }
            },
            { $unwind: '$policyData' },
            {
                $lookup: {
                    from: 'combinedquotations',
                    localField: 'quotation',
                    foreignField: '_id',
                    as: 'quotationData'
                }
            },
            { $unwind: { path: '$quotationData', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    clientId: 1,
                    policyId: 1,
                    data: 1,
                    stage: 1,
                    policyNo: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    expiryDate: 1,
                    policyDocumentURL: 1,
                    policyDetails: {
                        policyName: '$policyData.policyName',
                        policyType: '$policyData.policyType',
                        policyDescription: '$policyData.policyDescription',
                        policyIcon: '$policyData.policyIcon',
                        policyForm: '$policyData.form',
                    },
                    combinedQuotationDetails: {
                        quotationData: '$quotationData.quotationData',
                        status: '$quotationData.status',
                        countTotalEmails: '$quotationData.countTotalEmails',
                        countRecievedQuotations: '$quotationData.countRecievedQuotations',
                        sentBy: '$quotationData.sentBy',
                        createdAt: '$quotationData.createdAt',
                        updatedAt: '$quotationData.updatedAt',
                    }
                }
            }
        ]);
        res.status(200).json(clientPolicy[0]);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const fetchClientPolicyForCompany = async (req, res) => {
    try {
        const { clientPolicyId, companyId } = req.query;
        const company = await Company.findById(companyId);

        if (!company) return res.status(404).json({ message: 'Invalid company' });
        const dejaVuIHaveBeenInThisPlaceBefore = await Quotation.findOne({ clientPolicyId: clientPolicyId, companyId: companyId });
        if (dejaVuIHaveBeenInThisPlaceBefore) return res.status(401).json({ message: 'dejaVuIHaveBeenInThisPlaceBefore' });
        const clientPolicy = await ClientPolicy.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(clientPolicyId) } },
            {
                $lookup: {
                    from: 'policies',
                    localField: 'policyId',
                    foreignField: '_id',
                    as: 'format'
                }
            },
            { $unwind: '$format' },
            { $unset: ['data.email', 'data.phone'] },
            {
                $project: {
                    _id: 1,
                    clientId: 1,
                    data: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    format: {
                        policyName: 1,
                        policyType: 1,
                        policyDescription: 1,
                        policyIcon: 1,
                        policyForm: '$format.form',
                    }
                }
            }
        ]);
        res.status(200).json(clientPolicy[0]);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const fetchAllUnassignedPolicies = async (req, res) => {
    try {
        const unassignedPolicies = await ClientPolicy.aggregate([
            { $match: { stage: 'Interested' } },
            {
                $lookup: {
                    from: 'clients',
                    localField: 'clientId',
                    foreignField: '_id',
                    as: 'clientData'
                }
            },
            { $unwind: '$clientData' },
            {
                $lookup: {
                    from: 'policies',
                    localField: 'policyId',
                    foreignField: '_id',
                    as: 'policyData'
                }
            },
            { $unwind: '$policyData' },
            {
                $lookup: {
                    from: 'combinedquotations',
                    localField: 'quotation',
                    foreignField: '_id',
                    as: 'quotationData'
                }
            },
            { $unwind: { path: '$quotationData', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    data: 1,
                    clientId: 1,
                    policyId: 1,
                    stage: 1,
                    quotation: 1,
                    associatedPoCs: 1,
                    clientDetails: {
                        firstName: '$clientData.personalDetails.firstName',
                        lastName: '$clientData.personalDetails.lastName',
                        email: '$clientData.personalDetails.contact.email',
                        phone: '$clientData.personalDetails.contact.phone',
                        dob: '$clientData.personalDetails.dob',
                        gender: '$clientData.personalDetails.gender',
                    },
                    format: {
                        policyName: '$policyData.policyName',
                        policyType: '$policyData.policyType',
                        policyIcon: '$policyData.policyIcon',
                        policyDescription: '$policyData.policyDescription',
                        policyForm: '$policyData.form'
                    },
                    combinedQuotationDetails: {
                        quotationData: '$quotationData.quotationData',
                        status: '$quotationData.status',
                        countTotalEmails: '$quotationData.countTotalEmails',
                        countRecievedQuotations: '$quotationData.countRecievedQuotations',
                        sentBy: '$quotationData.sentBy',
                        createdAt: '$quotationData.createdAt',
                        updatedAt: '$quotationData.updatedAt',
                    },
                    createdAt: 1,
                    updatedAt: 1,
                }
            }
        ]);

        res.status(200).json(unassignedPolicies);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const fetchAllAssignedPolicies = async (req, res) => {
    try {
        const assignedPolicies = await ClientPolicy.aggregate([
            { $match: { stage: 'Assigned', } },
            {
                $lookup: {
                    from: 'clients',
                    localField: 'clientId',
                    foreignField: '_id',
                    as: 'clientData'
                }
            },
            { $unwind: '$clientData' },
            {
                $lookup: {
                    from: 'policies',
                    localField: 'policyId',
                    foreignField: '_id',
                    as: 'policyData'
                }
            },
            { $unwind: '$policyData' },
            {
                $project: {
                    data: 1,
                    stage: 1,
                    clientId: 1,
                    policyId: 1,
                    policyNo: 1,
                    policyDocumentURL: 1,
                    assignedBy: 1,
                    clientDetails: {
                        firstName: '$clientData.personalDetails.firstName',
                        lastName: '$clientData.personalDetails.lastName',
                        email: '$clientData.personalDetails.contact.email',
                        phone: '$clientData.personalDetails.contact.phone',
                        dob: '$clientData.personalDetails.dob',
                        gender: '$clientData.personalDetails.gender',
                    },
                    format: {
                        policyName: '$policyData.policyName',
                        policyType: '$policyData.policyType',
                        policyIcon: '$policyData.policyIcon',
                        policyDescription: '$policyData.policyDescription',
                        policyForm: '$policyData.form'
                    },
                    createdAt: 1,
                    updatedAt: 1,
                }
            }
        ]);

        res.status(200).json(assignedPolicies);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const countAllAssignedPolicies = async (req, res) => {
    try {
        const clientPolicies = await ClientPolicy.find({ stage: 'Assigned' });
        const count = clientPolicies.length;
        res.status(200).json(count)
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const updateClientPolicy = async (req, res) => {
    try {
        const clientId = req.client._id;
        const isCurrentClientEmployee = await Employee.findOne({ clientId: clientId });
        if (!isCurrentClientEmployee) return res.status(400).json({ message: 'Unauthorised access' });

        const { formData, selectedPolicyId } = req.body;

        const updatedPolicy = await ClientPolicy.findByIdAndUpdate(selectedPolicyId,
            { $set: { data: formData } },
            { new: true }
        );

        if (!updatedPolicy) return res.status(404).json({ message: 'Policy not found!' });

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
}
// working
const uploadUpdateClientPolicyMedia = async (req, res) => {
    try {
        const clientId = req.client._id;
        const isCurrentClientEmployee = await Employee.findOne({ clientId: clientId });
        if (!isCurrentClientEmployee) return res.status(400).json({ message: 'Unauthorised access' });

        const { selectedPolicyId } = req.body;

        const existingPolicy = await ClientPolicy.findById(selectedPolicyId);
        if (!existingPolicy) return res.status(404).json({ message: 'Policy not found' });

        for (const file of req.files) {
            const oldFileUrl = existingPolicy.data[file.fieldname];
            if (oldFileUrl) {
                const oldFilePath = path.join(__dirname, 'uploads', path.basename(oldFileUrl));
                if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath)
            }

            const fileURL = `${process.env.BACK_END_URL}/uploads/${file.filename}`;

            await ClientPolicy.findByIdAndUpdate(selectedPolicyId,
                { $set: { [`data.${file.fieldname}`]: fileURL } },
                { new: true }
            );
        }

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
}
// working LATER: 'assignedBy' should be an ObjectId (but then import csv will be affected)
const assignClientPolicy = async (req, res) => {
    try {
        const { assignPolicyID, formData } = req.body;
        const { expiryDate, policyNo } = formData;
        const clientPolicy = await ClientPolicy.findByIdAndUpdate(assignPolicyID, {
            $set: {
                stage: 'Assigned',
                expiryDate: expiryDate,
                policyNo: policyNo,
                assignedBy: `${req.client?.personalDetails?.firstName} ${req.client?.personalDetails?.lastName}`
            }
        }, { new: true });
        const policy = await Policy.findById(clientPolicy.policyId);
        await Client.findByIdAndUpdate(
            clientPolicy.clientId,
            {
                $push: {
                    interactionHistory: {
                        type: 'Assigned Policy',
                        description: `A ${policy.policyName} (${policy.policyType}) policy was assigned to the client`
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
const uploadAssignClientPolicyMedia = async (req, res) => {
    try {
        const { assignPolicyID } = req.body;
        const file = req.files[0];
        const clientPolicy = await ClientPolicy.findById(assignPolicyID);
        if (!clientPolicy) return res.status(404).json({ message: 'Client Policy not found.' });

        clientPolicy.policyDocumentURL = `${process.env.BACK_END_URL}/uploads/${file.filename}`;
        await clientPolicy.save();
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const sendCombinedQuotation = async (req, res) => {
    try {
        const { clientPolicyId, combinedQuotationData } = req.body;
        const combinedQuotation = await CombinedQuotation.findOneAndUpdate(
            { clientPolicyId: clientPolicyId },
            {
                $set: {
                    quotationData: combinedQuotationData,
                    status: 'UploadedByAdmin'
                }
            }, { new: true }
        );
        const clientPolicy = await ClientPolicy.findByIdAndUpdate(clientPolicyId, {
            $set: { quotation: combinedQuotation._id }
        }, { new: true });

        const policy = await Policy.findById(clientPolicy.policyId);
        await Client.findByIdAndUpdate(
            clientPolicy.clientId,
            {
                $push: {
                    interactionHistory: {
                        type: 'Quotation Recieved',
                        description: `Excel with quotation for ${policy.policyName} (${policy.policyType}) recieved.`
                    }
                }
            }
        );

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const exportCsv = async (req, res) => {
    try {
        const clientPolicies = await ClientPolicy.find().lean();

        const predefinedDynamicOrder = [
            'data.firstName',
            'data.lastName',
            'data.email',
            'data.phone',
            'data.heightLife',
            'data.weightLife',
            'data.motherNameLife',
            'data.qualificationsLife',
            'data.natureOfWorkLife',
            'data.annualIncomeLife',
            'data.nameOfCompanyLife',
            'data.industryOfBusinessLife',
            'data.typeOfCompanyLife',
            'data.habitsLife',
            'data.nomineeNameLife',
            'data.nomineeDoBLife',
            'data.nomineeRelationLife',
            'data.panCardLife',
            'data.aadhaarCardLife',
            'data.livePhotoLife',
            'data.cancelledChequeLife',
            'data.itrWithCoiLife',
            'data.dobHealth',
            'data.heightHealth',
            'data.weightHealth',
            'data.educationHealth',
            'data.occupationHealth',
            'data.annualIncomeHealth',
            'data.substanceUseHealth',
            'data.streetHealth',
            'data.cityHealth',
            'data.stateHealth',
            'data.countryHealth',
            'data.pincodeHealth',
            'data.nomineeNameHealth',
            'data.nomineeDoBHealth',
            'data.nomineeRelationHealth',
            'data.panCardHealth',
            'data.aadhaarCardHealth',
            'data.cancelledChequeHealth',
            'data.membersHealth',
            'data.1memberFirstNameHealth',
            'data.1memberLastNameHealth',
            'data.1memberDobHealth',
            'data.1memberHeightHealth',
            'data.1memberWeightHealth',
            'data.1memberPhoneHealth',
            'data.1memberRelationHealth',
            'data.1memberSubstanceUseHealth',
            'data.2memberFirstNameHealth',
            'data.2memberLastNameHealth',
            'data.2memberDobHealth',
            'data.2memberHeightHealth',
            'data.2memberWeightHealth',
            'data.2memberPhoneHealth',
            'data.2memberRelationHealth',
            'data.2memberSubstanceUseHealth',
            'data.3memberFirstNameHealth',
            'data.3memberLastNameHealth',
            'data.3memberDobHealth',
            'data.3memberHeightHealth',
            'data.3memberWeightHealth',
            'data.3memberPhoneHealth',
            'data.3memberRelationHealth',
            'data.3memberSubstanceUseHealth',
            'data.passportNoTravel',
            'data.passportTravelTravel',
            'data.ticketsTravel',
            'data.diseaseTravel',
            'data.membersTravel',
            'data.1memberNameTravel',
            'data.1memberDOBTravel',
            'data.1memberRelationTravel',
            'data.1memberDiseaseTravel',
            'data.2memberNameTravel',
            'data.2memberDOBTravel',
            'data.2memberRelationTravel',
            'data.2memberDiseaseTravel',
            'data.3memberNameTravel',
            'data.3memberDOBTravel',
            'data.3memberRelationTravel',
            'data.3memberDiseaseTravel',
            'data.existingPolicyVehicle',
            'data.claimPreviousYearVehicle',
            'data.rcVehicle',
        ];

        const dynamicFields = new Set();
        clientPolicies.forEach(policy => {
            if (policy.data) {
                Object.keys(policy.data).forEach(key => dynamicFields.add(`data.${key}`));
            }
        });

        const sortedDynamicFields = Array.from(dynamicFields).sort((a, b) => {
            const indexA = predefinedDynamicOrder.indexOf(a);
            const indexB = predefinedDynamicOrder.indexOf(b);
            return indexA - indexB;
        });

        const staticFields = [
            '_id',
            'policyId',
            'clientId',
            'stage',
            'policyDocumentURL',
            'createdAt',
            'updatedAt',
            'assignedBy',
            'expiryDate',
            'policyNo',
            'origin',
        ];

        const fields = [...staticFields, ...sortedDynamicFields];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(clientPolicies);

        res.header('Content-Type', 'text/csv');
        res.attachment('clientPolicies.csv');
        return res.send(csv);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const importCsv = async (req, res) => {
    try {
        const csvData = await csv().fromFile(req.file.path);

        const operations = csvData.map(async (row) => {
            const {
                _id,
                policyId,
                clientId,
                stage,
                expiryDate,
                policyDocumentURL,
                assignedBy,
                origin,
                policyNo,
                createdAt,
                updatedAt,
                ...restData
            } = row;

            const data = Object.keys(restData)
                .filter((key) => key.startsWith('data'))
                .reduce((acc, key) => {
                    if (restData[key] !== '') {
                        acc['data'] = restData[key];
                    }
                    return acc;
                }, {})?.data;

            try {
                const policy = await Policy.findOne({ _id: policyId.trim() });
                const client = await Client.findOne({ _id: clientId.trim() });

                if (!policy) {
                    console.error(`Policy with ID ${policyId} not found.`);
                    return;
                }
                if (!client) {
                    console.error(`Client with ID ${clientId} not found.`);
                    return;
                }

                const policyData = {
                    policyId: policyId.trim(),
                    clientId: clientId.trim(),
                    data,
                    stage: stage || '',
                    expiryDate: expiryDate || null,
                    policyDocumentURL: policyDocumentURL || '',
                    policyNo: policyNo || '',
                    assignedBy: assignedBy || '',
                    origin: origin || '',
                    createdAt,
                    updatedAt,
                };

                if (_id && _id.trim()) {
                    console.log(`Updating existing ClientPolicy entry with _id: ${_id}`);
                    return await ClientPolicy.updateOne(
                        { _id: _id.trim() },
                        { $set: policyData },
                        { runValidators: true }
                    );
                } else {
                    console.log(`Creating new ClientPolicy entry for policyId: ${policyId}, clientId: ${clientId}`);

                    return await ClientPolicy.create(policyData);
                }
            } catch (error) {
                if (error.name === 'ValidationError') {
                    const missingFields = Object.keys(error.errors).map((field) => error.errors[field].path);
                    console.error(`Validation failed for row: ${JSON.stringify(row)}`);
                    console.error(`Missing or invalid fields: ${missingFields.join(', ')}`);
                } else {
                    console.error(`Error processing row: ${JSON.stringify(row)}`);
                    throw err;
                }
            }
        });

        await Promise.all(operations);
        res.status(200).json({ message: 'CSV processed successfully' });
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};

export {
    createClientPolicy,
    uploadClientPolicyMedia,
    uploadExisitingClientPolicy,
    uploadExisitingClientPolicyMedia,
    fetchClientPolicy,
    fetchClientPolicyForCompany,
    fetchAllUnassignedPolicies,
    fetchAllAssignedPolicies,
    countAllAssignedPolicies,
    updateClientPolicy,
    uploadUpdateClientPolicyMedia,
    assignClientPolicy,
    uploadAssignClientPolicyMedia,
    sendCombinedQuotation,
    exportCsv,
    importCsv,
};
// obsolete
// const addAvailableCompanyPolicies = async (req, res) => {
//     try {
//         const { policyIdForExcel, excelData } = req.body;
//         const clientPolicy = await ClientPolicy.findByIdAndUpdate(policyIdForExcel,
//             { $set: { quotation: excelData } },
//             { new: true }
//         );
//         const policy = await Policy.findById(clientPolicy.policyId);
//         await Client.findByIdAndUpdate(
//             clientPolicy.clientId,
//             {
//                 $push: {
//                     interactionHistory: {
//                         type: 'Quotation Recieved',
//                         description: `Excel with quotation for ${policy.policyName} (${policy.policyType}) recieved.`
//                     }
//                 }
//             }
//         )
//         res.sendStatus(200);
//     } catch (error) {
//         console.error(error);
//         res.status(503).json({ message: 'Network error. Try again' });
//     }
// };