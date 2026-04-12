import { useRouter } from "expo-router";
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
import Header from "../../components/Header";
//import { inicializarCartaCompleta } from "../../utils/bulkupload";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handlePress = (id: number) => {
    id === 3
      ? router.push("/friends")
      : id === 1
        ? router.push("/tableInvite")
        : id === 2
          ? router.push("/joinTable")
          : null;
  };

  /*useEffect(() => {
    inicializarCartaCompleta();
  }, []);*/
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

  return (
    <ScrollView
      style={styles.outerContainer}
      contentContainerStyle={styles.contentContainer}
    >
      <Header />
      <View style={styles.gridContainer}>
        {[1, 2, 3, 4].map((item, index) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.card,
              index === 0 && styles.cardMesa,
              index === 0 && { backgroundColor: "#8ab3ad" },
              index === 2 && { backgroundColor: "#4f7e68" },
              index === 1 && { backgroundColor: "#cf7555" },
              index === 3 && { height: 100, width: "98%" },
            ]}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
          >
            {index === 0 && (
              <View style={{ flex: 1, width: "100%", padding: 25 }}>
                <Text style={[styles.title, { fontSize: 45, lineHeight: 45 }]}>
                  NUEVA {"\n"}MESA
                </Text>
                <Image
                  source={require("../../assets/images/rueda.png")}
                  style={styles.ruedaImage}
                />
              </View>
            )}
            {index === 1 && (
              <View style={{ flex: 1, width: "100%", padding: 15 }}>
                <Text style={[styles.title, { fontSize: 30, lineHeight: 30 }]}>
                  BUSCAR{"\n"}MESA
                </Text>
                <Image
                  source={require("../../assets/images/jarras.png")}
                  style={styles.jarrasImage}
                />
              </View>
            )}
            {index === 2 && (
              <View style={{ flex: 1, width: "100%", padding: 15 }}>
                <View
                  style={{
                    width: "100%",
                    height: 40,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.5}
                    allowFontScaling={false}
                    style={[
                      styles.title,
                      {
                        fontSize: 28,
                        width: "100%",
                        marginBottom: 0,
                        lineHeight: undefined,
                      },
                    ]}
                  >
                    AMIGOS
                  </Text>
                </View>

                <View style={{ flex: 1, width: "100%", position: "relative" }}>
                  <Image
                    source={require("../../assets/images/romano.png")}
                    style={styles.romanImage}
                  />
                  <View
                    style={{
                      position: "absolute",
                      backgroundColor: "white",
                      width: 40,
                      height: 90,
                      left: -10,
                      top: 150,
                    }}
                  />
                  <Image
                    source={require("../../assets/images/pancarta.png")}
                    style={styles.pancartaImage}
                  />
                </View>
              </View>
            )}
            {index === 3 && (
              <View style={{ flex: 1, width: "100%", padding: 0 }}>
                <Image
                  source={require("../../assets/images/llamada.png")}
                  style={{
                    width: "100%",
                    height: "100%",
                    resizeMode: "cover",
                    position: "absolute",
                  }}
                />

                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    paddingRight: 20,
                  }}
                >
                  <Text
                    style={[
                      styles.title,
                      {
                        fontSize: 33,
                        lineHeight: 30,
                        textAlign: "right",
                        marginBottom: 0,
                      },
                    ]}
                  >
                    CONVOCAR
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5eee2",
  },
  text: { fontSize: 24, fontWeight: "700" },
  logo: { width: 150, height: 150, resizeMode: "contain", marginLeft: -230 },
  outerContainer: {
    flex: 1,
    backgroundColor: "#f5eee2",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  gridContainer: {
    padding: 5,
    flexDirection: "row", // Los elementos se alinean en fila
    flexWrap: "wrap", // Si no caben, saltan a la siguiente línea
    justifyContent: "space-between", // Deja espacio entre las dos columnas
  },
  card: {
    backgroundColor: "#ffffff",
    width: "48%",
    height: 300,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,

    // SOMBRAS PARA IOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,

    // SOMBRA PARA ANDROID
    elevation: 8,

    marginTop: 5,

    gap: 30,
    overflow: "hidden",
  },
  cardMesa: {
    width: "100%",
  },
  ruedaImage: {
    width: "130%",
    top: -50,
    resizeMode: "contain",
    transform: [{ rotate: "-5deg" }],
  },
  jarrasImage: {
    top: -40,
    right: 60,
    width: "200%",
    height: "100%",
    resizeMode: "contain",
  },
  romanImage: {
    position: "absolute",
    width: "220%",
    height: "200%",
    left: "-70%",
    bottom: "-75%",
    resizeMode: "contain",
    zIndex: 1,
  },
  pancartaImage: {
    position: "absolute",
    width: "300%",
    height: "200%",
    left: "-120%",
    bottom: "-70%",
    resizeMode: "contain",
    transform: [{ rotate: "5deg" }],
    zIndex: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#474747",
    marginBottom: 30,
    textTransform: "uppercase",
    textAlign: "left",
  },
});
