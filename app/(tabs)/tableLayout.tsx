import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { db, auth } from "../../firebase";
import { doc, updateDoc, getDoc, onSnapshot } from "firebase/firestore";

export default function TableLayoutScreen() {
  const router = useRouter();
  const [nombreMesa, setNombreMesa] = useState("Mesa sin nombre");
  const [codigoMesa, setCodigoMesa] = useState("#123456");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmCloseVisible, setIsConfirmCloseVisible] = useState(false);
  const [isCloseVisible, setCloseVisible] = useState(false);
  const [isInactivoVisible, setInactivoVisible] = useState(false);
  const [tempNombre, setTempNombre] = useState("");

  const [mostrarToast, setMostrarToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const pathname = usePathname();

  // Datos de prueba
  const [foodItems] = useState([
    { id: 1, name: "Montadito 10", qty: 2 },
    { id: 2, name: "Patatas", qty: 1 },
  ]);
  const [drinkItems] = useState([
    { id: 3, name: "Jarra", qty: 3 },
    { id: 4, name: "Tinto", qty: 1 },
  ]);
  const [historyItems] = useState([
    { id: 5, name: "Montadito 88", status: "Servido" },
    { id: 6, name: "Nachos", status: "En cocina" },
  ]);

  const sendToast = (msg: string) => {
    setToastMsg(msg);
    setMostrarToast(true);
    setTimeout(() => {
      setMostrarToast(false);
    }, 1500);
  };

  const copiarAlPortapapeles = async () => {
    await Clipboard.setStringAsync(codigoMesa);
    setMostrarToast(true);
    sendToast("¡Código copiado al portapapeles!");
  };

  const cambiarNombreMesa = async (nuevoNombre: string) => {
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

      const mesaRef = doc(db, "mesas", datosUsuario.table);

      await updateDoc(mesaRef, {
        nombre: nuevoNombre,
      });
    } catch (error) {
      console.error(`Error cambiando el nombre de la mesa: `, error);
    }
  };

  useEffect(() => {
    let unsubscribeUser: () => void;
    let unsubscribeMesa: () => void;

    const user = auth.currentUser;

    if (!user) return;

    console.log("Iniciando vigilancia para el usuario:", user.uid);
    const userRef = doc(db, "usuarios", user.uid);

    unsubscribeUser = onSnapshot(userRef, (userSnap) => {
      if (userSnap.exists()) {
        const mesaId = userSnap.data().table;

        if (mesaId) {
          console.log("ID de mesa detectado en el perfil:", mesaId);

          if (unsubscribeMesa) {
            console.log("Cerrando conexión con mesa anterior...");
            unsubscribeMesa();
          }

          unsubscribeMesa = onSnapshot(doc(db, "mesas", mesaId), (mesaSnap) => {
            if (mesaSnap.exists()) {
              const data = mesaSnap.data();
              console.log("Datos de la mesa actualizados:", data.nombre);

              setNombreMesa(data.nombre || "Mesa sin nombre");
              setCodigoMesa(mesaId);

              if (data.creadorId === user.uid) {
                setCloseVisible(true);
              } else {
                setCloseVisible(false);
              }
              if (!data.activo) {
                setInactivoVisible(true);
              } else {
                setInactivoVisible(false);
              }
            } else {
              console.log("La mesa ya no existe en la base de datos");
            }
          });
        } else {
          console.log("El usuario ya no tiene mesa asignada. Redirigiendo...");
          router.replace("/main");
        }
      }
    });

    return () => {
      console.log("Limpiando todos los escuchadores...");
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeMesa) unsubscribeMesa();
    };
  }, [auth.currentUser?.uid]);

  const closeTable = async () => {
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
      const mesaId = datosUsuario.table;

      if (!mesaId || mesaId === "") {
        console.log("Mesa ya vaciada previamente. Abortando ejecución.");
        return;
      }

      const mesaRef = doc(db, "mesas", mesaId);

      if (isCloseVisible) {
        await updateDoc(mesaRef, {
          activo: false,
          usuariosActivos: [],
        });
      }

      await updateDoc(userRef, {
        table: "",
      });
    } catch (error) {
      console.error(`Error cerrando la mesa: `, error);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/main")}>
            <Image
              source={require("../../assets/images/100logo.png")}
              style={styles.logo}
            />
          </TouchableOpacity>
          <View style={{ alignItems: "flex-end" }}>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              activeOpacity={0.7}
              onPress={() => {
                setTempNombre(nombreMesa);
                setIsModalVisible(true);
              }}
            >
              <Text style={[styles.tableName]}>{nombreMesa}</Text>
              <Ionicons
                name="create-outline"
                size={16}
                color="#888"
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={copiarAlPortapapeles}
              activeOpacity={0.7}
            >
              <Text style={styles.requestCode}>{codigoMesa}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.pendingContainer}>
          <View style={styles.foodColumn}>
            <Text style={styles.columnTitle}>Montaditos</Text>
            {foodItems.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Text style={styles.itemText}>{item.name}</Text>
                <Text style={styles.itemQty}>x{item.qty}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.btnAdd}>
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.drinkColumn}>
            <Text style={styles.columnTitle}>Bebidas</Text>
            {drinkItems.map((item) => (
              <View key={item.id} style={[styles.itemCard, styles.drinkCard]}>
                <Text style={styles.itemTextSmall}>{item.name}</Text>
                <Text style={styles.itemQty}>x{item.qty}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.btnAdd, { backgroundColor: "#8ab3ad" }]}
            >
              <Ionicons name="wine" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.columnTitle}>Ya pedidos / Historial</Text>
          <View style={styles.historyBox}>
            {historyItems.map((item) => (
              <View key={item.id} style={styles.historyRow}>
                <Text style={styles.historyText}>{item.name}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          {isCloseVisible && (
            <TouchableOpacity
              style={[styles.btnConfirm, { margin: 10 }]}
              onPress={() => {
                setIsConfirmCloseVisible(true);
              }}
            >
              <Text style={styles.btnTextConfirm}>Cerrar Mesa</Text>
            </TouchableOpacity>
          )}
          <View style={styles.accountsWrapper}>
            <View style={styles.accountBox}>
              <Text style={styles.accountLabel}>Total Mesa</Text>
              <Text style={styles.accountValue}>24.50€</Text>
            </View>
            <View style={[styles.accountBox, styles.myAccount]}>
              <Text style={styles.accountLabelWhite}>Tu parte</Text>
              <Text style={styles.accountValueWhite}>8.20€</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isInactivoVisible}
        onRequestClose={() => setInactivoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { textAlign: "center" }]}>
              El anfitrión ha cerrado la mesa
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.btnConfirm}
                onPress={() => {
                  closeTable();
                  setInactivoVisible(false);
                  router.push("/main");
                }}
              >
                <Text style={styles.btnTextConfirm}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmCloseVisible}
        onRequestClose={() => setIsConfirmCloseVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { textAlign: "center" }]}>
              ¿Seguro que quieres cerrar la mesa?
            </Text>
            <Text style={styles.modalText}>
              Echará a todos los integrantes y no podrás volver a entrar
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setIsConfirmCloseVisible(false)}
              >
                <Text style={styles.btnTextCancel}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnConfirm}
                onPress={() => {
                  closeTable();
                  setIsConfirmCloseVisible(false);
                  router.push("/main");
                }}
              >
                <Text style={styles.btnTextConfirm}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar nombre de la mesa</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Mesa de los cracks"
              value={tempNombre}
              onChangeText={setTempNombre}
              autoFocus={true}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.btnTextCancel}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnConfirm}
                onPress={() => {
                  const nombreFinal = tempNombre.trim();
                  if (nombreFinal.length > 0) {
                    setNombreMesa(nombreFinal);
                    cambiarNombreMesa(nombreFinal);
                  }
                  setIsModalVisible(false);
                }}
              >
                <Text style={styles.btnTextConfirm}>Listo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  outerContainer: { flex: 1, backgroundColor: "#f5eee2" },
  contentContainer: { padding: 15, paddingTop: 50 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: { width: 80, height: 50, resizeMode: "contain" },
  tableName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#474747",
    textTransform: "uppercase",
  },

  // DISEÑO DE 2 COLUMNAS
  pendingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  foodColumn: {
    width: "64%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 12,
    elevation: 3,
  },
  drinkColumn: {
    width: "32%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 12,
    elevation: 3,
  },
  columnTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#aaa",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  drinkCard: { flexDirection: "column", alignItems: "center" },
  itemText: { fontSize: 14, color: "#474747", fontWeight: "600" },
  itemTextSmall: { fontSize: 11, color: "#474747", textAlign: "center" },
  itemQty: { color: "#cb464a", fontWeight: "700" },
  btnAdd: {
    backgroundColor: "#cb464a",
    borderRadius: 10,
    padding: 5,
    marginTop: 10,
    alignItems: "center",
  },

  // HISTORIAL
  historySection: { marginBottom: 30 },
  historyBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  historyText: { color: "#888", textDecorationLine: "line-through" },
  statusBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { fontSize: 10, color: "#666" },

  // CUENTAS
  accountsWrapper: { alignItems: "flex-end", marginTop: 10 },
  accountBox: {
    width: 140,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
  },
  myAccount: { backgroundColor: "#474747", borderColor: "#474747" },
  accountLabel: { fontSize: 10, color: "#aaa", textTransform: "uppercase" },
  accountValue: { fontSize: 18, fontWeight: "700", color: "#474747" },
  accountLabelWhite: {
    fontSize: 10,
    color: "#ddd",
    textTransform: "uppercase",
  },
  accountValueWhite: { fontSize: 18, fontWeight: "700", color: "#fff" },
  requestCode: {
    fontSize: 13,
    color: "#888",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Fondo oscurecido
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#474747",
    marginBottom: 20,
  },
  modalInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: "#474747",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  btnCancel: {
    padding: 12,
    flex: 1,
    alignItems: "center",
  },
  btnConfirm: {
    backgroundColor: "#cb464a",
    padding: 12,
    flex: 1,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 10,
  },
  btnTextCancel: {
    color: "#888",
    fontWeight: "700",
  },
  btnTextConfirm: {
    color: "#fff",
    fontWeight: "700",
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
  modalText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
});
