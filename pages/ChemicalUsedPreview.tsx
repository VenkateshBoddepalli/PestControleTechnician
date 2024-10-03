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
  IonGrid,

  } from "@ionic/react";
import { useHistory } from "react-router";
import CustomBackButton from "../components/CustomBackButton";
import CommonHeader from "../components/CommonHeader";

const ChemicalUsedDetails:React.FC = () => {
    const history = useHistory();
    const goBack = () => {history.goBack();};
  return (
    <>
      {/* <CommonHeader backToPath={"/"} pageTitle={"Chemical Used Details"} showIcons={false} /> */}
     
      <IonHeader translate="yes" className="ion-no-border ion-padding-horizontal">
        <IonToolbar>
          <IonButtons slot="start" className="ion-no-padding">
          <IonBackButton defaultHref=""></IonBackButton>
          </IonButtons>
          <IonTitle className="ion-float-start">Chemical Used Preview</IonTitle> 
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ionContentColor previewWrpp ion-padding-horizontal">

          <div className="preCont ion-padding-vertical">
              <div className="bottomLine">
                <IonText>
                  <h2>House Flies</h2>
                </IonText>

                <IonGrid>
                  <IonRow className="rowHeading">
                    <IonCol size="8">Products</IonCol>
                    <IonCol size="4" className="ion-text-end">
                      Quantity
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol size="8">Advion cockroach Gel-30G Tube</IonCol>
                    <IonCol size="4" className="ion-text-end">
                      2.00
                    </IonCol>

                    <IonCol size="8">Advion cockroach Gel-30G Tube</IonCol>
                    <IonCol size="4" className="ion-text-end">
                      2.00
                    </IonCol>

                    <IonCol size="8">Advion cockroach Gel-30G Tube</IonCol>
                    <IonCol size="4" className="ion-text-end">
                      2.00
                    </IonCol>
                  </IonRow>

                  <IonRow className="rowTotal topLine">
                    <IonCol size="8">Total</IonCol>
                    <IonCol size="4" className="ion-text-end">
                      6.00
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </div>

              <div className="bottomLine">
                <IonText>
                  <h2>House Flies</h2>
                </IonText>

                <IonGrid>
                  <IonRow className="rowHeading">
                    <IonCol size="8">Products</IonCol>
                    <IonCol size="4" className="ion-text-end">
                      Quantity
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol size="8">Advion cockroach Gel-30G Tube</IonCol>
                    <IonCol size="4" className="ion-text-end">
                      2.00
                    </IonCol>

                    <IonCol size="8">Advion cockroach Gel-30G Tube</IonCol>
                    <IonCol size="4" className="ion-text-end">
                      2.00
                    </IonCol>

                    <IonCol size="8">Advion cockroach Gel-30G Tube</IonCol>
                    <IonCol size="4" className="ion-text-end">
                      2.00
                    </IonCol>
                  </IonRow>

                  <IonRow className="rowTotal topLine">
                    <IonCol size="8">Total</IonCol>
                    <IonCol size="4" className="ion-text-end">
                      6.00
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </div>
            </div>
       
      </IonContent>

 

      
    </>
  );
}

export default ChemicalUsedDetails