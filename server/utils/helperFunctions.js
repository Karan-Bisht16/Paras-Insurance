import nodemailer from 'nodemailer';
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
        console.log(error);
        return null;
    }
}

export {
    cookiesOptions,
    condenseClientInfo,
    transporter,
    generateAccessAndRefreshTokens,
}