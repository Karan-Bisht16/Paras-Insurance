import mongoose from 'mongoose';
// importing models
import Client from './client.model.js';

const generalInsuranceSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    policyType: {
        type: String,
    },
    personalDetails: {
        firstName: {
            type: String,
            default: '',
            required: true,
        },
        lastName: {
            type: String,
            default: '',
        },
        dob: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other', ''],
            default: '',
        },
        contact: {
            email: {
                type: String,
                default: null,
            },
            phone: {
                type: String,
                default: null,
            }
        },
        address: {
            street: {
                type: String,
                default: '',
            },
            city: {
                type: String,
                default: '',
            },
            state: {
                type: String,
                default: '',
            },
            pincode: {
                type: String,
                default: '',
            },
            country: {
                type: String,
                default: '',
            }
        },
        nominee: {
            name: {
                type: String,
                default: '',
            },
            dob: {
                type: String,
                default: '',
            },
            relationship: {
                type: String,
                default: '',
            },
            phone: {
                type: String,
                default: '',
            }
        }
    },
    financialDetails: {
        panCardNo: {
            type: String,
            default: '',
        },
        panCardURL: {
            type: String,
            default: '',
        },
        aadhaarNo: {
            type: String,
            default: '',
        },
        aadhaarURL: {
            type: String,
            default: '',
        },
        accountDetails: {
            accountNo: {
                type: String,
                default: '',
            },
            ifscCode: {
                type: String,
                default: '',
            },
            bankName: {
                type: String,
                default: '',
            },
            cancelledChequeURL: {
                type: String,
                default: '',
            }
        }
    },
    stage: {
        type: String,
        enum: ['Interested', 'Assigned'],
        default: 'Interested',
        required: true,
    },
    assignedBy: {
        type: String,
    },
    generalInsuranceNo: {
        type: String,
        default: ''
    },
    generalInsuranceDocumentURL: {
        type: String,
        default: '',
    }
}, { timestamps: true });

const GeneralInsurance = mongoose.model('GeneralInsurance', generalInsuranceSchema);
export default GeneralInsurance;