import fs from 'fs';
import ejs from 'ejs';
import path from 'path';
import mongoose from 'mongoose';
import { ObjectId } from "mongodb";
// importing models
import Client from "../models/client.model.js";
import Policy from "../models/policy.model.js";
import Company from "../models/company.model.js";
import Quotation from '../models/quotation.model.js';
import ClientPolicy from "../models/clientPolicy.model.js";
import CombinedQuotation from '../models/combinedQuotation.model.js';
// importing helper functions
import { condenseClientInfo, cookiesOptions, generateAccessAndRefreshTokens, transporter } from '../utils/helperFunctions.js';

const __dirname = path.resolve();

const processFormData = (formData) => {
    const fieldMappings = {
        dob: "personalDetails.dob",
        gender: "personalDetails.gender",
        street: "personalDetails.address.street",
        city: "personalDetails.address.city",
        state: "personalDetails.address.state",
        pincode: "personalDetails.address.pincode",
        country: "personalDetails.address.country",
        panCard: "financialDetails.pan_card",
        accountNo: "financialDetails.accountDetails.accountNo",
        ifscCode: "financialDetails.accountDetails.ifscCode",
        bankName: "financialDetails.accountDetails.bankName",
        aadharNo: "financialDetails.aadhaarNo",
        companyName: "employmentDetails.companyName",
        designation: "employmentDetails.designation",
        annualIncome: "employmentDetails.annualIncome"
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
            const path = fieldMappings[key].split(".");
            let ref = result;

            for (let i = 0; i < path.length - 1; i++) {
                ref[path[i]] = ref[path[i]] || {};
                ref = ref[path[i]];
            }

            ref[path[path.length - 1]] = value;
        }
    }

    return result;
}

const addAdditionalClientData = async (clientId, formData) => {
    try {
        const updateData = processFormData(formData);
        const updateFields = {};

        if (updateData.personalDetails) {
            for (const [key, value] of Object.entries(updateData.personalDetails)) {
                if (key === "address") {
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
                if (key === "accountDetails") {
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
        console.error("Error updating data:", err);
    }
}

const sendQuotationMail = async ({ to, clientPolicyId, clientId, policyId, policyType }) => {
    console.log(to);
    const a = await CombinedQuotation.create({
        clientPolicyId: clientPolicyId,
        clientId: clientId,
        policyId: policyId,
        quotationData: [],
        countTotalEmails: to.length,
        countRecievedQuotations: 0,
    });

    console.log(a);
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
        { $unwind: "$companyPoliciesProvided" },
        {
            $match: {
                $expr: {
                    $eq: [
                        { $toLower: "$companyPoliciesProvided.policyType" },
                        policyType.toLowerCase()
                    ]
                }
            }
        },
        {
            $group: {
                _id: '$_id',
                emails: { $push: "$companyPoliciesProvided.contactPerson.email" }
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

    // const clientPolicies = clientData.policies;
    // clientPolicies.push({ policyId: newClientPolicy._id, interestedIn: true });
    // await Client.findByIdAndUpdate(clientId, {
    //     $set: { policies: clientPolicies }
    // });

    res.status(200)
        .cookie('accessToken', accessToken, cookiesOptions)
        .cookie('refreshToken', refreshToken, cookiesOptions)
        .json({ clientInfo, newClientPolicy });
}
// TODO: if logged in; if not logged in (has account; no account); repeat this for SIP and General Insurance
const createClientPolicy = async (req, res) => {
    try {
        console.log(req.body);
        const { policyId, clientId, password, formData } = req.body;
        // FIXME: this will not be executed for now
        if (!clientId && password) {
            let newClientId;
            const { firstName, lastName, phone, email } = formData;
            if (email) {
                const clientCorrespondingToEmail = await Client.findOne({ 'personalDetails.contact.email': email });
                if (clientCorrespondingToEmail) {
                    newClientId = clientCorrespondingToEmail._id;
                    await clientPolicyWithClientId(res, {
                        policyId,
                        clientId: newClientId,
                        data: formData,
                        clientData: clientCorrespondingToEmail,
                        isNewClient: false
                    });
                    return;
                }
            }
            if (phone) {
                const clientCorrespondingToPhone = await Client.findOne({ 'personalDetails.contact.phone': phone });
                if (clientCorrespondingToPhone) {
                    newClientId = clientCorrespondingToPhone._id;
                    await clientPolicyWithClientId(res, {
                        policyId,
                        clientId: newClientId,
                        data: formData,
                        clientData: clientCorrespondingToPhone,
                        isNewClient: false
                    });
                    return;
                }
            }
            const newClient = await Client.create({
                userType: 'Lead',
                password: password,
                personalDetails: {
                    firstName: firstName,
                    lastName: lastName,
                    contact: {
                        email: email,
                        phone: phone
                    },
                }
            });

            newClientId = newClient._id;
            await clientPolicyWithClientId(res, {
                policyId,
                clientId: newClientId,
                data: formData,
                clientData: newClient,
                isNewClient: true
            });
            return;
        } else {
            const client = await Client.findById(new ObjectId(clientId));
            await clientPolicyWithClientId(res, {
                policyId,
                clientId: new ObjectId(clientId),
                data: formData,
                clientData: client,
                isNewClient: false
            });
            return;
        }
    } catch (error) {
        console.log(error);
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
}
// working
const fecthAllUnassignedPolicies = async (req, res) => {
    try {
        const unassignedPolicies = await ClientPolicy.aggregate([
            { $match: { stage: 'Interested', } },
            {
                $lookup: {
                    from: "clients",
                    localField: "clientId",
                    foreignField: "_id",
                    as: "clientData"
                }
            },
            { $unwind: "$clientData" },
            {
                $lookup: {
                    from: "policies",
                    localField: "policyId",
                    foreignField: "_id",
                    as: "policyData"
                }
            },
            { $unwind: "$policyData" },
            {
                $project: {
                    data: 1,
                    clientId: 1,
                    policyId: 1,
                    stage: 1,
                    quotation: 1,
                    clientDetails: {
                        firstName: "$clientData.personalDetails.firstName",
                        lastName: "$clientData.personalDetails.lastName",
                        email: "$clientData.personalDetails.contact.email",
                        phone: "$clientData.personalDetails.contact.phone",
                        dob: "$clientData.personalDetails.dob",
                        gender: "$clientData.personalDetails.gender",
                    },
                    format: {
                        policyName: "$policyData.policyName",
                        policyType: "$policyData.policyType",
                        policyIcon: "$policyData.policyIcon",
                        policyDescription: "$policyData.policyDescription",
                        policyForm: "$policyData.form"
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
}
// working TODO: assigned by info
const fecthAllAssignedPolicies = async (req, res) => {
    try {
        const assignedPolicies = await ClientPolicy.aggregate([
            { $match: { stage: 'Assigned', } },
            {
                $lookup: {
                    from: "clients",
                    localField: "clientId",
                    foreignField: "_id",
                    as: "clientData"
                }
            },
            { $unwind: "$clientData" },
            {
                $lookup: {
                    from: "policies",
                    localField: "policyId",
                    foreignField: "_id",
                    as: "policyData"
                }
            },
            { $unwind: "$policyData" },
            {
                $project: {
                    data: 1,
                    stage: 1,
                    clientId: 1,
                    policyId: 1,
                    assignedBy: 1,
                    clientDetails: {
                        firstName: "$clientData.personalDetails.firstName",
                        lastName: "$clientData.personalDetails.lastName",
                        email: "$clientData.personalDetails.contact.email",
                        phone: "$clientData.personalDetails.contact.phone",
                        dob: "$clientData.personalDetails.dob",
                        gender: "$clientData.personalDetails.gender",
                    },
                    format: {
                        policyName: "$policyData.policyName",
                        policyType: "$policyData.policyType",
                        policyIcon: "$policyData.policyIcon",
                        policyDescription: "$policyData.policyDescription",
                        policyForm: "$policyData.form"
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
}
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
}
// working
const assignClientPolicy = async (req, res) => {
    try {
        const { assignPolicyID, expiryDate } = req.body;
        const clientPolicy = await ClientPolicy.findByIdAndUpdate(assignPolicyID, {
            $set: {
                stage: 'Assigned',
                expiryDate: expiryDate,
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
                $set: {
                    userType: 'Client',
                }
            }
        )
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
}
// working
const uploadClientPolicyMedia = async (req, res) => {
    try {
        const { assignPolicyID } = req.body;
        const file = req.files[0];
        const clientPolicy = await ClientPolicy.findById(assignPolicyID);
        if (!clientPolicy) return res.status(404).json({ message: 'client Policy not found.' });

        clientPolicy.policyCertificateURL = file.filename;
        await clientPolicy.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
}

const addAvailableCompanyPolicies = async (req, res) => {
    try {
        console.log(req.body);
        const { policyIdForExcel, excelData } = req.body;
        const clientPolicy = await ClientPolicy.findByIdAndUpdate(policyIdForExcel,
            { $set: { quotation: excelData } },
            { new: true }
        );
        console.log(clientPolicy);
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
        )
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
}

export {
    createClientPolicy,
    fetchClientPolicy,
    fecthAllUnassignedPolicies,
    fecthAllAssignedPolicies,
    countAllAssignedPolicies,
    assignClientPolicy,
    uploadClientPolicyMedia,
    addAvailableCompanyPolicies,
};