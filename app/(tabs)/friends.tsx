import Pfp from "@/components/Pfp";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
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

import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  codigoUnico: string;
  friendRequests?: string[];
  friends?: string[];
  pfp: number;
  color: number;
}

export default function friendsScreen() {
  const router = useRouter();

  const [code, setCode] = useState("ABCDEF");
  const [fullRequests, setFullRequests] = useState<Usuario[]>([]);
  const [fullFriends, setFullFriends] = useState<Usuario[]>([]);
  const [friendCode, setFriendCode] = useState("");
  const [mostrarToast, setMostrarToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const sendToast = (msg: string) => {
    setToastMsg(msg);
    setMostrarToast(true);
    setTimeout(() => {
      setMostrarToast(false);
    }, 1500);
  };

  const copiarAlPortapapeles = async () => {
    await Clipboard.setStringAsync(code);
    setMostrarToast(true);
    sendToast("¡Código copiado al portapapeles!");
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, "usuarios", user.uid);

    const unsubscribe = onSnapshot(userDocRef, async (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();

        // 1. Actualizamos el código propio
        setCode(userData.codigoUnico);

        // 2. Función auxiliar interna para buscar datos de usuarios por sus códigos
        const fetchByCodes = async (codes: string[]) => {
          if (!codes || codes.length === 0) return [];

          const usuariosRef = collection(db, "usuarios");
          const promesas = codes.map(async (cod) => {
            const q = query(usuariosRef, where("codigoUnico", "==", cod));
            const snap = await getDocs(q);
            return snap.empty
              ? null
              : { id: snap.docs[0].id, ...snap.docs[0].data() };
          });
          const res = await Promise.all(promesas);
          return res.filter((r): r is Usuario => r !== null);
        };

        // 3. Disparamos la búsqueda de datos extendidos (nombres, etc.)
        const reqData = await fetchByCodes(userData.friendRequests || []);
        const friData = await fetchByCodes(userData.friends || []);

        // 4. Seteamos los estados que usan tus componentes visuales
        setFullRequests(reqData);
        setFullFriends(friData);
      }
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleSendRequest = async () => {
    if (friendCode.length !== 6) {
      sendToast("Código inválido");
      return;
    }

    try {
      // 1. Buscamos al usuario que tiene ese código único
      const usuariosRef = collection(db, "usuarios");
      const q = query(usuariosRef, where("codigoUnico", "==", friendCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        sendToast("No se ha encontrado ningún usuario con ese código.");
        return;
      }

      // 2. Obtenemos los datos del usuario actual (el que envía)
      const userReceptorDoc = querySnapshot.docs[0];
      const receptorRef = doc(db, "usuarios", userReceptorDoc.id);

      // 3. Añadimos NUESTRO código a SU lista de friendRequests
      await updateDoc(receptorRef, {
        friendRequests: arrayUnion(code),
      });

      setFriendCode("");
      sendToast("¡Solicitud enviada con éxito!");
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      sendToast("Hubo un error al procesar la solicitud.");
    }
  };

  const handleAcceptRequest = async (reqUser: Usuario) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // 1. Añadir el código del amigo a nuestra lista de friends
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, {
        friends: arrayUnion(reqUser.codigoUnico),
        friendRequests: reqUser.friendRequests
          ? reqUser.friendRequests.filter((cod) => cod !== reqUser.codigoUnico)
          : [],
      });

      // 2. Añadir nuestro código a la lista de friends del amigo
      const friendRef = doc(db, "usuarios", reqUser.id);
      await updateDoc(friendRef, {
        friends: arrayUnion(code),
      });

      // 3. Actualizar las listas locales para reflejar los cambios
      setFullRequests((prev) =>
        prev.filter((r) => r.codigoUnico !== reqUser.codigoUnico),
      );
    } catch (error) {
      console.error("Error al aceptar solicitud:", error);
      sendToast("Hubo un error al aceptar la solicitud.");
    }
  };

  const handleDeclineRequest = async (reqUser: Usuario) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, {
        friendRequests: reqUser.friendRequests
          ? reqUser.friendRequests.filter((cod) => cod !== reqUser.codigoUnico)
          : [],
      });

      setFullRequests((prev) =>
        prev.filter((r) => r.codigoUnico !== reqUser.codigoUnico),
      );
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
      alert("Hubo un error al rechazar la solicitud.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.outerContainer}
        contentContainerStyle={styles.contentContainer}
      >
        <TouchableOpacity
          onPress={() => router.push("/main")}
          activeOpacity={0.8}
        >
          <Image
            source={require("../../assets/images/100logo.png")}
            style={styles.logo}
          />
        </TouchableOpacity>

        <View style={styles.form}>
          <Text style={styles.title}>TU CÓDIGO</Text>

          <TouchableOpacity
            style={styles.codeContainer}
            onPress={copiarAlPortapapeles}
            activeOpacity={0.7}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              style={styles.codeText}
            >
              {code}
            </Text>
            <Ionicons
              name="copy-outline"
              size={24}
              color="#cb464a"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.form}>
          <Text style={styles.title}>ENVIA SOLICITUD</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.innerInput}
              placeholder="Codigo de amigo"
              placeholderTextColor="#878787"
              value={friendCode}
              onChangeText={(text) => setFriendCode(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={6}
            />

            <TouchableOpacity
              style={styles.sendIconButton}
              onPress={handleSendRequest}
            >
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.requestsSection}>
          <Text style={styles.title}>
            Solicitudes pendientes ({fullRequests.length})
          </Text>

          {fullRequests.length === 0 ? (
            <Text style={styles.noRequests}>No hay solicitudes pendientes</Text>
          ) : (
            fullRequests.map((reqUser) => (
              <View key={reqUser.codigoUnico} style={styles.requestCard}>
                <View style={styles.userInfo}>
                  <View style={styles.avatarPlaceholder}>
                    <Pfp pfp={reqUser.pfp} color={reqUser.color} />
                  </View>
                  <View>
                    <Text style={styles.requestName}>{reqUser.nombre}</Text>
                    <Text style={styles.requestCode}>
                      #{reqUser.codigoUnico}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.miniBtn, styles.btnCheck]}
                    onPress={() => handleAcceptRequest(reqUser)}
                  >
                    <Ionicons name="checkmark" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.miniBtn, styles.btnClose]}
                    onPress={() => handleDeclineRequest(reqUser)}
                  >
                    <Ionicons name="close" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <View style={styles.friendsTitleSection}>
            <Text style={styles.title}>MIS AMIGOS ({fullFriends.length})</Text>
          </View>

          {fullFriends.length === 0 ? (
            <Text style={styles.noRequests}>No hay amigos aun.</Text>
          ) : (
            fullFriends.map((friend) => (
              <View key={friend.codigoUnico} style={styles.friendCard}>
                <View style={styles.userInfo}>
                  <View style={{ paddingRight: 10 }}>
                    <Pfp pfp={friend.pfp} color={friend.color} />
                  </View>
                  <View>
                    <Text style={styles.requestName}>{friend.nombre}</Text>
                    <Text style={styles.requestCode}>Amigos desde 2026</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.btnProfile}>
                  <Ionicons name="chevron-forward" size={20} color="#888" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {mostrarToast && (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#f5eee2",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },

  logo: {
    width: 150,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },

  form: {
    backgroundColor: "#ffffff",
    width: "95%",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 30,

    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  codeText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#474747",
    letterSpacing: 5,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  btn: {
    width: "80%",
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  btnRed: {
    backgroundColor: "#cb464a",
  },
  btnTextWhite: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  toastContainer: {
    position: "absolute",
    bottom: 50, // Aparece en la parte inferior
    alignSelf: "center", // Lo centra horizontalmente
    backgroundColor: "#333",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 10, // Para que flote sobre todo
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
  inputContainer: {
    flexDirection: "row", // Alinea input y botón en línea
    width: "100%",
    height: 60,
    backgroundColor: "#ffffff",
    borderRadius: 30, // Bordes muy redondeados para estilo moderno
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    paddingLeft: 20, // Espacio para el texto
    paddingRight: 5, // Espacio pequeño para el botón a la derecha

    // Sombra suave para el campo
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  innerInput: {
    flex: 1, // El input ocupa todo el espacio sobrante
    height: "100%",
    fontSize: 16,
    color: "#474747",
    fontWeight: "600",
    letterSpacing: 1,
  },
  sendIconButton: {
    backgroundColor: "#cb464a", // Tu rojo corporativo
    width: 50,
    height: 50,
    borderRadius: 25, // Botón circular
    justifyContent: "center",
    alignItems: "center",
  },
  requestsSection: {
    width: "95%",
    marginBottom: 30,
  },
  noRequests: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 10,
    fontStyle: "italic",
  },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#8ab3ad",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
  requestName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#474747",
  },
  requestCode: {
    fontSize: 12,
    color: "#888",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  miniBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  btnCheck: { backgroundColor: "#4CAF50" },
  btnClose: { backgroundColor: "#cb464a" },
  friendCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 5,
    borderLeftColor: "#4CAF50",
  },
  btnProfile: {
    backgroundColor: "#f0f0f0",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  friendsTitleSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 20,
    width: "100%",
  },
});
