import {
  IonAlert,
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonList,
  IonText,
  IonThumbnail,
  IonToolbar,
} from "@ionic/react";
import swal from "sweetalert";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import CommonHeader from "../components/CommonHeader";
import {
  getTaskInitTimes,
  taskInit,
  getVisitExecutionDetails,
} from "../data/apidata/taskApi/taskDataApi";
import {
  formatDate,
  formatDateTime,
  formatTime,
  getDateTime,
} from "../utils/dateTimeUtils";
// import { updateInterval } from "../data/apidata/pauseResumeApi/pauseAndResumeApiData";
import { updateInterval } from "../data/offline/entity/DataTransfer";
import { toZonedTime, format } from "date-fns-tz";
import TaskProgress, {
  ProgressStatus,
  getCurrentTaskStatus,
  updateTaskProgressStatusFromExecDetails,
  updateTaskStatus,
} from "../data/localstorage/taskStatusStorage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getCurrentLocation } from "../../src/data/providers/GeoLocationProvider";
import { getUserData } from "../data/apidata/taskApi/taskDataApi";
//import { updateInterval } from "../data/apidata/pauseResumeApi/pauseAndResumeApiData";
// import     PauseResumeButton from  '../../src/components/PauseResumeButton';
import {
  retrieveNetworkInitTimes,
  retrieveNetworkTasksExecutionDetails,
  retrieveNetworkTasksDetails,
  retrievevisitExecutionDetailsBasedonNetwork,
} from "../data/offline/entity/DataRetriever";
import {
  submitTravelEndTime,
  submitTravelStartTime,
} from "../data/offline/entity/DataTransfer";
import FullScreenLoader from "../components/FullScreenLoader";
import FullScreenLoaderTask from "../components/FullScreenLoaderTask";
interface Pest {
  id: string;
  is_chemical_added: string | null;
  is_pest_found: string;
  pest_area: string;
  pest_photo: string;
  pest_report_type: string;
  pest_severity: string;
  service_name: string;
  sub_service_id: string;
  visit_id: string;
}

// Define the VisitExecutionDetails interface
interface VisitExecutionDetails {
  pests_found: Pest[];
  pests_found_image_path: string;
}
const TaskExecution: React.FC = () => {
  const [techniciansRequired, setTechniciansRequired] = useState<number | null>(
    null
  );

  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSaveNextEnabled, setIsSaveNextEnabled] = useState(false);
  const [taskStartTime, setTaskStartTime] = useState<string | null>(null);
  const [isTravelStartEnable, setIsTravelStartEnable] = useState(false);
  const [travelStartTime, setTravelStartTime] = useState<string | null>(null);
  const [isTravelEndEnable, setIsTravelEndEnable] = useState(false);
  const [travelEndTime, setTravelEndTime] = useState<string | null>(null);
  const [taskProgress, setTaskProgress] = useState<TaskProgress | null>(null);
  const [visitExecutionDetails, setVisitExecutionDetails] = useState<any>(null);
  const [taskDetails, setTaskDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const history = useHistory();
  const formatToUaeTime = (dateTime: any) => {
    const uaeTimeZone = "Asia/Dubai";
    const zonedTime = toZonedTime(dateTime, uaeTimeZone);
    return format(zonedTime, "yyyy-MM-dd HH:mm:ss");
  };
  const initTaskExecForm = async () => {
    const activeTaskData = JSON.parse(localStorage.getItem("activeTaskData")!);
    const initTimesData = await retrieveNetworkInitTimes(activeTaskData.id);
    console.log("Init Times in TestExec page: ", initTimesData);
    // setTaskProgress(getCurrentTaskStatus(activeTaskData.id));
    // Set Status based on task execution details from server
    const visitId = activeTaskData?.id; // Ensure visitId is available
    if (visitId) {
      let data = await fetchVisitExecutionDetails(visitId);
      setTaskProgress(updateTaskProgressStatusFromExecDetails(visitId, data));
      console.log("Task Progress from Task Exec Details :::::", taskProgress);
      console.log("updatedTask===============>", visitId);
    } else {
      console.error("visitId is not available");
    }

    const taskInitTimes = initTimesData;
    setIsTravelStartEnable(true);
    setIsTravelEndEnable(true);

    for (let index = 0; index < taskInitTimes.length; index++) {
      const element = taskInitTimes[index];
      if (element.tracking_type === "Service Initiated") {
        setTaskStartTime(
          formatDate(element.date_time) + " " + formatTime(element.date_time)
        );
      } else if (element.tracking_type === "Start") {
        setIsTravelStartEnable(false);
        setTravelStartTime(
          formatDate(element.date_time) + " " + formatTime(element.date_time)
        );
        updateTaskStatus(activeTaskData.id, "travelStart", ProgressStatus.done);
      } else if (element.tracking_type === "Stop") {
        setIsTravelEndEnable(false);
        setTravelEndTime(
          formatDate(element.date_time) + " " + formatTime(element.date_time)
        );
        updateTaskStatus(activeTaskData.id, "travelEnd", ProgressStatus.done);
      }
    }
  };
  console.log("visitexecution details", visitExecutionDetails);

  const startTrackingTime = async () => {
    if (taskProgress?.teamAttendance === ProgressStatus.done) {
      setSubmitting(true)
      const currTime = getDateTime();
      setTravelStartTime(`${formatDate(formatToUaeTime(currTime))}  ${formatTime(formatToUaeTime(currTime))}`);

      setIsTravelStartEnable(false);

      try {
      const activeTaskData = JSON.parse(
        localStorage.getItem("activeTaskData")!
      );
      await submitTravelStartTime(
        activeTaskData.id,
        currTime,
        "Track Travel Time Start",
        "Start"
      );
      //updateTaskStatus(activeTaskData.id, "travelStart", ProgressStatus.done);
      let data = await fetchVisitExecutionDetails(visitId);
      setTaskProgress(updateTaskProgressStatusFromExecDetails(visitId, data));
      console.log("Task Progress from Task Exec Details :::::", taskProgress);

      // setTaskProgress(
      //   (prev) => prev && { ...prev, travelStart: ProgressStatus.done }
      // );
    } catch (error) {
      console.error("Error starting travel time:", error);
    } finally {
      setSubmitting(false); // Hide loader
    }
    }
  };

  const fetchTDetails = async (taskId: any) => {
    console.log("Going to fetch Task Details for task ID ::::", taskId);
    setLoading(true);
    try {
      const response = await retrieveNetworkTasksDetails(visitId); // Ensure taskId is passed correctly
      if (response) {
        console.log(
          "Fetched task details:------------------------------->",
          response
        );
        setTaskDetails(response); // Set the fetched data to state
        if (response.service_status === "Paused") {
          setIsPaused(true);
        } else {
          setIsPaused(false);
        }
      } else {
        console.error("Failed to fetch task details. Error:", response.message);
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
    } finally {
      setLoading(false);
    }
  };

  const endTrackingTime = async () => {
    if (!isTravelStartEnable) {
      if (taskProgress?.teamAttendance === ProgressStatus.done) {
        setSubmitting(true)
        const currTime = getDateTime();
        setTravelEndTime(`${formatDate(formatToUaeTime(currTime))}  ${formatTime(formatToUaeTime(currTime))}`);

        setIsTravelEndEnable(false);

        
      try {
        const activeTaskData = JSON.parse(
          localStorage.getItem("activeTaskData")!
        );
        await submitTravelEndTime(
          activeTaskData.id,
          currTime,
          "Track Travel Time End",
          "Stop"
        );
        // updateTaskStatus(activeTaskData.id, "travelEnd", ProgressStatus.done);
        // setTaskProgress(
        //   (prev) => prev && { ...prev, travelEnd: ProgressStatus.done }
        // );

        let data = await fetchVisitExecutionDetails(visitId);
        setTaskProgress(updateTaskProgressStatusFromExecDetails(visitId, data));
        console.log("Task Progress from Task Exec Details :::::", taskProgress);
      } catch (error) {
        console.error("Error starting travel time:", error);
      } finally {
        setSubmitting(false); // Hide loader
      }
      }
    } else {
      toast.info("Please click 'Start Travel' before selecting 'End Travel'");
    }
  };

  const handleAlertConfirm = (data: any) => {
    const value = data.techniciancount;
    if (value) {
      localStorage.setItem("techniciansRequired", value.toString());
      setTechniciansRequired(value);
      setIsSaveNextEnabled(true);
      history.push("/availabletechnicians");
    } else {
      toast.error("Please enter number of technicians.");
    }
  };

  const taskDataStr = localStorage.getItem("activeTaskData");
  if (!taskDataStr) {
    throw new Error("Task data is not available");
  }
  const activeTaskData = JSON.parse(taskDataStr);

  const fetchVisitExecutionDetails = async (visitId: string) => {
    try {
      const data = await retrievevisitExecutionDetailsBasedonNetwork(visitId);
      console.log("Data from retrvexecv2 = ", data);
      if (data) {
        console.log("Visit Execution Details ::", data);
        setVisitExecutionDetails(data);
        return data;
      } else {
        console.error(data.message);
        // toast.error("Server not responding. Please try again later.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Server not responding. Please try again later.");
    }
  };

  useEffect(() => {
    initTaskExecForm();
  }, []);
  const handleCancel = () => {
    const taskDataStr = localStorage.getItem("activeTaskData");
    if (!taskDataStr) {
      throw new Error("Task data is not available");
    }
    let activeTaskData = JSON.parse(taskDataStr);
    activeTaskData = [activeTaskData];
    const taskId = activeTaskData.id; // Assuming the task ID is in the first element

    // Navigate to task details page when Cancel button is clicked
    history.push(`/tasks/${taskId}`);
  };

  const visitId = activeTaskData.id;
  const [isPaused, setIsPaused] = useState(false);
  // Function to toggle tracking time
  const toggleTrackingTime = async () => {
    try {
      if (
        visitExecutionDetails?.pests_found?.some(
          (pest: Pest) => pest.is_chemical_added === null
        )
      ) {
        toast.info(
          "Before pausing, please add chemicals used for pest found details."
        );
        return;
      }
      if (
        taskProgress?.travelStart === ProgressStatus.done &&
        taskProgress?.travelEnd !== ProgressStatus.done
      ) {
        toast.info("Please end the travel before pausing the task");
        return;
      }
      if (taskProgress?.feedBack === ProgressStatus.done) {
        toast.info(
          "You cannot pause the task after providing feedback and follow-up."
        );
        return;
      }

      const data = await updateInterval(visitId, isPaused);

      const newIsPaused = !isPaused; // Toggle the paused state
      setIsPaused(newIsPaused);
      // if (newIsPaused) {
      //   toast.success("Task paused successfully");
      //   console.log("Interval paused successfully");
      // } else {
      //   toast.success("Task resumed successfully");
      //   console.log("Interval resumed successfully");
      // }
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Transaction failed, please try again.");
      console.error("Error updating interval:", error);
    }
  };

  console.log(visitExecutionDetails);
  console.log(taskProgress?.workDoneDetails);

  const clearSessionStorage = () => {
    localStorage.removeItem("feedbackFollowupFormData");
    localStorage.removeItem("recommDataArray");
    localStorage.removeItem("selectedChemicalItems");
    localStorage.removeItem("taskProgressStatus");
    localStorage.removeItem("workDataArray");
    localStorage.removeItem("techniciansRequired");
    localStorage.removeItem("selectedPestActIndForChem");
    localStorage.removeItem("selectedTechnicianData");
    localStorage.removeItem("activityUsageArray");
    localStorage.removeItem("1");
    localStorage.removeItem("pestFormData");
    localStorage.removeItem("pestFormDatas");
    localStorage.removeItem("multi");
    localStorage.removeItem("0");
    localStorage.removeItem(`pestFormData-${visitId}`);
    localStorage.removeItem(`activeChemicalUsed-${visitId}`);
    localStorage.removeItem(`activityUsageArray-${visitId}`);
    localStorage.removeItem("activeTaskData");
  };

  useEffect(() => {
    if (visitId) {
      fetchTDetails(visitId); // Call the API function when taskId changes
    }
  }, [visitId]);

  const handleSaveSubmit = () => {
    swal({
      title: '"Are you Sure?"',
      text: "Are you sure you want to submit the Task",
      buttons: ["Cancel", "Submit"],
    }).then((willsubmit: any) => {
      if (willsubmit) {
        swal("Task is Completed!", { icon: "success" });
        clearSessionStorage();
        history.push("/dashboard");
      }
    });
  };

  useEffect(() => {
    setIsSaveNextEnabled(taskProgress?.feedBack === 1);
  }, [taskProgress]);

  return (
    <>
      <ToastContainer />
      <CommonHeader
        backToPath={"/tasks"}
        pageTitle={"Task Execution"}
        showIcons={true}
      />
      <IonContent fullscreen className="ionContentColor">
        <div className="ionPaddingBottom">
          <IonList className="ion-list-item executionTopHeading ion-padding">
            <IonItem lines="none">
              <IonThumbnail slot="start" className="thumbnailIcon">
                <IonImg src="/assets/images/location-icon.svg"></IonImg>
              </IonThumbnail>
              <div>
                <IonText>
                  <h3>{activeTaskData.service_name}</h3>
                  <h2>{activeTaskData.address}</h2>
                  <p>
                    {formatDate(activeTaskData.created_on) +
                      " " +
                      formatTime(activeTaskData.created_on)}
                  </p>
                </IonText>
              </div>
            </IonItem>
          </IonList>
          <div className="previewBts">
            <IonItem lines="none" className="ion-float-end">
              <IonButton
                shape="round"
                color="secondary"
                onClick={toggleTrackingTime}
              >
                <IonImg
                  src={
                    isPaused
                      ? "/assets/images/resume-icon.svg"
                      : "/assets/images/pause-icon.svg"
                  }
                ></IonImg>
              </IonButton>
              <IonButton
                shape="round"
                routerLink={"/tasks/" + activeTaskData.id}
              >
                <IonImg src="/assets/images/task-details-icon.svg"></IonImg>
              </IonButton>
              <IonButton shape="round" routerLink="/TaskPreview">
                <IonImg src="/assets/images/preview-icon.svg"></IonImg>
              </IonButton>
            </IonItem>
          </div>
          <div className="ion-padding-horizontal serviceRequestStatus">
            <IonText>
              <h1>Service Request Status</h1>
            </IonText>
            <IonList className="executionList">
              <IonItem className="step step-active" lines="none">
                <IonThumbnail slot="start" className="circle">
                  <IonImg
                    className="ionImgCheckmark"
                    src="assets/images/checkmark-w-icon.svg"
                  ></IonImg>
                </IonThumbnail>
                <IonText>
                  <h3>Service Request is Started</h3>
                  <h6>{taskStartTime}</h6>
                </IonText>
              </IonItem>
              <IonItem
                className={
                  taskProgress?.teamAttendance === -1
                    ? "step"
                    : taskProgress?.teamAttendance === 1
                    ? "step step-active"
                    : "step"
                }
                lines="none"
                id="teamattendance-alert"
              >
                <IonThumbnail slot="start" className="circle">
                  <IonImg
                    className="ionImgCheckmark"
                    src="assets/images/checkmark-w-icon.svg"
                  ></IonImg>
                </IonThumbnail>
                <IonText
                  id="present-alert"
                  onClick={() => {
                    if (taskProgress?.teamAttendance === -1 && isPaused) {
                      toast.info(
                        "Please resume the task to perform the action"
                      );
                    }
                  }}
                >
                  <h3>Team Attendance</h3>
                </IonText>
              </IonItem>
              {taskProgress?.teamAttendance !== 1 &&
                !(taskProgress?.teamAttendance === -1 && isPaused) && (
                  <IonAlert
                    trigger="present-alert"
                    header="Total number of technicians required"
                    buttons={[
                      {
                        text: "Ok",
                        handler: handleAlertConfirm,
                      },
                    ]}
                    inputs={[
                      {
                        name: "techniciancount",
                        type: "number",
                        placeholder: "Enter the number",
                        min: 1,
                        max: 100,
                      },
                    ]}
                  ></IonAlert>
                )}
              <IonItem
                className={
                  taskProgress?.travelStart === -1 &&
                  taskProgress?.travelEnd === -1
                    ? "step"
                    : taskProgress?.travelStart === 1 &&
                      taskProgress?.travelEnd === 1
                    ? "step step-active"
                    : "step"
                }
                lines="none"
              >
                <IonThumbnail slot="start" className="circle">
                  <IonImg
                    className="ionImgCheckmark"
                    src="assets/images/checkmark-w-icon.svg"
                  ></IonImg>
                </IonThumbnail>
                <IonText>
                  <h3>Track Travel Time</h3>
                  <div>
                    {!isTravelStartEnable ? (
                      
                      <h6>Start Time: {travelStartTime}</h6>
                    ) : (
                      taskProgress?.teamAttendance === 1 &&
                      <IonButton
                        onClick={() => {
                          if (taskProgress?.travelStart === -1 && isPaused) {
                            toast.info(
                              "Please resume the task to perform the action"
                            );
                          } else {
                            startTrackingTime();
                          }
                        }}
                      >
                        StartTime
                      </IonButton>
                    )}
                    {isTravelEndEnable ? (
                       taskProgress?.teamAttendance === 1 &&
                      <IonButton
                        onClick={() => {
                          if (taskProgress?.travelEnd === -1 && isPaused) {
                            toast.info(
                              "Please resume the task to perform the action"
                            );
                          } else {
                            endTrackingTime();
                          }
                        }}
                      >
                        EndTime
                      </IonButton>
                    ) : (
                      <h6>End Time: {travelEndTime}</h6>
                    )}
                  </div>
                </IonText>
              </IonItem>
              <IonItem
                className={
                  taskProgress?.pestActivityDiscov === -1
                    ? "step"
                    : taskProgress?.pestActivityDiscov === 1 &&
                      taskProgress?.recommGiven === ProgressStatus.done
                    ? "step step-active"
                    : taskProgress?.pestActivityDiscov === 1 &&
                    taskProgress?.recommGiven !== ProgressStatus.done ? "step step-semi-active"
                    : "step"
                }
                lines="none"
                routerLink={
                  taskProgress?.travelStart === ProgressStatus.done &&
                  taskProgress?.travelEnd === ProgressStatus.done &&
                  taskProgress?.recommGiven !== ProgressStatus.done &&
                  !isPaused &&
                  visitExecutionDetails?.pests_found?.every(
                    (pest: Pest) => pest.is_chemical_added !== null
                  )
                    ? "/PestActivityFound"
                    : undefined
                }
                onClick={() => {
                  console.log("onClick triggered for PestActivityFound");
                  if (isPaused) {
                    toast.info("Please resume the task to perform the action");
                  } else if (
                    visitExecutionDetails?.pests_found?.some(
                      (pest: Pest) => pest.is_chemical_added === null
                    )
                  ) {
                    toast.info("Please add chemicals for previous pest found");
                  }
                }}
              >
                <IonThumbnail slot="start" className="circle">
                  <IonImg
                    className="ionImgCheckmark"
                    src="assets/images/checkmark-w-icon.svg"
                  ></IonImg>
                </IonThumbnail>
                <IonText>
                  <h3>Pest Activity Found Details</h3>
                  <h6>House Flies, House Mice</h6>
                </IonText>
              </IonItem>

              <IonItem
                className={
                  taskProgress?.chemicalsUsed === -1
                    ? "step"
                    : taskProgress?.chemicalsUsed === 1 &&
                      taskProgress?.recommGiven === ProgressStatus.done
                    ? "step step-active"
                    : (taskProgress?.chemicalsUsed === 1 || taskProgress?.chemicalsUsed === ProgressStatus.inprogress) &&
                    taskProgress?.recommGiven !== ProgressStatus.done ? "step step-semi-active"
                    : "step"
                }
                lines="none"
                routerLink={
                  taskProgress?.recommGiven === ProgressStatus.done &&
                  taskProgress?.chemicalsUsed !== ProgressStatus.done &&
                  !(taskProgress?.chemicalsUsed === -1 && isPaused)
                    ? "/ChemicalUsed"
                    : undefined
                }
                onClick={() => {
                  console.log("onClick triggered for ChemicalUsed");
                  if (taskProgress?.chemicalsUsed === -1 && isPaused) {
                    toast.info("Please resume the task to perform the action");
                  } else if (
                    visitExecutionDetails?.pests_found?.some(
                      (pest: Pest) => pest.is_chemical_added === null
                    )
                  ) {
                    history.push("/chemicalUsed");
                  }
                }}
              >
                <IonThumbnail slot="start" className="circle">
                  <IonImg
                    className="ionImgCheckmark"
                    src="assets/images/checkmark-w-icon.svg"
                  ></IonImg>
                </IonThumbnail>
                <IonText>
                  <h3>Chemical Used</h3>
                  <h6>Advion Ant Gel, Ant Bait Station … View Details</h6>
                </IonText>
              </IonItem>

              <IonItem
                className={
                  taskProgress?.recommGiven === -1
                    ? "step"
                    : taskProgress?.recommGiven === 1
                    ? "step step-active"
                    : "step"
                }
                lines="none"
                routerLink={
                  taskProgress?.pestActivityDiscov === ProgressStatus.done &&
                  taskProgress?.chemicalsUsed === ProgressStatus.done &&
                  taskProgress?.recommGiven !== ProgressStatus.done &&
                  !(isPaused && taskProgress?.recommGiven === -1) &&
                  visitExecutionDetails?.pests_found?.length! > 0 && // Ensure pests_found has items
                  !visitExecutionDetails.pests_found.some(
                    (pest: Pest) => pest.is_chemical_added === null
                  ) // Ensure no pests have is_chemical_added as null
                    ? "/Recommendations"
                    : undefined
                }
                onClick={() => {
                  if (taskProgress?.recommGiven === -1 && isPaused) {
                    toast.info("Please resume the task to perform the action");
                  } else if (visitExecutionDetails?.pests_found?.length === 0) {
                    toast.info(
                      "No pests found. Please add pests before proceeding to Recommendations."
                    );
                  } else if (
                    visitExecutionDetails.pests_found.some(
                      (pest: Pest) => pest.is_chemical_added === null
                    )
                  ) {
                    toast.info(
                      "Please add chemicals for pests before proceeding to Recommendations."
                    );
                  }
                }}
              >
                <IonThumbnail slot="start" className="circle">
                  <IonImg
                    className="ionImgCheckmark"
                    src="assets/images/checkmark-w-icon.svg"
                  ></IonImg>
                </IonThumbnail>
                <IonText>
                  <h3>Recommendations</h3>
                  <h6>Keep the manholes close after the treatment</h6>
                </IonText>
              </IonItem>

              <IonItem
                className={
                  taskProgress?.workDoneDetails === -1
                    ? "step"
                    : taskProgress?.workDoneDetails === 1
                    ? "step step-active"
                    : "step"
                }
                lines="none"
                routerLink={
                  taskProgress?.recommGiven === ProgressStatus.done &&
                  taskProgress?.workDoneDetails !== ProgressStatus.done &&
                  !(isPaused && taskProgress?.workDoneDetails === -1)
                    ? "/WorkDoneDetails"
                    : undefined
                }
                onClick={() => {
                  if (taskProgress?.workDoneDetails === -1 && isPaused) {
                    toast.info("Please resume the task to perform the action");
                  }
                }}
              >
                <IonThumbnail slot="start" className="circle">
                  <IonImg
                    className="ionImgCheckmark"
                    src="assets/images/checkmark-w-icon.svg"
                  ></IonImg>
                </IonThumbnail>
                <IonText>
                  <h3>Work Done Details</h3>
                </IonText>
              </IonItem>
              <IonItem
                className={
                  taskProgress?.feedBack === -1
                    ? "step"
                    : taskProgress?.feedBack === 1
                    ? "step step-active"
                    : "step"
                }
                lines="none"
                routerLink={
                  taskProgress?.workDoneDetails === ProgressStatus.done &&
                  taskProgress?.feedBack != ProgressStatus.done &&
                  !(taskProgress?.feedBack === -1 && isPaused)
                    ? "/FeedbackFollowup"
                    : undefined
                }
                onClick={() => {
                  if (taskProgress?.feedBack === -1 && isPaused) {
                    toast.info("Please resume the task to perform the action");
                  }
                }}
              >
                <IonThumbnail slot="start">
                  <IonImg
                    className="ionImgCheckmark"
                    src="assets/images/checkmark-w-icon.svg"
                  ></IonImg>
                </IonThumbnail>
                <IonText>
                  <h3>Feedback And Follow-up</h3>
                  <h6>Very Good</h6>
                </IonText>
              </IonItem>
              {/* <IonItem
                className={
                  taskProgress?.feedBack === ProgressStatus.done
                    ? "step step-active"
                    : "step"
                }
                lines="none"
              >
                <IonThumbnail slot="start" className="circle">
                  <IonImg
                    className="ionImgCheckmark"
                    src="assets/images/checkmark-w-icon.svg"
                  ></IonImg>
                </IonThumbnail>
                <IonText>
                  <h3>End Form</h3>
                </IonText>
              </IonItem> */}
            </IonList>
          </div>
        </div>
        <FullScreenLoader isLoading={submitting} />
        <FullScreenLoaderTask isLoading={loading} />
      </IonContent>
      {/* <IonFooter className="ion-footer">
        <IonToolbar className="ionFooterTwoButtons">
          <IonButton
            className="ion-button"
            fill="outline"
            color="medium"
            onClick={handleCancel}
          >
            Cancel
          </IonButton>
          <IonButton
            className="ion-button"
            color="primary"
            disabled={!isSaveNextEnabled}
            onClick={handleSaveSubmit}
          >
            Save & submit
          </IonButton>
        </IonToolbar>
      </IonFooter> */}
    </>
  );
};

export default TaskExecution;
