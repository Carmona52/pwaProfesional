import { useEffect, useState } from "react";
import { messaging } from "../../db/firebase";
import { getToken, onMessage } from "firebase/messaging";

const VAPID_KEY = import.meta.env.VITE_PUBLIC_VAPID_KEY; // o tu VAPID Key
const SERVER_KEY = "epk9WUeCbevlM4ON2b77VE:APA91bEgQuvX3IuQ49Br20iuHCE1VPQuCr7XWghh81GElb1UlE7dQEyKUM7N7LM4KdmU0InLm-OaRoQ_R3M7lQik2R51Vy_p_IZEmJRUcgZNAtuYBumAd3Q"; // ⚠️ Solo para pruebas locales

export default function Notifications() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Solicitar permiso y obtener token
    const requestPermission = async () => {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        try {
          const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
          console.log("✅ Token FCM:", currentToken);
          setToken(currentToken);
        } catch (error) {
          console.error("❌ Error al obtener token:", error);
        }
      } else {
        console.warn("Permiso para notificaciones denegado");
      }
    };

    requestPermission();

    // Escuchar notificaciones en primer plano
    onMessage(messaging, (payload) => {
      console.log("📩 Notificación foreground:", payload);
      const { title, body } = payload.notification || {};
      if (title && body) {
        new Notification(title, { body, icon: "/icons/Icon256x256.png" });
      }
    });
  }, []);

  // Función para enviar notificación usando la FCM API
  const sendNotification = async (title: string, body: string) => {
    if (!token) return alert("No hay token disponible");

    await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${SERVER_KEY}`,
      },
      body: JSON.stringify({
        to: token,
        notification: { title, body, icon: "/icons/Icon256x256.png" },
        data: { click_action: "FLUTTER_NOTIFICATION_CLICK" },
      }),
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "10px" }}>
      <button
        onClick={() => Notification.requestPermission()}
        style={{ padding: "8px 16px" }}
      >
        Activar notificaciones
      </button>

      <button
        onClick={() => sendNotification("Notificación Foreground", "Aparece con la app abierta")}
        style={{ padding: "8px 16px" }}
      >
        Enviar Foreground
      </button>

      <button
        onClick={() => sendNotification("Notificación Background", "Aparece en segundo plano")}
        style={{ padding: "8px 16px" }}
      >
        Enviar Background
      </button>

      <p>Token: {token}</p>
    </div>
  );
}
