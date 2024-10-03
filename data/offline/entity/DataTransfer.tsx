import { Storage } from "@ionic/storage";
import {
  followup,
  getActTaskData,
  getUserData,
  insertChemicalsUsedForPest,
  postPestActivity,
  submitFollowupFeedback,
  taskInit,
  submitRecommendations,
  submitWorkDoneDetail,
} from "../../apidata/taskApi/taskDataApi";
import { getCurrentLocation } from "../../providers/GeoLocationProvider";
import { Network } from "@capacitor/network";
import { API_BASE_URL } from "../../baseUrl";
import { submitTechnicianData } from "../../apidata/technicianData/idealTechnicianData";
import { formatDateTime, getDateTime } from "../../../utils/dateTimeUtils";
import { toZonedTime, format } from "date-fns-tz";
import { toast } from "react-toastify";

let storage: Storage;

const formatToUaeTime = (dateTime: any) => {
  const uaeTimeZone = "Asia/Dubai";
  const zonedTime = toZonedTime(dateTime, uaeTimeZone);
  return format(zonedTime, "yyyy-MM-dd HH:mm:ss");
};

export const initStorage = async () => {
  storage = new Storage();
  await storage.create();
};

enum task_tx_steps {
  taskStart = 1,
  attendance,
  startTravel,
  endTravel,
  pestActivity,
  chemsUsed,
  recommendations,
  workDone,
  feedbackFollowup,
  Paused,
  Resumed,
}
// Call this function in your app initialization
initStorage();

// // ==================retrieveNetworkService===========
// export const retrieveNetworkService = async (serviceRequestStatus: any) => {
//   console.log("otx-service-Request", serviceRequestStatus);
//   if (storage) {
//     await storage.set("otx-service-Request", serviceRequestStatus);
//   } else {
//     console.error("Storage instance is not initialized");
//   }
// };

// export const retrieveStartandEnd = async (serviceRequestStatus: any) => {
//   console.log(`otx-${serviceRequestStatus.status}-Request`, serviceRequestStatus);
//   if (storage) {
//     const key = `otx-${serviceRequestStatus.status}-Request`;
//     await storage.set(key, serviceRequestStatus);
//   } else {
//     console.error("Storage instance is not initialized");
//   }
// };

// export const retrievepestActivity = async (
//   formDataArray: any[],
//   pestOptions: any[],
//   latitude: number,
//   longitude: number
// ) => {
//   const pestActivityData = formDataArray.map((item) => ({
//     is_pest_found: item.is_pest_found,
//     pest_report_type: item.pest_report_type,
//     pest_severity: item.pest_severity,
//     pest_area: item.pest_area,
//     pest_photo: item.pest_photo,
//     sub_service_id: item.sub_service_id,
//     latitude,
//     longitude,
//   }));

//   console.log("otx-pest-activity-", pestActivityData);
//   if (storage) {
//     await storage.set("otx-PestActivity-" , pestActivityData);
//   } else {
//     console.error("Storage instance is not initialized");
//   }

//   return {
//     response: { ok: true }, // or your actual response
//     data: pestActivityData,
//   };
// };

export const retrieveChemicalUsed = async (chemicalDataArray: any[]) => {
  console.log("otx-ChemicalUsed", chemicalDataArray);
  if (storage) {
    await storage.set("otx-ChemicalUsed", chemicalDataArray);
  } else {
    console.error("Storage instance is not initialized");
  }

  return {
    response: { ok: true }, // or your actual response
    data: chemicalDataArray,
  };
};

export const retrieveRecommendation = async (recommDataArray: any[]) => {
  console.log("otx-retrieveRecommendation", recommDataArray);
  if (storage) {
    await storage.set("otx-retrieveRecommendation", recommDataArray);
  } else {
    console.error("Storage instance is not initialized");
  }

  return {
    response: { ok: true }, // or your actual response
    data: recommDataArray,
  };
};

export const retrieveworkdone = async (formDataArray: any[]) => {
  console.log("otx-retrieveworkdone", formDataArray);
  if (storage) {
    await storage.set("otx-retrieveworkdne", formDataArray);
  } else {
    console.error("Storage instance is not initialized");
  }
  return {
    response: { ok: true }, // or your actual response
    data: formDataArray,
  };
};

export const retrieveFeedbackFollowUp = async (requestBody: any) => {
  try {
    if (storage) {
      // Store the feedback follow-up data in storage
      await storage.set("otx-feedbackFollowupData", requestBody);
    } else {
      console.error("Storage instance is not initialized");
    }

    // Assuming you also want to return the saved data
    return {
      response: { ok: true },
      data: requestBody, // Return the stored data
    };
  } catch (error) {
    console.error("Failed to store feedback follow-up data:", error);
    return { response: { ok: false } };
  }
};

export const submitTaskStart = async (
  taskId: string,
  timestamp: string,
  log_type: string,
  tracking_type: string
) => {
  try {
    // GET NW STATUS
    let nwStatus = await Network.getStatus();
    console.log("NETWORK OVERALL STATUS = ", nwStatus);
    let anyOtxPending = await anyUpSyncPending();
    // If online
    if (nwStatus.connected && !anyOtxPending) {
      const { response, data } = await taskInit(
        taskId,
        timestamp,
        log_type,
        tracking_type
      );
      // if (data.status != "200"){

      //   throw new Error("Error in Submitting the Data. Please contact your Supervisor or Admin.")
      // }
      return { response, data };
    } else {
      //If offline
      // Store the Payload
      const pos = await getCurrentLocation();
      if (!pos) {
        console.error("Error fetching Location");
        throw new Error("Failed to fetch Location");
      }
      let requestBody = [
        {
          visit_id: taskId,
          log_type: log_type, //Service Request Start,Track Travel Time Start,Track Travel Time End
          tracking_type: tracking_type, //Service Initiated,Start,Stop
          date_time: timestamp,
          latitude: "" + pos.coords.latitude,
          longitude: "" + pos.coords.longitude,
        },
      ];
      if (storage) {
        // Store the feedback follow-up data in storage
        await storage.set("otx-task-start-" + taskId, requestBody);
      } else {
        console.error("Storage instance is not initialized");
      }
      // Update the status in task-details
      // a. Fetch the task detail array
      let taskDetArray = await storage.get("md-task-details");
      // b. retrive the task id obj and update
      for (let index = 0; index < taskDetArray.length; index++) {
        let taskObj = taskDetArray[index];
        if (taskObj.id === taskId) {
          taskObj.service_status = "On Going";
          taskDetArray[index] = taskObj;
          await storage.set("md-task-details", taskDetArray);
          break;
        }
      }

      // Update the status in task-list
      // a. Fetch the task list array
      let taskListArray = await storage.get("md-task-list");
      // b. retrive the task id obj and update
      for (let index = 0; index < taskListArray.length; index++) {
        let taskObj = taskListArray[index];
        if (taskObj.id === taskId) {
          taskObj.service_status = "On Going";
          taskListArray[index] = taskObj;
          await storage.set("md-task-list", taskListArray);
          break;
        }
      }

      // Update the task_initiation in task-visit-exec-v2
      let taskVisitExecArray = await storage.get(
        "md-get-visit-execution-details"
      );
      for (let index = 0; index < taskVisitExecArray.length; index++) {
        let taskObj = taskVisitExecArray[index];
        if (taskObj.visit_id === taskId) {
          let taskStartObj = {
            visit_id: taskId,
            log_type: "Service Request Start",
            tracking_type: "Service Initiated",
            date_time: timestamp, // TODO: check for date time format
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          taskObj.task_initiation = [taskStartObj]; // use push for travel start and travel end
          taskVisitExecArray[index] = taskObj;
          await storage.set(
            "md-get-visit-execution-details",
            taskVisitExecArray
          );
          break;
        }
      }
      addTaskIDToOtxTasks(taskId);
      addOtxToOtxSeq(taskId, task_tx_steps.taskStart);
      let response = { ok: 200 };
      let data = { is_chemicals_required: false };
      return { response, data };
    }
  } catch (error) {
    console.error("Failed to submit or store submitTaskStart:", error);
    return { response: { ok: false } };
  }
};

const addTaskIDToOtxTasks = async (taskId: string) => {
  // add to otx-tasks-executed if its not in the array
  let otxTasksExecuted = await storage.get("otx-tasks-executed");
  if (!otxTasksExecuted) {
    otxTasksExecuted = [];
  }
  if (!otxTasksExecuted.includes(taskId)) {
    // push in to array
    otxTasksExecuted.push(taskId);
  }
  await storage.set("otx-tasks-executed", otxTasksExecuted);
};

const addOtxToOtxSeq = async (taskId: string, tx: number) => {
  // Update offline tx sequence
  let otxSeq = await storage.get("otx-seq-" + taskId);
  if (!otxSeq) {
    otxSeq = [];
  }
  otxSeq.push(tx); // use enum
  await storage.set("otx-seq-" + taskId, otxSeq);
};

export const anyUpSyncPending = async () => {
  // Add conditions as required
  // Cond: if any otx pending for up sync
  let otxTasksExecuted = await storage.get("otx-tasks-executed");
  if (otxTasksExecuted && otxTasksExecuted.length > 0) {
    return true;
  }
  return false;
};

interface Technician {
  first_name: string;
  last_name: string;
  mobile_no: string;
  avatar?: string;
  user_id: string;
}

//////////////// team Attendence //////////////////

const submitTechincianDataOnline = async (
  baseImage: any,
  selectedTechnicianData: Technician[],
  latitude: number,
  longitude: number
) => {
  try {
    // You can perform any necessary preprocessing here before calling submitTechnicianData

    // Call submitTechnicianData from imported module
    // Store updatedSelectedTechnicianData in local storage

    await submitTechnicianData(
      baseImage,
      selectedTechnicianData,
      latitude,
      longitude
    );

    // Handle any post-processing if needed

    console.log("Technician data submitted successfully.");
  } catch (error) {
    console.error("Error submitting technician data:", error);
    // Handle the error appropriately, e.g., show a user-friendly message
  }
};

const saveTeamAttendenceToDB = async (
  visit_id: string,
  baseImage: any,
  updatedSelectedTechnicianData: any,
  latitude: number,
  longitude: number
) => {
  if (storage) {
    const visit_team = updatedSelectedTechnicianData.map((technician: any) => ({
      user_id: technician.user_id,
      user_image: technician.avatar || "",
      first_name: technician.first_name,
      mobile_no: technician.mobile_no,
    }));
    const payload = [
      {
        visit_id, //Required
        team_count: updatedSelectedTechnicianData.length.toString(), //Required
        latitude,
        longitude,
        team_photo: baseImage ? baseImage : "",
        visit_team,
      },
    ];
    await storage.set("otx-teamAttendance-" + visit_id, payload);
    console.log(
      "teamAttendance data has been successfully stored in Ionic Storage:",
      updatedSelectedTechnicianData
    );
  } else {
    console.error("Storage instance is not initialized");
  }
  // =================get-visit-execution-details==============
  let taskVisitExecArray = await storage.get("md-get-visit-execution-details");
  console.log("taskVisitExecArray", taskVisitExecArray);
  for (let index = 0; index < taskVisitExecArray.length; index++) {
    let taskObj = taskVisitExecArray[index];
    const visit_team = updatedSelectedTechnicianData.map((technician: any) => ({
      user_id: technician.user_id,
      user_image: technician.avatar || "",
      first_name: technician.first_name,
      mobile_no: technician.mobile_no,
    }));
    if (taskObj.visit_id === visit_id) {
      let taskStartObj = {
        visit_id, //Required
        team_count: updatedSelectedTechnicianData.length.toString(), //Required
        latitude,
        longitude,
        team_photo: baseImage ? baseImage : "",
        visit_team,
      };
      if (taskObj.team) {
        taskObj.team.push(taskStartObj);

        console.log("Data Pushing to Team ");
      } else {
        taskObj.team = [taskStartObj]; // use push for travel start and travel end
      }

      taskVisitExecArray[index] = taskObj;
      await storage.set("md-get-visit-execution-details", taskVisitExecArray);
      console.log(taskVisitExecArray);
      break;
    }
  }
  addTaskIDToOtxTasks(visit_id);
  addOtxToOtxSeq(visit_id, task_tx_steps.attendance);
};

export const submitTeamAttendenceBasedOnNetwork = async (
  taskId: string,
  updatedSelectedTechnicianData: Technician[],
  latitude: number,
  longitude: number,
  baseImage: any
) => {
  console.log("retrieveTeamAttendenceBasedOnNetwork: Start ");
  // GET Network STATUS
  let nwStatus = await Network.getStatus();
  console.log("NETWORK OVERALL STATUS = ", nwStatus);

  // Initialize Ionic Storage
  await storage.create();
  let anyOtxPending = await anyUpSyncPending();
  if (nwStatus.connected && !anyOtxPending) {
    // Online: Submit data to API
    console.log("retrieveTeamAttendenceBasedOnNetwork: ONLINE ");
    return submitTechincianDataOnline(
      baseImage,
      updatedSelectedTechnicianData,
      latitude,
      longitude
    );
  } else {
    // Offline: Store data locally
    console.log("retrieveTeamAttendenceBasedOnNetwork: OFFLINE ");
    await saveTeamAttendenceToDB(
      taskId,
      baseImage,
      updatedSelectedTechnicianData,
      latitude,
      longitude
    );
  }
};

export const submitTravelStartTime = async (
  taskId: string,
  timestamp: string,
  log_type: string,
  tracking_type: string
) => {
  try {
    // GET NETWORK STATUS
    let nwStatus = await Network.getStatus();
    console.log("NETWORK OVERALL STATUS = ", nwStatus);

    // Fetch current location
    const pos = await getCurrentLocation();
    if (!pos) {
      console.error("Error fetching Location");
      throw new Error("Failed to fetch Location");
    }

    // Prepare the request body
    let requestBody = [
      {
        visit_id: taskId,
        log_type: log_type, // Example: Track Travel Time Start
        tracking_type: tracking_type, // Example: Start
        date_time: formatToUaeTime(timestamp),
        latitude: "" + pos.coords.latitude,
        longitude: "" + pos.coords.longitude,
      },
    ];
    let anyOtxPending = await anyUpSyncPending();
    // If online and no offline md download or no otx pending to sync up
    if (nwStatus.connected && !anyOtxPending) {
      const { response, data } = await taskInit(
        taskId,
        timestamp,
        log_type,
        tracking_type
      );
      return { response, data };
    } else {
      // If offline, store the payload locally
      if (storage) {
        await storage.set("otx-Start-TrackTime-" + taskId, requestBody);
      } else {
        console.error("Storage instance is not initialized");
      }
      // Update the task_initiation in task-visit-exec-v2
      let taskVisitExecArray = await storage.get(
        "md-get-visit-execution-details"
      );
      for (let index = 0; index < taskVisitExecArray.length; index++) {
        let taskObj = taskVisitExecArray[index];
        if (taskObj.visit_id === taskId) {
          let taskStartObj = {
            visit_id: taskId,
            log_type: log_type,
            tracking_type: tracking_type,
            date_time: timestamp, // TODO: check for date time format
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          if (taskObj.task_initiation) {
            taskObj.task_initiation.push(taskStartObj);
          } else {
            taskObj.task_initiation = [taskStartObj]; // use push for travel start and travel end
          }

          taskVisitExecArray[index] = taskObj;
          await storage.set(
            "md-get-visit-execution-details",
            taskVisitExecArray
          );
          break;
        }
      }
      addTaskIDToOtxTasks(taskId);
      addOtxToOtxSeq(taskId, task_tx_steps.startTravel);
    }
  } catch (error) {
    console.error("Failed to submit start time:", error);
    return { response: { ok: false } };
  }
};

export const submitTravelEndTime = async (
  taskId: string,
  timestamp: string,
  log_type: string,
  tracking_type: string
) => {
  try {
    // GET NETWORK STATUS
    let nwStatus = await Network.getStatus();
    console.log("NETWORK OVERALL STATUS = ", nwStatus);

    // Fetch current location
    const pos = await getCurrentLocation();
    if (!pos) {
      console.error("Error fetching Location");
      throw new Error("Failed to fetch Location");
    }

    // Prepare the request body
    let requestBody = [
      {
        visit_id: taskId,
        log_type: log_type, // Example: Track Travel Time End
        tracking_type: tracking_type, // Example: Stop
        date_time: formatToUaeTime(timestamp),
        latitude: "" + pos.coords.latitude,
        longitude: "" + pos.coords.longitude,
      },
    ];
    let anyOtxPending = await anyUpSyncPending();
    // If online
    if (nwStatus.connected && !anyOtxPending) {
      const { response, data } = await taskInit(
        taskId,
        timestamp,
        log_type,
        tracking_type
      );
      return { response, data };
    } else {
      // If offline, store the payload locally
      if (storage) {
        await storage.set("otx-End-TrackTime-" + taskId, requestBody);
      } else {
        console.error("Storage instance is not initialized");
      }
      // Update the task_initiation in task-visit-exec-v2
      let taskVisitExecArray = await storage.get(
        "md-get-visit-execution-details"
      );
      for (let index = 0; index < taskVisitExecArray.length; index++) {
        let taskObj = taskVisitExecArray[index];
        if (taskObj.visit_id === taskId) {
          let taskStartObj = {
            visit_id: taskId,
            log_type: log_type,
            tracking_type: tracking_type,
            date_time: timestamp, // TODO: check for date time format
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          if (taskObj.task_initiation) {
            taskObj.task_initiation.push(taskStartObj);
          } else {
            taskObj.task_initiation = [taskStartObj]; // use push for travel start and travel end
          }

          taskVisitExecArray[index] = taskObj;
          await storage.set(
            "md-get-visit-execution-details",
            taskVisitExecArray
          );
          break;
        }
      }
      addTaskIDToOtxTasks(taskId);
      addOtxToOtxSeq(taskId, task_tx_steps.endTravel);
    }
  } catch (error) {
    console.error("Failed to submit end time:", error);
    return { response: { ok: false } };
  }
};

/// ==========================SaveData  in offline===============================

const savePestActivityDatatoApi = async (
  pest_found_details: any,
  latitude: number,
  longitude: number,
  visit_id: string
) => {
  return await postPestActivity(
    pest_found_details,
    latitude,
    longitude,
    visit_id
  );
};

// ===============saveData in online================

export const savePestActivityDataToBD = async (
  formDataArray: any,
  latitude: number,
  longitude: number,
  visit_id: string
) => {
  const pest_found_details = formDataArray.map((item: any) => ({
    is_pest_found: item.is_pest_found === "Yes" ? "Yes" : "No",
    sub_service_id: item.sub_service_id || "",
    pest_severity: item.pest_severity,
    pest_area: item.pest_area,
    pest_reported_id: item.pest_report_id, // Use the pest_report_id from formDataArray
    pest_photo: item.pest_photo,
    // pest_report_type: item.pest_report_type,
  }));

  if (storage) {
    const payload = [
      {
        pest_found_details, // Include the array of pest details
        latitude,
        longitude,
        visit_id,
      },
    ];

    console.log("Payload in pest activity found", payload);

    await storage.set("otx-pestData-" + visit_id, payload);
  } else {
    console.error("Storage instance is not initialized");
  }

  // =================get-visit-execution-details update==============
  let taskVisitExecArray = await storage.get("md-get-visit-execution-details");
  console.log("taskVisitExecArray", taskVisitExecArray);

  for (let index = 0; index < taskVisitExecArray.length; index++) {
    let taskObj = taskVisitExecArray[index];

    if (taskObj.visit_id === visit_id) {
      if (!taskObj.pests_found) {
        taskObj.pests_found = [];
      }
      const pest_found_details = formDataArray.map((item: any) => ({
        is_pest_found: item.is_pest_found === "Yes" ? "Yes" : "No",
        sub_service_id: item.sub_service_id || "",
        pest_severity: item.pest_severity,
        pest_area: item.pest_area,
        pest_reported_id: item.pest_report_id, // Use the pest_report_id from formDataArray
        pest_photo: item.pest_photo,
        pest_report_type: item.pest_report_type,
      }));

      pest_found_details.forEach((pestDetail: any) => {
        const taskStartObj = {
          visit_id, // Required
          ...pestDetail, // Include each pest detail
        };
        taskObj.pests_found.push(taskStartObj);
      });

      taskVisitExecArray[index] = taskObj;
      await storage.set("md-get-visit-execution-details", taskVisitExecArray);
      console.log(taskVisitExecArray[index]);
      break;
    }
  }
  addTaskIDToOtxTasks(visit_id);
  addOtxToOtxSeq(visit_id, task_tx_steps.pestActivity);
};

// =======================saveData checking online/offline========================
export const savePestActivityBasedOnNetwork = async (
  pest_found_details: any,
  latitude: number,
  longitude: number,
  visit_id: string
) => {
  console.log("Retrieve Pest Activity Based On Network: Start");

  try {
    // Get network status
    let nwStatus = await Network.getStatus();
    console.log("Network overall status:", nwStatus);

    // Initialize Ionic Storage
    await storage.create();
    let anyOtxPending = await anyUpSyncPending();
    if (nwStatus.connected && !anyOtxPending) {
      // Online: Fetch data from API
      console.log("Online mode - Fetching data from API");
      const data = await savePestActivityDatatoApi(
        pest_found_details,
        latitude,
        longitude,
        visit_id
      );
      return { response: { ok: true }, data };
    } else {
      // Offline: Store data locally
      console.log("Offline mode - Storing data locally");
      const localData = await savePestActivityDataToBD(
        pest_found_details,
        latitude,
        longitude,
        visit_id
      );
      return { response: { ok: true }, data: localData }; // Simulate a successful response
    }
  } catch (error) {
    console.error("Error retrieving pest activity:", error);
    throw error; // Propagate the error to handle it in the calling code
  }
};

// ========================================================chemicalUSed===========

export const saveChemicalUsedToDB = async (
  latitude: number, // Adjusted to match the type expected in the function
  longitude: number, // Adjusted to match the type expected in the function
  visit_id: string,
  dataArray: any,
  chemicalsAdded: any
) => {
  const requestBody = [
    {
      visit_id: visit_id,
      latitude: latitude,
      longitude: longitude,
      data: dataArray,
      chemicals_added: chemicalsAdded,
    },
  ];

  if (storage) {
    await storage.set("otx-chem-used-" + visit_id, requestBody);
  } else {
    console.error("Storage instance is not initialized");
  }

  // Update local storage for visit execution details
  let taskVisitExecArray = await storage.get("md-get-visit-execution-details");
  for (let index = 0; index < taskVisitExecArray.length; index++) {
    let taskObj = taskVisitExecArray[index];
    if (taskObj.visit_id === visit_id) {
      let taskStartObj = {
        visit_id: visit_id,
        materials_used: dataArray,
      };
      if (taskObj.materials_used) {
        taskObj.materials_used.push(taskStartObj);
      } else {
        taskObj.materials_used = [taskStartObj];
      }
      taskVisitExecArray[index] = taskObj;
      await storage.set("md-get-visit-execution-details", taskVisitExecArray);
      break;
    }
  }
  addTaskIDToOtxTasks(visit_id);
  addOtxToOtxSeq(visit_id, task_tx_steps.chemsUsed);
};

export const saveChemicalUseddataToApi = async (
  latitude: number, // Adjusted to match the type expected in the function
  longitude: number, // Adjusted to match the type expected in the function
  visit_id: string,
  dataArray: any,
  chemicalsAdded: any
) => {
  const requestBody = [
    {
      visit_id: visit_id,
      latitude: latitude,
      longitude: longitude,
      data: dataArray,
      chemicals_added: chemicalsAdded,
    },
  ];

  try {
    const responseData = await insertChemicalsUsedForPest(requestBody);
    return responseData;
  } catch (error) {
    console.error("Error saving work done data to API:", error);
    throw error;
  }
};

export const saveChemicalUsedBasedOnNetwork = async (
  latitude: number,
  longitude: number,
  visit_id: string,
  dataArray: any,
  chemicalsAdded: any
) => {
  console.log("Retrieve Pest Activity Based On Network: Start");

  try {
    let nwStatus = await Network.getStatus();
    console.log("Network overall status:", nwStatus);

    await storage.create();
    let anyOtxPending = await anyUpSyncPending();
    if (nwStatus.connected && !anyOtxPending) {
      console.log("Online mode - Fetching data from API");
      const data = await saveChemicalUseddataToApi(
        latitude, // Convert number to string here
        longitude, // Convert number to string here
        visit_id,
        dataArray,
        chemicalsAdded
      );
      return data;
    } else {
      console.log("Offline mode - Storing data locally");
      const localData = await saveChemicalUsedToDB(
        latitude, // Convert number to string here
        longitude, // Convert number to string here
        visit_id,
        dataArray,
        chemicalsAdded
      );
      return { response: { ok: true }, data: localData };
    }
  } catch (error) {
    console.error("Error retrieving pest activity:", error);
    throw error;
  }
};

// ====================saveFeedBackBasedOnNetwork========
export const saveFeedBackDatatoDb = async (
  visit_id: string,
  customer_feedback: any,
  customer_signature: any,
  technician_signature: any,
  feedback: any,
  is_follow_up_required: any,

  next_follow_up: any,
  latitude: number, // Adjusted to match the type expected in the function
  longitude: number, // Adjusted to match the type expected in the function
  visit_completed: any,
  date_time: any
) => {
  const requestBody = [
    {
      visit_id,
      customer_feedback,
      customer_signature,
      technician_signature,
      feedback,
      is_follow_up_required,

      next_follow_up,
      latitude, // Adjusted to match the type expected in the function
      longitude, // Adjusted to match the type expected in the function
      visit_completed,
      date_time,
    },
  ];

  if (storage) {
    await storage.set("otx-followup-feedback-" + visit_id, requestBody);
  } else {
    console.error("Storage instance is not initialized");
  }

  // Update local storage for visit execution details
  let taskVisitExecArray = await storage.get("md-get-visit-execution-details");
  for (let index = 0; index < taskVisitExecArray.length; index++) {
    let taskObj = taskVisitExecArray[index];
    if (taskObj.visit_id === visit_id) {
      let taskStartObj = {
        visit_id,
        customer_feedback,
        customer_signature,
        technician_signature,
        feedback,
        is_follow_up_required,

        next_follow_up,
        latitude, // Adjusted to match the type expected in the function
        longitude, // Adjusted to match the type expected in the function
        visit_completed,
        date_time,
      };
      if (taskObj.feedback_details) {
        taskObj.feedback_details.push(taskStartObj);
      } else {
        taskObj.feedback_details = [taskStartObj];
      }
      taskVisitExecArray[index] = taskObj;
      await storage.set("md-get-visit-execution-details", taskVisitExecArray);
      break;
    }
  }
  addTaskIDToOtxTasks(visit_id);
  addOtxToOtxSeq(visit_id, task_tx_steps.feedbackFollowup);
};

export const saveFeedBackDataToApi = async (
  visit_id: string,
  customer_feedback: any,
  customer_signature: any,
  technician_signature: any,
  feedback: any,
  is_follow_up_required: any,

  next_follow_up: any,
  latitude: number, // Adjusted to match the type expected in the function
  longitude: number, // Adjusted to match the type expected in the function

  visit_completed: any,
  date_time: any
) => {
  const requestBody = [
    {
      visit_id,
      customer_feedback,
      customer_signature,

      technician_signature,
      feedback,
      is_follow_up_required,
      next_follow_up,
      latitude,
      longitude,
      visit_completed,
      date_time,
    },
  ];

  try {
    const responseData = await submitFollowupFeedback(requestBody);
    return responseData;
  } catch (error) {
    console.error("Error saving work done data to API:", error);
    throw error;
  }
};

export const saveFeedBackBasedOnNetwork = async (
  visit_id: string,
  customer_feedback: any,
  customer_signature: any,
  technician_signature: any,
  feedback: any,
  is_follow_up_required: any,

  next_follow_up: any,
  latitude: number, // Adjusted to match the type expected in the function
  longitude: number, // Adjusted to match the type expected in the function
  visit_completed: any,
  date_time: any
) => {
  console.log("Retrieve Pest Activity Based On Network: Start");

  try {
    let nwStatus = await Network.getStatus();
    console.log("Network overall status:", nwStatus);

    await storage.create();
    let anyOtxPending = await anyUpSyncPending();
    if (nwStatus.connected && !anyOtxPending) {
      console.log("Online mode - Fetching data from API");
      const data = await saveFeedBackDataToApi(
        visit_id,
        customer_feedback,
        customer_signature,
        technician_signature,
        feedback,
        is_follow_up_required,

        next_follow_up,
        latitude, // Adjusted to match the type expected in the function
        longitude, // Adjusted to match the type expected in the function
        visit_completed,
        date_time
      );
      return data;
    } else {
      console.log("Offline mode - Storing data locally");
      const localData = await saveFeedBackDatatoDb(
        visit_id,
        customer_feedback,
        customer_signature,
        technician_signature,
        feedback,
        is_follow_up_required,

        next_follow_up,
        latitude, // Adjusted to match the type expected in the function
        longitude, // Adjusted to match the type expected in the function
        visit_completed,
        date_time
      );
      return { response: { ok: true }, data: localData };
    }
  } catch (error) {
    console.error("Error retrieving pest activity:", error);
    throw error;
  }
};

///////////////////////////////

export const saveRecommendationsDatatoDb = async (
  latitude: string,
  longitude: string,
  visit_id: string,
  recommDataArray: any
) => {
  const formattedRecommDataArray = recommDataArray.map((recommItem: any) => ({
    visit_id: visit_id,
    latitude: latitude,
    longitude: longitude,
    recommendations: recommItem.recommendations || [],
    is_recommendation_added: recommItem.is_recommendation_added || "",
    pest_reported_id: recommItem.pest_reported_id || 0,
    is_service_available: recommItem.is_service_available || "",
    recommended_media: recommItem.recommended_media || [],
  }));

  if (storage) {
    await storage.set(
      "otx-pest-recommendation-" + visit_id,
      formattedRecommDataArray
    );
  } else {
    console.error("Storage instance is not initialized");
  }

  // Update local storage for visit execution details
  let taskVisitExecArray = await storage.get("md-get-visit-execution-details");
  for (let index = 0; index < taskVisitExecArray.length; index++) {
    let taskObj = taskVisitExecArray[index];
    if (taskObj.visit_id === visit_id) {
      let taskStartObj = {
        visit_id: visit_id,
        recommDataArray: recommDataArray,
      };
      if (taskObj.pests_recommendations) {
        taskObj.pests_recommendations.push(taskStartObj);
      } else {
        taskObj.pests_recommendations = [taskStartObj];
      }
      taskVisitExecArray[index] = taskObj;
      await storage.set("md-get-visit-execution-details", taskVisitExecArray);
      break;
    }
  }
  addTaskIDToOtxTasks(visit_id);
  addOtxToOtxSeq(visit_id, task_tx_steps.recommendations);
  return formattedRecommDataArray;
};

export const saveRecommendationsDataToApi = async (
  latitude: string,
  longitude: string,
  visit_id: string,
  recommDataArray: any // Ensure recommDataArray matches the structure you're expecting
) => {
  const requestBody = recommDataArray.map((recommItem: any) => ({
    visit_id: visit_id,
    latitude: latitude,
    longitude: longitude,
    recommendations: recommItem.recommendations || [],
    is_recommendation_added: recommItem.is_recommendation_added || "",
    pest_reported_id: recommItem.pest_reported_id || 0,
    is_service_available: recommItem.is_service_available || "",
    recommended_media: recommItem.recommended_media || [],
  }));

  try {
    const responseData = await submitRecommendations(requestBody);
    return responseData;
  } catch (error) {
    console.error("Error saving recommendations data to API:", error);
    throw error;
  }
};

export const savePestRecommendationBasedOnNetwork = async (
  latitude: string,
  longitude: string,
  visit_id: string,
  recommDataArray: any
) => {
  console.log("Retrieve Pest Activity Based On Network: Start");

  try {
    let nwStatus = await Network.getStatus();
    console.log("Network overall status:", nwStatus);

    await storage.create();
    let anyOtxPending = await anyUpSyncPending();
    if (nwStatus.connected && !anyOtxPending) {
      console.log("Online mode - Fetching data from API");
      const data = await saveRecommendationsDataToApi(
        latitude,
        longitude,
        visit_id,
        recommDataArray
      );
      return data;
    } else {
      console.log("Offline mode - Storing data locally");
      const localData = await saveRecommendationsDatatoDb(
        latitude.toString(), // Convert number to string here
        longitude.toString(), // Convert number to string here
        visit_id,
        recommDataArray
      );
      return { response: { ok: true }, data: localData };
    }
  } catch (error) {
    console.error("Error retrieving pest activity:", error);
    throw error;
  }
};

////////////////////////////////////////  workdone details ////////////////////////////

export const saveWorkDoneDatatoDb = async (
  latitude: string, // Adjusted to match the type expected in the function
  longitude: string, // Adjusted to match the type expected in the function
  visit_id: string,
  work_done: any
) => {
  const requestBody = [
    {
      visit_id: visit_id,
      latitude: latitude,
      longitude: longitude,
      work_done: work_done,
    },
  ];

  if (storage) {
    await storage.set("otx-work-done-" + visit_id, requestBody);
  } else {
    console.error("Storage instance is not initialized");
  }

  // Update local storage for visit execution details
  let taskVisitExecArray = await storage.get("md-get-visit-execution-details");
  for (let index = 0; index < taskVisitExecArray.length; index++) {
    let taskObj = taskVisitExecArray[index];
    if (taskObj.visit_id === visit_id) {
      let taskStartObj = {
        visit_id: visit_id,
        work_done: work_done,
      };
      if (taskObj.work_done_details) {
        taskObj.work_done_details.push(taskStartObj);
      } else {
        taskObj.work_done_details = [taskStartObj];
      }
      taskVisitExecArray[index] = taskObj;
      await storage.set("md-get-visit-execution-details", taskVisitExecArray);
      break;
    }
  }
  addTaskIDToOtxTasks(visit_id);
  addOtxToOtxSeq(visit_id, task_tx_steps.workDone);
};

export const saveWorkDoneDataToApi = async (
  latitude: number, // Adjusted to match the type expected in the function
  longitude: number, // Adjusted to match the type expected in the function
  visit_id: string,
  work_done: any
) => {
  const requestBody = [
    {
      visit_id: visit_id,
      latitude: latitude,
      longitude: longitude,
      work_done: work_done,
    },
  ];

  try {
    const responseData = await submitWorkDoneDetail(requestBody);
    return responseData;
  } catch (error) {
    console.error("Error saving work done data to API:", error);
    throw error;
  }
};

export const savePestWorkdoneBasedOnNetwork = async (
  latitude: number,
  longitude: number,
  visit_id: string,
  work_done: any
) => {
  console.log("Retrieve Pest Activity Based On Network: Start");

  try {
    let nwStatus = await Network.getStatus();
    console.log("Network overall status:", nwStatus);

    await storage.create();
    let anyOtxPending = await anyUpSyncPending();
    if (nwStatus.connected && !anyOtxPending) {
      console.log("Online mode - Fetching data from API");
      const data = await saveWorkDoneDataToApi(
        latitude, // Convert number to string here
        longitude, // Convert number to string here
        visit_id,
        work_done
      );
      return data;
    } else {
      console.log("Offline mode - Storing data locally");
      const localData = await saveWorkDoneDatatoDb(
        latitude.toString(), // Convert number to string here
        longitude.toString(), // Convert number to string here
        visit_id,
        work_done
      );
      return { response: { ok: true }, data: localData };
    }
  } catch (error) {
    console.error("Error retrieving pest activity:", error);
    throw error;
  }
};

//////////////////////////////
// export const updateInterval = async (visitId:any, isPaused:any) => {
//   const userData = getUserData();
//   const pos = await getCurrentLocation();
//   if (!pos) {
//     console.error("Error fetching Location");
//     throw new Error("Failed to fetch Location");
//   }

//   const currTime = getDateTime();
//   const formattedCurrTime = formatToUaeTime(currTime);
//   const type = isPaused ? "Resume" : "Break";

//   try {
//     // GET NETWORK STATUS
//     const nwStatus = await Network.getStatus();
//     console.log("NETWORK OVERALL STATUS =", nwStatus);

//     // Check if there are any pending sync operations
//     const anyOtxPending = await anyUpSyncPending();

//     if (nwStatus.connected&&!anyOtxPending) {
//       console.log("intervals--------> online",)
//       // If online
//       const response = await fetch(
//         "https://rpwebapps.us/clients/landscape/api/v1/visit-time-intervals",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${userData?.api_token}`,
//           },
//           body: JSON.stringify([
//             {
//               visit_id: visitId,
//               interval: formattedCurrTime,
//               type: type,
//               latitude: "" + pos.coords.latitude,
//               longitude: "" + pos.coords.longitude,
//             },
//           ]),
//         }
//       );
//       const data = await response.json();
//       if (response.ok) {
//         return data;
//       } else {
//         throw new Error(data.message || "Failed to update interval");
//       }
//     } else {
//       // If offline, store the request payload locally
//       const requestBody = [
//         {
//           visit_id: visitId,
//           interval: formattedCurrTime,
//           type: type,
//           latitude: "" + pos.coords.latitude,
//           longitude: "" + pos.coords.longitude,
//         },
//       ];

//       if (storage) {
//         await storage.set("otx-task-Paused-" + visitId, requestBody);
//       } else {
//         console.error("Storage instance is not initialized");
//       }

//       // Update the status in task-list
//       let taskListArray = await storage.get("md-task-list");
//       for (let index = 0; index < taskListArray.length; index++) {
//         let taskObj = taskListArray[index];
//         if (taskObj.id === visitId) {
//           taskObj.service_status = "Paused";
//           taskListArray[index] = taskObj;
//           await storage.set("md-task-list", taskListArray);
//           break;
//         }
//       }

//       // Update the task_initiation in task-visit-exec-v2
//       let taskVisitExecArray = await storage.get("md-get-visit-execution-details");
//       for (let index = 0; index < taskVisitExecArray.length; index++) {
//         let taskObj = taskVisitExecArray[index];
//         if (taskObj.visit_id === visitId) {
//           let intervalObj = {
//             visit_id: visitId,
//           interval: formattedCurrTime,
//           type: type,
//           latitude: "" + pos.coords.latitude,
//           longitude: "" + pos.coords.longitude,
//           };
//           taskObj.interval = [intervalObj];
//           taskVisitExecArray[index] = taskObj;
//           await storage.set(
//             "md-get-visit-execution-details",
//             taskVisitExecArray
//           );
//           break;
//         }
//       }
//       addTaskIDToOtxTasks(visitId);
//       addOtxToOtxSeq(visitId, task_tx_steps.Paused);
//       return { success: true };
//     }
//   } catch (error) {
//     console.error("Error updating interval:", error);
//     throw error;
//   }
// };

const storeIntervalOffline = async (
  visitId: any,
  formattedCurrTime: any,
  type: any,
  pos: any
) => {
  const requestBody = [
    {
      visit_id: visitId,
      interval: formattedCurrTime,
      type: type,
      latitude: "" + pos.coords.latitude,
      longitude: "" + pos.coords.longitude,
    },
  ];

  // Store the request payload locally based on the type
  if (storage) {
    const storageKey =
      type === "Resume"
        ? `otx-task-resume-${visitId}`
        : `otx-task-Paused-${visitId}`;
    await storage.set(storageKey, requestBody);
  } else {
    console.error("Storage instance is not initialized");
  }

  // Update the status in task-list
  let taskListArray = await storage.get("md-task-list");
  for (let index = 0; index < taskListArray.length; index++) {
    let taskObj = taskListArray[index];
    if (taskObj.id === visitId) {
      taskObj.service_status = type === "Resume" ? "On Going" : "Paused";
      taskListArray[index] = taskObj;
      await storage.set("md-task-list", taskListArray);
      break;
    }
  }

  // Update the task_initiation in task-visit-exec-v2
  let taskVisitExecArray = await storage.get("md-get-visit-execution-details");
  for (let index = 0; index < taskVisitExecArray.length; index++) {
    let taskObj = taskVisitExecArray[index];
    if (taskObj.visit_id === visitId) {
      let intervalObj = {
        visit_id: visitId,
        interval: formattedCurrTime,
        type: type,
        latitude: "" + pos.coords.latitude,
        longitude: "" + pos.coords.longitude,
      };

      // Append the new interval to the existing intervals array
      if (!taskObj.interval) {
        taskObj.interval = [];
      }
      taskObj.interval.push(intervalObj);

      taskVisitExecArray[index] = taskObj;
      await storage.set("md-get-visit-execution-details", taskVisitExecArray);
      break;
    }
  }

  addTaskIDToOtxTasks(visitId);
  addOtxToOtxSeq(
    visitId,
    type === "Resume" ? task_tx_steps.Resumed : task_tx_steps.Paused
  );
};

export const updateInterval = async (visitId: any, isPaused: any) => {
  const userData = getUserData();
  const pos = await getCurrentLocation();
  if (!pos) {
    console.error("Error fetching Location");
    throw new Error("Failed to fetch Location");
  }

  const currTime = getDateTime();
  const formattedCurrTime = formatToUaeTime(currTime);
  const type = isPaused ? "Resume" : "Break";

  try {
    // GET NETWORK STATUS
    const nwStatus = await Network.getStatus();
    console.log("NETWORK OVERALL STATUS =", nwStatus);

    // Check if there are any pending sync operations
    const anyOtxPending = await anyUpSyncPending();

    if (nwStatus.connected && !anyOtxPending) {
      console.log("intervals--------> online");
      // If online
      const response = await fetch(
        "https://rpwebapps.us/clients/landscape-dev/api/v1/visit-time-intervals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData?.api_token}`,
          },
          body: JSON.stringify([
            {
              visit_id: visitId,
              interval: formattedCurrTime,
              type: type,
              latitude: "" + pos.coords.latitude,
              longitude: "" + pos.coords.longitude,
            },
          ]),
        }
      );
      const data = await response.json();
      if (response.ok) {
        if (data.success) {
          return data;
        } else {
          toast.error(
            data.message || "Transaction failed, please contact Admin"
          );
          console.error(data.message);
          throw new Error(data.message || "Failed to update interval");
        }
      } else {
        toast.error(data.message || "Transaction failed, please contact Admin");
        console.error(data.message);
        throw new Error(data.message || "Failed to update interval");
      }
    } else {
      // If offline, store the request payload locally
      await storeIntervalOffline(visitId, formattedCurrTime, type, pos);
      return { success: true, message: "Task paused successfully" };
    }
  } catch (error) {
    console.error("Error updating interval:", error);
    throw error;
  }
};
