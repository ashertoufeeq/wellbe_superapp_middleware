const ScreeningModel = require("../models/campScreening.model");
const Patient = require("../models/patientRecord");
const moment = require("moment");
const { getCamp } = require("../jobs/analytics/helper");

const timezone = "Asia/Kolkata";

module.exports = async () => {
  console.log("Patient Fetching");
  let fieldsToUpdate = [];
  let patientIds = [];
  const patientsCursor = Patient.aggregate(
    [
      {
        $match: {
          consolidatedReportUrl: { $exists: true },
          $or: [
            {
              consolidatedReportGeneratedAt: { $exists: false },
            },
            {
              consolidatedReportSentAt: { $exists: false },
            },
            {
              consolidatedReportStatus: { $exists: false },
            },
          ],
        },
      },
      {
        "$project": {
            _id:"$_id",
            consolidatedReportGeneratedAt: "$consolidatedReportGeneratedAt", 
            consolidatedReportSentAt: "$consolidatedReportSentAt", 
            consolidatedReportStatus: "$consolidatedReportStatus" 
        }
    }
    ],
    {
      allowDiskUse: true,
      cursor: {
        batchSize: 40000,
      },
    }
  ).cursor();

  for(
    let action  = await patientsCursor.next(); 
    true;
    action = await patientsCursor.next()){
        
      if(!action){
          console.log(fieldsToUpdate);
          const res = await Patient.bulkWrite(fieldsToUpdate);
          console.log(res, patientIds, '======');
          console.log('Done!!!');
          break;
        }

        const screenings = await ScreeningModel.aggregate([
            {
              $match: {
                $or: [
                  {
                    createdAt: {
                      $gte: moment()
                        .subtract(365, "days")
                        .startOf("day")
                        .toDate(),
                    },
                  },
                  {
                    updatedAt: {
                      $gte: moment()
                        .subtract(365, "days")
                        .startOf("day")
                        .toDate(),
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                patient: {
                  $toObjectId: "$patientId",
                },
                camp: {
                  $toObjectId: "$campId",
                },
              },
            },
            {
              $match: {
                patient: action._id,
              },
            },
            {
              $lookup: {
                from: "patient_records",
                localField: "patient",
                foreignField: "_id",
                as: "patient",
              },
            },
            {
              $unwind: {
                path: "$patient",
                includeArrayIndex: "string",
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $lookup: {
                from: "camps",
                localField: "camp",
                foreignField: "_id",
                as: "camp",
              },
            },
            {
              $unwind: {
                path: "$camp",
                includeArrayIndex: "string",
                preserveNullAndEmptyArrays: false,
              },
            },
          ]);
    
    const camp = getCamp(screenings);

    if((screenings||[]).some(item => item.campId !== (camp._id).toString())){
        console.log((camp._id).toString(),'----', screenings[0]?.campId);
        const screeningsToBeUpdated = [];
        for(const screening of screenings){
            screeningsToBeUpdated.push({ 
                updateOne : {
                   filter: { 
                    _id: screening?._id 
                    },
                   update: {
                    "$set":{
                            campId: camp?._id    
                        }
                    },
                }
             })
        }
        console.log('----', screeningsToBeUpdated);
        const r = await ScreeningModel.bulkWrite(screeningsToBeUpdated);
        console.log('----', r, '----');
    }

    const {
        _id, 
        consolidatedReportSentAt, 
        consolidatedReportGeneratedAt, 
     }  = action;
    
    let obj = {
        consolidatedReportStatus: 'Report Sent'
    };
    
    if((!consolidatedReportSentAt || !consolidatedReportGeneratedAt) && screenings && screenings[0]){
        const dateToBeUpdated = moment(screenings[0].createdAt).add('5','days').toISOString();
        console.log(dateToBeUpdated, screenings[0].createdAt);

        obj = { 
            ...obj,
            consolidatedReportCampId: camp?._id, 
            ...(consolidatedReportGeneratedAt?
                {}
                :{consolidatedReportGeneratedAt: consolidatedReportSentAt || dateToBeUpdated}),
            ...(consolidatedReportSentAt?
                    {}
                    :{consolidatedReportSentAt: consolidatedReportGeneratedAt || dateToBeUpdated}),
        };
    }

    fieldsToUpdate.push({
        updateOne : {
            filter: { 
             _id 
             },
            update: {
             "$set": obj
         }
    }}); 

    patientIds.push(_id);
    if(fieldsToUpdate.length === 300){
        console.log(fieldsToUpdate);
        const res = await Patient.bulkWrite(fieldsToUpdate);
        console.log(res, patientIds, '======');
        fieldsToUpdate = [];        
        patientIds = [];
    }
  }
};


