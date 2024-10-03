import { useState, useEffect } from "react";
import { Storage } from "@ionic/storage";
import useLongitudeLocation from "../../../components/useLongitudeLocation";
import { Network } from "@capacitor/network";
import {
  fetchTaskData,
  getActTaskData,
  getTaskInitTimes,
  getUserData,
  taskInit,
  fetchQuestionnaire,
  fetchFilteredTaskData,
} from "../../apidata/taskApi/taskDataApi";
import {
  fetchTaskDetails,
  getVisitExecutionDetails,
} from "../../apidata/taskApi/taskDataApi";
import { fetchIdealTechnicians, submitTechnicianData } from "../../apidata/technicianData/idealTechnicianData";
import { anyUpSyncPending } from "./DataTransfer";
import { API_BASE_URL } from "../../baseUrl";
let storage = new Storage();

let syncstatus = {
  syncdownload: true,
  syncDownloadTime: new Date().toISOString(),
  touchedTasks: [],
};

// ==================================otx-task===========================================

const getOnGoingNPendingTasks = async (
  statusArray: Array<any>,
  lat: number,
  long: number
) => {
  if (lat !== null && long !== null) {
    let consolidatedData: Array<any> = [];

    await fetchTaskData(
      [], //TODO: Remove Hardcoding, use from param
      lat,
      long
    )
      .then((response) => {
        console.log("---------responese---------------->",response.data);
        if (response && response.success) {
          const sortedData = response.data.sort(
            (a: any, b: any) =>
              new Date(a.created_on).getTime() -
              new Date(b.created_on).getTime()
          );
          consolidatedData = sortedData;
        } else {
          console.error("Error:", response?.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching task data:", error);
      });
    // setTaskList(consolidatedData);
    console.log("----------------------->",consolidatedData);
    return consolidatedData;
  }
};

const fetchTaskListFromDB = async (statusArray: Array<any>) => {
  console.log("Fetching Task List from Local Storage...");

  let consolidatedData: Array<any> = [];

  try {
    // Fetch tasks from Ionic storage
    const localData = await storage.get("md-task-list");
    console.log("Data fetched from Ionic Storage:", localData);

    if (localData && Array.isArray(localData)) {
      // Sort tasks by 'created_on'
      const sortedData = localData.sort(
        (a: any, b: any) =>
          new Date(a.created_on).getTime() - new Date(b.created_on).getTime()
      );

      console.log("Sorted Data from Local Storage:", sortedData);
      consolidatedData = sortedData; // Store the sorted tasks in consolidatedData
    } else {
      console.warn("No tasks found in local storage.");
    }
  } catch (error) {
    console.error("Error fetching data from Ionic Storage:", error);
  }

  console.log("Returning Consolidated Data from Local Storage:", consolidatedData);
  return consolidatedData; // Return the consolidated data
};




export const retrieveNetworkTasks = async (
  statusArray: Array<any>,
  lat: number,
  long: number
) => {
  console.log("retrieveNetworkTasks : Start ");
  
  // Get network status
  let nwStatus = await Network.getStatus();
  console.log("NETWORK OVERALL STATUS = ", nwStatus);

  // Initialize DB connection
  await storage.create();

  if (nwStatus.connected) {
    // Fetch tasks online
    console.log("retrieveNetworkTasks : NW ONLINE ");
    return getOnGoingNPendingTasks(statusArray, lat, long);
  } else {
    // Fetch tasks from local storage in offline mode
    console.log("retrieveNetworkTasks : NW OFFLINE  ");
    return fetchTaskListFromDB(statusArray);  // Ensure statusArray is passed for filtering
  }
};


export const retrieveNetworkFilteredTasks = async (
  filterCriteria: any,
  lat: number,
  long: number
) => {
  console.log("retrieveNetworkTasks : Start ");
  // GET NW STATUS
  let nwStatus = await Network.getStatus();
  console.log("NETWORK OVERALL STATUS = ", nwStatus);

  //INIT DB Conn
  await storage.create();
  let consolidatedData: Array<any> = [];
  if (nwStatus.connected) {
    // TODO: Get sync status from ionic-storage
    console.log("Retrieve Network Filtered Tasks : NW ONLINE ");

    if (filterCriteria.priority !== "" && filterCriteria.service_date !== "") {
      await fetchFilteredTaskData(filterCriteria, lat, long).then((response) => {
        if (response && response.success) {
          consolidatedData = response.data;
        } else {
          console.error("Error:", response?.message);
        }
      }).catch((error) => {
        console.error("Error fetching task data:", error);
      });
    }
    // setTaskList(consolidatedData);
    return consolidatedData;
    // return getOnGoingNPendingTasks(statusArray, lat, long);
  } else {
    console.log("retrieveNetworkTasks : NW OFFLINE  ");
    return consolidatedData;
    // return fetchTaskListFromDB(statusArray);
  }
};

// ==================================otx-Task-Details===========================================
const fetchTDetails = async (taskId: any) => {
  console.log("Going to fetch Task Details for task ID ::::", taskId);
  try {
    const response = await fetchTaskDetails(taskId);
    console.log("Task Details Response: ", response);

    if (response && response.success) {
      console.log("response data", response.data[0]);
      return response.data[0];
    } else {
      console.error("Failed to fetch task details. Error:", response.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching task details:", error);
    return null;
  }
};

const fetchTaskDeatilsFromDB = async (taskId: any) => {
  console.log("fetchTaskDetailsFromDB");
  try {
    const localData = await storage.get("md-task-details");
    console.log("Task Details Data fetched from Ionic Storage:", localData);

    if (localData && Array.isArray(localData)) {
      const taskDetails = localData.find((task: any) => task.id === taskId);

      if (taskDetails) {
        console.log("Task Details found:", taskDetails);
        return taskDetails;
      } else {
        console.log("Task Details not found for taskId:", taskId);
        return null;
      }
    } else {
      console.log("No valid Data found in Ionic Storage");
      return null;
    }
  } catch (error) {
    console.error("Error fetching data from Ionic Storage:", error);
    return null;
  }
};

export const retrieveNetworkTasksDetails = async (taskID: any) => {
  console.log("retrieveNetworkTasks : Start ");
  // GET NW STATUS
  let nwStatus = await Network.getStatus();
  console.log("NETWORK OVERALL STATUS = ", nwStatus);

  //INIT DB Conn
  await storage.create();
  if (nwStatus.connected) {
    // TODO: Get sync status from ionic-storage
    console.log("retrieveNetworkTasks : NW ONLINE ");
    return fetchTDetails(taskID);
  } else {
    console.log("retrieveNetworkTasks : NW OFFLINE  ");
    return fetchTaskDeatilsFromDB(taskID);
  }
};

// =======================================task-execution-details==============================
const fetchVisitExecutionDetails = async (visitId: string) => {
  try {
    const { response, data } = await getVisitExecutionDetails(visitId);
    if (response.ok) {
      console.log("Visit Execution Details ::", data.data);
      return data.data;
    } else {

      console.error(data.message);
      return { error: true, message: "Transaction Failed" }
    }
  } catch (error) {
    console.error("Error:", error);
    return { error: true, message: "Transaction Failed" }
  }
};

const fetchTaskExecutionDeatilsFromDB = async (taskId: any) => {
  console.log("fetchTaskDetailsFromDB");
  try {
    const localData = await storage.get("md-task-details");
    console.log("Task Details Data fetched from Ionic Storage:", localData);

    if (localData && Array.isArray(localData)) {
      const taskDetails = localData.find((task: any) => task.id === taskId);

      if (taskDetails) {
        console.log("Task Details found:", taskDetails);
        return taskDetails;
      } else {
        console.log("Task Details not found for taskId:", taskId);
        return null;
      }
    } else {
      console.log("No valid Data found in Ionic Storage");
      return null;
    }
  } catch (error) {
    console.error("Error fetching data from Ionic Storage:", error);
    return null;
  }
};

export const retrieveNetworkTasksExecutionDetails = async (taskID: any) => {
  console.log("retrieveNetworkTasks : Start ");
  // GET NW STATUS
  let nwStatus = await Network.getStatus();
  console.log("NETWORK OVERALL STATUS = ", nwStatus);

  //INIT DB Conn
  await storage.create();
  if (nwStatus.connected) {
    // TODO: Get sync status from ionic-storage
    console.log("retrieveNetworkTasks : NW ONLINE ");
    return fetchVisitExecutionDetails(taskID);
  } else {
    console.log("retrieveNetworkTasks : NW OFFLINE  ");
    return fetchTaskExecutionDeatilsFromDB(taskID);
  }
};

// =========================otx-teamAttendance=======================

const fetchTemaAttendenceFromDB = async (
  updatedSelectedTechnicianData: any,
  db: any
) => {
  if (db) {
    await db.set("otx-teamAttendance", updatedSelectedTechnicianData);
    console.log(
      "teamAttendance data has been successfully stored in Ionic Storage:",
      updatedSelectedTechnicianData
    );
  } else {
    console.error("Storage instance is not initialized");
  }
};

export const retrieveTeamAttendenceBasedOnNetwork = async (
  updatedSelectedTechnicianData: any,
  db: any
) => {
  console.log("retrieveNetworkTasks : Start ");
  // GET NW STATUS
  let nwStatus = await Network.getStatus();
  console.log("NETWORK OVERALL STATUS = ", nwStatus);

  //INIT DB Conn
  await storage.create();
  let anyOtxPending = await anyUpSyncPending();
  if (nwStatus.connected && !anyOtxPending) {
    // TODO: Get sync status from ionic-storage
    console.log("retrieveNetworkTasks : NW ONLINE ");
    return fetchTemaAttendenceFromDB(updatedSelectedTechnicianData, db);
  } else {
    console.log("retrieveNetworkTasks : NW OFFLINE  ");
    return fetchTemaAttendenceFromDB(updatedSelectedTechnicianData, db);
  }
};

// =====================md-availble techician===================

const fetchAvailableTechincian = async () => {
  try {
    const data = await fetchIdealTechnicians();
    console.log("Fetched data (online):", data);
    return data;
  } catch (error) {
    console.error("Error fetching technicians:", error);
    throw error;
  }
};

const retrieveAvailableTechincian = async () => {
  try {
    console.log("fetchTaskDetailsFromDB");
    const localData = await storage.get("md-idleteam");
    console.log(
      "Task Details Data fetched from Ionic Storage (offline):",
      localData
    );
    return localData;
  } catch (error) {
    console.error("Error retrieving local technicians:", error);
    throw error;
  }
};

export const retrieveAvailableTechincianBasedOnNetwork = async () => {
  console.log("retrieveNetworkTasks: Start");
  try {
    const nwStatus = await Network.getStatus();
    console.log("NETWORK OVERALL STATUS =", nwStatus);

    await storage.create();

    if (nwStatus.connected) {
      console.log("retrieveNetworkTasks: NW ONLINE");
      return fetchAvailableTechincian();
    } else {
      console.log("retrieveNetworkTasks: NW OFFLINE");
      return retrieveAvailableTechincian();
    }
  } catch (error) {
    console.error("Error in retrieveAvailableTechincianBasedOnNetwork:", error);
    throw error;
  }
};

// ======retrieveNetworkServiceRequest===============================

const fetchServiceRequest = async () => {
  try {
    const serviceRequest = await storage.get("md-service-Request");

    return serviceRequest;
  } catch (error) {
    console.error("Error fetching service request:", error);
    throw error;
  }
};

export const retrieveServiceRequestBasedOnNetwork = async () => {
  console.log("retrieveNetworkTasks : Start ");
  // GET NW STATUS
  let nwStatus = await Network.getStatus();
  console.log("NETWORK OVERALL STATUS = ", nwStatus);

  //INIT DB Conn
  await storage.create();
  if (nwStatus.connected) {
    // TODO: Get sync status from ionic-storage
    console.log("retrieveNetworkTasks : NW ONLINE ");
    return fetchServiceRequest();
  } else {
    console.log("retrieveNetworkTasks : NW OFFLINE  ");
    return fetchServiceRequest();
  }
};

const getInitTimesOnline = async (taskId: string) => {
  try {
    const { response, data } = await getTaskInitTimes(taskId);
    console.log("getInitTimes", data.data);
    console.log("getTimesResponse", response);
    if (response.ok) {
      console.log("Visit InitTimes Details ::", data.data);
      return data.data;
    } else {
      console.error(data.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const fetchInitTimesFromDB = async (taskId: string) => {
  console.log("fetchInitTimesFromDB", taskId);
  try {
    const localData = await storage.get("md-get-visit-execution-details");
    console.log("getTaskInit Data fetched from Ionic Storage:", localData);

    if (localData && Array.isArray(localData)) {
      const taskDetails = localData.find(
        (task: any) => task.visit_id === taskId
      );

      if (taskDetails) {
        console.log("fetchTaskInit found:", taskDetails);

        let response = { ok: 200 };
        let data = taskDetails.task_initiation;

        return data;
      } else {
        console.log("fetchTaskInit not found for VisitId:", taskId);
        return null;
      }
    } else {
      console.log("No valid Data found in Ionic Storage");
      return null;
    }
  } catch (error) {
    console.error("Error fetching data from Ionic Storage:", error);
    return null;
  }
};

export const retrieveNetworkInitTimes = async (taskID: any) => {
  console.log("retrieveNetworkInitTimes : Start ");
  // GET NW STATUS
  let nwStatus = await Network.getStatus();
  console.log("NETWORK OVERALL STATUS = ", nwStatus);

  //INIT DB Conn
  await storage.create();
  if (nwStatus.connected) {
    // TODO: Get sync status from ionic-storage
    console.log("retrieveNetworkInitTimes : NW ONLINE ");
    const data = await getInitTimesOnline(taskID);
    console.log("Init times ONLINE in Data retriever : ", data);
    return data;
  } else {
    console.log("retrieveNetworkInitTimes : NW OFFLINE  ");
    return await fetchInitTimesFromDB(taskID);
  }
};

const getInitOnline = async (
  taskId: string,
  timestamp: string,
  log_type: string,
  tracking_type: string
) => {
  try {
    const { response, data } = await taskInit(
      taskId,
      timestamp,
      log_type,
      tracking_type
    );
    console.log("getInitTimes", data.data);
    console.log("getTimesResponse", response);
    if (response.ok) {
      console.log("Visit InitTimes Details ::", data.data);
      return data.data;
    } else {
      console.error(data.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};



// ==========================getPestActivity/offline===============================
export const fetchPestActivityFromDB = async () => {
  try {
    console.log("fetchPestDataFromDB");
    const localData = await storage.get("md-pestTypes");
    console.log(
      "fetchPestDataFromDB Data fetched from Ionic Storage (offline):",
      localData
    );
    return localData;
  } catch (error) {
    console.error("Error retrieving local pest activity:", error);
    throw error; // Propagate the error to handle it in the calling code
  }
};

//  ============================Online PestActivity============================
// const fetchpestActivityfromApi = async () => {
//   const userData = getUserData();
//   const actTaskData = getActTaskData().service_id;
//   console.log("Active task data:", actTaskData);

//   try {
//     const requestBody = {
//       columns: ["id", "sub_service_id", "pest_report_type"],
//       order_by: {
//         created_on: "asc",
//       },
//       filters: { sub_service_id: actTaskData },
//       pagination: {
//         limit: "0",
//         page: "1",
//       },
//     };

//     const response = await fetch(`${API_BASE_URL}/get-pests-list`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${userData?.api_token}`,
//       },
//       body: JSON.stringify(requestBody),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch data");
//     }

//     console.log("Response from Pest API:", response);
//     const data = await response.json();
//     console.log("Pest activity data:", data);

//     // Store data locally

//     // await retrivePestDataFromDB(data);

//     return { response, data };
//   } catch (error) {
//     console.error("Error fetching pest activity data:", error);
//     throw error;
//   }
// };

const fetchpestActivityfromApi = async () => {
  const userData = getUserData();
  const taskDataStr = localStorage.getItem("activeTaskData");
  if (!taskDataStr) {
    throw new Error("Task Data is not available");
  }
  const activeTaskData = JSON.parse(taskDataStr);
  const visitId = activeTaskData.id;

  console.log("Visit ID:", visitId);

  try {
    const requestBody = {
      visit_id: visitId, // Use the visit_id in the request body
    };

    const response = await fetch(`${API_BASE_URL}/get-pests-reported-by-visit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    console.log("Pest activity data:", data);

    // Check if the response was successful and contains data
    if (data.success) {
      console.log("Pest reported data:", data.data);

      // Store data locally if needed
      // await retrivePestDataFromDB(data.data);

      return { response, data: data.data }; // Return only the data part
    } else {
      throw new Error(data.message || "Failed to fetch pest reported data");
    }
  } catch (error) {
    console.error("Error fetching pest activity data:", error);
    throw error;
  }
};

// =================================NetWork PestActivity=================
export const retrievePestActivityBasedOnNetwork = async () => {
  console.log("Retrieve Pest Activity Based On Network: Start");

  try {
    // Get network status
    let nwStatus = await Network.getStatus();
    console.log("Network overall status:", nwStatus);

    // Initialize Ionic Storage
    await storage.create();

    if (nwStatus.connected) {
      // Online: Fetch data from API
      console.log("Online mode - Fetching data from API");
      const { response, data } = await fetchpestActivityfromApi();
      return { response, data };
    } else {
      // Offline: Store data locally
      console.log("Offline mode - Storing data locally");
      const localData = await fetchPestActivityFromDB();
      return { response: { ok: true }, data: localData }; // Simulate a successful response
    }
  } catch (error) {
    console.error("Error retrieving pest activity:", error);
    throw error; // Propagate the error to handle it in the calling code
  }
};

// ===================================chemicals====================
// ====================================retrieveChemicalUsedfromDB=======================
export const retrieveChemicalUsedfromDB = async () => {
  console.log("md-chemicalsUsed");
  if (storage) {
    const localChemicalData = await storage.get("md-chemicalsUsed");
    console.log("ChemicalUsed", localChemicalData)
    return localChemicalData
  } else {
    console.error("Storage instance is not initialized");
  }
};
// ============================================retrieveChemicalUsedfromapi

// const fetchChemicalUseddataFromApi= async( )=>{
// const userData = getUserData();
// try {
//   const requestBody = {
//     service_id: "4",
//   };

//   const response = await fetch(`${API_BASE_URL}/get-items`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${userData?.api_token}`,
//     },
//     body: JSON.stringify(requestBody),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to fetch data");
//   }

//   const data = await response.json();
//   return { response, data };
// } catch (error) {
//   console.error("Error fetching task data:", error);
//   throw error;
// }

// }




export const fetchChemicalUseddataFromApi = async () => {
  const taskDataStr = localStorage.getItem("activeTaskData");
  if (!taskDataStr) {
    throw new Error("Task Data is not available");
  }
  const activeTaskData = JSON.parse(taskDataStr);

  const service_id= activeTaskData.service_id;

  // const location = useLongitudeLocation();
  const userData = getUserData();
  try {
    const requestBody = {
      columns: [
        "tbl_item_service_mapping.id",
        "tbl_item_service_mapping.item_id",
        "tbl_items.item_name",
        "tbl_item_service_mapping.unit_id",
        "tbl_uoms.name",
        "tbl_items.packaging_uom",

      ],
      order_by: {
        "tbl_items.item_name": "asc",
      },
      filters: {
        "tbl_item_service_mapping.service_id": service_id,
      },
      pagination: {
        limit: "0",
        page: "1",
      },
    };

    const response = await fetch(
      `${API_BASE_URL}/get-chemicals-used-for-pest
`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.api_token}`,
        },
        body: JSON.stringify(requestBody),
      }
    );


    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error("Error fetching task data:", error);
    throw error;
  }
};

// ========================retriveChemicalUsedBasedOnNetwork======================

export const retriveChemicalUsedBasedOnNetwork = async () => {

  console.log("Retrieve Pest Activity Based On Network: Start");

  try {
    // Get network status
    let nwStatus = await Network.getStatus();
    console.log("Network overall status:", nwStatus);

    // Initialize Ionic Storage
    await storage.create();

    if (nwStatus.connected) {
      // Online: Fetch data from API
      console.log("Online mode - Fetching data from API");
      const { response, data } = await fetchChemicalUseddataFromApi();
      return { response, data };
    } else {
      // Offline: Store data locally
      console.log("Offline mode - Storing data locally");
      const localData = await retrieveChemicalUsedfromDB();
      return { response: { ok: true }, data: localData }; // Simulate a successful response
    }
  } catch (error) {
    console.error("Error retrieving pest activity:", error);
    throw error; // Propagate the error to handle it in the calling code
  }

};



/////////////////////////////////////////
// Function to fetchrecommendations data from local storage
const fetchRecommendationsFromServer = async () => {
  const userData = getUserData();
  try {
    const response = await fetch(
      `${API_BASE_URL}/get-recommendations-list
`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.api_token}`,
        },
      }
    );
    if (response.ok) {
      return await response.json(); // Ensure response data is returned
    } else {
      console.error("Failed to fetch Visit Status Count:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error in Visit status count:", error);
  }
};


// Function to retrieve questionnaire data from local storage
const retrieveRecommendationsFromStorage = async () => {
  try {
    console.log("Fetching recommendations data from local storage");
    const localData = await storage.get("md-recommendations");
    console.log("Recommendations data fetched from Ionic Storage (offline):", localData);
    if (localData) {
      return { success: true, data: localData }; // Wrap data to match server response structure
    } else {
      return { success: false, data: [] };
    }
  } catch (error) {
    console.error("Error retrieving local recommendations data:", error);
    return { success: false, data: [] };
  }
};


export const retrieveRecommendationsBasedOnNetwork = async () => {
  try {
    const nwStatus = await Network.getStatus();
    console.log('NETWORK OVERALL STATUS =', nwStatus);
    let anyOtxPending = await anyUpSyncPending();
    if (nwStatus.connected) {
      console.log('multiRecommendations: NW ONLINE');
      return fetchRecommendationsFromServer();
    } else {
      console.log('multiRecommendations: NW OFFLINE');
      return retrieveRecommendationsFromStorage();
    }
  } catch (error) {
    console.error('Error in multiRecommendations:', error);
    throw error;
  }
};





/////////////////////////////////////////
// Function to retrieve questionnaire data from local storage
const retrieveVisitExecutionsFromStorage = async (visitId: string) => {
  try {
    console.log("Fetching VisitExecutions data from local storage");
    const localData = await storage.get("md-get-visit-execution-details");
    console.log("VisitExecutions data fetched from Ionic Storage (offline):", localData);

    if (localData && Array.isArray(localData)) {
      const visitExecutionDetails = localData.find((visit: any) => visit.visit_id === visitId);

      if (visitExecutionDetails) {
        console.log("Visit Execution Details found:", visitExecutionDetails);
        return visitExecutionDetails;
      } else {
        console.log("Visit Execution Details not found for visitId:", visitId);
        return null;
      }
    } else {
      console.log("No valid Data found in Ionic Storage");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving local VisitExecutions data:", error);
    throw error;
  }
};



const fetchVisitExecutionDetailsforRecommendations = async (visitId: string) => {
  try {
    const { response, data } = await getVisitExecutionDetails(visitId);
    if (response.ok) {
      console.log("Visit Execution Details ::", data.data);
      return data.data;
    } else {
      console.error(data.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export const retrievevisitExecutionDetailsBasedonNetwork = async (taskID: any) => {
  console.log("retrieveNetworkTasks : Start ");
  // GET NW STATUS
  let nwStatus = await Network.getStatus();
  console.log("NETWORK OVERALL STATUS = ", nwStatus);

  //INIT DB Conn
  await storage.create();
  let anyOtxPending = await anyUpSyncPending();
  if (nwStatus.connected) {
    // TODO: Get sync status from ionic-storage
    console.log("retrieveNetworkTasks : NW ONLINE ");
    return fetchVisitExecutionDetailsforRecommendations(taskID);
  } else {
    console.log("retrieveNetworkTasks : NW OFFLINE  ");
    return retrieveVisitExecutionsFromStorage(taskID);
  }
};





//////////////////////
// Function to fetch questionnaire data from the server
const fetchQuestionnaireFromServer = async () => {
  try {
    const { response, data } = await fetchQuestionnaire();
    if (response.ok) {
      console.log("Fetched questionnaire data (online):", data);
      return data;
    } else {
      console.error(data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("Error fetching questionnaire data:", error);
    throw error;
  }
};

// Function to retrieve questionnaire data from local storage
const retrieveQuestionnaireFromStorage = async () => {
  try {
    console.log("Fetching questionnaire data from local storage");
    const localData = await storage.get("md-workdoneQuestionnaire");
    console.log("Questionnaire data fetched from Ionic Storage (offline):", localData);
    return localData;
  } catch (error) {
    console.error("Error retrieving local questionnaire data:", error);
    throw error;
  }
};

// Function to fetch questionnaire data based on network status
export const retrieveQuestionnaireBasedOnNetwork = async () => {
  console.log("retrieveQuestionnaireBasedOnNetwork: Start");
  try {
    const nwStatus = await Network.getStatus();
    console.log("NETWORK OVERALL STATUS =", nwStatus);

    await storage.create();
    let anyOtxPending = await anyUpSyncPending();
    if (nwStatus.connected) {
      console.log("retrieveQuestionnaireBasedOnNetwork: NW ONLINE");
      return fetchQuestionnaireFromServer();
    } else {
      console.log("retrieveQuestionnaireBasedOnNetwork: NW OFFLINE");
      return retrieveQuestionnaireFromStorage();
    }
  } catch (error) {
    console.error("Error in retrieveQuestionnaireBasedOnNetwork:", error);
    throw error;
  }
};

