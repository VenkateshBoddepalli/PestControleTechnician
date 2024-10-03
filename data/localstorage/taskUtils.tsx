const ACTIVE_TASK_DATA_KEY = "activeTaskData"
export const getActiveTaskData =  (): any|null => {
    const dataStr = localStorage.getItem( ACTIVE_TASK_DATA_KEY)
    if (dataStr){
        const actTaskData : any = JSON.parse (dataStr);
        return actTaskData
    }
    return null;
}
