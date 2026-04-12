import Pfp from "@/components/Pfp";
import { usePathname, useRouter } from "expo-router";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebase";

interface Usuario {
  id: string;
  nombre: string;
  codigoUnico: string;
  pfp: number;
  color: number;
}

export default function TableInviteScreen() {
  const router = useRouter();
  const [fullFriends, setFullFriends] = useState<Usuario[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [mostrarToast, setMostrarToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const onBackPress = () => {
      router.push("/main");
      return true;
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => {
      backHandlerSubscription.remove();
    };
  }, []);

  const sendToast = (msg: string) => {
    setToastMsg(msg);
    setMostrarToast(true);
    setTimeout(() => {
      setMostrarToast(false);
    }, 1500);
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, "usuarios", user.uid);

    const unsubscribe = onSnapshot(userDocRef, async (userSnap) => {
      if (userSnap.exists()) {
        const codigos = userSnap.data().friends || [];
        const usuariosRef = collection(db, "usuarios");

        const dataPromesas = codigos.map(async (cod: string) => {
          const q = query(usuariosRef, where("codigoUnico", "==", cod));
          const snap = await getDocs(q);
          return snap.empty
            ? null
            : { id: snap.docs[0].id, ...snap.docs[0].data() };
        });

        const resultados = await Promise.all(dataPromesas);

        setFullFriends(resultados.filter((r): r is Usuario => r !== null));
        console.log("Lista de amigos actualizada en tiempo real");
      }
    });

    return () => unsubscribe();
  }, [auth.currentUser?.uid, pathname]);

  // LÓGICA DE TOGGLE
  const toggleFriend = (id: string) => {
    if (selectedFriends.includes(id)) {
      setSelectedFriends(selectedFriends.filter((item) => item !== id));
    } else {
      setSelectedFriends([...selectedFriends, id]);
    }
  };

  const handleInvite = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error("No se encontró el perfil del usuario");
        return;
      }

      const datosUsuario = userSnap.data();

      const mesaRef = await crearMesa(
        user.uid,
        `Mesa de ${datosUsuario.nombre || "Usuario"}`,
      );

      const promesasInvitaciones = selectedFriends.map((friendId) => {
        return enviarSolicitud(friendId, mesaRef?.id || "");
      });

      await Promise.all(promesasInvitaciones);

      setSelectedFriends([]);

      await updateDoc(userRef, {
        table: mesaRef?.id || "",
      });

      router.push("/tableLayout");
    } catch (error) {
      console.error("Error al enviar invitaciones:", error);
    }
  };

  const crearMesa = async (uid: string, nombre: string) => {
    try {
      const docRef = await addDoc(collection(db, "mesas"), {
        creadorId: uid,
        nombre: nombre,
        usuarios: [uid],
        activo: true,
        fechaCreacion: serverTimestamp(),
        usuariosActivos: [uid],
      });
      console.log("¡Datos guardados en Firestore!");
      return docRef;
    } catch (error) {
      console.error("Error al crear mesa:", error);
    }
  };

  const enviarSolicitud = async (friendUid: string, mesaUid: string) => {
    try {
      const receptorRef = doc(db, "usuarios", friendUid);

      await updateDoc(receptorRef, {
        tableRequests: arrayUnion(mesaUid),
      });
    } catch (error) {
      console.error(`Error invitando a ${friendUid}:`, error);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity
          onPress={() => router.push("/main")}
          activeOpacity={0.8}
        >
          <Image
            source={require("../../assets/images/100logo.png")}
            style={styles.logo}
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          INVITAR AMIGOS ({selectedFriends.length})
        </Text>

        <View style={styles.gridFriends}>
          {fullFriends.map((friend) => {
            const isSelected = selectedFriends.includes(friend.id);
            return (
              <TouchableOpacity
                key={friend.id}
                onPress={() => toggleFriend(friend.id)}
                activeOpacity={0.8}
                style={[
                  styles.friendCard,
                  isSelected && styles.friendCardSelected,
                ]}
              >
                <Pfp pfp={friend.pfp} color={friend.color} />
                <Text
                  numberOfLines={1}
                  style={[styles.friendName, isSelected && { color: "#fff" }]}
                >
                  {friend.nombre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {selectedFriends.length > 0 && (
        <TouchableOpacity
          style={styles.btnConfirm}
          onPress={handleInvite}
          activeOpacity={0.8}
        >
          <Text style={styles.btnConfirmText}>
            INVITE ({selectedFriends.length})
          </Text>
        </TouchableOpacity>
      )}
      {mostrarToast && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: "#f5eee2" },
  contentContainer: { alignItems: "center", padding: 15, paddingTop: 60 },
  logo: { width: 120, height: 80, resizeMode: "contain", marginBottom: 20 },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#888",
    textTransform: "uppercase",
    marginBottom: 20,
  },

  gridFriends: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
  },

  friendCard: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    marginHorizontal: "1.6%", // Pequeño margen para centrar el grid
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  friendCardSelected: {
    backgroundColor: "#cb464a",
    transform: [{ scale: 1.05 }],
  },

  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarText: { color: "white", fontWeight: "800", fontSize: 18 },
  friendName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#474747",
    textAlign: "center",
  },

  btnConfirm: {
    position: "absolute",
    bottom: 30,
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignSelf: "center",
    elevation: 5,
  },
  btnConfirmText: { color: "white", fontWeight: "800", fontSize: 16 },
  toastContainer: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "#333",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  toastText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});
