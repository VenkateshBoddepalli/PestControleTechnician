import { IonItem, IonThumbnail, IonImg, IonText } from '@ionic/react'
import React from 'react'

const TaskDetailItems:React.FC<any> = ({icon, labelTxt, valueTxt}) => {
  return (
    <>
          <IonItem>
                    <IonThumbnail slot="start" className="thumbnailIcon">
                        <IonImg src={"assets/images/"+icon} />
                    </IonThumbnail>
                    <>
                        <IonText>
                          <p className="ion-margin-top-10">{labelTxt}</p>
                          <h2>{valueTxt}</h2>
                        </IonText>
                    </>
                </IonItem>
    </>
  )
}

export default TaskDetailItems
