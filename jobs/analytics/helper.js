const moment = require("moment");

const getCamp = (screenings) => {
  const campMap = screenings.reduce((acc, curr) => {
    if (acc[curr.campId]) {
      acc[curr.campId] = {
        ...acc[curr.campId],
        count: acc[curr.campId].count + 1,
      };
    } else {
      acc[curr.campId] = {
        camp: curr.camp,
        count: 1,
      };
    }
    return acc;
  }, {});
  let max = -1;
  let selectedCamp = null;
  const camps = Object.keys(campMap);
  for (const camp of camps) {
    if (campMap[camp].count > max) {
      max = campMap[camp].count;
      selectedCamp = campMap[camp].camp;
    }
  }
  return selectedCamp;
};

const getPhlebotomyResponse = ({ screening }) => {
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

const getFormStatus = ({ screening, formId, filledByKey, statusKey }) => {
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
      status: "Not Done",
      filledBy: "-",
    };
  }
};

exports.screeningForUpdate = ({ group }) => {
  const screening = group.screenings[0];
  const age = moment().diff(moment(screening.patient.dob), "years");
  const screenings = group.screenings.sort((a, b) =>
    moment(b.createdAt).diff(a.createdAt)
  );
  let phlebotomyResponse = {
    response: "No Data",
    filledBy: "-",
  };
  let basicHealth = {
    status: "Not Done",
    filledBy: "-",
  };
  let optometry = {
    status: "Not Done",
    filledBy: "-",
  };
  let audiometry = {
    status: "Not Done",
    filledBy: "-",
  };
  for (const s of screenings) {
    if (phlebotomyResponse.response === "No Data") {
      phlebotomyResponse = getPhlebotomyResponse({ screening: s });
    }
    if (basicHealth.status === "Not Done") {
      basicHealth = getFormStatus({
        screening: s,
        formId: "63b021a27e77bb4d6248b203",
        statusKey: "Basic Health Checkup Status",
        filledByKey: "Basic Health Checkup Done By",
      });
    }
    if (optometry.status === "Not Done") {
      optometry = getFormStatus({
        screening: s,
        formId: "638b2a3c97c0192b1659257d",
        statusKey: "Optometry Status",
        filledByKey: "Optometry Done By",
      });
    }
    if (audiometry.status === "Not Done") {
      audiometry = getFormStatus({
        screening: s,
        formId: "6389026cc59c8aa15e498ae0",
        statusKey: "Audiometry Status",
        filledByKey: "Audiometry Done By",
      });
    }
  }

  const camp = getCamp(screenings);

  const update = {
    ...(basicHealth.status === "Done" && {
      "Basic Health Checkup Status": basicHealth.status || "Not Done",
      "Basic Health Checkup Done By": basicHealth.filledBy,
    }),
    ...(phlebotomyResponse.response !== "No Data" && {
      "Phlebotomy Response": phlebotomyResponse.response || "No Data",
      "Phlebotomy Done By": phlebotomyResponse.filledBy,
    }),
    ...(audiometry.status === "Done" && {
      "Audiometry Status": audiometry.status || "Not Done",
      "Audiometry Done By": audiometry.filledBy,
      "Otology Status": audiometry.otologyStatus || "Not Done",
    }),
    ...(optometry.status === "Done" && {
      "Optometry Done By": optometry.filledBy,
      "Optometry Status": optometry.status || "Not Done",
    }),
    "Report Generated": screening.patient.consolidatedReportUrl ? "Yes" : "No",
    "Report URL": screening.patient.consolidatedReportUrl || "-",
    "Report Sent At": screening.patient.consolidatedReportGeneratedAt,
    "Report Distributed": screening.patient.isReportDistributed ? "Yes" : "No",
    ...(screening.patient.reportDistributionTime && {
      "Report Distribution Time": screening.patient.reportDistributionTime,
    }),
    "Labour Id": screening.patient.labourId,
  };

  const newScreening = {
    "First Name": screening.patient?.fName,
    "Last Name": screening.patient?.lName,
    Mobile: screening.patient?.mobile,
    Gender: screening.patient?.gender,
    DOB: screening.patient?.dob,
    Age: age,
    UHID: screening.patient.uhid,
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
    Camp: camp.name,
    Village: camp.villageName,
    Taluka: camp.talukaName,
    "Pin Code": camp.villagePinCode,
    "Work Order Number": camp.programId?.programNumber,
    "Work Order Short Code": camp.programId?.programShortCode,
    "Screening Date": screening.createdAt,
    "Registration Done By": screening.patient.createdBy,

    ...(basicHealth.status !== "Done" && {
      "Basic Health Checkup Status": basicHealth.status || "Not Done",
      "Basic Health Checkup Done By": basicHealth.filledBy,
    }),
    ...(phlebotomyResponse.response === "No Data" && {
      "Phlebotomy Response": phlebotomyResponse.response || "No Data",
      "Phlebotomy Done By": phlebotomyResponse.filledBy,
    }),
    ...(audiometry.status !== "Done" && {
      "Audiometry Status": audiometry.status || "Not Done",
      "Audiometry Done By": audiometry.filledBy,
      "Otology Status": audiometry.otologyStatus || "Not Done",
    }),
    ...(optometry.status !== "Done" && {
      "Optometry Done By": optometry.filledBy,
      "Optometry Status": optometry.status || "Not Done",
    }),
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
  if (
    update["Basic Health Checkup Done By"] &&
    update["Basic Health Checkup Done By"] != "-"
  ) {
    usersInvolved = usersInvolved.concat(
      update["Basic Health Checkup Done By"]
    );
  }
  if (update["Phlebotomy Done By"] && update["Phlebotomy Done By"] != "-") {
    usersInvolved = usersInvolved.concat(update["Phlebotomy Done By"]);
  }
  if (update["Optometry Done By"] && update["Optometry Done By"] != "-") {
    usersInvolved = usersInvolved.concat(update["Optometry Done By"]);
  }
  return {
    updateOne: {
      filter: {
        "Patient Id": screening.patient?._id,
      },
      update: {
        $set: { ...update, "Users Involved": usersInvolved },
        $setOnInsert: {
          "Patient Id": screening.patient?._id,
          campId: camp._id,
          ...newScreening,
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
    Barcode: lab.billId.billNumber,
    "Lab Test Status": lab.cleared
      ? "Cleared"
      : existingUpdate["Lab Test Status"] === "Completed"
      ? "Completed"
      : (lab.packages || []).every((p) => !!p.reportUrl)
      ? "Completed"
      : (lab.packages || []).some((p) => !!p.reportData?.parameters.length > 0)
      ? "Processed In Machine"
      : "Pending",
    ...(updateTime && { "Lab Result Completion Time": updateTime }),
    "Lab Clear Reason": lab.clearReason || "-",
  };
  return {
    updateMany: {
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
    "Report Distributed": patient.isReportDistributed ? "Yes" : "No",
    ...(patient.reportDistributionTime && {
      "Report Distribution Time": patient.reportDistributionTime,
    }),
  };

  return {
    updateMany: {
      filter: { "Patient Id": patient._id },
      update: { $set: update },
    },
  };
};

exports.getCamp = getCamp;