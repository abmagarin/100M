import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "@/firebase"; // Importamos db para Firestore

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userTable, setUserTable] = useState<number>(0); // Estado para la mesa

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userRef = doc(db, "usuarios", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserTable(userSnap.data().table || 0);
        }
      } else {
        setUserTable(0);
      }

      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup =
      segments[0] === "(tabs)" ||
      segments[0] === "main" ||
      segments[0] === "friends" ||
      segments[0] === "tableLayout";

    if (user) {
      if (userTable && segments[0] !== "tableLayout") {
        // SI TIENE MESA ACTIVA: Lo mandamos directo a la mesa
        setTimeout(() => router.replace("/tableLayout"), 1);
      } else if (!userTable && !inAuthGroup) {
        // SI NO TIENE MESA: Lo mandamos al menú principal (main)
        setTimeout(() => router.replace("/main"), 1);
      }
    } else if (!user && inAuthGroup) {
      // --- LÓGICA CUANDO NO HAY USUARIO ---
      setTimeout(() => router.replace("/login"), 1);
    }
  }, [user, userTable, initializing, segments]);

  if (initializing) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="main" />
      <Stack.Screen name="friends" />
      <Stack.Screen name="tableLayout" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
