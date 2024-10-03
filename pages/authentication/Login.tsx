import React, { useState, useEffect } from "react";
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  IonRouterLink,
  IonBadge,
  IonIcon,
  IonProgressBar,
} from "@ionic/react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { loginApi, userCheckIn, userCheckIns } from "../../data/apidata/authApi/dataApi";
import "react-toastify/dist/ReactToastify.css";
import { registerDevice } from "../../utils/pushNotiications";
import { eye, eyeOff } from "ionicons/icons"; // Import icons


const Login: React.FC = () => {
  const logo = "assets/images/psd-logo.svg";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [isError, setIsError] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const history = useHistory();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");
    const storedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (storedRememberMe && storedUsername && storedPassword) {
      setUsername(storedUsername);
      setPassword(storedPassword);
      setRememberMe(storedRememberMe);
    }

    // Register Push Handlers
    // registerPushHandlers();
    // Register the Device Token
    registerDevice();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();

    if (isSubmitting) return;
    setLoginMessage("");
    setIsSubmitting(true);

    // Validation
    if (!username) {
      setUsernameError("Please enter username");
    }
    if (!password) {
      setPasswordError("Please enter password");
    }

    if (username && password) {
      try {
        const { response, data } = await loginApi(username, password); // Call loginApi function
        console.log(response);
        console.log(data.data[0]);

        const userData = data.data[0];
        if (response.ok) {
          if (userData.last_action === "1") {
            try {
              await userCheckIns(userData);
              localStorage.setItem("userData", JSON.stringify(userData));
            history.push("/dashboard");
           
            } catch (error) {
              console.error("Error during check-in:", error);
            }
        
            
          } else {
            localStorage.setItem("userData", JSON.stringify(data.data[0]));
            console.log(data);
            history.push("/home");
          }
        } else {
          if (data.error === "username") {
            setLoginMessage("Username is incorrect.");
          } else if (data.error === "password") {
            setLoginMessage("Password is incorrect.");
          } else {
            setLoginMessage(data.message);
          }
          toast.error(data.message, { autoClose: 3000 });
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsSubmitting(false);
        setLoading(false);
      }
      setTimeout(() => {
        setLoginMessage("");
      }, 2000);
    } else {
      setIsError(true);
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem("username", username);
      localStorage.setItem("password", password);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("username");
      localStorage.removeItem("password");
      localStorage.removeItem("rememberMe");
    }
  }, [rememberMe, username, password]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleUsernameChange = (e: any) => {
    setUsername(e.detail.value!);
    if (e.detail.value) {
      setUsernameError("");
    }
  };

  const handlePasswordChange = (e: any) => {
    setPassword(e.detail.value!);
    if (e.detail.value) {
      setPasswordError("");
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-login">
        {loading && <IonProgressBar type="indeterminate" color="success" />}
        <div className="loginwrapp">
          <IonImg
            className="loginLogo"
            src={logo}
            alt="logo"
            style={{ height: "100px" }}
          ></IonImg>
          <IonText className="loginHeading">
            <h1>Login</h1>
            <p>Enter Email / Employee ID and Password</p>
          </IonText>
          <form onSubmit={handleLogin}>
            <IonLabel className="ion-label">Email / Employee ID</IonLabel>
            <IonItem lines="none">
              <IonInput
                placeholder="Email"
                value={username}
                onIonInput={handleUsernameChange}
               
              />
            </IonItem>
            {usernameError && <IonText color="danger">{usernameError}</IonText>}

            <IonLabel className="ion-label">Password</IonLabel>
            <IonItem lines="none">
              <IonInput
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onIonInput={handlePasswordChange}
                style={{ color: "black" }}
              />
              <IonIcon
                slot="end"
                icon={showPassword ? eye : eyeOff}
                onClick={togglePasswordVisibility}
                style={{ cursor: "pointer", marginRight: "10px" }}
              />
            </IonItem>
            {passwordError && <IonText color="danger">{passwordError}</IonText>}

            <IonText className="ion-Remember">
              <IonCheckbox
                className="ionCheckbox ion-float-left"
                labelPlacement="end"
                checked={rememberMe}
                onIonChange={(e) => setRememberMe(e.detail.checked)}
              >
                Remember Me
              </IonCheckbox>
            </IonText>
            <IonButton
              type="submit"
              className="ion-button"
              slot="primary"
              fill="solid"
              expand="block"
              disabled={isSubmitting}
            >
              Login
            </IonButton>
          </form>
          {loginMessage && (
            <IonText
              color={
                loginMessage === "Logged in successfully" ? "success" : "danger"
              }
            >
              {loginMessage}
            </IonText>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
