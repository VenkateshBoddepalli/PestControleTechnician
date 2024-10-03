import React, { useRef, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { useMemo } from "react";
import {
  IonAccordionGroup,
  IonAccordion,
  IonButton,
  IonContent,
  IonImg,
  IonInput,
  IonItem,
  IonList,
  IonPage,
  IonText,
  IonThumbnail,
  IonIcon,
  IonToolbar,
  IonFooter,
  IonProgressBar,
  IonSelect,
  IonLabel,
  IonSelectOption,
  IonHeader,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonAlert,
} from "@ionic/react";
import CommonHeader from "../components/CommonHeader";
import { add, key, remove } from "ionicons/icons";
import { useLocation } from "react-router";
import { arrowBack } from "ionicons/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import clsx from "clsx";

import {
  ProgressStatus,
  updateTaskStatus,
} from "../data/localstorage/taskStatusStorage";
import { API_BASE_URL } from "../data/baseUrl";
import { getCurrentLocation } from "../data/providers/GeoLocationProvider";
import FullScreenLoader from "../components/FullScreenLoader";
import "./ChemicalUsed.css";

import { insertChemicalsUsedForPest } from "../data/apidata/taskApi/taskDataApi"; // Adjust the path as necessary
import { saveChemicalUsedBasedOnNetwork } from "../data/offline/entity/DataTransfer";
import useLongitudeLocation from "../components/useLongitudeLocation";
import {
  retrieveNetworkInitTimes,
  retrieveNetworkTasksExecutionDetails,
  retrievevisitExecutionDetailsBasedonNetwork,
} from "../data/offline/entity/DataRetriever";
interface UsageItem {
  service_id: string;
  item_id: string;
  item_name: string;
  name: string; // Unit name
  quantity: any; // Unit Qty (changed from string to number)
  price: string;
}

interface PerActivityUsage {
  pest_report_id: number;
  pest_report_type: string;
  usage: Array<UsageItem>;
}

type ValidationErrorsType = {
  [key: number]: string;
};
type Id = string | number;
const ChemicalUsed = () => {
  const history = useHistory();
  const [visitExecutionDetails, setVisitExecutionDetails] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const accordionGroup = useRef<HTMLIonAccordionGroupElement>(null);
  const [loading, setLoading] = useState(true); // Set loading to true initially
  const location = useLongitudeLocation();
  const pestsFound = visitExecutionDetails?.pests_found;

  const pestActivityArray = pestsFound?.filter(
    (pest: any) => pest.is_chemical_added === null
  );

  console.log("------------------------------>", pestActivityArray);
  const [userData, setUserData] = useState<any>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState({
    activityIndex: null,
    usageIndex: null,
  });
  const [focusedInput, setFocusedInput] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [validationErrors, setValidationErrors] =
    useState<ValidationErrorsType>({});
  const [activityUsageArray, setActivityUsageArray] = useState<
    Array<PerActivityUsage>
  >([]);
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: number]: string;
  }>({});
  const [accordionValue, setAccordionValue] = useState<string>("open"); // State for controlling accordion
  const [accordionStates, setAccordionStates] = useState<{
    [key: number]: boolean;
  }>({});
  const toastId = useRef<Id | null>(null);
  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchVisitExecutionDetails = async (visitId: string) => {
      try {
        const data = await retrievevisitExecutionDetailsBasedonNetwork(visitId);
        if (data) {
          console.log("Visit Execution Details ::", data);
          setVisitExecutionDetails(data);
        } else {
          console.error(data.message);
          // toast.error("Server not responding. Please try again later.");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Server not responding. Please try again later.");
      }
    };
    fetchVisitExecutionDetails(visitId);
  }, []);
  useEffect(() => {
    const initActivityUsageArray = async () => {
      const pestsFound = visitExecutionDetails?.pests_found;

      const pestActivityArray = pestsFound?.filter(
        (pest: any) => pest.is_chemical_added === null
      );
      let activityUsageArrayTemp: PerActivityUsage[] = [];
      const activityUsageArrayTempStr =
        localStorage.getItem("activityUsageArray");
      activityUsageArrayTemp = activityUsageArrayTempStr
        ? JSON.parse(activityUsageArrayTempStr)
        : [];

      if (
        activityUsageArrayTemp.length === 0 &&
        Array.isArray(pestActivityArray)
      ) {
        activityUsageArrayTemp = pestActivityArray.map((activity: any) => ({
          pest_report_id: activity.pest_reported_id,
          pest_report_type: activity.pest_report_type,
          usage: [],
        }));
      } else {
        const selectedPestActIndForChem = localStorage.getItem(
          "selectedPestActIndForChem"
        );
        if (selectedPestActIndForChem) {
          const selectedChemicalItemsStr = localStorage.getItem(
            `selectedChemicalItems_${selectedPestActIndForChem}`
          );
          const selectedChemicalItems = selectedChemicalItemsStr
            ? JSON.parse(selectedChemicalItemsStr)
            : [];
          if (activityUsageArrayTemp[parseInt(selectedPestActIndForChem)]) {
            activityUsageArrayTemp[parseInt(selectedPestActIndForChem)].usage =
              selectedChemicalItems;
          }
        }
      }

      // Remove duplicate entries
      activityUsageArrayTemp = [
        ...new Map(
          activityUsageArrayTemp.map((item) => [item.pest_report_type, item])
        ).values(),
      ];

      setActivityUsageArray(activityUsageArrayTemp);
      setLoading(false);
    };

    initActivityUsageArray();
  }, [visitExecutionDetails]);

  console.log("activityUsageArrayTemp----------->", activityUsageArray);

  const fetchUserData = () => {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setUserData(userData);
      setLoading(false); // Set loading to false after fetching user data
    } else {
      console.error("User Data is not available");
    }
  };
  const taskDataStr = localStorage.getItem("activeTaskData");
  if (!taskDataStr) {
    throw new Error("Task Data is not available");
  }
  const activeTaskData = JSON.parse(taskDataStr);
  const visitId = activeTaskData.id;

  const onAddItemClick = (index: number) => {
    // Store selected options in local storage
    localStorage.setItem("selectedOptions", JSON.stringify(selectedOptions));
    localStorage.setItem("selectedPestActIndForChem", index.toString());

    // Update the activity usage array in local storage
    localStorage.setItem(
      "activityUsageArray",
      JSON.stringify(activityUsageArray)
    );

    // Get task data from local storage

    // Store activity usage array specific to the visit ID
    // localStorage.setItem(
    //   `activityUsageArray-${visitId}`,
    //   JSON.stringify(activityUsageArray)
    // );

    // Navigate to the ChemicalUsedDetails page
    history.push("/ChemicalUsedDetails");
  };

  const validateForm = (): boolean => {
    let errors: ValidationErrorsType = {};
    filteredPestActivityArray.forEach((data: any, index: number) => {
      if (!selectedOptions[index]) {
        errors[index] = "Please select whether you want to add chemicals.";
      } else if (selectedOptions[index] === "Yes" && data.usage.length === 0) {
        errors[index] = "Please select chemicals.";
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async () => {
    setFormSubmitted(true);

    if (validateForm()) {
      // useEffect(()=>{

      // },[selectedOptions])
      localStorage.removeItem("selectedOptions");
      localStorage.removeItem("accordionStates");
      const invalidQuantities = activityUsageArray.some((activity) =>
        activity.usage.some(
          (item) => item.quantity <= 0 || item.quantity >= 10000
        )
      );

      if (invalidQuantities) {
        // toast.error(
        //   "Please ensure all quantities are greater than zero and less than 10,000."
        // );
        // alert("Please ensure all quantities are greater than zero and less than 10,000.");
        console.log(
          "Please ensure all quantities are greater than zero and less than 10,000."
        );
        return; // Stop the submission process
      }

      // Check for empty quantities
      const emptyQuantities = activityUsageArray.some((activity) =>
        activity.usage.some((item) => !item.quantity)
      );

      if (emptyQuantities) {
        toast.error("Please enter the quantity of the selected chemicals", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return; // Stop the submission process
      }
      try {
        setSubmitting(true); // Set submitting to true when submission starts
        // Retrieve the index of the selected pest activity from sessionStorage

        const selectedPestActIndForChem = localStorage.getItem(
          "selectedPestActIndForChem"
        );

        // Clear local storage items related to chemical usage
        //  localStorage.removeItem("selectedPestActIndForChem");

        // Check if the index exists and remove all associated items
        if (selectedPestActIndForChem) {
          let index = parseInt(selectedPestActIndForChem);

          // Loop through all possible indices and remove corresponding items
          for (let i = 0; i <= index; i++) {
            localStorage.removeItem(`selectedChemicalItems_${i}`);
          }
        }

        // localStorage.removeItem("activityUsageArray");
        // localStorage.removeItem("selectedChemicalItems");

        // Check if selectedPestActIndForChem is not null or empty
        if (selectedPestActIndForChem) {
          // Store the data in sessionStorage
          localStorage.setItem(
            selectedPestActIndForChem,
            JSON.stringify(
              activityUsageArray[parseInt(selectedPestActIndForChem)]
            )
          );
        } else {
          console.error("SelectedPestActIndForChem is null or empty");
          // return;
        }
        console.log("Activity usage array:", activityUsageArray);
        let dataArray: any = [];
        let uniqueItemIds = new Set();
        const pestsFound = visitExecutionDetails.pests_found || [];
        const pestsWithNullChemical = pestsFound.filter(
          (pest: any) => pest.is_chemical_added === null
        );

        // Group pests by pest_report_type
        const groupedPests = pestsWithNullChemical.reduce(
          (acc: any, pest: any) => {
            if (!acc[pest.pest_report_type]) {
              acc[pest.pest_report_type] = [];
            }
            acc[pest.pest_report_type].push(pest);
            return acc;
          },
          {}
        );

        let service_id = activeTaskData.service_id;
        for (var i = 0; i < activityUsageArray.length; i++) {
          let pest_id = activityUsageArray[i].pest_report_id;
          let service_id = activeTaskData.service_id;

          let perDatArr = activityUsageArray[i].usage.map((item) => {
            return {
              service_id: service_id,
              pest_reported_id: pest_id,
              item_id: item.item_id,
              quantity: item.quantity,
            };
          });

          dataArray = dataArray.concat(perDatArr); // Flatten the array structure
        }
        if (dataArray.length === 0) {
          dataArray.push({
            service_id: activeTaskData.service_id,
            pest_reported_id: "",
            item_id: "",
            quantity: "",
          });
        }

        const yesPestIds: any = [];
        const noPestIds: any = [];
        const selectedOptionsByPestType: { [key: string]: string } = {};

        // Loop over grouped pests and collect user selection for each pest_report_type
        Object.keys(groupedPests).forEach((pestType, index) => {
          const pests = groupedPests[pestType];

          // Get the user's selection for this pest type
          const userSelection = selectedOptions[index];

          if (userSelection === "Yes") {
            pests.forEach((p: any) => {
              if (p.is_chemical_added === null && !yesPestIds.includes(p.id)) {
                yesPestIds.push(p.id);
              }
            });
          } else if (userSelection === "No") {
            pests.forEach((p: any) => {
              if (p.is_chemical_added === null && !noPestIds.includes(p.id)) {
                noPestIds.push(p.id);
              }
            });
          }

          selectedOptionsByPestType[pestType] = userSelection;
        });

        const chemicalsAdded = [
          {
            is_chemical_added: "Yes",
            pest_found_ids: yesPestIds.join(","),
          },
          {
            is_chemical_added: "No",
            pest_found_ids: noPestIds.join(","),
          },
        ];

        console.log("chemicalsAdded", chemicalsAdded);
        console.log("chemicalsAdded", chemicalsAdded);

        let aactivityUsageArray = [...activityUsageArray];
        const taskDataStr = localStorage.getItem("activeTaskData");
        if (!taskDataStr) {
          throw new Error("Task Data is not available");
        }
        // const activeTaskData = JSON.parse(taskDataStr);
        // const visitId = activeTaskData.id;

        // Store the new array in local storage with a different key
        localStorage.setItem(
          `activeChemicalUsed-${visitId}`,
          JSON.stringify(aactivityUsageArray)
        );

        console.log(
          "Another array stored in local storage:",
          aactivityUsageArray
        );

        // localStorage.setItem(
        //   "activityUsageArray",
        //   JSON.stringify(activityUsageArray)
        // );

        const geoloc = await getCurrentLocation();

        const activeTaskStr = localStorage.getItem("activeTaskData");
        if (!activeTaskStr) {
          throw new Error("Task Data not available");
        }

        let latitude: number | null = location.latitude;
        let longitude: number | null = location.longitude;
        // Make the API call
        // In handleSubmit or calling function
        if (latitude !== null && longitude !== null) {
          const response = await saveChemicalUsedBasedOnNetwork(
            latitude,
            longitude,
            visitId,
            dataArray,
            chemicalsAdded
          );

          if (response) {
            // console.log(response.message);
            updateTaskStatus("", "chemicalsUsed", ProgressStatus.done);

            localStorage.removeItem("selectedChemicalItems");
            localStorage.removeItem("selectedOptions");
            localStorage.removeItem("selectedPestActIndForChem");

            localStorage.removeItem("activityUsageArray");
            localStorage.removeItem(
              `selectedChemicalItemsss_${visitId}_${selectedPestActIndForChem}`
            );
            localStorage.removeItem(`activeChemicalUsed-${visitId}`);
            localStorage.removeItem("0");
            history.push("/taskexecution");
          } else {
            // if(response.status==="500"&&response.data==="Undefined variable: insert"){
            //   updateTaskStatus("", "chemicalsUsed", ProgressStatus.done);
            //   history.push("/taskexecution");
            // }
            console.error("Failed to insert records", response.message);
          }
        } else {
          console.log("No location found");
        }
      } catch (error: any) {
        if (error.message === "Something went wrong") {
          updateTaskStatus("", "chemicalsUsed", ProgressStatus.done);
          history.push("/taskexecution");
          toast.error("No chemicals added for the pest");
        } else {
          toast.error("Error during submission");
          console.error("Error during submission", error);
        }
      } finally {
        setSubmitting(false); // Set submitting back to false after submission completes
      }
    }
  };

  // // update status and Navigate to the taskexecution page
  // updateTaskStatus("", "chemicalsUsed", ProgressStatus.done);
  // history.push("/taskexecution");

  const checkQuantityInVolume =(pestFoundArray : any,pest_index: any,chemical_index: any,quantity : any,chemical : any) =>{
    // console.log(pestFoundArray+'======='+pest_index+'========'+chemical_index+'======='+quantity);
    // console.log(pest_index);
    console.log(chemical);
      let maxAvailQuantity : any = chemical.available_qty * chemical.volume;
      let availQuantity : any  = chemical.available_qty * chemical.volume;
      let usedQuantity : any  = 0;

      
    const OtherPest = pestFoundArray.filter(function(item : any,index : number) {
        return index !== pest_index
    })
    if(OtherPest.length > 0){
      console.log(OtherPest);
      OtherPest.forEach((item: any) => {
        const selectedItem = item.usage.find((item: any) => item.id == chemical.id);
        if(selectedItem && selectedItem.quantity){
          availQuantity = maxAvailQuantity - selectedItem.quantity;
          usedQuantity = usedQuantity + selectedItem.quantity;
        }else{
          console.log('Item Not Found');
          availQuantity = maxAvailQuantity;
          usedQuantity = quantity;
        }
        
      });

    }else{
      const pest = pestFoundArray[0];
      const chemicall = pest.usage[chemical_index];
      // console.log(chemical);
      maxAvailQuantity = chemicall.available_qty * chemicall.volume;

    }
    console.log('maxAvailQuantity ----->'+maxAvailQuantity);
    console.log('usedQuantity ----->'+usedQuantity);
    console.log('AvailQuantity ----->'+availQuantity);
    if(quantity > availQuantity ){
      toast.dismiss();
      toast.error('Your available quantity is '+parseFloat(availQuantity).toFixed(2) );
      return {data :  parseFloat(availQuantity).toFixed(2), status : false};
      //return false;
    }
    return {data : parseFloat(availQuantity).toFixed(2), status : true}
  }

  const handleQuantityChange = (
    index: number,
    uIndex: number,
    value: string,
    item :any
  ) => {
    const updatedActivityUsageArray = [...activityUsageArray];
    const isQuantityCheck = checkQuantityInVolume(updatedActivityUsageArray,index,uIndex,value,item);
    console.log();
    console.log(isQuantityCheck);
    if(isQuantityCheck.status){
      updatedActivityUsageArray[index].usage[uIndex].quantity = value;
    }else{
      updatedActivityUsageArray[index].usage[uIndex].quantity = parseFloat(isQuantityCheck.data).toFixed(2);
    }
    setActivityUsageArray(updatedActivityUsageArray);

    const selectedPestActIndForChem = localStorage.getItem(
      "selectedPestActIndForChem"
    );
    if (selectedPestActIndForChem) {
      const storedItemsKey = `selectedChemicalItems_${selectedPestActIndForChem}`;
      localStorage.setItem(
        storedItemsKey,
        JSON.stringify(updatedActivityUsageArray[index].usage)
      );
      const taskDataStr = localStorage.getItem("activeTaskData");
      if (!taskDataStr) {
        throw new Error("Task Data is not available");
      }
      const activeTaskData = JSON.parse(taskDataStr);
      const visitId = activeTaskData.id;

      const storedItemsKeys = `selectedChemicalItemsss_${visitId}_${selectedPestActIndForChem}`;
      localStorage.setItem(
        storedItemsKeys,
        JSON.stringify(updatedActivityUsageArray[index].usage)
      );
    }
  };
  const handleFocus = (key: string) => {
    setFocusedInput((prevState) => ({ ...prevState, [key]: true }));
  };

  const handleBlur = (key: string, usageItem: any) => {
    setFocusedInput((prevState) => ({ ...prevState, [key]: false }));
  };

  const handleClear = async () => {
    const willReset = await swal({
      title: "Are you sure?",
      text: "Do you want to reset all changes? This action cannot be undone.",
      buttons: ["Cancel", "OK"],
    });

    // If the user confirms, proceed with the reset
    if (willReset) {
      handleCancel();
    }
  };
  const handleCancel = async () => {
    const selectedPestActIndForChem = localStorage.getItem(
      "selectedPestActIndForChem"
    );
    localStorage.removeItem("selectedOptions");
    localStorage.removeItem("accordionStates");

    // Clear local storage items related to chemical usage
    localStorage.removeItem("selectedPestActIndForChem");

    // Check if the index exists and remove all associated items
    if (selectedPestActIndForChem) {
      let index = parseInt(selectedPestActIndForChem);

      // Loop through all possible indices and remove corresponding items
      for (let i = 0; i <= index; i++) {
        localStorage.removeItem(`selectedChemicalItems_${i}`);
      }
    }
    // Reset activityUsageArray based on initial data or an empty array
    const initialActivityUsageArray: PerActivityUsage[] = pestActivityArray.map(
      (activity: any) => ({
        pest_report_id: activity.sub_service_id,
        pest_report_type: activity.pest_report_type,
        usage: [],
      })
    );
    
    localStorage.removeItem("selectedChemicalItems");
    localStorage.removeItem("selectedOptions");
    localStorage.removeItem("selectedPestActIndForChem");

    localStorage.removeItem("activityUsageArray");
    localStorage.removeItem(
      `selectedChemicalItemsss_${visitId}_${selectedPestActIndForChem}`
    );
    localStorage.removeItem(`activeChemicalUsed-${visitId}`);
    localStorage.removeItem("0");
    setActivityUsageArray(initialActivityUsageArray);

    setSelectedOptions({}); // Reset selectedOptions
    setFormSubmitted(false);
  };

  // ==================getting option(yes,no) to localstorage===============

  useEffect(() => {
    const selectOpt = localStorage.getItem("selectedOptions");
    if (selectOpt) {
      setSelectedOptions(JSON.parse(selectOpt));
    } else {
      setSelectedOptions([]); // Set default value if nothing is in local storage
    }
  }, []);

  const handleSelectChange = (
    index: number,
    value: string,
    pestType: string
  ) => {
    setSelectedOptions((prev) => {
      const updatedOptions = { ...prev, [index]: value };
      localStorage.setItem("selectedOptions", JSON.stringify(updatedOptions));

      // Clear usage if "No" is selected
      if (value === "No") {
        if (toastId.current === null || !toast.isActive(toastId.current)) {
          toastId.current = toast.info("No chemicals selected for " + pestType);
        }
        const newActivityUsageArray = [...activityUsageArray];
        newActivityUsageArray[index].usage = [];
        setActivityUsageArray(newActivityUsageArray);
        localStorage.removeItem(`selectedChemicalItems_${index}`);
        localStorage.removeItem(`selectedChemicalItemsss_${visitId}_${index}`);
      }
      return updatedOptions;
    });

    // Clear validation error when an option is selected
    setValidationErrors((prev) => {
      const { [index]: removedError, ...rest } = prev;
      return rest;
    });
  };

  console.log(selectedOptions);

  // const filteredPestActivityArray = [
  //   ...new Map(
  //     activityUsageArray.map((item: any) => [item.pest_report_type, item])
  //   ).values(),
  // ];

  const filteredPestActivityArray = useMemo(() => {
    return [
      ...new Map(
        activityUsageArray.map((item: any) => [item.pest_report_type, item])
      ).values(),
    ];
  }, [activityUsageArray]);
  useEffect(() => {
    // Load accordion states from local storage when the component mounts
    const storedStates = localStorage.getItem("accordionStates");
    if (storedStates) {
      setAccordionStates(JSON.parse(storedStates));
    } else {
      // Initialize all accordions to open by default
      const initialStates: { [key: number]: boolean } = {}; // Explicitly typing the initialStates
      filteredPestActivityArray.forEach((_, index) => {
        initialStates[index] = true; // Open by default
      });
      setAccordionStates(initialStates);
    }
  }, [filteredPestActivityArray]);

  const handleAccordionToggle = (index: number) => {
    const newState = !accordionStates[index];
    setAccordionStates((prevState) => ({
      ...prevState,
      [index]: newState,
    }));
    // Update local storage with the new state
    localStorage.setItem(
      "accordionStates",
      JSON.stringify({ ...accordionStates, [index]: newState })
    );
  };

  const navigateToTaskPreviewChemicalsection = () => {
    // Navigate to the TaskPreview page with the hash to scroll to pest activity
    history.push("/taskpreview#chemicalUsedSection");
  };
  const handleRemove = (activityIndex: any, usageIndex: any) => {
    setItemToDelete({ activityIndex, usageIndex });
    setShowDeleteAlert(true);
  };

  const handleDeleteItem = () => {
    const { activityIndex, usageIndex } = itemToDelete;
    if (activityIndex !== null && usageIndex !== null) {
      // Update the activity array state
      const updatedPestActivityArray = activityUsageArray.map((activity, i) => {
        if (i === activityIndex) {
          return {
            ...activity,
            usage: activity.usage.filter((_, uIndex) => uIndex !== usageIndex),
          };
        }
        return activity;
      });

      setActivityUsageArray(updatedPestActivityArray);

      // Retrieve the index for the selected pest activity from localStorage
      const selectedPestActIndForChem = localStorage.getItem(
        "selectedPestActIndForChem"
      );

      if (!selectedPestActIndForChem) {
        console.error("No selected pest activity index found.");
        return;
      }

      // Construct the key for localStorage based on the retrieved index
      const storedItemsKey = `selectedChemicalItems_${selectedPestActIndForChem}`;
      const storedItems = localStorage.getItem(storedItemsKey);

      if (storedItems) {
        // Parse the stored items from localStorage
        let selectedChemicalItems = JSON.parse(storedItems);

        // Filter out the item to be removed based on its index
        const updatedSelectedChemicalItems = selectedChemicalItems.filter(
          (_: any, uIndex: any) => uIndex !== usageIndex
        );

        // Update the localStorage with the filtered items
        localStorage.setItem(
          storedItemsKey,
          JSON.stringify(updatedSelectedChemicalItems)
        );

        // Log the updated items
        console.log(
          `Removed item at index  ${usageIndex} from ${storedItemsKey}`
        );
      } else {
        console.error(`No stored items found for key ${storedItemsKey}.`);
      }
    }
    setShowDeleteAlert(false);
    setItemToDelete({ activityIndex: null, usageIndex: null });
  };

  const handleCancelDelete = () => {
    setShowDeleteAlert(false);
    setItemToDelete({ activityIndex: null, usageIndex: null });
  };

  const renderAddButton = (index: number) => {
    return (
      <IonButton
        className="ion-float-end addIcon"
        fill="outline"
        size="small"
        color="white"
        onClick={() => onAddItemClick(index)}
      >
        <IonIcon icon={add} />
        Add
      </IonButton>
    );
  };
 

  return (
    <IonPage>
      <ToastContainer />
      <IonHeader
        translate="yes"
        className="ion-no-border ion-padding-horizontal"
      >
        <IonToolbar>
          <IonButtons slot="start" className="ion-no-padding">
            <IonButton routerLink="/pestactivityfound" onClick={handleCancel}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>

          <IonTitle className="ion-float-start">Chemical Used</IonTitle>

          <div className="ion-float-end headerBts">
            <IonButton
              shape="round"
              onClick={navigateToTaskPreviewChemicalsection}
            >
              <IonImg src="/assets/images/preview-icon.svg" />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>

      {loading && (
        <IonToolbar>
          <IonProgressBar type="indeterminate"></IonProgressBar>
        </IonToolbar>
      )}

      <IonContent fullscreen className="ionContentColor">
        <div className="ion-padding-horizontal ionPaddingBottom">
          {filteredPestActivityArray?.map((data: any, index: number) => (
            <IonAccordionGroup
              key={index}
              ref={accordionGroup}
              multiple={true}
              className="accordionGroup"
              value={accordionStates[index] ? "open" : ""}
            >
              <IonAccordion value="open">
                <IonItem
                  slot="header"
                  lines="none"
                  onClick={() => handleAccordionToggle(index)}
                >
                  <IonThumbnail slot="start" class="thumbnailIcon">
                    <IonImg src="assets/images/tech-icon.svg" />
                  </IonThumbnail>

                  <IonText className="listCont">
                    <>
                      <h2>{data?.pest_report_type}</h2>
                      <h5>Pest Activity Found</h5>
                    </>
                  </IonText>
                </IonItem>

                <div className="accContent" slot="content">
                  <IonLabel className="ion-label">
                    Do u want to add Chemicals? <IonText>*</IonText>
                  </IonLabel>

                  {selectedOptions[index] === "Yes" ? (
                    // <div className="ion-padding-start">
                    <IonButton
                      className="ion-float-end addIcon"
                      fill="outline"
                      style={{ marginBotton: "120px" }}
                      size="small"
                      color="white"
                      onClick={(e) => onAddItemClick(index)}
                    >
                      <IonIcon icon={add}></IonIcon> Add
                    </IonButton>
                  ) : (
                    //  </div>
                    data.usage.length > 0 && (
                      <IonButton
                        className="ion-float-end addIcon"
                        fill="outline"
                        style={{ marginBotton: "120px" }}
                        size="small"
                        color="white"
                        onClick={(e) => onAddItemClick(index)}
                      >
                        <IonIcon icon={add}></IonIcon> Add
                      </IonButton>
                    )
                  )}
                  <IonItem lines="none" className="ionSelectChemicalUsed">
                    <IonSelect
                      value={selectedOptions}
                      placeholder={selectedOptions[index] || "Select Option"}
                      fill="outline"
                      onIonChange={(e) => {
                        handleSelectChange(
                          index,
                          e.detail.value,
                          data?.pest_report_type
                        );
                      }}
                    >
                      <IonSelectOption value="Yes">Yes</IonSelectOption>
                      <IonSelectOption value="No">No</IonSelectOption>
                    </IonSelect>
                  </IonItem>
                  {validationErrors[index] && formSubmitted && (
                    <IonText color="danger" style={{ paddingLeft: "15px" }}>
                      {validationErrors[index]}
                    </IonText>
                  )}

                  <IonList lines="full">
                    {[
                      ...new Set(
                        data.usage.map((usageItem: any) => usageItem.item_name)
                      ),
                    ].map((uniqueItemName, uIndex) => {
                      const usageItem = data.usage.find(
                        (item: any) => item.item_name === uniqueItemName
                      );
                      const key = `${index}-${uIndex}`;

                      return (
                        <IonItem key={uIndex} className="ion-no-padding">
                          <IonText className="listCont width100">
                            <h2>{usageItem?.item_name}</h2>

                            <h5>
                              Quantity: {usageItem.available_qty} -{" "}
                              {usageItem.packaging_uom || "No Units"}
                            </h5>
                          </IonText>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              width: "100%",
                            }}
                          >
                            <IonInput
                              style={{
                                border: "1px solid #ccc",
                                padding: "5px",
                                borderRadius: "4px",
                                width: "80px",
                                textAlign: "center",
                              }}
                              type="number"
                              value={usageItem.quantity}
                              fill="outline"
                              slot="end"
                              onIonInput={(e: any) =>
                                handleQuantityChange(
                                  index,
                                  uIndex,
                                  e.target.value,
                                  usageItem
                                )
                              }
                              onFocus={() => handleFocus(key)}
                              onBlur={() => handleBlur(key, usageItem)}
                            ></IonInput>

                            {usageItem.quantity <= 0 &&
                              !focusedInput[`${index}-${uIndex}-quantity`] && (
                                <IonText color="danger" slot="error">
                                  Quantity must be greater than zero
                                </IonText>
                              )}
                            {usageItem.quantity >= 100000 &&
                              !focusedInput[`${index}-${uIndex}-quantity`] && (
                                <IonText color="danger" slot="error">
                                  Quantity must be less than 100000
                                </IonText>
                              )}
                          </div>

                          <IonButton
                            className="itemBt"
                            shape="round"
                            style={{ marginLeft: "10px" }}
                            onClick={() => handleRemove(index, uIndex)}
                          >
                            <IonImg src="/assets/images/delete-icon.svg"></IonImg>
                          </IonButton>
                        </IonItem>
                      );
                    })}
                  </IonList>
                </div>
              </IonAccordion>
            </IonAccordionGroup>
          ))}
        </div>
        <IonFooter className="ion-footer">
          <IonToolbar className="ionFooterTwoButtons">
            <IonButton
              className="ion-button"
              fill="outline"
              color="medium"
              onClick={handleClear}
            >
              RESET
            </IonButton>
            <IonButton
              className="ion-button"
              color="primary"
              onClick={handleSubmit}
              disabled={submitting} // Disable the button when submitting is true
            >
              SUBMIT
            </IonButton>
          </IonToolbar>
        </IonFooter>
        <FullScreenLoader isLoading={submitting} />
      </IonContent>

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
            handler: handleDeleteItem,
          },
        ]}
      ></IonAlert>
    </IonPage>
  );
};

export default ChemicalUsed;
