import fs from 'fs';
import ejs from 'ejs';
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
    const emailTemplate = fs.readFileSync(`<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="telephone=no" name="format-detection">
    <title>New email template 2025-01-04</title><!--[if (mso 16)]>
    <style type="text/css">
    a {text-decoration: none;}
    </style>
    <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<noscript>
         <xml>
           <o:OfficeDocumentSettings>
           <o:AllowPNG></o:AllowPNG>
           <o:PixelsPerInch>96</o:PixelsPerInch>
           </o:OfficeDocumentSettings>
         </xml>
      </noscript>
<![endif]--><!--[if !mso]><!-- -->
    <link href="https://fonts.googleapis.com/css2?family=Marcellus&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Work+Sans&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,400i,700,700i">
    <!--<![endif]--><!--[if mso]><xml>
    <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
      <w:DontUseAdvancedTypographyReadingMail/>
    </w:WordDocument>
    </xml><![endif]-->
    <style type="text/css">
        .rollover:hover .rollover-first {
            max-height: 0px !important;
            display: none !important;
        }

        .rollover:hover .rollover-second {
            max-height: none !important;
            display: block !important;
        }

        .rollover span {
            font-size: 0px;
        }

        u+.body img~div div {
            display: none;
        }

        #outlook a {
            padding: 0;
        }

        span.MsoHyperlink,
        span.MsoHyperlinkFollowed {
            color: inherit;
            mso-style-priority: 99;
        }

        a.es-button {
            mso-style-priority: 100 !important;
            text-decoration: none !important;
        }

        a[x-apple-data-detectors],
        #MessageViewBody a {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        .es-desk-hidden {
            display: none;
            float: left;
            overflow: hidden;
            width: 0;
            max-height: 0;
            line-height: 0;
            mso-hide: all;
        }

        @media only screen and (max-width:600px) {
            .es-m-p20r {
                padding-right: 20px !important
            }

            .es-m-p20l {
                padding-left: 20px !important
            }

            .es-m-p0r {
                padding-right: 0px !important
            }

            .es-m-p20b {
                padding-bottom: 20px !important
            }

            .es-p-default {}

            *[class="gmail-fix"] {
                display: none !important
            }

            p,
            a {
                line-height: 150% !important
            }

            h1,
            h1 a {
                line-height: 120% !important
            }

            h2,
            h2 a {
                line-height: 120% !important
            }

            h3,
            h3 a {
                line-height: 120% !important
            }

            h4,
            h4 a {
                line-height: 120% !important
            }

            h5,
            h5 a {
                line-height: 120% !important
            }

            h6,
            h6 a {
                line-height: 120% !important
            }

            .es-header-body p {}

            .es-content-body p {}

            .es-footer-body p {}

            .es-infoblock p {}

            h1 {
                font-size: 30px !important;
                text-align: left
            }

            h2 {
                font-size: 24px !important;
                text-align: left
            }

            h3 {
                font-size: 20px !important;
                text-align: left
            }

            h4 {
                font-size: 24px !important;
                text-align: left
            }

            h5 {
                font-size: 20px !important;
                text-align: left
            }

            h6 {
                font-size: 16px !important;
                text-align: left
            }

            .es-header-body h1 a,
            .es-content-body h1 a,
            .es-footer-body h1 a {
                font-size: 30px !important
            }

            .es-header-body h2 a,
            .es-content-body h2 a,
            .es-footer-body h2 a {
                font-size: 24px !important
            }

            .es-header-body h3 a,
            .es-content-body h3 a,
            .es-footer-body h3 a {
                font-size: 20px !important
            }

            .es-header-body h4 a,
            .es-content-body h4 a,
            .es-footer-body h4 a {
                font-size: 24px !important
            }

            .es-header-body h5 a,
            .es-content-body h5 a,
            .es-footer-body h5 a {
                font-size: 20px !important
            }

            .es-header-body h6 a,
            .es-content-body h6 a,
            .es-footer-body h6 a {
                font-size: 16px !important
            }

            .es-menu td a {
                font-size: 12px !important
            }

            .es-header-body p,
            .es-header-body a {
                font-size: 12px !important
            }

            .es-content-body p,
            .es-content-body a {
                font-size: 16px !important
            }

            .es-footer-body p,
            .es-footer-body a {
                font-size: 12px !important
            }

            .es-infoblock p,
            .es-infoblock a {
                font-size: 12px !important
            }

            .es-m-txt-c,
            .es-m-txt-c h1,
            .es-m-txt-c h2,
            .es-m-txt-c h3,
            .es-m-txt-c h4,
            .es-m-txt-c h5,
            .es-m-txt-c h6 {
                text-align: center !important
            }

            .es-m-txt-r,
            .es-m-txt-r h1,
            .es-m-txt-r h2,
            .es-m-txt-r h3,
            .es-m-txt-r h4,
            .es-m-txt-r h5,
            .es-m-txt-r h6 {
                text-align: right !important
            }

            .es-m-txt-j,
            .es-m-txt-j h1,
            .es-m-txt-j h2,
            .es-m-txt-j h3,
            .es-m-txt-j h4,
            .es-m-txt-j h5,
            .es-m-txt-j h6 {
                text-align: justify !important
            }

            .es-m-txt-l,
            .es-m-txt-l h1,
            .es-m-txt-l h2,
            .es-m-txt-l h3,
            .es-m-txt-l h4,
            .es-m-txt-l h5,
            .es-m-txt-l h6 {
                text-align: left !important
            }

            .es-m-txt-r img,
            .es-m-txt-c img,
            .es-m-txt-l img {
                display: inline !important
            }

            .es-m-txt-r .rollover:hover .rollover-second,
            .es-m-txt-c .rollover:hover .rollover-second,
            .es-m-txt-l .rollover:hover .rollover-second {
                display: inline !important
            }

            .es-m-txt-r .rollover span,
            .es-m-txt-c .rollover span,
            .es-m-txt-l .rollover span {
                line-height: 0 !important;
                font-size: 0 !important;
                display: block
            }

            .es-spacer {
                display: inline-table
            }

            a.es-button,
            button.es-button {
                font-size: 18px !important;
                padding: 10px 20px 10px 20px !important;
                line-height: 120% !important
            }

            a.es-button,
            button.es-button,
            .es-button-border {
                display: inline-block !important
            }

            .es-m-fw,
            .es-m-fw.es-fw,
            .es-m-fw .es-button {
                display: block !important
            }

            .es-m-il,
            .es-m-il .es-button,
            .es-social,
            .es-social td,
            .es-menu {
                display: inline-block !important
            }

            .es-adaptive table,
            .es-left,
            .es-right {
                width: 100% !important
            }

            .es-content table,
            .es-header table,
            .es-footer table,
            .es-content,
            .es-footer,
            .es-header {
                width: 100% !important;
                max-width: 600px !important
            }

            .adapt-img {
                width: 100% !important;
                height: auto !important
            }

            .es-mobile-hidden,
            .es-hidden {
                display: none !important
            }

            .es-desk-hidden {
                width: auto !important;
                overflow: visible !important;
                float: none !important;
                max-height: inherit !important;
                line-height: inherit !important
            }

            tr.es-desk-hidden {
                display: table-row !important
            }

            table.es-desk-hidden {
                display: table !important
            }

            td.es-desk-menu-hidden {
                display: table-cell !important
            }

            .es-menu td {
                width: 1% !important
            }

            table.es-table-not-adapt,
            .esd-block-html table {
                width: auto !important
            }

            .h-auto {
                height: auto !important
            }

            .es-text-8248 .es-text-mobile-size-24,
            .es-text-8248 .es-text-mobile-size-24 * {
                font-size: 24px !important;
                line-height: 150% !important
            }
        }

        @media screen and (max-width:384px) {
            .mail-message-content {
                width: 414px !important
            }
        }
    </style>
</head>

<body class="body"
    style="width:100%;height:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
    <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#DCE8F3"><!--[if gte mso 9]>
			<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
				<v:fill type="tile" color="#DCE8F3"></v:fill>
			</v:background>
		<![endif]-->
        <table width="100%" cellspacing="0" cellpadding="0" class="es-wrapper" role="none"
            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#DCE8F3">
            <tr>
                <td valign="top" style="padding:0;Margin:0">
                    <table cellpadding="0" cellspacing="0" align="center" class="es-header" role="none"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
                        <tr>
                            <td align="center" style="padding:0;Margin:0">
                                <table align="center" cellpadding="0" cellspacing="0" bgcolor="#00000000"
                                    class="es-header-body"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px"
                                    role="none">
                                    <tr>
                                        <td align="left"
                                            style="Margin:0;padding-top:20px;padding-right:40px;padding-bottom:20px;padding-left:40px">
                                            <table cellpadding="0" cellspacing="0" width="100%" role="none"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td align="center" valign="top"
                                                        style="padding:0;Margin:0;width:520px">
                                                        <table cellpadding="0" cellspacing="0" width="100%"
                                                            role="presentation"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table cellspacing="0" cellpadding="0" align="center" class="es-content" role="none"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
                        <tr>
                            <td align="center" style="padding:0;Margin:0">
                                <table cellspacing="0" cellpadding="0" bgcolor="#FFFFFF" align="center"
                                    background="https://epqlvtw.stripocdn.email/content/guids/CABINET_09e9fe3469e9e38cee45638bc890f8fb7fa30bea0ae9e8d1c37288fc5f1f0d62/images/frame_3.png"
                                    class="es-content-body"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;background-repeat:no-repeat;width:600px;background-image:url(https://epqlvtw.stripocdn.email/content/guids/CABINET_09e9fe3469e9e38cee45638bc890f8fb7fa30bea0ae9e8d1c37288fc5f1f0d62/images/frame_3.png);background-position:center top"
                                    role="none">
                                    <tr>
                                        <td align="left" class="es-m-p20r es-m-p20l" style="padding:40px;Margin:0">
                                            <table cellspacing="0" cellpadding="0" width="100%" role="none"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td valign="top" align="center" class="es-m-p0r"
                                                        style="padding:0;Margin:0;width:520px">
                                                        <table width="100%" cellspacing="0" cellpadding="0"
                                                            role="presentation"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="left" style="padding:0;Margin:0">
                                                                    <h3
                                                                        style="Margin:0;font-family:'source sans pro', 'helvetica neue', helvetica, arial, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:20px;font-style:normal;font-weight:normal;line-height:24px;color:#111827">
                                                                        Paaras Financials</h3>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="left" class="es-m-p20r es-m-p20l"
                                            style="padding:0;Margin:0;padding-right:40px;padding-left:40px;padding-top:30px">
                                            <!--[if mso]><table style="width:520px" cellpadding="0" cellspacing="0"><tr><td style="width:300px" valign="top"><![endif]-->
                                            <table cellspacing="0" cellpadding="0" align="left" class="es-left"
                                                role="none"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                                <tr>
                                                    <td valign="top" align="center" class="es-m-p0r es-m-p20b"
                                                        style="padding:0;Margin:0;width:300px">
                                                        <table width="100%" cellspacing="0" cellpadding="0"
                                                            role="presentation"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="left" class="es-text-8248"
                                                                    style="padding:0;Margin:0">
                                                                    <h1 class="es-text-mobile-size-24"
                                                                        style="Margin:0;font-family:Marcellus, Arial, serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:24px;font-style:normal;font-weight:normal;line-height:28.8px;color:#111827">
                                                                        A Client Needs Assistance — Submit a Quotation
                                                                    </h1>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            <!--[if mso]></td><td style="width:20px"></td><td style="width:200px" valign="top"><![endif]-->
                                            <table cellpadding="0" cellspacing="0" align="right" class="es-right"
                                                role="none"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                                                <tr class="es-mobile-hidden">
                                                    <td align="left" style="padding:0;Margin:0;width:200px">
                                                        <table cellpadding="0" cellspacing="0" width="100%" role="none"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="center"
                                                                    style="padding:0;Margin:0;display:none"></td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table><!--[if mso]></td></tr></table><![endif]-->
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="left"
                                            style="padding:0;Margin:0;padding-top:20px;padding-right:40px;padding-left:40px">
                                            <table cellpadding="0" cellspacing="0" width="100%" role="none"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td align="center" valign="top"
                                                        style="padding:0;Margin:0;width:520px">
                                                        <table cellpadding="0" cellspacing="0" width="100%"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;border-left:2px solid #111827"
                                                            role="presentation">
                                                            <tr>
                                                                <td align="center" height="50"
                                                                    style="padding:0;Margin:0"></td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="left" class="es-m-p20r es-m-p20l"
                                            style="Margin:0;padding-right:40px;padding-left:40px;padding-top:30px;padding-bottom:30px">
                                            <table width="100%" cellspacing="0" cellpadding="0" role="none"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td valign="top" align="center" class="es-m-p0r es-m-p20b"
                                                        style="padding:0;Margin:0;width:520px">
                                                        <table width="100%" cellspacing="0" cellpadding="0"
                                                            role="presentation"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="left" style="padding:0;Margin:0">
                                                                    <p
                                                                        style="Margin:0;mso-line-height-rule:exactly;font-family:'Work Sans', Arial, sans-serif;line-height:21px;letter-spacing:0;color:#111827;font-size:14px">
                                                                        <strong>Hey,</strong>
                                                                    </p>
                                                                    <p
                                                                        style="Margin:0;mso-line-height-rule:exactly;font-family:'Work Sans', Arial, sans-serif;line-height:21px;letter-spacing:0;color:#111827;font-size:14px">
                                                                        <br>
                                                                    </p>
                                                                    <p
                                                                        style="Margin:0;mso-line-height-rule:exactly;font-family:'Work Sans', Arial, sans-serif;line-height:21px;letter-spacing:0;color:#111827;font-size:14px">
                                                                        We hope this email finds you well.</p>
                                                                    <p
                                                                        style="Margin:0;mso-line-height-rule:exactly;font-family:'Work Sans', Arial, sans-serif;line-height:21px;letter-spacing:0;color:#111827;font-size:14px">
                                                                        We have received a request for a
                                                                        <%= policyType %>
                                                                            policy from a potential client
                                                                            seeking the best investment options. As a
                                                                            verified and trusted financial services
                                                                            provider, we invite you to submit a tailored
                                                                            quotation based on the client's
                                                                            requirements.
                                                                    </p>
                                                                    <p
                                                                        style="Margin:0;mso-line-height-rule:exactly;font-family:'Work Sans', Arial, sans-serif;line-height:21px;letter-spacing:0;color:#111827;font-size:14px">
                                                                        <br>
                                                                    </p>
                                                                    <p
                                                                        style="Margin:0;mso-line-height-rule:exactly;font-family:'Work Sans', Arial, sans-serif;line-height:21px;letter-spacing:0;color:#111827;font-size:14px">
                                                                        Follow the link below to access the client
                                                                        details and complete the quotation form:<br>👉
                                                                        <strong><a href="<%= formLink %>"
                                                                                style="mso-line-height-rule:exactly;text-decoration:underline;color:#00356C;font-size:14px">Submit
                                                                                Your Quotation</a></strong> <br><br>
                                                                    </p>
                                                                    <p
                                                                        style="Margin:0;mso-line-height-rule:exactly;font-family:'Work Sans', Arial, sans-serif;line-height:21px;letter-spacing:0;color:#111827;font-size:14px">
                                                                        This is an excellent opportunity to connect with
                                                                        an interested client and grow your client
                                                                        base.</p>
                                                                    <p
                                                                        style="Margin:0;mso-line-height-rule:exactly;font-family:'Work Sans', Arial, sans-serif;line-height:21px;letter-spacing:0;color:#111827;font-size:14px">
                                                                        If you have any questions or need additional
                                                                        information, feel free to reply to this
                                                                        email.<br><br></p>
                                                                    <p
                                                                        style="Margin:0;mso-line-height-rule:exactly;font-family:'Work Sans', Arial, sans-serif;line-height:21px;letter-spacing:0;color:#111827;font-size:14px">
                                                                        Best regards,<br><br><strong>
                                                                                    Paaras Financials Team
                                                                        </strong></p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-4"
                        role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                        <tbody>
                            <tr>
                                <td>
                                    <table align="center" border="0" cellpadding="0" cellspacing="0"
                                        class="row-content stack" role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #DCE8F3; color: #000000; width: 600px; margin: 0 auto;"
                                        width="600">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1"
                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; padding-left: 10px; padding-right: 10px; padding-top: 10px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;"
                                                    width="100%">
                                                    <table border="0" cellpadding="10" cellspacing="0"
                                                        class="paragraph_block block-2" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
                                                        width="100%">
                                                        <tr>
                                                            <td class="pad">
                                                                <div
                                                                    style="color:#97a2da;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:20px;line-height:120%;text-align:center;mso-line-height-alt:24px;">
                                                                    <p style="margin: 0; word-break: break-word;">
                                                                        <strong><span
                                                                                style="word-break: break-word; color: #111827;">Paaras
                                                                                Financials</span></strong>
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table border="0" cellpadding="10" cellspacing="0"
                                                        class="paragraph_block block-3" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
                                                        width="100%">
                                                        <tr>
                                                            <td class="pad">
                                                                <div
                                                                    style="color:#97a2da;font-family:Helvetica Neue, Helvetica, Arial, sans-serif;font-size:14px;line-height:120%;text-align:center;mso-line-height-alt:16.8px;">
                                                                    <p style="margin: 0; word-break: break-word;">+91
                                                                        9876543210</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table border="0" cellpadding="10" cellspacing="0"
                                                        class="paragraph_block block-4" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
                                                        width="100%">
                                                        <tr>
                                                            <td class="pad">
                                                                <div
                                                                    style="color:#97a2da;font-family:Helvetica Neue, Helvetica, Arial, sans-serif;font-size:14px;line-height:120%;text-align:center;mso-line-height-alt:16.8px;">
                                                                    <p style="margin: 0; word-break: break-word;">This
                                                                        link will expire in the next 10
                                                                        minutes.<br />Please feel free to contact us at
                                                                        support@paarasfinancials.com</p>
                                                                    <p style="margin: 0; word-break: break-word;">.</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table border="0" cellpadding="10" cellspacing="0"
                                                        class="paragraph_block block-5" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
                                                        width="100%">
                                                        <tr>
                                                            <td class="pad">
                                                                <div
                                                                    style="color:#97a2da;font-family:Helvetica Neue, Helvetica, Arial, sans-serif;font-size:12px;line-height:120%;text-align:center;mso-line-height-alt:14.399999999999999px;">
                                                                    <p style="margin: 0; word-break: break-word;"><span
                                                                            style="word-break: break-word;">Copyright©
                                                                            <%= year %> Paras Financials
                                                                        </span></p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>

</html>`, 'utf-8');
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