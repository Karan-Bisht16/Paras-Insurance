import fs from 'fs';
import path from "path";
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from "uuid";
// importing models
import Employee from '../models/employee.model.js';

const cookiesOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
};

const condenseClientInfo = async (client) => {
    const employee = await Employee.findOne({ clientId: client._id });
    const clientSessionObj = {
        _id: client._id,
        firstName: client.personalDetails.firstName,
        lastName: client.personalDetails.lastName,
        email: client.personalDetails.contact.email,
        phone: client.personalDetails.contact.phone,
        avatar: client.personalDetails.avatar,
        role: employee ? (employee.loginAccess ? employee.role : 'AdminAsClient') : 'Client',
        loginAccess: employee ? employee.loginAccess : true,
    };
    if (employee) {
        return { ...clientSessionObj, employeeId: employee._id };
    } else {
        return clientSessionObj;
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

const generateAccessAndRefreshTokens = async (client) => {
    try {
        const accessToken = await client.generateAccessToken();
        const refreshToken = await client.generateRefreshToken();

        client.refreshToken = refreshToken;
        await client.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error(error);
        return null;
    }
}

const getExtension = (file) => {
    let ext = path.extname(file.originalname);
    if (ext === "") {
        ext = file.mimetype.replace("/", ".");
    }
    return ext;
}

const copyFileToSamePath = (oldPath, label) => {
    const directory = path.dirname(oldPath);
    const originalExtension = path.extname(oldPath);

    const newFileName = `${label}-${uuidv4()}${originalExtension}`;
    const newPath = path.join(directory, newFileName);

    fs.copyFile(oldPath, newPath, (error) => {
        if (error) {
            console.error('Error copying the file:', error);
        }
    });
    return newFileName;
}

const normalizePhoneNumber = (phoneNumber) => {
    if (phoneNumber.startsWith('91') && phoneNumber.length > 10) {
        return phoneNumber.slice(-10);
    }
    return phoneNumber;
}

export {
    cookiesOptions,
    condenseClientInfo,
    transporter,
    generateAccessAndRefreshTokens,
    getExtension,
    copyFileToSamePath,
    normalizePhoneNumber,
}