import {
  IonBackButton,
  IonSearchbar,
  IonCheckbox,
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
  IonTitle,
  IonToolbar,
  IonAlert,
  IonSkeletonText,
  IonLabel,
  IonListHeader,
  IonBadge,
} from "@ionic/react";
import { pencil, arrowBack } from "ionicons/icons";
import { useHistory } from "react-router";
import CommonHeader from "../components/CommonHeader";
import {
  fetchNotifications,
  updateNotificationStatus,
} from "../data/apidata/notificationsApi/notificationsApi";
import {
  fetchTaskData,
  fetchTaskDetails,
  formatDate,
} from "../data/apidata/taskApi/taskDataApi";
import { useState, useEffect } from "react";
import { formatDateTime } from "../utils/dateTimeUtils";
// import { formatDate } from "date-fns";
import { formatTime } from "../utils/dateTimeUtils";

const Notification: React.FC = () => {
  const history = useHistory();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any>([]);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchNotifications();
        console.log(response);
        if (response && response.success) {
          console.log(response);
          const notificationData = response.data;
          setNotifications(notificationData);
          localStorage.setItem(
            "notifications",
            JSON.stringify(notificationData)
          );
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Error fetching notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleShowNotification = async (notification: any) => {
    const regex = /(<([^>]+)>)/gi;
    notification.description = notification.description.replace(regex, "");
    setSelectedNotification(notification);
    setShowNotification(true);
  };

  const handleDelete = async (index: number, id: number) => {
    try {
      const response = await updateNotificationStatus(id, { read: true });
      console.log("-------------------->", response);
      if (response && response.success) {
        const updatedNotifications = notifications.filter(
          (notification) => notification.id !== id
        );
        setShowAlert(true); // Show the alert after successful deletion
        setNotifications(updatedNotifications);
        localStorage.setItem(
          "notifications",
          JSON.stringify(updatedNotifications)
        );
      } else {
        console.error("Failed to update notification status");
      }
    } catch (error) {
      console.error("Error updating notification status:", error);
    }
  };
  const goBack = () => {
    history.goBack();
  };
  return (
    <>
      <IonHeader className="ion-no-border ion-padding-horizontal">
        <IonToolbar className="notificationLength">
          <IonButtons slot="start" className="ion-no-padding">
            <IonButton fill="clear" onClick={goBack} slot="start">
              {" "}
              <IonIcon slot="icon-only" icon={arrowBack} />
            </IonButton>
          </IonButtons>

          <IonTitle>Notification</IonTitle>

          <IonBadge slot="end">{notifications.length}</IonBadge>
        </IonToolbar>
      </IonHeader>

      <IonContent
        fullscreen
        className="ionContentColor ion-padding-horizontal notificationWrapp"
      >
        <div className="ion-padding-vertical ionPaddingBottom">
          {loading ? (
            // Use IonSkeletonText for loading state
            <IonList>
              <IonListHeader>
                <IonSkeletonText
                  animated={true}
                  style={{ width: "80px" }}
                ></IonSkeletonText>
              </IonListHeader>
              <IonItem>
                <IonThumbnail slot="start">
                  <IonSkeletonText animated={true}></IonSkeletonText>
                </IonThumbnail>
                <IonLabel>
                  <h3>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "80%" }}
                    ></IonSkeletonText>
                  </h3>
                  <p>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "60%" }}
                    ></IonSkeletonText>
                  </p>
                  <p>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "30%" }}
                    ></IonSkeletonText>
                  </p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonThumbnail slot="start">
                  <IonSkeletonText animated={true}></IonSkeletonText>
                </IonThumbnail>
                <IonLabel>
                  <h3>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "80%" }}
                    ></IonSkeletonText>
                  </h3>
                  <p>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "60%" }}
                    ></IonSkeletonText>
                  </p>
                  <p>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "30%" }}
                    ></IonSkeletonText>
                  </p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonThumbnail slot="start">
                  <IonSkeletonText animated={true}></IonSkeletonText>
                </IonThumbnail>
                <IonLabel>
                  <h3>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "80%" }}
                    ></IonSkeletonText>
                  </h3>
                  <p>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "60%" }}
                    ></IonSkeletonText>
                  </p>
                  <p>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "30%" }}
                    ></IonSkeletonText>
                  </p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonThumbnail slot="start">
                  <IonSkeletonText animated={true}></IonSkeletonText>
                </IonThumbnail>
                <IonLabel>
                  <h3>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "80%" }}
                    ></IonSkeletonText>
                  </h3>
                  <p>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "60%" }}
                    ></IonSkeletonText>
                  </p>
                  <p>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "30%" }}
                    ></IonSkeletonText>
                  </p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonThumbnail slot="start">
                  <IonSkeletonText animated={true}></IonSkeletonText>
                </IonThumbnail>
                <IonLabel>
                  <h3>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "80%" }}
                    ></IonSkeletonText>
                  </h3>
                  <p>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "60%" }}
                    ></IonSkeletonText>
                  </p>
                  <p>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "30%" }}
                    ></IonSkeletonText>
                  </p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonThumbnail slot="start">
                  <IonSkeletonText animated={true}></IonSkeletonText>
                </IonThumbnail>
                <IonLabel>
                  <h3>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "80%" }}
                    ></IonSkeletonText>
                  </h3>
                  <p>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "60%" }}
                    ></IonSkeletonText>
                  </p>
                  <p>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "30%" }}
                    ></IonSkeletonText>
                  </p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonThumbnail slot="start">
                  <IonSkeletonText animated={true}></IonSkeletonText>
                </IonThumbnail>
                <IonLabel>
                  <h3>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "80%" }}
                    ></IonSkeletonText>
                  </h3>
                  <p>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "60%" }}
                    ></IonSkeletonText>
                  </p>
                  <p>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "30%" }}
                    ></IonSkeletonText>
                  </p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonThumbnail slot="start">
                  <IonSkeletonText animated={true}></IonSkeletonText>
                </IonThumbnail>
                <IonLabel>
                  <h3>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "80%" }}
                    ></IonSkeletonText>
                  </h3>
                  <p>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "60%" }}
                    ></IonSkeletonText>
                  </p>
                  <p>
                    <IonSkeletonText
                      animated={true}
                      style={{ width: "30%" }}
                    ></IonSkeletonText>
                  </p>
                </IonLabel>
              </IonItem>
            </IonList>
          ) : error ? (
            <IonText>{error}</IonText>
          ) : notifications.length === 0 ? (
            <IonText>No notifications available.
          
            </IonText>
          ) : (
            <IonList lines="full" class="ion-list-item listItemAll">
              {notifications.map((notification, index) => (
                <IonItem key={notification.id}>
                  <IonThumbnail slot="start" class="thumbnailIcon">
                    <IonImg src="assets/images/notifications-icon.svg"></IonImg>
                  </IonThumbnail>
                  <IonText
                    className="listCont"
                    onClick={() => handleShowNotification(notification)}
                  >
                    <h2>{notification.title}</h2>
                    <h5 style={{ fontWeight: "bolder" }}>
                      {`${formatDate(notification.created_on)}  ${formatTime(
                        notification.created_on
                      )}`}
                    </h5>
                    <div
                      className="ion-padding-top notiDesc"
                      style={{
                        fontWeight: "bolder",
                        fontFamily: "sans-serif",
                      }}
                    >
                      <p
                        dangerouslySetInnerHTML={{
                          __html: notification.description,
                        }}
                      ></p>
                    </div>
                  </IonText>
                  <IonButton
                    slot="end"
                    className="itemBt"
                    shape="round"
                    onClick={() => handleDelete(index, notification.id)}
                  >
                    <IonImg src="/assets/images/delete-icon.svg"></IonImg>
                  </IonButton>
                </IonItem>
              ))}
            </IonList>
          )}
        </div>
      </IonContent>
      <IonAlert
        isOpen={showNotification}
        onDidDismiss={() => setShowNotification(false)}
        cssClass="viewNotificationAlert"
        header={selectedNotification.title}
        message={selectedNotification.description}
        buttons={["OK"]}
      />
      {/* <IonAlert
        isOpen={showAlert}
        onDidDismiss={
          () =>{
            setShowAlert(false)
            history.goBack();
          }
        }
        header={"Notification"}
        message={"Notification has been successfully deleted."}
        buttons={["OK"]}
      /> */}
    </>
  );
};

export default Notification;
