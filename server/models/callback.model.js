import mongoose from 'mongoose';

const callbackSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    requestCallback: {
        type: Boolean,
        default: true,
    },
    message: {
        type: String,
        default: '',
    },
    source: {
        type: String,
        default: 'Website',
    }
}, { timestamps: true });

const Callback = mongoose.model('Callback', callbackSchema);
export default Callback;