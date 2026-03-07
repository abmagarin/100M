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
  const [userTable, setUserTable] = useState<number>(0);

  // NUEVO: Este es tu "pase de control"
  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);

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
        // Si el usuario cierra sesión, reseteamos el control para la próxima vez
        setHasCheckedRedirect(false);
      }
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // 1. Si todavía está cargando o YA hemos hecho la redirección inicial, NO HACER NADA
    if (initializing || hasCheckedRedirect) return;

    const inAuthGroup =
      segments[0] === "(tabs)" ||
      segments[0] === "main" ||
      segments[0] === "friends" ||
      segments[0] === "tableLayout";

    if (user) {
      // 2. Solo ejecutamos esto UNA VEZ al inicio o tras el login
      if (userTable > 0) {
        router.replace("/tableLayout");
      } else {
        router.replace("/main");
      }
      // 3. Marcamos que el control inicial ya se ha hecho
      setHasCheckedRedirect(true);
    } else if (!user && inAuthGroup) {
      // Si no hay usuario y está intentando entrar en zona protegida
      router.replace("/login");
      setHasCheckedRedirect(true);
    }
  }, [user, userTable, initializing, hasCheckedRedirect]); // Quitamos 'segments' de aquí para que no vigile cada movimiento

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
