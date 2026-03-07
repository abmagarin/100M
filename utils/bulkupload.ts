import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export const inicializarCartaCompleta = async () => {
  const montaditos = [
    // 01 - 10: DE LA CASA
    {
      id: "1",
      Categoria: "DeLaCasa",
      Nombre: "Jamón Gran Reserva y aceite de oliva virgen extra",
    },
    { id: "2", Categoria: "DeLaCasa", Nombre: "Oreja en salsa picantona" },
    { id: "3", Categoria: "DeLaCasa", Nombre: "Tortilla de chorizo" },
    { id: "4", Categoria: "DeLaCasa", Nombre: "Carrillera al vino tinto" },
    { id: "5", Categoria: "DeLaCasa", Nombre: "Tortilla de patatas" },
    { id: "6", Categoria: "DeLaCasa", Nombre: "Pollo kebab y salsa BBQ" },
    { id: "7", Categoria: "DeLaCasa", Nombre: "Pollo y salsa alioli" },
    { id: "8", Categoria: "DeLaCasa", Nombre: "Lomo al ajillo" },
    { id: "9", Categoria: "DeLaCasa", Nombre: "Chistorra y salsa brava" },
    { id: "10", Categoria: "DeLaCasa", Nombre: "Pulled Pork BBQ" },

    // 11 - 20: IMPRESCINDIBLE
    {
      id: "11",
      Categoria: "Imprescindible",
      Nombre: "Crema de queso Camembert, cebolla caramelizada y bacon ahumado",
    },
    {
      id: "12",
      Categoria: "Imprescindible",
      Nombre: "Tortilla de patatas y mayonesa",
    },
    {
      id: "13",
      Categoria: "Imprescindible",
      Nombre: "Tortilla de patatas y salsa alioli",
    },
    {
      id: "14",
      Categoria: "Imprescindible",
      Nombre: "Tortilla de patatas y mojo picón",
    },
    {
      id: "15",
      Categoria: "Imprescindible",
      Nombre: "Tortilla de patatas y salsa brava",
    },
    {
      id: "16",
      Categoria: "Imprescindible",
      Nombre: "Tortilla de patatas, pimiento rojo y mayonesa",
    },
    { id: "17", Categoria: "Imprescindible", Nombre: "Atún y salsa alioli" },
    {
      id: "18",
      Categoria: "Imprescindible",
      Nombre: "Atún, lechuga y mayonesa",
    },
    {
      id: "19",
      Categoria: "Imprescindible",
      Nombre: "Atún, pimiento rojo y mayonesa",
    },
    {
      id: "20",
      Categoria: "Imprescindible",
      Nombre: "Atún, lechuga y salsa César",
    },

    // 21 - 60: CLÁSICOS (Resumen de los principales según tu imagen)
    {
      id: "21",
      Categoria: "Clásicos",
      Nombre: "Pulled pork BBQ y salsa cheddar",
    },
    {
      id: "22",
      Categoria: "Clásicos",
      Nombre: "Pulled pork BBQ, cebolla crujiente y salsa brava",
    },
    {
      id: "23",
      Categoria: "Clásicos",
      Nombre: "Pulled pork y cebolla caramelizada",
    },
    { id: "24", Categoria: "Clásicos", Nombre: "Torreznos y guacamole" },
    {
      id: "25",
      Categoria: "Clásicos",
      Nombre: "Torreznos, patatas paja y salsa brava",
    },
    {
      id: "26",
      Categoria: "Clásicos",
      Nombre: "Crema de queso Camembert y carrillera al vino tinto",
    },
    {
      id: "27",
      Categoria: "Clásicos",
      Nombre: "Crema de queso Camembert y pollo kebab",
    },
    {
      id: "28",
      Categoria: "Clásicos",
      Nombre: "Crema de queso Camembert y pulled pork BBQ",
    },
    {
      id: "29",
      Categoria: "Clásicos",
      Nombre: "Crema de queso Camembert y chistorra",
    },
    {
      id: "30",
      Categoria: "Clásicos",
      Nombre: "Chistorra, patatas paja y salsa brava",
    },
    {
      id: "31",
      Categoria: "Clásicos",
      Nombre: "Chistorra, cebolla crujiente y mayonesa",
    },
    { id: "32", Categoria: "Clásicos", Nombre: "Chistorra y salsa cheddar" },
    {
      id: "33",
      Categoria: "Clásicos",
      Nombre: "Chistorra, cebolla caramelizada y salsa alioli",
    },
    { id: "34", Categoria: "Clásicos", Nombre: "Lomo al ajillo y salsa 100M" },
    {
      id: "35",
      Categoria: "Clásicos",
      Nombre: "Lomo al ajillo y queso madurado",
    },
    {
      id: "36",
      Categoria: "Clásicos",
      Nombre: "Lomo al ajillo, lechuga y mayonesa",
    },
    {
      id: "37",
      Categoria: "Clásicos",
      Nombre: "Lomo al ajillo, patatas paja y salsa alioli",
    },
    {
      id: "38",
      Categoria: "Clásicos",
      Nombre: "Lomo al ajillo, crema de queso Camembert y pimiento rojo",
    },
    {
      id: "39",
      Categoria: "Clásicos",
      Nombre: "Lomo al ajillo, pimiento rojo, lechuga y mayonesa",
    },
    {
      id: "40",
      Categoria: "Clásicos",
      Nombre: "Oreja en salsa picantona y cebolla crujiente",
    },
    {
      id: "41",
      Categoria: "Clásicos",
      Nombre: "Oreja en salsa picantona y salsa alioli",
    },
    {
      id: "42",
      Categoria: "Clásicos",
      Nombre: "Oreja en salsa picantona, salsa brava y mayonesa",
    },
    {
      id: "43",
      Categoria: "Clásicos",
      Nombre: "Oreja en salsa picantona, patatas paja y mojo picón",
    },
    {
      id: "44",
      Categoria: "Clásicos",
      Nombre: "Pollo, cebolla crujiente y salsa BBQ",
    },
    {
      id: "45",
      Categoria: "Clásicos",
      Nombre: "Pollo, cebolla crujiente y salsa alioli",
    },
    {
      id: "46",
      Categoria: "Clásicos",
      Nombre: "Pollo, pimiento rojo y mayonesa",
    },
    {
      id: "47",
      Categoria: "Clásicos",
      Nombre: "Carrillera al vino tinto y mayonesa",
    },
    {
      id: "48",
      Categoria: "Clásicos",
      Nombre: "Carrillera al vino tinto y salsa alioli",
    },
    {
      id: "49",
      Categoria: "Clásicos",
      Nombre: "Carrillera al vino tinto, patatas paja y mojo picón",
    },
    {
      id: "50",
      Categoria: "Clásicos",
      Nombre: "Carrillera al vino tinto y salsa brava",
    },
    {
      id: "51",
      Categoria: "Clásicos",
      Nombre: "Carrillera al vino tinto, patatas paja y salsa alioli",
    },
    { id: "52", Categoria: "Clásicos", Nombre: "Pollo kebab y salsa 100M" },
    {
      id: "53",
      Categoria: "Clásicos",
      Nombre: "Pollo kebab, patatas paja y mojo picón",
    },
    {
      id: "54",
      Categoria: "Clásicos",
      Nombre: "Pollo kebab, pimiento rojo y salsa alioli",
    },
    {
      id: "55",
      Categoria: "Clásicos",
      Nombre: "Pollo kebab, cebolla caramelizada y salsa de mostaza y miel",
    },
    {
      id: "56",
      Categoria: "Clásicos",
      Nombre: "Pollo kebab, lechuga y salsa César",
    },
    { id: "57", Categoria: "Clásicos", Nombre: "Rabas de calamar y mayonesa" },
    {
      id: "58",
      Categoria: "Clásicos",
      Nombre: "Rabas de calamar, lechuga y salsa alioli",
    },
    {
      id: "59",
      Categoria: "Clásicos",
      Nombre: "Rabas de calamar y salsa César",
    },
    {
      id: "60",
      Categoria: "Clásicos",
      Nombre: "Rabas de calamar y salsa bravioli",
    },

    // 61 - 80: ESPECIALES
    {
      id: "61",
      Categoria: "Especiales",
      Nombre: "Tortilla de chorizo y salsa alioli",
    },
    {
      id: "62",
      Categoria: "Especiales",
      Nombre: "Tortilla de chorizo y salsa brava",
    },
    {
      id: "63",
      Categoria: "Especiales",
      Nombre: "Tortilla de chorizo y queso madurado",
    },
    {
      id: "64",
      Categoria: "Especiales",
      Nombre: "Tortilla de chorizo y mojo picón",
    },
    {
      id: "65",
      Categoria: "Especiales",
      Nombre: "Jamón Gran Reserva y queso madurado",
    },
    {
      id: "66",
      Categoria: "Especiales",
      Nombre: "Jamón Gran Reserva y tortilla de patatas",
    },
    {
      id: "67",
      Categoria: "Especiales",
      Nombre: "Jamón Gran Reserva, aceite de oliva virgen extra y patatas paja",
    },
    {
      id: "68",
      Categoria: "Especiales",
      Nombre: "Jamón Gran Reserva, pimiento rojo y queso madurado",
    },
    {
      id: "69",
      Categoria: "Especiales",
      Nombre: "Salmón ahumado y crema de queso Camembert",
    },
    {
      id: "70",
      Categoria: "Especiales",
      Nombre: "Salmón ahumado, lechuga y salsa César",
    },
    {
      id: "71",
      Categoria: "Especiales",
      Nombre: "Torreznos, guacamole y salsa alioli",
    },
    {
      id: "72",
      Categoria: "Especiales",
      Nombre: "Torreznos, cebolla crujiente y mojo picón",
    },
    { id: "73", Categoria: "Especiales", Nombre: "Torreznos y salsa bravioli" },
    { id: "74", Categoria: "Especiales", Nombre: "Ensaladilla rusa" },
    { id: "75", Categoria: "Especiales", Nombre: "Ensaladilla rusa y atún" },
    {
      id: "76",
      Categoria: "Especiales",
      Nombre: "Ensaladilla rusa y pimiento rojo",
    },
    {
      id: "77",
      Categoria: "Especiales",
      Nombre: "Ensaladilla rusa y salsa brava",
    },
    {
      id: "78",
      Categoria: "Especiales",
      Nombre: "Ensaladilla rusa y patatas paja",
    },
    { id: "79", Categoria: "Especiales", Nombre: "Crema de chocolate" },
    { id: "80", Categoria: "Especiales", Nombre: "Crema de black cookies" },

    // 81 - 85: MONTYTACOS
    { id: "81", Categoria: "MontyTacos", Nombre: "Mozzamix" },
    { id: "82", Categoria: "MontyTacos", Nombre: "Mozzamix y pulled pork BBQ" },
    { id: "83", Categoria: "MontyTacos", Nombre: "Mozzamix y bacon ahumado" },
    { id: "84", Categoria: "MontyTacos", Nombre: "Mozzamix y chistorra" },
    { id: "85", Categoria: "MontyTacos", Nombre: "Mozzamix y lomo al ajillo" },

    // 86 - 90: MONTYPERROS
    {
      id: "86",
      Categoria: "MontyPerros",
      Nombre: "Hot dog, kétchup y mostaza",
    },
    {
      id: "87",
      Categoria: "MontyPerros",
      Nombre: "Hot dog, salsa BBQ y cebolla crujiente",
    },
    {
      id: "88",
      Categoria: "MontyPerros",
      Nombre: "Hot dog, cebolla crujiente, salsa cheddar y mojo picón",
    },
    {
      id: "89",
      Categoria: "MontyPerros",
      Nombre: "Hot dog, kétchup y mayonesa",
    },
    {
      id: "90",
      Categoria: "MontyPerros",
      Nombre: "Hot dog y salsa de mostaza y miel",
    },

    // 91 - 95: MONTYBURGERS
    {
      id: "91",
      Categoria: "MontyBurgers",
      Nombre: "Burger, lechuga y mayonesa",
    },
    {
      id: "92",
      Categoria: "MontyBurgers",
      Nombre: "Burger, cebolla crujiente y salsa cheddar",
    },
    {
      id: "93",
      Categoria: "MontyBurgers",
      Nombre: "Burger, patatas paja y salsa BBQ",
    },
    {
      id: "94",
      Categoria: "MontyBurgers",
      Nombre: "Burger, cebolla caramelizada, salsa 100M y salsa cheddar",
    },
    {
      id: "95",
      Categoria: "MontyBurgers",
      Nombre: "Burger, bacon ahumado, lechuga y mayonesa",
    },

    // 96 - 100: MONTYPIZZAS
    {
      id: "96",
      Categoria: "MontyPizzas",
      Nombre: "BBQ: Bacon ahumado, mozzamix, cebolla crujiente y salsa BBQ",
    },
    {
      id: "97",
      Categoria: "MontyPizzas",
      Nombre: "Pollo: Pollo kebab, mozzamix, salsa pomodoro y orégano",
    },
    {
      id: "98",
      Categoria: "MontyPizzas",
      Nombre:
        "Tres Quesos: Crema de queso Camembert, mozzamix, queso madurado y orégano",
    },
    {
      id: "99",
      Categoria: "MontyPizzas",
      Nombre:
        "Pulled Pork: Salsa BBQ, mozzamix, pulled pork y cebolla crujiente",
    },
    {
      id: "100",
      Categoria: "MontyPizzas",
      Nombre: "Pepperoni: Pepperoni, mozzamix, salsa pomodoro y orégano",
    },
  ];

  try {
    console.log("⏳ Subiendo los 100 montaditos...");
    for (const item of montaditos) {
      // Usamos setDoc para que el ID del documento sea el número (1, 2, 3...)
      await setDoc(doc(db, "montaditos", item.id), {
        Categoria: item.Categoria,
        Nombre: item.Nombre,
      });
    }
    console.log("✅ ¡Base de datos completa!");
  } catch (error) {
    console.error("❌ Error en la carga masiva:", error);
  }
};
