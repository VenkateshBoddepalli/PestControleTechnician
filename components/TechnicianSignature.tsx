import React, { useState, useImperativeHandle, forwardRef } from "react";
import {
  IonCol,
  IonItemGroup,
  IonLabel,
  IonButton,
  IonText,
  IonItem,
} from "@ionic/react"; // Correct import
import SignatureCanvas from "react-signature-canvas";

interface Technician {
  setTechnicianSignature: (signature: string) => void;
}

const TechnicianSignature = forwardRef(({ setTechnicianSignature }: Technician, ref) => {
  const [sign, setSign] = React.useState<string | null>(null); // Initialize with null
  const [isEditable, setIsEditable] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState<string>("Save");

  const padRef = React.useRef<SignatureCanvas>(null);

  useImperativeHandle(ref, () => ({
    clearSignature() {
      handleClear();
    },
  }));

  const handleClear = () => {
    padRef.current?.clear();
    setIsEditable(true);
    setSign(null);
    setTechnicianSignature("");
    setErrorMessage(null);
    setButtonText("Save");
  };

  const handleGenerate = () => {
    if (padRef.current?.isEmpty()) {
      setErrorMessage("Please provide a signature before saving.");
      return;
    }
    const teachgeneratedUrl = padRef.current
      ?.getTrimmedCanvas()
      .toDataURL("image/png");
    if (teachgeneratedUrl) {
      setSign(teachgeneratedUrl);
      setTechnicianSignature(teachgeneratedUrl);
      setIsEditable(false);
      setErrorMessage(null);
      setButtonText("Saved");
    }
  };

  return (
    <IonItemGroup className="sigIonGroup">
      <IonLabel className="ion-label">
        Technician Signature<IonText>*</IonText>
      </IonLabel>
      <IonItem>
        <SignatureCanvas
          canvasProps={{
            width: 325,
            height: 120,
            className: "sigCanvas",
            style: { pointerEvents: isEditable ? "auto" : "none", backgroundColor: "white" },
          }}
          ref={padRef}
        />
      </IonItem>
      <IonCol>
        <div className="ion-float-right signatureBts">
          <IonButton
            color="light"
            className="ion-margin-right"
            onClick={handleClear}
          >
            Clear
          </IonButton>
          <IonButton onClick={handleGenerate} color="medium" disabled={!isEditable}>
            {buttonText}
          </IonButton>
        </div>
        {errorMessage && <IonText color="danger">{errorMessage}</IonText>}
      </IonCol>
    </IonItemGroup>
  );
});

export default TechnicianSignature;
