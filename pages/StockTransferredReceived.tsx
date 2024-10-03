import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonRow,
  IonText,
  IonLabel,
  IonTitle,
  IonInput,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonThumbnail,
  IonImg,
  IonSegment,
  IonSegmentButton,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSkeletonText,
  IonListHeader,
  IonSearchbar,
  IonModal,
} from "@ionic/react";
import {
  techniciansStockTransferred,
  techniciansStockRecieved,
} from "../data/apidata/stockTransferApi/stockTransferApi";
import FullScreenLoader from "../components/FullScreenLoader";
import { formatTime } from "../utils/dateTimeUtils";
import GoTop from "../components/GoTop";

const StockTransferredReceived: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<string>("TRANSFERRED");
  const [loading, setLoading] = useState<boolean>(true);
  const [transferData, setTransferData] = useState<any[]>([]);
  const [recievedData, setRecievedData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [transferedFilteredData, setTransferedFilteredData] = useState<any[]>(
    []
  );
  interface FilterCriteria {
    status?: string; // Add other fields as necessary
    [key: string]: any; // Allow additional dynamic keys if needed
  }
  const [recievedFilteredData, setRecievedFilteredData] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [temporaryFilter, setTemporaryFilter] = useState<FilterCriteria>({});
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({});

  useEffect(() => {
    setCurrentPage(0);
    // stockTransfered();
    // stockRecieved();
    setTransferData([]);
    setRecievedData([]);
    loadData(0);
    setLoaded(false);
    localStorage.setItem("segment", selectedSegment);
  }, [selectedSegment]);

  const loadData = async (page: number) => {
    if (selectedSegment === "TRANSFERRED") {
      await stockTransfered(page);
    } else {
      await stockRecieved(page);
    }
  };
  useEffect(() => {
    applySearchAndFilter();
  }, [searchQuery, filterCriteria, transferData, recievedData]);

  const stockTransfered = async (page: any) => {
    try {
      const response = await techniciansStockTransferred(page);
      if (response.status == 200 && response.success) {
        const newTransferData = response.data;
        console.log(newTransferData);
        // setTransferData(prevData => [...prevData, ...newTransferData]);
        setTransferData(newTransferData);
        setTransferedFilteredData(newTransferData);
        setLoaded(true);
        // setHasMoreData(newTransferData.length > 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      // setSubmitting(false);
      setLoaded(true);
    }
  };

  const stockRecieved = async (page: any) => {
    try {
      const response = await techniciansStockRecieved(page);
      if (response.status == 200 && response.success) {
        const newRecievedData = response.data;
        setRecievedData((prevData) => [...prevData, ...newRecievedData]);
        setRecievedFilteredData(newRecievedData);
        setHasMoreData(newRecievedData.length > 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  useEffect(() => {
    console.log(transferData, "Transfer Data");
  }, [transferData]);

  useEffect(() => {
    console.log(recievedData, "Recieved Data");
  }, [recievedData]);

  const loadMoreData = async (event: CustomEvent<void>) => {
    const newPage = currentPage + 1;
    setCurrentPage(newPage);
    console.log("currentpage", currentPage);
    await loadData(newPage);
    (event.target as HTMLIonInfiniteScrollElement).complete();
  };
  const handleInput = (ev: CustomEvent) => {
    const query = (ev.target as HTMLIonSearchbarElement).value!.toLowerCase();
    setSearchQuery(query);
  };

  const handleFilterChange = (e: CustomEvent) => {
    const target = e.target as HTMLIonInputElement | HTMLIonSelectElement;
    const { name, value } = target;
    console.log("Filter change - Name:", name, "Value:", value);
    setTemporaryFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleFilterSubmit = () => {
    setIsFilterOpen(false);
    applySearchAndFilter();
    setFilterCriteria(temporaryFilter);
  };
  const applySearchAndFilter = () => {
    if (selectedSegment === "TRANSFERRED") {
      let transferFilteredData = transferData.slice();
      console.log("Search Query:", searchQuery);
      console.log("Filter Criteria:", filterCriteria);

      if (searchQuery) {
        transferFilteredData = transferFilteredData.filter(
          (task) =>
            (task.first_name &&
              task.first_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())) ||
            (task.last_name &&
              task.last_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())) ||
            (task.reference_number &&
              task.reference_number
                .toLowerCase()
                .includes(searchQuery.toLowerCase()))
        );
      }

      if (filterCriteria.status) {
        console.log("Filtering by priority:", filterCriteria.status);
        transferFilteredData = transferFilteredData.filter(
          (task) => task.status_name === filterCriteria.status
        );
      }
      console.log("Filtered Data:", transferFilteredData);
      setTransferedFilteredData(transferFilteredData);
    } else {
      let recieveFilteredData = recievedData.slice();
      console.log("Search Query:", searchQuery);
      console.log("Filter Criteria:", filterCriteria);

      if (searchQuery) {
        recieveFilteredData = recieveFilteredData.filter(
          (task) =>
            (task.first_name &&
              task.first_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())) ||
            (task.last_name &&
              task.last_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())) ||
            (task.reference_number &&
              task.reference_number
                .toLowerCase()
                .includes(searchQuery.toLowerCase()))
        );
      }

      if (filterCriteria.status) {
        console.log("Filtering by priority:", filterCriteria.status);
        recieveFilteredData = recieveFilteredData.filter(
          (task) => task.status_name === filterCriteria.status
        );
      }
      console.log("Filtered Data:", recieveFilteredData);
      setRecievedFilteredData(recieveFilteredData);
    }
  };
  const handleFilterReset = () => {
    setIsFilterOpen(false);
    setFilterCriteria({
      status: "",
    
    });
    setTemporaryFilter({
      status: "",
    });
    applySearchAndFilter();
  };
  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      // hour: 'numeric',
      // minute: 'numeric',
      // second: 'numeric',
      hour12: false,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "#FC9608";
      case "Accepted":
        return "#0FA9A6";
      default:
        return "#93a8b5";
    }
  };
  const handleCancel = () => {
    setIsFilterOpen(false);
  };

  return (
    <>
      <IonHeader
        translate="yes"
        className="ion-no-border ion-padding-horizontal"
      >
        <IonToolbar>
          <IonButtons slot="start" className="ion-no-padding">
            <IonBackButton defaultHref={"/stocktransfer"}></IonBackButton>
          </IonButtons>
          <IonTitle className="ion-float-start">
            Stock Transferred and Received List
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ionContentColor">
        <div className="ionPaddingBottom">
          <IonSegment
            className="stockIonSegmentButton"
            value={selectedSegment}
            onIonChange={(e) => setSelectedSegment(e.detail.value as string)}
          >
            <IonSegmentButton value="TRANSFERRED">
              <IonLabel>Stock Transferred</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="RECEIVED">
              <IonLabel>Stock Received</IonLabel>
            </IonSegmentButton>
          </IonSegment>
          <IonItem
            lines="none"
            className="ion-item-inner ion-no-padding ion-margin-vertical filterArea"
          >
            <IonSearchbar
              debounce={500}
              onIonInput={handleInput}
            ></IonSearchbar>

            <div className="ion-float_end">
              <IonButton
                shape="round"
                onClick={() => setIsFilterOpen(true)}
                className="roundedWhiteBtIcon ion-no-margin"
              >
                <IonImg src="assets/images/filter-icon.svg"></IonImg>
              </IonButton>
            </div>
          </IonItem>
          <div>
            {selectedSegment === "TRANSFERRED" &&
              transferedFilteredData &&
              transferedFilteredData.length > 0 &&
              transferedFilteredData.map((data) => (
                <IonList
                  lines="full"
                  className="ion-list-item listItemAll ion-padding-horizontal stockSegment"
                >
                  <IonItem routerLink={"/stocktransferreddetails/" + data.id}>
                    <IonThumbnail slot="start" className="thumbnailIcon">
                      <IonImg src="assets/images/technician-icon.svg"></IonImg>
                    </IonThumbnail>
                    <IonText className="listCont ion-no-padding">
                      <div className="stockSegmentHeadingDate">
                        <h3 className="ion-float-left">
                          {" "}
                          {data.first_name} {data.last_name}{" "}
                        </h3>

                        <IonText className="ion-float-right stockDate">
                          {" "}
                          {formatDate(data.created_on)}{" "}
                        </IonText>
                        <br></br>
                        <IonText className="ion-float-right stockDate">
                          {" "}
                          {formatTime(data.created_on)}{" "}
                        </IonText>
                      </div>
                      <h2>+971 {data.mobile_no}</h2>
                      <h5 style={{ color: getStatusColor(data.status_name) }}>
                        {data.reference_number}
                        <span> | </span>
                        {data.status_name}{" "}
                      </h5>
                    </IonText>
                  </IonItem>
                </IonList>
              ))}
            {selectedSegment === "TRANSFERRED" &&
              loaded &&
              transferedFilteredData &&
              transferedFilteredData.length == 0 && (
                <p style={{ textAlign: "center", width: "100%" }}>
                  No Stock found.
                </p>
              )}
            {/* Recharge */}
            {selectedSegment === "RECEIVED" &&
              recievedFilteredData &&
              recievedFilteredData.length > 0 &&
              recievedFilteredData.map((data) => (
                <IonList
                  lines="full"
                  className="ion-list-item listItemAll ion-padding-horizontal stockSegment"
                >
                  <IonItem routerLink={"/stocktransferreddetails/" + data.id}>
                    <IonThumbnail slot="start" className="thumbnailIcon">
                      <IonImg src="assets/images/technician-icon.svg"></IonImg>
                    </IonThumbnail>
                    <IonText className="listCont ion-no-padding">
                      <div className="stockSegmentHeadingDate">
                        <h3 className="ion-float-left">
                          {" "}
                          {data.first_name} {data.last_name}{" "}
                        </h3>
                        <IonText className="ion-float-right stockDate">
                          {" "}
                          {formatDate(data.created_on)}{" "}
                        </IonText>
                        <br></br>
                        <IonText className="ion-float-right stockDate">
                          {" "}
                          {formatTime(data.created_on)}{" "}
                        </IonText>
                      </div>
                      <h2>+971 {data.mobile_no}</h2>
                      <h5 style={{ color: getStatusColor(data.status_name) }}>
                        {" "}
                        {data.reference_number}
                        <span> | </span> {data.status_name}{" "}
                      </h5>
                    </IonText>
                  </IonItem>
                </IonList>
              ))}
            {selectedSegment === "RECEIVED" &&
              loaded &&
              recievedFilteredData &&
              recievedFilteredData.length == 0 && (
                <p style={{ textAlign: "center", width: "100%" }}>
                  No Stock found.
                </p>
              )}
            {!loaded && (
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
            )}
          </div>
        </div>
        {/* <IonInfiniteScroll onIonInfinite={loadMoreData} threshold="100px" disabled={!hasMoreData}>
          <IonInfiniteScrollContent loadingText="Please wait..." loadingSpinner="bubbles"></IonInfiniteScrollContent>
          </IonInfiniteScroll> */}
      </IonContent>
          <GoTop/>
      {/* <FullScreenLoader isLoading={submitting} /> */}
      <IonModal
        className="ion-bottom-modal stockFilter"
        onDidDismiss={() => setIsFilterOpen(false)}
        isOpen={isFilterOpen}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle slot="start" className="ion-no-padding">
              Filter
            </IonTitle>
            <IonText
              slot="end"
              className="reset ion-float-end"
              onClick={handleFilterReset}
            >
              Clear All
            </IonText>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <form>
            <div className="modalInputSandsale">
              <IonList className="formlist">
                <IonItem lines="none">
                  <div className="width100">
                    <IonLabel className="ion-label">Status</IonLabel>
                    <IonSelect
                      value={temporaryFilter.status} // Bind the value to the state
                      name="status"
                      onIonChange={handleFilterChange}
                      labelPlacement="floating"
                      placeholder="Select Status"
                      fill="outline"
                      aria-label="Select Status"
                    >
                      <IonSelectOption value="Accepted">
                        Accepted
                      </IonSelectOption>
                      <IonSelectOption value="Rejected">
                        Rejected
                      </IonSelectOption>
                      <IonSelectOption value="Pending">Pending</IonSelectOption>
                    </IonSelect>
                  </div>
                </IonItem>
              </IonList>
              <IonFooter className="ion-footer">
                <IonToolbar className="ionFooterTwoButtons">
                  <IonButton
                    className="ion-button"
                    fill="outline"
                    color="medium"
                    onClick={handleCancel}
                    // onClick={() => setIsFilterOpen(false)}
                  >
                    Cancel
                  </IonButton>
                  <IonButton
                    className="ion-button"
                    fill="outline"
                    color="primary"
                    onClick={handleFilterSubmit}
                  >
                    Apply
                  </IonButton>
                </IonToolbar>
              </IonFooter>
            </div>
          </form>
        </IonContent>
      </IonModal>
    </>
  );
};

export default StockTransferredReceived;
