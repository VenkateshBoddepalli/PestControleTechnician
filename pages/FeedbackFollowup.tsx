import {
  IonButton,
  IonContent,
  IonFooter,
  IonItem,
  IonList,
  IonText,
  IonLabel,
  IonInput,
  IonToolbar,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonProgressBar,
} from "@ionic/react";
import { useHistory } from "react-router";
import CommonHeader from "../components/CommonHeader";
import { useEffect, useState, useRef } from "react";
import CustomerSignature from "../components/CustomerSignature";
import TechnicianSignature from "../components/TechnicianSignature";
import swal from "sweetalert";
import useLongitudeLocation from "../components/useLongitudeLocation";
import {
  ProgressStatus,
  updateTaskStatus,
} from "../data/localstorage/taskStatusStorage";
import { saveFeedBackBasedOnNetwork } from "../data/offline/entity/DataTransfer";
import { toast } from "react-toastify";

import { toZonedTime, format } from "date-fns-tz";
import { useForm } from "react-hook-form";
import moment from "moment-timezone";


const formatToUaeTime = (dateTime: any) => {
  const uaeTimeZone = "Asia/Dubai";
  const zonedTime = toZonedTime(dateTime, uaeTimeZone);
  return format(zonedTime, "yyyy-MM-dd HH:mm:ss");
};

const FeedbackFollowup: React.FC = () => {
  const location = useLongitudeLocation();
  const [feedback, setFeedback] = useState<string | null | undefined>("");
  const [customerSignature, setCustomerSignature] = useState<
    string | null | undefined
  >("");
  const [technicianSignature, setTechnicianSignature] = useState<
    string | null | undefined
  >("");
  const [feedbackDetails, setFeedbackDetails] = useState<
    string | null | undefined
  >("");
  const [followUpRequired, setFollowUpRequired] = useState<
    string | null | undefined
  >("");
  const [followUpDate, setFollowUpDate] = useState<string | null | undefined>(
    ""
  );
  const [completedDate, setCompletedDate] = useState<string | null | undefined>(
    ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const { clearErrors, reset } = useForm();
  const [isCustomerSignatureSaved, setIsCustomerSignatureSaved] =
    useState<boolean>(false);
  const [isTechnicianSignatureSaved, setIsTechnicianSignatureSaved] =
    useState<boolean>(false);

  const customerSignatureRef = useRef<any>(null);
  const technicianSignatureRef = useRef<any>(null);
  useEffect(() => {
    fetchUserData();
  }, []);

  const initialFormState = {
    feedback: "",
    customerSignature: "",
    technicianSignature: "",
    feedbackDetails: "",
    followUpRequired: "",
    followUpDate: "",
    completedDate: "",
  };

  const fetchUserData = () => {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setUserData(userData);
    } else {
      console.error("User Data is not available");
    }
  };
  useEffect(() => {
    const uaeCurrentTime = moment
      .tz("Asia/Dubai")
      .format("YYYY-MM-DDTHH:mm:ss");
    setFollowUpDate(uaeCurrentTime);
  }, []);

  const history = useHistory();
  const goBack = () => {
    history.goBack();
  };

  const taskId = localStorage.getItem("activeTaskData");
  if (!taskId) {
    throw new Error("Task Data not available");
  }
  const activeTaskData = JSON.parse(taskId);

  const handleSubmit = async () => {
    setFormSubmitted(true);
  
    // Validate required fields
    if (
      !feedback ||
      !customerSignature ||
      !technicianSignature ||
      !followUpRequired ||
      (followUpRequired === "Yes" && !followUpDate)
    ) {
      console.error("Please fill in all the required fields");
      return; // Stop execution if validation fails
    }
  
    // Check if customer signature is provided if form is already submitted
    if (formSubmitted && !customerSignature) {
      console.error("Please provide customer signature");
      return; // Stop execution if validation fails
    }

    // Proceed with submission
    setSubmitting(true); // Show loader
    try {
      // Prepare request body
      const requestBody = {
        visit_id: activeTaskData.id,
        customer_feedback: feedback,
        customer_signature: customerSignature || "",
        technician_signature: technicianSignature || "",
        feedback: feedbackDetails || "",
        is_follow_up_required: followUpRequired || "",
        next_follow_up: followUpDate
          ? formatToUaeTime(new Date(followUpDate))
          : null,
        latitude: location.latitude !== null ? location.latitude : 0,
        longitude: location.longitude !== null ? location.longitude : 0,
        visit_completed: completedDate || "",
        date_time: formatToUaeTime(new Date()),
      };
  
      // Call API to save feedback
      const responseData = await saveFeedBackBasedOnNetwork(
        requestBody.visit_id,
        requestBody.customer_feedback,
        requestBody.customer_signature,
        requestBody.technician_signature,
        requestBody.feedback,
        requestBody.is_follow_up_required,
        requestBody.next_follow_up,
        requestBody.latitude,
        requestBody.longitude,
        requestBody.visit_completed,
        requestBody.date_time
      );
  
      // Handle successful response
      console.log(responseData);
  
     // updateTaskStatus("", "feedBack", ProgressStatus.done); 
      swal("Success", "Task completed successfully!", "success").then(()=>{history.push("/tasks");});
      
    } catch (error) {
      // Handle errors
      console.error("Error submitting form:", error);
      // toast.error("Server not responding. Please try again later.");
    } finally {
      setSubmitting(false); // Hide loader
    }
  };
  

  console.log(customerSignature, "Customer URl");
  console.log(technicianSignature, "Technician URl");

  const getCurrentDateTime = (): string => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getCurrentDateTimeUAE = (): string => {
    const now = new Date();
    const utcOffset = now.getTimezoneOffset();
    const uaeOffset = 4 * 60;
    const totalOffset = utcOffset + uaeOffset;
    const uaeTime = new Date(now.getTime() + totalOffset * 60000);
    return uaeTime.toISOString().slice(0, 16);
  };

  const onFollowUpDateChange = (newFollowUpDateTime: any) => {
    const formattedDateTime = newFollowUpDateTime.replace("T", " ");
    setFollowUpDate(formattedDateTime);
    console.log("new follow up date time", newFollowUpDateTime);
  };

  const onCompletedDateChange = (newCompletedDateTime: any) => {
    const formattedDateTime = newCompletedDateTime.replace("T", " ");
    setCompletedDate(formattedDateTime);
    console.log("Completed Date and Time", newCompletedDateTime);
  };

  const handleCancel = () => {
    swal({
      title: "Reset Form?",
      text: "Are you sure you want to reset the form? All unsaved changes will be lost.",
      buttons: ["Cancel", "OK"],
    }).then((willReset) => {
      if (willReset) {
        // Reset form fields and errors
        setFeedback(initialFormState.feedback);
        setCustomerSignature(initialFormState.customerSignature);
        setTechnicianSignature(initialFormState.technicianSignature);
        setFeedbackDetails(initialFormState.feedbackDetails);
        setFollowUpRequired(initialFormState.followUpRequired);
        setFollowUpDate(initialFormState.followUpDate);
        setCompletedDate(initialFormState.completedDate);

        // Clear form errors explicitly
        clearErrors();
        setFormSubmitted(false)

        // Reset signature saved states
        setIsCustomerSignatureSaved(false);
        setIsTechnicianSignatureSaved(false);

        // Clear signatures using ref methods
        if (customerSignatureRef.current) {
          customerSignatureRef.current.clearSignature();
        }
        if (technicianSignatureRef.current) {
          technicianSignatureRef.current.clearSignature();
        }
      }
    });
  };

  return (
    <>
      <CommonHeader
        backToPath={"/taskexecution"}
        pageTitle={"Feedback/Follow up"}
        showIcons={false}
      />
      <IonContent fullscreen className="ionContentColor">
        <div className="ion-padding-horizontal ion-padding-vertical ionPaddingBottom">
          <IonText>
            <h1 className="headingH1">Please update the form</h1>
          </IonText>
          <IonList className="formlist">
            <IonItem lines="none">
              <div className="width100">
                <IonLabel className="ion-label">
                  Customer Feedback<IonText>*</IonText>
                </IonLabel>
                <IonSelect
                  placeholder="Select"
                  fill="outline"
                  value={feedback}
                  onIonChange={(e:CustomEvent) => setFeedback(e.detail.value ?? "")}
                  style={{ height: "55px" }}
                >
                  <IonSelectOption value="Very Good">Very Good</IonSelectOption>
                  <IonSelectOption value="Good">Good</IonSelectOption>
                  <IonSelectOption value="Satisfied">Satisfied</IonSelectOption>
                </IonSelect>
              </div>
            </IonItem>
            {formSubmitted && feedback === "" && (
              <IonText color="danger">Please select customer feedback</IonText>
            )}
            <IonItem>
              <CustomerSignature
                ref={customerSignatureRef} // Attach ref
                setCustomerSignature={(signature) => {
                  setCustomerSignature(signature);
                  setIsCustomerSignatureSaved(true);
                }}
              />
            </IonItem>
            {formSubmitted && !customerSignature && (
              <IonText color="danger">
                Please provide customer signature and save it.
              </IonText>
            )}
            <IonItem>
              <TechnicianSignature
                ref={technicianSignatureRef} // Attach ref
                setTechnicianSignature={(signature: any) => {
                  setTechnicianSignature(signature);
                  setIsTechnicianSignatureSaved(true);
                }}
              />
            </IonItem>
            {formSubmitted && !technicianSignature && (
              <IonText color="danger">
                Please provide technician signature and save it.
              </IonText>
            )}
            <IonItem lines="none">
              <div className="width100">
                <IonLabel className="ion-label">Feedback Details</IonLabel>
                <IonInput
                  aria-label="Text"
                  fill="outline"
                  placeholder=""
                  value={feedbackDetails}
                  onIonChange={(e:CustomEvent) => setFeedbackDetails(e.detail.value ?? "")}
                  // disabled={
                  //   !isCustomerSignatureSaved || !isTechnicianSignatureSaved
                  // }
                ></IonInput>
              </div>
            </IonItem>
            <IonItem lines="none">
              <div className="width100">
                <IonLabel className="ion-label">
                  Follow-up Required <IonText>*</IonText>
                </IonLabel>
                <IonSelect
                  placeholder="Select"
                  fill="outline"
                  value={followUpRequired}
                  onIonChange={(e:CustomEvent) => setFollowUpRequired(e.detail.value ?? "")}
                  style={{ height: "55px" }}
                >
                  <IonSelectOption value="Yes">Yes</IonSelectOption>
                  <IonSelectOption value="No">No</IonSelectOption>
                </IonSelect>
              </div>
            </IonItem>
            {formSubmitted && !followUpRequired && (
              <IonText color="danger">
                Please select follow-up requirement
              </IonText>
            )}
            {followUpRequired === "Yes" && (
              <IonItem lines="none">
                <div className="width100">
                  <IonLabel className="ion-label">Follow-up Date</IonLabel>
                  <IonDatetime
                    value={followUpDate || getCurrentDateTime()}
                    min={moment().tz("Asia/Dubai").format("YYYY-MM-DDTHH:mm:ss")}
                    display-format="YYYY-MM-DDTHH:mm"
                    onIonChange={(e: CustomEvent) =>
                      onFollowUpDateChange(e.detail.value ?? "")
                    }
                  ></IonDatetime>
                </div>
              </IonItem>
            )}
            {followUpRequired === "Yes" && formSubmitted && !followUpDate && (
              <IonText color="danger">Please select follow-up date</IonText>
            )}
          </IonList>
        </div>
      </IonContent>
      <div>
        <IonFooter className="ion-footer">
          <IonToolbar className="ionFooterTwoButtons">
            <IonButton
              className="ion-button"
              fill="outline"
              color="medium"
              onClick={handleCancel}
            >
              Reset
            </IonButton>
            <IonButton
              className="ion-button"
              color="primary"
              onClick={handleSubmit}
            >
              Submit
            </IonButton>
          </IonToolbar>
        </IonFooter>
      </div>
      {/* <FullScreenLoader isLoading={submitting} /> */}
    </>
  );
};

export default FeedbackFollowup;
