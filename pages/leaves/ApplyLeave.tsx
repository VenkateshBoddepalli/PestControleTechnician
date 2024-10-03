import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../data/baseUrl";
import {
  IonButton,
  IonContent,
  IonFooter,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonToolbar,
  IonText,
  IonBadge,
} from "@ionic/react";
import { useHistory } from "react-router";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import CommonHeader from "../../components/CommonHeader";
import { toast } from "react-toastify";
import {
  fetchLeaveTypes,
  submitLeaveApply,
} from "../../data/apidata/leaveApi/leaveDataApi";

const ApplyLeave = () => {
  const history = useHistory();
  const location = useLocation();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitted },
    setValue,
    watch,
    clearErrors,
    reset
  } = useForm({ mode: "all" });

  useEffect(() => {
    if (location.state && (location.state as any).leaveDetails) {
      const { leaveTypeId, leaveStartDate, leaveEndDate, reasonForLeave } = (
        location.state as any
      ).leaveDetails;
      setValue("leaveTypeId", leaveTypeId);
      setValue("leaveStartDate", leaveStartDate);
      setValue("leaveEndDate", leaveEndDate);
      setValue("reasonForLeave", reasonForLeave);
    }
  }, [location.state, setValue]);

  const [leaveTypes, setLeaveTypes] = useState<
    { id: string; leave_type_name: string }[]
  >([]);
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const watchedLeaveStartDate = watch("leaveStartDate", leaveStartDate);
  const watchedLeaveEndDate = watch("leaveEndDate", leaveEndDate);
  const watchedDayType = watch("dayType");

  useEffect(() => {
    fetchLeaveTypes();
    setLeaveStartDate(getCurrentDate());
    setLeaveEndDate(getCurrentDate());
    fetchUserData();
  }, []);

  const handleStartDateChange = (e: any) => {
    const startDate = e.target.value;
    setValue("leaveStartDate", startDate);
    clearErrors("leaveStartDate");
    if (watchedDayType === "21" || watchedDayType === "22") {
      setValue("leaveEndDate", startDate);
      clearErrors("leaveEndDate");
    }
  };

  const handleDayTypeChange = (e: any) => {
    const dayType = e.target.value;
    setValue("dayType", dayType);
    clearErrors("dayType");
    if (dayType === "21" || dayType === "22") {
      setValue("leaveEndDate", watchedLeaveStartDate);
      clearErrors("leaveEndDate");
    } else {
      setValue("leaveEndDate", ""); // Clear end date for full day
    }
  };

  const handleEndDateChange = (e: any) => {
    const endDate = e.target.value;
    setValue("leaveEndDate", endDate);
    clearErrors("leaveEndDate");
  };

  const getCurrentDate = (): string => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (userData) {
      fetchLeaveTypes().then((data) => {
        if (data) {
          setLeaveTypes(data);
        }
      });
    }
  }, [userData]);

  const fetchUserData = () => {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setUserData(userData);
    } else {
      console.error("User Data is not available");
    }
  };

  const onSubmit = async (data: any) => {
    if (!userData) {
      console.error("User Data is not available");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
  
    try {
      // Ensure dayType is included in data
      data.dayType = watch("dayType");
  
      const response = await submitLeaveApply(data);
      if (response.success) {
        toast.success(response.message);
        console.log("Leave application submitted successfully!");
        history.push("/leaverequestlist");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleCancel = () => {
    // Reset form fields
    reset({
      leaveTypeId: "",
      leaveStartDate: "",
      leaveEndDate: "",
      dayType: "", // Ensure this is included
      reasonForLeave: ""
    });

    // Clear local state if needed
    setLeaveStartDate(getCurrentDate());
    setLeaveEndDate(getCurrentDate());

    // Navigate to the previous page
    // history.push("/leaverequestlist");
  };

  return (
    <>
      <CommonHeader
        backToPath={"/leaverequestlist"}
        pageTitle={"Apply Leave"}
        showIcons={false}
      />

      
        <IonContent fullscreen className="ionContentColor ">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="ion-padding-horizontal ion-padding-vertical ionPaddingBottom">
            <IonText>
              <h1 className="headingH1">Please update the form</h1>
            </IonText>

            <IonList className="formlist">
              <IonItem lines="none">
                <div className="width100">
                  <IonLabel className="ion-label">Leave Type<IonText>*</IonText></IonLabel>
                  <IonSelect
                    placeholder="Select"
                    fill="outline"
                    onIonChange={() => clearErrors("leaveTypeId")}
                    {...register("leaveTypeId", {
                      required: {
                        value: true,
                        message: "Please select a leave type",
                      },
                    })}
                  >
                    {leaveTypes.map((leaveType) => (
                      <IonSelectOption key={leaveType.id} value={leaveType.id}>
                        {leaveType.leave_type_name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </div>
              </IonItem>
              {isSubmitted && errors.leaveTypeId && (
                <IonBadge color="danger">
                  {(errors.leaveTypeId as any).message}
                </IonBadge>
              )}
              <IonItem lines="none">
                <div className="width100">
                  <IonLabel className="ion-label">Select Day Type<IonText>*</IonText></IonLabel>
                  <IonSelect
                    placeholder="Select"
                    fill="outline"
                    onIonChange={handleDayTypeChange}
                    {...register("dayType", {
                      required: {
                        value: true,
                        message: "Please select a day type",
                      },
                    })}
                  >
                    <IonSelectOption value="20">Full Day</IonSelectOption>
                    <IonSelectOption value="21">First Half</IonSelectOption>
                    <IonSelectOption value="22">Second Half</IonSelectOption>
                  </IonSelect>
                </div>
              </IonItem>
              {isSubmitted && errors.dayType && (
                <IonBadge color="danger">
                  {(errors.dayType as any).message}
                </IonBadge>
              )}
              <IonItem lines="none">
                <div className="width100">
                  <IonLabel className="ion-label">Start Date<IonText>*</IonText></IonLabel>
                  <IonInput
                    type="date"
                    aria-label="Start Date"
                    fill="outline"
                    placeholder=""
                    onIonChange={handleStartDateChange}
                    min={getCurrentDate()}
                    {...register("leaveStartDate", {
                      required: "Please select a Start date",
                    })}
                  ></IonInput>
                </div>
              </IonItem>
              {isSubmitted && errors.leaveStartDate && (
                <IonBadge color="danger">
                  {(errors.leaveStartDate as any).message}
                </IonBadge>
              )}

              <IonItem lines="none">
                <div className="width100">
                  <IonLabel className="ion-label">End Date<IonText>*</IonText></IonLabel>
                  <IonInput
                    type="date"
                    aria-label="End Date"
                    fill="outline"
                    placeholder=""
                    min={watch("leaveStartDate") || getCurrentDate()}
                    readonly={
                      watchedDayType === "21" || watchedDayType === "22"
                    }
                    value={
                      watchedDayType === "21" || watchedDayType === "22"
                        ? watchedLeaveStartDate
                        : watchedLeaveEndDate
                    }
                    onIonChange={handleEndDateChange}
                    {...register("leaveEndDate", {
                      required: "Please select an End date",
                    })}
                  ></IonInput>
                </div>
              </IonItem>
              {isSubmitted && errors.leaveEndDate && (
                <IonBadge color="danger">
                  {(errors.leaveEndDate as any).message}
                </IonBadge>
              )}
              <IonItem lines="none">
                <div className="width100">
                  <IonLabel className="ion-label">Reason for Leave<IonText>*</IonText></IonLabel>
                  <IonTextarea
                    rows={5}
                    autoGrow={true}
                    className="input"
                    style={{background:"#fff"}}
                 
                    placeholder=""
                    onIonInput={() => clearErrors("reasonForLeave")}
                    {...register("reasonForLeave", {
                      required: "Please enter reason for leave",
                    })}
                  />
                </div>
              </IonItem>
              {isSubmitted && errors.reasonForLeave && (
                <IonBadge color="danger">
                  {(errors.reasonForLeave as any).message}
                </IonBadge>
              )}
            </IonList>
          </div>


          <IonFooter className="ion-footer">
            <IonToolbar className="ionFooterTwoButtons">
              <IonButton
                className="ion-button"
                fill="outline"
                color="medium"
               onClick={handleCancel}
              //  onClick={history.goBack}
              >
               RESET
              </IonButton>
              <IonButton
                type="submit"
                className="ion-button"
                color="primary"
                disabled={isSubmitting}
              >
                SUBMIT
              </IonButton>
            </IonToolbar>
          </IonFooter>
          </form>
        </IonContent>
       
    
     
    </>
  );
};

export default ApplyLeave;
