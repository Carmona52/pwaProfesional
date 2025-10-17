import { useEffect, useState } from "react";
import { messaging } from "../../db/firebase";
import { getToken, onMessage } from "firebase/messaging";

const VAPID_KEY = import.meta.env.VITE_APIKEY;
const SERVER_KEY = import.meta.env.VITE_MESSAGING;

export default function Notifications() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Escuchar notificaciones en primer plano
    onMessage(messaging, (payload) => {
      console.log("📩 Notificación foreground:", payload);
      const { title, body } = payload.notification || {};
      if (title && body) {
        new Notification(title, {
          body,
          icon: "/icons/Icon256x256.png",
        });
      }
    });
  }, []);

  // Solicitar permiso y mostrar notificación inicial
  const activateNotifications = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      try {
        const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
        setToken(currentToken);

        // Notificación al activar
        new Notification("Aplicación de Mensajería", {
          body: "Esta es una notificación push",
          icon: "/icons/Icon256x256.png",
        });
      } catch (error) {
        console.error("❌ Error al obtener token:", error);
      }
    } else {
      console.warn("Permiso para notificaciones denegado");
    }
  };

  // Enviar notificación mediante FCM
  const sendNotification = async (title: string, body: string) => {


    try {
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
      alert(`Notificación: ${title}`);
    } catch (err) {
      console.error("Error enviando notificación:", err);
      alert("Error enviando notificación, revisa la consola");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "10px",
        margin: "10px",
        maxWidth: "320px",
        maxHeight: "400px",
        overflowY: "auto",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <button
        onClick={activateNotifications}
        style={{
          padding: "8px 16px",
          backgroundColor: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}>
        Activar notificaciones
      </button>

      <button
        onClick={() => sendNotification("Notificación Foreground", "Aparece con la app abierta")}
        style={{
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: "pointer",
        }}>
        Enviar Foreground
      </button>

      <button
        onClick={() => sendNotification("Notificación Background", "Aparece en segundo plano")}
        style={{
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Enviar Background
      </button>

      <div
        style={{
          marginTop: "10px",
          fontSize: "12px",
          wordBreak: "break-word",
        }}>
        <p><strong>Server Key (solo pruebas locales):</strong> {SERVER_KEY}</p>
      </div>
    </div>
  );
}
