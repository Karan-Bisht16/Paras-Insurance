import { ObjectId } from 'mongodb';
// importing models
import Policy from '../models/policy.model.js';

// working - POSTMAN only
const createPolicy = async (req, res) => {
    try {
        const newPolicy = await Policy.create(req.body);
        res.status(200).json(newPolicy);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
}
// working
const fetchAllPolicies = async (req, res) => {
    try {
        // const policies = await Policy.find({}, { form: 0, dataFormat: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        const policies = await Policy.find(
            { _id: { $ne: new ObjectId('6777932ef2013d3cfcc27347') } },
            { form: 0, dataFormat: 0, createdAt: 0, updatedAt: 0, __v: 0 }
        );
        res.status(200).json(policies);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
}
// working
const fetchAllPolicyFields = async (req, res) => {
    try {
        const { policyId } = req.query;
        const policy = await Policy.findById(policyId);
        res.status(200).json(policy);
    } catch (error) {
        console.error(error);
        res.status(503).json({ message: 'Network error. Try again' });
    }
}
// working
const fetchEveryPolicyId = async (req, res) => {
    const everyPolicyId = await Policy.find(
        { _id: { $ne: new ObjectId('6777932ef2013d3cfcc27347') } },
        { _id: 1, policyName: 1 }
    );
    // const everyPolicyId = await Policy.find({}, { _id: 1, policyName: 1 });
    res.status(200).json(everyPolicyId);
}

export {
    createPolicy,
    fetchAllPolicies,
    fetchAllPolicyFields,
    fetchEveryPolicyId,
};