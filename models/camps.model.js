const mongoose = require('mongoose');
const schema = mongoose.Schema;
const userSchema = require('./common/model.user');

const itemSchema = new schema(
    {
        numberOfConsolidatedReportGenerated: {
            type: Number,
            default: 0
        },
        createdBy: userSchema.user,
        updatedBy: userSchema.user,
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        villagePinCode: {
            type: String,
            required: true,
        },
        villageName: {
            type: String,
            required: true,
        },
        stateName: {
            type: String,
        },
        externalCampId: {
            type: String,
        },
        programId: {
            type: schema.Types.ObjectId,
            ref: 'program_mgmt',
        },
        campDescription: {
            type: String,
        },
        dicUsers: [String],
        deoUsers: [String],
        driverUsers: [String],
        driverReportFormId: {
            type: schema.Types.ObjectId,
            ref: 'formsAndAssessments',
        },
        dicReportFormId: {
            type: schema.Types.ObjectId,
            ref: 'formsAndAssessments',
        },
        deoReportFormId: {
            type: schema.Types.ObjectId,
            ref: 'formsAndAssessments',
        },
        forms: [
            {
                value: {
                    type: String,
                    ref: 'formsAndAssessments',
                },
                label: {
                    type: String,
                },
                patientConsumable: [
                    {
                        itemName: {
                            type: String,
                        },
                        itemId: {
                            type: schema.Types.ObjectId,
                            ref: 'item',
                        },
                        code: {
                            type: String,
                        },
                        quantity: {
                            type: Number,
                        },
                        batchNumber: {
                            type: String,
                        },
                    },
                ],
                userAccess: [
                    {
                        value: {
                            type: schema.Types.ObjectId,
                            ref: 'user',
                        },
                        label: {
                            type: String,
                        },
                    },
                ],
            },
        ],
        disabled: {
            type: Boolean,
            default: false,
        },
        subCenter: {
            type: String,
        },
        estimatedNumberOfScreenings: {
            type: Number,
        },
        campStartDate: {
            type: Date,
        },
        campEndDate: {
            type: Date,
        },
        screeningStartDate: {
            type: Date,
        },
        screeningStartTime: {
            type: String,
        },
        screeningEndDate: {
            type: Date,
        },
        phc: {
            type: String,
        },
        talukaName: {
            type: String,
        },
        labourInspectorName: {
            type: String,
        },
        unionName: {
            type: String,
        },
        unionLeaderName: {
            type: String,
        },
        latitude: {
            type: String,
        },
        longitude: {
            type: String,
        },
        visibility: [
            {
                type: String,
            },
        ],
        assigningAuthority: {
            type: schema.Types.ObjectId,
            ref: 'site',
        },
        partnerOrganization: {
            type: schema.Types.ObjectId,
            ref: 'partner_organization',
        },
        extraDetails: {
            labParameters: {
                type: schema.Types.Mixed,
            },
            labItem: {
                type: schema.Types.ObjectId,
                ref: 'item',
            },
            matchingDetail: {
                type: schema.Types.Mixed,
            },
            isAdvanceFormSelection: {
                type: Boolean,
            },
        },
        siteConsumable: [
            {
                itemName: {
                    type: String,
                },
                itemId: {
                    type: schema.Types.ObjectId,
                    ref: 'item',
                },
                code: {
                    type: String,
                },
                quantity: {
                    type: Number,
                },
                batchNumber: {
                    type: String,
                },
            },
        ],
        assets: [
            {
                itemName: {
                    type: String,
                },
                itemId: {
                    type: schema.Types.ObjectId,
                    ref: 'item',
                },
                code: {
                    type: String,
                },
                quantity: {
                    type: Number,
                },
                batchNumber: {
                    type: String,
                },
            },
        ],
        assigningAuthority: {
            type: schema.Types.ObjectId,
            ref: 'site',
        },
        store: {
            type: schema.Types.ObjectId,
            ref: 'store',
            required: false,
        },
        numberScreeningsDone: {
            type: Number,
            default: 0,
        },
        reportUrl: {
            type: String
        }
    },
    { timestamps: true },
);

module.exports = mongoose.model('camps', itemSchema);
