// taskProgress.ts
interface TaskProgress {
    serviceStart: number; // pending, in-progress, done
    travelStart: number;
    travelEnd: number;
    teamAttendance: number;
    pestActivityDiscov: number;
    recommGiven: number;
    chemicalsUsed: number;
    workDoneDetails: number;
    feedBack: number;
    endForm: number;
}

export default TaskProgress;

enum ProgressStatus {
    pending = -1,
    inprogress = 0,
    done = 1
}

export { ProgressStatus };

const PRG_STORAGE_KEY = "taskProgressStatus";

export const initTaskProgress = (): TaskProgress => {
    let tProgress: TaskProgress = {
        serviceStart: ProgressStatus.pending,
        travelStart: ProgressStatus.pending,
        travelEnd: ProgressStatus.pending,
        teamAttendance: ProgressStatus.pending,
        pestActivityDiscov: ProgressStatus.pending,
        recommGiven: ProgressStatus.pending,
        chemicalsUsed: ProgressStatus.pending,
        workDoneDetails: ProgressStatus.pending,
        feedBack: ProgressStatus.pending,
        endForm: ProgressStatus.pending
    };
    return tProgress;
}

export const getCurrentTaskStatus = (taskId: string): TaskProgress => {
    let taskProgress: TaskProgress = initTaskProgress()
    let taskProgressStr = localStorage.getItem(PRG_STORAGE_KEY);
    if (taskProgressStr) {
        taskProgress = JSON.parse(taskProgressStr);
    }
    return taskProgress;
}

export const setStartStatus = (taskId: string): TaskProgress => {
    const progressStatus: TaskProgress = initTaskProgress();
    progressStatus.serviceStart = ProgressStatus.done;
    localStorage.setItem(PRG_STORAGE_KEY, JSON.stringify(progressStatus));
    return progressStatus;
}

export const saveTaskProgress = (taskProgress: TaskProgress): TaskProgress => {
    localStorage.setItem(PRG_STORAGE_KEY, JSON.stringify(taskProgress));
    return taskProgress;
}

export const updateTaskStatus = (taskId: string, key: keyof TaskProgress, value: ProgressStatus) => {
    const progressStatus: TaskProgress | null = getCurrentTaskStatus(taskId);
    if (progressStatus) {
        progressStatus[key] = value;
        localStorage.setItem(PRG_STORAGE_KEY, JSON.stringify(progressStatus));
    }
}



// Function to check if all tasks are completed
export const updateTaskProgressStatusFromExecDetails = (taskId: string, taskDetails: any) => {
    console.log ("calculating prgress obj for v2 data = ", taskDetails)
    let taskProgress: TaskProgress = initTaskProgress()// getCurrentTaskStatus(taskId);

    if (taskProgress && taskDetails) {
        // Task Init from task_initiation Array 
        if (taskDetails.task_initiation && taskDetails.task_initiation.length > 0) {
            taskDetails.task_initiation.map((item: any, index: number) => {
                if (item.log_type == "Service Request Start") {
                    taskProgress.travelStart = ProgressStatus.done;
                }
            })
        }
        // Attendance
        if (taskDetails.team && taskDetails.team.length > 0) {
            taskProgress.teamAttendance = ProgressStatus.done
        }

        // Start Travel 
        if (taskDetails.task_initiation && taskDetails.task_initiation.length > 0) {
            taskDetails.task_initiation.map((item: any, index: number) => {
                if (item.log_type == "Track Travel Time Start") {
                    taskProgress.travelStart = ProgressStatus.done;
                }
            })
        }

        // End Travel
        if (taskDetails.task_initiation && taskDetails.task_initiation.length > 0) {
            taskDetails.task_initiation.map((item: any, index: number) => {
                if (item.log_type == "Track Travel Time End") {
                    taskProgress.travelEnd = ProgressStatus.done;
                }
            })
        }

        // Pest Activity 
        if (taskDetails.pests_found && taskDetails.pests_found.length > 0) {
            taskProgress.pestActivityDiscov = ProgressStatus.done;
            let rt = taskDetails.pests_found.filter((pest: any) => pest.is_chemical_added === '' || pest.is_chemical_added == null);
            if(rt.length > 0){
                taskProgress.chemicalsUsed = ProgressStatus.inprogress;
            }else{
                taskProgress.chemicalsUsed = ProgressStatus.done;
            }
        }

        // Chemicals Used 
        // if (taskDetails.materials_used) {
        //     taskProgress.chemicalsUsed = ProgressStatus.done;
        //     let rt = taskDetails.pests_found.filter((pest: any) => pest.is_chemical_added === '');
        //     if(rt.length > 0){
        //         taskProgress.chemicalsUsed = ProgressStatus.inprogress;
        //     }
        // }
        // Recommendations 
        if (taskDetails.pests_recommendations && taskDetails.pests_recommendations.length > 0) {
            taskProgress.recommGiven = ProgressStatus.done
        }
        console.log(taskProgress.recommGiven)

        

        // Work done 
        if (taskDetails.work_done_details && taskDetails.work_done_details.length > 0) {
            taskProgress.workDoneDetails = ProgressStatus.done
        }
        console.log(taskProgress.workDoneDetails)
        //Feedback and Follow up 
        if (taskDetails.feedback_details && taskDetails.feedback_details.length > 0) {
            taskProgress.feedBack = ProgressStatus.done
            taskProgress.endForm = ProgressStatus.done
        }
        // End Form 
        // Not required 

    }

    console.log ("&**&(&(&(&*(&( Task progress from exec v2 ==", taskProgress)
    return taskProgress
}


