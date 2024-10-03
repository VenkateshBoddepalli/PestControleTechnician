import { IonButton, IonIcon } from "@ionic/react";
import { arrowUp } from "ionicons/icons";
import React from "react";

const GoTop = () => {
  const handleTop = () => {
    const content = document.querySelector("ion-content");
    if (content) {
      content.scrollToTop(500); // Scrolls to top with a 500ms duration
    }
  };
  return (
    <IonButton
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        textAlign: "left",
        padding: "10px", // Optional padding for better touch area
      }}
      onClick={handleTop}
    >
      <IonIcon icon={arrowUp} />
    </IonButton>
  );
};

export default GoTop;
