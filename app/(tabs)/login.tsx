import { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../../firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from 'expo-router';



export default function LoginScreen() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
      setError('');

      if (!email || !password) {
          setError('Por favor, rellena todos los campos');
          return;
      }

      try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          console.log("Inicio de sesión exitoso para:", user.email);

          router.replace('/main'); 

      } catch (err: any) {
          if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
              setError('Correo o contraseña incorrectos.');
          } else {
              setError('Error al iniciar sesión. Inténtalo de nuevo.');
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
        source={require('../../assets/images/100logo.png')} 
        style={styles.logo}
      />

      <View style={styles.form}>

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

        <TouchableOpacity activeOpacity={0.8} style={[styles.btn, styles.btnRed] } onPress={handleLogin}>
            <Text style={styles.btnTextWhite}>SIGN IN</Text>
        </TouchableOpacity>
    </View>
    <Image 
        source={require('../../assets/images/monty.png')} 
        style={styles.backgroundImage}
    />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5eee2' },
  text: { fontSize: 24, fontWeight: 'bold' },
  logo: { position: 'absolute', top: 0, left: 0, width: 150, height: 150, resizeMode: 'contain'},
  outerContainer: {
    flex: 1,
    backgroundColor: '#f5eee2',
  },
  contentContainer: {
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingRight: 15, // Espacio para el icono
  },
  inputPassword: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 20,
    fontSize: 16,
  },
  iconContainer: { padding: 5 },
  form: {
    backgroundColor: '#ffffff',
    width: '90%',
    padding: 25,
    borderRadius: 20,
    
    // SOMBRAS PARA IOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,

    // SOMBRA PARA ANDROID
    elevation: 8,
    
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    
    gap: 30, 
  },
  btn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 55,
    width: 200,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  btnRed: {
    backgroundColor: '#cb464a',
    borderColor: '#cb464a',
  },
  btnTextWhite: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  backgroundImage: {
    position: 'absolute',
    top: '25%',
    right: '20%',
    width: '80%',
    aspectRatio: 1,
    resizeMode: 'contain',
    transform: [
        { scale: 1.8 }
      ],
    overflow: 'visible',
    zIndex: -1,
  },
  errorText: {
    color: '#cb464a',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
});