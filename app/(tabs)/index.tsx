import { Button } from '@react-navigation/elements'
import { Link } from 'expo-router'
import React, { Component } from 'react'
import { Text, View, TouchableOpacity, Image, StyleSheet } from 'react-native'

export default class index extends Component {
  render() {
    return (
      <View style={styles.mainContainer}>
        <Image 
          source={require('../../assets/images/tinto.png')} 
          style={styles.backgroundTinto}
        />
        <Image 
          source={require('../../assets/images/montaditos.png')} 
          style={styles.backgroundMontadito}
        />
        <View style={styles.logoBox}>
          <Image 
          source={require('../../assets/images/100logo.png')} 
          style={styles.logo}
          />
        </View>

        <View style={styles.btnBox}>
          <Link href="/register" asChild style={[styles.btn, styles.btnRed]}>
            <TouchableOpacity activeOpacity={0.8}>
              <Text style={styles.btnTextWhite}>REGISTER</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/login" asChild style={[styles.btn, styles.btnRed]}>
            <TouchableOpacity activeOpacity={0.8}>
              <Text style={styles.btnTextWhite}>LOG IN</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  mainContainer : {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f5eee2'
  },
  logoBox : {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  btnBox : {
    flex: 1,
    paddingTop: 30,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 40,
  },
  logo : {
    width: 550,
    height: 300,
    resizeMode: 'contain'
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
    // La clase .btn-red
    backgroundColor: '#cb464a', // El rojo de la web
    borderColor: '#cb464a',
  },
  btnTextWhite: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase', // La web usa mucho mayúsculas
  },
  backgroundTinto: {
    position: 'absolute', // Saca la imagen del flujo de las cajas
    top: '55%',
    left: '-20%',
    width: '70%',
    aspectRatio: 1,
    resizeMode: 'contain',
    transform: [
        { rotate: '-20deg' },
        { scale: 0.8 }
      ],
    overflow: 'visible',
  },
  backgroundMontadito: {
    position: 'absolute',
    top: '70%',
    right: '-20%',
    width: '80%',
    aspectRatio: 1,
    resizeMode: 'contain',
    transform: [
        { scale: 0.8 }
      ],
    overflow: 'visible',
  },
})