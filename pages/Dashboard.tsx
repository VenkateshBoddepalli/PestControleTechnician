import React, { useEffect, useState } from "react";
import {
  IonButton,
  IonCard,
  IonCol,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonPage,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  IonLoading,
  IonAlert,
  IonBadge,
} from "@ionic/react";
import { useParams, useHistory } from "react-router-dom";
import { ellipse, sync } from "ionicons/icons";

import { visitStatusCount } from "../data/apidata/taskApi/taskDataApi";
import { handleCheckOut } from "../data/apidata/authApi/dataApi";
import MenuAction from "../components/MenuAction";
import NetworkCheckTime from "./NetworkCheckTime";
import Db from "../data/offline/entity/Db";
import { syncPush } from "../data/offline/entity/sync-push";
import { toast } from "react-toastify";
// import { fetchNotifications } from "../data/apidata/notificationsApi/notificationsApi";
import NotificationLength from "../components/NotificationLength";

const Dashboard: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [expiredTasks, setExpiredTasks] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false); // State for loading spinner
  const [showAlert, setShowAlert] = useState<boolean>(false); // State for the alert
  const history = useHistory();

  useEffect(() => {
    visitStatusCount()
      .then((response) => {
        if (response && response.success) {
          const data = response.data;
          setTotalTasks(data.total_visit_count);

          const statusCounts = data.visit_status_count;
          statusCounts.forEach((status: any) => {
            switch (status.status_name.toLowerCase()) {
              case "completed":
                setCompletedTasks(Number(status.status_count));
                break;
              case "expiry":
                setExpiredTasks(Number(status.status_count));
                break;

              default:
                break;
            }
          });
        } else {
          console.error("Failed to fetch visit status counts.");
          // toast.error('Server not responding. Please try again later.');
        }
      })
      .catch((error) => {
        console.error("Error fetching visit status counts:", error);
        toast.error("Server not responding. Please try again later.");
      });
  }, []);

  const handleCheckOutClick = async () => {
    console.log("In handle check click");
    const result = await handleCheckOut();
    if (result.success) {
      localStorage.removeItem("checkInFlag");
      history.push("/home");
    } else {
      console.error("Check out failed:", result.message);
    }
  };

  const handleNotificationClick = () => {
    history.push("/notification");
  };
  const handleSyncClick = async () => {
    setShowAlert(true); // Show the confirmation alert
  };

  const handleConfirmSync = async (confirm: boolean) => {
    if (confirm) {
      setLoading(true);
      try {
        await syncPush();
      } catch (error) {
        console.error("Sync failed:", error);
        toast.error("Server not responding. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    setShowAlert(false); // Hide the alert
  };
  const menuList: any = [
    {
      path: "/site",
      icon: "site-icon.svg",
      title: "Site",
    },
    {
      path: "/tasks",
      icon: "tasks-icon.svg",
      title: "Tasks",
    },
    {
      path: "/createtask",
      icon: "create-task-icon.svg",
      title: "Create Task",
    },
    {
      path: "/stocktransfer",
      icon: "stock-transfer-dashboard-icon.svg",
      title: "Stock Transfer",
    },
    {
      path: "/forms",
      icon: "form-icon.svg",
      title: "Form",
    },
    {
      path: "sync",
      icon: "sync-icon.svg",
      title: "Sync",
    },
    {
      // path: "sync",
      icon: "sync-icon.svg",
      title: "SyncUp",
      onClick: handleSyncClick,
    },
    {
      path: "",
      icon: "settings-icon.svg",
      title: "Settings",
    },
    {
      path: "",
      icon: "reports-icon.svg",
      title: "Reports",
    },
    {
      path: "/dashboard",
      icon: "checkout-icon.svg",
      title: "Check Out",
      onClick: handleCheckOutClick,
    },
  ];

  return (
    <>
      <IonHeader className="ion-no-border ion-padding-horizontal dashboardHeader">
        <IonToolbar>
          <IonImg
            className="dashboardlogo ion-float-start"
            src="assets/images/psd-logo.svg"
          />
          <div className="ion-float-end headerBts">
            <NotificationLength/>
            <IonButton shape="round" routerLink={"/profile"}>
              <IonImg src="assets/images/account-user.svg" />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent className="dashboardWrapp ionContentColor ion-padding-horizontal ">
        <IonText className="welcomeText">
          <h2>Welcome !</h2>
          <h1>Technician Dashboard</h1>
        </IonText>
        <div className="totalTasks">
          <IonRow>
            <IonCol size="4">
              <IonCard>
                <IonText>
                  <h3>{totalTasks}</h3>
                </IonText>
                <IonText>
                  <h5>Total Tasks</h5>
                </IonText>
              </IonCard>
            </IonCol>
            <IonCol size="4">
              <IonCard>
                <IonText>
                  <h3 className="completedColor">{completedTasks}</h3>
                </IonText>
                <IonText>
                  <h5>Completed</h5>
                </IonText>
              </IonCard>
            </IonCol>
            <IonCol size="4">
              <IonCard>
                <IonText>
                  <h3 className="expiredcolor">{expiredTasks}</h3>
                </IonText>
                <IonText>
                  <h5>Expired</h5>
                </IonText>
              </IonCard>
            </IonCol>
          </IonRow>
        </div>
        <div className="homeList">
          <IonText className="headingWithLines ion-text-center ion-padding-end">
            <h4>Other Actions</h4>
          </IonText>
          <IonRow>
            {menuList.length > 0
              ? menuList.map((item: any, index: any) => {
                  const { path, icon, title, onClick } = item;
                  return path === "sync" ? (
                    <IonCol key={index} size="4" style={{ marginTop: "10px" }}>
                      <Db />
                    </IonCol>
                  ) : (
                    <MenuAction
                      key={index}
                      path={path}
                      icon={icon}
                      title={title}
                      onClick={onClick}
                    />
                  );
                })
              : "No Data"}
          </IonRow>
        </div>
      </IonContent>
      <IonFooter className="ion-footer ion-no-border">
        <IonToolbar className="ion-text-center checkInFooter">
          <IonItem lines="none">
            <IonImg src="assets/images/time-icon.svg"></IonImg>
            <IonText>
              <NetworkCheckTime />
            </IonText>
          </IonItem>
        </IonToolbar>
      </IonFooter>
      <IonLoading
        isOpen={loading}
        message={"Syncing up data to server..."}
        spinner="crescent"
      />
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={"Confirm"}
        message={"Do you want to upload sync data?"}
        buttons={[
          {
            text: "No",
            role: "cancel",
            handler: () => handleConfirmSync(false),
          },
          {
            text: "Yes",
            handler: () => {
              handleConfirmSync(true), setShowAlert(false);
            },
          },
        ]}
      />
    </>
  );
};

export default Dashboard;
