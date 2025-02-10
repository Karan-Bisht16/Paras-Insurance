import fs from 'fs';
import ejs from 'ejs';
import path from 'path';
import axios from 'axios';
import csv from 'csvtojson';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { Parser } from '@json2csv/plainjs';
// importing models
import SIP from '../models/sip.model.js';
import Client from '../models/client.model.js';
import Callback from '../models/callback.model.js';
import Employee from '../models/employee.model.js';
import ClientPolicy from '../models/clientPolicy.model.js';
import GeneralInsurance from '../models/generalInsurance.model.js';
// importing helper functions
import { condenseClientInfo, cookiesOptions, generateAccessAndRefreshTokens, normalizePhoneNumber, transporter } from '../utils/helperFunctions.js';

const __dirname = path.resolve();

// working
const sendResetPasswordMail = async ({ res, to, client, resetToken }) => {
    const emailTemplate = fs.readFileSync('./assets/resetPasswordEmailTemplate.ejs', 'utf-8');
    const emailContent = ejs.render(emailTemplate, {
        firstName: client.personalDetails.firstName,
        resetLink: `${process.env.FRONT_END_URL}/resetPassword/${resetToken}`,
        year: new Date().getFullYear()
    });

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: to.toString(),
        subject: 'Password Reset Request',
        html: emailContent
    };

    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error on Nodemailer side: ', error);
            res.status(503).json({ message: 'Network error. Try again' })
        } else {
            res.status(200).json({ message: 'A URL has been sent to the email address above. Click it to reset your password.' })
        }
    });
};
// working
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        const isClientEmailUnique = await Client.findOne({ 'personalDetails.contact.email': email });
        if (isClientEmailUnique) return res.status(400).json({ message: 'Email already registered. Login' });

        const isClientPhoneUnique = await Client.findOne({ 'personalDetails.contact.phone': phone });
        if (isClientPhoneUnique) return res.status(400).json({ message: 'Phone already registered. Login' });

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

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(newClient);
        const clientInfo = await condenseClientInfo(newClient);

        res.status(200)
            .cookie('accessToken', accessToken, cookiesOptions)
            .cookie('refreshToken', refreshToken, cookiesOptions)
            .json(clientInfo);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const login = async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;
        const checkForEmail = await Client.findOne({ 'personalDetails.contact.email': emailOrPhone });
        const checkForPhone = await Client.findOne({ 'personalDetails.contact.phone': emailOrPhone });
        if (!checkForEmail && !checkForPhone) return res.status(404).json({ message: 'No such client found' });

        let existingClient;
        if (checkForEmail) existingClient = checkForEmail;
        if (checkForPhone) existingClient = checkForPhone;

        const isPasswordCorrect = await existingClient.isPasswordCorrect(password);
        if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials' });

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(existingClient);
        const clientInfo = await condenseClientInfo(existingClient);

        res.status(200)
            .cookie('accessToken', accessToken, cookiesOptions)
            .cookie('refreshToken', refreshToken, cookiesOptions)
            .json(clientInfo);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working
const create = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        const isClientEmailUnique = await Client.findOne({ 'personalDetails.contact.email': email });
        if (isClientEmailUnique) return res.status(400).json({ message: 'Email already registered. Login' });

        const isClientPhoneUnique = await Client.findOne({ 'personalDetails.contact.phone': phone });
        if (isClientPhoneUnique) return res.status(400).json({ message: 'Phone already registered. Login' });

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

        await generateAccessAndRefreshTokens(newClient);

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const fetchCondenseInfo = async (req, res) => {
    try {
        const clientInfo = await condenseClientInfo(req.client);

        if (!req.refreshedAccessToken) return res.status(200).json(clientInfo);

        const client = await Client.findById(req.client._id).select('-password -refreshToken');
        const accessToken = await client.generateAccessToken();
        res.status(200)
            .cookie('accessToken', accessToken, cookiesOptions)
            .json(clientInfo);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working
const fetchProfileData = async (req, res) => {
    try {
        const { clientId } = req.query;
        const currentClientId = req.client._id;
        if (clientId !== currentClientId.toString()) {
            const isCurrentClientEmployee = await Employee.findOne({ clientId: currentClientId.toString() });

            if (!isCurrentClientEmployee) return res.status(400).json({ message: 'Unauthorised action.' });

        }
        const client = await Client.findById(clientId).select('-password -refreshToken -deleted -leadDetails -notes');
        if (!client) return res.status(404).json({ message: 'No client found.' });

        res.status(200).json(client);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working 
const fetchPoliciesData = async (req, res) => {
    try {
        const { clientId } = req.query;
        const currentClientId = req.client._id;
        let clientFirstName, clientLastName;
        if (clientId !== currentClientId.toString()) {
            const isCurrentClientEmployee = await Employee.findOne({ clientId: currentClientId.toString() });

            if (!isCurrentClientEmployee) return res.status(400).json({ message: 'Unauthorised action.' });

            const client = await Client.findById(clientId);
            if (!client) return res.status(404).json({ message: 'No client found.' });

            clientFirstName = client?.personalDetails?.firstName;
            clientLastName = client?.personalDetails?.lastName;
        } else {
            clientFirstName = req.client.personalDetails.firstName;
            clientLastName = req.client.personalDetails.lastName;
        }

        const clientPolicies = await ClientPolicy.aggregate([
            { $match: { clientId: new ObjectId(clientId) } },
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

        res.status(200).json({ clientPolicies, clientFirstName, clientLastName });
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working
const fetchAllClients = async (req, res) => {
    try {
        const clientId = req.client._id;
        const employee = await Employee.findOne({ clientId: clientId });
        if (!employee) return res.status(400).json({ message: 'Unauthorised action.' });

        const clients = await Client.aggregate([
            { $match: { 'deleted.isDeleted': false } },
            {
                $lookup: {
                    from: 'employees',
                    localField: '_id',
                    foreignField: 'clientId',
                    as: 'employeeData',
                },
            },
            {
                $match: {
                    employeeData: { $size: 0 },
                },
            },
            {
                $project: {
                    password: 0,
                    refreshToken: 0,
                    employeeData: 0,
                },
            },
        ]);

        res.status(200).json(clients);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working
const updateProfile = async (req, res) => {
    try {
        const { formData, removedFiles } = req.body.formData;
        const clientId = formData._id;
        const currentClientId = req.client._id;
        if (clientId !== currentClientId.toString()) {
            const isCurrentClientEmployee = await Employee.findOne({ clientId: currentClientId.toString() });

            if (!isCurrentClientEmployee) return res.status(400).json({ message: 'Unauthorised action.' });
        }

        const { personalDetails, financialDetails, employmentDetails } = formData;
        if (
            !personalDetails?.firstName ||
            !personalDetails?.contact?.email ||
            !personalDetails?.contact?.phone
        ) return res.status(400).json({ message: 'First Name, Email, and Phone are required.' });

        const uniqueFields = [
            { 'personalDetails.contact.email': personalDetails.contact.email },
            { 'personalDetails.contact.phone': personalDetails.contact.phone },
        ];

        if (financialDetails?.aadhaarNo && financialDetails.aadhaarNo.trim() !== '') {
            uniqueFields.push({ 'financialDetails.aadhaarNo': financialDetails.aadhaarNo });
        }

        if (financialDetails?.panCardNo && financialDetails.panCardNo.trim() !== '') {
            uniqueFields.push({ 'financialDetails.panCardNo': financialDetails.panCardNo });
        }

        const existingClient = await Client.findOne({
            $or: uniqueFields,
            _id: { $ne: clientId },
        });

        if (existingClient) return res.status(400).json({ message: 'Email, Phone, Aadhaar No, or PAN Card No must be unique.' });

        const client = await Client.findById(clientId);
        if (removedFiles?.aadhaar && client?.financialDetails?.aadhaarURL) {
            const aadhaarPath = path.join(__dirname, 'uploads', client?.financialDetails?.aadhaarURL);
            if (fs.existsSync(aadhaarPath)) fs.unlinkSync(aadhaarPath);
            financialDetails.aadhaarURL = '';
        }
        if (removedFiles?.panCard && client?.financialDetails?.panCardURL) {
            const panCardPath = path.join(__dirname, 'uploads', client?.financialDetails?.panCardURL);
            if (fs.existsSync(panCardPath)) fs.unlinkSync(panCardPath);
            financialDetails.panCardURL = '';
        }
        if (removedFiles?.cancelledCheque && client?.financialDetails?.accountDetails?.cancelledChequeURL) {
            const cancelledChequePath = path.join(__dirname, 'uploads', client?.financialDetails?.accountDetails?.cancelledChequeURL);
            if (fs.existsSync(cancelledChequePath)) fs.unlinkSync(cancelledChequePath);
            financialDetails.accountDetails.cancelledChequeURL = '';
        }

        const updatedClient = await Client.findByIdAndUpdate(
            clientId,
            { personalDetails, financialDetails, employmentDetails },
            { new: true, runValidators: true }
        );

        if (!updatedClient) return res.status(404).json({ message: 'Client not found.' });

        if (clientId !== currentClientId.toString()) {
            await updatedClient.addInteraction('Details updated', `An admin has updated your profile.`);
        } else {
            await updatedClient.addInteraction('Details updated', `You've updated your profile.`);
        }

        res.status(200).json(updatedClient);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working
const uploadProfilePhoto = async (req, res) => {
    try {
        const file = req.file;
        const client = req.client;

        client.personalDetails.avatar = `${process.env.BACK_END_URL}/uploads/${file.filename}`;
        await client.save();
        const clientInfo = await condenseClientInfo(req.client);

        res.status(200).json(clientInfo);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
}
// working
const uploadProfileMedia = async (req, res) => {
    try {
        const { clientId } = req.body;
        const filesArray = req.files;

        const client = await Client.findById(clientId);
        if (!client) return res.status(404).json({ message: 'Client not found.' });

        for (let file of filesArray) {
            const fieldName = file.fieldname;
            if (fieldName === 'panCard') {
                // Delete old PAN card file
                if (client.financialDetails?.panCardURL) {
                    const oldPath = path.join(__dirname, 'uploads', client?.financialDetails?.panCardURL);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
                client.financialDetails.panCardURL = `${process.env.BACK_END_URL}/uploads/${file.filename}`;
            } else if (fieldName === 'aadhaar') {
                // Delete old Aadhaar file
                if (client.financialDetails?.aadhaarURL) {
                    const oldPath = path.join(__dirname, 'uploads', client?.financialDetails?.aadhaarURL);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
                client.financialDetails.aadhaarURL = `${process.env.BACK_END_URL}/uploads/${file.filename}`;
            } else if (fieldName === 'cancelledCheque') {
                // Delete old Cancelled Cheque file
                if (client.financialDetails?.accountDetails?.cancelledChequeURL) {
                    const oldPath = path.join(__dirname, 'uploads', client?.financialDetails?.accountDetails?.cancelledChequeURL);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
                client.financialDetails.accountDetails.cancelledChequeURL = `${process.env.BACK_END_URL}/uploads/${file.filename}`;
            }
        }
        await client.save();
        res.status(200).json(client);
        // const filesPath = { panCardFilePath: '', aadhaarFilePath: '' };
        // for (let i = 0; i < filesArray.length; i++) {
        //     const file = filesArray[i];
        //     const fieldName = file.fieldname;
        //     const fileName = file.filename;
        //     if (fieldName === 'panCard') {
        //         filesPath.panCardFilePath = fileName;
        //     } else if (fieldName === 'aadhaar') {
        //         filesPath.aadhaarFilePath = fileName;
        //     }
        // }
        // const client = await Client.findById(clientId);
        // if (!client) {
        //     // Delete the newly uploaded files since the client doesn't exist
        //     if (filesPath.panCardFilePath) {
        //         fs.unlinkSync(path.join(__dirname, 'uploads', filesPath.panCardFilePath));
        //     }
        //     if (filesPath.aadhaarFilePath) {
        //         fs.unlinkSync(path.join(__dirname, 'uploads', filesPath.aadhaarFilePath));
        //     }
        //     return res.status(404).json({ message: 'Client not found.' });
        // }
        // // Delete existing files if they exist
        // if (client.financialDetails?.panCardURL) {
        //     const existingPanCardPath = path.join(__dirname, 'uploads', client.financialDetails.panCardURL);
        //     if (fs.existsSync(existingPanCardPath)) {
        //         fs.unlinkSync(existingPanCardPath);
        //     }
        // }
        // if (client.financialDetails?.aadhaarURL) {
        //     const existingAadhaarPath = path.join(__dirname, 'uploads', client.financialDetails.aadhaarURL);
        //     if (fs.existsSync(existingAadhaarPath)) {
        //         fs.unlinkSync(existingAadhaarPath);
        //     }
        // }
        // // Update the client's financial details
        // client.financialDetails.panCardURL = filesPath.panCardFilePath;
        // client.financialDetails.aadhaarURL = filesPath.aadhaarFilePath;
        // await client.save();
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working
const logout = async (req, res) => {
    try {
        Client.findByIdAndUpdate(
            req.client._id,
            {
                $set: { refreshToken: undefined }
            }
        );
        res.status(200)
            .clearCookie('accessToken', cookiesOptions)
            .clearCookie('refreshToken', cookiesOptions)
            .json({ message: 'Successfully logged out' });
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const deleteProfile = async (req, res) => {
    try {
        const clientId = req.client._id;

        const client = await Client.findById(clientId);
        if (!client) return res.status(404).json({ message: 'Client not found' });

        client.deleted.isDeleted = true;
        client.deleted.contact.email = client.personalDetails.contact.email || null;
        client.deleted.contact.phone = client.personalDetails.contact.phone || null;

        client.personalDetails.contact.email = null;
        client.personalDetails.contact.phone = null;

        await client.save();

        await Employee.findOneAndDelete({ clientId: clientId });
        await ClientPolicy.deleteMany({
            clientId: clientId,
            stage: 'Interested',
        });
        await SIP.deleteMany({
            clientId: clientId,
            stage: 'Interested',
        });
        await GeneralInsurance.deleteMany({
            clientId: clientId,
            stage: 'Interested',
        });

        res.status(200)
            .clearCookie('accessToken', cookiesOptions)
            .clearCookie('refreshToken', cookiesOptions)
            .json({ message: 'Profile marked as deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.query;
        const clientCorrespondingToEmail = await Client.findOne({ 'personalDetails.contact.email': email });
        if (!clientCorrespondingToEmail) return res.status(200).json({ message: 'No such user found.' });

        const resetToken = jwt.sign(
            { clientId: clientCorrespondingToEmail._id },
            process.env.RESET_TOKEN_SECRET,
            { expiresIn: process.env.RESET_TOKEN_EXPIRY }
        );

        sendResetPasswordMail({ res, to: [email], client: clientCorrespondingToEmail, resetToken });
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working
const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        const decodedToken = jwt.verify(
            resetToken,
            process.env.RESET_TOKEN_SECRET
        );

        if (!decodedToken) {
            return res.status(401).send({ message: 'Invalid token' });
        }

        const client = await Client.findOne({ _id: decodedToken.clientId });
        if (!client) { return res.status(401).send({ message: 'No client found' }) }

        client.password = newPassword;
        await client.save();

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(client);
        const clientInfo = await condenseClientInfo(client);

        res.status(200)
            .cookie('accessToken', accessToken, cookiesOptions)
            .cookie('refreshToken', refreshToken, cookiesOptions)
            .json(clientInfo);
    } catch (error) {
        console.error(error);
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token expired' })
        } else {
            res.status(503).json({ message: 'Network error. Try again' })
        }
    }
};
// working
const findClient = async (req, res) => {
    try {
        const { email, phone } = req.body;
        const checkForEmail = await Client.findOne({ 'personalDetails.contact.email': email });
        const checkForPhone = await Client.findOne({ 'personalDetails.contact.phone': phone });
        if (!checkForEmail && !checkForPhone) return res.status(404).json({ message: 'No such client found' });

        let returnData;
        if (checkForEmail) returnData = checkForEmail.personalDetails.contact.email;
        if (checkForPhone) returnData = checkForPhone.personalDetails.contact.phone;

        res.status(200).json(returnData);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};
// working
const exportCsv = async (req, res) => {
    try {
        const clients = await Client.find().lean();
        const fields = [
            '_id',
            'userType',
            'personalDetails.firstName',
            'personalDetails.lastName',
            'personalDetails.gender',
            'personalDetails.dob',
            'personalDetails.contact.email',
            'personalDetails.contact.phone',
            'personalDetails.address.street',
            'personalDetails.address.city',
            'personalDetails.address.state',
            'personalDetails.address.pincode',
            'personalDetails.address.country',
            'personalDetails.nominee.name',
            'personalDetails.nominee.dob',
            'personalDetails.nominee.relationship',
            'personalDetails.nominee.phone',
            'financialDetails.panCardNo',
            'financialDetails.aadhaarNo',
            'financialDetails.accountDetails.accountNo',
            'financialDetails.accountDetails.ifscCode',
            'financialDetails.accountDetails.bankName',
            'KYC'
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(clients);

        res.header('Content-Type', 'text/csv');
        res.attachment('clients.csv');

        return res.send(csv);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working LATER: maybe assignPasswordFunction; No password for imported clients
const importCsv = async (req, res) => {
    try {
        const csvData = await csv().fromFile(req.file.path);

        const operations = csvData.map(async (row) => {
            const { _id, kyc } = row;
            try {
                if (_id) {
                    return await Client.updateOne(
                        { _id: _id },
                        {
                            $set: {
                                'personalDetails.firstName': row.personalDetails.firstName,
                                'personalDetails.lastName': row.personalDetails.lastName || '',
                                'personalDetails.gender': row.personalDetails.gender,
                                'personalDetails.dob': row.personalDetails.dob || null,
                                'personalDetails.contact.email': row.personalDetails.contact.email,
                                'personalDetails.contact.phone': row.personalDetails.contact.phone,
                                'personalDetails.address.street': row.personalDetails.address.street || '',
                                'personalDetails.address.city': row.personalDetails.address.city || '',
                                'personalDetails.address.state': row.personalDetails.address.state || '',
                                'personalDetails.address.pincode': row.personalDetails.address.pincode || '',
                                'personalDetails.address.country': row.personalDetails.address.country || '',
                                'personalDetails.nominee.name': row.personalDetails.nominee.name || '',
                                'personalDetails.nominee.dob': row.personalDetails.nominee.noieedob || '',
                                'personalDetails.nominee.relationship': row.personalDetails.nominee.relationship || '',
                                'personalDetails.nominee.phone': row.personalDetails.nominee.noieephone || '',
                                'financialDetails.panCardNo': row.financialDetails.panCardNo,
                                'financialDetails.aadhaarNo': row.financialDetails.aadhaarNo,
                                'financialDetails.accountDetails.accountNo': row.financialDetails.accountDetails.accountNo,
                                'financialDetails.accountDetails.ifscCode': row.financialDetails.accountDetails.ifscCode,
                                'financialDetails.accountDetails.bankName': row.financialDetails.accountDetails.bankName || '',
                                KYC: kyc === 'true',
                            },
                        },
                        { runValidators: true }
                    );
                } else {
                    return await Client.create({
                        personalDetails: {
                            firstName: row.personalDetails.firstName,
                            lastName: row.personalDetails.lastName || '',
                            gender: row.personalDetails.gender,
                            dob: row.personalDetails.dob || null,
                            contact: {
                                email: row.personalDetails.contact.email,
                                phone: row.personalDetails.contact.phone,
                            },
                            address: {
                                street: row.personalDetails.address.street || '',
                                city: row.personalDetails.address.city || '',
                                state: row.personalDetails.address.state || '',
                                pincode: row.personalDetails.address.pincode || '',
                                country: row.personalDetails.address.country || '',
                            },
                            nominee: {
                                name: row.personalDetails.nominee.name || '',
                                dob: row.personalDetails.nominee.noieedob || '',
                                relationship: row.personalDetails.nominee.relationship || '',
                                phone: row.personalDetails.nominee.noieephone || '',
                            },
                        },
                        financialDetails: {
                            panCardNo: row.financialDetails.panCardNo,
                            aadhaarNo: row.financialDetails.aadhaarNo,
                            accountDetails: {
                                accountNo: row.financialDetails.accountDetails.accountNo,
                                ifscCode: row.financialDetails.accountDetails.ifscCode,
                                bankName: row.financialDetails.accountDetails.bankName || '',
                            },
                        },
                        KYC: kyc === 'true',
                    });
                }
            } catch (error) {
                if (error.name === 'ValidationError') {
                    const missingFields = Object.keys(error.errors).map((field) => error.errors[field].path);
                    console.error(`Validation failed for row: ${JSON.stringify(row)}`);
                    console.error(`Missing or invalid fields: ${missingFields.join(', ')}`);
                } else {
                    throw error;
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
// working
const sendTemplateMessageForCallback = async (phoneNumber, adminName, clientName, clientNumber, clientMessage, clientSource) => {
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
                name: '	paaras_request_callback_one',
                language: { code: 'en_US' },
                components: [
                    {
                        type: "body",
                        parameters: [
                            { type: "text", text: adminName },
                            { type: "text", text: clientName },
                            { type: "text", text: clientNumber },
                            { type: "text", text: clientSource },
                            { type: "text", text: clientMessage },
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
const sendRequestCallbackWA = async ({ to, clientName, clientNumber, clientMessage, clientSource }) => {
    for (let i = 0; i < to.length; i++) {
        const phoneNumber = `91${to[i]?.phones}`;
        const adminName = to[i]?.name;

        const result = await sendTemplateMessageForCallback(phoneNumber, adminName, clientName, clientNumber, clientMessage, clientSource);
        console.log(result);
    }
};
// working TODO: Add proper template
const sendRequestCallbackMail = async ({ to, clientName, clientNumber, clientMessage, clientSource }) => {
    // const emailTemplate = fs.readFileSync('./assets/getQuotationEmailTemplate.ejs', 'utf-8');
    for (let i = 0; i < to.length; i++) {
        // const emailContent = ejs.render(emailTemplate, {
        //     year: new Date().getFullYear(),
        // });

        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: to[i].emails?.toString(),
            subject: 'Request Callback!',
            html: `Hi ${to[i].name},
                    <br /><br />
                    You've received a callback request from a client.
                    <br /><br />
                    Client Details:<br />
                    Name: ${clientName}<br />
                    Phone Number: ${clientNumber}<br />
                    Source: ${clientSource}<br />
                    Message: ${clientMessage}<br/>
                    <br /><br />
                    Please reach out to the client at your earliest convenience to assist them with their query.
                    <br /><br />
                    Best regards,<br />
                    Paaras Financials Team`
        };
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error on Nodemailer side: ', error);
            }
        });
    }
};
// working
const sendRequestCallback = async (name, phone, message, source) => {
    const result = await Employee.aggregate([
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
                _id: 0,
                name: {
                    $concat: [
                        '$clientDetails.personalDetails.firstName',
                        ' ',
                        '$clientDetails.personalDetails.lastName'
                    ]
                },
                phones: '$clientDetails.personalDetails.contact.phone',
                emails: '$clientDetails.personalDetails.contact.email'
            }
        }
    ]);

    console.log(result);

    if (result.length > 0) {
        await sendRequestCallbackWA({
            to: result,
            clientName: name || 'NA',
            clientNumber: phone || 'NA',
            clientMessage: message || 'NA',
            clientSource: source || 'NA',
        });
        await sendRequestCallbackMail({
            to: result,
            clientName: name || 'NA',
            clientNumber: phone || 'SNA',
            clientMessage: message || 'NA',
            clientSource: source || 'NA',
        });
    }
};
// working
const requestCallbackViaWhatsApp = async (req, res) => {
    try {
        const { clientId, name, phone, message } = req.body;

        if (clientId) {
            const updatedClient = await Client.findByIdAndUpdate(clientId, {
                $push: {
                    notes: { message: message || '', requestCallback: true, source: 'WhatsApp' },
                    interactionHistory: {
                        type: 'Callback Requested',
                        description: 'Client has requested a callback.',
                    },
                }
            }, { new: true });
            await sendRequestCallback(
                `${updatedClient?.personalDetails?.firstName}${updatedClient?.personalDetails?.lastName}`,
                updatedClient?.personalDetails?.contact?.phone,
                message,
                'WhatsApp'
            );
            return res.status(200).json({ message: 'Callback requested successfully!', count: 1, multiple: false, clientId: updatedClient._id });
        } else if (name && phone) {
            const clients = await Client.find({ 'personalDetails.contact.phone': phone }).select("_id");
            if (clients.length === 0) {
                const newClient = await Client.create({
                    userType: 'Lead',
                    password: `${name}@${normalizePhoneNumber(phone)}`,
                    personalDetails: {
                        firstName: name,
                        lastName: '',
                        contact: {
                            email: '',
                            phone: normalizePhoneNumber(phone)
                        },
                    },
                    notes: {
                        message: message || '',
                        requestCallback: true,
                        source: 'WhatsApp'
                    },
                });
                await newClient.addInteraction('Callback Requested', 'Client has requested a callback.');
                await sendRequestCallback(name, phone, message, 'WhatsApp');
                return res.status(200).json({
                    message: 'New account created!. Password is [WA_DISPLAY_NAME]@[PHONE_NUMBER]. Callback requested successfully!',
                    count: 1,
                    multiple: false,
                    clientId: newClient._id
                });
            } else if (clients.length === 1) {
                const updatedClient = await Client.findByIdAndUpdate(clients[0]._id, {
                    $push: {
                        notes: { message: message || '', requestCallback: true, source: 'WhatsApp' },
                        interactionHistory: {
                            type: 'Callback Requested',
                            description: 'Client has requested a callback.',
                        },
                    }
                }, { new: true });
                await sendRequestCallback(
                    `${updatedClient?.personalDetails?.firstName}${updatedClient?.personalDetails?.lastName}`,
                    updatedClient?.personalDetails?.contact?.phone,
                    message,
                    'WhatsApp'
                );
                return res.status(200).json({
                    message: 'Client found. Callback requested successfully!',
                    count: 1,
                    multiple: false,
                    clientId: updatedClient._id
                });
            } else {
                return res.status(200).json({
                    message: 'Multiple clients found',
                    count: clients?.length,
                    multiple: true,
                    clients: clients
                });
            }
        } else return res.status(400).json({ message: 'Invalid data' });

    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const requestCallbackViaWebsite = async (req, res) => {
    try {
        const { formData } = req.body;
        const { clientId, message } = formData;
        if (clientId) {
            const updatedClient = await Client.findByIdAndUpdate(
                clientId,
                {
                    $push: {
                        notes: { message: message || '', requestCallback: true, source: 'Website' },
                        interactionHistory: {
                            type: 'Callback Requested',
                            description: `Client has requested a callback.`,
                        },
                    }
                },
                { new: true }
            );

            if (!updatedClient) return res.status(404).json({ message: 'Client not found.' });

            const name = `${updatedClient.personalDetails.firstName} ${updatedClient.personalDetails.lastName}`;
            const phone = updatedClient?.personalDetails?.contact?.phone;
            await sendRequestCallback(name, phone, message, 'Website');
        } else {
            await Callback.create({
                clientName: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                message: formData.message,
            });

            const name = `${formData.firstName} ${formData.lastName}`;
            const phone = formData.phone;
            await sendRequestCallback(name, phone, message, 'Website');
        }

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const fetchAllRequestCallbacks = async (req, res) => {
    try {
        const currentClientId = req.client._id;
        const isCurrentClientEmployee = await Employee.findOne({ clientId: currentClientId });
        if (!isCurrentClientEmployee) return res.status(400).json({ message: 'Unauthorised access' });

        const results = await Client.aggregate([
            { $match: { "notes.requestCallback": true } },
            {
                $project: {
                    clientName: { $concat: ["$personalDetails.firstName", " ", "$personalDetails.lastName"] },
                    email: "$personalDetails.contact.email",
                    phone: "$personalDetails.contact.phone",
                    notes: {
                        $filter: {
                            input: "$notes",
                            as: "note",
                            cond: { $eq: ["$$note.requestCallback", true] }
                        }
                    }
                }
            },
            { $unwind: "$notes" },
            {
                $project: {
                    clientName: 1,
                    email: 1,
                    phone: 1,
                    _id: 1,
                    notesId: "$notes._id",
                    message: "$notes.message",
                    requestCallback: "$notes.requestCallback",
                    source: "$notes.source",
                    createdAt: "$notes.createdAt",
                    updatedAt: "$notes.updatedAt"
                }
            }
        ]);

        const callbacks = await Callback.find({ requestCallback: true });
        const updatedCallbacks = callbacks.map(callback => ({
            ...callback.toObject(),
            noAccount: true
        }));

        res.status(200).json([...results, ...updatedCallbacks]);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};
// working
const resolveRequestCallback = async (req, res) => {
    try {
        const currentClientId = req.client._id;
        const isCurrentClientEmployee = await Employee.findOne({ clientId: currentClientId });
        if (!isCurrentClientEmployee) return res.status(400).json({ message: 'Unauthorised access' });

        const { clientId, notesId } = req.query;
        if (notesId) {
            const updatedClient = await Client.updateOne(
                { _id: clientId, "notes._id": notesId },
                { $set: { "notes.$.requestCallback": false } }
            );

            if (updatedClient.modifiedCount === 0) return res.status(404).json({ message: 'Note not found or already resolved' });
        } else {
            const updatedCallback = await Callback.updateOne(
                { _id: clientId },
                { $set: { "requestCallback": false } }
            );

            if (updatedCallback.modifiedCount === 0) return res.status(404).json({ message: 'Note not found or already resolved' });
        }

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
};

export {
    register,
    login,
    create,
    fetchCondenseInfo,
    fetchProfileData,
    fetchPoliciesData,
    fetchAllClients,
    updateProfile,
    uploadProfilePhoto,
    uploadProfileMedia,
    logout,
    deleteProfile,
    forgotPassword,
    resetPassword,
    findClient,
    exportCsv,
    importCsv,
    requestCallbackViaWebsite,
    requestCallbackViaWhatsApp,
    fetchAllRequestCallbacks,
    resolveRequestCallback,
};
// obsolete
// const requestCallbackViaWhatsApp = async (req, res) => {
//     try {
//         const { name, phone, message } = req.query;
//         await sendRequestCallback(name, phone, message, 'WhatsApp');
//         res.sendStatus(200);
//     } catch (error) {
//         console.error(error);
//         res.status(503).json({ message: 'Network error. Try again' });
//     }
// };