import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  IonContent,
  IonItem,
  IonList,
  IonPage,
  IonSearchbar,
  IonProgressBar,
  IonText,
  IonButton,
  IonIcon,
} from "@ionic/react";
import CommonHeader from "../components/CommonHeader";
import TaskComponent from "../components/TaskComponent";
import {
  completedTaskData,
  fetchTaskDetails,
  formatDate,
} from "../data/apidata/taskApi/taskDataApi";
import { toast } from "react-toastify";
import { getCurrentLocation } from "../data/providers/GeoLocationProvider";
import "react-toastify/dist/ReactToastify.css";
import { formatTime } from "../utils/dateTimeUtils";
import { arrowUp } from "ionicons/icons";
import GoTop from "../components/GoTop";

const Forms: React.FC = () => {
  const [completedTask, setCompletedTask] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const history = useHistory();

  useEffect(() => {
    getCurrentLocation()
      .then((pos) => {
        if (pos) {
          completedTaskData(pos.coords.latitude, pos.coords.longitude)
            .then((response) => {
              if (response && response.success) {
                const sortedData = response.data.sort(
                  (a: any, b: any) =>
                    new Date(b.created_on).getTime() -
                    new Date(a.created_on).getTime()
                );
                setCompletedTask(sortedData);
                console.log("Completed Task data:", sortedData);
              } else {
                setError("Failed to fetch Form data.");
                console.error("Error:", response.message);
                // toast.error('Server not responding. Please try again later.');
              }
            })
            .catch((error) => {
              setError("Error fetching Form data.");
              console.error("Error fetching Form data:", error);
              // toast.error('Server not responding. Please try again later.');
            })
            .finally(() => {
              setLoading(false);
            });
        }
      })
      .catch((error) => {
        setError("Error fetching location.");
        console.error("Error fetching location:", error);
        toast.error("Server not responding. Please try again later.");
        setLoading(false);
      });
  }, []);

  const handleInput = (event: CustomEvent) => {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    setSearchQuery(query);
  };

  const filteredTasks = completedTask.filter(
    (task) =>
      task.service_name.toLowerCase().includes(searchQuery) ||
      task.address.toLowerCase().includes(searchQuery) ||
      task.reference_number.toLowerCase().includes(searchQuery)
  );

  return (
    <IonPage>
      <CommonHeader backToPath={"/dashboard"} pageTitle={"Forms"} />
      <IonContent
        fullscreen
        className="dashboardWrapp ionContentColor ion-padding-horizontal"
      >
        {loading ? (
          <IonProgressBar type="indeterminate" />
        ) : (
          <>
            <IonItem
              lines="none"
              className="ion-item-inner ion-no-padding ion-margin-vertical"
            >
              <IonSearchbar
                debounce={300}
                onIonInput={handleInput}
              ></IonSearchbar>
            </IonItem>
            <IonList lines="full" className="ion-list-item">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task: any, index: any) => (
                  <IonItem
                    key={task.id}
                    routerLink={`/formdata/${task.id}`}
                    lines="none"
                  >
                    <TaskComponent
                      id={task.id}
                      title={task.service_name}
                      subTitle={task.address}
                      serviceDate={task.service_date}
                      time={task.preffered_time}
                      date={`${formatDate(task.created_on)}  ${formatTime(
                        task.created_on
                      )}`}
                      priority={task.priority}
                      distance={task.distance}
                      status={task.service_status}
                      reference_Number={task.reference_number}
                      imgSrc="/assets/images/location-icon.svg"
                    />
                  </IonItem>
                ))
              ) : (
                <div>No tasks available.</div>
              )}
            </IonList>
          </>
        )}
      </IonContent>

   <GoTop/>
    </IonPage>
  );
};

export default Forms;
