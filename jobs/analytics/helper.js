const moment = require("moment");

const getPhlebotomyResponse = ({ screening, existingUpdate }) => {
  if (
    existingUpdate["Phlebotomy Response"] === "Yes" ||
    existingUpdate["Phlebotomy Response"] === "No"
  ) {
    return {
      response: existingUpdate["Phlebotomy Response"],
      filledBy: existingUpdate["Phlebotomy Done By"],
    };
  }
  const labScreening = screening.formsDetails?.find(
    (f) => f.formId === "63b555281d69946e4e49e091"
  );
  if (labScreening) {
    return {
      response: labScreening.results?.labSampleCollectedV2 || "No",
      filledBy: labScreening ? screening.createdBy?.name || "-" : "-",
    };
  } else {
    return {
      response: "No Data",
      filledBy: "-",
    };
  }
};

const getFormStatus = ({
  screening,
  existingUpdate,
  formId,
  filledByKey,
  statusKey,
}) => {
  if (existingUpdate[statusKey] === "Done") {
    return {
      status: existingUpdate[statusKey],
      filledBy: existingUpdate[filledByKey],
      ...(formId === "6389026cc59c8aa15e498ae0" && {
        otologyStatus:
          existingUpdate["Otology Status"] === "Yes" ? "Done" : "Not Done",
      }),
    };
  }
  const healthScreening = screening.formsDetails?.find(
    (f) => f.formId === formId
  );
  if (healthScreening) {
    return {
      status:
        Object.keys(healthScreening.results || {}).length > 0
          ? "Done"
          : "Not Done",
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
    return {
      Status: "Not Done",
      filledBy: "-",
    };
  }
};

exports.screeningForUpdate = ({ screening, existingUpdate: existing }) => {
  const existingUpdate = existing?.updateOne?.update?.$set || {};
  const age = moment().diff(moment(screening.patientId.dob), "years");
  const phlebotomyResponse = getPhlebotomyResponse({
    screening,
    existingUpdate,
  });
  const basicHealth = getFormStatus({
    screening,
    existingUpdate,
    formId: "63b021a27e77bb4d6248b203",
    statusKey: "Basic Health Checkup Status",
    filledByKey: "Basic Health Checkup Done By",
  });
  const optometry = getFormStatus({
    screening,
    existingUpdate,
    formId: "638b2a3c97c0192b1659257d",
    statusKey: "Optometry Status",
    filledByKey: "Optometry Done By",
  });
  const audiometry = getFormStatus({
    screening,
    existingUpdate,
    formId: "6389026cc59c8aa15e498ae0",
    statusKey: "Audiometry Status",
    filledByKey: "Audiometry Done By",
  });
  const newScreening = {
    ...existingUpdate,
    "First Name": screening.patientId?.fName,
    "Last Name": screening.patientId?.lName,
    Gender: screening.patientId?.gender,
    DOB: screening.patientId?.dob,
    Age: age,
    UHID: screening.patientId.uhid,
    "Age Group":
      age < 15
        ? "0-15 Years"
        : age < 20
        ? "15-20 Years"
        : age < 40
        ? "20-40 Years"
        : age < 65
        ? "40-65 Years"
        : "65 years and Above",
    Camp: screening.campId.name,
    Village: screening.campId.villageName,
    Taluka: screening.campId.talukaName,
    "Pin Code": screening.campId.villagePinCode,
    "Work Order Number": screening.campId.programId?.programNumber,
    "Work Order Short Code": screening.campId.programId?.programShortCode,
    "Screening Date": screening.createdAt,
    "Registration Done By": screening.patientId.createdBy,
    "Basic Health Checkup Status": basicHealth.status || "Not Done",
    "Basic Health Checkup Done By": basicHealth.filledBy,
    "Phlebotomy Response": phlebotomyResponse.response || "No Data",
    "Phlebotomy Done By": phlebotomyResponse.filledBy,
    "Audiometry Status": audiometry.status || "Not Done",
    "Audiometry Done By": audiometry.filledBy,
    "Otology Status": audiometry.otologyStatus || "Not Done",
    "Optometry Status": optometry.status || "Not Done",
    "Optometry Done By": optometry.filledBy,
    "Report Generated": screening.patientId.consolidatedReportUrl
      ? "Yes"
      : "No",
    "Report URL": screening.patientId.consolidatedReportUrl || "-",
    "Report Sent At": screening.patientId.consolidatedReportGeneratedAt,
    "Labour Id": screening.patientId.labourId,
  };
  let usersInvolved = [];
  if (
    newScreening["Registration Done By"] &&
    newScreening["Registration Done By"] != "-"
  ) {
    usersInvolved = usersInvolved.concat(newScreening["Registration Done By"]);
  }
  if (
    newScreening["Basic Health Checkup Done By"] &&
    newScreening["Basic Health Checkup Done By"] != "-"
  ) {
    usersInvolved = usersInvolved.concat(
      newScreening["Basic Health Checkup Done By"]
    );
  }
  if (
    newScreening["Phlebotomy Done By"] &&
    newScreening["Phlebotomy Done By"] != "-"
  ) {
    usersInvolved = usersInvolved.concat(newScreening["Phlebotomy Done By"]);
  }
  if (
    newScreening["Optometry Done By"] &&
    newScreening["Optometry Done By"] != "-"
  ) {
    usersInvolved = usersInvolved.concat(newScreening["Optometry Done By"]);
  }
  return {
    updateOne: {
      filter: {
        "Patient Id": screening.patientId?._id,
        campId: screening.campId._id,
      },
      update: {
        $set: { ...newScreening, "Users Involved": usersInvolved },
        $setOnInsert: {
          "Patient Id": screening.patientId?._id,
          campId: screening.campId._id,
        },
      },
      upsert: true,
    },
  };
};

const getLabCompletionTime = (lab) => {
  let completedTime;
  if (
    lab.packages &&
    lab.packages.length > 0 &&
    (lab.packages || []).every((p) => !!p.reportUrl)
  ) {
    lab.packages.forEach((p) => {
      (p.activities || []).forEach((a) => {
        if (
          a.type === "APPROVED" &&
          (!completedTime || moment(a.at).isAfter(moment(completedTime)))
        )
          completedTime = a.at;
      });
    });
  }
  return completedTime;
};

exports.labForUpdate = ({ lab, existingUpdate: existing }) => {
  const existingUpdate = existing?.updateOne?.update?.$set || {};
  const updateTime = getLabCompletionTime(lab);
  const update = {
    "Lab Test Status":
      existingUpdate["Lab Test Status"] === "Completed"
        ? "Completed"
        : (lab.packages || []).every((p) => !!p.reportUrl)
        ? "Completed"
        : "Pending",
    ...(updateTime && { "Lab Result Completion Time": updateTime }),
  };
  return {
    updateOne: {
      filter: { "Patient Id": lab.patientId },
      update: { $set: update, $setOnInsert: { "Patient Id": lab.patientId } },
    },
  };
};

exports.eodForUpdate = ({ patient, existingUpdate: existing }) => {
  const existingUpdate = existing?.updateOne?.update?.$set || {};
  const update = {
    "Sample Collection Time":
      patient.insertedTime || existingUpdate["Sample Collection Time"],
    "Sample Received Time":
      patient.labTime || existingUpdate["Sample Received Time"],
  };

  return {
    updateOne: {
      filter: { "Patient Id": patient.patientId, campId: patient.campId._id },
      update: {
        $set: update,
        $setOnInsert: { "Patient Id": patient.patientId },
      },
    },
  };
};

exports.patientForUpdate = ({ patient }) => {
  const update = {
    "Report Generated": patient.consolidatedReportUrl ? "Yes" : "No",
    "Report URL": patient.consolidatedReportUrl || "-",
    "Report Sent At": patient.consolidatedReportGeneratedAt,
  };

  return {
    updateOne: {
      filter: { "Patient Id": patient._id },
      update: { $set: update },
    },
  };
};
