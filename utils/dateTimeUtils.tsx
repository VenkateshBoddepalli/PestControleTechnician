
export const getDate = () => {
    // Get the current date and time
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(
        2,
        "0"
    )} ${String(currentDate.getHours()).padStart(2, "0")}:${String(
        currentDate.getMinutes()
    ).padStart(2, "0")}:${String(currentDate.getSeconds()).padStart(2, "0")}`;
    return formattedDate;
}

export const getJustDate = () => {
    // Get the current date and time
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(
        2,
        "0"
    )}`;
    return formattedDate;
}

export const getTime = () => { }
export const getDateTime = (

) => {
    // Get the current date and time
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(
        2,
        "0"
    )} ${String(currentDate.getHours()).padStart(2, "0")}:${String(
        currentDate.getMinutes()
    ).padStart(2, "0")}:${String(currentDate.getSeconds()).padStart(2, "0")}`;
    console.log("Formattted current Date time ", formattedDate)
    return formattedDate;
}

export const formatDateTime = (dateStr: string) => {
    const currentDate = new Date(dateStr);
    const formattedDate = ` ${String(
        currentDate.getMonth() + 1
    ).padStart(2, "0")}  ${String(currentDate.getDate()).padStart(
        2,
        "0"
    )} ${currentDate.getFullYear()} ${String(currentDate.getHours()).padStart(2, "0")}:${String(
        currentDate.getMinutes()
    ).padStart(2, "0")}:${String(currentDate.getSeconds()).padStart(2, "0")}`;
    console.log("Formattted current Date time ", formattedDate)
    console.log("From Date : ", dateStr, "; Formatted Date Str :", formattedDate)
    return formattedDate;
}

export const formatDateinMMDDYYYY = (dateStr: string) => {
    const currentDate = new Date(dateStr);
    const formattedDate = `${String(
        currentDate.getMonth() + 1
    ).padStart(2, "0")} ${String(currentDate.getDate()).padStart(
        2,
        "0"
    )} ${currentDate.getFullYear()} ${String(currentDate.getHours()).padStart(2, "0")}:${String(
        currentDate.getMinutes()
    ).padStart(2, "0")} `;
    console.log("Formattted current Date time ", formattedDate)
    console.log("From Date : ", dateStr, "; Formatted Date Str :", formattedDate)
    return formattedDate;
}
// export const formatTime = (time: string | undefined) => {
//     if (!time) return ''; // Handle undefined time gracefully

//     let [hours, minutes] = time.split(':').map(Number);
//     // let ampm = hours >= 12 ? 'PM' : 'AM';
//     // hours = hours ;
//     // hours = hours ? hours : 12; // the hour '0' should be '12'
//     let formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
//     return formattedTime;
//   }
export const formatTime = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
        //   month: "short",
        //   day: "numeric",
        //   year: "numeric",
        hour: 'numeric',
        minute: 'numeric',
        // second: 'numeric',
        hour12: false,
    });

};
export const formatDate = (dateString: any) => {
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













