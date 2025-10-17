import { useEffect, useState } from "react";
import SplashScreen from "./components/splashScreen/SplashScreen";
import { addMessage, getMessages } from "./db/db.ts";
import { getMessagesFromFirestore } from './db/getMessages.ts';
import {clearMessages} from './db/db.ts';
import Notifications from './components/notifications/Notifications.tsx';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [selectedContact, setSelectedContact] = useState("Juan Pérez");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const contacts = ["Juan Pérez", "María López", "Carlos Ruiz", "Ana Torres"];

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const stored = await getMessages();
      setMessages(stored);
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function loadMessages() {
      const msgs = await getMessagesFromFirestore(selectedContact);
      setMessages(msgs);
    }
    loadMessages();
  }, [selectedContact]);


  const handleSend = async () => {
    if (input.trim()) {
      const newMsg = { text: input, contact: selectedContact, timestamp: new Date().toISOString() };
      setMessages([...messages, newMsg]);

      await addMessage(input, selectedContact);
      setInput("");

      if (isOffline) {
        // Registrar sincronización en segundo plano
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const reg = await navigator.serviceWorker.ready;
          await reg.sync.register('sync-messages');
          console.log('Sincronización registrada: sync-messages');
        } else {
          console.warn('Background Sync no soportado');
        }
      } else {
        // Enviar directamente a Firestore
        const { addDoc, collection } = await import("firebase/firestore");
        const { db } = await import("./db/firebase.ts");
        await addDoc(collection(db, "mensajes"), newMsg);
        await clearMessages()
      }
    }
  };


  if (isLoading) return <SplashScreen />;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Segoe UI, sans-serif", backgroundColor: "#f1f3f6" }}>
      <Notifications />
      <aside style={{ width: "260px", display: "flex", flexDirection: "column", borderRight: "1px solid #ccc" }}>
        <header style={{ padding: "1rem", fontSize: "1.2rem", fontWeight: "bold", borderBottom: "1px solid #ccc" }}>
          Contactos
        </header>
        <ul style={{ flex: 1, overflowY: "auto", padding: "0.5rem", margin: 0, listStyle: "none" }}>
          {contacts.map((contact) => (
            <li
              key={contact}
              onClick={() => setSelectedContact(contact)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                cursor: "pointer",
                borderRadius: "8px",
                transition: "background 0.2s",
                backgroundColor: selectedContact === contact ? "#e0e7ff" : "transparent",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#2563eb",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  marginRight: "10px",
                }}
              >
                {contact.charAt(0)}
              </div>
              <span style={{ color: "#111" }}>{contact}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#f9fafb" }}>
        <header style={{ padding: "1rem", fontSize: "1.1rem", fontWeight: "bold", backgroundColor: "#2563eb", color: "white" }}>
          {selectedContact}
          {isOffline && <span style={{ marginLeft: "10px", fontSize: "0.9rem", color: "#ffcc00" }}> (Offline)</span>}
          {!isOffline && <span style={{ marginLeft: "10px", fontSize: "0.9rem", color: "#00ff17" }}> (Online)</span>}
        </header>

        <div style={{ flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: "center", color: "#555" }}>No hay mensajes aún</div>
          ) : (
            messages
              .filter((m) => m.contact === selectedContact)
              .map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: "flex-end",
                    backgroundColor: "#2563eb",
                    color: "white",
                    padding: "10px 15px",
                    borderRadius: "16px",
                    maxWidth: "70%",
                    wordWrap: "break-word",
                  }}
                >
                  {msg.text}
                </div>
              ))
          )}
        </div>

        <div style={{ display: "flex", padding: "1rem", borderTop: "1px solid #ccc", backgroundColor: "#fff" }}>
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ flex: 1 }}
          />
          <button onClick={handleSend} style={{ marginLeft: "10px" }}>
            Enviar
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;