import Policy from '../models/policy.model.js';

const createPolicy = async (req, res) => {
    try {
        const newPolicy = await Policy.create(req.body);
        res.status(200).json(newPolicy);
    } catch (error) {
        console.log(error);
        res.status(503).json({ message: 'Network error. Try agin' });
    }
}

const fetchAllPolicies = async (req, res) => {
    try {

        const policies = await Policy.find({}, { form: 0, dataFormat: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        res.status(200).json(policies);
    } catch (error) {
        console.log(error);
        res.status(503).json({ message: 'Network error. Try agin' });
    }
}

const fetchAllPolicyFields = async (req, res) => {
    try {
        const { policyId } = req.query;
        const policy = await Policy.findById(policyId);
        res.status(200).json(policy);

    } catch (error) {
        console.log(error);
        res.status(503).json({ message: 'Network error. Try agin' });
    }
}

export {
    createPolicy,
    fetchAllPolicies,
    fetchAllPolicyFields,
};