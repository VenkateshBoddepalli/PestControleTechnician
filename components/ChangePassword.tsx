import React, { useState, useEffect } from "react";
import "../components/CustomAlert";
import { toast } from "react-toastify";
import { useHistory } from "react-router";
import '../components/ChangePasswordForm.css'
import { changePasswordApi } from "../data/apidata/authApi/dataApi";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importing eye icons



interface ChangePasswordFormProps {
  onClose: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false); // State to toggle current password visibility
  const [showNewPassword, setShowNewPassword] = useState(false); // State to toggle new password visibility
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false); // State to toggle confirm password visibility
  const history = useHistory();

  useEffect(() => {
    const fetchUserData = () => {
      try {
        const userDataString = localStorage.getItem("userData");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUserData(userData);
        } else {
          throw new Error("User Data is not available");
        }
      } catch (error: any) {
        console.error(error.message);
        setGeneralError("User data is not available.");
      }
    };

    fetchUserData();
  }, []);
  // Function to clear errors on input change
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, clearError: React.Dispatch<React.SetStateAction<string | null>>, value: string) => {
    setter(value);
    clearError(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPasswordError(null);
    setNewPasswordError(null);
    setConfirmNewPasswordError(null);
    setGeneralError(null);
    setSuccess(null);

    let hasError = false;

    if (!currentPassword) {
      setCurrentPasswordError("Please enter the current password.");
      hasError = true;
    }

    if (!newPassword) {
      setNewPasswordError("Please enter the new password.");
      hasError = true;
    } else if (newPassword.length < 8) {
      setNewPasswordError("The new password must be at least 8 characters.");
      hasError = true;
    }

    if (!confirmNewPassword) {
      setConfirmNewPasswordError("Please enter the confirm new password.");
      hasError = true;
    } else if (confirmNewPassword.length < 8) {
      setConfirmNewPasswordError("The confirm password must be at least 8 characters.");
      hasError = true;
    }

    if (!hasError && newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      setConfirmNewPasswordError("New password and confirm new password must match.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    if (!userData) {
      setGeneralError("User data is not available.");
      return;
    }

    setIsLoading(true);

    try {
      const requestBody =
      {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmNewPassword,

      }


      const responseData = await changePasswordApi(requestBody);

      if (responseData.data) {
        if (responseData.success) {
          // toast.success(responseData.message);
          console.log("Password changed successfully!");
          history.push("/login");
          // Delay for 2 seconds
        } else {
          toast.error(responseData.message);
          setGeneralError(responseData.message);
        }

      } else {
        const errorMessage = await responseData.text();
        toast.error(`Failed to change password: ${errorMessage}`);
        setGeneralError(`Failed to change password: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error:", error);
      // toast.error("An unexpected error occurred. Please try again later.");
      // setGeneralError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-password-form-container">
      <form onSubmit={handleChangePassword} className="change-password-form">
        <label>
          Current Password:
          <div className="password-input-container">
            <input
              // type="password" 
              type={showCurrentPassword ? "text" : "password"} // Toggle between text and password
              className="custom-form-control"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => handleInputChange(setCurrentPassword, setCurrentPasswordError, e.target.value)}

            />
            <span
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="eye-icon"
            >
              {showCurrentPassword ? <FaEye /> : <FaEyeSlash />}
            </span>

          </div>
          {currentPasswordError && <p className="error-message">{currentPasswordError}</p>}
        </label>
        <label>
          New Password:
          <div className="password-input-container">
            <input
              // type="password"
              type={showNewPassword ? "text" : "password"}
              className="custom-form-control"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => handleInputChange(setNewPassword, setNewPasswordError, e.target.value)}
            />
            <span
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="eye-icon"
            >
              {showNewPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
          {newPasswordError && <p className="error-message">{newPasswordError}</p>}
        </label>
        <label>
          Confirm New Password:
          <div className="password-input-container">
            <input
              // type="password"
              type={showConfirmNewPassword ? "text" : "password"}
              className="custom-form-control"
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => handleInputChange(setConfirmNewPassword, setConfirmNewPasswordError, e.target.value)}
            />
            <span
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              className="eye-icon"
            >
              {showConfirmNewPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
          {confirmNewPasswordError && <p className="error-message">{confirmNewPasswordError}</p>}
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit"}
        </button>
        {generalError && <p className="error-message">{generalError}</p>}
        {success && <p className="success-message">{success}</p>}
      </form>
    </div>
  );
};

export default ChangePasswordForm;
