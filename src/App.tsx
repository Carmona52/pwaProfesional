import { useEffect, useState } from "react";
import SplashScreen from "./components/splashScreen/SplashScreen";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [selectedContact, setSelectedContact] = useState("Juan Pérez");

  const contacts = ["Juan Pérez", "María López", "Carlos Ruiz", "Ana Torres"];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, input]);
      setInput("");
    }
  };

  if (isLoading) return <SplashScreen />;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Segoe UI, sans-serif", backgroundColor: "#f1f3f6" }}>
      <aside style={{ width: "260px", display: "flex", flexDirection: "column", borderRight: "1px solid #ccc" }}>

        <header style={{ padding: "1rem", fontSize: "1.2rem", fontWeight: "bold", borderBottom: "1px solid #ccc" }}>
          Contactos
        </header>
        <ul style={{ flex: 1, overflowY: "auto", padding: "0.5rem", margin: 0, listStyle: "none" }}>
          {contacts.map((contact) => (

            <li key={contact} onClick={() => setSelectedContact(contact)} style={{ display: "flex", alignItems: "center", padding: "10px", cursor: "pointer", borderRadius: "8px", transition: "background 0.2s", backgroundColor: selectedContact === contact ? "#e0e7ff" : "transparent" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#2563eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", marginRight: "10px" }}>{contact.charAt(0)}</div>
              <span style={{ color: "#111" }}>{contact}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#f9fafb" }}>

        <header style={{ padding: "1rem", fontSize: "1.1rem", fontWeight: "bold", backgroundColor: "#2563eb", color: "white" }}>
          {selectedContact}
        </header>

        <div style={{ flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: "center", color: "#555" }}>No hay mensajes aún</div>
          ) : (
            messages.map((msg, i) => (

              <div key={i} style={{ alignSelf: "flex-end", backgroundColor: "#2563eb", color: "white", padding: "10px 15px", borderRadius: "16px", maxWidth: "70%", wordWrap: "break-word" }}>
                {msg}
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", padding: "1rem", borderTop: "1px solid #ccc", backgroundColor: "#fff" }}>

          <input type="text" placeholder="Escribe un mensaje..." value={input} onChange={(e) => setInput(e.target.value)} />
          <button onClick={handleSend} style={{marginLeft:"10px"}}>
            Enviar
          </button>

        </div>
      </main>
    </div>
  );
}

export default App;