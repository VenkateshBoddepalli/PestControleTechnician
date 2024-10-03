import { toast } from "react-toastify";

let isUnauthorizedToastDisplayed = false;

const originalFetch = window.fetch;

window.fetch = async (input, init) => {
  let showUnauthorizedToast = false;

  try {
    const response = await originalFetch(input, init);

    if (response.status === 401) {
      if (
        !isUnauthorizedToastDisplayed &&
        window.location.pathname !== "/login"
      ) {
        showUnauthorizedToast = true;
        isUnauthorizedToastDisplayed = true; // Set flag to indicate that the toast has been displayed
      }
      // localStorage.clear(); // Clear session storage
      // Remove User Data
      localStorage.removeItem("userData");
      if (window.location.pathname !== "/login") {
        setTimeout(() => {
          window.location.href = "/login";
          isUnauthorizedToastDisplayed = false; // Reset the flag when the page is being redirected
        }, 2500); // 2.5 seconds delay
      }
    }

    if (showUnauthorizedToast) {
      // Show a toast notification only if the current response leads to unauthorized status
      toast.error(
        "Your Session is not valid anymore. Please login again to continue."
      );
    }

    return response;
  } catch (error: any) {
    // Handle network errors, request timeouts, etc.
    console.error("Error in fetch request:", error);
    // toast.error("Server not responding. Please try again later.");

    // // Show a toast notification for network errors
    // if (error.message === "Failed to fetch") {
    //   toast.error("No internet connection. Please check your network.");
    // } else {
    //   toast.error(
    //     "An error occurred while processing your request. Please try again later."
    //   );
    // }

    throw error; // Re-throw the error to propagate it further if needed
  }
};
