import mongoose from 'mongoose';
// importing models
import Client from './client.model.js';

const sipSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
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
    sipNo: {
        type: String,
        default: ''
    },
    sipDocumentURL: {
        type: String,
        default: '',
    }
}, { timestamps: true });

sipSchema.post('save', async function (document, next) {
    try {
        await Client.findByIdAndUpdate(document.clientId, {
            $push: {
                interactionHistory: {
                    type: 'SIP Requested',
                    description: 'A request to start a new SIP has been submitted.',
                },
            },
        });
    } catch (error) {
        console.error('Error updating client interaction history:', error);
    }

    next();
});

const SIP = mongoose.model('SIP', sipSchema);
export default SIP;