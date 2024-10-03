// import { IonBackButton } from "@ionic/react";

// const CustomBackButton: React.FC<any> = ({ onClick, path }) => (
//     <div onClick={onClick}>
//       <IonBackButton defaultHref={path} />
//     </div>
//   );

//   export default CustomBackButton

import { IonIcon, IonButton } from "@ionic/react";
import { arrowBack } from "ionicons/icons";
import React from "react";

const CustomBackButton: React.FC = () => {
  return (
    <IonButton>
      <IonIcon icon={arrowBack} />
    </IonButton>
  );
};

export default CustomBackButton;
