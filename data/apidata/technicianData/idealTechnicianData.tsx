import useLongitudeLocation from "../../../components/useLongitudeLocation";
import { API_BASE_URL } from "../../baseUrl";

interface Technician {
  first_name: string;
  last_name: string;
  mobile_no: string;
  avatar?: string;
  user_id: string;
}
//////////////Fetch Ideal Technician List//////////////////
export const fetchIdealTechnicians = async (): Promise<Technician[]> => {
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    console.error("User data is not available");
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
  try {
    const response = await fetch(`${API_BASE_URL}/get-ideal-technicians`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const data: Technician[] = await response.json();
      console.log("Response in fetchIdealTechnicians", data);
      return data;
    } else {
      console.error("Error fetching ideal technicians:", response.statusText);
      throw new Error(
        `Error fetching ideal technicians: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error fetching ideal technicians:", error);
    throw error;
  }
};
////////////////////Submit Technician Data////////////////
export const submitTechnicianData = async (
  baseImage: any,
  selectedTechnicianData: Technician[],
  latitude: number,
  longitude: number
): Promise<void> => {
  // const location = useLongitudeLocation();
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    console.error("User data is not available");
    return;
  }
  const userData = JSON.parse(userDataString);
  localStorage.setItem("selectedTechnicianData", JSON.stringify(selectedTechnicianData));
  //Fetch Active Task ID
  const activeTaskStr = localStorage.getItem("activeTaskData");
  if (!activeTaskStr) {
    throw new Error("Task Data not available");
  }
  const activeTaskData = JSON.parse(activeTaskStr);
  const visit_id = activeTaskData.id;
  const visit_team = selectedTechnicianData.map((technician) => ({
    user_id: technician.user_id,
    user_image: technician.avatar || "",
  }));

  const payload = [
    {
      visit_id, //Required
      team_count: selectedTechnicianData.length.toString(), //Required
      latitude,
      longitude,
      team_photo: baseImage ? baseImage : "",
      visit_team,
    },
  ];
  try {
    const response = await fetch(`${API_BASE_URL}/add-team-attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },

      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const data = await response.json();
      console.log("Response in Submit technician data", data);
      return data;
    } else {
      console.error("Error Submit  technicians:", response.statusText);
    }
  } catch (error) {
    console.error("Error Submit  technicians:", error);
  }
};
