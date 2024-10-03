import {
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
  IonLabel,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonBadge,
  IonGrid,
} from "@ionic/react";
import { useHistory, useLocation, useParams } from "react-router";
import CustomBackButton from "../components/CustomBackButton";
import CommonHeader from "../components/CommonHeader";
import { useEffect, useState, useRef } from "react";
import { object, string } from "yup";
import FeedbackFollowup from "./FeedbackFollowup";
import { API_BASE_URL } from "../data/baseUrl";
import { fetchvisitExecutionpreview } from "../data/apidata/taskApi/taskDataApi";
import { retrievevisitExecutionDetailsBasedonNetwork } from "../data/offline/entity/DataRetriever";
import { toast, ToastContainer } from "react-toastify";
import { formatDate, formatTime } from "../utils/dateTimeUtils";
import GoTop from "../components/GoTop";
interface LocationState {
  from: string;
}

const TaskPreview: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const pestActivityRef = useRef<HTMLDivElement>(null);
  const goBack = () => {
    history.goBack();
  };

  const [taskData, setTaskData] = useState<any[]>([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<any[]>([]);
  const [pestFoundData, setPestFoundData] = useState<any[]>([]);
  const [recommData, setRecommData] = useState<any[]>([]);
  const [selectChemical, setSelectChemical] = useState<any[]>([]);
  const [selectChemicals, setSelectChemicals] = useState<any[]>([]);
  const [workDonedetails, setWorkDonedetails] = useState<any[]>([]);
  const [selectFeedback, setFeedbackDetails] = useState<any[]>([]);
  const [PestFound, setPestFound] = useState<any[]>([]);
  const [activityUsageArrays, setActivityUsageArray] = useState<any[]>([]);
  const [previewChemicalused, setActivityUsageArrays] = useState<any[]>([]);

  const [multiRecomm, multiRecomDetails] = useState<any[]>([]);
  const [isElementLoaded, setIsElementLoaded] = useState(false);

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchDataFromStorage = (key: any) => {
      const storedData = sessionStorage.getItem(key);
      if (storedData) {
        return JSON.parse(storedData);
      } else {
        const localStorageData = localStorage.getItem(key);
        if (localStorageData) {
          return JSON.parse(localStorageData);
        }
        return null;
      }
    };
    const taskDataStr = localStorage.getItem("activeTaskData");
    if (!taskDataStr) {
      throw new Error("Task Data is not available");
    }
    const activeTaskData = JSON.parse(taskDataStr);
    const visitId = activeTaskData.id;

    setTaskData(fetchDataFromStorage("activeTaskData") || []);
  }, []);

  useEffect(() => {
    const taskDataStr = localStorage.getItem("activeTaskData");
    if (!taskDataStr) {
      throw new Error("Task Data is not available");
    }
    const activeTaskData = JSON.parse(taskDataStr);
    const visitId = activeTaskData.id;

    const fetchData = async () => {
      const userDataString = localStorage.getItem("userData");
      if (!userDataString) {
        console.error("user Data is not available");
        return;
      }

      const userData = JSON.parse(userDataString);
      // try {
      //   const requestBody = {
      //     visit_id: visitId,
      //   }

      //   const responseData = await fetchvisitExecutionpreview(requestBody);

      //   console.log(
      //     "using data for taskpreview------------------------------->",
      //     responseData
      //   );

      //   let res = responseData.data;
      //   setFormData(res);
      // }

      try {
        const visitExecutionDetails =
          await retrievevisitExecutionDetailsBasedonNetwork(visitId);

        if (visitExecutionDetails) {
          // let res = visitExecutionDetails.data;
          console.log(
            "Visit Execution Details retrieved:---------------------------->",
            visitExecutionDetails
          );
          // Assuming setFormData is a function to update your component state
          setFormData(visitExecutionDetails);
        } else {
          console.log(
            "Visit Execution Details not found or could not be retrieved."
          );
          // toast.error("Server not responding. Please try again later.");
          // Handle case where visit execution details are not available
        }
      } catch (error: any) {
        console.error("Error fetching data", error);
        toast.error("Server not responding. Please try again later.");
      }
    };

    fetchData();
  }, []);
  console.log(formData);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#pestActivitySection") {
      const pestActivitySection = document.getElementById(
        "pestActivitySection"
      );
      console.log(pestActivitySection); // For debugging

      if (pestActivitySection) {
        // Element found, scroll smoothly
        pestActivitySection.scrollIntoView({ behavior: "smooth" });
      } else {
        console.error('Element with ID "pestActivitySection" not found'); // Optional error handling
      }
    }
  }); // Empty dependency array to run only once
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#chemicalUsedSection") {
      const chemicalUsedSection = document.getElementById(
        "chemicalUsedSection"
      );
      console.log(chemicalUsedSection); // For debugging

      if (chemicalUsedSection) {
        // Element found, scroll smoothly
        chemicalUsedSection.scrollIntoView({ behavior: "smooth" });
      } else {
        console.error('Element with ID "chemicalUsedSection" not found'); // Optional error handling
      }
    }
  }); // Empty dependency array to run only once

  // useEffect(() => {
  //   console.log("Current Hash:", window.location.hash);
  // }, []);

  const getBackPath = () => {
    const location = useLocation<{ state: LocationState }>();

    if (location.state?.state?.from) {
      return location.state.state.from;
    }

    return "/taskexecution"; // Default fallback path
  };

  return (
    <>
      <ToastContainer />
      <CommonHeader
        backToPath={"/taskexecution"}
        pageTitle={"Task Preview"}
        showIcons={false}
      />
      <IonContent className="ionContentColor previewWrpp">
        <div className="ionPaddingBottom">
          <IonCard>
            <IonText className="siteName">
              <IonText className="previewHeading">
                <h2>Site Name</h2>
              </IonText>
              {formData && formData.site_name && <h3>{formData.site_name}</h3>}
            </IonText>
          </IonCard>

          {/* Team Attendance  */}
          <IonCard className="ion-padding-horizontal">
            <IonText className="previewHeading">
              <h2>Team Attendance</h2>
            </IonText>

            {/* Display only one technician */}
            {formData && formData.team && formData.team.length > 0 && (
              <IonList className="listItemAll">
                <IonItem lines="none">
                  <IonThumbnail slot="start" className="thumbnailIcon">
                    <IonImg src="assets/images/technician-icon.svg"></IonImg>
                  </IonThumbnail>
                  <IonText className="listCont">
                    <h3>{formData.team[0].first_name}</h3>
                    <h6>{formData.team[0].mobile_no}</h6>
                  </IonText>
                </IonItem>
              </IonList>
            )}

            {/* Display selected technicians */}
            {formData && formData.team && formData.team.length > 0 ? (
              <IonList lines="full" className="ion-list-item listItemAll">
                <IonText className="previewHeading">
                  <h3>Selected Technicians</h3>
                  <IonBadge color="primary">{formData.team.length-1}</IonBadge>
                </IonText>
                {formData.team.slice(1).map((technician: any, index: any) => (
                  <IonItem key={index}>
                    <IonThumbnail slot="start" className="thumbnailIcon">
                      <IonImg src="assets/images/technician-icon.svg"></IonImg>
                    </IonThumbnail>
                    <IonText className="listCont">
                      <h4>{technician.first_name}</h4>
                      <h6>{technician.mobile_no}</h6>
                    </IonText>
                          
                  </IonItem>
                ))}
              </IonList>
            ) : null}
          </IonCard>

          <IonCard className="ion-padding-horizontal">
            <IonText className="previewHeading">
              <h2>Task Initiation</h2>
            </IonText>
            {formData &&
              formData?.task_initiation &&
              formData?.task_initiation.length > 0 &&
              formData?.task_initiation.map(
                (initiation: any, index: number) => (
                  <IonCard key={index}>
                    <IonText>
                      <p>
                        Date and Time:{" "}
                        {formatDate(initiation?.date_time) +
                          " " +
                          formatTime(initiation?.date_time)}
                      </p>
                      <p>Log Type: {initiation?.log_type}</p>
                      <p>Tracking Type: {initiation?.tracking_type}</p>
                      <p>Latitude: {initiation?.latitude}</p>
                      <p>Longitude: {initiation?.longitude}</p>
                    </IonText>
                  </IonCard>
                )
              )}
            {/* Add console.log statements here */}
            {console.log("formData:", formData)}
            {console.log("formData.task_initiation:", formData.task_initiation)}
          </IonCard>

          {/* Pest Activity Found Details */}
          <IonCard className="ion-padding-horizontal" id="pestActivitySection">
            <IonText className="previewHeading">
              <h2>Pest Activity Found Details</h2>
            </IonText>
            {formData?.pests_found &&
              formData.pests_found.length > 0 &&
              formData.pests_found.map((pest: any) => {
                // Split the pest_photo string into an array if it's a string with commas
                const pestPhotos = pest.pest_photo.split(",");

                const imagePath = formData.pests_found_image_path || "";

                // Debugging output
                console.log("Pest Photos:", pestPhotos);

                return (
                  <IonCard key={pest.id}>
                    <div className="preCont">
                      <div className="bottomLine">
                        <IonText>
                          <h6>Pest Activity Found</h6>
                          <h2>{pest.pest_report_type}</h2>
                        </IonText>
                        <IonText>
                          <h6>Pest Found</h6>
                          <h4>{pest.is_pest_found}</h4>
                        </IonText>
                        <IonText>
                          <h6>Activity Level</h6>
                          <h4>{pest.pest_severity}</h4>
                        </IonText>
                        <IonText>
                          <h6>Chemical added</h6>
                          <h4>{pest.is_chemical_added}</h4>
                        </IonText>
                        <IonText>
                          <h6>Area</h6>
                          <h4>{pest.pest_area}</h4>
                        </IonText>

                        <IonText>
                          <h6>Photo of Pest Found</h6>
                        </IonText>
                        {pestPhotos.map((media: any, index: any) => {
                          const fullImagePath = `${imagePath}${media}`;
                          return <IonImg key={index} src={fullImagePath} />;
                        })}
                      </div>
                    </div>
                  </IonCard>
                );
              })}
          </IonCard>

          {/* Chemical Used */}
          <IonCard className="ion-padding-horizontal">
            <IonText className="previewHeading">
              <h2>Chemical Used</h2>
              <h2>{formData.pest_report_type}</h2>
            </IonText>

            <div className="preCont">
              {formData.materials_used && formData.materials_used.length > 0 ? (
                <IonCard className="innerCard">
                  <IonGrid>
                    <IonRow className="rowHeading">
                      <IonCol size="6">Products</IonCol>
                      <IonCol size="6" className="ion-text-end">
                        Quantity
                      </IonCol>
                    </IonRow>
                    {formData.materials_used.map(
                      (material: any, index: number) => (
                        <IonRow key={index}>
                          <IonCol size="6">{material.item_name}</IonCol>
                          <IonCol size="6" className="ion-text-end">
                            {material.quantity} {material.unit_name}
                          </IonCol>
                        </IonRow>
                      )
                    )}
                  </IonGrid>
                </IonCard>
              ) : (
                <p>No chemical usage data available.</p>
              )}

              {/* Display pest_report_type below chemical usage */}
            </div>
          </IonCard>

          {/* Recommendations */}
          <IonCard className="ion-padding-horizontal">
            <IonText className="previewHeading">
              <h2>Recommendations</h2>
            </IonText>
            {formData &&
              formData.pests_recommendations &&
              formData.pests_recommendations.length > 0 &&
              formData.pests_recommendations.map(
                (recommendation: any, index: number) => (
                  <IonCard key={index} className="innerCard">
                    <div className="bottomLine">
                      <div className="preCont">
                        <IonText>
                          <h6>Pest Activity Found</h6>
                          <h2>{recommendation.pest_report_type || "N/A"}</h2>
                        </IonText>
                        <IonText>
                          <h6>Do you want to add recommendations?</h6>
                          <h4>
                            {recommendation.is_recommendation_added || "N/A"}
                          </h4>
                        </IonText>
                        <IonText>
                          <h6>Recommendation Type</h6>
                          <h4>{recommendation.recommendation_type || "N/A"}</h4>
                        </IonText>
                        <IonText>
                          <h6>Recommendation</h6>
                          <h4>{recommendation.recommendations || "N/A"}</h4>
                        </IonText>
                        <IonText>
                          <h6>PSD able to Provide Service?</h6>
                          <h4>
                            {recommendation.is_service_available || "N/A"}
                          </h4>
                        </IonText>
                        <IonText>
                          <h6>Photo of Recommendations</h6>
                        </IonText>
                        {recommendation.recommended_media.length > 0 ? (
                          recommendation.recommended_media.map(
                            (media: any, mediaIndex: number) => (
                              <IonImg
                                key={mediaIndex}
                                src={`${formData.pests_recommendations_image_path}${media}`}
                              />
                            )
                          )
                        ) : (
                          <IonText>No media available</IonText>
                        )}
                      </div>
                    </div>
                  </IonCard>
                )
              )}
          </IonCard>

          {/* Work Done Details */}
          <IonCard className="ion-padding-horizontal">
            <IonText className="previewHeading">
              <h2>Work Done Details</h2>
            </IonText>
            {formData &&
              formData.work_done_details &&
              formData.work_done_details.length > 0 && (
                <IonCard className="innerCard">
                  {formData.work_done_details.map(
                    (workDetail: any, index: number) => (
                      <div className="preCont" key={`workDetail-${index}`}>
                        <IonText>
                          <h6>{workDetail.question}</h6>
                          {workDetail.type.toLowerCase() === "descriptive" && (
                            <h4>{workDetail.descriptive}</h4>
                          )}
                          {workDetail.type.toLowerCase() === "selection" &&
                            workDetail.selection_type.toLowerCase() ===
                              "single" && <h4>{workDetail.options}</h4>}
                          {workDetail.type.toLowerCase() === "mcq" &&
                            workDetail.selection_type.toLowerCase() ===
                              "single" && <h4>{workDetail.options}</h4>}
                          {workDetail.type.toLowerCase() === "mcq" &&
                            workDetail.selection_type.toLowerCase() ===
                              "multi" && <h4>{workDetail.options}</h4>}
                          {workDetail.type.toLowerCase() === "selection" &&
                            workDetail.selection_type.toLowerCase() ===
                              "multiple" && <h4>{workDetail.options}</h4>}
                          {/* Display dependency_label_text if options is null */}
                          {workDetail.had_dependency ==1 && (
                            <>
                           <h6> {workDetail.dependency_label!==null ?workDetail.dependency_label:"Description"} </h6> <h4>{workDetail.dependency_label_text}</h4>
                              
                            </>
                          )}
                        </IonText>
                      </div>
                    )
                  )}
                </IonCard>
              )}
          </IonCard>

          {/* Feedback And Follow-up */}
          <IonCard className="ion-padding-horizontal">
            <IonText className="previewHeading">
              <h2>Feedback And Follow-up</h2>
            </IonText>
            {formData?.feedback_details &&
              formData.feedback_details.length > 0 &&
              formData.feedback_details.map(
                (feedbackDetail: any, index: number) => (
                  <IonCard
                    key={`feedbackDetail-${index}`}
                    className="innerCard"
                  >
                    <div className="preCont">
                      <IonText>
                        <h6>Customer Feedback</h6>
                        <h4>{feedbackDetail.customer_feedback}</h4>
                      </IonText>

                      <IonText>
                        <h6>Customer Signature</h6>
                        <IonImg
                          src={`${formData.signature_path}${feedbackDetail.customer_signature}`}
                        />
                      </IonText>

                      <IonText>
                        <h6>Technician Signature</h6>
                        <IonImg
                          src={`${formData.signature_path}${feedbackDetail.technician_signature}`}
                        />
                      </IonText>

                      <IonText>
                        <h6>Feedback Details</h6>
                        <h4>{feedbackDetail.feedback}</h4>
                      </IonText>

                      <IonText>
                        <h6>Follow-Up Required</h6>
                        <h4>{feedbackDetail.is_follow_up_required}</h4>
                      </IonText>

                      {feedbackDetail.is_follow_up_required === "Yes" && (
                        <IonText>
                          <h6>Follow-Up Date</h6>
                          <h4>{formatDate(feedbackDetail.next_follow_up)}</h4>
                        </IonText>
                      )}
                      <IonText>
                        <h6>Completed Date</h6>
                        <h4>{`${formatDate(feedbackDetail.created_on)}   ${formatTime(feedbackDetail.created_on)}`}</h4>
                      </IonText>
                    </div>
                  </IonCard>
                )
              )}
          </IonCard>
        </div>
      </IonContent>
      <GoTop/>
    </>
  );
};
export default TaskPreview;
