import { useEffect, useState } from "react";

const useUserData = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userDataString = localStorage.getItem("userData");
    if (!userDataString) {
      console.error("User data is not available");
      return;
    }
    setUserData(JSON.parse(userDataString));
  }, []);

  return userData;
};

export default useUserData;
