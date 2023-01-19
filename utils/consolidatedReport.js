const moment = require("moment");
const { calculateAge } = require('./index');

const test = {

    // page2
    // date: "7 Sep",
    // page-2 blood Pressure section

    // page-2 Temparature section
    // temperature: "96.98",
    // temperatureStatus: "Normal",
    // page-3 Pulse Section

    // recommedations-page-3

    // PAGE-4

    // page-5 copd screeing report
    // subjectId: "717",
    regressionSet: "NA",
    valuesAtBTPS: "",
    deviceId: "NA",
    DeviceSoftwareRef: "NA",
    NoOfBlows: "3",
    NoOfGoodBlows: "3",
    bestFev1Within: "-",
    bestFev6Withing: "-",
    results: [
        {
            parameter: "FEV1 (L)",
            predicted: "4.04",
            test1: "2.28",
            test2: "",
            test3: "",
            best: "2.28",
            pred: "0.56",
        },
        {
            parameter: "FEV6 (L)",
            predicted: "4.73",
            test1: "4.24",
            test2: "",
            test3: "",
            best: "4.24",
            pred: "0.90",
        },
        {
            parameter: "FEV6/FEV6 (ration)",
            predicted: "0.84",
            test1: "0.54",
            test2: "",
            test3: "",
            best: "0.54",
            pred: "0.64",
        },
    ],
    obstructiveIndex: "Mild", // Uppercase must be to shwo at correct index
    copdClassfication: 1,
    lungAge: "76",
    obstructiveIndexPercent: "63",
    interpretation: "Mild COPD indicated",
    // page-6


    recommendations: {
        pureTone: "",
        impediance: "",
        hearingAid: "",
        other: "",
        ent: "",
    },
    // page-7

}

const getBmiStatus = (bmi) => {
    if (bmi < 18) {
        return 'Underweight'
    } else if (bmi <= 18 && bmi < 27) {
        return 'Normal'
    } else if (bmi <= 27 && bmi <= 30) {
        return 'Overweight'
    } else if (bmi > 30) {
        return 'Obase'
    } else {
        return 'Normal'
    }
};

const getFatStatus = (fat) => {
    if (fat < 12) {
        return 'Atheletic'
    } else if (fat <= 12 && fat < 20) {
        return 'Good'
    } else if (fat <= 20 && fat <= 26) {
        return 'Acceptable'
    } else if (fat < 26 && fat <= 29) {
        return 'Overweight'
    } else if (fat > 30) {
        return 'Obase'
    } else {
        return 'Unknown'
    }
};

const getHydrationStatus = (hydration) => {
    if (hydration < 50) {
        return 'Low'
    } else if (hydration <= 50 && hydration < 65) {
        return 'Normal'
    } else if (hydration > 65) {
        return 'Good'
    } else {
        return 'Low'
    }
};

const getBonemassStaus = (value) => {
    if (value < 3.4) {
        return 'Low'
    } else if (value <= 3.4 && value <= 5) {
        return 'Normal'
    } else if (value > 5) {
        return 'Good'
    } else {
        return 'Unknown'
    }
};

const getMusclesStaus = (value) => {
    if (value < 43.1) {
        return 'Low'
    } else if (value <= 43.1 && value <= 56.5) {
        return 'Normal'
    } else if (value > 56.5) {
        return 'Good'
    } else {
        return 'Unknown'
    }
};

const getVFatStaus = (value) => {
    if (value < 13) {
        return 'Good'
    } else if (value >= 13) {
        return 'High'
    } else {
        return 'Unknown'
    }
};


const getMetabolicAgeStaus = (value) => {
    if (value <= 20) {
        return 'Good'
    } else if (value > 20) {
        return 'High'
    } else {
        return 'Unknown'
    }
};

const getSustolicStatus = (value) => {
    if (value < 90) {
        return 'Low'
    } else if (value <= 90 && value < 130) {
        return 'Normal'
    } else if (value <= 130 && value <= 140) {
        return 'Pre-Hyper'
    } else if (value > 140) {
        return 'High'
    } else {
        return 'Unknown'
    }
};

const getDiastolicStatus = (value) => {
    if (value < 60) {
        return 'Low'
    } else if (value <= 60 && value < 90) {
        return 'Normal'
    } else if (value <= 90 && value <= 100) {
        return 'Pre-Hyper'
    } else if (value > 100) {
        return 'High'
    } else {
        return 'Unknown'
    }
};

const getTemperatureStatus = (value) => {
    if (value <= 33 && value <= 37) {
        return 'Normal'
    } else if (value > 37) {
        return 'High'
    } else {
        return 'Unknown'
    }
};


const getSpo2Status = (value) => {
    if (value < 90) {
        return 'Low'
    } else if (value <= 90 && value <= 100) {
        return 'Normal'
    } else if (value > 100) {
        return 'Good'
    } else {
        return 'Unknown'
    }
};

const getPulseStatus = (value) => {
    if (value < 60) {
        return 'Low'
    } else if (value <= 60 && value <= 90) {
        return 'Normal'
    } else if (value > 90) {
        return 'High'
    } else {
        return 'Unknown'
    }
};




const tranformerConsolidatedReportData = ({
    state,
    patient,
    location,
    district,
    resultsObject,
    screeningDate,
}) => {
    const patientData = {
        patientUhid: patient.uhid,
        patientLabourId: patient.labourId,
        patientName: (patient.fName + ' ' + (patient.lName || '')),
        patientGender: patient.gender,
        patientAge: calculateAge(patient.dob),
        patientPhoneNo: patient.mobile,
    }

    const indexPage = {
        doctorConsultation: "1 to 3",
        lungFunction: "4",
        audiomerty: "5",
        vision: "6",
        remain: "7 to End of Report",
    }

    const page2 = {
        location: location || "No Data",
        mrnNo: "-",
        height: resultsObject.Height?.value || resultsObject.Height || '-',
        weight: resultsObject.Weight?.value || resultsObject.Weight || '-',
        bmi: resultsObject?.BMI || '-',
        bmiStatus: getBmiStatus(resultsObject?.BMI),
        hydration: resultsObject?.hydration?.value || resultsObject?.hydration || '-',
        hydrationStatus: getHydrationStatus(resultsObject?.hydration?.value || resultsObject?.hydration),
        fat: resultsObject?.fat?.value || resultsObject?.fat || '-',
        fatStatus: getFatStatus(resultsObject.fat?.value || resultsObject?.fat),
        boneMass: resultsObject?.bonemass?.value || resultsObject?.bonemass || '-',
        boneStatus: getBonemassStaus(resultsObject?.bonemass?.value || resultsObject?.bonemass),
        muscle: resultsObject?.muscle?.value || resultsObject?.muscle || '-',
        muscleStatus: getMusclesStaus(resultsObject?.muscle?.value || resultsObject?.muscle),
        visceralFat: resultsObject?.vFat?.value || resultsObject?.vFat || '-',
        visceralFatStatu: getVFatStaus(resultsObject?.vFat?.value || resultsObject?.vFat,),
        metabolicAge: resultsObject?.Metabolic_Age?.value || resultsObject?.Metabolic_Age || '-',
        metablicStatus: getMetabolicAgeStaus(resultsObject?.Metabolic_Age?.value || resultsObject?.Metabolic_Age),
        systolic: resultsObject?.Systolic_Blood_Pressure?.value || resultsObject?.Systolic_Blood_Pressure || '-',
        systolicStatus: getSustolicStatus(resultsObject?.Systolic_Blood_Pressure?.value || resultsObject?.Systolic_Blood_Pressure),
        diastolic: resultsObject?.Diastolic_Blood_Pressure?.value || resultsObject?.Diastolic_Blood_Pressure || '-',
        diastolicStatus: getDiastolicStatus(resultsObject?.Diastolic_Blood_Pressure?.value || resultsObject?.Diastolic_Blood_Pressure),
        temperature: `${((resultsObject?.Temperature?.value || resultsObject?.Temperature || 0) * 1.8 + 32).toFixed(2)} F`,
        temperatureStatus: getTemperatureStatus(resultsObject?.Temperature?.value || resultsObject?.Temperature),
        pulse: resultsObject?.pulse_bpm?.value || resultsObject?.pulse_bpm,
        pulseStatus: getPulseStatus(resultsObject?.pulse_bpm?.value || resultsObject?.pulse_bpm),
        oxygenSat: resultsObject?.Spo2?.value || resultsObject?.Spo2,
        oxygenSatStatus: getSpo2Status(resultsObject?.Spo2?.value || resultsObject?.Spo2),
    }
    const page3 = {
        bmiRecommendation: resultsObject?.Bmi_Recommendation || "No recommendations",
        fatRecommendation: resultsObject?.Fat_Recommendation || "No recommendations",
        muslceRecommendation: resultsObject?.Muslce_Recommendation || "No recommendations",
        hydrationRecommendation: resultsObject?.Hydration_Recommendation || "No recommendations",
        bonemassRecommendation:
            resultsObject?.Bonemass_Recommendation || "No recommendations",
        metabloicRangeRecommendation:
            resultsObject?.Metabloic_Range_Recommendation || "No recommendations",
        visceralFatRecommendation:
            resultsObject?.Visceral_Fat_Recommendation || "No recommendations",
        metabolicAgeRecommendation:
            resultsObject?.Metabolic_Age_Recommendation || "No recommendations",
        muscleQualityScoreRecommendation:
            resultsObject?.Muscle_Quality_Score_Recommendation || "No recommendations",
        systolicRecommendation:
            resultsObject?.Systolic_Recommendation || "No recommendations",
        diastolicRecommendation: resultsObject?.Diastolic_Recommendation || "No recommendations",
        pulseRecommendation: resultsObject?.Pulse_Recommendation || "No recommendations",
    }

    const page4 = {
        stethoscopyResults: [
            ...(resultsObject?.Heart ? [resultsObject?.Heart] : []),
            ...(resultsObject?.Lung ? [resultsObject?.Lung] : []),
            ...(resultsObject?.Abdomen ? [resultsObject?.Abdomen] : []),
        ],
        dermascopyResult: (resultsObject?.uvcData || []).map(item => item.comment),
    };

    const page5 = {

    }

    const page6 = {
        provisionalDiagnosis: resultsObject?.Audiometry_Provisional_Diagnosis,
        isHearingScreeningDone: resultsObject?.Is_Audiometry_Done_ || 'No',
        leftEar: {
            "500Hz": resultsObject?.Left_Freq_500_Hz || "N",
            "1000Hz": resultsObject?.Left_Freq_1_KHZ || "N",
            "2000Hz": resultsObject?.Left_Freq_2_KHZ || "N",
            "4000Hz": resultsObject?.Left_Freq_4_KHZ || "N",
        },
        rightEar: {
            "500Hz": resultsObject?.Right_Freq_500_Hz || "N",
            "1000Hz": resultsObject?.Right_Freq_1_KHZ || "N",
            "2000Hz": resultsObject?.Right_Freq_2_KHZ || "N",
            "4000Hz": resultsObject?.Right_Freq_4_KHZ || "N",
        },
        screeingAddress: location,
        screenDate: moment(screeningDate).format('lll')
    }

    const page7 = {
        district,
        state: state || "Karnataka",
        eyeExamination: resultsObject?.External_Eye_Examination || "Normal",
        visualAcuity: {
            RE: resultsObject?.Visual_Acuity__RE || "6",
            LE: resultsObject?.Visual_Acuity__LE || "6",
        },
        prescription: {
            re: {
                sph: resultsObject?.RE_Spherical || 0,
                cyl: resultsObject?.RE_Cylindrical || 0,
                axis: resultsObject?.Re_Addition || 0,
                add: resultsObject?.RE_Axis || 0,
            },
            le: {
                sph: resultsObject?.LE_Spherical || 0,
                cyl: resultsObject?.LE_Cylindrical || 0,
                axis: resultsObject?.LE_Addition || 0,
                add: resultsObject?.LE_Axis || 0,
            },
        },
        diagnosis: resultsObject?.Occular_Findings || '',
    }

    return {
        ...indexPage,
        ...resultsObject,
        ...test,
        date: moment().format('ll'),
        ...page2,
        ...page3,
        ...page4,
        ...page6,
        ...page7,
        ...patientData
    }

}
module.exports = {
    tranformerConsolidatedReportData,
}
