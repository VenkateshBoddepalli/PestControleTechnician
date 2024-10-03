import React, { useEffect, useState, useRef } from "react";

import {
  IonButton,
  IonContent,
  IonFooter,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonInput,
  IonToolbar,
  IonImg,
  IonHeader,
  IonBackButton,
  IonButtons,
  IonTitle,
  IonText,
  IonDatetime,
  IonModal,
  IonAlert,
  IonList,
  IonRadioGroup,
  IonRadio,
  IonSearchbar,
  IonCheckbox,
} from "@ionic/react";
import { useHistory } from "react-router";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage, useFormikContext, FormikHelpers } from "formik";
import {
  treatmentTypes,
  pestReported,
  customerList,
  customerLocations,
  createTask,
  serviceList,
  timeDuration,
  customerType,
  getAreas,
  addCustomer,
} from "../data/apidata/taskApi/taskDataApi";
import { toast, ToastContainer } from "react-toastify";
import AddressSearch from "../components/AddressSearch";
import "./CreateTask.css";

import CustomerTypeahead from "../components/Typeahead"

const CreateTask: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(true);
  const [treatmentData, setTreatmentData] = useState<any[]>([]);
  const [pestsData, setPestsData] = useState<any[]>([]);
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [customerLocData, setCustomerLocData] = useState<any[]>([]);
  const [taskForm, setTaskForm] = useState(true);
  const [treatmentType, setTreatmentType] = useState(false);
  const [customerDataPage, setCustomerDataPage] = useState(false);
  const [serviceData, setServiceData] = useState<any[]>([]);
  const [durationData, setDurationData] = useState<any[]>([]);
  const today = new Date().toISOString().split("T")[0];
  const [existingNewCustomer, setExistingNewCustomer] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | undefined>();
  const [addCustomerPage, setAddCustomerPage] = useState(false);
  const [customerTypeDetails, setCustomerTypeDetails] = useState<any[]>([]);
  const [areasDetails, setAreasDetails] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateRandomNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const milliseconds = now.getMilliseconds().toString().padStart(3, "0");

    return `PCS${year}${month}${day}${hours}${minutes}${seconds}`;
  };

  const [formData, setFormData] = useState({
    title: "",
    reference_number: generateRandomNumber(),
    service_id: "",
    service_date: "",
    preferred_time: "",
    service_duration: "",
    priority: "",
    selectedTreatments: {} as { [key: string]: string },
    selectedPests: {} as { [key: string]: string },
    customerId: "",
    customerLocId: "",
  });

  const [addCustomerData, setAddCustomerData] = useState({
    customer_name: "",
    customer_type: "",
    mobile_no: "",
    address: "",
    area: "",
    gps: "",
    email_id: "",
  });

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Task name is required."),
    reference_number: Yup.string().required("Reference number is required."),
    service_id: Yup.string().required("Task type is required."),
    service_date: Yup.string().required("Task date is required."),
    preferred_time: Yup.string().required("Preferred time is required."),
    service_duration: Yup.string().required("Please select the duration."),
    priority: Yup.string().required("Please select the priority."),
  });

  const custoemrvalidation = Yup.object().shape({
    customer_name: Yup.string().required("Customer name is required"),
    mobile_no: Yup.string()
      .min(9, "Mobile number is not valid")
      .max(9, "Mobile number is not valid")
      .required("Mobile Number is Required"),
    address: Yup.string().required("Address is required"),
    customer_type: Yup.string().required("Customer type is required"),
    area: Yup.string().required("Area is required"),
    email_id: Yup.string()
      .nullable()
      .transform((v: any, o: any) => (o === "" ? null : v))
      .email("Enter a valid Email Address"),
  });

  const getTreatmentTypes = async (serviceId: any) => {
    setLoading(true);
    treatmentTypes(serviceId)
      .then((response) => {
        if (response && response.data.success) {
          const treatmentDetails = response.data.data;
          setTreatmentData(treatmentDetails);
        } else {
          console.error("Failed to fetch treatment data. Error:", response);
          toast.error("Server not responding. Please try again later.");
        }
      })
      .catch((error) => {
        console.error("Error fetching treatment data:", error);
        toast.error("Server not responding. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // const [formData, setFormData] = useState<{ customerId: string }>({ customerId: '' });
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>(
    "Select Customer"
  );

  const modal = useRef<HTMLIonModalElement>(null);

  const customerSelectionChanged = (customerId: string) => {
    const customer = customerData.find((cust) => cust.value === customerId);
    setFormData((prevData) => ({
      ...prevData,
      customerId,
    }));
    setSelectedCustomerName(customer ? customer.text : "Select Customer");
    getCustomerLocations(customerId); // Fetch customer locations when a customer is selected
    modal.current?.dismiss();
  };
  const getPestsReported = async (serviceId: any) => {
    setLoading(true);
    pestReported(serviceId)
      .then((response) => {
        if (response && response.data.success) {
          const pestsDetails = response.data.data;
          setPestsData(pestsDetails);
        } else {
          console.error("Failed to fetch pests data. Error:", response);
          toast.error("Server not responding. Please try again later.");
        }
      })
      .catch((error) => {
        console.error("Error fetching pests data:", error);
        toast.error("Server not responding. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getCustomerList = async () => {
    setLoading(true);
    customerList()
      .then((response) => {
        if (response && response.data.success) {
          const customerDetails = response.data.data.map((customer: any) => ({
            text: customer.customer_name,
            value: customer.id,
          }));
          setCustomerData(customerDetails);
        } else {
          console.error("Failed to fetch customer data. Error:", response);
          toast.error("Server not responding. Please try again later.");
        }
      })
      .catch((error) => {
        console.error("Error fetching customer data:", error);
        toast.error("Server not responding. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getCustomerLocations = async (customerId: any) => {
    setLoading(true);
    customerLocations(customerId)
      .then((response) => {
        if (response && response.data.success) {
          const customerLocationDetails = response.data.data;
          setCustomerLocData(customerLocationDetails);
        } else {
          console.error(
            "Failed to fetch customer location data. Error:",
            response
          );
          toast.error("Server not responding. Please try again later.");
        }
      })
      .catch((error) => {
        console.error("Error fetching customer location data:", error);
        toast.error("Server not responding. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getCustomerTypes = async () => {
    customerType()
      .then((response) => {
        if (response && response.data.success) {
          const customerTypeData = response.data.data;
          setCustomerTypeDetails(customerTypeData);
        } else {
          console.error("Failed to fetch customer types", response);
          toast.error("Server not responding. Please try again later.");
        }
      })
      .catch((error) => {
        console.error("Error fetching customer type", error);
        toast.error("Server not responding. Please try again later.");
      });
  };

  const getAreasList = async () => {
    getAreas()
      .then((response) => {
        if (response && response.data.success) {
          const areasData = response.data.data;
          setAreasDetails(areasData);
        } else {
          console.error("Failed to fetch areas", response);
          toast.error("Server not responding. Please try again later.");
        }
      })
      .catch((error) => {
        console.error("Error fetching areas", error);
        toast.error("Server not responding. Please try again later.");
      });
  };

  useEffect(() => {
    // getTreatmentTypes();
    // getPestsReported();
    getCustomerList();
    getAreasList();
    // getCustomerLocations();
    getServiceList();
    durationList();
    getCustomerTypes();
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "service_id") {
      getTreatmentTypes(value);
      getPestsReported(value);

      setFormData((prev) => ({ ...prev, customerLocId: "" }));
    }

    if (name === "customerId") {
      getCustomerLocations(value);
      // Reset the customerLocId when a new customer is selected
      setFormData((prev) => ({ ...prev, customerLocId: "" }));
    }
  };
  const formatPhoneNumber = (e: any) => {
    console.log(e);
    if (e) {
      setAddCustomerData((prev) => ({ ...prev, ["mobile_no"]: e.slice(4) }));
      console.log(addCustomerData);
    }
  };
  const handleTreatmentChange = (event: any) => {
    const { value, checked } = event.target;
    setFormData((prev) => {
      const updatedSelectedTreatments = { ...prev.selectedTreatments };
      if (checked) {
        updatedSelectedTreatments[value] = value;
      } else {
        delete updatedSelectedTreatments[value];
      }
      return {
        ...prev,
        selectedTreatments: updatedSelectedTreatments,
      };
    });
  };

  const handlePestsChange = (event: any) => {
    const { value, checked } = event.target;
    setFormData((prev) => {
      const updatedSelectedPests = { ...prev.selectedPests };
      if (checked) {
        updatedSelectedPests[value] = value;
      } else {
        delete updatedSelectedPests[value];
      }
      return {
        ...prev,
        selectedPests: updatedSelectedPests,
      };
    });
  };

  const handleTreatmenttypePrev = () => {
    setTreatmentType(false);
    setTaskForm(true);
  };

  const handleTreatmenttypeNext = () => {
    setTreatmentType(false);
    setExistingNewCustomer(true);
    // setCustomerDataPage(true);
  };

  const handleCustomerPrev = () => {
    setTreatmentType(true);
    setCustomerDataPage(false);
  };

  const handleCustomerTypePrev = () => {
    setExistingNewCustomer(false);
    setTreatmentType(true);
  };

  const handleCustomerTypeNext = () => {
    setExistingNewCustomer(false);
    if (selectedValue == "existing") {
      setCustomerDataPage(true);
    }
    if (selectedValue == "new") {
      setAddCustomerPage(true);
    }
  };

  const handleAddCustomerCancel = () => {
    setAddCustomerPage(false);
    setExistingNewCustomer(true);
  };

  const onSubmit = (values: any) => {
    setFormData((prev) => ({ ...prev, ...values }));
    setTaskForm(false);
    setTreatmentType(true);
  };

  const handleFinalSubmit = async () => {
    const requestBody = [
      {
        title: formData.title,
        reference_number: formData.reference_number,
        service_id: formData.service_id,
        service_date: formData.service_date,
        preferred_time: formData.preferred_time,
        service_duration: formData.service_duration.split(" ")[0],
        priority: formData.priority,
        treatment_type: Object.keys(formData.selectedTreatments).join(","),
        pests_reported: Object.keys(formData.selectedPests).join(","),
        customer_id: formData.customerId,
        location_id: formData.customerLocId,
      },
    ];

    try {
      const response = await createTask(requestBody);
      console.log("Task created successfully:", response.data);
      if (response && response.data[0].success) {
        toast.success(response.data[0].message);
        setFormData({
          title: "",
          reference_number: "",
          service_id: "",
          service_date: "",
          preferred_time: "",
          service_duration: "",
          priority: "",
          selectedTreatments: {},
          selectedPests: {},
          customerId: "",
          customerLocId: "",
        });
        setTaskForm(true);
        setTreatmentType(false);
        setCustomerDataPage(false);
        history.push("/tasks");
      } else {
        // Handle error messages
        const errorData = response.data[0];
        if (errorData.message && typeof errorData.message === "object") {
          // Loop through all error fields
          Object.entries(errorData.message).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              errors.forEach((error) => toast.error(`${field}: ${error}`));
            } else if (typeof errors === "string") {
              toast.error(`${field}: ${errors}`);
            }
          });
        } else if (typeof errorData.message === "string") {
          toast.error(errorData.message);
        } else {
          toast.error("An unknown error occurred.");
        }
      }
    } catch (error: any) {
      console.error("Error creating task:", error);
      if (error.response && error.response.data && error.response.data[0]) {
        const errorData = error.response.data[0];
        if (errorData.message && typeof errorData.message === "object") {
          // Loop through all error fields
          Object.entries(errorData.message).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              errors.forEach((error) => toast.error(`${field}: ${error}`));
            } else if (typeof errors === "string") {
              toast.error(`${field}: ${errors}`);
            }
          });
        } else if (typeof errorData.message === "string") {
          toast.error(errorData.message);
        } else {
          toast.error("An unknown error occurred.");
        }
      } else {
        toast.error("Network error or server is not responding.");
      }
    }
  };

  const getServiceList = async () => {
    setLoading(true);
    serviceList()
      .then((response) => {
        if (response && response.data.success) {
          const serviceListDetails = response.data.data;
          setServiceData(serviceListDetails);
        } else {
          console.error("Failed to fetch service list data. Error:", response);
        }
      })
      .catch((error) => {
        console.error("Error fetching service list data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const durationList = async () => {
    setLoading(true);
    timeDuration()
      .then((response) => {
        if (response && response.data.success) {
          const durationDetails = response.data.data;
          setDurationData(durationDetails);
        } else {
          console.error("Failed to fetch duration list data. Error:", response);
        }
      })
      .catch((error) => {
        console.error("Error fetching duration list data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleRadioChange = (event: CustomEvent) => {
    setSelectedValue(event.detail.value);
    console.log("Selected value:", event.detail.value);
  };

  useEffect(() => {
    console.log(selectedValue, "selcted value");
  }, [selectedValue]);

  const onAddCustomerSubmit = async (values: any) => {
    setIsSubmitting(true);
    console.log(values, "");
    console.log("tset");
    try {
      const response = await addCustomer(values);
      console.log(response);
      console.log(response.data);

      if (response.data.statusCode == 200 && response.data.status) {
        toast.success("Customer added successfully");
        // Reset form or navigate to another page
        getCustomerList();
        setAddCustomerPage(false);
        setCustomerDataPage(true);
      } else {
        toast.error("Failed to add customer");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error("An error occurred while adding the customer");
    }
  };
  const handlereset = (resetForm: () => void) => {
    setFormData({
      title: "",
      reference_number: formData.reference_number,
      service_id: "",
      service_date: "",
      preferred_time: "",
      service_duration: "",
      priority: "",
      selectedTreatments: {},
      selectedPests: {},
      customerId: "",
      customerLocId: "",
    });
    resetForm();

  };

  

  return (
    <>
      <ToastContainer />
      <IonHeader
        translate="yes"
        className="ion-no-border ion-padding-horizontal"
      >
        <IonToolbar>
          <IonButtons slot="start" className="ion-no-padding">
            <IonBackButton defaultHref={"/dashboard"}></IonBackButton>
          </IonButtons>
          <IonTitle className="ion-float-start">Create Task</IonTitle>
          <div className="ion-float-end headerBts">
            <IonButton shape="round" routerLink={"/dashboard"}>
              <IonImg src="assets/images/home-outline-icon.svg" />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ionContentColor ion-padding-vertical">
        {taskForm && (
          <div className="">
            <h1 className="headingH1 ion-padding-horizontal">Task Details</h1>

            <Formik
              initialValues={formData}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
              // onSubmit={onSubmit}
              enableReinitialize
            >
              {({ touched, errors, setFieldValue, resetForm }) => (
                <Form>
                  <IonList className="formlist">
                    <div className="width100 ionPaddingBottom ion-padding-horizontal">
                      <IonLabel className="ion-label">
                        Task Name<IonText>*</IonText>
                      </IonLabel>
                      <IonItem lines="none">
                        <Field
                          name="title"
                          placeholder="Please Enter Task Name"
                          type="text"
                          className={
                            touched.title && errors.title
                              ? "custom-form-control is-invalid"
                              : "custom-form-control"
                          }
                          value={formData.title}
                          onChange={handleInputChange}
                        />
                      </IonItem>
                      {touched.title && errors.title && (
                        <IonText color="danger">
                          <ErrorMessage name="title" />
                        </IonText>
                      )}

                      <IonLabel className="ion-label">
                        Transaction Id<IonText>*</IonText>
                      </IonLabel>
                      <IonItem lines="none">
                        <Field
                          name="reference_number"
                          placeholder="Please Enter Transaction Id"
                          type="text"
                          className={
                            touched.reference_number && errors.reference_number
                              ? "custom-form-control is-invalid"
                              : "custom-form-control"
                          }
                          value={formData.reference_number}
                          onChange={handleInputChange}
                        />
                      </IonItem>
                      {touched.reference_number && errors.reference_number && (
                        <IonText color="danger">
                          <ErrorMessage name="reference_number" />
                        </IonText>
                      )}

                      <IonLabel className="ion-label">
                        Task Type<IonText>*</IonText>
                      </IonLabel>
                      <IonItem lines="none">
                        <IonSelect
                          className="custom-form-control"
                          placeholder="Select Task Type"
                          value={formData.service_id}
                          onIonChange={(e) => {
                            const selectedValue = e.detail.value;
                            setFieldValue("service_id", selectedValue);
                            handleInputChange({
                              target: {
                                name: "service_id",
                                value: selectedValue,
                              },
                            });
                          }}
                        >
                          {serviceData.map((data: any) => (
                            <IonSelectOption key={data.id} value={data.id}>
                              {data.service_name}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>
                      {touched.service_id && errors.service_id && (
                        <IonText color="danger">
                          <ErrorMessage name="service_id" />
                        </IonText>
                      )}

                      <IonLabel className="ion-label">
                        Task Date<IonText>*</IonText>
                      </IonLabel>

                      <IonItem lines="none" className="calendar">
                        <span className="calendar-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="24px"
                            height="24px"
                          >
                            <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.9 4 3 4.9 3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                          </svg>
                        </span>
                        <Field
                          name="service_date"
                          placeholder="Please select the date"
                          type="date"
                          className={
                            touched.service_date && errors.service_date
                              ? "custom-form-control is-invalid"
                              : "custom-form-control"
                          }
                          value={formData.service_date}
                          onChange={handleInputChange}
                          min={today}
                        />
                      </IonItem>

                      {touched.service_date && errors.service_date && (
                        <IonText color="danger">
                          <ErrorMessage name="service_date" />
                        </IonText>
                      )}

                      {/* <IonLabel className="ion-label">Task Date<IonText>*</IonText></IonLabel>
                      <IonItem lines="none">
                        <Field name="service_date" placeholder='Please select the date' type='date'  className={
                          touched.service_date && errors.service_date ? "custom-form-control is-invalid" : "custom-form-control"
                        } value={formData.service_date} onChange={handleInputChange} min={today} />
                      </IonItem>
                      {touched.service_date && errors.service_date && (
                        <IonText color="danger">
                          <ErrorMessage name="service_date" />
                        </IonText>)} */}

                      <IonLabel className="ion-label">
                        Preferred Time<IonText>*</IonText>
                      </IonLabel>

                      <IonItem lines="none" className="timer">
                        <span className="timer-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="24px"
                            height="24px"
                          >
                            <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 20c-4.971 0-9-4.029-9-9s4.029-9 9-9 9 4.029 9 9-4.029 9-9 9zm1-15h-2v6.414l4.293 4.293 1.414-1.414L13 11.586V6z" />
                          </svg>
                        </span>

                        <Field
                          name="preferred_time"
                          placeholder="Please select the time"
                          type="time"
                          className={
                            touched.preferred_time && errors.preferred_time
                              ? "custom-form-control is-invalid"
                              : "custom-form-control"
                          }
                          value={formData.preferred_time}
                          onChange={handleInputChange}
                        />
                      </IonItem>

                      {touched.preferred_time && errors.preferred_time && (
                        <IonText color="danger">
                          <ErrorMessage name="preferred_time" />
                        </IonText>
                      )}
                      {/* <IonLabel className="ion-label">Preferred Time<IonText>*</IonText></IonLabel>
                      <IonItem lines="none">
                        <Field name="preferred_time" placeholder='Please select the time' type='time' className={
                          touched.preferred_time && errors.preferred_time ? "custom-form-control is-invalid" : "custom-form-control"
                        } value={formData.preferred_time} onChange={handleInputChange} />
                      </IonItem>
                      {touched.preferred_time && errors.preferred_time && (
                        <IonText color="danger">
                          <ErrorMessage name="preferred_time" />
                        </IonText>)} */}

                      <IonLabel className="ion-label">
                        Service Duration<IonText>*</IonText>
                      </IonLabel>
                      <IonItem lines="none">
                        <IonSelect
                          className="custom-form-control"
                          placeholder="Select Service Duration"
                          value={formData.service_duration}
                          onIonChange={(e) => {
                            const selectedValue = e.detail.value;
                            setFieldValue("service_duration", selectedValue);
                            handleInputChange({
                              target: {
                                name: "service_duration",
                                value: selectedValue,
                              },
                            });
                          }}
                        >
                          {durationData.map((data: any) => (
                            <IonSelectOption key={data.id} value={data.id}>
                              {data.duration} hrs
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                        {/* <Field 
                          name="service_duration" 
                          placeholder='Please select the duration' 
                          type='time' 
                          className={touched.service_duration && errors.service_duration ? "custom-form-control is-invalid" : "custom-form-control"}
                          value={formData.service_duration} 
                          onChange={handleInputChange}
                          step = '60' /> */}
                        {/* <TimePicker label="Meeting time" value="12:30" step={60 * 30} /> */}
                        {/* <CustomTimeInput              name="service_duration"
              touched={touched.service_duration}
              error={errors.service_duration}
              handleChange={handleInputChange}
              value={formData.service_duration} /> */}
                        {/* <IonDatetime
                      displayFormat="HH:mm"
                      pickerFormat="HH:mm"
                      placeholder="Select time"
                      value={formData.service_duration}
                      onIonChange={handleInputChange}
                      presentation="time"
                    /> */}
                      </IonItem>
                      {touched.service_duration && errors.service_duration && (
                        <IonText color="danger">
                          <ErrorMessage name="service_duration" />
                        </IonText>
                      )}

                      <IonLabel className="ion-label">
                        Priority<IonText>*</IonText>
                      </IonLabel>
                      <IonItem lines="none">
                        <IonSelect
                          className="custom-form-control"
                          placeholder="Select Priority"
                          value={formData.priority}
                          onIonChange={(e) => {
                            const selectedValue = e.detail.value;
                            setFieldValue("priority", selectedValue);
                            handleInputChange({
                              target: {
                                name: "priority",
                                value: selectedValue,
                              },
                            });
                          }}
                        >
                          <IonSelectOption value="High">High</IonSelectOption>
                          <IonSelectOption value="Medium">
                            Medium
                          </IonSelectOption>
                          <IonSelectOption value="Low">Low</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                      {touched.priority && errors.priority && (
                        <IonText color="danger">
                          <ErrorMessage name="priority" />
                        </IonText>
                      )}
                    </div>
                  </IonList>

                  <IonFooter className="ion-footer ion-footerPosition">
                    <IonToolbar className="ionFooterTwoButtons">
                      <IonButton
                        className="ion-button"
                        fill="outline"
                        color="medium"
                        onClick={() => handlereset(resetForm)}
                      >
                        RESET
                      </IonButton>
                      <IonButton
                        className="ion-button"
                        color="primary"
                        type="submit"
                        id="pestDetails"
                      >
                        NEXT
                      </IonButton>
                    </IonToolbar>
                  </IonFooter>
                </Form>
              )}
            </Formik>
          </div>
        )}

        {treatmentType && !taskForm && (
          <div className="createTask-pestDetails">
            <h1 className="headingH1 ion-padding-horizontal">Pest Details</h1>
            <IonText className="subHeadingH2">
              <h2 className="ion-padding-horizontal">Treatment Type</h2>
            </IonText>
            <div className=" ion-padding-horizontal createTask-pestDetails ionPaddingBottom">
              {treatmentData &&
                treatmentData.length > 0 &&
                treatmentData.map((data: any, index: any) => (
                  <IonList className="formlist" key={index}>
                    <IonItem>
                      <IonCheckbox
                        color="secondary"
                        className="width100"
                        justify="space-between"
                        labelPlacement="start"
                        value={data.id}
                        checked={!!formData.selectedTreatments[data.id]}
                        onIonChange={handleTreatmentChange}
                      >
                        {data.treatment_name}
                      </IonCheckbox>
                    </IonItem>
                  </IonList>
                ))}

              <IonText className="subHeadingH2 ">
                <h2 className="ion-padding-top">Pests Reported</h2>
              </IonText>
              {pestsData &&
                pestsData.length > 0 &&
                pestsData.map((data: any, index: any) => (
                  <IonList className="formlist" key={index}>
                    <IonItem>
                      <IonCheckbox
                        color="secondary"
                        className="width100"
                        justify="space-between"
                        labelPlacement="start"
                        value={data.id}
                        checked={!!formData.selectedPests[data.id]}
                        onIonChange={handlePestsChange}
                      >
                        {data.pest_report_type}
                      </IonCheckbox>
                    </IonItem>
                  </IonList>
                ))}
            </div>
            <IonFooter className="ion-footer ion-footerPosition">
              <IonToolbar className="ionFooterTwoButtons">
                <IonButton
                  className="ion-button"
                  fill="outline"
                  color="medium"
                  onClick={handleTreatmenttypePrev}
                >
                  PREVIOUS
                </IonButton>
                <IonButton
                  className="ion-button"
                  color="primary"
                  onClick={handleTreatmenttypeNext}
                  disabled={
                    Object.keys(formData.selectedTreatments).length === 0 ||
                    Object.keys(formData.selectedPests).length === 0
                  }
                >
                  NEXT
                </IonButton>
              </IonToolbar>
            </IonFooter>
          </div>
        )}

        {existingNewCustomer && !treatmentType && (
          <div>
            <h1 className="headingH1 ion-padding-horizontal">Customer Type</h1>
            <div className="ion-padding-horizontal ionPaddingBottom">
              <IonList className="formlist">
                <IonItem>
                  <div className="width100">
                    <IonLabel className="ion-label">Select</IonLabel>
                    <IonRadioGroup
                      value={selectedValue}
                      onIonChange={handleRadioChange}
                    >
                      <IonRadio value="existing">Existing Customer</IonRadio>
                      <IonRadio value="new">New Customer</IonRadio>
                    </IonRadioGroup>
                  </div>
                </IonItem>
              </IonList>
            </div>

            <IonFooter className="ion-footer ion-footerPosition">
              <IonToolbar className="ionFooterTwoButtons">
                <IonButton
                  className="ion-button"
                  fill="outline"
                  color="medium"
                  onClick={handleCustomerTypePrev}
                >
                  PREVIOUS
                </IonButton>
                <IonButton
                  className="ion-button"
                  color="primary"
                  onClick={() => handleCustomerTypeNext()}
                  disabled={!selectedValue}
                >
                  NEXT
                </IonButton>
              </IonToolbar>
            </IonFooter>
          </div>
        )}

        {addCustomerPage && !existingNewCustomer && (
          <div className="">
            <h1 className="headingH1 ion-padding-horizontal">
              Add New Customer
            </h1>

            <Formik
              initialValues={addCustomerData}
              validationSchema={custoemrvalidation}
              onSubmit={onAddCustomerSubmit}
              enableReinitialize
            >
              {({ touched, errors, setFieldValue, handleChange, values }) => (
                <Form>
                  <IonList className="formlist">
                    <div className="width100 ionPaddingBottom ion-padding-horizontal">
                      <IonLabel className="ion-label">
                        Customer Name<IonText>*</IonText>
                      </IonLabel>
                      <IonItem lines="none">
                        <Field
                          name="customer_name"
                          placeholder="Please Enter Customer"
                          type="text"
                          className={
                            touched.customer_name && errors.customer_name
                              ? "custom-form-control is-invalid"
                              : "custom-form-control"
                          }
                          value={values.customer_name}
                          onChange={handleChange}
                        />
                      </IonItem>
                      {touched.customer_name && errors.customer_name && (
                        <IonText color="danger">
                          <ErrorMessage name="customer_name" />
                        </IonText>
                      )}

                      <IonLabel className="ion-label">
                        Customer Type<IonText>*</IonText>
                      </IonLabel>
                      <IonItem lines="none">
                        <IonSelect
                          className="custom-form-control"
                          placeholder="Select Customer Type"
                          value={values.customer_type}
                          onIonChange={(e) => {
                            const selectedValue = e.detail.value;
                            setFieldValue("customer_type", selectedValue);
                            // setAddCustomerData(prev => ({ ...prev, customer_type: selectedValue }));
                          }}
                        >
                          {customerTypeDetails.map((data: any) => (
                            <IonSelectOption key={data.id} value={data.id}>
                              {data.client_type}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>
                      {touched.customer_type && errors.customer_type && (
                        <IonText color="danger">
                          <ErrorMessage name="customer_type" />
                        </IonText>
                      )}

                      <IonLabel className="ion-label">
                        Mobile Number<IonText>*</IonText>
                      </IonLabel>
                      <IonItem lines="none">
                        {/* <PhoneInput defaultCountry="AE"  limitMaxLength value={phoneValue}  maxLength="11" onChange={formatPhoneNumber} /> */}
                        <Field
                          name="mobile_no"
                          placeholder="Please enter mobile number"
                          maxLength="9"
                          type="number"
                          className={
                            touched.mobile_no && errors.mobile_no
                              ? "custom-form-control fomikPhone is-invalid"
                              : "custom-form-control fomikPhone"
                          }
                          value={values.mobile_no}
                          onChange={handleChange}
                        />
                      </IonItem>
                      {touched.mobile_no && errors.mobile_no && (
                        <IonText color="danger">
                          <ErrorMessage name="mobile_no" />
                        </IonText>
                      )}
                      <IonLabel className="ion-label">Email id</IonLabel>
                      <IonItem lines="none">
                        <Field
                          name="email_id"
                          placeholder="Please enter email"
                          type="text"
                          className="custom-form-control"
                          value={values.email_id}
                          onChange={handleChange}
                        />
                      </IonItem>
                      {touched.email_id && errors.email_id && (
                        <IonText color="danger">
                          <ErrorMessage name="email_id" />
                        </IonText>
                      )}
                      <IonLabel className="ion-label">
                        Area<IonText>*</IonText>
                      </IonLabel>
                      <IonItem lines="none">
                        <IonSelect
                          className="custom-form-control"
                          placeholder="Select Area"
                          value={values.area}
                          onIonChange={(e) => {
                            const selectedAreaValue = e.detail.value;
                            setFieldValue("area", selectedAreaValue);
                            // setAddCustomerData(prev => ({ ...prev, area: selectedAreaValue }));
                          }}
                        >
                          {areasDetails.map((data: any) => (
                            <IonSelectOption key={data.id} value={data.id}>
                              {data.area_name_en}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>
                      {touched.area && errors.area && (
                        <IonText color="danger">
                          <ErrorMessage name="area" />
                        </IonText>
                      )}

                      <IonLabel className="ion-label">
                        Address<IonText>*</IonText>
                      </IonLabel>
                      <IonItem lines="none">
                        {/* <IonSelect className="custom-form-control"
                          placeholder=" "
                          value={addCustomerData.address}
                          onIonChange={(e) => {
                            const selectedValue = e.detail.value;
                            setFieldValue('address', selectedValue);
                          }}
                        >
                          {serviceData.map((data: any) => (
                            <IonSelectOption key={data.id} value={data.id}>{data.service_name}</IonSelectOption>
                          ))}
                        </IonSelect>  */}
                        <AddressSearch
                          name="address"
                          setFieldValue={setFieldValue}
                        />
                      </IonItem>
                      {touched.address && errors.address && (
                        <IonText color="danger">
                          <ErrorMessage name="address" />
                        </IonText>
                      )}
                    </div>
                  </IonList>

                  <IonFooter className="ion-footer ion-footerPosition">
                    <IonToolbar className="ionFooterTwoButtons">
                      <IonButton
                        className="ion-button"
                        fill="outline"
                        color="medium"
                        onClick={handleAddCustomerCancel}
                      >
                        CANCEL
                      </IonButton>
                      <IonButton
                        className="ion-button"
                        color="primary"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit"}
                      </IonButton>
                    </IonToolbar>
                  </IonFooter>
                </Form>
              )}
            </Formik>
          </div>
        )}

        {customerDataPage && !treatmentType && (
          <div>
            <h1 className="headingH1 ion-padding-horizontal">
              Customer Details
            </h1>
            <div className="ion-padding-horizontal ionPaddingBottom">
              <IonList className="formlist">
                {/* <IonItem>
                  <div className="width100">
                    <IonLabel className="ion-label">
                      Customer Name<IonText>*</IonText>
                    </IonLabel>
                    <IonButton
                      expand="block"
                      onClick={() => modal.current?.present()}
                    >
                      {selectedCustomerName}
                    </IonButton>
                  </div>
                </IonItem>
                <IonModal ref={modal}>
                  <CustomerTypeahead
                    title="Select Customer Name"
                    items={customerData}
                    selectedItem={formData.customerId}
                    onSelectionCancel={() => modal.current?.dismiss()}
                    onSelectionChange={customerSelectionChanged}
                  />
                </IonModal> */}
                <IonItem lines="none">
                  <div className="width100">
                    <IonLabel className="ion-label">Select Customer<IonText>*</IonText>
                    </IonLabel>
                    <IonInput
                      value={selectedCustomerName} // Display the selected customer name
                      readonly // Make the textarea read-only
                      onClick={() => modal.current?.present()} // Open modal on click
                      style={{
                        height: "55px", // Adjust height as needed


                        font: "13.76px Poppins,sans-serif",

                      }}
                    ></IonInput>
                  </div>
                </IonItem>
                <IonModal ref={modal}>
                  <CustomerTypeahead
                    title="Select Customer"
                    items={customerData}
                    selectedItem={formData.customerId}
                    onSelectionCancel={() => modal.current?.dismiss()}
                    onSelectionChange={customerSelectionChanged}

                  />
                </IonModal>

                <IonItem lines="none">
                  <div className="width100">
                    <IonLabel className="ion-label">Customer Location<IonText>*</IonText>
                    </IonLabel>
                    <IonSelect
                      className="custom-form-control"
                      placeholder="Select Customer Location"
                      value={formData.customerLocId}
                      onIonChange={(e) =>
                        handleInputChange({
                          target: {
                            name: "customerLocId",
                            value: e.detail.value,
                          },
                        })
                      }
                    >
                      {customerLocData.map((data: any) => (
                        <IonSelectOption key={data.id} value={data.id}>
                          {data.address}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </div>
                </IonItem>
              </IonList>
            </div>

            <IonFooter className="ion-footer ion-footerPosition">
              <IonToolbar className="ionFooterTwoButtons">
                <IonButton
                  className="ion-button"
                  fill="outline"
                  color="medium"
                  onClick={handleCustomerPrev}
                >
                  PREVIOUS
                </IonButton>
                <IonButton
                  className="ion-button"
                  color="primary"
                  onClick={() => handleFinalSubmit()}
                  disabled={!formData.customerId || !formData.customerLocId}
                >
                  SUBMIT
                </IonButton>
              </IonToolbar>
            </IonFooter>
          </div>
        )}
      </IonContent>
    </>
  );
};

export default CreateTask;