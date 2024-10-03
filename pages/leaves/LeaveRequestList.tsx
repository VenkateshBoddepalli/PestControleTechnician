import {
  IonButton,
  IonContent,
  IonFooter,
  IonItem,
  IonList,
  IonPage,
  IonRow,
  IonText,
  IonToolbar,
  IonCol,
  IonCard,
  IonThumbnail,
  IonImg,
  IonIcon,
  IonProgressBar,
} from "@ionic/react";
import { useHistory } from "react-router";
import CommonHeader from "../../components/CommonHeader";
import { useEffect, useState } from "react";
import {
  fetchLeaveDetails,
  fetchAvailableLeaves,
} from "../../data/apidata/leaveApi/leaveDataApi";
import { API_BASE_URL } from "../../data/baseUrl";
import { ellipse } from "ionicons/icons";
import { size } from "lodash";

interface LeaveData {
  available_leaves: string;
  leave_type_name: any;
}

interface LeaveAppliedData {
  no_of_days: any;
  status_name: any;
}

const LeaveRequestList: React.FC = () => {
  const [leaveData, setLeaveData] = useState<LeaveData[]>([]);
  const [leaveDetails, setLeaveDetails] = useState([]);
  const [totalAvailableLeaves, setTotalAvailableLeaves] = useState<number>(0);
  const [appliedLeaves, setAppliedLeaves] = useState<number>(0);
  const [acceptedLeaves, setAcceptedLeaves] = useState<number>(0);
  const [rejectedLeaves, setRejectedLeaves] = useState<number>(0);
  const [casualLeaves, setCasualLeaves] = useState<number>(0);
  const [sickLeaves, setSickLeaves] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const history = useHistory();

  useEffect(() => {
    console.log("Leave Data", leaveData);
  }, [leaveData]);

  useEffect(() => {
    fetchAvailableLeaves();
    fetchLeaveDetails()
      .then((response) => {
        if (response && response.success) {
          setLeaveDetails(response.data); // Update state with fetched leave data
          const data: LeaveAppliedData[] = response.data;
          setAppliedLeaves(response.data.length); // Calculate the number of applied leaves
          const acceptedCount = data.filter(
            (leave) => leave.status_name === "Approved"
          ).length;
          const rejectedCount = data.filter(
            (leave) => leave.status_name === "Rejected"
          ).length;
          setAcceptedLeaves(acceptedCount);
          setRejectedLeaves(rejectedCount);
          console.log("Fetched leave data:", response.data);
        } else {
          console.error("Failed to fetch leave data. Error:", response.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching leave data:", error);
      });
  }, []);

  useEffect(() => {
    const getAvailableLeaves = async () => {
      const result = await fetchAvailableLeaves();
      if (result.success) {
        console.log("result", result.data);
        const data: LeaveData[] | any = result.data;
        const totalLeaves = data.reduce(
          (total: number, leave: LeaveData) =>
            total + parseFloat(leave.available_leaves),
          0
        );
        // setLeaveData(result.data || []); // Default to empty array if undefined
        setTotalAvailableLeaves(result.totalLeaves || 0); // Default to 0 if undefined
        const casualLeave = data.find(
          (leave: any) => leave.leave_type_name === "Casual Leaves"
        );
        const sickLeave = data.find(
          (leave: any) => leave.leave_type_name === "Sick Leave"
        );
        setCasualLeaves(
          casualLeave ? parseFloat(casualLeave.available_leaves) : 0
        );
        setSickLeaves(sickLeave ? parseFloat(sickLeave.available_leaves) : 0);
      } else {
        console.error(result.message);
      }
    };

    getAvailableLeaves();
  }, []);

  const calculateDays = (
    startDate: string,
    endDate: string,
    dayType: string
  ): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const differenceInTime = end.getTime() - start.getTime();
    let days = differenceInTime / (1000 * 3600 * 24) + 1; // Adding 1 to include both start and end date

    if (dayType === "21" || dayType === "22") {
      // For first half or second half
      days = days - 0.5; // Subtract 0.5 day for half day leave
    }

    return days;
  };

  const goBack = () => {
    history.goBack();
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",

      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Sent For Approval":
        return "status-pending";
      case "Approved":
        return "status-approved";
      default:
        return "status-default";
    }
  };

  return (
    <>
      <CommonHeader
        backToPath={"/"}
        pageTitle={"Leave Details"}
        showIcons={false}
      />
      <IonContent
        fullscreen
        className="ionContentColor dashboardWrapp leaveWrapp"
      >
        {loading && <IonProgressBar type="indeterminate" color="success" />}
        <div className="ion-padding-horizontal ion-padding-vertical ionPaddingBottom">
          <div className="totalTasks">
            <IonRow>
              <IonCol size="3">
                <IonCard className="cardBlock available">
                  <IonText>
                    <h3 className="availableColor"> {totalAvailableLeaves} </h3>
                  </IonText>
                  <IonText>
                    <h5>Available</h5>
                  </IonText>
                </IonCard>
              </IonCol>

              <IonCol size="3">
                <IonCard className="cardBlock applied">
                  <IonText>
                    <h3> {appliedLeaves} </h3>
                  </IonText>
                  <IonText>
                    <h5>Applied</h5>
                  </IonText>
                </IonCard>
              </IonCol>
              <IonCol size="3">
                <IonCard className="cardBlock accepted">
                  <IonText>
                    <h3 className="completedColor"> {acceptedLeaves} </h3>
                  </IonText>
                  <IonText>
                    <h5>Accepted</h5>
                  </IonText>
                </IonCard>
              </IonCol>

              <IonCol size="3">
                <IonCard className="cardBlock rejected">
                  <IonText>
                    <h3 className="expiredcolor"> {rejectedLeaves} </h3>
                  </IonText>
                  <IonText>
                    <h5>Rejected</h5>
                  </IonText>
                </IonCard>
              </IonCol>
            </IonRow>
          </div>
          <div className="leaveslegend">
            <IonText>
              <p>
                <IonIcon className="inActiveColor" icon={ellipse}></IonIcon>
                Casual ({casualLeaves})
              </p>
              <p>
                <IonIcon className="inActiveColor" icon={ellipse}></IonIcon>Sick
                ({sickLeaves})
              </p>
            </IonText>
          </div>

          <IonText>
            <h1 className="headingH1">Leave Request List</h1>
          </IonText>

          <IonList lines="full">
            {leaveDetails &&
              leaveDetails.length > 0 &&
              leaveDetails.map((data: any, index: any) => (
                <IonItem key={index}>
                  <IonThumbnail slot="start" className="thumbnailIcon">
                    <IonImg src="assets/images/calendar-icon.svg"></IonImg>
                  </IonThumbnail>

                  <div className="width100 leaveRightCont">
                    <IonText>
                      <h3 className="leaveType">{data.leave_type_name} ({data.day_type})</h3>
                    </IonText>
                    <IonText className="ion-float-start">
                      <h6>Applied On</h6>
                      <h2> {formatDate(data.created_on)} </h2>
                    </IonText>
                    <h5
                      className={`ion-float-end ${getStatusColor(
                        data.status_name
                      )}`}
                    >
                      {data.status_name}
                    </h5>

                    <IonRow className="leaveRow">
                      <IonCol size="5">
                        <IonText>
                          <h6>From</h6>
                          <h4> {formatDate(data.leave_start_date)} </h4>
                        </IonText>
                      </IonCol>

                      <IonCol size="5">
                        <IonText>
                          <h6>To</h6>
                          <h4> {formatDate(data.leave_end_date)} </h4>
                        </IonText>
                      </IonCol>

                      <IonCol size="2">
                        <IonText>
                          <h6>Days</h6>
                          <h4>{data.no_of_days} </h4>
                        </IonText>
                      </IonCol>
                    </IonRow>
                    <IonText>
                      <p style={{ fontWeight: "bold" }}>
                        Reason for Leave:{" "}
                        <span style={{ fontWeight: "normal" }}>
                          {" "}
                          {data.reason_for_leave || "Reason not available"}
                        </span>{" "}
                      </p>
                    </IonText>
                   

                  
                    
                  </div>
                </IonItem>
              ))}
          </IonList>
        </div>
      </IonContent>

      <IonFooter className="ion-footer">
        <IonToolbar>
          <IonButton
            routerLink="/ApplyLeave"
            className="ion-button ion-margin-horizontal"
            expand="block"
            color="primary"
          >
            Apply Leave
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </>
  );
};

export default LeaveRequestList;
