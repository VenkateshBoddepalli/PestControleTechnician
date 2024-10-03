import { API_BASE_URL } from "../../baseUrl";
import { Network } from "@capacitor/network";
import { Storage } from "@ionic/storage";

const storage = new Storage();
await storage.create();
export const fetchNotifications = async () => {
  // const location = useLongitudeLocation();
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    console.error("User data is not available");
    return;
  }

  const userData = JSON.parse(userDataString);
  try {
    const nwStatus = await Network.getStatus();
    if (nwStatus.connected) {
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

      const response = await fetch(`${API_BASE_URL}/get-notifications`, {
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
      console.log(response);
      return await response.json();
    } else {
      console.warn("Network is offline, fetching data from local storage");
      // Offline mode: Fetch data from local storage
      const offlineData = await storage.get("md-notification-list");
      return offlineData;
    }
  } catch (error) {
    console.error("Error fetching task data:", error);
    throw error;
  }
};

export const updateNotificationStatus = async (
  id: number,
  updateData: { read: boolean }
) => {
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    console.error("User data is not available");
    return;
  }

  const userData = JSON.parse(userDataString);
  try {
    const requestBody = {
      notification_id: id, // use the passed id
      read: updateData.read, // include the read status
    };

    const response = await fetch(
      `${API_BASE_URL}/update-push-notification-status`,
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
      throw new Error("Failed to update notification status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating notification status:", error);
    throw error;
  }
};
