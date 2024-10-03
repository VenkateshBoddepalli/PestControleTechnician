import { Storage } from "@ionic/storage";
import { Network } from "@capacitor/network";
import { API_BASE_URL } from "../../baseUrl";
import { getUserData } from "../../apidata/taskApi/taskDataApi";

enum task_tx_steps {
  taskStart = 1,
  attendance,
  startTravel,
  endTravel,
  pestActivity,
  chemsUsed,
  recommendations,
  workDone,
  feedbackFollowup,
  PauseResume,
}

const httpPostRequest = async (url: string, payload: any) => {
  const userData = getUserData();
  let httpReqObj = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userData?.api_token}`,
    },
    body: JSON.stringify(payload),
  };
  const response = await fetch(url, httpReqObj);
  if (!response.ok) {
    console.error(
      "SYNC PUSH: Failed to POST data, url = ",
      url,
      "  ; payload = ",
      payload,
      "; response status : ",
      response.status,
      "; response body : ",
      response.body
    );
    return false;
  }
  return true;
};

export const syncPush = async () => {
  let storage = new Storage();
  await storage.create();

  let otxTasksExecuted = await storage.get("otx-tasks-executed");

  if (!otxTasksExecuted || otxTasksExecuted.length === 0) {
    return 0;
  } else {
    // Arrays for failed transactions
    let failedTransactions: { taskId: string; step: string }[] = [];

    // Define arrays for payloads
    let taskStartPayloads = [];
    let attendancePayloads = [];
    // Add more arrays for other steps
    let startTravelPayloads = [];
    let endTravelPayloads = [];
    let pestActivityPayloads = [];
    let chemsUsedPayloads = [];
    let recommendationsPayloads = [];
    let workDonePayloads = [];
    let feedbackFollowupPayloads = [];
    let pauseResumePayloads = [];

    for (let index = 0; index < otxTasksExecuted.length; index++) {
      const taskId = otxTasksExecuted[index];
      const otxSeqArray = await storage.get("otx-seq-" + taskId);

      for (let seqIndex = 0; seqIndex < otxSeqArray.length; seqIndex++) {
        const otx = otxSeqArray[seqIndex];

        switch (otx) {
          case task_tx_steps.taskStart:
            const taskStartPayload = await storage.get(
              "otx-task-start-" + taskId
            );
            Array.isArray(taskStartPayload)
              ? taskStartPayloads.push(...taskStartPayload)
              : taskStartPayloads.push(taskStartPayload);
            break;

          case task_tx_steps.attendance:
            const attendancePayload = await storage.get(
              "otx-teamAttendance-" + taskId
            );
            Array.isArray(attendancePayload)
              ? attendancePayloads.push(...attendancePayload)
              : attendancePayloads.push(attendancePayload);
            break;

          // Repeat similar cases for other task steps:
          case task_tx_steps.startTravel:
            const startTravelPayload = await storage.get(
              "otx-Start-TrackTime-" + taskId
            );
            Array.isArray(startTravelPayload)
              ? startTravelPayloads.push(...startTravelPayload)
              : startTravelPayloads.push(startTravelPayload);
            break;

          case task_tx_steps.endTravel:
            const endTravelPayload = await storage.get(
              "otx-End-TrackTime-" + taskId
            );
            Array.isArray(endTravelPayload)
              ? endTravelPayloads.push(...endTravelPayload)
              : endTravelPayloads.push(endTravelPayload);
            break;

          case task_tx_steps.pestActivity:
            const pestActivityPayload = await storage.get(
              "otx-pestData-" + taskId
            );
            Array.isArray(pestActivityPayload)
              ? pestActivityPayloads.push(...pestActivityPayload)
              : pestActivityPayloads.push(pestActivityPayload);
            break;

          case task_tx_steps.chemsUsed:
            const chemsUsedPayload = await storage.get(
              "otx-chem-used-" + taskId
            );
            Array.isArray(chemsUsedPayload)
              ? chemsUsedPayloads.push(...chemsUsedPayload)
              : chemsUsedPayloads.push(chemsUsedPayload);
            break;

          case task_tx_steps.recommendations:
            const recommendationsPayload = await storage.get(
              "otx-pest-recommendation-" + taskId
            );
            Array.isArray(recommendationsPayload)
              ? recommendationsPayloads.push(...recommendationsPayload)
              : recommendationsPayloads.push(recommendationsPayload);
            break;

          case task_tx_steps.workDone:
            const workDonePayload = await storage.get(
              "otx-work-done-" + taskId
            );
            Array.isArray(workDonePayload)
              ? workDonePayloads.push(...workDonePayload)
              : workDonePayloads.push(workDonePayload);
            break;

          case task_tx_steps.feedbackFollowup:
            const feedbackFollowupPayload = await storage.get(
              "otx-followup-feedback-" + taskId
            );
            Array.isArray(feedbackFollowupPayload)
              ? feedbackFollowupPayloads.push(...feedbackFollowupPayload)
              : feedbackFollowupPayloads.push(feedbackFollowupPayload);
            break;

          case task_tx_steps.PauseResume:
            const pauseResumePayload = await storage.get(
              "otx-task-PauseResume-" + taskId
            );
            Array.isArray(pauseResumePayload)
              ? pauseResumePayloads.push(...pauseResumePayload)
              : pauseResumePayloads.push(pauseResumePayload);
            break;
        }
      }

      // Remove sequence data for this task
      await storage.remove("otx-seq-" + taskId);
    }

    // Define a function to handle each push and retry logic
    const handlePush = async (
      url: string,
      payloads: any[],
      keyPrefix: string,
      step: string
    ) => {
      if (payloads.length > 0) {
        let pushStatus = await httpPostRequest(url, payloads);

        if (pushStatus) {
          for (let index = 0; index < otxTasksExecuted.length; index++) {
            const taskId = otxTasksExecuted[index];
            await storage.remove(`${keyPrefix}-${taskId}`);
          }
        } else {
          for (let retry = 0; retry < 3; retry++) {
            pushStatus = await httpPostRequest(url, payloads);
            if (pushStatus) {
              for (let index = 0; index < otxTasksExecuted.length; index++) {
                const taskId = otxTasksExecuted[index];
                await storage.remove(`${keyPrefix}-${taskId}`);
              }
              break;
            }
          }
          if (!pushStatus) {
            console.log(`Failed to push ${keyPrefix} data after 3 attempts.`);
            for (let index = 0; index < otxTasksExecuted.length; index++) {
              const taskId = otxTasksExecuted[index];
              failedTransactions.push({ taskId, step });
            }
          }
        }
      }
    };

    // Push all the payloads for different steps
    await handlePush(
      `${API_BASE_URL}/task-initiate`,
      taskStartPayloads,
      "otx-task-start",
      "taskStart"
    );
    await handlePush(
      `${API_BASE_URL}/add-team-attendance`,
      attendancePayloads,
      "otx-teamAttendance",
      "attendance"
    );
    await handlePush(
      `${API_BASE_URL}/task-initiate`,
      startTravelPayloads,
      "otx-Start-TrackTime",
      "startTravel"
    );
    await handlePush(
      `${API_BASE_URL}/task-initiate`,
      endTravelPayloads,
      "otx-End-TrackTime",
      "endTravel"
    );
    await handlePush(
      `${API_BASE_URL}/add-pest-found-details`,
      pestActivityPayloads,
      "otx-pestData",
      "pestActivity"
    );
    await handlePush(
      `${API_BASE_URL}/insert-chemicals-used-for-pest`,
      chemsUsedPayloads,
      "otx-chem-used",
      "chemsUsed"
    );
    await handlePush(
      `${API_BASE_URL}add-pest-recommendation`,
      recommendationsPayloads,
      "otx-pest-recommendation",
      "recommendations"
    );
    await handlePush(
      `${API_BASE_URL}/add-work-done-detail`,
      workDonePayloads,
      "otx-work-done",
      "workDone"
    );
    await handlePush(
      `${API_BASE_URL}/add-followup-feedback-details`,
      feedbackFollowupPayloads,
      "otx-followup-feedback",
      "feedbackFollowup"
    );
    await handlePush(
      `${API_BASE_URL}/visit-time-intervals`,
      pauseResumePayloads,
      "otx-task-PauseResume",
      "PauseResume"
    );

    await storage.remove("otx-tasks-executed");

    if (failedTransactions.length > 0) {
      console.error(
        "The following transactions failed and need to be reattempted:",
        failedTransactions
      );
    } else {
      await storage.clear(); // Clear all remaining data in storage if no failures
    }
  }
};

// export const syncPush = async () => {
//   let storage = new Storage();
//   await storage.create();

//   let otxTasksExecuted = await storage.get("otx-tasks-executed");

//   if (!otxTasksExecuted || otxTasksExecuted.length == 0) {
//     return 0;
//   } else if (otxTasksExecuted.length > 0) {
//     let taskStartPayloads = [];
//     let attendancePayloads = [];
//     // Add more arrays for other steps
//     let startTravelPayloads = [];
//     let endTravelPayloads = [];
//     let pestActivityPayloads = [];
//     let chemsUsedPayloads = [];
//     let recommendationsPayloads = [];
//     let workDonePayloads = [];
//     let feedbackFollowupPayloads = [];

//     let pauseResumePayloads = [];

//     for (let index = 0; index < otxTasksExecuted.length; index++) {
//       const taskId = otxTasksExecuted[index];
//       const otxSeqArray = await storage.get("otx-seq-" + taskId);

//       for (let seqIndex = 0; seqIndex < otxSeqArray.length; seqIndex++) {
//         const otx = otxSeqArray[seqIndex];

//         switch (otx) {
//           case task_tx_steps.taskStart:
//             const taskStartPayload = await storage.get("otx-task-start-" + taskId);
//             Array.isArray(taskStartPayload)
//               ? taskStartPayloads.push(...taskStartPayload)
//               : taskStartPayloads.push(taskStartPayload);
//             break;

//           case task_tx_steps.attendance:
//             const attendancePayload = await storage.get("otx-teamAttendance-" + taskId);
//             Array.isArray(attendancePayload)
//               ? attendancePayloads.push(...attendancePayload)
//               : attendancePayloads.push(attendancePayload);
//             break;

//           // Repeat similar cases for other task steps:
//           case task_tx_steps.startTravel:
//             const startTravelPayload = await storage.get("otx-Start-TrackTime-" + taskId);
//             Array.isArray(startTravelPayload)
//               ? startTravelPayloads.push(...startTravelPayload)
//               : startTravelPayloads.push(startTravelPayload);
//             break;

//           case task_tx_steps.endTravel:
//             const endTravelPayload = await storage.get("otx-End-TrackTime-" + taskId);
//             Array.isArray(endTravelPayload)
//               ? endTravelPayloads.push(...endTravelPayload)
//               : endTravelPayloads.push(endTravelPayload);
//             break;

//           case task_tx_steps.pestActivity:
//             const pestActivityPayload = await storage.get("otx-pestData-" + taskId);
//             Array.isArray(pestActivityPayload)
//               ? pestActivityPayloads.push(...pestActivityPayload)
//               : pestActivityPayloads.push(pestActivityPayload);
//             break;

//           case task_tx_steps.chemsUsed:
//             const chemsUsedPayload = await storage.get("otx-chem-used-" + taskId);
//             Array.isArray(chemsUsedPayload)
//               ? chemsUsedPayloads.push(...chemsUsedPayload)
//               : chemsUsedPayloads.push(chemsUsedPayload);
//             break;

//           case task_tx_steps.recommendations:
//             const recommendationsPayload = await storage.get("otx-pest-recommendation-" + taskId);
//             Array.isArray(recommendationsPayload)
//               ? recommendationsPayloads.push(...recommendationsPayload)
//               : recommendationsPayloads.push(recommendationsPayload);
//             break;

//           case task_tx_steps.workDone:
//             const workDonePayload = await storage.get("otx-work-done-" + taskId);
//             Array.isArray(workDonePayload)
//               ? workDonePayloads.push(...workDonePayload)
//               : workDonePayloads.push(workDonePayload);
//             break;

//           case task_tx_steps.feedbackFollowup:
//             const feedbackFollowupPayload = await storage.get("otx-followup-feedback-" + taskId);
//             Array.isArray(feedbackFollowupPayload)
//               ? feedbackFollowupPayloads.push(...feedbackFollowupPayload)
//               : feedbackFollowupPayloads.push(feedbackFollowupPayload);
//             break;

//           case task_tx_steps.PauseResume:
//             const pauseResumePayload = await storage.get("otx-task-PauseResume-" + taskId);
//             Array.isArray(pauseResumePayload)
//               ? pauseResumePayloads.push(...pauseResumePayload)
//               : pauseResumePayloads.push(pauseResumePayload);
//             break;
//         }
//       }

//       // Remove sequence data for this task
//       await storage.remove("otx-seq-" + taskId);
//     }

//     // Define a function to handle each push and retry logic
//     const handlePush = async (url: string, payloads: any[], keyPrefix: string) => {
//       if (payloads.length > 0) {
//         let pushStatus = await httpPostRequest(url, payloads);

//         if (pushStatus) {
//           for (let index = 0; index < otxTasksExecuted.length; index++) {
//             const taskId = otxTasksExecuted[index];
//             await storage.remove(`${keyPrefix}-${taskId}`);
//           }
//         } else {
//           for (let retry = 0; retry < 3; retry++) {
//             pushStatus = await httpPostRequest(url, payloads);
//             if (pushStatus) {
//               for (let index = 0; index < otxTasksExecuted.length; index++) {
//                 const taskId = otxTasksExecuted[index];
//                 await storage.remove(`${keyPrefix}-${taskId}`);
//               }
//               break;
//             }
//           }
//           if (!pushStatus) {
//             console.log(`Failed to push ${keyPrefix} data after 3 attempts.`);
//           }
//         }
//       }
//     };

//     // Push all the payloads for different steps
//     await handlePush(`${API_BASE_URL}/task-initiate`, taskStartPayloads, "otx-task-start");
//     await handlePush(`${API_BASE_URL}/add-team-attendance`, attendancePayloads, "otx-teamAttendance");
//     await handlePush(`${API_BASE_URL}/task-initiate`, startTravelPayloads, "otx-Start-TrackTime");
//     await handlePush(`${API_BASE_URL}/task-initiate`, endTravelPayloads, "otx-End-TrackTime");
//     await handlePush(`${API_BASE_URL}/add-pest-found-details`, pestActivityPayloads, "otx-pestData");
//     await handlePush(`${API_BASE_URL}/insert-chemicals-used-for-pest`, chemsUsedPayloads, "otx-chem-used");
//     await handlePush(`${API_BASE_URL}add-pest-recommendation`, recommendationsPayloads, "otx-pest-recommendation");
//     await handlePush(`${API_BASE_URL}/add-work-done-detail`, workDonePayloads, "otx-work-done");
//     await handlePush(`${API_BASE_URL}/add-followup-feedback-details`, feedbackFollowupPayloads, "otx-followup-feedback");
//     await handlePush(`${API_BASE_URL}/visit-time-intervals`, pauseResumePayloads, "otx-task-PauseResume");

//     await storage.remove("otx-tasks-executed");
//     await storage.clear();  // Clear all remaining data in storage
//   }
// };
