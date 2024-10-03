import { API_BASE_URL } from "../../baseUrl";
interface LeaveData {
  available_leaves: string;
}


export const fetchLeaveDetails = async () => {
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    console.error("User data is not available");
    return;
  }

  const userData = JSON.parse(userDataString);
  try {
    const payload = {
      pageno: 0,
      page_limit: 5,
    };

    const response = await fetch(`${API_BASE_URL}/get-leave-details`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    console.log(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching task data:", error);
    throw error;
  }
};

/////////////////// Fetch Leaves Types//////////////
export const fetchLeaveTypes = async () => {
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    console.error("User data is not available");
    return null;
  }

  const userData = JSON.parse(userDataString);

  try {
    const response = await fetch(`${API_BASE_URL}/get-leave-types`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData.api_token}`,
      },
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData.data;
    } else {
      console.error("Failed to fetch leave types. Status:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching leave types:", error);
    return null;
  }
};
////////////////////Leave Apply/////////////////
export const submitLeaveApply = async (data: any) => {
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    console.error("User data is not available");
    return { success: false, message: "User data is not available" };
  }

  const userData = JSON.parse(userDataString);

  try {
    const response = await fetch(`${API_BASE_URL}/leave-apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify({
        leave_id: "",
        user_id: userData.user_id,
        day_type: data.dayType, // Use the dayType from the data object
        leave_type_id: data.leaveTypeId,
        leave_start_date: data.leaveStartDate,
        leave_end_date: data.leaveEndDate,
        reason_for_leave: data.reasonForLeave,
      }),
    });

    console.log("Response in submitLeaveApply", response);
    const responseData = await response.json();
    console.log("Response.Json in submitLeaveApply", responseData);

    if (!response.ok) {
      throw new Error(
        responseData.message || "Failed to submit leave application."
      );
    }

    return responseData;
  } catch (error: any) {
    console.error("Error submitting leave application:", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred.",
    };
  }
};
////////////////////get-available leaves api///////////////////
export const fetchAvailableLeaves = async () => {
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    console.error("User data is not available");
    return { success: false, message: "User data is not available" };
  }

  const userData = JSON.parse(userDataString);

  try {
    const response = await fetch(`${API_BASE_URL}/get-available-leaves`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData.api_token}`,
      },
    });

    if (response.ok) {
      const responseData = await response.json();
      const data: LeaveData[] = responseData.data;
      const totalLeaves = data.reduce(
        (total: number, leave: LeaveData) =>
          total + parseFloat(leave.available_leaves),
        0
      );
      return { success: true, data, totalLeaves: totalLeaves ?? 0 };
    } else {
      console.error("Failed to fetch available leaves");
      return { success: false, message: "Failed to fetch available leaves" };
    }
  } catch (error) {
    const errorMessage = (error as Error).message || "An unexpected error occurred.";
    console.error("Error fetching data:", errorMessage);
    return { success: false, message: errorMessage };
  }
};