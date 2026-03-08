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

  const [userTable, setUserTable] = useState<string | null>(null);

  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userRef = doc(db, "usuarios", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserTable(userSnap.data().table || null);
        }
      } else {
        setUserTable(null);
        setHasCheckedRedirect(false);
      }
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (initializing || hasCheckedRedirect) return;

    const inAuthGroup =
      segments[0] === "(tabs)" ||
      segments[0] === "main" ||
      segments[0] === "friends" ||
      segments[0] === "tableLayout";

    if (user) {
      if (userTable) {
        router.replace("/tableLayout");
      } else {
        router.replace("/main");
      }
      setHasCheckedRedirect(true);
    } else if (!user && inAuthGroup) {
      router.replace("/login");
      setHasCheckedRedirect(true);
    }
  }, [user, userTable, initializing, hasCheckedRedirect]);

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
