import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { arrowBack } from "ionicons/icons";
import { getCurrentLocation } from "../data/providers/GeoLocationProvider";
import { taskInit } from "../data/apidata/taskApi/taskDataApi";
import { getDate, getDateTime } from "../utils/dateTimeUtils";
import {
  IonContent,
  IonItem,
  IonList,
  IonText,
  IonFooter,
  IonButton,
  IonToolbar,
  IonIcon,
} from "@ionic/react";
import {toast} from "react-toastify";

interface Material {
  id: number; // Adjust the type of id according to your API response
  item_name: string;
  quantity: string;
  name: string;
  treatment_type: string;
  unit:string;
  packaging_uom:string;
  // Add any other properties as needed
}

const MaterialList: React.FC = () => {
  const history = useHistory();
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const userDataString = localStorage.getItem("userData");
    if (!userDataString) {
      console.error("User data is not available");
      return;
    }

    const userData = JSON.parse(userDataString);

    // Retrieve checkInFlag from local storage
    const checkInFlagString = localStorage.getItem("checkInFlag");
    const checkInFlag = checkInFlagString === "true";

    // Get current location
    const pos = await getCurrentLocation();
    if (!pos) {
      console.error("Error fetching Location");
      throw new Error("Failed to fetch Location");
    }

    try {
      const formattedDate = getDateTime();
      const taskDataStr = localStorage.getItem("activeTaskData");
      if (!taskDataStr) {
        throw new Error("Task data is not available");
      }
      const activeTaskData = JSON.parse(taskDataStr);
      const taskId = activeTaskData.id; // Assuming the task ID is in the first element

      const { response, data } = await taskInit(
        taskId,
        formattedDate,
        "Service Request Start",
        "Service Initiated"
      );

      if (response.ok) {
        console.log("Response Data:", data);
        const itemsData = data.data;
        setMaterials(itemsData);
        console.log("data for chemicals");
      } else {
        console.error("Failed to fetch items. Status:", response.status);
        // toast.error('Server not responding. Please try again later.');
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error('Server not responding. Please try again later.');
    }
  };

  const handleCancel = () => {
    history.goBack();
  };

  return (
    <IonContent
      fullscreen
      className="ionContentColor"
      style={{ paddingBottom: "60px" }}
    >
      <IonToolbar>
        <IonButton fill="clear" onClick={() => history.goBack()} slot="start">
          <IonIcon slot="icon-only" icon={arrowBack} />
        </IonButton>
        <IonText>Material List</IonText>
      </IonToolbar>

      <div className="ion-padding-horizontal ionPaddingBottom">
        <IonList lines="full" className="ion-list-item">
          {materials.map((material) => (
            <IonItem key={`${material.id}_${material.item_name}_${material.treatment_type}`}>
              <IonText>
                <h2>{material.item_name}</h2>
                <p>Treatment Type:{material.treatment_type}</p>
                <p>Quantity: {material.quantity} - {material.packaging_uom||"No Units"}</p>

              </IonText>
            </IonItem>
          ))}
        </IonList>
      </div>
      <IonFooter className="ion-footer">
        <IonToolbar>
          <IonButton
            className="ion-button ion-margin-horizontal"
            fill="outline"
            expand="block"
            color="medium"
            onClick={handleCancel}
          >
            Cancel
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonContent>
  );
};

export default MaterialList;
