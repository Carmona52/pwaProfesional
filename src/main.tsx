import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    console.log('Service Worker listo y registrado:', registration);
  });

  navigator.serviceWorker.addEventListener('message', async (event) => {
    if (event.data?.type === 'SYNC_MESSAGES') {
      const messages = event.data.payload;
      console.log('Mensajes recibidos desde SW para sincronizar:', messages);
      await uploadMessagesToFirestore(messages);
    }
  });
}

async function uploadMessagesToFirestore(messages: any[]) {
  try {
    const { collection, addDoc } = await import('firebase/firestore');
    const { db } = await import('./db/firebase');

    for (const msg of messages) {
      await addDoc(collection(db, 'mensajes'), msg);
    }

    console.log('Mensajes sincronizados correctamente con Firestore');
  } catch (error) {
    console.error('Error al sincronizar mensajes con Firestore:', error);
  }
}
