import mongoose from 'mongoose';
// importing models
import Client from '../models/client.model.js';
import Policy from '../models/policy.model.js';
import Company from '../models/company.model.js';
import ClientPolicy from '../models/clientPolicy.model.js';
import Quotation from '../models/quotation.model.js';
import CombinedQuotation from '../models/combinedQuotation.model.js';

const addTransformedArrayTo2DArray = (existingArray, inputArray, label) => {
    let transformedArray = [];

    inputArray.forEach((row, index) => {
        if (index === 0) {
            transformedArray.push([label, ...row.slice(1)]);
        } else {
            transformedArray.push(['', ...row.slice(1)]);
        }
    });

    existingArray.push(...transformedArray);

    return existingArray;
}
// working LATER: validation for client and companyId
const createQuotation = async (req, res) => {
    try {
        const { formData } = req.body;
        const { clientPolicyId, clientId, companyId, quotationData } = formData;

        await Quotation.create({
            clientPolicyId: new mongoose.Types.ObjectId(clientPolicyId),
            clientId: new mongoose.Types.ObjectId(clientId),
            companyId: new mongoose.Types.ObjectId(companyId),
            quotationData: quotationData
        });

        const company = await Company.findById(new mongoose.Types.ObjectId(companyId));
        const existingQuotation = await CombinedQuotation.findOne({
            clientPolicyId: new mongoose.Types.ObjectId(clientPolicyId),
            clientId: new mongoose.Types.ObjectId(clientId)
        });

        let updatedQuotation = [];
        if (existingQuotation.quotationData.length === 0) {
            updatedQuotation = addTransformedArrayTo2DArray([[]], quotationData, company.companyName);
        } else {
            updatedQuotation = addTransformedArrayTo2DArray(existingQuotation.quotationData, quotationData, company.companyName);
        }

        const combinedQuotation = await CombinedQuotation.findOneAndUpdate(
            { clientPolicyId: new mongoose.Types.ObjectId(clientPolicyId), clientId: new mongoose.Types.ObjectId(clientId) },
            {
                $set: { quotationData: updatedQuotation },
                $inc: { countRecievedQuotations: 1 }
            },
            { new: true }
        );

        console.log(combinedQuotation);
        const { countRecievedQuotations, countTotalEmails } = combinedQuotation;
        if (countTotalEmails === countRecievedQuotations) {

            const clientPolicy = await ClientPolicy.findByIdAndUpdate(new mongoose.Types.ObjectId(clientPolicyId), {
                $set: { quotation: combinedQuotation._id }
            }, { new: true });

            combinedQuotation.status = 'SentAutomatically';
            await combinedQuotation.save();

            const policy = await Policy.findById(clientPolicy.policyId);
            await Client.findByIdAndUpdate(
                clientId,
                {
                    $push: {
                        interactionHistory: {
                            type: 'Quotation Recieved',
                            description: `Excel with quotation for ${policy.policyName} (${policy.policyType}) recieved.`
                        }
                    }
                }
            );
        }

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' })
    }
};

export {
    createQuotation,
}