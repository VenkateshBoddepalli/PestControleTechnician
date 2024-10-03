import {
  IonAlert,
  IonButton,
  IonContent,
  IonFooter,
  IonItem,
  IonList,
  IonText,
  IonLabel,
  IonInput,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonToast,
  IonBadge,
  IonImg,
  IonHeader,
  IonBackButton,
  IonButtons,
  IonTitle,
  IonSpinner,
} from "@ionic/react";
import { add } from "ionicons/icons";
import { trash } from "ionicons/icons";
import { useHistory } from "react-router";
import CommonHeader from "../components/CommonHeader";
import { useEffect, useState } from "react";
import {
  fetchPestData,
  postPestActivity,
} from "../data/apidata/taskApi/taskDataApi";
import {
  Camera,
  CameraDirection,
  CameraResultType,
  CameraSource,
  Photo,
} from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import {
  ProgressStatus,
  updateTaskStatus,
} from "../data/localstorage/taskStatusStorage";
import { isPlatform } from "@ionic/react";
import useLongitudeLocation from "../components/useLongitudeLocation";
import { useForm } from "react-hook-form";
import FullScreenLoader from "../components/FullScreenLoader";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import { arrowBack } from "ionicons/icons"; // Import the arrowBack icon
import "./PestActivityFound.css";
import {
  savePestActivityBasedOnNetwork,
  savePestActivityDataToBD,
} from "../data/offline/entity/DataTransfer";
import {
  retrievePestActivityBasedOnNetwork,
  fetchPestActivityFromDB,
  retrieveNetworkTasksExecutionDetails,
} from "../data/offline/entity/DataRetriever";
import { Network } from "@capacitor/network";
import { toast } from "react-toastify";
import { Storage } from "@ionic/storage";
// import {retrievepestActivity} from "../data/offline/entity/DataTransfer"
const PestActivityFound: React.FC = () => {
  const location = useLongitudeLocation();
  const [userData, setUserData] = useState<any>(null);
  const [pestOptions, setPestOptions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageErrorShow, setimageErrorShow] = useState("");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [formDelete, setFormDelete] = useState(null);
  const [imageUpload, setImageUpload] = useState(false);
  const [imgDelete, setImgDelete] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [db, setDb] = useState<Storage | null>(null);
  const [isImageCaptured, setIsImageCaptured] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<any[]>([]);
  const [formDataArray, setFormDataArray] = useState<Array<any>>([
    {
      is_pest_found: "",
      sub_service_id: "",
      pest_severity: "",
      pest_area: "",
      pest_report_type: "",

      pest_photo: [], // Initialize as an empty array
    },
  ]);

  const [isFormValid, setIsFormValid] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [images, setImages] = useState<string[][]>([]);
  const {
    handleSubmit,
    register,
    setValue,
    clearErrors,
    setError,
    reset,
    trigger,

    formState: { errors, isSubmitted },
  } = useForm({ mode: "all" });

  // on page init
  useEffect(() => {
    initPageData();
  }, []);

  useEffect(() => {
    // Validations handling
    console.log("formData Array from pest activity found", formDataArray);
    const isValid = formDataArray.every((item) => {
      const isCommonFieldsValid =
        item.is_pest_found !== "" &&
        item.pest_area !== "" &&
        item.pest_photo.length > 0; // Check length of array

      if (item.is_pest_found === "Yes") {
        return isCommonFieldsValid && item.pest_severity !== "";
      }

      return isCommonFieldsValid;
    });

    setIsFormValid(isValid);
  }, [formDataArray]);

  const initPageData = async () => {
    initDb();
    await fetchPestOptions();
  };

  async function initDb() {
    const store = new Storage();
    await store.create();
    setDb(store);
    return store;
  }

  // const getStoredData = async () => {
  //   if (db) {
  //     const storedFormData = await db.get("pest-activity-formdata-temp");
  //     if (storedFormData) {
  //       setFormDataArray(JSON.parse(storedFormData));
  //     }
  //   }
  // };

  useEffect(() => {
    const getStoredData = async () => {
      if (db) {
        const storedFormData = await db.get("pest-activity-formdata-temp");
        if (storedFormData) {
          const parsedData = JSON.parse(storedFormData);
          setFormDataArray(parsedData);

          parsedData.forEach((item: any, index: any) => {
            setValue(`is_pest_found${index}`, item.is_pest_found);
            setValue(`pest_report_type${index}`, item.pest_report_type);
            setValue(`pest_area${index}`, item.pest_area);
            if (item.is_pest_found === "Yes") {
              setValue(`pest_severity${index}`, item.pest_severity);
            }
          });

          // Trigger validation for all fields
          parsedData.forEach((_: any, index: any) => {
            trigger(`is_pest_found${index}`);
            trigger(`pest_report_type${index}`);
            trigger(`pest_area${index}`);
            if (parsedData[index].is_pest_found === "Yes") {
              trigger(`pest_severity${index}`);
            }
          });
        }
      }
    };

    getStoredData();
  }, [db]);

  // ======================================checking network start=================
  const fetchPestOptions = async () => {
    try {
      const networkStatus = await Network.getStatus();
      setIsOnline(networkStatus.connected);

      if (networkStatus.connected) {
        // Online: Fetch data from API
        const { response, data } = await retrievePestActivityBasedOnNetwork();
        if (response.ok) {
          setPestOptions(data);
        } else {
          console.error(data);
        }
      } else {
        // Offline: Fetch data from local storage or handle offline scenario
        const localData = await fetchPestActivityFromDB();
        setPestOptions(localData);
      }
    } catch (error) {
      console.error("Error fetching pest options:", error);
      toast.error("Server not responding. Please try again later.");
    }
  };

  console.log("pestOptions---------------->", pestOptions);
  // ======================================checking network end=================

  const handleIsPestFoundChange = (value: string, index: number) => {
    const updatedFormDataArray = [...formDataArray];
    updatedFormDataArray[index].is_pest_found = value;
    if (value === "No") {
      updatedFormDataArray[index].pest_severity = "NA";
    }
    setFormDataArray(updatedFormDataArray);
    setValue(`is_pest_found${index}`, value, { shouldValidate: true });
  };
  // const handleIsPestFoundChange = (value: any, index: number) => {
  //   const newFormDataArray = [...formDataArray];
  //   newFormDataArray[index].is_pest_found = value;
  //   setFormDataArray(newFormDataArray);
  // };

  // Function to handle pest activity change
  const handlePestActivityChange = (value: string, index: number) => {
    const updatedFormDataArray = [...formDataArray];
    const selectedPestOption = pestOptions.find(
      (option) => option.id === value
    );
  
    // Assuming activeTaskData is available in the current scope
    let service_id = activeTaskData.service_id;
  
    if (selectedPestOption) {
      updatedFormDataArray[index].pest_report_type = selectedPestOption.pest_report_type;
      updatedFormDataArray[index].sub_service_id = selectedPestOption.sub_service_id || service_id;
      updatedFormDataArray[index].pest_report_id = selectedPestOption.id; // Store the id as pest_report_id
      updatedFormDataArray[index].is_chemical_added = "null"; // Add the is_chemical_added field
    } else {
      updatedFormDataArray[index].pest_report_type = ""; // Reset pest_report_type if no option is selected
      updatedFormDataArray[index].sub_service_id = "";
      updatedFormDataArray[index].pest_report_id = ""; // Reset pest_report_id if no option is selected
      updatedFormDataArray[index].is_chemical_added = "null"; // Reset is_chemical_added if no option is selected
    }
  
    console.log("Updated formDataArray in pest act", updatedFormDataArray);
    console.log("Selected pest options", selectedPestOption);
  
    setValue(`pest_report_type${index}`, selectedPestOption?.pest_report_type || "", { shouldValidate: true });
    setFormDataArray(updatedFormDataArray);
  };
  
  

  const handleSeverityChange = (value: string, index: number) => {
    // alert(value)
    const updatedFormDataArray = [...formDataArray];
    updatedFormDataArray[index].pest_severity = value;
    setValue(`pest_severity${index}`, value, { shouldValidate: true });
    setFormDataArray(updatedFormDataArray);
  };

  const handleAreaChange = (value: string, index: number) => {
    // alert(value)
    const updatedFormDataArray = [...formDataArray];
    updatedFormDataArray[index].pest_area = value;
    setValue(`pest_area${index}`, value, { shouldValidate: true });
    setFormDataArray(updatedFormDataArray);
  };

  const getBase64 = (file: any) => {
    return new Promise((resolve) => {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let baseURL = reader.result;
        resolve(baseURL);
      };
    });
  };

  const handlePestPhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      getBase64(file)
        .then((result: any) => {
          const updatedFormDataArray = [...formDataArray];
          updatedFormDataArray[index].pest_photo.push(result);
          setFormDataArray(updatedFormDataArray);
        })
        .catch((err: any) => {
          console.log(err);
          toast.error("Server not responding. Please try again later.");
        });
    }
  };

  const capturePhoto = async (index: any) => {
    setimageErrorShow("");

    let src = CameraSource.Prompt;
    if (Capacitor.getPlatform() === "web") {
      src = CameraSource.Photos;
    }

    const image = await Camera.getPhoto({
      quality: 25,
      allowEditing: false,
      saveToGallery: false,
      source: src,
      direction: CameraDirection.Rear,
      resultType: CameraResultType.Base64,
    });

    let fileData =
      "data:image/jpeg;base64," + image.base64String?.replace(/^"|"$/g, ""); // Remove any extraneous quotes
    setImageUploadForIndex(index, true);

    setTimeout(() => {
      setImageUploadForIndex(index, false);
    }, 2000);
    console.log("image base64 in pest activity", fileData);

    const updatedFormDataArray = [...formDataArray];
    updatedFormDataArray[index].pest_photo.push(fileData);
    setFormDataArray(updatedFormDataArray);
    setIsImageCaptured(true);
    setValue(`pest_photo${index}`, true);
    clearErrors(`pest_photo${index}`);
    // Debug: Log the updated array
    console.log(
      "Updated Photos Array:",
      updatedFormDataArray[index].pest_photo
    );
    await trigger(`formDataArray.${index}.pest_photo.0`);
  };
  const handleAddForm = () => {
    const newFormData = {
      is_pest_found: "",
      sub_service_id: "",
      pest_severity: "",
      pest_area: "",
      pest_report_type: "",
      pest_photo: [], // Initialize as an empty array
    };
    setFormDataArray([...formDataArray, newFormData]);
  };

  const history = useHistory();
  const goBack = async () => {
    if (db) {
      try {
        // alert("removed from db");
        await db.remove("pest-activity-formdata-temp");
        console.log("Data has been successfully removed from Ionic Storage");
      } catch (err) {
        console.error("Error removing data from Ionic Storage:", err);
      }
    } else {
      console.error("Storage instance is not initialized");
    }
    history.push("/taskexecution");
  };
  const taskDataStr = localStorage.getItem("activeTaskData");
  if (!taskDataStr) {
    throw new Error("Task Data is not available");
  }
  const activeTaskData = JSON.parse(taskDataStr);
  const visitId = activeTaskData.id;

  const onSubmitError = async (data: any) => {
    console.log("PestActForm Submit error", data);
  };
  const onSubmit = async (data: any) => {
    setimageErrorShow("Please Upload Image");
    const isValid = formDataArray.every((item) => {
      const isCommonFieldsValid =
        item.is_pest_found !== "" &&
        item.pest_report_type !== "" &&
        item.pest_area !== "" &&
        item.pest_photo.length > 0;

      if (item.is_pest_found === "Yes") {
        return isCommonFieldsValid && item.pest_severity !== "";
      }
      return isCommonFieldsValid;
    });

    if (!isValid) {
      setShowToast(true);
      console.error("Form is not valid");
      return;
    }

    setSubmitting(true);

    if (location.latitude === null || location.longitude === null) {
      console.error("Location data is not available");
      return;
    }
    setimageErrorShow("");
    //=======================dataStoring online/offkine start===============
    try {
      console.log("formDataArray--------------->", formDataArray);
      const { response, data } = await savePestActivityBasedOnNetwork(
        formDataArray,
        location.latitude,
        location.longitude,
        visitId
      );

      console.log("pestFormData", data);

      if (response.ok) {
        if (data.error) {
          // toast.error(data.message)
        } else {
          updateTaskStatus("", "pestActivityDiscov", ProgressStatus.done);

          let response = await retrieveNetworkTasksExecutionDetails(visitId);
          if (response.error) {
            toast.error(response.message);
          } else {
            if (db) {
              try {
                // alert("removed from db");
                await db.remove("pest-activity-formdata-temp");
                console.log(
                  "Data has been successfully removed from Ionic Storage"
                );
              } catch (err) {
                console.error("Error removing data from Ionic Storage:", err);
              }
            } else {
              console.error("Storage instance is not initialized");
            }
          }

          history.push("/ChemicalUsed");
        }
        // localStorage.setItem("pestFormData", JSON.stringify(formDataArray));
        // setFormDataArray([
        //   {
        //     is_pest_found: "",
        //     sub_service_id: "",
        //     pest_severity: "",
        //     pest_area: "",
        //     pest_report_type: "",
        //     pest_photo: [],
        //   },
        // ]);
      } else {
        console.error(data);
      }
    } catch (error) {
      console.error("Error in posting pest activity:", error);
      // localStorage.setItem("pestFormData", JSON.stringify(formDataArray));

      // Handle offline scenario
      console.log("Handling offline scenario...");
      setFormDataArray([
        {
          is_pest_found: "",
          sub_service_id: "",
          pest_severity: "",
          pest_area: "",
          pest_report_type: "",
          pest_photo: [],
        },
      ]);

      // await savePestActivityDataToBD(formDataArray,location.latitude , location.longitude,visitId);

      updateTaskStatus("", "pestActivityDiscov", ProgressStatus.done);

      history.push("/ChemicalUsed");
    } finally {
      setSubmitting(false);
    }

    //=======================dataStoring online/offkine end===============
  };

  const handleCancel = async () => {
    // Display a confirmation alert using swal
    const willReset = await swal({
      title: "Are you sure?",
      text: "Do you want to reset the form? This action cannot be undone.",
      buttons: ["Cancel", "OK"],
    });

    // If the user confirms, reset the form fields
    if (willReset) {
      setFormDataArray([
        {
          is_pest_found: "",
          sub_service_id: "",
          pest_severity: "",
          pest_area: "",
          pest_report_type: "",
          pest_photo: [], // Initialize as an empty array
        },
      ]);
      clearErrors();
      reset();
      // history.push("/taskexecution");
    }
  };

  const navigateToTaskPreview = () => {
    if (db) {
      db.set("pest-activity-formdata-temp", JSON.stringify(formDataArray))
        .then(() => {
          console.log(
            "Pest types data has been successfully stored in Ionic Storage:",
            formDataArray
          );
        })
        .catch((err: any) => {
          console.error("Error storing data in Ionic Storage:", err);
        });
    } else {
      console.error("Storage instance is not initialized");
    }
    // Navigate to the TaskPreview page with the hash to scroll to pest activity
    history.push("/taskpreview#pestActivitySection", {
      state: { from: "/pestactivityfound" },
    });
  };

  // ===================================Image Delelte Logic=====================
  const handleRemoveImage = (index: number, imageIndex: number) => {
    const updatedFormDataArray = [...formDataArray];
    updatedFormDataArray[index].pest_photo.splice(imageIndex, 1);

    setFormDataArray(updatedFormDataArray);

    // Update the form value to pass validation
    // Assuming that pest_photo field needs validation update if images are removed.
    if (updatedFormDataArray[index].pest_photo.length === 0) {
      setError(`pest_photo${index}`, {
        type: "manual",
        message: "Image capture is required",
      });
    } else {
      clearErrors(`pest_photo${index}`);
    }

    // No reset() call to avoid clearing other form fields
    console.log("FormDataArray-----", formDataArray);
  };

  const handleDeleteForm = () => {
    if (formDelete !== null) {
      const updatedFormDataArray = formDataArray.filter(
        (_, index) => index !== formDelete
      );

      // Reset the form at the specific index being deleted
      if (formDataArray[formDelete]) {
        reset(formDataArray[formDelete]);
      }

      setFormDataArray(updatedFormDataArray);
      setFormDelete(null);
    }
  };
  const openDeleteAlert = (index: any) => {
    setShowDeleteAlert(true);
    setFormDelete(index);
  };
  const handleCancelDelete = () => {
    setShowDeleteAlert(false);
    setFormDelete(null);
  };

  const setImageUploadForIndex = (index: any, status: any) => {
    setImageUploadStatus((prevState) => ({
      ...prevState,
      [index]: status,
    }));
  };

  return (
    <>
      <IonHeader
        translate="yes"
        className="ion-no-border ion-padding-horizontal"
      >
        <IonToolbar>
          <IonButtons slot="start" className="ion-no-padding">
            <IonButton onClick={goBack}>
              <IonIcon icon={arrowBack} />{" "}
              {/* You can use the appropriate arrow icon */}
            </IonButton>
          </IonButtons>
          <IonTitle className="ion-float-start">Pest Activity Found</IonTitle>
          <div className="ion-float-end headerBts">
            <IonButton shape="round" onClick={navigateToTaskPreview}>
              <IonImg src="/assets/images/preview-icon.svg" />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ionContentColor">
        <form onSubmit={handleSubmit(onSubmit, onSubmitError)}>
          <div className="ion-padding-horizontal ion-padding-vertical ionPaddingBottom">
            <IonText>
              <h1 className="headingH1">Please update the form</h1>
            </IonText>

            {formDataArray.map((item, index) => (
              <div className="formlist pafFormCard" key={index}>
                {index > 0 && ( // Conditionally render the delete button for forms starting from the second form
                  <IonButton
                    className="itemBt deletePaf"
                    shape="round"
                    onClick={() => openDeleteAlert(index)}
                    style={{
                      margin: "auto",
                      marginTop: "25px",
                      marginLeft: "270px",
                      width: "40px",
                      height: "40px",
                    }}
                  >
                    <IonImg
                      src="/assets/images/delete-icon.svg"
                      style={{ width: "20px", height: "20px" }}
                    ></IonImg>
                  </IonButton>
                )}
                <IonItem lines="none">
                  <div className="width100">
                    <IonLabel className="ion-label">
                      Pest Found ?<IonText>*</IonText>
                    </IonLabel>

                    <IonSelect
                      // id={`is_pest_found${index}`}
                      value={item.is_pest_found} // Bind value to state variable
                      placeholder="Select"
                      fill="outline"
                      style={{ width: "100%" }}
                      // defaultValue={item.is_pest_found}
                      onIonChange={(e: any) => {
                        handleIsPestFoundChange(e.detail.value!, index);
                        clearErrors("is_pest_found" + index);
                      }}
                      {...register("is_pest_found" + index, {
                        required: {
                          value: true,
                          message: "Pest found is required",
                        },
                      } as any)}
                    >
                      <IonSelectOption value="Yes">Yes</IonSelectOption>
                      <IonSelectOption value="No">No</IonSelectOption>
                    </IonSelect>
                  </div>
                </IonItem>
                {isSubmitted && errors["is_pest_found" + index] && (
                  <IonBadge color="danger">
                    {(errors["is_pest_found" + index] as any).message}
                  </IonBadge>
                )}

                <IonItem lines="none">
                  <div className="width100">
                    <IonLabel className="ion-label">
                      Pest Activity Found <IonText>*</IonText>
                    </IonLabel>
                    <IonSelect
                      value={item.pest_report_id} // Use pest_report_id as the value
                      placeholder="Select"
                      fill="outline"
                      style={{ width: "100%" }}
                      onIonChange={(e: any) => {
                        handlePestActivityChange(e.detail.value!, index);
                        clearErrors("pest_report_type" + index);
                      }}
                      {...register("pest_report_type" + index, {
                        required: {
                          value: true,
                          message: "Pest Activity Found is required",
                        },
                      })}
                    >
                      {pestOptions.map((option, optionIndex) => (
                        <IonSelectOption key={optionIndex} value={option.id}>
                          {option.pest_report_type}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </div>
                </IonItem>
                {isSubmitted && errors["pest_report_type" + index] && (
                  <IonBadge color="danger">
                    {(errors["pest_report_type" + index] as any).message}
                  </IonBadge>
                )}

                {item.is_pest_found === "Yes" && (
                  <>
                    <IonItem lines="none">
                      <div className="width100">
                        <IonLabel className="ion-label">
                          Activity Level <IonText>*</IonText>
                        </IonLabel>
                        <IonSelect
                          value={item.pest_severity}
                          placeholder="Select"
                          fill="outline"
                          style={{ width: "100%" }}
                          {...register("pest_severity" + index, {
                            required: {
                              value: true,
                              message: "Activity Level is required",
                            },
                          })}
                          onIonChange={(e: any) => {
                            handleSeverityChange(e.detail.value!, index);
                            clearErrors("pest_severity" + index);
                          }}
                        >
                          <IonSelectOption value="High">High</IonSelectOption>
                          <IonSelectOption value="Medium">
                            Medium
                          </IonSelectOption>
                          <IonSelectOption value="Low">Low</IonSelectOption>
                        </IonSelect>
                      </div>
                    </IonItem>
                    {isSubmitted && errors["pest_severity" + index] && (
                      <IonBadge color="danger">
                        {(errors["pest_severity" + index] as any).message}
                      </IonBadge>
                    )}
                  </>
                )}
                <IonItem lines="none">
                  <div className="width100">
                    <IonLabel className="ion-label">
                      Area<IonText>*</IonText>
                    </IonLabel>
                    <IonInput
                      value={item.pest_area} // Bind value to state variable
                      aria-label="Text"
                      fill="outline"
                      placeholder=""
                      onIonInput={(e: any) => {
                        handleAreaChange(e.detail.value, index);
                        clearErrors("pest_area" + index);
                      }}
                      {...register("pest_area" + index, {
                        // <-- Correct field name here
                        required: {
                          value: true,
                          message: "Area is required",
                        },
                      })}
                    ></IonInput>
                  </div>
                </IonItem>
                {isSubmitted &&
                  errors["pest_area" + index] && ( // <-- Correct field name here
                    <IonBadge color="danger">
                      {(errors["pest_area" + index] as any).message}
                    </IonBadge>
                  )}

                <IonItem lines="none">
                  <div className="ion-padding-bottom">
                    <IonLabel className="ion-label">
                      Photo of Pest Found <IonText>*</IonText>
                    </IonLabel>
                    {/* <input
                    type="file"
                    onChange={(e) => handlePestPhotoChange(e, index)}
                    accept="image/*"
                  /> */}

                    <IonButton
                      className="ion-button"
                      fill="solid"
                      color="medium"
                      disabled={formDataArray[index].pest_photo.length >= 3}
                      onClick={() => {
                        capturePhoto(index);
                      }}
                    >
                      Capture Image
                    </IonButton>

                    <input
                      type="hidden"
                      {...register(`formDataArray.${index}.pest_photo.0`, {
                        validate: (value) => {
                          // Ensure there's at least one image captured
                          return (
                            value ||
                            formDataArray[index].pest_photo.length > 0 ||
                            "Image capture is required"
                          );
                        },
                      })}
                    />
                  </div>
                </IonItem>
                {Array.isArray(errors?.formDataArray) &&
                  errors.formDataArray[index]?.pest_photo?.[0] && (
                    <IonBadge color="danger">
                      {errors.formDataArray[index].pest_photo[0].message}
                    </IonBadge>
                  )}

                {formDataArray[index].pest_photo.length >= 3 ? (
                  <IonText style={{ color: "#54B4D3" }}>
                    You cannot capture more than 3 images.
                  </IonText>
                ) : (
                  ""
                )}
                {/* 
                {isSubmitted && item.pest_photo.length < 1 && (
                  <IonBadge color="danger">Image capture is required</IonBadge>
                )} */}

                {formDataArray[index].pest_photo.length > 0 && (
                  <Splide
                    options={{
                      rewind: true,
                      width: "100%",
                      gap: "1rem",
                    }}
                  >
                    {imageUploadStatus[index] && (
                      <div className="absolute-center">
                        {/* <IonLabel>image Uploading</IonLabel> */}
                        <IonSpinner name="dots" />
                      </div>
                    )}
                    {formDataArray[index].pest_photo.map(
                      (photo: any, photoIndex: any) => (
                        <SplideSlide key={photoIndex}>
                          <IonImg src={photo} />
                          <div slot="center" className="del" title="Delete">
                            <p
                              onClick={() =>
                                handleRemoveImage(index, photoIndex)
                              } // Ensure correct parameters
                              style={{ width: "50%", margin: "10px auto" }}
                            >
                              &times;
                            </p>
                          </div>
                          {/* {imgDelete && (
                            <IonItem className="absolute-center">
                              <IonLabel>Deleting</IonLabel>
                              <IonSpinner name="dots" />
                            </IonItem>
                          )} */}
                        </SplideSlide>
                      )
                    )}
                  </Splide>
                )}
              </div>
            ))}
          </div>

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
                //   disabled={submitting || !isFormValid}
              >
                SUBMIT
              </IonButton>
            </IonToolbar>
          </IonFooter>
        </form>

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={handleAddForm}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>

      <div>
        <FullScreenLoader isLoading={submitting} />
      </div>
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={handleCancelDelete}
        header={"Confirm Delete"}
        message={"Do you really want to delete"}
        buttons={[
          {
            text: "cancel",
            role: "cancel",
            handler: handleCancelDelete,
          },
          {
            text: "Delete",
            handler: handleDeleteForm,
          },
        ]}
      ></IonAlert>
    </>
  );
};

export default PestActivityFound;
