// SQLITE IMPORTS
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { useRef } from "react";

// const { performSQLAction, initialized } = sqliteDbUtility();
export interface Task {
    id: number;
    service_name: string;
    address: string;
    status: string;
    created_on: string;
    service_date: string;
    expiry_date: string;
    preffered_time: string;
    service_status: string;
    visit_type: string;
    reference_number: string;
    priority: string;
    service_id: string;
    last_modified: number;
}

const table_name = "task";
export const insertMultipleTasks = async (taskList: Array<any>) => {
    const db = useRef<SQLiteDBConnection>();
    db.current?.open()
    // Loop through the tasks and insert into the table using createTask 
    await db.current?.beginTransaction()
    taskList.map((task) => createTask(task))
    await db.current?.commitTransaction()
};

export const createTask = async ( taskData: any) => {
    const db = useRef<SQLiteDBConnection>();
    
    console.log("inserting task: ", taskData)
    const { id, service_name, address, status, created_on, service_date,
        expiry_date, preffered_time, service_status, visit_type,
        reference_number, priority, service_id, last_modified } = taskData;

    await db.current?.query(
        "INSERT INTO task (id, service_name, address, status, created_on, service_date, expiry_date, preffered_time, service_status, visit_type, reference_number, priority, service_id, last_modified) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [id, service_name, address, status, created_on, service_date,
            expiry_date, preffered_time, service_status, visit_type,
            reference_number, priority, service_id, last_modified]
    );

    return
};

const tasks: Task[] = [];

export const getTasks = () => tasks;
export const getTask = (id: number) => tasks.find(m => m.id === id);
