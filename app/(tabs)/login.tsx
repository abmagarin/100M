import { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function LoginScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    console.log("Registrando a:", nombre, email, password);
    // Aquí conectarás con tu lógica de Databricks/Auth más adelante
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/100logo.png')} 
        style={styles.logo}
      />
      <Text style={styles.text}>Interfaz de Login</Text>
      <View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5eee2' },
  text: { fontSize: 24, fontWeight: 'bold' },
  logo: { position: 'absolute', top: 0, left: 0, width: 150, height: 150, resizeMode: 'contain'}
});