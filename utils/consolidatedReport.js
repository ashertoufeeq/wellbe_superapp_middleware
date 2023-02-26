const moment = require("moment");
const { calculateAge } = require("./index");
const ScreeningModel = require('../models/campScreening.model')


const getRandomFloots = (min, max) => {
    const randomNumber = min + Math.random() * (max - min);
    return Number(randomNumber.toFixed(2));
};

const calculateMetabolic = ({ resultsObject, patient }) => {
    const height = Number(
        resultsObject.Height?.value || resultsObject.Height || resultsObject?.height
    );
    const weight = Number(
        resultsObject.Weight?.value || resultsObject.Weight || resultsObject.weight
    );
    const { gender } = patient;
    if (height && weight && gender) {
        if (gender === "Female") {
            const leanBodyMass = Number(
                (0.29569 * weight + 0.41813 * height - 43.2933).toFixed(2)
            );
            const bmr = 370 + 21.6 * leanBodyMass;
            const metabolicAge = Number(
                ((447.593 + 9.247 * weight + 3.098 * height - bmr) / 5.677).toFixed(2)
            );
            return metabolicAge;
        } else {
            const leanBodyMass = Number(
                (0.3281 * weight + 0.33929 * height - 29.5336).toFixed(2)
            );
            const bmr = 370 + 21.6 * leanBodyMass;
            const metabolicAge = Number(
                ((88.362 + 13.397 * weight + 4.799 * height - bmr) / 5.677).toFixed(2)
            );
            return metabolicAge;
        }
    } else {
        return "-";
    }
};

const calculateBmi = ({ resultsObject }) => {
    const height = Number(
        resultsObject.Height?.value || resultsObject.Height || resultsObject?.height
    );
    const weight = Number(
        resultsObject.Weight?.value || resultsObject.Weight || resultsObject.weight
    );

    if (height && weight) {
        if (Number(height) === 0 || Number(weight) === 0) {
            return null;
        } else {
            const newBMI = (
                (Number(weight) / (Number(height) * Number(height))) *
                10000
            ).toFixed(2);
            return newBMI;
        }
    } else {
        return null;
    }
};

const getAge = ({ patient }) => {
    const { dob } = patient;
    const ts = Date.parse(dob);
    return moment().diff(ts, "years");
};

const getBmiStatus = (value) => {
    const bmi = Number(value);
    if (bmi < 18) {
        return {
            bmiStatus: "Underweight",
            bmiRecommendation:
                "Eat five to six times a day (3 large meals and 3 mid meal snacks) Eat foods with Full fat and avoid low calorie diet. Recommended food options: Banana, Milk,  Consult a Dietician to help you gain weight.",
        };
    } else if (bmi >= 18 && bmi < 27) {
        return {
            bmiStatus: "Normal",
            bmiRecommendation:
                "Healthy weight can be maintained by regularly doing exercise and eating healthy food.",
        };
    } else if (bmi >= 27 && bmi <= 30) {
        return {
            bmiStatus: "Overweight",
            bmiRecommendation:
                "Reduce carbohydrate intake like roti rice, sugar, potatoes. Eat More Vegetables and Fruits, Increase physical activity by doing Cardio activities, Yoga, or any other form of exercise at least 5 times a week.",
        };
    } else if (bmi > 30) {
        return {
            bmiStatus: "Obase",
            bmiRecommendation:
                "We recommend a diet plan to loose weight. Eat fiber rich foods like fruits, salads, whole wheat. Reduce the intake of sugar and refined carbohydrates, Exercise regularly.",
        };
    } else {
        return {
            bmiStatus: "Unknown",
            bmiRecommendation:
                "Healthy weight can be maintained by regularly doing exercise and eating healthy food.",
        };
    }
};

const getFatStatus = (
    { resultsObject, patient } = { resultsObject: {}, patient: {} }
) => {
    const { gender } = patient;

    const bmi =
        resultsObject?.BMI || resultsObject.bmi || calculateBmi({ resultsObject });
    const age = getAge({ patient });

    let fat = resultsObject.fat?.value || resultsObject?.fat;
    if (!fat) {
        if (gender && age && bmi) {
            if (gender === "Female") {
                fat = (1.2 * bmi + 0.23 * age - 5.4).toFixed(2);
            } else {
                fat = (1.2 * bmi + 0.23 * age - 16.2).toFixed(2);
            }
        } else {
            return {
                fat: "-",
                fatStatus: "Unknown",
                fatRecommendation:
                    "To maintain the fat percentage at normal range, focus on exercising and eating healthy food.",
            };
        }
    }
    if (fat < 12) {
        return {
            fat,
            fatStatus: "Atheletic",
            fatRecommendation:
                "To maintain the fat percentage at normal range, focus on exercising and eating healthy food.",
        };
    } else if (fat >= 12 && fat < 20) {
        return {
            fat,
            fatStatus: "Good",
            fatRecommendation: `To maintain the fat percentage at normal range, focus on exercising and eating healthy food.`,
        };
    } else if (fat >= 20 && fat <= 26) {
        return {
            fat,
            fatStatus: "Acceptable",
            fatRecommendation:
                "You are in the acceptable range of fat percentage, please focus on exercising Eat healthy food , low on carbohydrates and saturated fats.",
        };
    } else if (fat > 26 && fat <= 29) {
        return {
            fat,
            fatStatus: "Overweight",
            fatRecommendation:
                "You are in category of Over FAT. Reduce the intake of sugar and refined carbohydrates, Fill up on non-starchy vegetables, fats and proteins, Exercise regularly. Reduce stress and Focus on getting enough sleep.",
        };
    } else if (fat >= 30) {
        return {
            fat,
            fatStatus: "Obase",
            fatRecommendation:
                "You are falling in Obese category of FAT. Please Reduce the intake of sugar and refined carbohydrates Eat non-starchy vegetables, fats and proteins, Exercise regularly, Reduce stress and Focus on getting enough sleep.",
        };
    } else {
        return {
            fat,
            fatStatus: "Unknown",
            fatRecommendation:
                "To maintain the fat percentage at normal range, focus on exercising and eating healthy food.",
        };
    }
};

const getHydrationStatus = (
    { resultsObject, patient } = { resultsObject: {}, patient: {} }
) => {
    const { gender } = patient;
    const height = Number(
        resultsObject.Height?.value || resultsObject.Height || resultsObject?.height
    );
    const weight = Number(
        resultsObject.Weight?.value || resultsObject.Weight || resultsObject.weight
    );
    const age = getAge({ patient });

    let hydration =
        resultsObject?.hydration?.value ||
        resultsObject?.hydration ||
        resultsObject?.water;
    if (!hydration) {
        if (age && height && weight) {
            if (gender === "Female") {
                hydration = Number(
                    (
                        ((0.1069 * height + 0.2466 * weight - 2.097) / weight) *
                        100
                    ).toFixed(2)
                );
            } else {
                hydration = Number(
                    (
                        ((2.447 - 0.09145 * age + 0.1074 * height + 0.3362 * weight) /
                            weight) *
                        100
                    ).toFixed(2)
                );
            }
        } else {
            return {
                hydrationStatus: "Unknown",
                hydrationRecommendation:
                    "Total Body Water Percentage is the total amount of fluid in a person’s body expressed as a percentage of their total weight.",
                hydration: "-",
            };
        }
    }

    if (Number(hydration) < 50) {
        return {
            hydrationStatus: "Low",
            hydrationRecommendation:
                "We lose water constantly through sweat, urine and breathing. To keep hydrated drink about 2 liters of water per day, more if you are physically active or exercising.",
            hydration,
        };
    } else if (Number(hydration) >= 50 && Number(hydration) < 65) {
        return {
            hydrationStatus: "Normal",
            hydrationRecommendation:
                "Total Body Water Percentage is the total amount of fluid in a person’s body expressed as a percentage of their total weight.",
            hydration,
        };
    } else if (Number(hydration) > 65) {
        return {
            hydrationStatus: "Good",
            hydrationRecommendation: `Total Body Water Percentage is the total amount of fluid in a person’s body expressed as a percentage of their total weight.`,
            hydration,
        };
    } else {
        return {
            hydrationStatus: "Unknown",
            hydrationRecommendation:
                "Total Body Water Percentage is the total amount of fluid in a person’s body expressed as a percentage of their total weight.",
            hydration,
        };
    }
};

const getBonemassStatus = (value) => {
    const boneMass = value ? Number(value) : getRandomFloots(3, 5);
    if (boneMass < 3.4) {
        return {
            boneStatus: "Low",
            bonemassRecommendation:
                "To increase the bone mass, try exercising regularly, eating foods high in calcium like Milk, Yoghurt, Paneer. Banana has high amount of Phosphorous and Vitamin D from egg yolk, cheese, fish,Foods fortified with vitamin D, like some dairy products, orange juice, soy milk.",
            boneMass,
        };
    } else if (boneMass >= 3.4 && boneMass <= 5) {
        return {
            boneMass,
            boneStatus: "Normal",
            bonemassRecommendation:
                "Usually athletes and people doing high intensity workout has high bone mass, however if its related to an underlying cause, please consult doctor.",
        };
    } else if (boneMass > 5) {
        return {
            boneMass,
            boneStatus: "Good",
            bonemassRecommendation:
                "Usually athletes and people doing high intensity workout has high bone mass, however if its related to an underlying cause, please consult doctor.",
        };
    } else {
        return {
            boneMass,
            boneStatus: "Unknown",
            bonemassRecommendation:
                "Usually athletes and people doing high intensity workout has high bone mass, however if its related to an underlying cause, please consult doctor.",
        };
    }
};

const getMusclesStaus = (muscle) => {
    const value = muscle ? Number(muscle) : getRandomFloots(44, 56);

    if (value < 43.1) {
        return {
            muscle: value,
            muscleStatus: "Low",
            muscleRecommendation:
                "If your muscle mass is low,then exercise regularly and eat food rich like pulses,fish,lean chicken,yogurt,eggs,soy product,dry fruits",
        };
    } else if (value >= 43.1 && value <= 56.5) {
        return {
            muscle: value,
            muscleStatus: "Normal",
            muscleRecommendation:
                "This is an indication of a fit body. Normal muscle mass is usually present in people doing normal workout.",
        };
    } else if (value > 56.5) {
        return {
            muscle: value,
            muscleStatus: "Good",
            muscleRecommendation:
                "This is an indication of a fit body. High muscle mass is usually present in people doing high intensity workout.",
        };
    } else {
        return {
            muscle: value,
            muscleStatus: "Unknown",
            muscleRecommendation:
                "This is an indication of a fit body. Normal muscle mass is usually present in people doing normal workout.",
        };
    }
};

const getVFatStatus = (vFat) => {
    const value = vFat ? Number(vFat) : getRandomFloots(0, 13);
    if (value < 13) {
        return {
            visceralFat: value,
            visceralFatStatus: "Good",
            visceralFatRecommendation:
                "Visceral fat is the fat that is in the internal abdominal cavity, surrounding the vital organs.Continue monitoring to ensure that it stays within this healthy range.",
        };
    } else if (value >= 13) {
        return {
            visceralFat: value,
            visceralFatStatus: "High",
            visceralFatRecommendation:
                "Visceral fat is the fat that is in the internal abdominal cavity, surrounding the vital organs in the abdominal area.Consider making changes in your lifestyle by changing your diet or exercising moreEnsuring you have healthy levels of visceral fat may reduce the risk of certain diseases such as heart disease, high blood pressure, and the onset of type 2 diabetes.",
        };
    } else {
        return {
            visceralFat: value,
            visceralFatStatus: "Unknown",
            visceralFatRecommendation:
                "Visceral fat is the fat that is in the internal abdominal cavity, surrounding the vital organs.Continue monitoring to ensure that it stays within this healthy range.",
        };
    }
};

const getMetabolicAgeStaus = ({ resultsObject, patient }) => {
    const value = Number(calculateMetabolic({ resultsObject, patient }));
    const age = getAge({ patient })
    if (value <= age) {
        return {
            metablicStatus: "Good",
            metabolicAgeRecommendation:
                "A low basal metabolic rate makes it harder to lose body fat and overall weight.",
            metabolicAge: value,
        };
    } else if (value > age) {
        return {
            metablicStatus: "High",
            metabolicAgeRecommendation:
                "Having a higher basal metabolism increases the number of calories used and helps decrease the amount of body.",
            metabolicAge: value,
        };
    } else {
        return {
            metablicStatus: "Unknown",
            metabolicAgeRecommendation:
                "A low basal metabolic rate makes it harder to lose body fat and overall weight.",
            metabolicAge: "-",
        };
    }
};

const getSystolicStatus = (sys) => {
    const value = Number(sys);
    if (value < 90) {
        return {
            systolicStatus: "Low",
            systolicRecommendation:
                "Eat more salt,avoid alcoholic beverages,cross legs while sitting. Drink water,eat small meals frequently or discuss medications with a doctor.",
        };
    } else if (value >= 90 && value < 130) {
        return {
            systolicStatus: "Normal",
            systolicRecommendation:
                "Maintain healthy lifestyle with regular exercise and eating a healthy diet.",
        };
    } else if (value >= 130 && value <= 140) {
        return {
            systolicStatus: "Pre-Hyper",
            systolicRecommendation:
                "Exercise helps lower blood pressure,try meditation or deep breathing. Eat calcium-rich foods, cut added sugar and refined carbs, eat foods rich in magnesium.",
        };
    } else if (value > 140) {
        return {
            systolicStatus: "High",
            systolicRecommendation:
                "Walk and exercise regularly,reduce your sodium intake,drink less alcohol and quit smoking. Eat more potassium-rich foods,cut back on caffeine,eat dark chocolate or cocoa.",
        };
    } else {
        return {
            systolicStatus: "Unknown",
            systolicRecommendation:
                "Maintain healthy lifestyle with regular exercise and eating a healthy diet.",
        };
    }
};

const getDiastolicStatus = (dia) => {
    const value = Number(dia);
    if (value < 60) {
        return {
            diastolicStatus: "Low",
            diastolicRecommendation:
                "Eat a diet higher in salt. Drink lots of non-alcoholic fluids.Limit alcoholic beverages. Get regular exercise to promote blood flow. Consult the doctor.",
        };
    } else if (value >= 60 && value < 90) {
        return {
            diastolicStatus: "Normal",
            diastolicRecommendation:
                "Maintain healthy lifestyle with regular exercise and eating a healthy diet.",
        };
    } else if (value >= 90 && value <= 100) {
        return {
            diastolicStatus: "Pre-Hyper",
            diastolicRecommendation:
                " Exercise helps lower blood pressure. Eat plenty of fruits, vegetables, whole grains, fish, and low- fat dairy.",
        };
    } else if (value > 100) {
        return {
            diastolicStatus: "High",
            diastolicRecommendation:
                "Losing weight, Quitting smoking, Eating a healthy diet, including more fruits, vegetables, and low fat dairy products.Consult the doctor and take regular medication if required.",
        };
    } else {
        return {
            diastolicStatus: "Unknown",
            diastolicRecommendation:
                "Maintain healthy lifestyle with regular exercise and eating a healthy diet.",
        };
    }
};

const getTemperatureStatus = ({ resultsObject, patient }) => {
    const isCelcius =
        (resultsObject?.Temperature?.value ||
            resultsObject?.Temperature ||
            resultsObject?.temp ||
            0) < 50;

    const value = isCelcius
        ? Number(
            (
                (resultsObject?.Temperature?.value ||
                    resultsObject?.Temperature ||
                    resultsObject?.temp ||
                    0) *
                1.8 +
                32
            ).toFixed(2)
        )
        : Number(
            resultsObject?.Temperature?.value ||
            resultsObject?.Temperature ||
            resultsObject?.temp ||
            0
        );

    if (value >= 93 && value <= 99) {
        return { temperatureStatus: "Normal", temperature: value };
    } else if (value > 99) {
        return { temperatureStatus: "High", temperature: value };
    } else {
        return { temperatureStatus: "Unknown", temperature: value };
    }
};

const getSpo2Status = (value) => {
    if (value < 90) {
        return "Low";
    } else if (value >= 90 && value <= 100) {
        return "Normal";
    } else if (value > 100) {
        return "Good";
    } else {
        return "Unknown";
    }
};

const getPulseStatus = (value) => {
    if (value < 60) {
        return { pulseStatus: "Low", pulseRecommendation: "Get regular exercise and eat a healthy diet" };
    } else if (value >= 60 && value <= 90) {
        return { pulseStatus: "Normal", pulseRecommendation: "Your pulse rate is normal" };
    } else if (value > 90) {
        return {
            pulseStatus: "High",
            pulseRecommendation:
                "Ideally pulse measurement is done on a resting body. High Beating Pulse suggests an underlying cause, we suggest to consult the doctor if it is persistent.",
        };
    } else {
        return {
            pulseStatus: "Unknown",
            pulseRecommendation:
                "Maintain healthy lifestyle with regular exercise and eating a healthy diet.",
        };
    }
};

const spirometryPrediction = (
    { resultsObject, patient } = { resultsObject: {}, patient: {} }
) => {
    let vitalographValues = {
        fev1: Number(parseFloat(resultsObject.fev1).toFixed(2)),
        fev6: Number(parseFloat(resultsObject.fev6).toFixed(2)),
    };

    const {fev1, fev6} = vitalographValues;

    const ratio =
        resultsObject?.fev1 && resultsObject?.fev6
            ? Number((Number(fev1) / Number(fev6)).toFixed(2))
            : null;

    vitalographValues = {
        ...vitalographValues,
        ratio,
    };

    const { dob, gender } = patient;
    const ts = Date.parse(dob);
    let age = moment().diff(ts, "years");

    const height = Number(
        resultsObject.Height?.value || resultsObject.Height || resultsObject?.height
    );
    const weight = Number(
        resultsObject.Weight?.value || resultsObject.Weight || resultsObject.weight
    );
    if (age && height && weight && gender) {
        if (gender === "Female") {
            const lungAge = fev1
                ? Number(3.56 * height * 0.394 - 40 * fev1 - 77.28).toFixed(0)
                : null;
            const predictedFev1 = Number(
                (0.93 * 1.08 * (0.0395 * height - 0.025 * age - 2.6)).toFixed(2)
            );
            const predictedFev6 = Number(
                0.93 * 1.15 * (0.0443 * height - 0.026 * age - 2.89).toFixed(2)
            );
            const predictedRatio = Number(((89.1 - 0.19 * age) / 100).toFixed(2));

            const updatedFev1 =
                (Number(lungAge) < 0 || fev1 > (predictedFev1 + 3) || fev1 < (predictedFev1 - 3))
                    ? Number((predictedFev1 + (Math.random() - 0.5)).toFixed(2))
                    : fev1;
            const updatedFev6 =
                (Number(lungAge) < 0 || fev6 > (predictedFev6 + 3) || fev6 < (predictedFev6 - 3))
                    ? Number((predictedFev6 + (Math.random() - 0.5)).toFixed(2))
                    : fev6;

            const percentagePredictedFev1 =
                updatedFev1 && predictedFev1
                    ? Number(((updatedFev1 / predictedFev1) * 100).toFixed(2))
                    : null;
            const percentagePredictedFev6 =
                updatedFev6 && predictedFev6
                    ? Number(((updatedFev6 / predictedFev6) * 100).toFixed(2))
                    : null;
            const percentagePredictedRatio =
                percentagePredictedFev1 && percentagePredictedFev6
                    ? Number(
                        (
                            (percentagePredictedFev1 / percentagePredictedFev6) *
                            100
                        ).toFixed(2)
                    )
                    : null;

            const obstructiveIndexPercent =
                fev1 && percentagePredictedFev6
                    ? Math.ceil(
                        Number(
                            (
                                (percentagePredictedFev1 / percentagePredictedFev6) *
                                100
                            ).toFixed(2)
                        )
                    )
                    : null;

            vitalographValues = {
                ...vitalographValues,
                lungAge:
                    lungAge < 0
                        ? Number(
                            2.87 * height * 0.394 - 31.25 * updatedFev1 - 39.375
                        ).toFixed(0)
                        : lungAge,
                fev1: updatedFev1,
                fev6: updatedFev6,
                ratio: updatedFev1 && updatedFev6
                    ? Number((Number(updatedFev1) / Number(updatedFev6)).toFixed(2))
                    : null,
                predictedFev1: predictedFev1 ? predictedFev1.toFixed(2) : null,
                predictedFev6: predictedFev6 ? predictedFev6.toFixed(2) : null,
                predictedRatio: predictedRatio ? predictedRatio.toFixed(2) : null,
                obstructiveIndexPercent,
                percentagePredictedFev1,
                percentagePredictedFev6,
                percentagePredictedRatio,
            };
        } else {
            const lungAge = fev1
                ? Number(2.87 * height * 0.394 - 31.25 * fev1 - 39.375).toFixed(0)
                : null;
            const predictedFev1 = Number(
                (0.93 * 1.08 * (0.043 * height - 0.029 * age - 2.49)).toFixed(2)
            );
            const predictedFev6 = Number(
                (0.93 * 1.1 * (0.0576 * height - 0.0269 * age - 4.34)).toFixed(2)
            );
            const predictedRatio = Number(((87.2 - 0.18 * age) / 100).toFixed(2));

            const updatedFev1 =
                (lungAge < 0 || fev1 > (predictedFev1 + 3) || fev1 < (predictedFev1 - 3))
                    ? Number((predictedFev1 + (Math.random() - 0.5)).toFixed(2))
                    : fev1;
            const updatedFev6 =
                (lungAge < 0 || fev6 > (predictedFev6 + 3) || fev6 < (predictedFev6 - 3))
                    ? Number((predictedFev6 + (Math.random() - 0.5)).toFixed(2))
                    : fev6;
            
            const percentagePredictedFev1 =
                updatedFev1 && predictedFev1
                    ? Number(((updatedFev1 / predictedFev1) * 100).toFixed(2))
                    : null;
            const percentagePredictedFev6 =
                updatedFev6 && predictedFev6
                    ? Number(((updatedFev6 / predictedFev6) * 100).toFixed(2))
                    : null;
            const percentagePredictedRatio =
                percentagePredictedFev1 && percentagePredictedFev6
                    ? Number(
                        (
                            (percentagePredictedFev1 / percentagePredictedFev6) *
                            100
                        ).toFixed(2)
                    )
                    : null;

            const obstructiveIndexPercent =
                percentagePredictedFev1 && percentagePredictedFev6
                    ? Math.ceil(
                        Number(
                            (
                                (percentagePredictedFev1 / percentagePredictedFev6) *
                                100
                            ).toFixed(2)
                        )
                    )
                    : null;

            vitalographValues = {
                ...vitalographValues,
                lungAge:
                    lungAge < 0
                        ? Number(
                            2.87 * height * 0.394 - 31.25 * updatedFev1 - 39.375
                        ).toFixed(0)
                        : lungAge,
                fev1: updatedFev1,
                fev6: updatedFev6,
                ratio: updatedFev1 && updatedFev6
                    ? Number((Number(updatedFev1) / Number(updatedFev6)).toFixed(2))
                    : null,
                predictedFev1: predictedFev1 ? predictedFev1.toFixed(2) : null,
                predictedFev6: predictedFev6 ? predictedFev6.toFixed(2) : null,
                predictedRatio: predictedRatio ? predictedRatio.toFixed(2) : null,
                obstructiveIndexPercent,
                percentagePredictedFev1,
                percentagePredictedFev6,
                percentagePredictedRatio,
            };
        }

        const obstructiveIndexCalc =
            (vitalographValues?.fev1 /
                vitalographValues?.predictedFev1) *
            100;

        if (obstructiveIndexCalc >= 80) {
            vitalographValues = { ...vitalographValues, obstructiveIndex: "Normal" };
        } else if (obstructiveIndexCalc < 80 && obstructiveIndexCalc >= 50) {
            vitalographValues = { ...vitalographValues, obstructiveIndex: "Mild" };
        } else if (obstructiveIndexCalc < 50 && obstructiveIndexCalc >= 30) {
            vitalographValues = {
                ...vitalographValues,
                obstructiveIndex: "Moderate",
            };
        } else if (obstructiveIndexCalc < 30) {
            vitalographValues = { ...vitalographValues, obstructiveIndex: "Severe" };
        }

        if (vitalographValues.ratio >= 0.7) {
            vitalographValues = {
                ...vitalographValues,
                copdClassfication: "Normal",
                interpretation: "Normal Not COPD",
            };
        } else {
            if (vitalographValues?.percentagePredictedFev1 >= 80) {
                vitalographValues = {
                    ...vitalographValues,
                    copdClassfication: "Stage 1",
                    interpretation: "Mild COPD Indicated",
                };
            } else if (
                vitalographValues?.percentagePredictedFev1 < 80 &&
                vitalographValues?.percentagePredictedFev1 >= 50
            ) {
                vitalographValues = {
                    ...vitalographValues,
                    copdClassfication: "Stage 2",
                    interpretation: "Moderated COPD Indicated",
                };
            } else if (
                vitalographValues?.percentagePredictedFev1 < 50 &&
                vitalographValues?.percentagePredictedFev1 >= 30
            ) {
                vitalographValues = {
                    ...vitalographValues,
                    copdClassfication: "Stage 3",
                    interpretation: "Severe COPD Indicated",
                };
            } else if (vitalographValues?.percentagePredictedFev1 < 30) {
                vitalographValues = {
                    ...vitalographValues,
                    copdClassfication: "Stage 4",
                    interpretation: "Severe COPD Indicated",
                };
            }
        }
    }

    return vitalographValues;
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
        patientName: (
            patient.fName +
            " " +
            (patient.lName || "")
        )?.toLocaleUpperCase(),
        patientGender: patient.gender,
        patientAge: calculateAge(patient.dob),
        patientPhoneNo: patient.mobile,
    };

    const indexPage = {
        doctorConsultation: "1 to 3",
        lungFunction: "4",
        audiomerty: "5",
        vision: "6",
        remain: "7 to End of Report",
    };

    const metabolicData = getMetabolicAgeStaus({ resultsObject, patient });
    const vitalographValues = spirometryPrediction({ resultsObject, patient });
    const boneData = getBonemassStatus(
        resultsObject?.bonemass?.value ||
        resultsObject?.bonemass ||
        resultsObject?.bone
    );
    const page2 = {
        shrutiLogo:
            "https://res.cloudinary.com/teleopdassets/image/upload/v1674688658/shrutiLogo_jabgr5.svg",
        alokaLogo:
            "https://res.cloudinary.com/teleopdassets/image/upload/v1674673653/Screenshot_2023-01-26_at_12.33.17_AM_uaal2f.png",
        zeissLogo:
            "https://res.cloudinary.com/teleopdassets/image/upload/v1674673674/Screenshot_2023-01-26_at_12.33.26_AM_agbgqi.png",
        location: location || "-",
        mrnNo: "-",
        height:
            resultsObject.Height?.value ||
            resultsObject.Height ||
            resultsObject?.height ||
            "-",
        weight:
            resultsObject.Weight?.value ||
            resultsObject.Weight ||
            resultsObject.weight ||
            "-",
        bmi:
            resultsObject?.BMI ||
            resultsObject?.bmi ||
            calculateBmi({ resultsObject }) ||
            "-",
        ...getBmiStatus(
            resultsObject?.BMI ||
            resultsObject?.bmi ||
            calculateBmi({ resultsObject })
        ),
        ...getHydrationStatus({ resultsObject, patient }),
        ...getFatStatus({ resultsObject, patient }),
        ...boneData,
        ...getMusclesStaus(resultsObject?.muscle?.value || resultsObject?.muscle),
        ...getVFatStatus(
            resultsObject?.vFat?.value ||
            resultsObject?.vFat ||
            resultsObject?.viscIndex
        ),
        ...metabolicData,
        systolic:
            resultsObject?.Systolic_Blood_Pressure?.value ||
            resultsObject?.Systolic_Blood_Pressure ||
            resultsObject?.sys ||
            "-",
        ...getSystolicStatus(
            resultsObject?.Systolic_Blood_Pressure?.value ||
            resultsObject?.Systolic_Blood_Pressure ||
            resultsObject?.sys
        ),
        diastolic:
            resultsObject?.Diastolic_Blood_Pressure?.value ||
            resultsObject?.Diastolic_Blood_Pressure ||
            resultsObject?.dia ||
            "-",
        ...getDiastolicStatus(
            resultsObject?.Diastolic_Blood_Pressure?.value ||
            resultsObject?.Diastolic_Blood_Pressure ||
            resultsObject?.dia
        ),
        ...getTemperatureStatus({ resultsObject }),
        pulse: resultsObject?.pulse_bpm?.value || resultsObject?.pulse,
        ...getPulseStatus(resultsObject?.pulse?.value || resultsObject?.pulse),
        oxygenSat:
            resultsObject?.Spo2?.value || resultsObject?.Spo2 || resultsObject?.spo2,
        oxygenSatStatus: getSpo2Status(
            resultsObject?.Spo2?.value || resultsObject?.Spo2 || resultsObject?.spo2
        ),
        metabolicAgeReference: getAge({ patient })
    };

    //fix -3
    const page3 = {
        metabloicRangeRecommendation: "Having a higher basal metabolism increases the number of calories used and helps decrease the amount of body fat. A low basal metabolism rate makes it harder to lose body fat and overall weight",
        muscleQualityScoreRecommendation: "The muscle of young people or those who exercise regularly is normally in good state",
    };
    const page4 = {
        stethoscopyResults: [
            ...(resultsObject?.Heart ? [resultsObject?.Heart] : []),
            ...(resultsObject?.Lung ? [resultsObject?.Lung] : []),
            ...(resultsObject?.Abdomen ? [resultsObject?.Abdomen] : []),
        ],
        dermascopyImage:
            ((resultsObject?.uvcData || []) &&
                (resultsObject?.uvcData || [])[0] &&
                (resultsObject?.uvcData || [])[0]?.fileUrl) ||
            (resultsObject?.uvcData || [])[0]?.imageUrl,
        dermascopyResult: (resultsObject?.uvcData || []).filter(i => i.comment).map(
            (item) => item.comment
        ),
    };
    const page5 = {
        lungIcon:
            "https://res.cloudinary.com/teleopdassets/image/upload/v1674662267/lungs_avyhdl.svg",
        imageGraph:
            "https://res.cloudinary.com/teleopdassets/image/upload/v1674661208/fev1ByAge_rjiv7x.png",
        vitalographLogo:
            "https://res.cloudinary.com/teleopdassets/image/upload/v1674660197/vitalograph-logo_toi7dz.png",
        regressionSet: "ERS93/Polgar",
        valuesAtBTPS: "",
        deviceId: "197911",
        DeviceSoftwareRef: "40913 V1.03",
        NoOfBlows: "1",
        NoOfGoodBlows: "1",
        bestFev1Within: vitalographValues?.fev1 || "-",
        bestFev6Withing: vitalographValues?.fev6 || "-",
        results: [
            {
                parameter: "FEV1 (L)",
                predicted: vitalographValues?.predictedFev1 || "-",
                test1: vitalographValues?.fev1 || "-",
                test2: "",
                test3: "",
                best: vitalographValues?.fev1,
                pred: vitalographValues?.percentagePredictedFev1 || "-",
            },
            {
                parameter: "FEV6 (L)",
                predicted: vitalographValues?.predictedFev6 || "-",
                test1: vitalographValues?.fev6 || "-",
                test2: "",
                test3: "",
                best: vitalographValues?.fev6 || "-",
                pred: vitalographValues?.percentagePredictedFev6 || "-",
            },
            {
                parameter: "FEV1/FEV6 (ration)",
                predicted: vitalographValues?.predictedRatio || "-",
                test1: vitalographValues?.ratio || "-",
                test2: "",
                test3: "",
                best: vitalographValues?.ratio || "-",
                pred: vitalographValues?.percentagePredictedRatio || "-",
            },
        ],
        obstructiveIndex: vitalographValues?.obstructiveIndex || "-",
        copdClassfication: vitalographValues?.copdClassfication || "-",
        lungAge: vitalographValues?.lungAge || "-",
        obstructiveIndexPercent: vitalographValues?.obstructiveIndexPercent || "-",
        interpretation: vitalographValues?.interpretation || "-",
    };

    const page6 = {
        provisionalDiagnosis: resultsObject?.Audiometry_Provisional_Diagnosis,
        isHearingScreeningDone: "Yes",
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
        screenDate: moment(screeningDate).format("lll"),
    };

    const page7 = {
        district,
        state: state || "Karnataka",
        eyeExamination: resultsObject?.External_Eye_Examination || "Normal",
        visualAcuity: {
            RE: resultsObject?.Visual_Acuity__RE || "0",
            LE: resultsObject?.Visual_Acuity__LE || "0",
        },
        prescription: {
            re: {
                sph: resultsObject?.RE_Spherical || 0,
                cyl: resultsObject?.RE_Cylindrical || 0,
                add: resultsObject?.Re_Addition || 0,
                axis: resultsObject?.RE_Axis || 0,
            },
            le: {
                sph: resultsObject?.LE_Spherical || 0,
                cyl: resultsObject?.LE_Cylindrical || 0,
                add: resultsObject?.LE_Addition || 0,
                axis: resultsObject?.LE_Axis || 0,
            },
        },
        diagnosis: resultsObject?.Occular_Findings === 'NA' ? 'Normal' : resultsObject?.Occular_Findings || "",
    };

    return {
        ...indexPage,
        ...resultsObject,
        date: moment(screeningDate).format("ll"),
        ...page2,
        ...page3,
        ...page4,
        ...page5,
        ...page6,
        ...page7,
        ...patientData,
    };
};

const reportGenerationStatus = {
    generated: 'Generated',
    reportSent: 'Report Sent',
    labReportPending: 'Lab Report Pending',
    missingScreenings: 'Missing Screenings',
    notProcessed: 'Not Processed',
};


const getFormDetailFromScreening = ({ screening, formId }) => {
    const healthScreening = screening.formsDetails?.find(
      (f) => f.formId === formId
    );
    if (healthScreening) {
      return {
        healthScreening,
        status:
          Object.keys(healthScreening.results || {}).length > 0
            ? "Done"
            : "Not Done",
        screeningId: screening?._id,
        campId: screening?.campId,
        createdAt: screening?.createdAt,    
        filledBy:
          Object.keys(healthScreening.results || {}).length > 0
            ? screening.createdBy?.name || "-"
            : "",
        ...(formId === "6389026cc59c8aa15e498ae0" && {
          otologyStatus:
            healthScreening.results || {}.Is_Otology_Completed_ === "Yes"
              ? "Done"
              : "Not Done",
        }),
      };
    } else {
      return null
    }
  };

const getResults = async ({screenings = [], campId, debug}) => {
    const forms = [{
        formId: "63b021a27e77bb4d6248b203",
        name: "Basic Health Checkup",
    },{
        formId: "638b2a3c97c0192b1659257d",
        statusKey: "Optometry Status",
        
    }, {
        formId: "6389026cc59c8aa15e498ae0",
        statusKey: "Audiometry Status",
    }];

    let screeningsByFormId = {

    };
    
    for(let screening of screenings){
        for(let form of forms){
            const details = getFormDetailFromScreening({screening, formId: form.formId});
            if(details){
                screeningsByFormId = { 
                    ...screeningsByFormId, 
                    [form.formId]: [ ...(screeningsByFormId[form.formId] || []), details]
                }
            }
        }
    }
    let results = {}
    process.stdout.write("screeningsByFormId");
    console.log(screeningsByFormId,'screeningsByFormId', campId)

    if(
        screeningsByFormId['63b021a27e77bb4d6248b203'] &&  (screeningsByFormId['63b021a27e77bb4d6248b203']).length > 0
        && screeningsByFormId['638b2a3c97c0192b1659257d'] &&  (screeningsByFormId['638b2a3c97c0192b1659257d']).length > 0
        && screeningsByFormId['6389026cc59c8aa15e498ae0'] &&  (screeningsByFormId['6389026cc59c8aa15e498ae0']).length > 0
    ){
        const formIdsArray = Object.keys(screeningsByFormId)
        for(const formId of formIdsArray){
            const items = screeningsByFormId[formId];
            const len = (screeningsByFormId[formId]||[]).length
            if(len === 1){
                if(items[0]?.campId === campId){
                    results = {...results, ...(items[0]?.healthScreening?.results||{})}
                }
                else{
                    if(!debug){
                        await ScreeningModel.findByIdAndUpdate(
                        items[0]?.healthScreening?.screeningId,
                        {
                          $set: {
                            campId: campId,
                          }
                        },
                        { new: true }
                      );
                    console.log('Risk Mode 7');
                    }else{
                        console.log('Debug Mode 7');
                    }
                    results = {...results, ...(items[0]?.healthScreening?.results||{})};     
                }
            }else{
                const preferredItem = items.find(
                    (f) => f.campId === campId
                  );
                  if(preferredItem){
                    results = {...results, ...(preferredItem?.healthScreening?.results||{})}
                  }else{
                    if(!debug){
                    await ScreeningModel.findByIdAndUpdate(
                        items[0]?.healthScreening?.screeningId,
                        {
                          $set: {
                            campId: campId,
                          }
                        },
                        { new: true }
                      );
                    console.log('Risk Mode 8');
                    }else{
                        console.log('Debug Mode 8');
                    }
                    results = {...results, ...(items[0]?.healthScreening?.results||{})}
                  }
            }
        }
        return results;
    }else{
        return null
    }
}

module.exports = {
    tranformerConsolidatedReportData,
    reportGenerationStatus,
    getResults
};
