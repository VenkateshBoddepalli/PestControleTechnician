import React, { useEffect, useState } from "react";
import { fetchNotifications } from "../data/apidata/notificationsApi/notificationsApi";
import { IonBadge, IonButton, IonImg } from "@ionic/react";
import { useHistory } from "react-router";
const NotificationLength = () => {
  const history = useHistory();
  const [notification, setNotifications] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchNotifications();
        console.log(response);
        setNotifications(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleNotificationClick = () => {
    history.push("/notification");
  };
  return (
    <>
      <IonButton
        className="notificationsIcon"
        shape="round"
        onClick={handleNotificationClick}
      >
        <IonImg src="assets/images/notifications-icon.svg" />
        {/* <IonIcon className="alertNotifi" icon={ellipse}></IonIcon> */}
      </IonButton>
      {notification.length > 0 && (
        <IonBadge color="danger" className="alertNotifiBadg">
          {notification.length}
        </IonBadge>
      )}
    </>
  );
};

export default NotificationLength;
