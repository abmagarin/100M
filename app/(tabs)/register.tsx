import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
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

const guardarUsuario = async (
  uid: string,
  nombre: string,
  email: string,
  codigoUnico: string,
) => {
  try {
    // Referencia al documento: colección "usuarios" y el ID único del usuario (uid)
    const usuarioRef = doc(db, "usuarios", uid);

    await setDoc(usuarioRef, {
      nombre: nombre,
      email: email,
      codigoUnico: codigoUnico,
      friendRequests: [],
      tableRequests: [],
      friends: [],
      fechaRegistro: serverTimestamp(),
      table: null,
      activo: true,
      pfp: 0,
      color: 0,
    });

    console.log("¡Datos guardados en Firestore!");
  } catch (error) {
    console.error("Error al guardar:", error);
  }
};

const generarcodigoUnico = () => {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let resultado = "";
  for (let i = 0; i < 6; i++) {
    resultado += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length),
    );
  }
  return resultado;
};

export default function RegisterScreen() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (!nombre || !email || !password) {
      setError("Por favor, rellena todos los campos");
      return;
    }

    if (password.length < 8 || password.length > 20) {
      setError("La contraseña debe tener entre 8 y 20 caracteres");
      return;
    }

    if (nombre.length < 3 || nombre.length > 15) {
      setError("El nombre debe tener entre 3 y 15 caracteres");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError("El formato del correo no es válido");
      return;
    }

    try {
      // 1. Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      const codigoUnico = generarcodigoUnico();

      // 2. Usar la función guardarUsuario que ya tienes arriba
      // Pasamos el UID (identificador único) que nos da Firebase
      await guardarUsuario(user.uid, nombre, email, codigoUnico);

      router.replace("/login");
    } catch (err: any) {
      // Manejo de errores específicos de Firebase
      if (err.code === "auth/email-already-in-use") {
        setError("Este correo ya está en uso.");
      } else if (err.code === "auth/invalid-email") {
        setError("El formato del correo es inválido.");
      } else {
        setError("Ocurrió un error al registrarse. Inténtalo de nuevo.");
      }
      console.error(err);
    }
  };

  return (
    <ScrollView
      style={styles.outerContainer}
      contentContainerStyle={styles.contentContainer}
    >
      <Image
        source={require("../../assets/images/100logo.png")}
        style={styles.logo}
      />

      <View style={styles.form}>
        <Text style={styles.title}>CREATE YOUR ACCOUNT</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#878787"
          value={nombre}
          onChangeText={setNombre}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#878787"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Password"
            placeholderTextColor="#878787"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={22}
              color="#878787"
            />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.btn, styles.btnRed]}
          onPress={handleRegister}
        >
          <Text style={styles.btnTextWhite}>CREATE</Text>
        </TouchableOpacity>
      </View>
      <Image
        source={require("../../assets/images/monty.png")}
        style={styles.backgroundImage}
      />
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
  text: { fontSize: 24, fontWeight: "800" },
  logo: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
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
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#474747",
    marginBottom: 30,
    textTransform: "uppercase",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingRight: 15, // Espacio para el icono
  },
  inputPassword: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 20,
    fontSize: 16,
  },
  iconContainer: { padding: 5 },
  form: {
    backgroundColor: "#ffffff",
    width: "90%",
    padding: 25,
    borderRadius: 20,

    // SOMBRAS PARA IOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,

    // SOMBRA PARA ANDROID
    elevation: 8,

    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,

    gap: 30,
  },
  btn: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 55,
    width: 200,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "transparent",
  },
  btnRed: {
    backgroundColor: "#cb464a",
    borderColor: "#cb464a",
  },
  btnTextWhite: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    textTransform: "uppercase",
  },
  backgroundImage: {
    position: "absolute",
    top: "25%",
    right: "20%",
    width: "80%",
    aspectRatio: 1,
    resizeMode: "contain",
    transform: [{ scale: 1.8 }],
    overflow: "visible",
    zIndex: -1,
  },
  errorText: {
    color: "#cb464a",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
});
