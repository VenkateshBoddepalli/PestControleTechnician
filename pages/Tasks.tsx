import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import {
  IonAlert,
  IonButton,
  IonContent,
  IonImg,
  IonItem,
  IonList,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  IonModal,
  IonHeader,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonLabel,
  IonProgressBar,
  IonSegment,
  IonSegmentButton,
  IonBadge,
  IonText,
} from "@ionic/react";
import CommonHeader from "../components/CommonHeader";
import TaskComponent from "../components/TaskComponent";
import {
  fetchTaskData,
  fetchTaskDetails,
  formatDate,
} from "../data/apidata/taskApi/taskDataApi";
import { formatTime, getDate, getJustDate } from "../utils/dateTimeUtils";
import { toast, ToastContainer } from "react-toastify";
import useLongitudeLocation from "../components/useLongitudeLocation";
import "react-toastify/dist/ReactToastify.css";
import { userCheckIn } from "../data/apidata/authApi/dataApi";
import {
  retrieveNetworkFilteredTasks,
  retrieveNetworkTasks,
} from "../data/offline/entity/DataRetriever";
import { retrieveNetworkTasksDetails } from "../data/offline/entity/DataRetriever";
import GoTop from "../components/GoTop";
const Tasks: React.FC = () => {
  const [taskData, setTaskData] = useState<any[]>([]);
  const [selectedSegment, setSelectedSegment] =
    useState<string>("pendingSegment");
  const [filteredTaskData, setFilteredTaskData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();
  const location = useLongitudeLocation();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [filterError, setFilterError] = useState<boolean>(false);
  const [filterApplied, setFilterApplied] = useState(false);
  const searchInputRef = useRef<HTMLIonSearchbarElement>(null);
  const [filterCriteria, setFilterCriteria] = useState({
    service_date: "",
    priority: "",
    "tbl_visits.service_status": ["14", "17", "33"],
  });
  console.log("default date string = ", getJustDate());
  const [filterselectedCriterias, setselectedFilterCriteria] = useState({
    // service_date: getJustDate(),
    // priority: "High",
    // "tbl_visits.service_status": ["14", "17", "33"]
    service_date: "",
    priority: "",
    "tbl_visits.service_status": ["14", "17", "33"],
  });
  const [pausedCount, setPausedCount] = useState(0);
  const [pendingOngoingCount, setPendingOngoingCount] = useState(0);
  // const [selectedSegment, setSelectedSegment] = useState('pendingSegment');
  const [selectedPriority, setSelectedPriority] = useState("Medium");

  useEffect(() => {
    getOnGoingNPendingTasks();
  }, [location]);

  useEffect(() => {
    applySearch();
  }, [searchQuery]);
  // }, [searchQuery, filterCriteria, taskData]);

  const getOnGoingNPendingTasks = async () => {
    if (location?.latitude && location?.longitude) {
      let consolidatedData: Array<any> = [];
      setLoading(true);
      console.log("Fetching Task List from Tasks");
  
      // Fetch tasks with statuses 14 (pending), 17 (on-going), 33 (new status)
      let rawTaskList = await retrieveNetworkTasks(
        ["14", "17", "33"],
        location.latitude,
        location.longitude
      );
  
      // Check if rawTaskList is defined and is an array
      if (rawTaskList && Array.isArray(rawTaskList)) {
        // Sort the data: Pending tasks should come first, and within each status, sort by created date descending
        let sortedData = rawTaskList.sort((a: any, b: any) => {
          // Sort by service_status first (pending first, ongoing and others later)
          if (a.service_status === "Pending" && b.service_status !== "Pending") {
            return -1;
          }
          if (a.service_status !== "Pending" && b.service_status === "Pending") {
            return 1;
          }
  
          // If statuses are the same, sort by created date descending
          return (
            new Date(b.created_on).getTime() - new Date(a.created_on).getTime()
          );
        });
  
        sortedData = sortedData.sort((a: any, b: any) => {
          // Sort by service_status first (on-going first)
          if (a.service_status === "On Going" && b.service_status !== "On Going") {
            return -1;
          }
          if (a.service_status !== "On Going" && b.service_status === "On Going") {
            return 1;
          }
  
          // If statuses are the same, sort by created date descending
          return (
            new Date(b.created_on).getTime() - new Date(a.created_on).getTime()
          );
        });
  
        consolidatedData = sortedData;
      } else {
        console.warn("No tasks returned from retrieveNetworkTasks");
      }
  
      setLoading(false);
      setTaskData(consolidatedData);
      console.log(taskData);
    }
  };
  
  /////////getting countof paused and pending task function///////////
  const getTaskCounts = () => {
    let pausedCount = 0;
    let pendingOngoingCount = 0;

    taskData.forEach((task) => {
      console.log("Service Status:", task.service_status);

      if (task.service_status.toLowerCase() === "paused") {
        pausedCount++;
      } else if (
        task.service_status === "Pending" ||
        task.service_status === "On Going"
      ) {
        pendingOngoingCount++;
      }
    });
    setPausedCount(pausedCount);
    setPendingOngoingCount(pendingOngoingCount);

    console.log("Paused Task Count:============>", pausedCount);
    console.log(
      "Pending and Ongoing Task Count:=============>",
      pendingOngoingCount
    );
  };
  useEffect(() => {
    getTaskCounts();
  }, [taskData]);

  useEffect(() => {
    filterTasks(selectedSegment);
  }, [selectedSegment, taskData]);

  const filterTasks = (segment: any) => {
    console.log("Filtering tasks for segment:", segment);
    if (segment === "pausedSegment") {
      const pausedTasks = taskData.filter(
        (task) => task.service_status.toLowerCase() === "paused"
      );
      console.log("Paused Tasks:", pausedTasks);
      setFilteredTaskData(pausedTasks);
    } else if (segment === "pendingSegment") {
      const pendingTasks = taskData.filter(
        (task) =>
          task.service_status === "Pending" ||
          task.service_status === "On Going"
      );
      console.log("Pending and Ongoing Tasks:", pendingTasks);
      setFilteredTaskData(pendingTasks);
    }
    setLoading(false);
  };

  const applyFilter = async () => {
    let filteredData = taskData.slice();
   
    console.log("Filter Criteria:", filterCriteria);
    if (filterCriteria && location.latitude && location.longitude) {
     
      let statusFilterArr = ["14", "17", "33"];
      if (selectedSegment === "pausedSegment") {
        statusFilterArr = ["33"];
      } else if (selectedSegment === "pendingSegment") {
        statusFilterArr = ["14", "17"];
      }

      const mapToObject = (map: Map<string, any>) =>
        Object.fromEntries(map.entries());
      const filterMap = new Map<string, any>();
      if (filterCriteria.priority != "")
        filterMap.set("tbl_visits.priority", filterCriteria.priority);
      if (filterCriteria.service_date != "")
        filterMap.set("tbl_visits.service_date", filterCriteria.service_date);

      filterMap.set("tbl_visits.service_status", statusFilterArr);
      let convFilterCriteria = mapToObject(filterMap);
      console.log("conv filter = ", convFilterCriteria);
     

      filteredData = await retrieveNetworkFilteredTasks(
        convFilterCriteria,
        location.latitude,
        location.longitude
      );
      // set the response
      // handle the reset
      console.log("Filtered Data = ", filteredData);
    }
    

    setFilteredTaskData(filteredData);
    setFilterApplied(true);
  };

  const applySearch = async () => {
    let filteredData = taskData.slice();
    console.log("Search Query:", searchQuery);
    // build the filter
    console.log("Filter Criteria:", filterCriteria);
    if (searchQuery) {
      filteredData = filteredData.filter(
        (task) =>
          (task.service_name &&
            task.service_name
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (task.address &&
            task.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (task.reference_number &&
            task.reference_number
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredTaskData(filteredData);
  };

  const handleTaskClick = async (
    taskId: string,
    index: number,
    status: string
  ) => {
    if (status === "complete") {
      toast.success("Service Request is already complete.", {
        autoClose: 3000,
      });
      history.push("/tasks");
      return;
    }

    const ongoingTask = taskData.find(
      (task: any) =>
        task.service_status.toLowerCase() === "on going" && task.id !== taskId
    );

    if (ongoingTask) {
      toast.info(
        "Please complete or pause the ongoing task before starting or resuming another one.",
        { autoClose: 3000 }
      );
      history.push("/tasks");
      return;
    }

    try {
      const taskDetails = await retrieveNetworkTasksDetails(taskId);
      localStorage.setItem("activeTaskData", JSON.stringify(taskDetails));
      history.push(`/tasks/${taskId}`);
    } catch (error) {
      console.error("Error fetching task details:", error);
      toast.error("Server not responding. Please try again later.");
    }
  };

  const handleInput = (ev: CustomEvent) => {
    const query = (ev.target as HTMLIonSearchbarElement).value!.toLowerCase();
    setSearchQuery(query);
  };

  const handleFilterChange = (e: CustomEvent) => {
    // setSelectedPriority(e.detail.value)
    const target = e.target as HTMLIonInputElement | HTMLIonSelectElement;
    const { name, value } = target;
    console.log("Filter change - Name:", name, "Value:", value);
    setFilterCriteria((prev) => ({
      ...prev,
      [name]: value,
    }));
    setselectedFilterCriteria((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (value !== "") {
      setFilterError(false);
    }
  };

  ////////////////////////////////filter function///////////////////////////////

  const handleFilterSubmit = () => {
    if (filterCriteria.priority !== "" || filterCriteria.service_date !== "") {
      setIsOpen(false);
      applyFilter();
      setFilterError(false);
    } else {
      if (
        filterCriteria.priority === "" ||
        filterCriteria.service_date === ""
      ) {
        setFilterError(true);
      }
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setFilterError(false);
    setFilterApplied(false);
   

    setselectedFilterCriteria({
     
      service_date: "",
      priority: "",
      "tbl_visits.service_status": ["14", "17", "33"],
    });
    setFilterCriteria({
    
      service_date: "",
      priority: "",
      "tbl_visits.service_status": ["14", "17", "33"],
    });

    filterTasks(selectedSegment);
    // setSelectedPriority('');
  };

  // Create a ref for the search input

  const handleSearchClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.setFocus(); // Use setFocus() for IonSearchbar
    }
  };

  return (
    <IonPage>
      <CommonHeader
        backToPath={"/dashboard"}
        pageTitle={"Tasks"}
        showIcons={true}
      />
      <IonContent
        fullscreen
        className="dashboardWrapp ionContentColor ion-padding-horizontal"
      >
        {loading && <IonProgressBar type="indeterminate" />}
        <IonSegment
          className="stockIonSegmentButton"
          value={selectedSegment}
          onIonChange={(e) => setSelectedSegment(e.detail.value as string)}
        >
          <IonSegmentButton value="pendingSegment">
            <IonLabel>
              Pending{" "}
              <IonBadge slot="start">
                {" "}
                {selectedSegment === "pendingSegment"
                  ? filteredTaskData.length
                  : pendingOngoingCount}
              </IonBadge>
            </IonLabel>
          </IonSegmentButton>

          <IonSegmentButton value="pausedSegment">
            <IonLabel>
              Paused{" "}
              <IonBadge slot="start">
                {selectedSegment === "pausedSegment"
                  ? filteredTaskData.length
                  : pausedCount}
              </IonBadge>
            </IonLabel>
          </IonSegmentButton>
        </IonSegment>
        <div>
          {selectedSegment === "pendingSegment" && (
            <div>
              <IonItem
                lines="none"
                className="ion-item-inner ion-no-padding ion-margin-vertical"
              >
                <IonSearchbar
                  ref={searchInputRef}
                  debounce={500}
                  onIonInput={handleInput}
                ></IonSearchbar>

                <div className="ion-float_end">
                  <IonButton
                    shape="round"
                    onClick={() => setIsOpen(true)}
                    className="roundedWhiteBtIcon ion-no-margin"
                  >
                    <IonImg src="assets/images/filter-icon.svg"></IonImg>
                  </IonButton>
                </div>
              </IonItem>

              <IonList lines="none" className="ion-list-item">
                {!loading &&
                  filteredTaskData.length === 0 &&
                  (filterApplied ? (
                    <p style={{ textAlign: "center", width: "100%" }}>
                      No tasks found with the applied filter.
                    </p>
                  ) : (
                    pendingOngoingCount === 0 && (
                      <p style={{ textAlign: "center", width: "100%" }}>
                        There is no current task, use{" "}
                        <b onClick={() => setIsOpen(true)}>filter</b> (or){" "}
                        <b onClick={handleSearchClick}>Search</b> to get
                        previous Tasks
                      </p>
                    )
                  ))}

                {filteredTaskData.length > 0 &&
                  filteredTaskData.map((task: any, index: any) => (
                    <IonItem
                      key={task.id}
                      onClick={() =>
                        handleTaskClick(task.id, index, task.service_status)
                      }
                      lines="full"
                    >
                      <div className="task-container">
                        <TaskComponent
                          id={task.id}
                          path={`/tasks/${task.id}`}
                          title={task.service_name}
                          subTitle={task.address}
                          serviceDate={task.service_date}
                          date={`${formatDate(task.created_on)}  ${formatTime(
                            task.created_on
                          )}`}
                          time={task.preffered_time}
                          reference_Number={task.reference_number}
                          priority={task.priority}
                          distance={task.distance}
                          status={task.service_status}
                          imgSrc="/assets/images/location-icon.svg"
                        />
                      </div>
                    </IonItem>
                  ))}
              </IonList>
            </div>
          )}
          {selectedSegment === "pausedSegment" && (
            <div>
              <IonItem
                lines="none"
                className="ion-item-inner ion-no-padding ion-margin-vertical"
              >
                <IonSearchbar
                  ref={searchInputRef}
                  debounce={500}
                  onIonInput={handleInput}
                ></IonSearchbar>

                <div className="ion-float_end">
                  <IonButton
                    shape="round"
                    onClick={() => setIsOpen(true)}
                    className="roundedWhiteBtIcon ion-no-margin"
                  >
                    <IonImg src="assets/images/filter-icon.svg"></IonImg>
                  </IonButton>
                </div>
              </IonItem>

              <IonList lines="none" className="ion-list-item">
                {!loading && filteredTaskData.length === 0 && (
                  <p style={{ textAlign: "center", width: "100%" }}>
                    No tasks assigned/found.
                  </p>
                )}
                {filteredTaskData.length > 0 &&
                  filteredTaskData.map((task: any, index: any) => (
                    <IonItem
                      key={task.id}
                      onClick={() =>
                        handleTaskClick(task.id, index, task.service_status)
                      }
                      lines="full"
                    >
                      <div className="task-container">
                        <TaskComponent
                          id={task.id}
                          path={`/tasks/${task.id}`}
                          title={task.service_name}
                          subTitle={task.address}
                          serviceDate={task.service_date}
                          date={`${formatDate(task.created_on)}  ${formatTime(
                            task.created_on
                          )}`}
                          time={task.preffered_time}
                          reference_Number={task.reference_number}
                          priority={task.priority}
                          distance={task.distance}
                          status={task.service_status}
                          imgSrc="/assets/images/location-icon.svg"
                        />
                      </div>
                    </IonItem>
                  ))}
              </IonList>
            </div>
          )}
        </div>
      </IonContent>
      <IonModal className="ion-bottom-modal filterModal" isOpen={isOpen}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Filter</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <form>
            <div className="modalInputSandsale">
              <IonList className="formlist">
                <IonItem lines="none">
                  <div className="width100">
                    <IonLabel className="ion-label">Service Date</IonLabel>
                    <IonInput
                      name="service_date"
                      type="date"
                      value={filterselectedCriterias.service_date}
                      onIonChange={handleFilterChange}
                      aria-label="date"
                      fill="outline"
                      placeholder=""
                    />
                  </div>
                </IonItem>

                <IonItem lines="none">
                  <div className="width100">
                    <IonLabel className="ion-label">Priority</IonLabel>
                    <IonSelect
                      value={filterselectedCriterias.priority}
                      name="priority"
                      onIonChange={handleFilterChange}
                      labelPlacement="floating"
                      placeholder="Select"
                      fill="outline"
                      aria-label=""
                    >
                      <IonSelectOption value="High">High</IonSelectOption>
                      <IonSelectOption value="Medium">Medium</IonSelectOption>
                      <IonSelectOption value="Low">Low</IonSelectOption>
                    </IonSelect>
                  </div>
                </IonItem>
                {filterError ? (
                  <IonText style={{ color: "red" }}>
                    Please select Date (or) Priority
                  </IonText>
                ) : (
                  ""
                )}
              </IonList>

              <IonButton
                color="primary"
                className="ion-button ion-margin-top"
                fill="solid"
                size="default"
                expand="block"
                onClick={handleFilterSubmit}
              >
                Search
              </IonButton>

              <IonButton
                className="ion-button ion-margin-vertical"
                color="medium"
                size="default"
                // onClick={() => setIsOpen(false)}
                onClick={handleCancel}
                fill="solid"
                expand="block"
              >
                Clear
              </IonButton>
            </div>
          </form>
        </IonContent>
      </IonModal>
      <ToastContainer autoClose={3000} />
      <GoTop />
    </IonPage>
  );
};

export default Tasks;
