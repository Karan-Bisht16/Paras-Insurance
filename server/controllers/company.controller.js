import AssignedPolicy from "../models/assignedPolicy.model.js";
import Company from "../models/company.model.js";

const createCompany = async (req, res) => {
    try {
        const company = new Company(req.body);
        await company.save();
        res.status(201).json(company);
    } catch (error) {
        console.log(error);
        res.status(503).json({ message: 'Network error. Try agin' });
    }
}

const fetchAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).json(companies);
    } catch (error) {
        console.log(error);
        res.status(503).json({ message: 'Network error. Try agin' });
    }
}

const updateCompany = async (req, res) => {
    try {
        const updatedCompany = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCompany) return res.status(404).json({ message: 'Company not found' });
        res.status(200).json(updatedCompany);
    } catch (error) {
        console.log(error);
        res.status(503).json({ message: 'Network error. Try agin' });
    }
}

const deleteCompany = async (req, res) => {
    try {
        const { companyId } = req.query;
        const deletedCompany = await Company.findByIdAndDelete(companyId);

        if (!deletedCompany) return res.status(404).json({ message: 'Company not found' });

        res.status(200).json(deletedCompany);
    } catch (error) {
        console.log(error);
        res.status(503).json({ message: 'Network error. Try agin' });
    }
}

const addCompanyPolicy = async (req, res) => {
    try {
        const { companyId, policyData } = req.body;
        const company = await Company.findById(companyId);

        if (!company) return res.status(404).json({ message: 'Company not found' });

        company.policies.push(policyData);
        await company.save();
        res.status(201).json(company);
    } catch (error) {
        console.log(error);
        res.status(503).json({ message: 'Network error. Try agin' });
    }
}

const removeCompanyPolicy = async (req, res) => {
    try {
        const { companyId, policyId } = req.query;
        const company = await Company.findById(companyId);

        if (!company) return res.status(404).json({ message: 'Company not found' });

        const policyIndex = company.policies.findIndex(policy => policy._id.toString() === policyId);

        if (policyIndex === -1) {
            return res.status(404).json({ message: 'Policy not found' });
        }
        company.policies.splice(policyIndex, 1);

        await company.save();
        res.status(200).json(company);
    } catch (error) {
        console.log(error);
        res.status(503).json({ message: 'Network error. Try agin' });
    }
}

const fetchCompanyPoliciesByType = async (req, res) => {
    try {
        const { policyType } = req.query;

        if (!policyType) return res.status(400).json({ message: 'Please provide a policy type.' });

        const policies = await Company.aggregate([
            { $unwind: '$policies' },
            {
                $match: {
                    $expr: {
                        $eq: [
                            { $toLower: '$policies.policyType' },
                            { $toLower: policyType },
                        ],
                    },
                }
            },
            {
                $project: {
                    _id: 0,
                    companyName: 1,
                    policyName: '$policies.policyName',
                    policyType: '$policies.policyType',
                    policyDescription: '$policies.policyDescription',
                    policyFeatures: '$policies.policyFeatures',
                    coverageAmount: '$policies.coverageAmount',
                    coverageType: '$policies.coverageType',
                    premiumAmount: '$policies.premiumAmount',
                    premiumType: '$policies.premiumType',
                },
            },
        ]);

        res.status(200).json(policies);
    } catch (error) {
        console.log(error);
        res.status(503).json({ message: 'Network error. Try agin' });
    }
}

const sendCompanyPolicies = async (req, res) => {
    try {
        const { assignedPolicyId, companyPolicies } = req.body;
        const assignedPolicy = await AssignedPolicy.findByIdAndUpdate(assignedPolicyId, {
            $set: {
                availablePolicies: companyPolicies
            },
            new: true
        });
        console.log(assignedPolicy);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.status(503).json({ message: 'Network error. Try agin' });
    }
}

export {
    createCompany,
    fetchAllCompanies,
    updateCompany,
    deleteCompany,
    addCompanyPolicy,
    removeCompanyPolicy,
    fetchCompanyPoliciesByType,
    sendCompanyPolicies
}