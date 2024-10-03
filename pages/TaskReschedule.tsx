import {
  IonButton,
  IonContent,
  IonFooter,
  IonItem,
  IonLabel,
  IonList,
  IonTextarea,
  IonText,
  IonToolbar,
  IonDatetime,
  IonBackButton,
  IonButtons,
  IonTitle,
  IonImg,
  IonIcon,
  IonHeader,
} from "@ionic/react";
import { useHistory } from "react-router";
import { useState, useEffect } from "react";
import CommonHeader from "../components/CommonHeader";
import useLongitudeLocation from "../components/useLongitudeLocation";
import { API_BASE_URL } from "../data/baseUrl";
import { toast } from "react-toastify";
import moment from "moment-timezone";
import { ellipse } from "ionicons/icons";
const TaskReschedule: React.FC = () => {
  const location = useLongitudeLocation();
  const history = useHistory();

  const [rescheduleDatetime, setRescheduleDatetime] = useState<string>("");
  const [rescheduleNotes, setRescheduleNotes] = useState<string>("");
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = () => {
      try {
        const userDataString = localStorage.getItem("userData");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUserData(userData);
        } else {
          throw new Error("User Data is not available");
        }
      } catch (error: any) {
        console.error(error.message);
        setError("User data is not available.");
      }
    };

    fetchUserData();
  }, []);

  const activeTaskStr = localStorage.getItem("activeTaskData");
  if (!activeTaskStr) {
    throw new Error("Task Data not available");
  }
  const activeTaskData = JSON.parse(activeTaskStr);
  const visit_id = activeTaskData.id;
  const task_date = activeTaskData.created_on;
  const taskDate = task_date.split(" ")[0];

  console.log("visit id from session storage ", visit_id);
  console.log("task date from session storage", task_date);

  useEffect(() => {
    const uaeCurrentTime = moment
      .tz("Asia/Dubai")
      .format("YYYY-MM-DDTHH:mm:ss");
    setRescheduleDatetime(uaeCurrentTime);
  }, []);

  const handleReschedule = async () => {
    try {
      // Validate rescheduleNotes field before submitting
      if (!rescheduleNotes) {
        setError("Reschedule notes are required."); // Set an error state or handle validation
        return;
      }

      const requestBody = JSON.stringify({
        visit_id: visit_id,
        reschedule: rescheduleDatetime,
        latitude: location.latitude || "",
        longitude: location.longitude || "",
        reschedule_notes: rescheduleNotes,
      });

      const response = await fetch(`${API_BASE_URL}/reschedule-visit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.api_token}`,
        },
        body: requestBody,
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Reschedule response:", responseData);
        history.push("/tasks");
      } else {
        const errorData = await response.json();
        console.error("Error rescheduling visit:", errorData);
        setError(errorData.message || "Failed to reschedule");
        // toast.error('Server not responding. Please try again later.');
      }
    } catch (error) {
      console.error("Error rescheduling visit:", error);
      setError("An unexpected error occurred. Please try again.");
      toast.error("Server not responding. Please try again later.");
    }
  };
  const reset = () => {
    setRescheduleDatetime(
      moment.tz("Asia/Dubai").format("YYYY-MM-DDTHH:mm:ss")
    );
    setRescheduleNotes("");
    setError(null);
  };

  return (
    <>
      {/* <CommonHeader
        backToPath={"/tasks/" + activeTaskData.id}
        pageTitle={"Task Reschedule"}
        showIcons={false}
      /> */}
      <IonHeader
        translate="yes"
        className="ion-no-border ion-padding-horizontal"
      >
        <IonToolbar>
          <IonButtons slot="start" className="ion-no-padding">
            <IonBackButton defaultHref={"/"}></IonBackButton>
          </IonButtons>
          <IonTitle className="ion-float-start"> Task Reschedule</IonTitle>
          <div className="ion-float-end headerBts">
            <IonButton shape="round" routerLink={"/"}>
              <IonImg src="assets/images/home-outline-icon.svg" />
            </IonButton>
            <IonButton
              className="notificationsIcon"
              shape="round"
              routerLink={"/notification"}
            >
              <IonImg src="assets/images/notifications-icon.svg" />
              <IonIcon className="alertNotifi" icon={ellipse}></IonIcon>
            </IonButton>
            <IonButton shape="round" routerLink={"/profile"}>
              <IonImg src="assets/images/account-user.svg" />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ionContentColor rescheduleWrapper">
        <div className="ion-padding-horizontal ionPaddingBottom">
          <IonText className="ion-padding-vertical">
            <h1>Pick your slot</h1>
          </IonText>

          <div className="swiperBlockAgenda ion-padding-vertical">
            <IonDatetime
              className="custom-datetime"
              value={rescheduleDatetime}
              min={moment().tz("Asia/Dubai").format("YYYY-MM-DDTHH:mm:ss")}
              display-format="YYYY-MM-DD HH:mm:ss"
              onIonChange={(e: CustomEvent) => {
                // const selectedDatetime = e.detail.value!;
                // setRescheduleDatetime(selectedDatetime);
                const selectedDatetime = e.detail.value as string;
                const formattedDatetime = moment(selectedDatetime).format(
                  "YYYY-MM-DD HH:mm:ss"
                );
                setRescheduleDatetime(formattedDatetime);
              }}
            />
          </div>

          <IonList className="formlist">
            <IonItem lines="none">
              <div className="width100">
                <IonLabel className="ion-label">
                  Comment<IonText>*</IonText>
                </IonLabel>
                <IonTextarea
                  aria-label="Text"
                  placeholder="Enter your comment"
                  value={rescheduleNotes}
                  onIonInput={(e) => {
                    setRescheduleNotes(e.detail.value!);
                    setError(null); // Clear error when user starts typing
                  }}
                ></IonTextarea>
                {error && (
                  <IonText color="danger" className="error-text">
                    {error}
                  </IonText>
                )}
              </div>
            </IonItem>
          </IonList>
        </div>
      </IonContent>

      <IonFooter className="ion-footer">
        <IonToolbar className="ionFooterTwoButtons">
          <IonButton
            className="ion-button"
            fill="outline"
            color="medium"
            onClick={reset}
            // onClick={() => history.goBack()}
          >
            RESET
          </IonButton>
          <IonButton
            className="ion-button"
            color="primary"
            onClick={handleReschedule}
          >
            SUBMIT
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </>
  );
};

export default TaskReschedule;
