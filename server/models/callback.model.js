import mongoose from 'mongoose';

const callbackSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    phone: {
        type: String,
    },
    message: {
        type: String,
    }
}, { timestamps: true });

const Callback = mongoose.model('Callback', callbackSchema);
export default Callback;