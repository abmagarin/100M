import Pfp from "@/components/Pfp";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { usePathname, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebase";

export default function TableLayoutScreen() {
  const router = useRouter();
  const [nombreMesa, setNombreMesa] = useState("Mesa sin nombre");
  const [codigoMesa, setCodigoMesa] = useState("#123456");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmCloseVisible, setIsConfirmCloseVisible] = useState(false);
  const [confirmMontaditoVisible, setIsMontaditoVisible] = useState(false);
  const [isCloseVisible, setCloseVisible] = useState(false);
  const [isInactivoVisible, setInactivoVisible] = useState(false);
  const [tempNombre, setTempNombre] = useState("");

  const [mostrarToast, setMostrarToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [cartaMontaditos, setCartaMontaditos] = useState<any[]>([]);
  const [cartaBebidas, setCartaBebidas] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [selecciones, setSelecciones] = useState<Record<number, number>>({});

  const [confirmBebidaVisible, setIsBebidaVisible] = useState(false);
  const [seleccionesBebidas, setSeleccionesBebidas] = useState<
    Record<number, number>
  >({});

  const pathname = usePathname();

  // Datos de prueba
  const [foodItems, setFoodItems] = useState([
    { id: 1, name: "Montadito 10", qty: 2, who: "nadie" },
    { id: 2, name: "Patatas", qty: 1, who: "nadie" },
  ]);
  const [drinkItems, setDrinkItems] = useState([
    { id: 1, name: "Montadito 10", qty: 2, who: "nadie" },
    { id: 2, name: "Patatas", qty: 1, who: "nadie" },
  ]);
  const [historyItems] = useState([
    { id: 5, name: "Montadito 88", status: "Servido" },
    { id: 6, name: "Nachos", status: "En cocina" },
  ]);
  const [friendsData, setFriendsData] = useState([
    { id: "hdjkwndklajsdklaskld", pfp: 5, name: "Montadito 88", color: 2 },
    { id: "dklenbflndiwmwqddwaw", pfp: 6, name: "Nacho", color: 2 },
  ]);

  const appendFriendData = (newFriend: {
    id: string;
    pfp: number;
    name: string;
    color: number;
  }) => {
    setFriendsData(
      (
        prevFriends: { id: string; pfp: number; name: string; color: number }[],
      ) => [...prevFriends, newFriend],
    );
  };

  const incrementarBebida = (idDb: number) => {
    setSeleccionesBebidas((prev) => ({
      ...prev,
      [idDb]: (prev[idDb] || 0) + 1,
    }));
  };

  const decrementarBebida = (idDb: number) => {
    setSeleccionesBebidas((prev) => {
      if (!prev[idDb]) return prev;
      const nuevasSelecciones = { ...prev };
      nuevasSelecciones[idDb] -= 1;
      if (nuevasSelecciones[idDb] === 0) delete nuevasSelecciones[idDb];
      return nuevasSelecciones;
    });
  };

  const handleConfirmarPedidoBebida = async () => {
    const pedidoNuevo = Object.keys(seleccionesBebidas).map((key) => {
      const idNum = Number(key);
      const bebida = cartaBebidas.find((m) => m.idDb === idNum);
      return {
        id: idNum,
        name: bebida?.Nombre || bebida?.nombre || "Bebida sin nombre",
        qty: seleccionesBebidas[idNum],
        who: auth.currentUser?.uid || "unknown",
        // Cogemos su categoría real de la base de datos
        categoria: bebida?.Categoria || "Bebidas",
      };
    });

    try {
      const pedidosRef = collection(db, "mesas", codigoMesa, "pedidos");
      for (const item of pedidoNuevo) {
        await addDoc(pedidosRef, {
          idMontadito: item.id,
          name: item.name,
          qty: item.qty,
          who: item.who,
          categoria: item.categoria, // La guardamos
        });
      }
    } catch (error) {
      console.error("Error al enviar bebida a Firebase:", error);
      sendToast("Error al pedir bebida");
    }

    setSeleccionesBebidas({});
    setIsBebidaVisible(false);
  };

  useEffect(() => {
    const fetchCarta = async () => {
      try {
        const montaditosRef = collection(db, "montaditos");
        const snapshot = await getDocs(montaditosRef);

        const menuData = snapshot.docs.map((doc) => ({
          idDb: Number(doc.id),
          ...(doc.data() as any),
        }));

        const comida = menuData.filter(
          (item: any) => item.Categoria !== "Bebidas",
        );
        const bebidas = menuData.filter(
          (item: any) => item.Categoria === "Bebidas",
        );

        comida.sort((a, b) => a.idDb - b.idDb);
        bebidas.sort((a, b) => a.idDb - b.idDb);

        setCartaMontaditos(comida);
        setCartaBebidas(bebidas);
      } catch (error) {
        console.error("Error al obtener la carta:", error);
      }
    };

    setFoodItems([]);
    setDrinkItems([]);
    fetchCarta();
  }, []);

  const montaditosFiltrados = useMemo(() => {
    return cartaMontaditos.filter(
      (m) =>
        m.Nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.idDb?.toString().includes(busqueda),
    );
  }, [busqueda, cartaMontaditos]);

  // --- FUNCIONES DE LOS BOTONES +/- ---
  const incrementar = (idDb: number) => {
    setSelecciones((prev) => ({
      ...prev,
      [idDb]: (prev[idDb] || 0) + 1,
    }));
  };

  const decrementar = (idDb: number) => {
    setSelecciones((prev) => {
      if (!prev[idDb]) return prev;
      const nuevasSelecciones = { ...prev };
      nuevasSelecciones[idDb] -= 1;
      if (nuevasSelecciones[idDb] === 0) delete nuevasSelecciones[idDb]; // Si llega a 0, lo borramos del carrito
      return nuevasSelecciones;
    });
  };

  const handleConfirmarPedido = async () => {
    const pedidoNuevo = Object.keys(selecciones).map((key) => {
      const idNum = Number(key);
      const montadito = cartaMontaditos.find((m) => m.idDb === idNum);
      return {
        id: idNum,
        name: montadito?.Nombre || "Montadito sin nombre",
        qty: selecciones[idNum],
        who: auth.currentUser?.uid || "unknown",
        // ✨ AQUÍ COGEMOS SU CATEGORÍA REAL ✨
        categoria: montadito?.Categoria || "Clásicos",
      };
    });

    console.log("¡Pedido preparado localmente!", pedidoNuevo);

    try {
      const pedidosRef = collection(db, "mesas", codigoMesa, "pedidos");

      for (const item of pedidoNuevo) {
        await addDoc(pedidosRef, {
          idMontadito: item.id,
          name: item.name,
          qty: item.qty,
          who: item.who,
          pagado: "Pendiente",
          // Y la guardamos en Firebase
          categoria: item.categoria,
        });
      }
    } catch (error) {
      console.error("Error al enviar el pedido a Firebase:", error);
      sendToast("Error al enviar el pedido");
    }

    setSelecciones({});
    setBusqueda("");
    setIsMontaditoVisible(false);
  };

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
    let unsubscribePedidos: () => void;

    const user = auth.currentUser;
    if (!user) return;

    console.log("Iniciando vigilancia para el usuario:", user.uid);
    const userRef = doc(db, "usuarios", user.uid);

    unsubscribeUser = onSnapshot(userRef, (userSnap) => {
      if (userSnap.exists()) {
        const mesaId = userSnap.data().table;

        if (mesaId) {
          console.log("ID de mesa detectado en el perfil:", mesaId);

          if (unsubscribeMesa) unsubscribeMesa();
          if (unsubscribePedidos) unsubscribePedidos();

          // --- ESCUCHADOR 1: DATOS DE LA MESA Y USUARIOS ---
          unsubscribeMesa = onSnapshot(
            doc(db, "mesas", mesaId),
            async (mesaSnap) => {
              if (mesaSnap.exists()) {
                const data = mesaSnap.data();
                setNombreMesa(data.nombre || "Mesa sin nombre");
                setCodigoMesa(mesaId);
                setCloseVisible(data.creadorId === user.uid);
                setInactivoVisible(!data.activo);

                if (
                  data.usuariosActivos &&
                  Array.isArray(data.usuariosActivos)
                ) {
                  try {
                    const promesasUsuarios = data.usuariosActivos.map(
                      async (uid) => {
                        const uSnap = await getDoc(doc(db, "usuarios", uid));
                        if (uSnap.exists()) {
                          const uData = uSnap.data();
                          return {
                            id: uid,
                            name: uData.nombre || "Desconocido",
                            pfp: uData.pfp || 1,
                            color: uData.color || 1,
                          };
                        }
                        return null;
                      },
                    );

                    const usuariosResueltos =
                      await Promise.all(promesasUsuarios);

                    setFriendsData(usuariosResueltos.filter((u) => u !== null));
                  } catch (error) {
                    console.error(
                      "Error al obtener los amigos de la mesa:",
                      error,
                    );
                  }
                } else {
                  setFriendsData([]);
                }
              } else {
                console.log("La mesa ya no existe en la base de datos");
              }
            },
          );

          // --- ESCUCHADOR 2: LOS PEDIDOS AGRUPADOS ---
          const pedidosRef = collection(db, "mesas", mesaId, "pedidos");

          unsubscribePedidos = onSnapshot(pedidosRef, (pedidosSnap) => {
            const agrupador: Record<string, any> = {}; // <-- Cambiamos a Record<string, any> por la clave única

            pedidosSnap.forEach((docSnap) => {
              const data = docSnap.data();

              // 1. Clave única: "Comida_1" o "Bebidas_1" para que no se mezclen si tienen el mismo ID
              const claveUnica = `${data.categoria}_${data.idMontadito}`;

              if (agrupador[claveUnica]) {
                agrupador[claveUnica].qty += data.qty;
              } else {
                agrupador[claveUnica] = {
                  id: data.idMontadito,
                  name: data.name,
                  qty: data.qty,
                  who: data.who,
                  precio: data.precio || 0,
                  categoria: data.categoria || "Comida", // Guardamos la categoría aquí
                };
              }
            });

            const todosLosPedidos = Object.values(agrupador);

            // 2. EL SEMÁFORO: Separamos las listas y las ORDENAMOS por su ID numérico
            const pedidosComida = todosLosPedidos
              .filter((p) => p.categoria !== "Bebidas")
              .sort((a, b) => a.id - b.id); // Orden ascendente: 1, 2, 3...

            const pedidosBebida = todosLosPedidos
              .filter((p) => p.categoria === "Bebidas")
              .sort((a, b) => a.id - b.id); // Orden ascendente: 1, 2, 3...

            // 3. Alimentamos las dos columnas de tu pantalla
            setFoodItems(pedidosComida);
            setDrinkItems(pedidosBebida);
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
      if (unsubscribePedidos) unsubscribePedidos();
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

  const userData = async (idUsuario: string) => {
    try {
      const userSnap = await getDoc(doc(db, "usuarios", idUsuario));
      if (userSnap.exists()) {
        return userSnap.data();
      } else {
        console.error("No se encontró el usuario con ID:", idUsuario);
        return null;
      }
    } catch (error) {
      console.error("Error obteniendo datos del usuario:", error);
      return null;
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
            <ScrollView
              style={{ maxHeight: 220 }}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              {foodItems.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemLeftInfo}>
                    <Text style={styles.itemNumber}>#{item.id}</Text>
                    <Text
                      style={styles.itemText}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.name}
                    </Text>
                  </View>
                  <Text style={styles.itemQty}>x{item.qty}</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.btnAdd}
              onPress={() => {
                setIsMontaditoVisible(true);
              }}
            >
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
              onPress={() => setIsBebidaVisible(true)}
            >
              <Ionicons name="wine" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.historySection}>
          <Text style={styles.columnTitle}>AMIGOS</Text>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendsList}
          >
            <View style={styles.historySection}>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.friendsList}
              >
                {friendsData.map((friend) => (
                  <View key={friend.id} style={styles.friendCard}>
                    <Pfp pfp={friend.pfp} color={friend.color} />
                    <Text style={styles.friendName} numberOfLines={1}>
                      {friend.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
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
      {/* VENTANA SELECT MONTADITO */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmMontaditoVisible}
        onRequestClose={() => setIsMontaditoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <Text
              style={[
                styles.modalTitle,
                { textAlign: "center", marginBottom: 15 },
              ]}
            >
              ¿Qué te apetece?
            </Text>

            {/* BUSCADOR */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#888"
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nº o nombre..."
                placeholderTextColor="#888"
                value={busqueda}
                onChangeText={setBusqueda}
              />
            </View>
            <FlatList
              data={montaditosFiltrados}
              keyExtractor={(item) => item.idDb.toString()}
              style={{ width: "100%", maxHeight: 350 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const cantidad = selecciones[item.idDb] || 0;
                return (
                  <View style={styles.rowMontadito}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={styles.numeroMontadito}>#{item.idDb}</Text>
                      <Text style={styles.nombreMontadito} numberOfLines={2}>
                        {item.Nombre}
                      </Text>
                    </View>

                    {/* CONTADORES +/- */}
                    <View style={styles.counterContainer}>
                      <TouchableOpacity
                        style={[
                          styles.btnCounter,
                          cantidad === 0 && { backgroundColor: "#ccc" },
                        ]}
                        onPress={() => decrementar(item.idDb)}
                        disabled={cantidad === 0}
                      >
                        <Ionicons name="remove" size={18} color="white" />
                      </TouchableOpacity>

                      <Text style={styles.counterText}>{cantidad}</Text>

                      <TouchableOpacity
                        style={styles.btnCounter}
                        onPress={() => incrementar(item.idDb)}
                      >
                        <Ionicons name="add" size={18} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />

            {/* BOTONES INFERIORES */}
            <View style={[styles.modalButtons, { marginTop: 20 }]}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => {
                  setSelecciones({}); // Borramos selecciones a medias si cancela
                  setBusqueda("");
                  setIsMontaditoVisible(false);
                }}
              >
                <Text style={styles.btnTextCancel}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btnConfirm,
                  Object.keys(selecciones).length === 0 && {
                    backgroundColor: "#ccc",
                  },
                ]}
                onPress={handleConfirmarPedido}
                disabled={Object.keys(selecciones).length === 0} // Bloqueado si no ha pedido nada
              >
                <Text style={styles.btnTextConfirm}>Pedir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* VENTANA SELECT BEBIDAS */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmBebidaVisible}
        onRequestClose={() => setIsBebidaVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <Text
              style={[
                styles.modalTitle,
                { textAlign: "center", marginBottom: 15 },
              ]}
            >
              ¿Para beber?
            </Text>

            {/* LISTA VIRTUALIZADA SIN BUSCADOR Y SIN IDs */}
            <FlatList
              data={cartaBebidas} // Usamos directamente la carta entera de bebidas
              keyExtractor={(item) => item.idDb.toString()}
              style={{ width: "100%", maxHeight: 350 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const cantidad = seleccionesBebidas[item.idDb] || 0;
                return (
                  <View style={styles.rowMontadito}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={styles.nombreMontadito} numberOfLines={2}>
                        {item.Nombre || item.nombre}
                      </Text>
                    </View>

                    {/* CONTADORES +/- CON COLOR VERDE */}
                    <View style={styles.counterContainer}>
                      <TouchableOpacity
                        style={[
                          styles.btnCounter,
                          { backgroundColor: "#8ab3ad" },
                          cantidad === 0 && { backgroundColor: "#ccc" },
                        ]}
                        onPress={() => decrementarBebida(item.idDb)}
                        disabled={cantidad === 0}
                      >
                        <Ionicons name="remove" size={18} color="white" />
                      </TouchableOpacity>

                      <Text style={styles.counterText}>{cantidad}</Text>

                      <TouchableOpacity
                        style={[
                          styles.btnCounter,
                          { backgroundColor: "#8ab3ad" },
                        ]}
                        onPress={() => incrementarBebida(item.idDb)}
                      >
                        <Ionicons name="add" size={18} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />

            {/* BOTONES INFERIORES */}
            <View style={[styles.modalButtons, { marginTop: 20 }]}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => {
                  setSeleccionesBebidas({});
                  setIsBebidaVisible(false);
                }}
              >
                <Text style={styles.btnTextCancel}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btnConfirm,
                  { backgroundColor: "#8ab3ad" }, // Botón verde
                  Object.keys(seleccionesBebidas).length === 0 && {
                    backgroundColor: "#ccc",
                  },
                ]}
                onPress={handleConfirmarPedidoBebida}
                disabled={Object.keys(seleccionesBebidas).length === 0}
              >
                <Text style={styles.btnTextConfirm}>
                  Pedir (
                  {Object.values(seleccionesBebidas).reduce((a, b) => a + b, 0)}
                  )
                </Text>
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
  drinkCard: { flexDirection: "column", alignItems: "center" },
  itemTextSmall: { fontSize: 11, color: "#474747", textAlign: "center" },
  btnAdd: {
    backgroundColor: "#cb464a",
    borderRadius: 10,
    padding: 5,
    marginTop: 10,
    alignItems: "center",
  },

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
  friendsList: {
    paddingVertical: 10,
  },
  friendCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 12,
    marginRight: 15, // Espacio entre tarjetas
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center", // Centra el contenido
    width: 100, // Ancho fijo para que se vea el scroll
    // Sombra suave (opcional)
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e1e1e1", // Color de fondo si no hay imagen
    marginBottom: 8,
  },
  friendName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
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
    backgroundColor: "rgba(0,0,0,0.5)",
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
  // --- ESTILOS DEL MODAL DE MONTADITOS ---
  modalContentLarge: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: "100%",
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  rowMontadito: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
  numeroMontadito: {
    fontSize: 12,
    color: "#cb464a",
    fontWeight: "bold",
  },
  nombreMontadito: {
    fontSize: 15,
    color: "#474747",
    fontWeight: "600",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnCounter: {
    backgroundColor: "#cb464a", // Usamos tu rojo
    borderRadius: 15,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  counterText: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
    color: "#474747",
  },
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Centramos verticalmente si el texto ocupa 2 líneas
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemLeftInfo: {
    flex: 1, // Impide que el texto empuje la cantidad hacia afuera
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10, // Un poco de aire antes del multiplicador
  },
  itemNumber: {
    fontSize: 13,
    color: "#888",
    fontWeight: "bold",
    marginRight: 6, // Separación entre el "#1" y "Jamón..."
  },
  itemText: {
    flex: 1, // Esto es clave para que el numberOfLines=2 funcione bien
    fontSize: 13,
    color: "#474747",
    fontWeight: "600",
    lineHeight: 18, // Hace que las dos líneas respiren mejor
  },
  itemQty: {
    color: "#cb464a",
    fontWeight: "700",
    fontSize: 15,
  },
});
