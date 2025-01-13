import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
    heading: {
        type: String,
    },
    fields: {
        type: mongoose.Schema.Types.Array,
        default: [],
    }
});

const formSchema = new mongoose.Schema({
    sections: {
        type: [sectionSchema],
        default: [],
    },
    submitButtonLabel: {
        type: String,
    }
});

const policySchema = new mongoose.Schema({
    policyName: {
        type: String,
        required: true,
    },
    policyType: {
        type: String,
        enum: ['Life', 'Health', 'Home', 'Travel', 'Vehicle', 'General'],
        default: 'Life',
        required: true,
    },
    policyDescription: {
        type: String,
        required: true,
    },
    policyIcon: {
        type: String,
        required: true,
    },
    form: {
        type: formSchema,
        required: true,
    }
}, { timestamps: true });

const Policy = mongoose.model('Policy', policySchema);
export default Policy;