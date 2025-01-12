import mongoose from 'mongoose';

const combinedQuotationSchema = new mongoose.Schema({
    clientPolicyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientPolicy',
        required: true,
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    policyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Policy',
        required: true,
    },
    quotationData: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'UploadedByAdmin', 'SentByAdmin', 'SentAutomatically'],
        default: 'Pending',
        required: true,
    },
    countTotalEmails: {
        type: Number,
        required: true,
    },
    countRecievedQuotations: {
        type: Number,
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
    }
}, { timestamps: true });

const CombinedQuotation = mongoose.model('CombinedQuotation', combinedQuotationSchema);
export default CombinedQuotation;