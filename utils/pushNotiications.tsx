import {
    PushNotifications,
    PushNotificationSchema,
    Token,
} from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
// import { useHistory } from "react-router";



export const registerPushHandlers = async () => {
    if (Capacitor.getPlatform() !== "web") {
        // const history = useHistory();
        // Handle registration success
        await PushNotifications.addListener("registration", (token: Token) => {
            console.log("PUSH :::: Push registration success, token: " + token.value);
            localStorage.setItem("device_token", token.value);
        });

        // Handle registration error
        await PushNotifications.addListener("registrationError", (error: any) => {
            console.error("PUSH :::: Push registration error: ", error);
        });

        // Handle push notifications received
        await PushNotifications.addListener(
            "pushNotificationReceived",
            (notification: PushNotificationSchema) => {
                console.log("PUSH :::: PUSH Notification receieved . Message = ", notification)
                alert(`Notification received: ${notification.title} - ${notification.body}`);
                // window.location.href = '/notification';
            }
        );


        await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
            console.log('PUSH :::: Push notification action performed', notification.actionId, notification.inputValue);
            window.location.href = '/notification';
        });
    }
}

export const registerDevice = async () => {

    if (Capacitor.getPlatform() !== "web") {
        // Request permission to use push notifications
        PushNotifications.requestPermissions().then((result) => {
            if (result.receive === "granted") {
                // Register with the push notification service
                PushNotifications.register();
            } else {
                // Show some error or fallback
                console.error("PUSH :::: Push notification permission not granted");
            }
        });
    }
}

const getDeliveredNotifications = async () => {
    const notificationList = await PushNotifications.getDeliveredNotifications();
    console.log('PUSH :::: delivered notifications', notificationList);
    // window.location.href = '/notification';
}

// export const triggerPushNotification = () => {
//     if (Capacitor.getPlatform() === "web") {
//         alert("Push notifications are not supported on the web.");
//     } else {
//         // This is just for the purpose of testing push notification reception.
//         const notification: PushNotificationSchema = {
//             title: "New Notification",
//             body: "You have a new notification.",
//             id: "test_notification",
//             data: undefined,
//         };
//         PushNotifications.addListener("pushNotificationReceived", () =>
//             alert(`Notification received: ${notification.title} - ${notification.body}`)
//         );
//     }
// };