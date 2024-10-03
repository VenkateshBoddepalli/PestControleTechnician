import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonRow,
  IonText,
  IonLabel,
  IonTitle,
  IonInput,
  IonToolbar,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonTextarea,
  IonBadge,
  IonProgressBar,
  IonSpinner,
} from "@ionic/react";
import { useHistory } from "react-router";
import CustomBackButton from "../components/CustomBackButton";
import CommonHeader from "../components/CommonHeader";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import "./PestActivityFound.css";
import "@splidejs/splide/dist/css/themes/splide-default.min.css";
import {
  Camera,
  CameraDirection,
  CameraResultType,
  CameraSource,
} from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { API_BASE_URL } from "../data/baseUrl";
import {
  ProgressStatus,
  updateTaskStatus,
} from "../data/localstorage/taskStatusStorage";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import useLongitudeLocation from "../components/useLongitudeLocation";
import FullScreenLoader from "../components/FullScreenLoader";
import { toast, ToastContainer } from "react-toastify";
import {
  multiRecommendations,
  submitRecommendations,
  getVisitExecutionDetails,
} from "../data/apidata/taskApi/taskDataApi";

import {
  retrieveRecommendationsBasedOnNetwork,
  retrievevisitExecutionDetailsBasedonNetwork,
} from "../data/offline/entity/DataRetriever";
import { savePestRecommendationBasedOnNetwork } from "../data/offline/entity/DataTransfer";
// import { toast } from "react-toastify";
interface FormData {
  visit_id: string;
  is_recommendation_added: string;
  pest_reported_id: string;
  recommendation_id: string;
  description: string;
  is_service_available: string;
  recommendations: string;
}

interface RecommendationData {
  is_recommendation_added?: string;
  pest_reported_id?: string;
  recommendation_id?: string;
  description?: string;
  is_service_available?: string;
  selectedRecommendations?: { recommendation_type_id: string; id: string }[];
  recommended_media?: any[];
  custom_recommendation?: string;
  recommendations?: any; // Add recommendations property
  recommTypes?: {
    recommendation_type_id: string;
    recommendation_type: string;
  }[]; // Add this line
}

// Define the type for a grouped recommendation
interface GroupedRecommendation {
  recommendation_type_id: string;
  recommendation_id: string;
  description: string;
}

interface SelectedRecommendation {
  recommendation_type_id: string;
  id: string;
  description?: string;
}

const Recommendations = () => {
  const location = useLongitudeLocation();
  const [images, setImages] = useState<string[][]>([]);
  const {
    handleSubmit,
    register,
    formState: { errors },
    clearErrors,
    setError,
  } = useForm({ mode: "all" });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittingProgress, setSubmittingProgress] = useState(false);
  const [customRecommendations, setCustomRecommendations] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recommDataArray, setRecommDataArray] = useState<RecommendationData[]>(
    []
  );
  const [imageUploadStatus, setImageUploadStatus] = useState<any[]>([]);

  // const [recommTypes, setRecommTypes] = useState<{ recommendation_type_id: string; recommendation_type: string }[]>([]);

  const [othersSelections, setOthersSelections] = useState<{
    [pestIndex: number]: {
      [recommendationTypeId: string]: boolean;
    };
  }>({});
  const [customDescriptions, setCustomDescriptions] = useState<{
    [index: number]: { [recommendationTypeId: string]: string };
  }>({});

  const [recomm, setRecomm] = useState<any[]>([]);
  const [visitExecutionDetails, setVisitExecutionDetails] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [imgDelete, setImgDelete] = useState(false);
  const taskId = localStorage.getItem("activeTaskData");
  if (!taskId) {
    throw new Error("Task data is not available");
  }
  const activeTaskData = JSON.parse(taskId);
  const [formData, setFormData] = useState<Partial<FormData>>({
    visit_id: activeTaskData.id,
    is_recommendation_added: "",
    pest_reported_id: "",
    recommendation_id: "",
    description: "",
    is_service_available: "",
    recommendations: "",
  });

  // Move the pest activity processing logic into a useEffect that depends on visitExecutionDetails
  useEffect(() => {
    if (visitExecutionDetails) {
      const pestActivityArray = visitExecutionDetails.pests_found || [];

      // Use a Map to filter out duplicate pest_report_type entries
      const uniquePestActivityMap = new Map();

      pestActivityArray.forEach((pestActivity: any) => {
        if (!uniquePestActivityMap.has(pestActivity.pest_report_type)) {
          uniquePestActivityMap.set(
            pestActivity.pest_report_type,
            pestActivity
          );
        }
      });

      // Convert the Map back to an array
      const uniquePestActivityArray = Array.from(
        uniquePestActivityMap.values()
      );

      // Log or store the uniquePestActivityArray
      console.log(uniquePestActivityArray);

      // Initialize formData with sub_service_id from uniquePestActivityArray
      setFormData((prevData: any) => ({
        ...prevData,
        pest_reported_id: uniquePestActivityArray[0]?.pest_reported_id || "",
      }));

      initRecommDataArray(uniquePestActivityArray); // Pass the unique pest activity array to initRecommDataArray
    }
  }, [visitExecutionDetails]); // Depend on visitExecutionDetails

  const initTaskExecForm = async () => {
    const activeTaskData = JSON.parse(localStorage.getItem("activeTaskData")!);
    const visitId = activeTaskData?.id; // Ensure visitId is available
    console.log("visitId------>", visitId);

    if (visitId) {
      await fetchVisitExecutionDetails(visitId); // Wait for the data to be fetched
    } else {
      console.error("visitId is not available");
    }
  };

  const fetchVisitExecutionDetails = async (visitId: string) => {
    try {
      setSubmittingProgress(true);
      const data = await retrievevisitExecutionDetailsBasedonNetwork(visitId);
      if (data) {
        console.log("Visit Execution Details ::", data);
        setVisitExecutionDetails(data);
      } else {
        console.error("Failed to fetch visit execution details");
        // toast.error("Server not responding. Please try again later.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Server not responding. Please try again later.");
    } finally {
      setSubmittingProgress(false); // Stop loading
    }
  };

  const initRecommDataArray = (uniquePestActivityArray: any[]) => {
    const recommDataArrayTemp = uniquePestActivityArray.map((item: any) => {
      return {
        is_recommendation_added: "",
        pest_reported_id: item.pest_reported_id,
        recommendation_id: "",
        description: "",
        is_service_available: "",
        recommended_media: [],
        recommendations: [],
        selectedRecommendations: [],
      };
    });

    setRecommDataArray(recommDataArrayTemp);
    setImages(new Array(uniquePestActivityArray.length).fill([]));
    console.log(
      "recommDataArrayTemp---------------------->",
      recommDataArrayTemp
    );
  };

  // Initialize task execution form when the component mounts
  useEffect(() => {
    initTaskExecForm();
  }, []);
  useEffect(() => {
    retrieveRecommendationsBasedOnNetwork()
      .then((response) => {
        if (response && response.success) {
          const data = response.data;
          setRecomm(data);
          console.log("give recommendations -------------->", data);

          const multiRecommendationsArray = data;
        } else {
          console.error("Failed to fetch multi recommendations");
          // toast.error("Server not responding. Please try again later.");
        }
      })
      .catch((error) => {
        console.error("Error fetching mutli recommendations:", error);
        toast.error("Server not responding. Please try again later.");
      });
  }, []);

  const validateInputs = () => {
    let isValid = true;

    console.log("Current recommendation data array:", recommDataArray);

    recommDataArray.forEach((recommItem, index) => {
      if (!recommItem.is_recommendation_added) {
        isValid = false;
        console.log(
          "Recommendation added status is required for index:",
          index
        );
      }

      if (recommItem.is_recommendation_added === "Yes") {
        const recommendationTypes = recommItem.selectedRecommendations || [];
        console.log(
          `Recommendation types for index ${index}:`,
          recommendationTypes
        );

        const uniqueRecommendationTypes = Array.from(
          new Set(
            recommendationTypes.map((type) => type.recommendation_type_id)
          )
        );

        if (
          !Array.isArray(uniqueRecommendationTypes) ||
          uniqueRecommendationTypes.length !== recomm.length
        ) {
          isValid = false;
          console.log(
            "Recommendation types are not defined or empty for index:",
            index
          );
        } else {
          const allTypesValid = uniqueRecommendationTypes.every((typeId) => {
            const selected = recomm.filter(
              (rec) => rec.recommendation_type_id === typeId
            );
            console.log(`Checking type ${typeId}:`, selected);
            return selected.length > 0; // Ensure at least one selection exists for each type
          });

          if (!allTypesValid) {
            isValid = false;
            console.log(
              `At least one recommendation must be selected for recommendation type at index ${index}`
            );
          }

          // Check for description if 'Others' is selected
          uniqueRecommendationTypes.forEach((typeId) => {
            const othersSelected = recommendationTypes.some(
              (rec) =>
                rec.recommendation_type_id === typeId && rec.id === "Others"
            );
            console.log(
              `'Others' selected for type ${typeId} at index ${index}:`,
              othersSelected
            );

            if (othersSelected) {
              const description = customDescriptions[index]?.[typeId] || "";
              console.log(
                `Description for 'Others' selection at index ${index} and type ${typeId}:`,
                description
              );
              if (!description) {
                isValid = false;
                console.log(
                  `Description is required for 'Others' selection at index ${index} and type ${typeId}`
                );
              }
            }
          });
        }
      }

      if (!recommItem.is_service_available) {
        isValid = false;
        console.log("Service available status is required for index:", index);
      }

      if (!recommItem.recommended_media?.length) {
        isValid = false;
        console.log(
          "Image capture is required for recommendation at index:",
          index
        );
      }
    });

    console.log("Validation result:", isValid);
    return isValid;
  };

  const onSubmit = async (data: any) => {
    console.log("Submit data : ", data);
    console.log("recommDataArray ==== ", recommDataArray);
    setFormSubmitted(true);

    const activeTaskStr = localStorage.getItem("activeTaskData");
    if (!activeTaskStr) {
      console.error("Task Data not available");
      setSubmitting(false);
      return;
    }
    const activeTaskData = JSON.parse(activeTaskStr);
    const visit_id = activeTaskData?.id ?? "";
    console.log("visit id from session storage ", visit_id);
    setIsSubmitting(true);

    try {
      // Validate inputs
      if (!validateInputs()) {
        console.error(
          "Validation failed. Please fill in all the required fields."
        );
        setSubmitting(false); // Stop form submission
        return;
      }

      // Validate each pest entry
      const isValid = recommDataArray.every(validatePestData);
      if (!isValid) {
        console.error("One or more pests have invalid or incomplete data.");
        toast.error("Please fill  all required Issues for each Pest.");
        setSubmitting(false); // Stop form submission
        return;
      }

      setSubmitting(true);

      const requestBody = recommDataArray.map((recommItem, index) => ({
        visit_id: visit_id,
        is_recommendation_added: recommItem.is_recommendation_added || "",
        pest_reported_id: recommItem.pest_reported_id,
        is_service_available: recommItem.is_service_available || "",
        recommendations: groupRecommendations(
          recommItem.selectedRecommendations || [],
          index
        ),
        recommended_media: recommItem.recommended_media || [],
        latitude: location?.latitude || "",
        longitude: location?.longitude || "",
      }));

      console.log(JSON.stringify(requestBody, null, 2));
      console.log("Request Body: ", requestBody);

      const responseData = await savePestRecommendationBasedOnNetwork(
        location?.latitude?.toString() || "", // Pass latitude as a string
        location?.longitude?.toString() || "", // Pass longitude as a string
        visit_id,
        requestBody
      );

      // Check the structure of responseData.data
      if (responseData.data) {
        console.log(responseData);

        const requestBodyArray = requestBody;
        // localStorage.setItem(
        //   "recommDataArray",
        //   JSON.stringify(requestBodyArray)
        // );
        updateTaskStatus("", "recommGiven", ProgressStatus.done);
        history.push("/taskexecution");
      } else if (
        responseData.success === false &&
        responseData.message === "Undefined variable: index"
      ) {
        updateTaskStatus("", "recommGiven", ProgressStatus.done);
        history.push("/taskexecution");
      } else {
        console.error("Failed to submit form:", responseData.statusText);
        toast.error("Please fill all the Details Correctly. Please try again.");
      }
    } catch (error: any) {
      if (error.message === "Undefined variable: index") {
        updateTaskStatus("", "recommGiven", ProgressStatus.done);
        history.push("/taskexecution");
      } else {
        toast.error("Error during submission");
        console.error("Error during submission", error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const validatePestData = (pestData: any) => {
    if (pestData.is_recommendation_added === "Yes") {
      return (
        pestData.is_recommendation_added &&
        pestData.pest_reported_id &&
        pestData.selectedRecommendations?.length > 0
      );
    } else if (pestData.is_recommendation_added === "No") {
      return pestData.is_recommendation_added && pestData.pest_reported_id;
    }
    return false; // default case if is_recommendation_added is neither "Yes" nor "No"
  };

  const history = useHistory();

  const onDescChange = (index: number, value: string) => {
    const updatedRecommDataArray = [...recommDataArray];
    updatedRecommDataArray[index].description = value;
    setRecommDataArray(updatedRecommDataArray);
  };

  const isRecommChanged = (index: any, value: string, pestType: string) => {
    const updatedRecommDataArray = [...recommDataArray];

    // Ensure the array has an object at the given index
    if (!updatedRecommDataArray[index]) {
      updatedRecommDataArray[index] = {
        is_recommendation_added: "",
        pest_reported_id: "",
        recommendation_id: "",
        description: "",
        is_service_available: "",
        recommended_media: [],
        recommendations: [],
        selectedRecommendations: [],
      };
    }

    updatedRecommDataArray[index].is_recommendation_added = value;
    if (updatedRecommDataArray[index].is_recommendation_added === "No") {
      toast.info("no recommendations added for the for " + pestType);
    }
    setRecommDataArray(updatedRecommDataArray);
  };

  const isRecommIdChanged = (
    index: number,
    selectedIds: string[],
    recommendation_type_id: string
  ) => {
    // Use "OthersID" for the Others selection
    const othersId = "Others";

    // Map selectedIds to the appropriate recommendation objects
    const selectedRecommendations = selectedIds.map((id) => {
      if (id === othersId) {
        return {
          recommendation_type_id,
          id: othersId, // Use "OthersID" here
        };
      }
      const recommendation = recomm
        .flatMap((type) => type.recommendations)
        .find((rec) => rec.id === id);
      return {
        recommendation_type_id:
          recommendation?.recommendation_type_id || recommendation_type_id,
        id,
      };
    });

    setRecommDataArray((prevState) => {
      const newState = [...prevState];
      // Filter out existing recommendations of the same type to avoid duplicates
      const filteredRecommendations = (
        newState[index]?.selectedRecommendations || []
      ).filter((rec) => rec.recommendation_type_id !== recommendation_type_id);

      newState[index] = {
        ...newState[index],
        selectedRecommendations: [
          ...filteredRecommendations,
          ...selectedRecommendations,
        ],
      };

      return newState;
    });

    // Update the state for "Others" selections
    setOthersSelections((prev) => {
      const updatedOthersSelections = { ...prev };
      if (!updatedOthersSelections[index]) {
        updatedOthersSelections[index] = {};
      }
      updatedOthersSelections[index][recommendation_type_id] =
        selectedIds.includes(othersId);
      return updatedOthersSelections;
    });
  };

  const isServAvailChanged = (index: number, value: string) => {
    if (index >= 0 && index < recommDataArray.length) {
      const updatedRecommDataArray = [...recommDataArray];
      if (updatedRecommDataArray[index]) {
        updatedRecommDataArray[index].is_service_available = value;
        setRecommDataArray(updatedRecommDataArray);
      } else {
        console.error(`Item at index ${index} is undefined`);
      }
    } else {
      console.error(`Index ${index} is out of bounds`);
    }
  };

  const handleReasonChange = (
    index: number,
    recommendationTypeId: string,
    value: string
  ) => {
    console.log(
      `Handling reason change for index: ${index}, recommendationTypeId: ${recommendationTypeId}`
    );
    console.log(`New value: ${value}`);

    setCustomDescriptions((prevDescriptions) => {
      const updatedDescriptions = {
        ...prevDescriptions,
        [index]: {
          ...prevDescriptions[index],
          [recommendationTypeId]: value,
        },
      };
      console.log("Updated customDescriptions:", updatedDescriptions);
      return updatedDescriptions;
    });

    // Check if the value is empty and set error accordingly
    if (value.trim() === "") {
      console.log("Description is empty, setting error.");
      setError(`recommDataArray[${index}].description`, {
        type: "manual",
        message: "Description is required for 'Others' selection.",
      });
    } else {
      console.log("Description is valid, clearing error.");
      clearErrors(`recommDataArray[${index}].description`);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = async (sectionIndex: number) => {
    try {
      let src = CameraSource.Prompt;
      if (Capacitor.getPlatform() === "web") src = CameraSource.Photos;

      const capturedImage = await Camera.getPhoto({
        quality: 25,
        allowEditing: false,
        saveToGallery: false,
        source: src,
        direction: CameraDirection.Rear,
        resultType: CameraResultType.Base64,
      });
      const imageUrl = "data:image/jpeg;base64," + capturedImage.base64String;
      console.log("Captured image", imageUrl);
      setImageUploadForIndex(sectionIndex, true);

      setTimeout(() => {
        setImageUploadForIndex(sectionIndex, false);
      }, 2000);

      setImages((prevImages) => {
        const newImages = [...prevImages];

        // Ensure the sectionIndex has an array initialized
        if (!newImages[sectionIndex]) {
          newImages[sectionIndex] = [];
        }

        newImages[sectionIndex] = [...newImages[sectionIndex], imageUrl];
        return newImages;
      });
      const updatedRecommDataArray = [...recommDataArray];
      (
        updatedRecommDataArray[sectionIndex] as { recommended_media: any[] }
      ).recommended_media.push({
        media: imageUrl,
      });
      setRecommDataArray(updatedRecommDataArray);
    } catch (error) {
      console.error("Error capturing image:", error);
    }
  };
  const setImageUploadForIndex = (index: any, status: any) => {
    setImageUploadStatus((prevState) => ({
      ...prevState,
      [index]: status,
    }));
  };
  const handleCancel = async () => {
    // Display a confirmation alert using swal
    const willReset = await swal({
      title: "Are you sure?",
      text: "Do you want to reset the form? All changes will be lost.",
      buttons: ["Cancel", "OK"],
    });

    // If the user confirms, reset the form fields
    if (willReset) {
      setFormData({
        visit_id: activeTaskData?.id || "", // Ensure activeTaskData is defined
        is_recommendation_added: "",
        pest_reported_id: "",
        recommendation_id: "",
        description: "",
        is_service_available: "",
        recommendations: "",
      });

      // Reset additional states
      setCustomRecommendations({});
      setSelectedOptions({});
      setRecommDataArray([]);
      setOthersSelections({});
      setCustomDescriptions({});
      setImages([[]]); // Reset the images state
      setImgDelete(false); // Reset the image delete flag
      setFormSubmitted(false);
    }
  };

  const groupRecommendations = (
    selectedRecommendations: SelectedRecommendation[],
    index: number
  ): GroupedRecommendation[] => {
    const grouped: GroupedRecommendation[] = [];
    const uniqueDescriptions: { [key: string]: Set<string> } = {};

    selectedRecommendations.forEach(({ recommendation_type_id, id }) => {
      const description =
        customDescriptions[index]?.[recommendation_type_id] || "";
      const existingItem = grouped.find(
        (item) => item.recommendation_type_id === recommendation_type_id
      );

      if (existingItem) {
        existingItem.recommendation_id += `,${id}`;
        if (description) {
          if (!uniqueDescriptions[recommendation_type_id]) {
            uniqueDescriptions[recommendation_type_id] = new Set();
          }
          if (!uniqueDescriptions[recommendation_type_id].has(description)) {
            uniqueDescriptions[recommendation_type_id].add(description);
            existingItem.description += `, ${description}`;
          }
        }
      } else {
        grouped.push({
          recommendation_type_id,
          recommendation_id: id,
          description,
        });
        if (description) {
          uniqueDescriptions[recommendation_type_id] = new Set([description]);
        }
      }
    });

    return grouped;
  };

  const filteredPestActivityArray = Array.from(
    new Set(
      visitExecutionDetails?.pests_found?.map(
        (item: any) => item.pest_report_type
      )
    )
  ).map((pest_report_type) =>
    visitExecutionDetails?.pests_found?.find(
      (item: any) => item.pest_report_type === pest_report_type
    )
  );
  const handleRemoveImage = (index: any, imageIndex: any) => {
    const updatedFormDataArray = [...images];
    updatedFormDataArray[index].splice(imageIndex, 1);
    setImages(updatedFormDataArray);
    setImgDelete(true);
  };

  return (
    <>
      <ToastContainer />
      <CommonHeader
        backToPath={"/taskexecution"}
        pageTitle={"Recommendations"}
        showIcons={false}
      />

      <IonContent fullscreen className="ionContentColor">
        {submittingProgress && <IonProgressBar type="indeterminate" />}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="ionPaddingBottom">
            {filteredPestActivityArray.map((pest: any, index: number) => (
              <div className="recWrappBlock" key={index}>
                <IonList className="recommendationHead ">
                  <IonItem className="" lines="none" routerLink="/taskdetails">
                    <div>
                      <IonText>
                        <h2>{pest?.pest_report_type}</h2>
                        <h5>Pest Activity Found</h5>
                      </IonText>
                    </div>
                  </IonItem>
                  <div className="bottomArrow"></div>
                </IonList>

                <div className="ion-padding-horizontal ion-margin-bottom">
                  <IonList className="formlist">
                    <IonItem lines="none">
                      <div className="width100">
                        <IonLabel className="ion-label">
                          Do you want to add recommendations ?
                          <IonText>*</IonText>
                        </IonLabel>
                        <IonSelect
                          placeholder="Select"
                          fill="outline"
                          style={{ width: "100%" }}
                          value={
                            recommDataArray[index]?.is_recommendation_added
                          }
                          onIonChange={(e) => {
                            isRecommChanged(
                              index,
                              e.detail.value || "",
                              pest?.pest_report_type
                            );
                            clearErrors(
                              `recommDataArray[${index}].is_recommendation_added`
                            );
                          }}
                        >
                          <IonSelectOption value="Yes">Yes</IonSelectOption>
                          <IonSelectOption value="No">No</IonSelectOption>
                          <IonSelectOption value="NA">NA</IonSelectOption>
                        </IonSelect>
                      </div>
                    </IonItem>
                    {formSubmitted &&
                      !recommDataArray[index]?.is_recommendation_added && (
                        <IonText color="danger">
                          Please select whether you want to add recommendations
                          or not
                        </IonText>
                      )}

                    {recommDataArray[index]?.is_recommendation_added ===
                      "Yes" && (
                      <>
                        {recomm.map((type, mapIndex) => (
                          <IonItem
                            lines="none"
                            key={type.recommendation_type_id}
                          >
                            <div className="width100">
                              <IonLabel className="ion-label">
                                {type.recommendation_type} Issue
                                <IonText>*</IonText>
                              </IonLabel>
                              <IonSelect
                                placeholder="Select"
                                fill="outline"
                                style={{ width: "100%" }}
                                multiple={true}
                                value={
                                  recommDataArray[
                                    index
                                  ]?.selectedRecommendations
                                    ?.filter(
                                      (selected) =>
                                        selected.recommendation_type_id ===
                                        type.recommendation_type_id
                                    )
                                    .map((selected) => selected.id) || []
                                }
                                onIonChange={(e) => {
                                  clearErrors(
                                    `recommDataArray[${index}].recommendation_id`
                                  );
                                  const value = e.detail.value as string[];
                                  isRecommIdChanged(
                                    index,
                                    value,
                                    type.recommendation_type_id
                                  );
                                }}
                              >
                                {type.recommendations.map((rec: any) => (
                                  <IonSelectOption key={rec.id} value={rec.id}>
                                    {rec.recommendation}
                                  </IonSelectOption>
                                ))}
                                <IonSelectOption value="Others">
                                  Others
                                </IonSelectOption>
                              </IonSelect>

                              {formSubmitted &&
                                (!recommDataArray[index]
                                  ?.selectedRecommendations ||
                                  !recommDataArray[
                                    index
                                  ].selectedRecommendations.some(
                                    (selected: any) =>
                                      selected.recommendation_type_id ===
                                      type.recommendation_type_id
                                  )) && (
                                  <IonText color="danger">
                                    Please select at least one recommendation
                                    for {type.recommendation_type}.
                                  </IonText>
                                )}

                              {othersSelections[index]?.[
                                type.recommendation_type_id
                              ] && (
                                <IonItem lines="none">
                                  <div className="width100">
                                    <IonLabel className="ion-label">
                                      Description<IonText>*</IonText>
                                    </IonLabel>
                                    <IonTextarea
                                      aria-label="Reason"
                                      fill="outline"
                                      placeholder="Enter reason"
                                      value={
                                        customDescriptions[index]?.[
                                          type.recommendation_type_id
                                        ] || ""
                                      }
                                      onIonInput={(e) => {
                                        console.log(
                                          `User is typing in description for index: ${index}, recommendationTypeId: ${type.recommendation_type_id}`
                                        );
                                        clearErrors(
                                          `customDescriptions[${index}].${type.recommendation_type_id}`
                                        );
                                        handleReasonChange(
                                          index,
                                          type.recommendation_type_id,
                                          e.detail.value || ""
                                        );
                                      }}
                                    ></IonTextarea>
                                    {formSubmitted &&
                                      !customDescriptions[index]?.[
                                        type.recommendation_type_id
                                      ] && (
                                        <IonText color="danger">
                                          Description is required for 'Others'
                                          selection.
                                        </IonText>
                                      )}
                                  </div>
                                </IonItem>
                              )}
                            </div>
                          </IonItem>
                        ))}
                      </>
                    )}

                    <IonItem lines="none">
                      <div className="width100">
                        <IonLabel className="ion-label">
                          PSD able to Provide Service? <IonText>*</IonText>
                        </IonLabel>
                        <IonSelect
                          placeholder="Select"
                          fill="outline"
                          style={{ width: "100%" }}
                          value={recommDataArray[index]?.is_service_available}
                          onIonChange={(e) => {
                            isServAvailChanged(index, e.detail.value || "");
                            clearErrors(
                              `recommDataArray[${index}].is_service_available`
                            );
                          }}
                        >
                          <IonSelectOption value="Yes">Yes</IonSelectOption>
                          <IonSelectOption value="No">No</IonSelectOption>
                          <IonSelectOption value="NA">NA</IonSelectOption>
                        </IonSelect>
                      </div>
                    </IonItem>
                    {formSubmitted &&
                      !recommDataArray[index]?.is_service_available && (
                        <IonText color="danger">
                          Please select PSD able to Provide Service requirement
                        </IonText>
                      )}

                    <IonItem lines="none">
                      <div>
                        <IonButton
                          className="ion-button"
                          disabled={images[index]?.length >= 3}
                          fill="solid"
                          color="medium"
                          onClick={() => handleImageUpload(index)}
                        >
                          Capture Image
                        </IonButton>
                        {formSubmitted &&
                          !recommDataArray[index]?.recommended_media
                            ?.length && (
                            <IonText color="danger">
                              Please capture an image for this recommendation
                            </IonText>
                          )}
                      </div>
                    </IonItem>

                    {images[index]?.length >= 3 && (
                      <IonText style={{ color: "#54B4D3" }}>
                        You cannot capture more than 3 images.
                      </IonText>
                    )}

                    {images[index] && images[index].length > 0 && (
                      <IonItem lines="none">
                        <div id="splide" className="splide">
                          <div className="splide__track">
                            <Splide options={{ perPage: 1, pagination: false }}>
                              {images[index].map((image, imageIndex) => (
                                <SplideSlide key={imageIndex}>
                                  <img
                                    src={image}
                                    alt={`Uploaded Slide ${imageIndex}`}
                                  />
                                  {imageUploadStatus[index] && (
                                    <div className="absolute-center">
                                      {/* <IonLabel>image Uploading</IonLabel> */}
                                      <IonSpinner name="dots" />
                                    </div>
                                  )}
                                  <div
                                    slot="center"
                                    className="del"
                                    title="Delete"
                                  >
                                    <p
                                      onClick={() =>
                                        handleRemoveImage(index, imageIndex)
                                      } // Ensure correct parameters
                                      style={{
                                        width: "50%",
                                        margin: "10px auto",
                                      }}
                                    >
                                      &times;
                                    </p>
                                  </div>
                                </SplideSlide>
                              ))}
                            </Splide>
                          </div>
                        </div>
                      </IonItem>
                    )}
                  </IonList>
                </div>
              </div>
            ))}

            <IonFooter className="ion-footer">
              <IonToolbar className="ionFooterTwoButtons">
                <IonButton
                  className="ion-button"
                  fill="outline"
                  color="medium"
                  onClick={handleCancel}
                >
                  RESET
                </IonButton>
                <IonButton
                  className="ion-button"
                  color="primary"
                  type="submit"
                  // disabled={isSubmitting || !validateInputs()}
                >
                  SUBMIT
                </IonButton>
              </IonToolbar>
            </IonFooter>
          </div>
        </form>
        <FullScreenLoader isLoading={submitting} />
      </IonContent>
    </>
  );
};

export default Recommendations;
