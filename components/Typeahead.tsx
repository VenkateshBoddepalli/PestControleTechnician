import React, { useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonTitle,
  IonSearchbar,
  IonToolbar,
  IonLabel,
  IonText,
} from '@ionic/react';

interface Item {
  text: string;
  value: string;
}

interface CustomerTypeaheadProps {
  items: Item[];
  selectedItem: string;
  title?: string;
  onSelectionCancel?: () => void;
  onSelectionChange?: (item: string) => void;
}

function CustomerTypeahead(props: CustomerTypeaheadProps) {
  const [filteredItems, setFilteredItems] = useState<Item[]>([...props.items]);
  const [workingSelectedValue, setWorkingSelectedValue] = useState<string>(props.selectedItem);
  const [searchQuery, setSearchQuery] = useState<string>(''); // State to manage search query

  const cancelChanges = () => {
    const { onSelectionCancel } = props;
    if (onSelectionCancel) {
      onSelectionCancel();
    }
  };

  const searchbarInput = (ev: CustomEvent) => {
    const query = ev.detail.value as string;
    setSearchQuery(query);
    filterList(query);
  };

  const filterList = (query: string) => {
    const normalizedQuery = query.toLowerCase();
    if (!query) {
      setFilteredItems([...props.items]);
    } else {
      setFilteredItems(
        props.items.filter((item) => item.text.toLowerCase().includes(normalizedQuery))
      );
    }
  };

  const itemSelected = (value: string) => {
    setWorkingSelectedValue(value);
    const { onSelectionChange } = props;
    if (onSelectionChange) {
      onSelectionChange(value); // Call selection change here
    }
    cancelChanges(); // Close the modal
  };

  const handleFilterReset = () => {
    setSearchQuery(''); // Clear search query
    setFilteredItems([...props.items]); // Reset filtered items to all items
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={cancelChanges}>Cancel</IonButton>
          </IonButtons>
          <IonTitle className="ion-text-center" style={{ fontWeight: 'bold' }}>
            {props.title}
          </IonTitle>
          <IonText slot="end" className="reset ion-float-end" onClick={handleFilterReset} style={{color:"red"}}>
            Clear All
          </IonText>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar value={searchQuery} onIonInput={searchbarInput}></IonSearchbar>
        </IonToolbar>
      </IonHeader>

      <IonContent color="light" className="searchCustomer">
        <IonList className='ion-no-padding ion-no-margin' id="modal-list" inset={true}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <IonItem
                key={item.value}
                button
                onClick={() => itemSelected(item.value)}
                className="no-border"
              >
                <IonLabel>{item.text}</IonLabel>
              </IonItem>
            ))
          ) : (
            <IonItem className="no-border">
              <IonLabel className="ion-text-center">No data found</IonLabel>
            </IonItem>
          )}
        </IonList>
      </IonContent>
    </>
  );
}

export default CustomerTypeahead;
