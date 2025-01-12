// importing models
import Company from '../models/company.model.js';

// working LATER: add validation; check for client role (superadmin or admin)
const createCompany = async (req, res) => {
    try {
        const company = new Company(req.body);
        await company.save();
        res.status(201).json(company);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
}
// working
const fetchAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).json(companies);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
}
// working LATER: check for client role (superadmin or admin)
const editCompany = async (req, res) => {
    try {
        const { _id } = req.body;

        const updatedCompany = await Company.findByIdAndUpdate(_id, req.body, { new: true });
        if (!updatedCompany) return res.status(404).json({ message: 'Company not found' });

        res.status(200).json(updatedCompany);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
}
// working LATER: check for client role (superadmin or admin)
const deleteCompany = async (req, res) => {
    try {
        const { companyId } = req.query;
        const deletedCompany = await Company.findByIdAndDelete(companyId);

        if (!deletedCompany) return res.status(404).json({ message: 'Company not found' });

        res.status(200).json(deletedCompany);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
}
// working LATER: add validation
const addCompanyPolicy = async (req, res) => {
    try {
        const { companyId, policyData } = req.body;
        const company = await Company.findById(companyId);

        if (!company) return res.status(404).json({ message: 'Company not found' });

        company.companyPoliciesProvided.push(policyData);
        await company.save();
        res.status(201).json(company);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
}
// working
const removeCompanyPolicy = async (req, res) => {
    try {
        const { companyId, policyId } = req.query;
        const company = await Company.findById(companyId);

        if (!company) return res.status(404).json({ message: 'Company not found' });

        const policyIndex = company.companyPoliciesProvided.findIndex(policy => policy._id.toString() === policyId);

        if (policyIndex === -1) return res.status(404).json({ message: 'Policy not found' });

        company.companyPoliciesProvided.splice(policyIndex, 1);

        await company.save();
        res.status(200).json(company);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
}
// obsolete
// const fetchCompanyPoliciesByType = async (req, res) => {
//     try {
//         const { policyType } = req.query;
//         if (!policyType) return res.status(400).json({ message: 'Please provide a policy type.' });
//         const policies = await Company.aggregate([
//             { $unwind: '$policies' },
//             {
//                 $match: {
//                     $expr: {
//                         $eq: [
//                             { $toLower: '$policies.policyType' },
//                             { $toLower: policyType },
//                         ],
//                     },
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     companyName: 1,
//                     policyName: '$policies.policyName',
//                     policyType: '$policies.policyType',
//                     policyDescription: '$policies.policyDescription',
//                     policyFeatures: '$policies.policyFeatures',
//                     coverageAmount: '$policies.coverageAmount',
//                     coverageType: '$policies.coverageType',
//                     premiumAmount: '$policies.premiumAmount',
//                     premiumType: '$policies.premiumType',
//                 },
//             },
//         ]);
//         res.status(200).json(policies);
//     } catch (error) {
//         console.error(error);
//         res.status(503).json({ message: 'Network error. Try again' });
//     }
// }

export {
    createCompany,
    fetchAllCompanies,
    editCompany,
    deleteCompany,
    addCompanyPolicy,
    removeCompanyPolicy,
}