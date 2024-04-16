const consultationAnalytics = require("../models/analytics.consultations");
const consultationItem = require("../models/consultationitem");
const Camp = require("../models/camps.model");
const moment = require("moment");
const ObjectId = require("mongoose").Types.ObjectId;

const debug = true;

module.exports = async () => {
    console.log('Started Add consultations in analytics');
    const cons = consultationItem
      .aggregate([{"$match":{
        // isProcessed: {"$ne": true}
        _id: ObjectId('661d0269415c4669d1cc100d')
      }}, {
        $lookup: {
          from: "patient_records",
          localField: "patientId",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: {
          path: "$patient",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $unwind: {
          path: "$doctor",
          preserveNullAndEmptyArrays: true,
        },
      }
    ], { allowDiskUse: true })
      .cursor();
    
      for (
        let action = await cons.next();
        true;
        action = await cons.next()
      ) {
        if(!action){
            console.log("last Iteration");
        }else{ 
            try{
            process.stdout.write(".");
            const camp = await Camp.find({ assigningAuthority: action?.patient?.assigningAuthority, screeningStartDate: {
                '$gte':  moment(action.createdAt)
                .startOf("day")
                .toDate(),
                '$lte': moment(action.createdAt)
            .endOf("day")
            .toDate(),
            }}).populate(['assigningAuthority']);
            const currentCamp = camp[0];
            const age = moment().diff(moment(action.patient.dob), "years");
            const results = {
                consultationId: action?._id,
                "Patient Id": action?.patient?._id,
                "First Name": action?.patient?.fName,
                "Last Name": action?.patient?.lName,
                Gender: action?.patient?.gender,
                DOB: action?.patient?.dob,
                Age: age,
                "Age Group": age < 15
                ? "0-15 Years"
                : age < 20
                ? "15-20 Years"
                : age < 40
                ? "20-40 Years"
                : age < 65
                ? "40-65 Years"
                : "65 years and Above",
                UHID: action?.patient?.uhid,
                Camp:  currentCamp?.name  ||undefined,
                campId: currentCamp?._id ||undefined,
                "Labour Id File": action?.patient.labourIdFile,
                "Labour Id": action?.patient.labourId,
                "Labour Document Type": action?.patient?.labourDocumentType,
                "Labour Beneficiary Type": action?.patient?.labourBeneficiaryType,
                "Kyc": action?.patient?.kyc,
                "Kyc Files": action?.patient?.kycFiles,
                "Doctor Name": action?.doctor?.Name,
                "Doctor Id": action?.doctorId,
                prescriptionData: action?.prescriptionData,
                medicines: action?.medicines,
                Village: currentCamp?.villageName,
                Taluka: currentCamp?.talukaName,
                "Sub Division": currentCamp?.subDivision,
                "Pin Code": currentCamp?.villagePinCode,
                assigningAuthority: currentCamp?.assigningAuthority?._id,
                assigningAuthorityName: action?.patient?.assigningAuthority,
                Mobile: action.patient?.mobile,
                consultationCreatedAt: action?.createdAt,
            };
            
            console.log(results,'here')

            if(!debug && currentCamp){
              const newAnalytic = await consultationAnalytics.analyticsModel(results);
              newAnalytic.save();
              await consultationItem.findByIdAndUpdate(
                  action?._id,
                    {"$set" : {isProcessed: true}},
                  { new: true }
                );  
              }
            }catch(e){
                console.log(e,'error')
            }
        }
    }         
}