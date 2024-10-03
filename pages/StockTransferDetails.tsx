import React, { useCallback, useEffect, useState } from "react";
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
  IonAlert,
  IonModal,
  IonTextarea,
  IonSkeletonText,
  IonListHeader,
} from "@ionic/react";
import { useHistory, useParams } from "react-router";
import {
  transferedRecievedDetail,
  stockApproveRejected,
} from "../data/apidata/stockTransferApi/stockTransferApi";
import { toast, ToastContainer } from "react-toastify";
import { formatTime } from "../utils/dateTimeUtils";
import GoTop from "../components/GoTop";

const StockTransferredDetails: React.FC = () => {
  const id: any = useParams();

  const [detailsData, setDetailsData] = useState<any[]>([]);
  const [stockTransferId, setStockTransferId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const segmentType = localStorage.getItem("segment");
  const history = useHistory();
  const [statusName, setStatusName] = useState("");
  const [respReason, setRespReason] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);

  useEffect(() => {
    getDetails();
  }, []);

  useEffect(() => {
    console.log(detailsData);
  }, [detailsData]);

  useEffect(() => {
    console.log(statusName);
  }, [statusName]);

  useEffect(() => {
    console.log(stockTransferId);
  }, [stockTransferId]);

  // useEffect(() => {
  //   console.log(reason);
  // }, [reason]);
  useEffect(() => {
    if (formSubmitted && reason) {
      handleFormSubmit();
      setFormSubmitted(false);
    }
  }, [reason, formSubmitted]);

  useEffect(() => {
    console.log(respReason);
  }, [respReason]);

  const getDetails = async () => {
    try {
      transferedRecievedDetail(id, segmentType).then((resp) => {
        if (resp.status == 200 && resp.success) {
          const stockDtails = resp.data;
          setDetailsData(stockDtails);
          const transferId = resp.data[0].stock_transfer_id;
          setStockTransferId(transferId);
          const status_Name = resp.data[0].status_name;
          setStatusName(status_Name);
          const reason_detail = resp.data[0].reason;
          setRespReason(reason_detail);
        }
        console.log(resp, "response======");
      });
    } catch {}
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
      // hourCycle:"h24"
    });
  };

  const handleApprove = async () => {
    try {
      const resp = await stockApproveRejected(stockTransferId, "Accepted", "");
      console.log(resp);
      if (resp.status == 200 && resp.success) {
        setAcceptOpen(false);
        toast.success(resp.message);
        history.push("/stocktransferredreceived");
      } else {
        toast.error(resp.message);
      }
    } catch (error) {
      console.error("Error rejecting Stock Transfer:", error);
      toast.error("Server not responding. Please try again later.");
    } finally {
      setAcceptOpen(false);
    }
  };

  const handleReason = (event: any) => {
    const reasonDetail = event.detail.value;
    setReason((prevReason) => event.detail.value);
  };

  // const handleSubmit = async (event: React.FormEvent) => {
  //   event.preventDefault();
  //   await console.log(reason);
  //   if (!reason) {
  //     toast.error('Please provide a reason for rejection.');
  //     return;
  //   }
  //   try {
  //     const resp = await stockApproveRejected(stockTransferId, 'Rejected', reason);
  //     console.log(resp);
  //     if(resp.status == 200 && resp.success){
  //     setIsOpen(false);
  //     toast.success(resp.message);
  //     history.push('/stocktransferredreceived')
  //     }
  //     else{
  //       toast.error(resp.message)
  //     }
  //   } catch (error) {
  //     console.error('Error rejecting stock transfer:', error);
  //   }
  // };

  const handleFormSubmit = async () => {
    console.log("Reason:", reason); // Log the updated reason value

    if (!reason) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    try {
      const resp = await stockApproveRejected(
        stockTransferId,
        "Rejected",
        reason
      );
      console.log(resp);
      if (resp.status == 200 && resp.success) {
        setIsOpen(false);
        // history.push("/stocktransferredreceived");
        toast.success(resp.message);
        setReason(""); // Clear the reason state after successful submission
        setTimeout(() => {
          history.push("/stocktransferredreceived");
        }, 2000); // Add a 2-second delay before navigation
      } else {
        toast.error(resp.message);
      }
    } catch (error) {
      console.error("Error rejecting stock transfer:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormSubmitted(true);
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

  return (
    <>
      <ToastContainer />
      <IonHeader
        translate="yes"
        className="ion-no-border ion-padding-horizontal"
      >
        <IonToolbar>
          <IonButtons slot="start" className="ion-no-padding">
            <IonBackButton defaultHref={"/stocktransfer"}></IonBackButton>
          </IonButtons>
          {segmentType == "TRANSFERRED" && (
            <IonTitle className="ion-float-start">
              Stock Transferred List
            </IonTitle>
          )}
          {segmentType == "RECEIVED" && (
            <IonTitle className="ion-float-start">Stock Received List</IonTitle>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ionContentColor">
        <IonList
          lines="full"
          className="ion-list-item listItemAll ion-padding-horizontal stockSegment"
        >
          {detailsData && detailsData.length > 0 && (
            <>
              <IonItem>
                <IonThumbnail slot="start" className="thumbnailIcon">
                  <IonImg src="assets/images/technician-icon.svg"></IonImg>
                </IonThumbnail>
                <IonText className="listCont ion-no-padding">
                  <div className="stockSegmentHeadingDate">
                    <h3 className="ion-float-left">
                      {" "}
                      {detailsData[0].first_name} {detailsData[0].last_name}{" "}
                    </h3>
                    <IonText className="ion-float-right stockDate">
                      {" "}
                      {formatDate(detailsData[0].created_on)}{" "}
                    </IonText>
                    <br />
                    <IonText className="ion-float-right stockDate">
                      {" "}
                      {formatTime(detailsData[0].created_on)}{" "}
                    </IonText>
                  </div>
                  <h2>+971 {detailsData[0].mobile_no} </h2>
                  <h5
                    style={{
                      color: getStatusColor(detailsData[0].status_name),
                    }}
                  >
                    {" "}
                    {detailsData[0].reference_number}
                    <span> | </span> {detailsData[0].status_name}{" "}
                  </h5>
                </IonText>
              </IonItem>
              <IonItem
                lines="none"
                className="stockHeadingH1 ion-padding-horizontal"
              >
                <h1>Chemicals / Materials</h1>
              </IonItem>
            </>
          )}

          {detailsData && detailsData.length > 0 ? (
            detailsData.map((data, index) => (
              <IonList
                key={index}
                lines="full"
                className="ion-list-item ion-padding-horizontal stockDetails"
              >
                <IonItem>
                  <div className="width100">
                    <h3 className="ion-float-left">{data.item_name}</h3>
                    <IonText className="ion-float-right">
                      Qty :{" "}
                      <span className="availableQty">
                        {parseFloat(data.item_quantity)} - {data.packaging_uom}
                      </span>
                    </IonText>
                  </div>
                </IonItem>
              </IonList>
            ))
          ) : (
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
          {respReason ? (
            <>
              <IonItem>
                <IonText className="reasonText ion-no-padding">
                  <div className="text">
                    <h3 className="ion-float-left">Reason for Rejected</h3>
                    <IonText className="ion-float-right stockDate">
                      {respReason}
                    </IonText>
                  </div>
                </IonText>
              </IonItem>
            </>
          ) : (
            <IonText></IonText>
          )}
        </IonList>
      </IonContent>
      <GoTop />
      <IonFooter className="ion-footer">
        {statusName == "Pending" && segmentType == "RECEIVED" && (
          <IonToolbar className="ionFooterTwoButtons">
            <IonButton
              className="ion-button"
              onClick={() => setIsOpen(true)}
              color={"medium"}
            >
              Reject
            </IonButton>
            <IonButton
              className="ion-button"
              onClick={() => setAcceptOpen(true)}
              color={"primary"}
            >
              Accept
            </IonButton>
          </IonToolbar>
        )}
      </IonFooter>

      <IonAlert
        isOpen={acceptOpen}
        header="Are you sure you want to accept it?"
        buttons={[
          {
            text: "Ok",
            role: "confirm",
            cssClass: "alert-button-primary",
            handler: () => {
              handleApprove();
            },
          },
        ]}
        onDidDismiss={() => setAcceptOpen(false)}
      ></IonAlert>

      <IonModal
        className="ion-bottom-modal rejectStockMaterialsModal"
        isOpen={isOpen}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Reject for Stock Materials</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <form onSubmit={handleSubmit}>
            <div className="modalInputSandsale">
              <IonList className="formlist">
                <IonTextarea
                  fill="outline"
                  placeholder="Enter Reason"
                  // value={reason}
                  onIonChange={(e) => handleReason(e)}
                />
              </IonList>
            </div>

            <IonFooter className="ion-footer rejectStockFooter">
              <IonToolbar className="ionFooterTwoButtons">
                <IonButton
                  type="button"
                  className="ion-button"
                  fill="outline"
                  color="medium"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </IonButton>
                <IonButton type="submit" className="ion-button" color="primary">
                  Submit
                </IonButton>
              </IonToolbar>
            </IonFooter>
          </form>
        </IonContent>
      </IonModal>
    </>
  );
};

export default StockTransferredDetails;
