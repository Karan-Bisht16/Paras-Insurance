import fs from 'fs';
import ejs from 'ejs';
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
import { condenseClientInfo, cookiesOptions, generateAccessAndRefreshTokens, transporter } from '../utils/helperFunctions.js';

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
const sendQuotationMail = async ({ to, clientPolicyId, clientId, policyId, policyType }) => {
    await CombinedQuotation.create({
        clientPolicyId: clientPolicyId,
        clientId: clientId,
        policyId: policyId,
        quotationData: [],
        countTotalEmails: to.length,
        countRecievedQuotations: 0,
    });

    const emailTemplate = fs.readFileSync('./assets/quotationEmailTemplate.ejs', 'utf-8');
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
const clientPolicyWithClientId = async (res, { policyId, clientId, data, clientData, isNewClient }) => {
    const newClientPolicy = await ClientPolicy.create({
        policyId: policyId,
        clientId: clientId,
        data: data,
        stage: 'Interested'
    });

    addAdditionalClientData(clientId, data);

    const policy = await Policy.findById(policyId);
    const policyType = policy.policyType.toLowerCase();

    const result = await Company.aggregate([
        { $unwind: '$companyPoliciesProvided' },
        {
            $match: {
                $expr: {
                    $eq: [
                        { $toLower: '$companyPoliciesProvided.policyType' },
                        policyType.toLowerCase()
                    ]
                }
            }
        },
        {
            $group: {
                _id: '$_id',
                emails: { $push: '$companyPoliciesProvided.contactPerson.email' }
            }
        },
        {
            $project: {
                _id: 1,
                emails: 1
            }
        }
    ]);
    console.log(result);

    sendQuotationMail({ to: result, clientPolicyId: newClientPolicy._id, clientId, policyId, policyType });
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(clientData);
    const clientInfo = await condenseClientInfo(clientData);

    res.status(200)
        .cookie('accessToken', accessToken, cookiesOptions)
        .cookie('refreshToken', refreshToken, cookiesOptions)
        .json({ clientInfo, newClientPolicy });
};
// working
const createClientPolicy = async (req, res) => {
    try {
        console.log(req.body);
        const { policyId, clientId, formData } = req.body;
        // this is redundant
        // if (!clientId && password) {
        //     let newClientId;
        //     const { firstName, lastName, phone, email } = formData;
        //     if (email) {
        //         const clientCorrespondingToEmail = await Client.findOne({ 'personalDetails.contact.email': email });
        //         if (clientCorrespondingToEmail) {
        //             newClientId = clientCorrespondingToEmail._id;
        //             await clientPolicyWithClientId(res, {
        //                 policyId,
        //                 clientId: newClientId,
        //                 data: formData,
        //                 clientData: clientCorrespondingToEmail,
        //                 isNewClient: false
        //             });
        //             return;
        //         }
        //     }
        //     if (phone) {
        //         const clientCorrespondingToPhone = await Client.findOne({ 'personalDetails.contact.phone': phone });
        //         if (clientCorrespondingToPhone) {
        //             newClientId = clientCorrespondingToPhone._id;
        //             await clientPolicyWithClientId(res, {
        //                 policyId,
        //                 clientId: newClientId,
        //                 data: formData,
        //                 clientData: clientCorrespondingToPhone,
        //                 isNewClient: false
        //             });
        //             return;
        //         }
        //     }
        //     const newClient = await Client.create({
        //         userType: 'Lead',
        //         password: password,
        //         personalDetails: {
        //             firstName: firstName,
        //             lastName: lastName,
        //             contact: {
        //                 email: email,
        //                 phone: phone
        //             },
        //         }
        //     });

        //     newClientId = newClient._id;
        //     await clientPolicyWithClientId(res, {
        //         policyId,
        //         clientId: newClientId,
        //         data: formData,
        //         clientData: newClient,
        //         isNewClient: true
        //     });
        //     return;
        // } else {
        const client = await Client.findById(new ObjectId(clientId));
        await clientPolicyWithClientId(res, {
            policyId,
            clientId: new ObjectId(clientId),
            data: formData,
            clientData: client,
            isNewClient: false
        });
        return;
        // }
    } catch (error) {
        console.log(error);
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

        console.log(clientPolicy.data);

        // res.status(200).json({ message: 'File URLs updated successfully', data: clientPolicy.data });
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
}
// working
const fetchClientPolicy = async (req, res) => {
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
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
}
// working
const exportCsv = async (req, res) => {
    try {
        const clientPolicies = await ClientPolicy.find().lean();

        const dynamicFields = new Set();
        clientPolicies.forEach(policy => {
            if (policy.data) {
                Object.keys(policy.data).forEach(key => dynamicFields.add(`data.${key}`));
            }
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

        const fields = [...staticFields, ...dynamicFields];

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
// working TODO: update with new dynamic form
const importCsv = async (req, res) => {
    try {
        console.log('huu')
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
            } = row;

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
                    policyId: row.policyId,
                    clientId: row.clientId,
                    data: {
                        firstName: row.data['firstName'] || '',
                        lastName: row.data['lastName'] || '',
                        email: row.data['email'] || '',
                        phone: row.data['phone'] || '',
                        pincode: row.data['pincode'] || '',
                        disease: row.data['disease'] || 'No',
                        '1nomineeName': row.data['1nomineeName'] || '',
                        '1nomineeDOB': row.data['1nomineeDOB'] || '',
                        '1nomineeRelation': row.data['1nomineeRelation'] || '',
                        gender: row.data['gender'] || '',
                        age: row.data['age'] || '',
                        sumInsured: row.data['sumInsured'] || '',
                        substanceUse: row.data['substanceUse'] || '',
                        '1memberFirstName': row.data['1memberFirstName'] || '',
                        '1memberLastName': row.data['1memberLastName'] || '',
                        '1memberGender': row.data['1memberGender'] || '',
                        '1memberAge': row.data['1memberAge'] || '',
                        '1memberRelation': row.data['1memberRelation'] || '',
                        passportNo: row.data['passportNo'] || '',
                        tickets: row.data['tickets'] || '',
                        '1nomineeDisease': row.data['1nomineeDisease'] || '',
                        dob: row.data['dob'] || '',
                        insurancePlan: row.data['insurancePlan'] || '',
                        street: row.data['street'] || '',
                        city: row.data['city'] || '',
                        state: row.data['state'] || '',
                        PINCODE: row.data['PINCODE'] || '',
                        country: row.data['country'] || '',
                        '1memberSubstanceUse': row.data['1memberSubstanceUse'] || '',
                    },
                    stage: stage || '',
                    expiryDate: expiryDate || null,
                    policyDocumentURL: policyDocumentURL || '',
                    assignedBy: assignedBy || '',
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

                    return await ClientPolicy.create({
                        policyId: row.policyId,
                        clientId: row.clientId,
                        data: {
                            firstName: row.data['firstName'] || '',
                            lastName: row.data['lastName'] || '',
                            email: row.data['email'] || '',
                            phone: row.data['phone'] || '',
                            pincode: row.data['pincode'] || '',
                            disease: row.data['disease'] || 'No',
                            '1nomineeName': row.data['1nomineeName'] || '',
                            '1nomineeDOB': row.data['1nomineeDOB'] || '',
                            '1nomineeRelation': row.data['1nomineeRelation'] || '',
                            gender: row.data['gender'] || '',
                            age: row.data['age'] || '',
                            sumInsured: row.data['sumInsured'] || '',
                            substanceUse: row.data['substanceUse'] || '',
                            '1memberFirstName': row.data['1memberFirstName'] || '',
                            '1memberLastName': row.data['1memberLastName'] || '',
                            '1memberGender': row.data['1memberGender'] || '',
                            '1memberAge': row.data['1memberAge'] || '',
                            '1memberRelation': row.data['1memberRelation'] || '',
                            passportNo: row.data['passportNo'] || '',
                            tickets: row.data['tickets'] || '',
                            '1nomineeDisease': row.data['1nomineeDisease'] || '',
                            dob: row.data['dob'] || '',
                            insurancePlan: row.data['insurancePlan'] || '',
                            street: row.data['street'] || '',
                            city: row.data['city'] || '',
                            state: row.data['state'] || '',
                            PINCODE: row.data['PINCODE'] || '',
                            country: row.data['country'] || '',
                            '1memberSubstanceUse': row.data['1memberSubstanceUse'] || '',
                        },
                        stage: stage || '',
                        expiryDate: expiryDate || null,
                        policyDocumentURL: policyDocumentURL || '',
                        assignedBy: assignedBy || '',
                        origin: origin || '',
                    });
                }
            } catch (error) {
                if (error.name === 'ValidationError') {
                    const missingFields = Object.keys(error.errors).map((field) => error.errors[field].path);
                    console.error(`Validation failed for row: ${JSON.stringify(row)}`);
                    console.error(`Missing or invalid fields: ${missingFields.join(', ')}`);
                } else {
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
    fetchClientPolicy,
    fetchAllUnassignedPolicies,
    fetchAllAssignedPolicies,
    countAllAssignedPolicies,
    assignClientPolicy,
    uploadAssignClientPolicyMedia,
    sendCombinedQuotation,
    uploadExisitingClientPolicy,
    uploadExisitingClientPolicyMedia,
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
//         console.log(error);
//         res.status(503).json({ message: 'Network error. Try again' });
//     }
// };