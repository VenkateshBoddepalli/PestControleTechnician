import React, { useState, useEffect } from "react";

const NetworkCheckTime: React.FC = () => {
  const [networkCheckTime, setNetworkcheckTime] = useState<string>(
    localStorage.getItem("firstLoginTime") || "00:00:00"
  );

  useEffect(() => {
    const firstLoginTime = localStorage.getItem("firstLoginTime");
    const currentDate = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Dubai' });
    const currentTime = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Dubai',
    }).format(new Date());
    console.log("currentTime", currentTime);

    if (!firstLoginTime || firstLoginTime.split(" ")[0] !== currentDate) {
      const newFirstLoginTime = `${currentDate} ${currentTime}`;
      localStorage.setItem("firstLoginTime", newFirstLoginTime);
      setNetworkcheckTime(currentTime);
    } else {
      setNetworkcheckTime(firstLoginTime.split(" ")[1]); // Display only the time part of firstlogintime
    }
  }, []);

  return (
    <div>
      <h5>Network Check In Time</h5>
      <h5>{networkCheckTime}</h5>
    </div>
  );
};

export default NetworkCheckTime;
