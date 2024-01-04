const _ = require("lodash");
const mongoose = require("mongoose");
const data = require("./uhids.json");
const Patients = require("../models/patientRecord");
const Lab = require("../models/labItem");
const Bills = require("../models/bill.model");
const ObjectId = require("mongoose").Types.ObjectId;

const NumberInt = (s)=>Number(s);
const ISODate = (s)=>Number(s);

const mock = {
    // "_id" : ObjectId("659665840da0c53c36685fc1"),
    "paid" : false,
    "throughDesk" : true,
    "type" : "LAB",
    "oldPatientId" : [
  
    ],
    "cleared" : false,
    "isUnbilled" : false,
    "isVerified" : false,
    "createdAt" : ISODate("2024-01-04T08:00:04.885+0000"),
    "createdBy" : {
        "name" : "k c chaluvaraju",
        "userType" : "Patient"
    },
    "patientId" : ObjectId("659665840da0c53c36685fb2"),
    "billId" : ObjectId("659665840da0c53c36685fbb"),
    "packages" : [
        {
            "cleared" : false,
            // "_id" : ObjectId("659665840da0c53c36685fc2"),
            "name" : "BLOOD GROUP AND Rh TYPE",
            "gst" : NumberInt(0),
            "unitPrice" : NumberInt(0),
            "discount" : NumberInt(0),
            "packageId" : ObjectId("6381a48583a9e84bd5ae58f4"),
            "activities" : [
                {
                    // "_id" : ObjectId("65966a9f7a0f2156f832576d"),
                    "type" : "APPROVED",
                    "at" : ISODate("2024-01-04T08:21:51.475+0000"),
                    "by" : {
                        "name" : "Dr.Govinda Raju",
                        "userId" : ObjectId("65549c046ee3724edc3ec91e"),
                        "userType" : "DOCTOR"
                    }
                }
            ],
            "reportData" : {
                "editorState" : "{\"blocks\":[{\"key\":\"ccnil\",\"text\":\"ABO & Rh blood groups are major grouping system. Besides these, all individuals carry antigens of other blood group system, as well. It is important to subject all patients samples to an antibody screen prior to blood transfusion to detect any unexpected antibodies. \",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"7rhdi\",\"text\":\"If blood grouping is done for new born babies/ cord blood, It is mandatory to repeat at one year of age since A, B & H antigens are not developed at birth.\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                "parameters" : [
                    {
                        "name" : "BLOOD GROUP AND Rh TYPE ",
                        "type" : "normal",
                        "machineCode" : "bldgrpandrhtype",
                        "fieldType" : "select",
                        "selectOptions" : "A+ve,A-ve,O+ve,O-ve,B+ve,B-ve,AB+ve,AB-ve,Insufficient sample ",
                        "value" : "Insufficient sample ",
                        "interpretation" : "",
                        "isAbnormal" : false
                    }
                ]
            },
            
            "signUrl" : "https://myteleopd.s3.ap-south-1.amazonaws.com/sign-1704356511241.png",
            "uploadedAt" : ISODate("2024-01-04T08:21:51.475+0000")
        },
        {
            "cleared" : false,
            // "_id" : ObjectId("659665840da0c53c36685fc3"),
            "name" : "RENAL PANEL RANDOM",
            "gst" : NumberInt(0),
            "unitPrice" : NumberInt(0),
            "discount" : NumberInt(0),
            "packageId" : ObjectId("6381a79b83a9e84bd5ae58f5"),
            "activities" : [
                {
                    // "_id" : ObjectId("65966a9f7a0f2156f832576f"),
                    "type" : "APPROVED",
                    "at" : ISODate("2024-01-04T08:21:51.475+0000"),
                    "by" : {
                        "name" : "Dr.Govinda Raju",
                        "userId" : ObjectId("65549c046ee3724edc3ec91e"),
                        "userType" : "DOCTOR"
                    }
                }
            ],
            "reportData" : {
                "editorState" : "{\"blocks\":[{\"key\":\"7bf53\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                "parameters" : [
                    {
                        "name" : "GLUCOSE RANDOM ",
                        "type" : "range",
                        "machineCode" : "glub-001-au480",
                        "fieldType" : "text",
                        "unit" : "mg/dl",
                        "ranges" : [
                            {
                                "minValue" : "70",
                                "maxValue" : "140",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "70",
                                "maxValue" : "140",
                                "gender" : "F"
                            }
                        ],
                        "value" : "109",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "CREATININE SERUM ",
                        "type" : "range",
                        "machineCode" : "crel-019-au480",
                        "fieldType" : "text",
                        "unit" : "mg/dl",
                        "ranges" : [
                            {
                                "minValue" : "0.6",
                                "maxValue" : "1.2"
                            }
                        ],
                        "value" : "0.9",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "UREA",
                        "type" : "range",
                        "machineCode" : "ureas-007-ureab-023-au4800",
                        "fieldType" : "text",
                        "unit" : "mg/dl",
                        "ranges" : [
                            {
                                "minValue" : "17.4",
                                "maxValue" : "55.8",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "17.4",
                                "maxValue" : "55.8",
                                "gender" : "F"
                            }
                        ],
                        "value" : "19.1",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "URIC ACID ",
                        "type" : "range",
                        "machineCode" : "uas-016-au480",
                        "fieldType" : "text",
                        "unit" : "mg/dl",
                        "ranges" : [
                            {
                                "minValue" : "4.8",
                                "maxValue" : "8.7",
                                "age" : {
                                    "minAge" : "18 Y",
                                    "maxAge" : "100 Y"
                                },
                                "gender" : "M"
                            },
                            {
                                "minValue" : "2.6",
                                "maxValue" : "8.0",
                                "age" : {
                                    "minAge" : "18 Y",
                                    "maxAge" : "100 Y"
                                },
                                "gender" : "F"
                            },
                            {
                                "minValue" : "1.9",
                                "maxValue" : "5.4",
                                "age" : {
                                    "minAge" : "1 M",
                                    "maxAge" : "10 Y"
                                }
                            },
                            {
                                "minValue" : "3.5",
                                "maxValue" : "7.3",
                                "age" : {
                                    "minAge" : "10 Y",
                                    "maxAge" : "18 Y"
                                }
                            }
                        ],
                        "value" : "3.1",
                        "interpretation" : "",
                        "isAbnormal" : true
                    }
                ]
            },
            "signUrl" : "https://myteleopd.s3.ap-south-1.amazonaws.com/sign-1704356511241.png",
            "uploadedAt" : ISODate("2024-01-04T08:21:51.476+0000")
        },
        {
            "cleared" : false,
            // "_id" : ObjectId("659665840da0c53c36685fc4"),
            "name" : "LIPID PROFILE",
            "gst" : NumberInt(0),
            "unitPrice" : NumberInt(0),
            "discount" : NumberInt(0),
            "packageId" : ObjectId("6381bec183a9e84bd5ae58f7"),
            "activities" : [
                {
                    // "_id" : ObjectId("65966a9f7a0f2156f8325771"),
                    "type" : "APPROVED",
                    "at" : ISODate("2024-01-04T08:21:51.476+0000"),
                    "by" : {
                        "name" : "Dr.Govinda Raju",
                        "userId" : ObjectId("65549c046ee3724edc3ec91e"),
                        "userType" : "DOCTOR"
                    }
                }
            ],
            "reportData" : {
                "editorState" : "{\"blocks\":[{\"key\":\"1dg9b\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                "parameters" : [
                    {
                        "name" : "CHOLESTEROL TOTAL",
                        "type" : "range",
                        "machineCode" : "cholb-025-chols-012-au480",
                        "fieldType" : "text",
                        "unit" : "mg/dl",
                        "ranges" : [
                            {
                                "minValue" : "0",
                                "maxValue" : "200",
                                "gender" : "M",
                                "inRangeInterpretation" : "Desirable"
                            },
                            {
                                "minValue" : "201",
                                "maxValue" : "239",
                                "gender" : "M",
                                "inRangeInterpretation" : "Moderate Risk"
                            },
                            {
                                "minValue" : "240",
                                "maxValue" : "",
                                "gender" : "M",
                                "inRangeInterpretation" : "High Risk"
                            },
                            {
                                "minValue" : "0",
                                "maxValue" : "200",
                                "gender" : "F",
                                "inRangeInterpretation" : "Desirable"
                            },
                            {
                                "minValue" : "201",
                                "maxValue" : "239",
                                "gender" : "F",
                                "inRangeInterpretation" : "Moderate risk"
                            },
                            {
                                "minValue" : "240",
                                "maxValue" : "",
                                "gender" : "F",
                                "inRangeInterpretation" : "High risk"
                            }
                        ],
                        "value" : "100",
                        "interpretation" : "Desirable",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "TRIGLYCERIDES",
                        "type" : "range",
                        "machineCode" : "tgls-013-au480",
                        "fieldType" : "text",
                        "unit" : "mg/dl",
                        "ranges" : [
                            {
                                "minValue" : "0",
                                "maxValue" : "150",
                                "gender" : "M",
                                "inRangeInterpretation" : "Normal"
                            },
                            {
                                "minValue" : "150",
                                "maxValue" : "199",
                                "gender" : "M",
                                "inRangeInterpretation" : "Borderline "
                            },
                            {
                                "minValue" : "200",
                                "maxValue" : "500",
                                "gender" : "M",
                                "inRangeInterpretation" : "High"
                            },
                            {
                                "minValue" : "500",
                                "maxValue" : "",
                                "gender" : "M",
                                "inRangeInterpretation" : "Very High "
                            },
                            {
                                "minValue" : "0",
                                "maxValue" : "150",
                                "gender" : "F",
                                "inRangeInterpretation" : "Normal"
                            },
                            {
                                "minValue" : "150",
                                "maxValue" : "199",
                                "gender" : "F",
                                "inRangeInterpretation" : "Borderline"
                            },
                            {
                                "minValue" : "200",
                                "maxValue" : "500",
                                "gender" : "F",
                                "inRangeInterpretation" : "High"
                            },
                            {
                                "minValue" : "500",
                                "maxValue" : "",
                                "gender" : "F",
                                "inRangeInterpretation" : "Very high"
                            }
                        ],
                        "value" : "100",
                        "interpretation" : "Normal",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "HDL CHOLESTEROL",
                        "type" : "range",
                        "machineCode" : "hdls-014-au480",
                        "fieldType" : "text",
                        "unit" : "mg/dl",
                        "ranges" : [
                            {
                                "minValue" : "",
                                "maxValue" : "7",
                                "gender" : "M",
                                "inRangeInterpretation" : "Dangerous"
                            },
                            {
                                "minValue" : "7",
                                "maxValue" : "15",
                                "gender" : "M",
                                "inRangeInterpretation" : "High"
                            },
                            {
                                "minValue" : "15",
                                "maxValue" : "25",
                                "gender" : "M",
                                "inRangeInterpretation" : "Avergae"
                            },
                            {
                                "minValue" : "25",
                                "maxValue" : "37",
                                "gender" : "M",
                                "inRangeInterpretation" : "Below Average"
                            },
                            {
                                "minValue" : "37",
                                "maxValue" : "",
                                "gender" : "M",
                                "inRangeInterpretation" : "Protectionproblem"
                            },
                            {
                                "minValue" : "",
                                "maxValue" : "7",
                                "gender" : "F",
                                "inRangeInterpretation" : "Dangerous"
                            },
                            {
                                "minValue" : "7",
                                "maxValue" : "15",
                                "gender" : "F",
                                "inRangeInterpretation" : "Dangerous"
                            },
                            {
                                "minValue" : "15",
                                "maxValue" : "25",
                                "gender" : "F",
                                "inRangeInterpretation" : "Average"
                            },
                            {
                                "minValue" : "25",
                                "maxValue" : "37",
                                "gender" : "F",
                                "inRangeInterpretation" : "Below Average"
                            },
                            {
                                "minValue" : "37",
                                "maxValue" : "",
                                "gender" : "F",
                                "inRangeInterpretation" : "Protectionproblem"
                            }
                        ],
                        "value" : "25",
                        "interpretation" : "Avergae",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "VLDL CHOLESTEROL ",
                        "type" : "range",
                        "machineCode" : "",
                        "fieldType" : "text",
                        "unit" : "mg/dl",
                        "formula" : [
                            "TRIGLYCERIDES",
                            "/",
                            "5"
                        ],
                        "ranges" : [
                            {
                                "minValue" : "4.0",
                                "maxValue" : "40.0",
                                "gender" : "M",
                                "inRangeInterpretation" : "Normal"
                            },
                            {
                                "minValue" : "4.0",
                                "maxValue" : "40.0",
                                "gender" : "F",
                                "inRangeInterpretation" : "Normal"
                            }
                        ],
                        "value" : "20.00",
                        "interpretation" : "Normal",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "LDL CHOLESTEROL ",
                        "type" : "range",
                        "machineCode" : "ldls-015-au480",
                        "fieldType" : "text",
                        "unit" : "mg/dl",
                        "ranges" : [
                            {
                                "minValue" : "0",
                                "maxValue" : "100",
                                "gender" : "M",
                                "inRangeInterpretation" : "Optimal "
                            },
                            {
                                "minValue" : "100",
                                "maxValue" : "129",
                                "gender" : "M",
                                "inRangeInterpretation" : "Near /Above optimal "
                            },
                            {
                                "minValue" : "130",
                                "maxValue" : "159",
                                "gender" : "M",
                                "inRangeInterpretation" : "Borderline high"
                            },
                            {
                                "minValue" : "160",
                                "maxValue" : "189",
                                "gender" : "M",
                                "inRangeInterpretation" : "High "
                            },
                            {
                                "minValue" : "190",
                                "maxValue" : "",
                                "gender" : "M",
                                "inRangeInterpretation" : "very high"
                            },
                            {
                                "minValue" : "0",
                                "maxValue" : "100",
                                "gender" : "F",
                                "inRangeInterpretation" : "Optimal"
                            },
                            {
                                "minValue" : "100",
                                "maxValue" : "129",
                                "gender" : "F",
                                "inRangeInterpretation" : "Near/Above Optimal"
                            },
                            {
                                "minValue" : "130",
                                "maxValue" : "159",
                                "gender" : "F",
                                "inRangeInterpretation" : "Borderline high"
                            },
                            {
                                "minValue" : "160",
                                "maxValue" : "189",
                                "gender" : "F",
                                "inRangeInterpretation" : "High"
                            },
                            {
                                "minValue" : "190",
                                "maxValue" : "",
                                "gender" : "F",
                                "inRangeInterpretation" : "Very high"
                            }
                        ],
                        "value" : "64",
                        "interpretation" : "Optimal ",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "CHOLESTEROL / HDL RATIO ",
                        "type" : "range",
                        "machineCode" : "",
                        "fieldType" : "text",
                        "formula" : [
                            "CHOLESTEROL TOTAL",
                            "/",
                            "HDL CHOLESTEROL"
                        ],
                        "ranges" : [
                            {
                                "minValue" : "0",
                                "maxValue" : "5",
                                "gender" : "M",
                                "inRangeInterpretation" : "Normal"
                            },
                            {
                                "minValue" : "0",
                                "maxValue" : "5",
                                "gender" : "F",
                                "inRangeInterpretation" : "Normal"
                            }
                        ],
                        "value" : "4.00",
                        "interpretation" : "Normal",
                        "isAbnormal" : false
                    }
                ]
            },
            
            "signUrl" : "https://myteleopd.s3.ap-south-1.amazonaws.com/sign-1704356511241.png",
            "uploadedAt" : ISODate("2024-01-04T08:21:51.476+0000")
        },
        {
            "cleared" : false,
            // "_id" : ObjectId("659665840da0c53c36685fc5"),
            "name" : "LIVER FUNCTION TEST",
            "gst" : NumberInt(0),
            "unitPrice" : NumberInt(0),
            "discount" : NumberInt(0),
            "packageId" : ObjectId("6381c40183a9e84bd5ae58f8"),
            "activities" : [
                {
                    // "_id" : ObjectId("65966a9f7a0f2156f8325773"),
                    "type" : "APPROVED",
                    "at" : ISODate("2024-01-04T08:21:51.476+0000"),
                    "by" : {
                        "name" : "Dr.Govinda Raju",
                        "userId" : ObjectId("65549c046ee3724edc3ec91e"),
                        "userType" : "DOCTOR"
                    }
                }
            ],
            "reportData" : {
                "editorState" : "{\"blocks\":[{\"key\":\"a561t\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                "parameters" : [
                    {
                        "name" : "TOTAL BILIRUBIN(REFLECTANCE SPECTROPHOTOMETRY)",
                        "type" : "range",
                        "machineCode" : "tbilc-005-au480",
                        "fieldType" : "text",
                        "unit" : "mg/dl",
                        "ranges" : [
                            {
                                "minValue" : "0.3",
                                "maxValue" : "1.2",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "0.3",
                                "maxValue" : "1.2",
                                "gender" : "F"
                            }
                        ],
                        "value" : "0.7",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "DIRECT BILIRUBIN(CALCULATED)",
                        "type" : "range",
                        "machineCode" : "dbilc-003-au480",
                        "fieldType" : "number",
                        "unit" : "mg/dl",
                        "ranges" : [
                            {
                                "minValue" : "0.1",
                                "maxValue" : "0.5",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "0.1",
                                "maxValue" : "0.5",
                                "gender" : "F"
                            }
                        ],
                        "value" : "0.1",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "INDIRECT BILIRUBIN(REFLECTANCE SPECTROPHOTOMETRY)",
                        "type" : "range",
                        "machineCode" : "",
                        "fieldType" : "number",
                        "unit" : "mg/dl",
                        "formula" : [
                            "TOTAL BILIRUBIN(REFLECTANCE SPECTROPHOTOMETRY)",
                            "-",
                            "DIRECT BILIRUBIN(CALCULATED)"
                        ],
                        "ranges" : [
                            {
                                "minValue" : "0.3",
                                "maxValue" : "1",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "0.3",
                                "maxValue" : "1",
                                "gender" : "F"
                            }
                        ],
                        "value" : "0.60",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "ASPARTATE TRANSAMINASE (SGOT) (UV WITH P5P)",
                        "type" : "range",
                        "machineCode" : "sgots-009-au480",
                        "fieldType" : "number",
                        "unit" : "IU/L",
                        "ranges" : [
                            {
                                "minValue" : "15",
                                "maxValue" : "41",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "15",
                                "maxValue" : "41",
                                "gender" : "F"
                            }
                        ],
                        "value" : "35",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "ALANINE TRANSAMINASE(SGPT) (UV WITH P5P)",
                        "type" : "range",
                        "machineCode" : "sgpts-008-au80",
                        "fieldType" : "number",
                        "unit" : "IU/L",
                        "ranges" : [
                            {
                                "minValue" : "17",
                                "maxValue" : "63",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "17",
                                "maxValue" : "63",
                                "gender" : "F"
                            }
                        ],
                        "value" : "55",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "ALKALINE PHOSPHATASE(PNPP)  ",
                        "type" : "range",
                        "machineCode" : "alpb-002-au480",
                        "fieldType" : "number",
                        "unit" : "IU/L",
                        "ranges" : [
                            {
                                "minValue" : "32",
                                "maxValue" : "126",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "32",
                                "maxValue" : "126",
                                "gender" : "F"
                            }
                        ],
                        "value" : "45",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "GGT(G-GLUTAMYL-P-NITROANILIDE) ",
                        "type" : "range",
                        "machineCode" : "cgtb-022-ggts-021-au480",
                        "fieldType" : "number",
                        "unit" : "IU/L",
                        "ranges" : [
                            {
                                "minValue" : "7",
                                "maxValue" : "50",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "7",
                                "maxValue" : "50",
                                "gender" : "F"
                            }
                        ],
                        "value" : "42",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "TOTAL PROTEIN (BIURET)",
                        "type" : "range",
                        "machineCode" : "tpb-026-tps-011-au480",
                        "fieldType" : "number",
                        "unit" : "g/dl",
                        "ranges" : [
                            {
                                "minValue" : "6.5",
                                "maxValue" : "8.1"
                            }
                        ],
                        "value" : "6.6",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "ALBUMIN (BROMOCRESOL GREEN)",
                        "type" : "range",
                        "machineCode" : "albb-024-albs-010-au480",
                        "fieldType" : "number",
                        "unit" : "g/dl",
                        "ranges" : [
                            {
                                "minValue" : "3.5",
                                "maxValue" : "5",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "3.5",
                                "maxValue" : "5",
                                "gender" : "F"
                            }
                        ],
                        "value" : "3.6",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "GLOBULIN(CALCULATED)",
                        "type" : "range",
                        "machineCode" : "",
                        "fieldType" : "number",
                        "unit" : "g/dl",
                        "formula" : [
                            "TOTAL PROTEIN (BIURET)",
                            "-",
                            "ALBUMIN (BROMOCRESOL GREEN)"
                        ],
                        "ranges" : [
                            {
                                "minValue" : "2",
                                "maxValue" : "4",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "2",
                                "maxValue" : "4",
                                "gender" : "F"
                            }
                        ],
                        "value" : "3.00",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "A/G RATIO(CALCULATED)",
                        "type" : "range",
                        "machineCode" : "",
                        "fieldType" : "number",
                        "formula" : [
                            "ALBUMIN (BROMOCRESOL GREEN)",
                            "/",
                            "GLOBULIN(CALCULATED)"
                        ],
                        "ranges" : [
                            {
                                "minValue" : "0.8",
                                "maxValue" : "2",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "0.8",
                                "maxValue" : "2",
                                "gender" : "F"
                            }
                        ],
                        "value" : "1.20",
                        "interpretation" : "",
                        "isAbnormal" : false
                    }
                ]
            },
            
            "signUrl" : "https://myteleopd.s3.ap-south-1.amazonaws.com/sign-1704356511241.png",
            "uploadedAt" : ISODate("2024-01-04T08:21:51.476+0000")
        },
        {
            "cleared" : false,
            // "_id" : ObjectId("659665840da0c53c36685fc6"),
            "name" : "URINE ROUTINE",
            "gst" : NumberInt(0),
            "unitPrice" : NumberInt(0),
            "discount" : NumberInt(0),
            "packageId" : ObjectId("6381ca9183a9e84bd5ae58f9"),
            "activities" : [
                {
                    // "_id" : ObjectId("65966a9f7a0f2156f8325775"),
                    "type" : "APPROVED",
                    "at" : ISODate("2024-01-04T08:21:51.477+0000"),
                    "by" : {
                        "name" : "Dr.Govinda Raju",
                        "userId" : ObjectId("65549c046ee3724edc3ec91e"),
                        "userType" : "DOCTOR"
                    }
                }
            ],
            "reportData" : {
                "editorState" : "{\"blocks\":[{\"key\":\"73e1l\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                "parameters" : [
                    {
                        "name" : "VOLUME ",
                        "type" : "range",
                        "machineCode" : "vol-ca",
                        "fieldType" : "text",
                        "unit" : "ml",
                        "ranges" : [
                            {
                                "minValue" : "2",
                                "maxValue" : ""
                            }
                        ],
                        "value" : "10",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "APPEARANCE ",
                        "type" : "match",
                        "fieldType" : "select",
                        "machineCode" : "aprnc-ca",
                        "matchValue" : "Clear",
                        "selectOptions" : "Clear,Non clear,Turbid,Cloudy,Insufficient sample,Sample clotted",
                        "showMatchValueAsRange" : true,
                        "value" : "Clear",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "Sp.GRAVITY ",
                        "type" : "range",
                        "machineCode" : "spg-ca",
                        "fieldType" : "text",
                        "ranges" : [
                            {
                                "minValue" : "1.006",
                                "maxValue" : "1.022",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "1.006",
                                "maxValue" : "1.022",
                                "gender" : "F"
                            }
                        ],
                        "value" : "1.009",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "LEUCOCYTES (PUS CELLS) ",
                        "type" : "match",
                        "fieldType" : "text",
                        "machineCode" : "leu-ca",
                        "matchValue" : "Negative",
                        "unit" : "WBC/μI",
                        "selectOptions" : "",
                        "showMatchValueAsRange" : true,
                        "value" : "Negative",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "NITRATE  ",
                        "type" : "match",
                        "fieldType" : "text",
                        "machineCode" : "nit-ca",
                        "matchValue" : "Negative",
                        "selectOptions" : "",
                        "showMatchValueAsRange" : true,
                        "value" : "Negative",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "UROBILINOGEN",
                        "type" : "range",
                        "machineCode" : "uro-ca",
                        "fieldType" : "text",
                        "unit" : "EU/dL",
                        "ranges" : [
                            {
                                "minValue" : "0.2",
                                "maxValue" : "1",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "0.2",
                                "maxValue" : "1",
                                "gender" : "F"
                            }
                        ],
                        "value" : "1.0",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "PROTEIN",
                        "type" : "match",
                        "fieldType" : "text",
                        "machineCode" : "pro-ca",
                        "matchValue" : "Negative",
                        "unit" : "mg/dL",
                        "selectOptions" : "",
                        "showMatchValueAsRange" : true,
                        "value" : "Negative",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "pH ",
                        "type" : "range",
                        "machineCode" : "ph-ca",
                        "fieldType" : "text",
                        "ranges" : [
                            {
                                "minValue" : "4.6",
                                "maxValue" : "8"
                            }
                        ],
                        "value" : "4.9",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "BLOOD",
                        "type" : "match",
                        "fieldType" : "text",
                        "machineCode" : "bld-ca",
                        "matchValue" : "Negative",
                        "unit" : "RBC/μI",
                        "selectOptions" : "",
                        "showMatchValueAsRange" : true,
                        "value" : "Negative",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "URINE KETONE BODIES",
                        "type" : "match",
                        "fieldType" : "text",
                        "machineCode" : "ket-ca",
                        "matchValue" : "Negative",
                        "unit" : "mg/dL",
                        "selectOptions" : "",
                        "showMatchValueAsRange" : true,
                        "value" : "Negative",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "BILIRUBIN ",
                        "type" : "match",
                        "fieldType" : "text",
                        "machineCode" : "bil-ca",
                        "matchValue" : "Negative",
                        "selectOptions" : "",
                        "showMatchValueAsRange" : true,
                        "value" : "Negative",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "URINE GLUCOSE",
                        "type" : "match",
                        "fieldType" : "text",
                        "machineCode" : "sug-ca",
                        "matchValue" : "Negative",
                        "unit" : "mg/dL",
                        "selectOptions" : "",
                        "showMatchValueAsRange" : true,
                        "value" : "Negative",
                        "interpretation" : "",
                        "isAbnormal" : false
                    }
                ]
            },
            
            "signUrl" : "https://myteleopd.s3.ap-south-1.amazonaws.com/sign-1704356511241.png",
            "uploadedAt" : ISODate("2024-01-04T08:21:51.477+0000")
        },
        {
            "cleared" : false,
            // "_id" : ObjectId("659665840da0c53c36685fc7"),
            "name" : "SEROLOGY TEST",
            "gst" : NumberInt(0),
            "unitPrice" : NumberInt(0),
            "discount" : NumberInt(0),
            "packageId" : ObjectId("6381cb8783a9e84bd5ae58fa"),
            "activities" : [
                {
                    // "_id" : ObjectId("65966a9f7a0f2156f8325777"),
                    "type" : "APPROVED",
                    "at" : ISODate("2024-01-04T08:21:51.477+0000"),
                    "by" : {
                        "name" : "Dr.Govinda Raju",
                        "userId" : ObjectId("65549c046ee3724edc3ec91e"),
                        "userType" : "DOCTOR"
                    }
                }
            ],
            "reportData" : {
                "editorState" : "{\"blocks\":[{\"key\":\"fiiro\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                "parameters" : [
                    {
                        "name" : " HIV HUMAN IMMUNO DEFICIENCY VIRUS HIV I + II",
                        "type" : "match",
                        "fieldType" : "select",
                        "machineCode" : "hivc-6000-111",
                        "matchValue" : "Negative",
                        "unit" : "COI",
                        "selectOptions" : "Negative,Positive,INSUFFICIENT SAMPLE,SAMPLE CLOTTED",
                        "showMatchValueAsRange" : true,
                        "value" : "Negative",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "HBsAg - Hepatitis B surface antigen",
                        "type" : "match",
                        "fieldType" : "select",
                        "machineCode" : "hbsag-6000-250",
                        "matchValue" : "Negative",
                        "unit" : "COI",
                        "selectOptions" : "Negative,Positive,INSUFFICIENT SAMPLE,SAMPLE CLOTTED",
                        "showMatchValueAsRange" : true,
                        "value" : "Negative",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "HCV Ab - Hepatitis C virus Antibody",
                        "type" : "match",
                        "fieldType" : "select",
                        "machineCode" : "hcv-6000-286",
                        "matchValue" : "Negative",
                        "unit" : "COI",
                        "selectOptions" : "Negative,Positive,INSUFFICIENT SAMPLE,SAMPLE CLOTTED",
                        "showMatchValueAsRange" : true,
                        "value" : "Negative",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "V.D.R.L",
                        "type" : "match",
                        "fieldType" : "select",
                        "machineCode" : "sypls-6000-160",
                        "matchValue" : "Non Reactive",
                        "unit" : "COI",
                        "selectOptions" : "Reactive,Non Reactive,INSUFFICIENT SAMPLE,SAMPLE CLOTTED",
                        "showMatchValueAsRange" : true,
                        "value" : "Non Reactive",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "MALARIAL PARASITES",
                        "type" : "normal",
                        "machineCode" : "",
                        "fieldType" : "select",
                        "selectOptions" : "NEGATIVE,POSITIVE,INSUFFICIENT SAMPLE,SAMPLE CLOTTED",
                        "value" : "NEGATIVE",
                        "interpretation" : "",
                        "isAbnormal" : false
                    }
                ]
            },
            
            "signUrl" : "https://myteleopd.s3.ap-south-1.amazonaws.com/sign-1704356511241.png",
            "uploadedAt" : ISODate("2024-01-04T08:21:51.477+0000")
        },
        {
            "cleared" : false,
            // "_id" : ObjectId("659665840da0c53c36685fc8"),
            "name" : "IMMUNOASSAY TEST",
            "gst" : NumberInt(0),
            "unitPrice" : NumberInt(0),
            "discount" : NumberInt(0),
            "packageId" : ObjectId("6381ccad83a9e84bd5ae58fb"),
            "activities" : [
                {
                    // "_id" : ObjectId("65966a9f7a0f2156f8325779"),
                    "type" : "APPROVED",
                    "at" : ISODate("2024-01-04T08:21:51.478+0000"),
                    "by" : {
                        "name" : "Dr.Govinda Raju",
                        "userId" : ObjectId("65549c046ee3724edc3ec91e"),
                        "userType" : "DOCTOR"
                    }
                }
            ],
            "reportData" : {
                "editorState" : "{\"blocks\":[{\"key\":\"38bll\",\"text\":\"INTERPRETATION :\\n\\nHypothyroidism Subclinical Hypothyroidism Hyperthyroidism Subclinical Hyperthyroidism\\nFor subclinical Hypo/hyperthyrodism, thyroid antibodies repeat TSH & FT4 auggested. Please evluate for\\ncomorbid conditions like DM,CHD etc.TSH values may be translently altered because of non thyroid illness like\\ninfections, recovery phase of illnes, surgery & certain drugs.Diurnal variation of upto 50%, is known to occur and\\nhence, time of the day can influence measured value.\\nRef range for Pregnanacy: (ATA2014) I Tri - 0.1 - 2.5, II Tri 0.2 - 3.0, III Tri 0.3 - 3.0\\nReferences- NHS 2013 & JAPI 2011 \",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                "parameters" : [
                    {
                        "name" : "TRIIODOTHYRONINE - T3  ",
                        "type" : "range",
                        "machineCode" : "tt3",
                        "fieldType" : "text",
                        "unit" : "nmol/L",
                        "ranges" : [
                            {
                                "minValue" : "1.49",
                                "maxValue" : "2.60",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "1.49",
                                "maxValue" : "2.60",
                                "gender" : "F"
                            }
                        ],
                        "value" : "1.99",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "THYROXINE - T4 ",
                        "type" : "range",
                        "machineCode" : "tt4",
                        "fieldType" : "number",
                        "unit" : "nmol/L",
                        "ranges" : [
                            {
                                "minValue" : "71.2",
                                "maxValue" : "141",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "71.2",
                                "maxValue" : "141",
                                "gender" : "F"
                            }
                        ],
                        "value" : "91",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "THYROID STIMULATING HORMONE ",
                        "type" : "range",
                        "machineCode" : "tsh",
                        "fieldType" : "number",
                        "unit" : "uIU/ml",
                        "ranges" : [
                            {
                                "minValue" : "0.46",
                                "maxValue" : "4.68",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "0.46",
                                "maxValue" : "4.68",
                                "gender" : "F"
                            }
                        ],
                        "value" : "2.00",
                        "interpretation" : "",
                        "isAbnormal" : false
                    }
                ]
            },
            
            "signUrl" : "https://myteleopd.s3.ap-south-1.amazonaws.com/sign-1704356511241.png",
            "uploadedAt" : ISODate("2024-01-04T08:21:51.478+0000")
        },
        {
            "cleared" : false,
            // "_id" : ObjectId("659665840da0c53c36685fc9"),
            "name" : "COMPLETE BLOOD COUNT",
            "gst" : NumberInt(0),
            "unitPrice" : NumberInt(0),
            "discount" : NumberInt(0),
            "packageId" : ObjectId("6389bca397c0192b165922e2"),
            "activities" : [
                {
                    // "_id" : ObjectId("65966a9f7a0f2156f832577b"),
                    "type" : "APPROVED",
                    "at" : ISODate("2024-01-04T08:21:51.478+0000"),
                    "by" : {
                        "name" : "Dr.Govinda Raju",
                        "userId" : ObjectId("65549c046ee3724edc3ec91e"),
                        "userType" : "DOCTOR"
                    }
                }
            ],
            "reportData" : {
                "editorState" : "{\"blocks\":[{\"key\":\"b332l\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                "parameters" : [
                    {
                        "name" : "HAEMOGLOBIN  (COLORIMETRIC METHOD)",
                        "type" : "range",
                        "machineCode" : "hgb",
                        "fieldType" : "text",
                        "unit" : "gm%",
                        "ranges" : [
                            {
                                "minValue" : "12.8",
                                "maxValue" : "16.4",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "11.2",
                                "maxValue" : "14.4",
                                "gender" : "F"
                            }
                        ],
                        "value" : "13.8",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "RBC (SHEATH FLOW DC DETECTION)",
                        "type" : "range",
                        "machineCode" : "rbc",
                        "fieldType" : "text",
                        "unit" : "million/cumm",
                        "ranges" : [
                            {
                                "minValue" : "3.5",
                                "maxValue" : "5.3",
                                "gender" : "F"
                            },
                            {
                                "minValue" : "4.2",
                                "maxValue" : "5.6",
                                "gender" : "M"
                            }
                        ],
                        "value" : "4.2",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "HCT(CALCULATED)",
                        "type" : "range",
                        "machineCode" : "pcv",
                        "fieldType" : "text",
                        "unit" : "%",
                        "ranges" : [
                            {
                                "minValue" : "36",
                                "maxValue" : "48",
                                "gender" : "F"
                            },
                            {
                                "minValue" : "41",
                                "maxValue" : "50",
                                "gender" : "M"
                            }
                        ],
                        "value" : "41",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "MCV(CALCULATED)",
                        "type" : "range",
                        "machineCode" : "mcv",
                        "fieldType" : "text",
                        "unit" : "Fl",
                        "ranges" : [
                            {
                                "minValue" : "80",
                                "maxValue" : "100",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "80",
                                "maxValue" : "100",
                                "gender" : "F"
                            }
                        ],
                        "value" : "80",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "MCH(CALCULATED)",
                        "type" : "range",
                        "machineCode" : "mch",
                        "fieldType" : "text",
                        "unit" : "pg",
                        "ranges" : [
                            {
                                "minValue" : "27",
                                "maxValue" : "32"
                            }
                        ],
                        "value" : "29",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "MCHC(CALCULATED)",
                        "type" : "range",
                        "machineCode" : "mchc",
                        "fieldType" : "text",
                        "unit" : "g/dL",
                        "ranges" : [
                            {
                                "minValue" : "32",
                                "maxValue" : "35",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "32",
                                "maxValue" : "35",
                                "gender" : "F"
                            }
                        ],
                        "value" : "33",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "RDW-CV(CALCULATED)",
                        "type" : "range",
                        "machineCode" : "rdw-cv",
                        "fieldType" : "text",
                        "unit" : "%",
                        "ranges" : [
                            {
                                "minValue" : "11.6",
                                "maxValue" : "14",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "11.6",
                                "maxValue" : "14",
                                "gender" : "F"
                            }
                        ],
                        "value" : "11.7",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "PLATELET COUNT(SHEATH FLOW DC DETECTION)",
                        "type" : "range",
                        "machineCode" : "plt",
                        "fieldType" : "text",
                        "unit" : "Thou/µL",
                        "ranges" : [
                            {
                                "minValue" : "150",
                                "maxValue" : "450",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "150",
                                "maxValue" : "450",
                                "gender" : "F"
                            }
                        ],
                        "value" : "150",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "TOTAL WBC COUNT ",
                        "type" : "range",
                        "machineCode" : "twbc#",
                        "fieldType" : "text",
                        "unit" : "Thou/µL",
                        "ranges" : [
                            {
                                "minValue" : "4",
                                "maxValue" : "10",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "4",
                                "maxValue" : "10",
                                "gender" : "F"
                            }
                        ],
                        "value" : "4",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "NEUTROPHILS",
                        "type" : "range",
                        "machineCode" : "neu#",
                        "fieldType" : "text",
                        "unit" : "%",
                        "ranges" : [
                            {
                                "minValue" : "40",
                                "maxValue" : "70",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "40",
                                "maxValue" : "70",
                                "gender" : "F"
                            }
                        ],
                        "value" : "40",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "LYMPHOCYTES ",
                        "type" : "range",
                        "machineCode" : "lym#",
                        "fieldType" : "text",
                        "unit" : "%",
                        "ranges" : [
                            {
                                "minValue" : "20",
                                "maxValue" : "40",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "20",
                                "maxValue" : "40",
                                "gender" : "F"
                            }
                        ],
                        "value" : "20",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "MONOCYTES ",
                        "type" : "range",
                        "machineCode" : "mon#",
                        "fieldType" : "text",
                        "unit" : "%",
                        "ranges" : [
                            {
                                "minValue" : "2",
                                "maxValue" : "10",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "2",
                                "maxValue" : "10",
                                "gender" : "F"
                            }
                        ],
                        "value" : "2",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "EOSINOPHILS ",
                        "type" : "range",
                        "machineCode" : "eos#",
                        "fieldType" : "text",
                        "unit" : "%",
                        "ranges" : [
                            {
                                "minValue" : "1",
                                "maxValue" : "6",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "1",
                                "maxValue" : "6",
                                "gender" : "F"
                            }
                        ],
                        "value" : "1",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "BASOPHILS  ",
                        "type" : "range",
                        "machineCode" : "bas#",
                        "fieldType" : "text",
                        "unit" : "%",
                        "ranges" : [
                            {
                                "minValue" : "0",
                                "maxValue" : "1",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "0",
                                "maxValue" : "1",
                                "gender" : "F"
                            }
                        ],
                        "value" : "0",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "PERFORMED : ERYTHROCYTE SEDIMENTATION RATE",
                        "type" : "label",
                        "machineCode" : "",
                        "fieldType" : "text",
                        "selectOptions" : "",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "ESR",
                        "type" : "range",
                        "machineCode" : "esr",
                        "fieldType" : "text",
                        "unit" : "mm/hr",
                        "ranges" : [
                            {
                                "minValue" : "0",
                                "maxValue" : "15",
                                "age" : {
                                    "minAge" : "1 D",
                                    "maxAge" : "50 Y"
                                },
                                "gender" : "M"
                            },
                            {
                                "minValue" : "0",
                                "maxValue" : "20",
                                "age" : {
                                    "minAge" : "50 Y",
                                    "maxAge" : "85 Y"
                                },
                                "gender" : "M"
                            },
                            {
                                "minValue" : "0",
                                "maxValue" : "30",
                                "age" : {
                                    "minAge" : "85 Y",
                                    "maxAge" : "110 Y"
                                },
                                "gender" : "M"
                            },
                            {
                                "minValue" : "0",
                                "maxValue" : "20",
                                "age" : {
                                    "minAge" : "1 D",
                                    "maxAge" : "50 Y"
                                },
                                "gender" : "F"
                            },
                            {
                                "minValue" : "0",
                                "maxValue" : "30",
                                "age" : {
                                    "minAge" : "50 Y",
                                    "maxAge" : "85 Y"
                                },
                                "gender" : "F"
                            },
                            {
                                "minValue" : "0",
                                "maxValue" : "42",
                                "age" : {
                                    "minAge" : "85 Y",
                                    "maxAge" : "110 Y"
                                },
                                "gender" : "F"
                            }
                        ],
                        "value" : "8",
                        "interpretation" : "",
                        "isAbnormal" : false
                    }
                ]
            },
            
            "signUrl" : "https://myteleopd.s3.ap-south-1.amazonaws.com/sign-1704356511241.png",
            "uploadedAt" : ISODate("2024-01-04T08:21:51.478+0000")
        },
        {
            "cleared" : false,
            // "_id" : ObjectId("659665840da0c53c36685fca"),
            "name" : "SPECIAL CHEMISTRY",
            "gst" : NumberInt(0),
            "unitPrice" : NumberInt(0),
            "discount" : NumberInt(0),
            "packageId" : ObjectId("63a16366ba761b46ba118fd2"),
            "activities" : [
                {
                    // "_id" : ObjectId("65966a9f7a0f2156f832577d"),
                    "type" : "APPROVED",
                    "at" : ISODate("2024-01-04T08:21:51.479+0000"),
                    "by" : {
                        "name" : "Dr.Govinda Raju",
                        "userId" : ObjectId("65549c046ee3724edc3ec91e"),
                        "userType" : "DOCTOR"
                    }
                }
            ],
            "reportData" : {
                "editorState" : "{\"blocks\":[{\"key\":\"b6b7o\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                "parameters" : [
                    {
                        "name" : "MAGNESIUM ",
                        "type" : "range",
                        "machineCode" : "mgs-018-au480",
                        "fieldType" : "text",
                        "unit" : "mg/dL",
                        "ranges" : [
                            {
                                "minValue" : "1.7",
                                "maxValue" : "2.8"
                            }
                        ],
                        "value" : "1.8",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "C-REACTIVE PROTEIN ",
                        "type" : "range",
                        "machineCode" : "crpb-020-au480",
                        "fieldType" : "text",
                        "unit" : "mg/dL",
                        "ranges" : [
                            {
                                "minValue" : "0",
                                "maxValue" : "1",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "0",
                                "maxValue" : "1",
                                "gender" : "F"
                            }
                        ],
                        "value" : "0.1",
                        "interpretation" : "",
                        "isAbnormal" : false
                    }
                ]
            },
            
            "signUrl" : "https://myteleopd.s3.ap-south-1.amazonaws.com/sign-1704356511241.png",
            "uploadedAt" : ISODate("2024-01-04T08:21:51.479+0000")
        },
        {
            "cleared" : false,
            // "_id" : ObjectId("659665840da0c53c36685fcb"),
            "name" : "IRON PANEL",
            "gst" : NumberInt(0),
            "unitPrice" : NumberInt(0),
            "discount" : NumberInt(0),
            "packageId" : ObjectId("63a16554ba761b46ba118fe3"),
            "activities" : [
                {
                    // "_id" : ObjectId("65966a9f7a0f2156f832577f"),
                    "type" : "APPROVED",
                    "at" : ISODate("2024-01-04T08:21:51.479+0000"),
                    "by" : {
                        "name" : "Dr.Govinda Raju",
                        "userId" : ObjectId("65549c046ee3724edc3ec91e"),
                        "userType" : "DOCTOR"
                    }
                }
            ],
            "reportData" : {
                "editorState" : "{\"blocks\":[{\"key\":\"19ige\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                "parameters" : [
                    {
                        "name" : "IRON  ",
                        "type" : "range",
                        "machineCode" : "irons-017-au480",
                        "fieldType" : "text",
                        "unit" : "(µg/dL)",
                        "ranges" : [
                            {
                                "minValue" : "60",
                                "maxValue" : "170",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "60",
                                "maxValue" : "170",
                                "gender" : "F"
                            }
                        ],
                        "value" : "70",
                        "interpretation" : "",
                        "isAbnormal" : false
                    },
                    {
                        "name" : "FERRITIN ",
                        "type" : "range",
                        "machineCode" : "frt",
                        "fieldType" : "text",
                        "unit" : "ng/ml",
                        "ranges" : [
                            {
                                "minValue" : "17.9",
                                "maxValue" : "464",
                                "gender" : "M"
                            },
                            {
                                "minValue" : "17.9",
                                "maxValue" : "464",
                                "gender" : "F"
                            }
                        ],
                        "value" : "18.9",
                        "interpretation" : "",
                        "isAbnormal" : false
                    }
                ]
            },
            
            "signUrl" : "https://myteleopd.s3.ap-south-1.amazonaws.com/sign-1704356511241.png",
            "uploadedAt" : ISODate("2024-01-04T08:21:51.479+0000")
        },
        {
            "cleared" : false,
            // "_id" : ObjectId("659665840da0c53c36685fcc"),
            "name" : "HBA1C",
            "gst" : NumberInt(0),
            "unitPrice" : NumberInt(0),
            "discount" : NumberInt(0),
            "packageId" : ObjectId("653755d0a5ada748f9ebdd33"),
            "activities" : [
                {
                    // "_id" : ObjectId("65966a9f7a0f2156f8325781"),
                    "type" : "APPROVED",
                    "at" : ISODate("2024-01-04T08:21:51.479+0000"),
                    "by" : {
                        "name" : "Dr.Govinda Raju",
                        "userId" : ObjectId("65549c046ee3724edc3ec91e"),
                        "userType" : "DOCTOR"
                    }
                }
            ],
            "reportData" : {
                editorState : "{\"blocks\":[{\"key\":\"f592b\",\"text\":\"GLYCO HAEMOGLOBIN (HBA1c)\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":25,\"style\":\"color-rgb(73,80,87)\"},{\"offset\":0,\"length\":25,\"style\":\"bgcolor-rgb(255,255,255)\"},{\"offset\":0,\"length\":25,\"style\":\"fontsize-13\"},{\"offset\":0,\"length\":25,\"style\":\"fontfamily-Poppins, sans-serif\"}],\"entityRanges\":[],\"data\":{\"text-align\":\"start\"}},{\"key\":\"bpofm\",\"text\":\"1. HbA1c is used for monitoring diabetic control. It reflects the estimated average glucose (eAG)\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":97,\"style\":\"color-rgb(73,80,87)\"},{\"offset\":0,\"length\":97,\"style\":\"bgcolor-rgb(255,255,255)\"},{\"offset\":0,\"length\":97,\"style\":\"fontsize-13\"},{\"offset\":0,\"length\":97,\"style\":\"fontfamily-Poppins, sans-serif\"}],\"entityRanges\":[],\"data\":{\"text-align\":\"start\"}},{\"key\":\"2rl7d\",\"text\":\"2. HbA1c has been endorsed by clinical groups & ADA (American Diabetes Association) guidelines 2017, for diagnosis of diabetes using a cut-off point of 6.5%.\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":157,\"style\":\"color-rgb(73,80,87)\"},{\"offset\":0,\"length\":157,\"style\":\"bgcolor-rgb(255,255,255)\"},{\"offset\":0,\"length\":157,\"style\":\"fontsize-13\"},{\"offset\":0,\"length\":157,\"style\":\"fontfamily-Poppins, sans-serif\"}],\"entityRanges\":[],\"data\":{\"text-align\":\"start\"}},{\"key\":\"3l14e\",\"text\":\"3. Trends in HbA1c are a better indicator of diabetic control than a solitary test. \",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":83,\"style\":\"color-rgb(73,80,87)\"},{\"offset\":0,\"length\":83,\"style\":\"bgcolor-rgb(255,255,255)\"},{\"offset\":0,\"length\":83,\"style\":\"fontsize-13\"},{\"offset\":0,\"length\":83,\"style\":\"fontfamily-Poppins, sans-serif\"}],\"entityRanges\":[],\"data\":{\"text-align\":\"start\"}},{\"key\":\"16tu6\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}},{\"key\":\"4vkge\",\"text\":\"A normal A1C level is below 5.7%, a level of 5.7% to 6.4% indicates prediabetes, and a level of 6.5% or more indicates diabetes. Within the 5.7% to 6.4% prediabetes range, the higher your A1C, the greater your risk is for developing type 2 diabetes.\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                "parameters" : [
                    {
                        "name" : "HBA1c",
                        "type" : "range",
                        "machineCode" : "hba1c",
                        "fieldType" : "number",
                        "unit" : "%",
                        "ranges" : [
                            {
                                "minValue" : "",
                                "maxValue" : "5.7",
                                "inRangeInterpretation" : "Normal"
                            },
                            {
                                "minValue" : "5.7",
                                "maxValue" : "6.4",
                                "inRangeInterpretation" : "Prediabetes"
                            },
                            {
                                "minValue" : "6.5",
                                "maxValue" : "",
                                "inRangeInterpretation" : "Diabetes"
                            }
                        ],
                        "value" : "4.2",
                        "interpretation" : "Normal",
                        "isAbnormal" : false
                    }
                ]
            },
            
            "signUrl" : "https://myteleopd.s3.ap-south-1.amazonaws.com/sign-1704356511241.png",
            "uploadedAt" : ISODate("2024-01-04T08:21:51.479+0000")
        }
    ],
    "billNumber" : "24991186",
    "queue" : {
        // "_id" : ObjectId("659665840da0c53c36685fcd"),
        "token" : NumberInt(1909),
        "index" : NumberInt(1704355204),
        "label" : "Scheduled",
        "logs" : [
  
        ]
    },
    "updatedAt" : ISODate("2024-01-04T08:21:51.482+0000"),
  };

const getRandom = (arr) => {
    const n = _.random(0, arr.length - 1);
    return arr[n];
};

const getValue = (name) => {
    const value ={
        HBA1c: getRandom([5.6, 5.0, 4.5, 4.7, 5.3, 4.2, 4.9, 5.1, 4.1, 5.7]),
        'BLOOD GROUP AND Rh TYPE ': getRandom(['A+ve', 'B+ve', 'O+ve']),
        'GLUCOSE RANDOM ': getRandom([90, 93, 102, 108, 120,115 ,123, 135, 139, 140, 95, 97 ]),
        'CREATININE SERUM ': getRandom([0.6, 0.7, 0.8, 0.9, 1.0,1.1, 1.2 ]),
        UREA: getRandom([17.4, 17.6, 17.8, 17.9, 19.4, 20.4, 20.8, 22.2, 22.7, 25.9, 30.9, 35.1, 35.3, 35.9, 40.9, 42.9, 50.0, 52.9, 52.7,  ]),
        'URIC ACID ': getRandom([4.8, 5.2, 5.4, 6.3, 6.5, 6.9, 7.5, 7.9, 8.0,  8.2, 8.5, 8.6]),
        'CHOLESTEROL TOTAL': getRandom([100, 120,130, 110,150, 160, 170, 180, 190]),
        TRIGLYCERIDES: getRandom([10, 20,30, 35,50, 60, 70, 80, 90, 100, 110, 120, 135, 140, 145]),
        'HDL CHOLESTEROL': getRandom([15,17,19,20,21,23,24,25]),
        'VLDL CHOLESTEROL ': getRandom([5.0, 6.0, 7.0 ,8.0, 9.0, 10, 12, 14, 16, 35, 20, 25,28,  ]),
        'LDL CHOLESTEROL ': getRandom([12, 15, 17,19,25, 29, 35, 40, 55, 60, 70, 80, 88, 90, 99   ]),
        'CHOLESTEROL / HDL RATIO ': getRandom([2,3,4,5]),
        'TOTAL BILIRUBIN(REFLECTANCE SPECTROPHOTOMETRY)': getRandom([0.4,0.5,0.6,0.7, 0.8, 0.9, 1,1.2]),
        'DIRECT BILIRUBIN(CALCULATED)': getRandom([0.2, 0.3, 0.4, 0.5]),
        'INDIRECT BILIRUBIN(REFLECTANCE SPECTROPHOTOMETRY)': getRandom([0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]),
        'ASPARTATE TRANSAMINASE (SGOT) (UV WITH P5P)': getRandom([16, 19, 20, 22, 24, 26, 29, 35, 38,40,41]),
        'ALANINE TRANSAMINASE(SGPT) (UV WITH P5P)':  getRandom([16, 19, 20, 22, 24, 26, 29, 35, 38,40,41, 45, 50, 55, 60]),
        'ALKALINE PHOSPHATASE(PNPP)  ': getRandom([35, 38,40,41, 45, 50, 55, 60, 70, 75, 77, 80, 90, 99, 95, 110, 115]),
        'GGT(G-GLUTAMYL-P-NITROANILIDE) ': getRandom([8, 10, 12, 13, 15, 20,]),
        'TOTAL PROTEIN (BIURET)': getRandom([6.6, 6.9, 7.0, 7.2, 7.5, 7.7, 8.0]),
        'ALBUMIN (BROMOCRESOL GREEN)': getRandom([3.5, 3.9, 4.0, 4.2, 4.5, 4.7, 5.0]),
        'GLOBULIN(CALCULATED)': getRandom([2,3,4]),
        'A/G RATIO(CALCULATED)': getRandom([0.8,1.4,2]),
        'VOLUME ': getRandom([3,4,5]),
        'APPEARANCE ': 'Clear',
        'Sp.GRAVITY ': getRandom([1.006,1.008,1.016, 1.018, 1.020, 1.022]),
        'LEUCOCYTES (PUS CELLS) ': 'Negative',
        'NITRATE  ':  'Negative',
        UROBILINOGEN: getRandom([0.3,0.4, 0.5, 0.6, 0.7, 0.9, 1]), 
        PROTEIN: 'Negative', 
        'pH ': getRandom([4.8, 4.9, 6,6.5, 7,7.5]),
        BLOOD: 'Negative',
        'URINE KETONE BODIES': 'Negative',
        'BILIRUBIN ': 'Negative',
        'URINE GLUCOSE': 'Negative',
        ' HIV HUMAN IMMUNO DEFICIENCY VIRUS HIV I + II': 'Negative',
        'HBsAg - Hepatitis B surface antigen': 'Negative',
        'HCV Ab - Hepatitis C virus Antibody': 'Negative',
        'V.D.R.L': 'Non Reactive',
        'MALARIAL PARASITES': 'NEGATIVE',
        'TRIIODOTHYRONINE - T3  ': getRandom([1.54,1.70,2.12,2.21, 2.40]), 
        'THYROXINE - T4 ': getRandom([71.2,75.3,78.2,90.3, 93.5, 103.4, 109.2, 118, 120, 130, 139, 140]),  
        'THYROID STIMULATING HORMONE ': getRandom([0.46, 0.49, 1, 2.5,2.9, 3.0, 3.3, 4.0,4.58]), //0.46 - 4.68
        'HAEMOGLOBIN  (COLORIMETRIC METHOD)': getRandom([12.8, 14.6, 15.2,16.2 ]), //12.8 - 16.4
        'RBC (SHEATH FLOW DC DETECTION)': getRandom([4.2, 4.4, 4.8, 5.1, 5.3, 5.6 ]), //4.2 - 5.6
        'HCT(CALCULATED)': getRandom([41, 42, 46, 48, 49,50 ]), //41 - 50
        'MCV(CALCULATED)': getRandom([81, 83, 86, 90, 92,96, 100 ]), //80 - 100
        'MCH(CALCULATED)': getRandom([27, 29,30, 32]),  //27 - 32
        'MCHC(CALCULATED)': getRandom([32 ,34, 35]), //32 - 35
        'RDW-CV(CALCULATED)': getRandom([11.6 ,12.7, 13.9, 14]), //11.6 - 14
        'PLATELET COUNT(SHEATH FLOW DC DETECTION)': getRandom([150, 160, 200, 450, 400, 300, 320, 370, 250, 280 ]),
        'TOTAL WBC COUNT ': getRandom([4, 6, 7, 9]), //4 - 10
        NEUTROPHILS: getRandom([40, 60,53, 65, 70,]), //40 - 70
        'LYMPHOCYTES ': getRandom([20, 23, 25, 27, 29, 30, 33, 35, 39, 40 ]), // 20 - 40
        'MONOCYTES ': getRandom([2, 3, 5, 7, 9, 10 ]), //2 - 10
        'EOSINOPHILS ':  getRandom([1,2, 3, 5, 6 ]), //1 - 6
        'BASOPHILS  ': getRandom([0 , 1]),
        'PERFORMED : ERYTHROCYTE SEDIMENTATION RATE': '',
        ESR: getRandom([5,8 ,15,19,20]),
        'MAGNESIUM ': getRandom([1.7 ,1.9, 2.1, 2.5 ,2.8]), //1.7 - 2.8
        'C-REACTIVE PROTEIN ': getRandom([0, 1]),
        'IRON  ': getRandom([60,62,64, 68, 70, 80, 90, 100, 108, 112, 120, 140, 145, 155, 170]),
        'FERRITIN ': getRandom([17.9, 50.0, 52.0 ,202.9, 350.5, 400.8, 430.8 ]), //17.9 - 464
    }

    return value[name] || 'Name'
}


const batchRunner = async ({ batch, batchIndex }) => {
  console.log(`index${[batchIndex]}`);
  let i = 0;
  for (const item of batch) {
    console.log(item,'item')
    const {_id, ...rest} = await Patients.findOne({uhid: item}).exec();
    const bill = await Bills.findOne({_id}, { '_id': 1, 'billNumber': 1 });
    console.log(rest.createdAt,'here');

    const data = _.cloneDeep(mock);
    data.patientId = _id;
    data.billId = bill?._id;
    data.billNumber = bill?.billNumber;
    data.updatedAt = new Date(rest._doc.createdAt);
    data.createdAt = new Date(rest._doc.createdAt);
    data.createdBy = getRandom([
        {
          name: "akhila.nagadasi@gmail.com",
          userType: "HCW",
          userId: ObjectId("63cd51fcfb317f2294e067fa"),
        },
        {
          name: "manasaspmanasa@gmail.com",
          userType: "other",
          userId: "65600c8a8c03816b8980f907",
        },
        {
          name: "sandhyasanu0987@gmail.com",
          userType: "other",
          userId: "6562ad4488c55f26e8c2cfc8",
        },
        {
          name: "savithri8247@gmail.com",
          userType: "other",
          userId: "63ddc789b7d6e769579ea55c",
        },
        {
          name: "anjumkottalagi@gmail.com",
          userType: "other",
          userId: "656ec4a89b197928ef90f1c0",
        },
      ]);
      
    for(const package of data.packages){
        package.uploadedAt = new Date(rest._doc.createdAt);
        package.reportUrl = null;
        package.activities = [
                {
                    // "_id" : ObjectId("65966a9f7a0f2156f832576d"),
                    "type" : "APPROVED",
                    "at" : new Date(rest._doc.createdAt),
                    "by" : {
                        "name" : "Dr.Govinda Raju",
                        "userId" : ObjectId("65549c046ee3724edc3ec91e"),
                        "userType" : "DOCTOR"
                    }
                }
            ];
        package.reportData.parameters = (package.reportData.parameters || []).forEach((item)=>({
            ...item,
            value: getValue(item.name)
        }))
    }

    console.log(data, 'hehe')
    // const labItem = new Lab({
    //    ...data
    //   });
    //   await labItem.save();
      
    i = i + 1;  
  }
};

console.log("running ->", data.length);
const batches = _.chunk(data, 20000);
const main = async () => {

  await Promise.all(
    ([[batches[0][0],batches[0][1], batches[0][2], batches[0][3]]]).map((batch, index) =>
      batchRunner({
        batch,
        batchIndex: index,
      })
    )
  );

  console.log("All Done");
};

module.exports = async () => {
  await main();
  console.log("All Done");
};
