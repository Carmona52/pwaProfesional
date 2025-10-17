import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "./firebase";

export async function getMessagesFromFirestore(contact: string) {
  const q = query(
    collection(db, "mensajes"),
    where("contact", "==", contact),
    orderBy("timestamp", "asc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
