import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'SuperAdmin'],
        default: 'Admin',
        required: true,
    },
    managerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        default: null,
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
        required: true,
    },
    statusChangedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
    },
    loginAccess: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;