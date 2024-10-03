import { API_BASE_URL } from "../../baseUrl";
import { getActiveTaskData } from "../../localstorage/taskUtils";
import { getCurrentLocation } from "../../providers/GeoLocationProvider";
/////Get User Data from session Storage///////////
const getUserData = () => {
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    console.error("User data is not available");
    throw new Error("User Data Not available");
  }
  return JSON.parse(userDataString);
};

export const loginApi = async (username: string, password: string) => {
  try {
    let device_id = localStorage.getItem("device_token");
    if (!device_id) device_id = "web-app";

    // const device_id = "abc123testdevid";
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, device_id }),
    });
    const data = await response.json();
    return { response, data };
  } catch (error) {
    throw error;
  }
};

export const userCheckIn = async () => {
  const userData = getUserData();

  // Get current location
  const pos = await getCurrentLocation();
  if (!pos) {
    console.error("Error fetching Location");
    throw new Error("Failed to fetch Location");
  }

  try {
    const requestBody = {
      type: 1, // 1-CHECK_IN, 2-CHECK_OUT
      user_id: userData.user_id,
      location: `${pos.coords.latitude},${pos.coords.longitude}`,
    };

    const response = await fetch(`${API_BASE_URL}/user-attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status == 401) {
        console.log("Already check in scenario:::", response.body);
      } else {
        throw new Error("Failed to check In ");
      }
    }
    console.log("Response in Check IN  API latyer :::", response);
    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error("Error Checking IN Catch:", error);
    throw error;
  }
};

export const postDataToLocationTracking = async (
  latitude: number,
  longitude: number,
  actTaskId: String
) => {
  const userData = getUserData();
  const actTaskData = getActiveTaskData();
  const currentTime = new Date();
  const hours = currentTime.getHours().toString().padStart(2, "0");
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");
  const formattedTime = `${hours}:${minutes}`;

  const data = [
    {
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      track_date: new Date().toISOString().slice(0, 10),
      track_time: formattedTime,
      visit_id: actTaskId,
    },
  ];

  try {
    const response = await fetch(
      `${API_BASE_URL}/technician-location-tracking`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.api_token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to  post location  data");
    }
  } catch (error) {
    console.error("Error  posting  location data:", error);
    throw error;
  }
};

export const handleCheckOut = async () => {
  const userData = getUserData();
  const pos = await getCurrentLocation();
  if (!pos) {
    console.error("Error fetching Location");
    throw new Error("Failed to fetch Location");
  }
  const payload = {
    type: 2, // 1-CHECK_IN, 2-CHECK_OUT
    user_id: userData.user_id,
    location: `${pos.coords.latitude},${pos.coords.longitude}`,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/user-attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      return { success: true };
    } else {
      console.error("Failed to check out:", data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error during check out:", error.message);
      return { success: false, message: error.message };
    } else {
      console.error("Unexpected error during check out");
      return { success: false, message: "Unexpected error during check out" };
    }
  }
};
///////////////////////change password API///////////////////////////////////////////////////
export const changePasswordApi = async (requestBody: any) => {
  try {
    const userData = getUserData();
    const response = await fetch(`${API_BASE_URL}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData.api_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else {
      throw new Error("Failed to change password");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};

export const userCheckIns = async (userData: any) => {
  // Get current location
  const pos = await getCurrentLocation();
  if (!pos) {
    console.error("Error fetching Location");
    throw new Error("Failed to fetch Location");
  }

  try {
    const requestBody = {
      type: 1, // 1-CHECK_IN, 2-CHECK_OUT
      user_id: userData.user_id,
      location: `${pos.coords.latitude},${pos.coords.longitude}`,
    };

    const response = await fetch(`${API_BASE_URL}/user-attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData.api_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log("Already check in scenario:::", response.body);
      } else {
        throw new Error("Failed to check In");
      }
    }
    console.log("Response in Check IN API layer :::", response);
    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error("Error Checking IN Catch:", error);
    throw error;
  }
};
