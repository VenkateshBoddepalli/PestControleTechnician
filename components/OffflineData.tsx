import { API_BASE_URL } from "../data/baseUrl";
import { getCurrentLocation } from "../data/providers/GeoLocationProvider";
import { fetchPestData } from "../data/apidata/taskApi/taskDataApi";
import { useState } from "react";

interface Technician {
  first_name: string;
  last_name: string;
  mobile_no: string;
  avatar?: string;
  user_id: string;
}

// export const handleSync = async (taskId?: any) => {
//   const getUserData = () => {
//     const userDataString = localStorage.getItem("userData");
//     if (!userDataString) {
//       console.error("User data is not available");
//       throw new Error("User Data Not available");
//     }
//     return JSON.parse(userDataString);
//   };

//   const fetchTaskData = async () => {
//     try {
//       const pos = await getCurrentLocation();
//       if (!pos) {
//         throw new Error("Failed to fetch Location");
//       }

//       const latitude = pos.coords.latitude;
//       const longitude = pos.coords.longitude;
//       console.log("latitude", latitude);
//       console.log("longitude", longitude);

//       const userDataString = localStorage.getItem("userData");
//       if (!userDataString) {
//         throw new Error("User Data Not available");
//       }

//       const userData = JSON.parse(userDataString);
//       console.log("User data:", userData);

//       const requestBody = {
//         columns: [
//           "tbl_visits.id",
//           "tbl_services.service_name",
//           "tbl_locations.address",
//           "tbl_visits.status",
//           "tbl_visits.created_on",
//           "tbl_visits.service_date",
//           "tbl_visits.expiry_date",
//           "tbl_visits.preffered_time",
//           "tbl_status.status_name as service_status",
//           "tbl_visits.visit_type",
//           "tbl_visits.service_id",
//         ],
//         order_by: {
//           "tbl_visits.created_on": "asc",
//         },
//         filters: {
//           "tbl_visits.service_status": "14",
//         },
//         pagination: {
//           limit: "0",
//           page: "1",
//         },
//         coordinates: {
//           latitude: latitude,  // corrected this line
//           longitude: longitude, // corrected this line
//         },
//       };

//       console.log("Request body:", requestBody);

//       const response = await fetch(`${API_BASE_URL}/task-list`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${userData.api_token}`,
//         },
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("Failed to fetch data:", errorText);
//         throw new Error(`Failed to fetch data: ${errorText}`);
//       }

//       const responseData = await response.json();
//       console.log("Response data:", responseData);

//       localStorage.setItem("OfflineTaskListData", JSON.stringify(responseData));

//       return responseData;
//     } catch (error) {
//       console.error("Error fetching task data:", error);
//       throw error;
//     }
//   };

//   const fetchTaskDetails = async (taskId: any) => {
//     const userData = getUserData();

//     try {
//         const payload = {
//             columns: [
//                 "tbl_visits.id",
//                 "tbl_services.service_name",
//                 "tbl_locations.address",
//                 "tbl_visits.status",
//                 "tbl_visits.created_on",
//                 "tbl_visits.service_date",
//                 "tbl_visits.expiry_date",
//                 "tbl_visits.preffered_time",
//                 "tbl_status.status_name as service_status",
//                 "tbl_visits.visit_type",
//                 "tbl_visits.reference_number",
//                 "tbl_customers.customer_name",
//                 "tbl_customers.mobile_no",
//             ],
//             order_by: {
//                 "tbl_visits.created_on": "asc",
//             },
//             filters: {
//                 "tbl_visits.service_status": "14",
//                 "tbl_visits.id": taskId,
//             },
//             pagination: {
//                 limit: "1",
//                 page: "0",
//             },
//         };

//         const response = await fetch(`${API_BASE_URL}/task-detail`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${userData?.api_token}`,
//             },
//             body: JSON.stringify(payload),
//         });

//         if (!response.ok) {
//             throw new Error("Failed to fetch task details");
//         }

//         const data = await response.json();

//         // Store the data in local storage
//         localStorage.setItem("OfflineTaskdetails", JSON.stringify(data));

//         return data;
//     } catch (error) {
//         console.error("Error fetching task details:", error);
//         throw error;
//     }
    
// };

//   const fetchPestListData = async () => {
//     try {
//       const pos = await getCurrentLocation();
//       if (!pos) {
//         throw new Error("Failed to fetch Location");
//       }

//       const latitude = pos.coords.latitude;
//       const longitude = pos.coords.longitude;
//       console.log("latitude", latitude);
//       console.log("longitude", longitude);

//       const pestData = await fetchPestData();
//       localStorage.setItem("OfflinePestFoundData", JSON.stringify(pestData.data));
//     } catch (error) {
//       console.error("Error handling sync:", error);
//     }
//   };

//   const fetchRecommendationData = async () => {
//     const userData = getUserData();
//     try {
//       const requestBody = {
//         columns: ["sub_service_id", "recommendation"],
//         order_by: {
//           created_on: "asc",
//         },
//         filters: {
//           sub_service_id: [3, 8, 5, 4],
//         },
//         pagination: {
//           limit: "0",
//           page: "1",
//         },
//       };

//       const response = await fetch(`${API_BASE_URL}/get-recommendation-list`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${userData?.api_token}`,
//         },
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("Failed to fetch data:", errorText);
//         throw new Error(`Failed to fetch data: ${errorText}`);
//       }

//       const data = await response.json();
//       localStorage.setItem("OfflineRecommendationData", JSON.stringify(data.data));
//       return data;
//     } catch (error) {
//       console.error("Error fetching recommendation data:", error);
//       throw error;
//     }
//   };

//   const fetchGetPestChemicalItems = async () => {
//     const userData = getUserData();
//     try {
//       const requestBody = {
//         service_id: "4",
//       };

//       const response = await fetch(`${API_BASE_URL}/get-items`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${userData?.api_token}`,
//         },
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("Failed to fetch data:", errorText);
//         throw new Error(`Failed to fetch data: ${errorText}`);
//       }

//       const data = await response.json();
//       localStorage.setItem("OfflinechemicalData", JSON.stringify(data));
//       return { response, data };
//     } catch (error) {
//       console.error("Error fetching task data:", error);
//       throw error;
//     }
//   };

//   const fetchIdealTechnicians = async (): Promise<Technician[]> => {
//     const userDataString = localStorage.getItem("userData");
//     if (!userDataString) {
//       console.error("User data is not available");
//       throw new Error("User Data Not available");
//     }
//     const userData = JSON.parse(userDataString);
//     const payload = {
//       columns: [
//         "user_id",
//         "first_name",
//         "last_name",
//         "email_id",
//         "mobile_no",
//         "avatar",
//       ],
//       order_by: {
//         created_on: "asc",
//       },
//       filters: {
//         last_action: "1",
//         work_status: "idle",
//       },
//       pagination: {
//         limit: "10",
//         page: "0",
//       },
//     };
//     try {
//       const response = await fetch(`${API_BASE_URL}/get-ideal-technicians`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${userData?.api_token}`,
//         },
//         body: JSON.stringify(payload),
//       });
//       if (response.ok) {
//         const data: Technician[] = await response.json();
//         localStorage.setItem("OfflineIdealTechnicians", JSON.stringify(data));
//         console.log("Response in fetchIdealTechnicians", data);
//         return data;
//       } else {
//         const errorText = await response.text();
//         console.error("Error fetching ideal technicians:", errorText);
//         throw new Error(`Error fetching ideal technicians: ${errorText}`);
//       }
//     } catch (error) {
//       console.error("Error fetching ideal technicians:", error);
//       throw error;
//     }
//   };

//   try {
//     await fetchTaskData();
//     await fetchTaskDetails(taskId);
//     await fetchIdealTechnicians();
//     await fetchPestListData();
//     await fetchRecommendationData();
//     await fetchGetPestChemicalItems();
//   } catch (error) {
//     console.error("Error in handleSync:", error);
//   }
// };
