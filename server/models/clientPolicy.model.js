import mongoose from 'mongoose';
// importing models
import Client from './client.model.js';
import Policy from './policy.model.js';

const clientPolicySchema = new mongoose.Schema({
    policyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Policy',
        required: true,
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    stage: {
        type: String,
        enum: ['Interested', 'Assigned'],
        default: 'Interested',
        required: true,
    },
    expiryDate: {
        type: String,
    },
    assignedBy: {
        type: String,
    },
    policyCertificateURL: {
        type: String,
        default: '',
    },
    quotation: {
        type: mongoose.Schema.Types.Mixed,
    }
}, { timestamps: true });

clientPolicySchema.post('save', async function (document, next) {
    try {
        const policy = await Policy.findById(document.policyId);
        await Client.findByIdAndUpdate(document.clientId, {
            $push: {
                interactionHistory: {
                    type: 'Interested in Policy',
                    description: `Client is interested in ${policy.policyName} policy.`,
                },
            },
        });
    } catch (error) {
        console.error('Error updating client interaction history:', error);
    }

    next();
});

const ClientPolicy = mongoose.model('ClientPolicy', clientPolicySchema);
export default ClientPolicy;