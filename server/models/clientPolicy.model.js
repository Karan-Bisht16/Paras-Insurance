import mongoose from 'mongoose';

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
    policyNo: {
        type: String,
        default: ''
    },
    policyDocumentURL: {
        type: String,
        default: '',
    },
    quotation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CombinedQuotation',
    },
    origin: {
        type: String,
        enum: ['AssignedBySystem', 'UploadedByUser'],
        default: 'AssignedBySystem'
    },
    associatedPoCs: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    }
}, { timestamps: true });

const ClientPolicy = mongoose.model('ClientPolicy', clientPolicySchema);
export default ClientPolicy;