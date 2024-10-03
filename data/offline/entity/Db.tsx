import { IonButton, IonText, IonImg } from "@ionic/react";
import { Storage } from "@ionic/storage";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../baseUrl"; // Assuming API_BASE_URL is defined correctly
import { getCurrentLocation } from "../../providers/GeoLocationProvider";
import { set } from "lodash";
import { toZonedTime, format } from "date-fns-tz";
import { anyUpSyncPending } from "./DataTransfer";
import { useIonAlert, IonLoading } from "@ionic/react";
const Db: React.FC = () => {
  const [db, setDb] = useState<Storage | null>(null);
  const [presentAlert] = useIonAlert();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function initDb() {
      const store = new Storage();
      await store.create();
      setDb(store);
    }
    initDb();
  }, []);

  // =====================task-list=====================

  const fetchTaskList = async () => {
    try {
      const pos = await getCurrentLocation();
      if (!pos) {
        throw new Error("Failed to fetch Location");
      }

      const { latitude, longitude } = pos.coords;

      const userDataString = localStorage.getItem("userData");
      if (!userDataString) {
        throw new Error("User Data Not available");
      }

      const userData = JSON.parse(userDataString);

      const requestBody = {
        columns: [
          "tbl_visits.id",
          "tbl_services.service_name",
          "tbl_locations.address",
          "tbl_visits.status",
          "tbl_visits.created_on",
          "tbl_visits.service_date",
          "tbl_visits.expiry_date",
          "tbl_visits.preffered_time",
          "tbl_status.status_name as service_status",
          "tbl_visits.visit_type",
          "tbl_visits.reference_number",
          "tbl_visits.priority",
          "tbl_visits.service_id",
        ],
        order_by: {
          "tbl_visits.created_on": "desc",
        },
        filters: {
          "tbl_visits.service_status": [17, 14, 33], // Fetching records with these status IDs
        },
        pagination: {
          limit: "0", // Adjust these values as needed for pagination
          page: "1",
        },
        coordinates: {
          latitude,
          longitude,
        },
      };

      console.log("task list Request body:", requestBody);

      const response = await fetch(`${API_BASE_URL}/task-list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.api_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch data:", errorText);
        throw new Error(`Failed to fetch data: ${errorText}`);
      }

      const responseData = await response.json(); // Get JSON data from response
      console.log("task list Response data:", responseData.data);

      // Store response data in Ionic Storage
      if (db) {
        await db.set("md-task-list", responseData.data);
        console.log(
          "Task list data has been successfully stored in Ionic Storage:",
          responseData.data
        );
      } else {
        console.error("Storage instance is not initialized");
      }
    } catch (error) {
      console.error("Error fetching and storing task data:", error);
      throw error;
    }
  };

  // =====================md-chemicals=====================

  interface Task {
    sub_service_id: string; // Adjust type as per your actual data structure
    // Add other properties if necessary
  }
  // const fetchChemicalData = async (service_id: string, userData: any) => {
  //   try {
  //     // Construct request body
  //     const requestBody = {
  //       service_id: service_id, // Adjust according to your task structure
  //     };

  //     console.log("ChemicalData Request body:", requestBody);

  //     // Send request to API
  //     const response = await fetch(`${API_BASE_URL}/get-items`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${userData.api_token}`,
  //       },
  //       body: JSON.stringify(requestBody),
  //     });

  //     // Handle response
  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       console.error("Failed to fetch data:", errorText);
  //       throw new Error(`Failed to fetch data: ${errorText}`);
  //     }

  //     // Parse response data
  //     const responseData = await response.json();
  //     console.log("ChemicalData Response data:", responseData.data);

  //     // Push responseData.data into allData array
  //     return responseData.data;
  //   } catch (error) {
  //     console.error("Error fetching data for task:", service_id, error);
  //     throw error; // Propagate error to the outer catch block
  //   }
  // };

  const fetchChemicalData = async (service_ids: string[], userData: any) => {
    const taskDataStr = localStorage.getItem("activeTaskData");
    if (!taskDataStr) {
      throw new Error("Task Data is not available");
    }
    const activeTaskData = JSON.parse(taskDataStr);

    // Ensure service_ids is an array
    if (!Array.isArray(service_ids)) {
      throw new Error("service_ids must be an array");
    }

    try {
      const requestBody = {
        columns: [
          "tbl_item_service_mapping.id",
          "tbl_item_service_mapping.item_id",
          "tbl_items.item_name",
          "tbl_item_service_mapping.unit_id",
          "tbl_uoms.name",
        ],
        order_by: {
          "tbl_items.item_name": "asc",
        },
        filters: {
          "tbl_item_service_mapping.service_id": service_ids,
        },
        pagination: {
          limit: "0",
          page: "1",
        },
      };

      const response = await fetch(
        "https://rpwebapps.us/clients/landscape-dev/api/v2/get-chemicals-used-for-pest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData?.api_token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      // Handle response
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch data:", errorText);
        throw new Error(`Failed to fetch data: ${errorText}`);
      }

      // Parse response data
      const responseData = await response.json();
      console.log("ChemicalData Response data:", responseData.data);

      // Return responseData.data
      return responseData.data;
    } catch (error) {
      console.error("Error fetching data for task:", service_ids, error);
      throw error; // Propagate error to the outer catch block
    }
  };

  const fetchChemicalUsed = async () => {
    try {
      // Fetch current location
      const pos = await getCurrentLocation();
      if (!pos) {
        throw new Error("Failed to fetch Location");
      }

      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;

      // Fetch user data from localStorage
      const userDataString = localStorage.getItem("userData");
      if (!userDataString) {
        throw new Error("User Data Not available");
      }
      const userData = JSON.parse(userDataString);

      // Ensure db is initialized before attempting to fetch tasks
      if (!db) {
        throw new Error("Database instance is not initialized");
      }

      // Fetch tasks from the database
      const tasks: Array<any> = await db.get("md-task-list");
      console.log("ChemicalData Tasks fetched:", tasks);

      // Check if tasks is valid and has data
      if (!tasks || tasks.length === 0) {
        throw new Error("No tasks found or task data is invalid");
      }

      // Array to hold all fetched data
      let allData: Array<any> = [];

      // Extract unique service_ids
      let serviceIdArr = tasks.map((task) => task.service_id);
      let serviceIdArrRe = [...new Set(serviceIdArr)];

      console.log("serviceIdArrRe", serviceIdArrRe);
      console.log("serviceIdArr", serviceIdArr);

      // Fetch data for all unique service_ids
      let tempArr = await fetchChemicalData(serviceIdArrRe, userData);
      console.log("tempArr", tempArr);
      allData = allData.concat(tempArr);

      // Flatten allData array (if responseData.data is array of arrays)
      // allData = allData.flat();

      console.log("All ChemicalData fetched:", allData);

      // Store allData in Ionic Storage
      if (db) {
        await db.set("md-chemicalsUsed", allData);
        console.log(
          "Pest types data has been successfully stored in Ionic Storage:",
          allData
        );
      } else {
        console.error("Storage instance is not initialized");
      }
    } catch (error) {
      console.error("Error fetching and storing pest list data:", error);
      throw error;
    }
  };

  // =====================md-idleteam=====================

  const fetchIdealTechnicians = async () => {
    try {
      const pos = await getCurrentLocation();
      if (!pos) {
        throw new Error("Failed to fetch Location");
      }

      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;

      const userDataString = localStorage.getItem("userData");
      if (!userDataString) {
        throw new Error("User Data Not available");
      }

      const userData = JSON.parse(userDataString);

      const payload = {
        columns: [
          "user_id",
          "first_name",
          "last_name",
          "email_id",
          "mobile_no",
          "avatar",
        ],
        order_by: {
          created_on: "asc",
        },
        filters: {
          last_action: "1",
          work_status: "idle",
        },
        pagination: {
          limit: "10",
          page: "0",
        },
      };

      console.log("Request body:", payload);

      const response = await fetch(`${API_BASE_URL}/get-ideal-technicians`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.api_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch data:", errorText);
        throw new Error(`Failed to fetch data: ${errorText}`);
      }

      const responseData = await response.json(); // Get JSON data from response
      console.log("Response data:", responseData.data);

      // Store both request body and response data in localStorage
      //   localStorage.setItem("requestBody", JSON.stringify(requestBody));
      //   localStorage.setItem("responseData", JSON.stringify(responseData));

      // Store response data in Ionic Storage
      if (db) {
        await db.set("md-idleteam", responseData.data);
        console.log(
          "Task list data has been successfully stored in Ionic Storage:",
          responseData.data
        );
      } else {
        console.error("Storage instance is not initialized");
      }
    } catch (error) {
      console.error("Error fetching and storing task data:", error);
      throw error;
    }
  };

  // =====================md-pestTypes =====================

  // interface Task {
  //   sub_service_id: string; // Adjust type as per your actual data structure
  //   // Add other properties if necessary
  // }
  // const fetchPestData = async (service_id: string, userData: any) => {
  //   try {
  //     // Construct request body
  //     const requestBody = {
  //       columns: ["id", "sub_service_id", "pest_report_type"],
  //       order_by: {
  //         created_on: "asc",
  //       },
  //       filters: { sub_service_id: service_id }, // Adjust according to your task structure
  //       pagination: {
  //         limit: "0",
  //         page: "1",
  //       },
  //     };

  //     console.log("Pest Types Request body:", requestBody);

  //     // Send request to API
  //     const response = await fetch(`${API_BASE_URL}/get-pests-list`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${userData.api_token}`,
  //       },
  //       body: JSON.stringify(requestBody),
  //     });

  //     // Handle response
  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       console.error("Failed to fetch data:", errorText);
  //       throw new Error(`Failed to fetch data: ${errorText}`);
  //     }

  //     // Parse response data
  //     const responseData = await response.json();
  //     console.log("Pest Types Response data:", responseData.data);

  //     // Push responseData.data into allData array
  //     return responseData.data;
  //   } catch (error) {
  //     console.error("Error fetching data for task:", service_id, error);
  //     throw error; // Propagate error to the outer catch block
  //   }
  // };

  const fetchPestData = async (userData: any, visitIds: number[]) => {
    try {
      const requestBody = {
        visit_id: visitIds, // Pass array of visit_ids
      };

      const response = await fetch(
        `https://rpwebapps.us/clients/landscape-dev/api/v2/get-pests-reported-by-visit`,
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
        const errorText = await response.text();
        console.error("Failed to fetch data:", errorText);
        throw new Error(`Failed to fetch data: ${errorText}`);
      }

      const responseData = await response.json();
      console.log("Pest Types Response data:", responseData.data);

      return responseData.data;
    } catch (error) {
      console.error("Error fetching data for visitIds:", error);
      throw error;
    }
  };

  const fetchPestListData = async () => {
    try {
      const pos = await getCurrentLocation();
      if (!pos) {
        throw new Error("Failed to fetch Location");
      }

      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;

      const userDataString = localStorage.getItem("userData");
      if (!userDataString) {
        throw new Error("User Data Not available");
      }
      const userData = JSON.parse(userDataString);

      if (!db) {
        throw new Error("Database instance is not initialized");
      }

      const tasks: Array<any> = await db.get("md-task-list");
      console.log("Tasks fetched:", tasks);

      if (!tasks || tasks.length === 0) {
        throw new Error("No tasks found or task data is invalid");
      }

      let visitIdArr = tasks.map((task) => task.id); // Extracting visit_ids
      let uniqueVisitIds = [...new Set(visitIdArr)]; // Removing duplicates

      console.log("Unique visit IDs:", uniqueVisitIds);

      let allData = await fetchPestData(userData, uniqueVisitIds);
      console.log("All Pest Types data fetched:", allData);

      if (db) {
        await db.set("md-pestTypes", allData);
        console.log(
          "Pest types data has been successfully stored in Ionic Storage:",
          allData
        );
      } else {
        console.error("Storage instance is not initialized");
      }
    } catch (error) {
      console.error("Error fetching and storing pest list data:", error);
      throw error;
    }
  };


  // =====================md-recommendations=====================

  const fetchRecommendationData = async () => {
    try {
      const pos = await getCurrentLocation();
      if (!pos) {
        throw new Error("Failed to fetch Location");
      }

      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;

      const userDataString = localStorage.getItem("userData");
      //   const actTaskData = getActTaskData()[0].service_id;
      if (!userDataString) {
        throw new Error("User Data Not available");
      }

      const userData = JSON.parse(userDataString);

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch data:", errorText);
        throw new Error(`Failed to fetch data: ${errorText}`);
      }

      const responseData = await response.json(); // Get JSON data from response
      console.log("Response data:", responseData.data);

      // Store both request body and response data in localStorage
      //   localStorage.setItem("requestBody", JSON.stringify(requestBody));
      //   localStorage.setItem("responseData", JSON.stringify(responseData));

      // Store response data in Ionic Storage
      if (db) {
        await db.set("md-recommendations", responseData.data);
        console.log(
          "Task list data has been successfully stored in Ionic Storage:",
          responseData.data
        );
      } else {
        console.error("Storage instance is not initialized");
      }
    } catch (error) {
      console.error("Error fetching and storing task data:", error);
      throw error;
    }
  };

  // =====================md-workdoneQuestionnaire=====================

  interface Task {
    sub_service_id: string; // Adjust type as per your actual data structure
    // Add other properties if necessary
  }
  const fetchWorkDoneQuestionaireData = async (
    serviceIds: string[],
    userData: any
  ) => {
    try {
      // Construct request body with service_ids as a comma-separated string
      const requestBody = {
        service_id: serviceIds.join(","), // Join IDs into a comma-separated string
      };

      console.log("workdone-questionnaire Request body:", requestBody);

      // Send request to API
      const response = await fetch(
        `https://rpwebapps.us/clients/landscape-dev/api/v1/get-work-done-questionnaire`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.api_token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      // Handle response
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch data:", errorText);
        throw new Error(`Failed to fetch data: ${errorText}`);
      }

      // Parse response data
      const responseData = await response.json();
      console.log("Work Done Questionnaire Response data:", responseData);

      // Check for API-specific error messages
      if (!responseData.success) {
        throw new Error(
          `API Error: ${responseData.message || "Unknown error"}`
        );
      }

      // Return the combined response data and service_ids
      return {
        service_ids: serviceIds,
        data: responseData.data || [], // Default to empty array if no data
      };
    } catch (error) {
      console.error("Error fetching data for service_ids:", serviceIds, error);
      throw error; // Propagate error to the outer catch block
    }
  };

  const fetchWorkDoneQuestionaire = async () => {
    try {
      // Fetch current location
      const pos = await getCurrentLocation();
      if (!pos) {
        throw new Error("Failed to fetch Location");
      }

      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;

      // Fetch user data from localStorage
      const userDataString = localStorage.getItem("userData");
      if (!userDataString) {
        throw new Error("User Data Not available");
      }
      const userData = JSON.parse(userDataString);

      // Ensure db is initialized before attempting to fetch tasks
      if (!db) {
        throw new Error("Database instance is not initialized");
      }

      // Fetch tasks from the database
      const tasks: Array<any> = await db.get("md-task-list");
      console.log("done-questionnaire Tasks fetched:", tasks);

      // Check if tasks is valid and has data
      if (!tasks || tasks.length === 0) {
        throw new Error("No tasks found or task data is invalid");
      }

      // Extract unique service_ids
      const serviceIdArr = tasks.map((task) => task.service_id);
      const serviceIdArrRe = [...new Set(serviceIdArr)];

      console.log("Unique service IDs:", serviceIdArrRe);

      // Fetch data for all service_ids in a single request
      const { data, service_ids } = await fetchWorkDoneQuestionaireData(
        serviceIdArrRe,
        userData
      );

      // Combine data and service_ids into a single array of objects
      const combinedData = data.map((item: any) => ({
        ...item,
        service_ids: service_ids,
      }));

      console.log("Combined data with service_ids:", combinedData);

      // Store combinedData in Ionic Storage
      if (db) {
        await db.set("md-workdoneQuestionnaire", combinedData);
        console.log(
          "Work done questionnaire data has been successfully stored in Ionic Storage:",
          combinedData
        );
      } else {
        console.error("Storage instance is not initialized");
      }
    } catch (error) {
      console.error(
        "Error fetching and storing work done questionnaire data:",
        error
      );
      throw error;
    }
  };

  // =====================task-complete--Data=====================

  const fetchCompletedData = async () => {
    try {
      const pos = await getCurrentLocation();
      if (!pos) {
        throw new Error("Failed to fetch Location");
      }

      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;

      const userDataString = localStorage.getItem("userData");
      if (!userDataString) {
        throw new Error("User Data Not available");
      }

      const userData = JSON.parse(userDataString);

      const requestBody = {
        columns: [
          "tbl_visits.id",
          "tbl_services.service_name",
          "tbl_locations.address",
          "tbl_visits.status",
          "tbl_visits.created_on",
          "tbl_visits.service_date",
          "tbl_visits.expiry_date",
          "tbl_visits.preffered_time",
          "tbl_status.status_name as service_status",
          "tbl_visits.visit_type",
          "tbl_visits.reference_number",
          "tbl_visits.priority",
          "tbl_visits.service_id",
        ],
        order_by: {
          "tbl_visits.created_on": "desc",
        },
        filters: {
          "tbl_visits.service_status": "18",
        },
        pagination: {
          limit: "0",
          page: "1",
        },
        coordinates: {
          latitude: latitude, // corrected this line
          longitude: longitude, // corrected this line
        },
      };

      console.log("complete task Request body:", requestBody);

      const response = await fetch(
        "https://rpwebapps.us/clients/landscape-dev/api/v2/task-list",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.api_token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch data:", errorText);
        throw new Error(`Failed to fetch data: ${errorText}`);
      }

      const responseData = await response.json(); // Get JSON data from response
      console.log("complete task Response data:", responseData.data);

      // Store both request body and response data in localStorage
      //   localStorage.setItem("requestBody", JSON.stringify(requestBody));
      //   localStorage.setItem("responseData", JSON.stringify(responseData));

      // Store response data in Ionic Storage
      if (db) {
        await db.set("md-completed-Task-Details", responseData.data);
        console.log(
          "Task list data has been successfully stored in Ionic Storage:",
          responseData.data
        );
      } else {
        console.error("Storage instance is not initialized");
      }
    } catch (error) {
      console.error("Error fetching and storing task data:", error);
      throw error;
    }
  };
  // =====================task-exe--Data=====================
  interface Task {
    sub_service_id: string; // Adjust type as per your actual data structure
    // Add other properties if necessary
  }
  // Function to fetch execution data for a single taskId
  const fetchExecutionData = async (taskId: string, userData: any) => {
    try {
      const requestBody = { visit_id: taskId };
      const response = await fetch(
        `https://rpwebapps.us/clients/landscape-dev/api/v1/get-visit-execution-details-v2`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.api_token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );
  
      if (!response.ok) {
        let message = `Failed to fetch data for visit_id: ${taskId}. Status code: ${response.status}`;
  
        if (response.status === 400) {
          alert(
            `Too many attempts for visit_id: ${taskId}. Status code: ${response.status}`
          );
        } else if (response.status === 500) {
          alert(
            `Something went wrong for visit_id: ${taskId}. Status code: ${response.status}`
          );
        } else {
          const errorText = await response.text();
          alert(`${message}. Error: ${errorText}`);
        }
        return null; // Or handle as needed
      }
  
      const responseData = await response.json();
  
      // Validate and restructure response data
      if (!responseData || !responseData.data) {
        throw new Error("Invalid response data");
      }
  
      const executionDetails = {
        ...responseData.data,
        visit_id: taskId,
      };
  
      return executionDetails;
    } catch (error) {
      alert(`Failed to fetch data for visit_id: ${taskId}`);
      console.error("Error fetching data for task:", taskId, error);
      throw error;
    }
  };
  
  // Function to fetch execution details for the first task only
  const fetchExecutionDetails = async () => {
    try {
      const pos = await getCurrentLocation();
      if (!pos) throw new Error("Failed to fetch Location");
  
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;
  
      const userDataString = localStorage.getItem("userData");
      if (!userDataString) throw new Error("User Data Not available");
      const userData = JSON.parse(userDataString);
  
      if (!db) throw new Error("Database instance is not initialized");
  
      const tasks: Array<any> = await db.get("md-task-list");
      if (!tasks || tasks.length === 0)
        throw new Error("No tasks found or task data is invalid");
  
      const taskIdArr = tasks.map((task) => task.id);
      const uniqueTaskIds = [...new Set(taskIdArr)]; // Remove duplicates
  
      if (uniqueTaskIds.length === 0) {
        console.error("No unique task IDs found");
        return;
      }
  
      // Fetch data for the first task ID only
      const firstTaskId = uniqueTaskIds[0];
  
      try {
        const executionData = await fetchExecutionData(firstTaskId, userData);
        const formattedData = executionData ? [executionData] : [];
  
        if (db) {
          await db.set("md-get-visit-execution-details", formattedData);
          console.log(
            "get-visit-execution-details has been successfully stored in Ionic Storage:",
            formattedData
          );
        } else {
          console.error("Storage instance is not initialized");
        }
      } catch (error) {
        console.error(`Error fetching data for task ID ${firstTaskId}:`, error);
      }
    } catch (error) {
      console.error("Error fetching and storing execution data:", error);
    }
  };
  
  

  // ?===============Task Details==================
  const fetchTaskDetails = async (taskIds: string[], userData: any) => {
    console.log("Task IDs:", taskIds);
    try {
      // Construct request body
      const payload = {
        columns: [
          "tbl_visits.id",
          "tbl_services.service_name",
          "tbl_locations.address",
          "tbl_visits.status",
          "tbl_visits.created_on",
          "tbl_visits.service_date",
          "tbl_visits.expiry_date",
          "tbl_visits.preffered_time",
          "tbl_status.status_name as service_status",
          "tbl_visits.visit_type",
          "tbl_visits.reference_number",
          "tbl_customers.customer_name",
          "tbl_customers.mobile_no",
          "tbl_visits.service_id",
        ],
        order_by: {
          "tbl_visits.created_on": "asc",
        },
        filters: {
          "tbl_visits.id": taskIds, // Use an array of task IDs here
        },
        pagination: {
          limit: "100", // Adjust limit if needed
          page: "0",
        },
      };

      console.log("Task Details Request body:", payload);

      // Send request to API
      const response = await fetch(
        "https://rpwebapps.us/clients/landscape-dev/api/v2/task-detail",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.api_token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      // Handle response
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch data:", errorText);
        throw new Error(`Failed to fetch data: ${errorText}`);
      }

      // Parse response data
      const responseData = await response.json();
      console.log("Task Details Response data:", responseData);

      // Check if responseData and responseData.data are defined
      if (!responseData || !responseData.data) {
        throw new Error("Invalid response data structure");
      }

      // Append taskIds to each task data
      const enrichedData = responseData.data.map((task: any) => ({
        ...task,
        visit_id: task.tbl_visits?.id || "N/A", // Use optional chaining and default value
      }));

      // Return the fetched data
      return enrichedData;
    } catch (error) {
      console.error("Error fetching data for tasks:", taskIds, error);
      throw error; // Propagate error to the outer catch block
    }
  };

  const fetchTaskDetailsData = async () => {
    try {
      // Fetch current location
      const pos = await getCurrentLocation();
      if (!pos) {
        throw new Error("Failed to fetch Location");
      }

      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;

      // Fetch user data from localStorage
      const userDataString = localStorage.getItem("userData");
      if (!userDataString) {
        throw new Error("User Data Not available");
      }
      const userData = JSON.parse(userDataString);

      // Ensure db is initialized before attempting to fetch tasks
      if (!db) {
        throw new Error("Database instance is not initialized");
      }

      // Fetch tasks from the database
      const tasks: Array<any> = await db.get("md-task-list");
      console.log("Task Details Tasks fetched:", tasks);

      // Check if tasks is valid and has data
      if (!tasks || tasks.length === 0) {
        throw new Error("No tasks found or task data is invalid");
      }

      // Extract task IDs
      const taskIdArr = tasks.map((task) => task.id);
      const uniqueTaskIds = [...new Set(taskIdArr)];

      console.log("Unique Task IDs:", uniqueTaskIds);

      // Fetch details for all task IDs in one request
      const allData = await fetchTaskDetails(uniqueTaskIds, userData);

      console.log("All Task Details data fetched:", allData);

      // Store allData in Ionic Storage
      if (db) {
        await db.set("md-task-details", allData);
        console.log(
          "Task Details data has been successfully stored in Ionic Storage:",
          allData
        );
      } else {
        console.error("Storage instance is not initialized");
      }
    } catch (error) {
      console.error("Error fetching and storing pest list data:", error);
      throw error;
    }
  };

  //===================Notifications==============
  const fetchNotifications = async () => {
    try {
      const pos = await getCurrentLocation();
      if (!pos) {
        throw new Error("Failed to fetch location");
      }
  
      const userDataString = localStorage.getItem("userData");
      if (!userDataString) {
        throw new Error("User data is not available");
      }
  
      const userData = JSON.parse(userDataString);
  
      const requestBody = {
        columns: [
          "tbl_push_notifications.id",
          "tbl_push_notifications.title",
          "tbl_push_notifications.description",
          "tbl_status.status_name",
          "tbl_push_notifications.created_on",
        ],
        order_by: {
          "tbl_push_notifications.created_on": "desc",
        },
        filters: {
          "tbl_push_notifications.status": "28",
        },
        pagination: {
          limit: "10",
          page: "0",
        },
      };
  
      console.log("Notification list Request body:", requestBody);
  
      const response = await fetch(`${API_BASE_URL}/get-notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.api_token}`,
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch data:", errorText);
        throw new Error(`Failed to fetch data: ${errorText}`);
      }
  
      const responseData = await response.json();
      console.log("Notification list Response data:", responseData);
  
      // Assuming notifications are stored in responseData.data
      const notifications = responseData;
  
      if (db) {
        await db.set("md-notification-list", notifications);
        console.log(
          "Notification list data has been successfully stored in Ionic Storage:",
          notifications
        );
      } else {
        console.error("Storage instance is not initialized");
      }
  
      // return notifications; // Return the notifications array
    } catch (error) {
      console.error("Error fetching and storing notification data:", error);
      throw error;
    }
  };
  
   const visitStatusCount = async () => {
    const userDataString = localStorage.getItem("userData");
    if (!userDataString) throw new Error("User Data Not available");
    const userData = JSON.parse(userDataString);
    try {
      const response = await fetch(`${API_BASE_URL}/visit-status-count`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.api_token}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Visit Status Count Response data:", data);
  
        if (db) {
          await db.set("md-visit-status-count", data);
          console.log(
            "Visit status count data has been successfully stored in Ionic Storage:",
            data
          );
        } else {
          console.error("Storage instance is not initialized");
        }
        
        return data; // Return the data if needed
      } else {
        console.error("Failed to fetch Visit Status Count:", response.status);
        return null;
      }
    } catch (error) {
      console.error("Error in Visit status count:", error);
    }
  };
  //=======================================================

  const fetchData = async () => {
    let anyOtxPending = await anyUpSyncPending();
    if (anyOtxPending) {
      // // behave like upload sync
      // console.log("OTX pending for upload, show alert and up sync");
      // // show alert with message "Offline transactions are pending for Upload, Continue?" , Yes or No
      // //If yes upload will start

      presentAlert({
        header: "Offline transactions pending",
        message: "Offline transactions are pending for Upload, Continue?",
        buttons: [
          {
            text: "No",
            role: "cancel",
            handler: () => {
              console.log("Upload canceled");
            },
          },
          {
            text: "Yes",
            handler: async () => {
              console.log("OTX pending for upload, starting upload");
              setLoading(true);
              try {
                // await fetchNotifications();
                await fetchTaskList();
                await fetchTaskDetailsData();
                await fetchExecutionDetails();
                await fetchIdealTechnicians();
                await fetchPestListData();
                await fetchRecommendationData();
                await fetchChemicalUsed();
                await fetchWorkDoneQuestionaire();
                await fetchCompletedData();
                await fetchNotifications();
                await visitStatusCount();
              } finally {
                setLoading(false);
              }
            },
          },
        ],
        onDidDismiss: () => {
          // This will be called when the alert is dismissed, either by clicking a button or other means.
          console.log("Alert dismissed");
        },
      });
    } else {
      setLoading(true);
      try {
        await db?.clear();
        await fetchTaskList();
        await fetchTaskDetailsData();
        await fetchExecutionDetails();
        await fetchIdealTechnicians();
        await fetchPestListData();
        await fetchRecommendationData();
        await fetchChemicalUsed();
        await fetchWorkDoneQuestionaire();
        await fetchCompletedData();
        await fetchNotifications();
        await visitStatusCount();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <IonLoading
        isOpen={loading}
        message={"Sync data downloading..."}
        spinner="crescent"
      />
      <div onClick={fetchData}>
        <IonImg src="assets/images/sync-icon.svg" />
        <IonText>Sync Down</IonText>
      </div>
    </>
  );
};

export default Db;
