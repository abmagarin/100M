import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

interface PfpProps {
  pfp: number; // ID de la imagen
  color: number; // ID del color
  style?: StyleProp<ViewStyle>;
}

// 1. Diccionario de colores
const COLOR_CONFIG: Record<number, string> = {
  1: "#FFADAD", // Rojo pastel
  2: "#FFD6A5", // Naranja pastel
  3: "#FDFFB6", // Amarillo pastel
  4: "#CAFFBF", // Verde pastel
  5: "#9BF6FF", // Azul pastel
  6: "#A0C4FF", // Perla
  7: "#BDB2FF", // Lavanda
  8: "#FFC6FF", // Rosa
  0: "#E1E1E1", // Gris por defecto
};

const PFP_CONFIG: Record<
  number,
  {
    source: ImageSourcePropType;
    offsetTop?: number;
    offsetLeft?: number;
    scale?: number;
    rotate?: string;
  }
> = {
  1: {
    source: require("../assets/images/pfp/1.png"),
    offsetTop: 25,
    offsetLeft: -60,
    scale: 5,
    rotate: "-25deg",
  },
  2: {
    source: require("../assets/images/pfp/2.png"),
    offsetTop: 15,
    offsetLeft: -10,
    scale: 1.2,
  },
  3: {
    source: require("../assets/images/pfp/3.png"),
    offsetTop: 10,
    offsetLeft: 10,
    scale: 2,
  },
  4: {
    source: require("../assets/images/pfp/4.png"),
    offsetTop: 10,
    offsetLeft: 10,
    scale: 2.5,
  },
  5: {
    source: require("../assets/images/pfp/5.png"),
    offsetTop: 25,
    scale: 1.7,
  },
  88: {
    source: require("../assets/images/pfp/4.png"),
    offsetTop: 10,
    offsetLeft: 10,
    scale: 2.5,
  },
};

export default function Pfp({ pfp, color, style }: PfpProps) {
  const config = PFP_CONFIG[pfp] || PFP_CONFIG[88];
  const backgroundColor = COLOR_CONFIG[color] || COLOR_CONFIG[0];

  return (
    <View style={[styles.circle, { backgroundColor: backgroundColor }, style]}>
      <Image
        source={config.source}
        style={[
          styles.image,
          {
            transform: [
              { translateY: config.offsetTop || 0 },
              { translateX: config.offsetLeft || 0 },
              { scale: config.scale || 1 },
              { rotate: config.rotate || "0deg" },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Importante: recorta la imagen al círculo
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.05)",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
