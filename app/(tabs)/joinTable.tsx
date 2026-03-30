import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebase";

interface TableInvitation {
  mesaId: string;
  nombreMesa: string;
  nombreAnfitrion: string;
}

export default function FriendsScreen() {
  const router = useRouter();

  const [tableInput, setTableInput] = useState("");
  const [fullTableRequests, setFullTableRequests] = useState<TableInvitation[]>(
    [],
  );
  const [mostrarToast, setMostrarToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const pathname = usePathname();

  const sendToast = (msg: string) => {
    setToastMsg(msg);
    setMostrarToast(true);
    setTimeout(() => setMostrarToast(false), 2000);
  };

  // --- ESCUCHADOR DE INVITACIONES (REAL-TIME) ---
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, "usuarios", user.uid);

    const unsubscribe = onSnapshot(userDocRef, async (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        const tRequests = userData.tableRequests || [];

        const promesasMesas = tRequests.map(async (mesaUid: string) => {
          try {
            const mesaSnap = await getDoc(doc(db, "mesas", mesaUid));
            if (mesaSnap.exists() && mesaSnap.data().activo) {
              const mesaData = mesaSnap.data();
              const anfitrionSnap = await getDoc(
                doc(db, "usuarios", mesaData.creadorId),
              );
              return {
                mesaId: mesaSnap.id,
                nombreMesa: mesaData.nombre || "Mesa sin nombre",
                nombreAnfitrion: anfitrionSnap.exists()
                  ? anfitrionSnap.data().nombre
                  : "Usuario",
              };
            } else if (mesaSnap.exists() && !mesaSnap.data().activo) {
              await updateDoc(userDocRef, {
                tableRequests: arrayRemove(mesaUid),
              });
            }
          } catch (e) {
            console.error(e);
          }
          return null;
        });

        const res = await Promise.all(promesasMesas);
        setFullTableRequests(
          res.filter((m): m is TableInvitation => m !== null),
        );
      }
    });

    return () => unsubscribe();
  }, [auth.currentUser?.uid, pathname]);

  // --- LÓGICA PARA UNIRSE (ACEPTAR O MANUAL) ---
  const handleJoinTable = async (mesaId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "usuarios", user.uid);
      const mesaRef = doc(db, "mesas", mesaId);

      // 1. Guardamos el UID de la mesa en nuestro campo 'table'
      // 2. Limpiamos esa invitación de nuestro array 'tableRequests'
      await updateDoc(userRef, {
        table: mesaId,
        tableRequests: arrayRemove(mesaId),
      });

      await updateDoc(mesaRef, {
        usuariosActivos: arrayUnion(user.uid),
        usuarios: arrayUnion(user.uid),
      });

      sendToast("¡Te has unido a la mesa!");

      // Pequeño delay para que el usuario vea el aviso y luego salte a la mesa
      setTimeout(() => {
        router.navigate("/tableLayout");
      }, 500);
    } catch (error) {
      console.error(error);
      sendToast("Error al conectar con la mesa");
    }
  };

  const handleDeclineTable = async (mesaId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      await updateDoc(doc(db, "usuarios", user.uid), {
        tableRequests: arrayRemove(mesaId),
      });
      sendToast("Invitación eliminada");
    } catch (error) {
      console.error(error);
    }
  };

  const handleManualJoin = async () => {
    const cleanInput = tableInput.trim();
    if (cleanInput.length < 10) {
      // Los UIDs de Firebase suelen ser largos
      sendToast("ID de mesa inválido");
      return;
    }

    try {
      const mesaSnap = await getDoc(doc(db, "mesas", cleanInput));

      if (mesaSnap.exists() && mesaSnap.data().activo) {
        handleJoinTable(mesaSnap.id);
      } else {
        sendToast("Mesa no encontrada o cerrada");
      }
      setTableInput("");
    } catch (error) {
      sendToast("Error al buscar la mesa");
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity onPress={() => router.push("/main")}>
          <Image
            source={require("../../assets/images/100logo.png")}
            style={styles.logo}
          />
        </TouchableOpacity>

        {/* INPUT MANUAL */}
        <View style={styles.form}>
          <Text style={styles.title}>Join with Table ID</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.innerInput}
              placeholder="Paste Table ID here..."
              value={tableInput}
              onChangeText={setTableInput}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.sendIconButton}
              onPress={handleManualJoin}
            >
              <Ionicons name="log-in" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* LISTA DE INVITACIONES */}
        <View style={styles.requestsSection}>
          <Text style={styles.title}>Pending Invitations</Text>

          {fullTableRequests.length === 0 ? (
            <Text style={styles.noRequests}>No invitations yet</Text>
          ) : (
            fullTableRequests.map((req) => (
              <View key={req.mesaId} style={styles.card}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Ionicons name="restaurant" size={20} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nameText} numberOfLines={1}>
                      {req.nombreMesa}
                    </Text>
                    <Text style={styles.subText}>By {req.nombreAnfitrion}</Text>
                  </View>
                </View>

                <View style={styles.actionGroup}>
                  <TouchableOpacity
                    style={[styles.miniBtn, styles.btnNo]}
                    onPress={() => handleDeclineTable(req.mesaId)}
                  >
                    <Ionicons name="close" size={20} color="#cb464a" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.miniBtn, styles.btnYes]}
                    onPress={() => handleJoinTable(req.mesaId)}
                  >
                    <Ionicons name="checkmark" size={20} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {mostrarToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: "#f5eee2" },
  contentContainer: { padding: 20, paddingTop: 60, alignItems: "center" },
  logo: { width: 120, height: 80, resizeMode: "contain", marginBottom: 20 },
  form: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 13,
    fontWeight: "800",
    color: "#888",
    marginBottom: 15,
    textTransform: "uppercase",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 15,
    paddingRight: 5,
  },
  innerInput: { flex: 1, padding: 15, fontSize: 14, color: "#474747" },
  sendIconButton: {
    backgroundColor: "#cb464a",
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  requestsSection: { width: "100%", marginTop: 30 },
  noRequests: {
    textAlign: "center",
    color: "#aaa",
    fontStyle: "italic",
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
  },
  userInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#cb464a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  nameText: { fontSize: 16, fontWeight: "800", color: "#474747" },
  subText: { fontSize: 12, color: "#999" },
  actionGroup: { flexDirection: "row", gap: 8 },
  miniBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  btnNo: { backgroundColor: "#fff5f5" },
  btnYes: { backgroundColor: "#f1f8e9" },
  toast: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 25,
    alignSelf: "center",
  },
  toastText: { color: "#fff", fontWeight: "600" },
});
