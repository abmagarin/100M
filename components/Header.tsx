import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db, auth } from '@/firebase';
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth'; // Importación clave

export default function Header() {
  const router = useRouter();
  const [displayNombre, setDisplayNombre] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchamos activamente si el usuario cambia o se carga
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "usuarios", user.uid));
          if (userDoc.exists()) {
            setDisplayNombre(userDoc.data().nombre);
          } else {
            // Si no hay nombre en Firestore, usamos el email como fallback
            setDisplayNombre(user.email?.split('@')[0] || 'Usuario');
          }
        } catch (error) {
          console.error("Error al obtener nombre:", error);
        }
      } else {
        setDisplayNombre('Invitado');
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Limpiamos el escucha
  }, []);

  return (
    <View style={styles.headerContainer}>
      <Image 
        source={require('../assets/images/100logo.png')} 
        style={styles.logo}
      />
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10}}>
        <Text style={{ fontSize: 20, color: '#474747', marginBottom: 5, fontWeight: 'bold' }}>
          {loading ? 'Cargando...' : displayNombre}
        </Text>        
        <TouchableOpacity onPress={() => router.push('/perfil')}>
          <Ionicons name="person-circle-outline" size={36} color="#474747" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#f5eee2',
    width: '100%',
  },
  logo: {
    width: 150,
    height: 90,
    resizeMode: 'contain',
    left: -40,
  },
});