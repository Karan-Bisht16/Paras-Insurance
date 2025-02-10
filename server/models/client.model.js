import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
const saltRounds = 10;

const interactionSchema = new mongoose.Schema({
    type: {
        type: String,
    },
    description: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
});
const notesSchema = new mongoose.Schema({
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

const clientSchema = new mongoose.Schema({
    userType: {
        type: String,
        enum: ['Lead', 'Client', 'Employee'],
        default: 'Lead',
        required: true,
    },
    password: {
        type: String,
    },
    refreshToken: {
        type: String,
    },
    deleted: {
        isDeleted: {
            type: Boolean,
            default: false,
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
        }
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
        avatar: {
            type: String,
            default: ''
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
    KYC: {
        type: Boolean,
        default: false,
    },
    employmentDetails: {
        companyName: {
            type: String,
            default: '',
        },
        designation: {
            type: String,
            default: '',
        },
        annualIncome: {
            type: String,
            default: '',
        }
    },
    leadDetails: {
        source: {
            type: String,
        },
        interestLevel: {
            type: String,
        },
        leadStage: {
            type: String,
        },
        assignedTo: {
            type: String,
        },
        priority: {
            type: String,
        },
        notes: {
            type: mongoose.Schema.Types.Array,
            default: [],
        }
    },
    interactionHistory: {
        type: [interactionSchema],
        default: [],
    },
    notes: {
        type: [notesSchema],
        default: [],
    }
}, { timestamps: true });

clientSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.interactionHistory.push({
            type: 'Account Creation',
            description: 'Account created.',
        });
    }

    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, saltRounds);
    }

    next();
});

clientSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

clientSchema.methods.addInteraction = async function (type, description) {
    this.interactionHistory.push({
        type,
        description,
    });
    await this.save();
};

clientSchema.methods.generateAccessToken = async function () {
    return await jwt.sign(
        { _id: this._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
}

clientSchema.methods.generateRefreshToken = async function () {
    return await jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
}

const Client = mongoose.model('Client', clientSchema);
export default Client;