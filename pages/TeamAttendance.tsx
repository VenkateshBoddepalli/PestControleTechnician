import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCol,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonList,
  IonPage,
  IonRow,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  IonCheckbox,
  IonProgressBar,
} from "@ionic/react";
import { useHistory, useParams, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { submitTeamAttendenceBasedOnNetwork } from "../data/offline/entity/DataTransfer";
import CustomBackButton from "../components/CustomBackButton";
import CommonHeader from "../components/CommonHeader";
import { submitTechnicianData } from "../data/apidata/technicianData/idealTechnicianData";
import {
  Camera,
  CameraDirection,
  CameraResultType,
  CameraSource,
} from "@capacitor/camera";
import {
  ProgressStatus,
  updateTaskStatus,
} from "../data/localstorage/taskStatusStorage";
import useLongitudeLocation from "../components/useLongitudeLocation";
import FullScreenLoader from "../components/FullScreenLoader";
import { Storage } from "@ionic/storage";
import { getActiveTaskData } from "../data/localstorage/taskUtils";
import {toast} from "react-toastify";

interface Technician {
  first_name: string;
  last_name: string;
  mobile_no: string;
  avatar?: string;
  user_id: string; // Added the missing user_id property
}

interface LocationState {
  selectedTechnicianData: Technician[];
}

const TeamAttendance: React.FC = () => {
  const Location = useLongitudeLocation();
  const [baseImage, setBaseImage] = useState<any>(null);
  const { techniciansRequired } = useParams<{ techniciansRequired: string }>();
  const [isImageUploaded, setIsImageUploaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const history = useHistory();
  const [submitting, setSubmitting] = useState(false);
  const [db, setDb] = useState<Storage | null>(null);
  const goBack = () => {
    history.goBack();
  };

  const location = useLocation<LocationState>();
  const [selectedTechnicianData, setSelectedTechnicianData] = useState<
    Technician[]
  >(location.state?.selectedTechnicianData || []);

  const [showAlert, setShowAlert] = useState(false);
  const [technicianToDelete, setTechnicianToDelete] = useState<number | null>(
    null
  );

  // ===============Local Storage DB=============
  useEffect(() => {
    async function initDb() {
      const store = new Storage();
      await store.create();
      console.log("store:", store);
      setDb(store);
    }

    initDb();
  }, []);

  useEffect(() => {
    console.log("Selected Technician Data:", selectedTechnicianData);
    setLoading(false); // Set loading to false once data is fetched
  }, [selectedTechnicianData]);

  // Fetching User Data from Session Storage
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    throw new Error("User data is not available");
  }
  const userData = JSON.parse(userDataString);

  // =========================Submiting Data==========================
  const handleSubmit = async () => {
    try {
      localStorage.removeItem("selectedTechnicianDataLocal");
      setSubmitting(true);

      if (!baseImage) {
        alert("Please upload a photo before submitting.");
        setSubmitting(false);
        return;
      }

      if (Location.latitude === null || Location.longitude === null) {
        console.error("Location data is not available");
        setSubmitting(false);
        return;
      }

      const updatedSelectedTechnicianData = [...selectedTechnicianData];
      updatedSelectedTechnicianData.unshift({
        user_id: userData.user_id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        mobile_no: userData.mobile_no,
        avatar: userData.avatar,
      });

      // Validate each technician object has 'user_id'
      for (const technician of updatedSelectedTechnicianData) {
        if (!technician.user_id) {
          console.warn(
            "Technician data does not have 'user_id' property:",
            technician
          );
          throw new Error("Technician data missing 'user_id' property");
        }
      }

      let actTaskData = await getActiveTaskData();
      // Call function to handle network status and storage
      await submitTeamAttendenceBasedOnNetwork(
        actTaskData.id,
        updatedSelectedTechnicianData,
        Location.latitude,
        Location.longitude,
        baseImage
      );

      updateTaskStatus("task-id-todo", "teamAttendance", ProgressStatus.done);

      console.log("Submit successful, navigating to TaskExecution.");
      history.push("/TaskExecution");
    } catch (error) {
      console.error("Error submitting technician data:", error);
      toast.error('Server not responding. Please try again later.');
      // Handle the error appropriately, e.g., show a user-friendly message
    } finally {
      setSubmitting(false);
    }
  };

  // =========================Photo Capture==========================

  const capturePhoto = async () => {
    console.log("Launching camera");
    const image = await Camera.getPhoto({
      quality: 25,
      allowEditing: false,
      saveToGallery: false,
      source: CameraSource.Camera,
      direction: CameraDirection.Rear,
      resultType: CameraResultType.Base64,
    });
    var imageUrl = "data:image/jpeg;base64," + image.base64String;
    console.log("Captured img url ", imageUrl);
    setBaseImage(imageUrl);
    setIsImageUploaded(true);
  };

  // =========================Deleting Technician Logic==========================

  const confirmDeleteTechnician = (index: number) => {
    setTechnicianToDelete(index);
    setShowAlert(true);
  };

  const handleDeleteTechnician = () => {
    if (technicianToDelete !== null) {
      const updatedTechnicians = [...selectedTechnicianData];
      updatedTechnicians.splice(technicianToDelete, 1);
      setSelectedTechnicianData(updatedTechnicians);
      // Update localStorage after deletion
      localStorage.setItem(
        "selectedTechnicianDataLocal",
        JSON.stringify(updatedTechnicians)
      );
      setTechnicianToDelete(null);
    }
    setShowAlert(false);
  };

  // =========================TechnicianData Getting form Local Storage Logic==========================

  useEffect(() => {
    const storedData = localStorage.getItem("selectedTechnicianDataLocal");
    const previouslySelectedTechnicians = storedData
      ? JSON.parse(storedData)
      : [];
    console.log(storedData);

    // Set initial state with data from localStorage
    setSelectedTechnicianData(previouslySelectedTechnicians);
  }, []);

  // =========================Navigate to AvailableTechnicians==========================

  const handleAdd = () => {
    // Clear form data
    history.push("/availabletechnicians");
  };

  return (
    <>
      <CommonHeader
        backToPath={"/taskexecution"}
        pageTitle={"Team Attendance"}
        showIcons={false}
      />
      <IonContent fullscreen className="ionContentColor">
        {loading ? ( // Show the progress bar when loading
          <IonProgressBar type="indeterminate" />
        ) : (
          <div className="ionPaddingBottom">
            <IonList className="ion-list-item executionTopHeading ion-padding">
              <IonItem lines="none">
                <IonThumbnail slot="start" className="thumbnailIcon">
                  <IonImg src="../../../assets/images/technician-icon.svg"></IonImg>
                </IonThumbnail>
                <IonText>
                  <h2>
                    {userData.first_name} {userData.last_name}
                  </h2>
                  <h2>{userData.role_name}</h2>
                  <p>
                    {userData.user_id} | Total Technicians :{" "}
                    {selectedTechnicianData.length}
                  </p>
                </IonText>
              </IonItem>
            </IonList>
            <div className="ion-padding-horizontal ion-padding-top serviceRequestStatus">
              {selectedTechnicianData.length > 0 ||
              selectedTechnicianData.length === 0 ? (
                <>
                  <IonList lines="full" class="ion-list-item listItemAll">
                    {selectedTechnicianData.map((technician, index) => (
                      <IonItem key={index}>
                        <IonThumbnail slot="start" class="thumbnailIcon">
                          <IonImg src="assets/images/technician-icon.svg"></IonImg>
                        </IonThumbnail>
                        <IonText className="listCont">
                          <h3>
                            {technician.first_name} {technician.last_name}
                          </h3>
                          <h2>{technician.mobile_no}</h2>
                        </IonText>
                        <IonButton
                          className="itemBt"
                          shape="round"
                          onClick={() => confirmDeleteTechnician(index)}
                        >
                          <IonImg src="/assets/images/delete-icon.svg"></IonImg>
                        </IonButton>
                      </IonItem>
                    ))}
                  </IonList>

                  <IonButton
                    className="ion-button"
                    fill="solid"
                    color="medium"
                    onClick={capturePhoto}
                  >
                    Take a Photo
                  </IonButton>
                  <IonButton
                    className="ion-button"
                    fill="outline"
                    color="medium"
                    onClick={handleAdd}
                    style={{ padding: "30px", marginLeft: "23px" }}
                    disabled={parseInt(techniciansRequired) === 0}
                  >
                    Add
                  </IonButton>
                  <div className="image-container">
                    {baseImage && (
                      <img
                        src={baseImage}
                        alt="Pest Photo"
                        className="uploaded-image"
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="nodata-technician-img">
                  <IonImg
                    className="ion-text-center"
                    src="../../../assets/images/nodata-technician-img.svg"
                  ></IonImg>
                  <IonText className="ion-text-center">
                    <p>
                      No data for the technician. Please click on the button
                      below to add the technician.
                    </p>
                  </IonText>
                  <IonButton
                    fill="outline"
                    color="primary"
                    routerLink="/AvailableTechnicians"
                  >
                    Add Technician
                  </IonButton>
                </div>
              )}

              <IonToolbar>
                <IonButton
                  className="ion-button ion-margin-horizontal"
                  expand="block"
                  color={"primary"}
                  onClick={handleSubmit}
                  disabled={!isImageUploaded} // Disable the button if no image is uploaded
                >
                  Submit
                </IonButton>
              </IonToolbar>
            </div>
          </div>
        )}
        <FullScreenLoader isLoading={submitting} />
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={"Delete Technician"}
          message={"Are you sure you want to delete this technician?"}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              cssClass: "secondary",
              handler: () => {
                console.log("Cancel clicked");
              },
            },
            {
              text: "Delete",
              handler: handleDeleteTechnician,
            },
          ]}
        />
      </IonContent>
    </>
  );
};

export default TeamAttendance;
