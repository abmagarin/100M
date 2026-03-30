import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const inicializarCartaCompleta = async () => {
  const montaditos = [
    // --- DE LA CASA ---
    {
      id: "1",
      Categoria: "De la casa",
      Nombre: "Jamón Gran Reserva y aceite de oliva",
    },
    {
      id: "2",
      Categoria: "De la casa",
      Nombre: "Tortilla de patatas y tomate",
    },
    { id: "3", Categoria: "De la casa", Nombre: "Pulled pork BBQ" },
    { id: "4", Categoria: "De la casa", Nombre: "Pollo y salsa alioli" },
    { id: "5", Categoria: "De la casa", Nombre: "Carrillera al vino tinto" },
    { id: "6", Categoria: "De la casa", Nombre: "Calamarcitos y mayonesa" },
    { id: "7", Categoria: "De la casa", Nombre: "Pollo kebab y salsa BBQ" },
    {
      id: "8",
      Categoria: "De la casa",
      Nombre: "Bacon ahumado y queso madurado",
    },
    { id: "9", Categoria: "De la casa", Nombre: "Torreznos y salsa brava" },
    {
      id: "10",
      Categoria: "De la casa",
      Nombre: "Lomo al ajillo y salsa 100M",
    },

    // --- CLÁSICOS ---
    {
      id: "11",
      Categoria: "Clásicos",
      Nombre: "Tortilla de patatas y queso madurado",
    },
    {
      id: "12",
      Categoria: "Clásicos",
      Nombre: "Tortilla de patatas, bacon ahumado y salsa alioli",
    },
    {
      id: "13",
      Categoria: "Clásicos",
      Nombre: "Tortilla de patatas, tomate y mayonesa",
    },
    {
      id: "14",
      Categoria: "Clásicos",
      Nombre: "Tortilla de patatas y mojo picón",
    },
    {
      id: "15",
      Categoria: "Clásicos",
      Nombre: "Tortilla de patatas, patatas paja y salsa 100M",
    },
    {
      id: "16",
      Categoria: "Clásicos",
      Nombre: "Tortilla de patatas, cebolla crujiente y salsa BBQ",
    },
    { id: "17", Categoria: "Clásicos", Nombre: "Pollo y queso madurado" },
    { id: "18", Categoria: "Clásicos", Nombre: "Pollo, tomate y mojo picón" },
    {
      id: "19",
      Categoria: "Clásicos",
      Nombre: "Pollo, patatas paja y salsa de mostaza y miel",
    },
    {
      id: "20",
      Categoria: "Clásicos",
      Nombre: "Pollo, bacon ahumado y mayonesa",
    },
    {
      id: "21",
      Categoria: "Clásicos",
      Nombre: "Pollo, patatas paja y salsa BBQ",
    },
    { id: "22", Categoria: "Clásicos", Nombre: "Pollo kebab y tomate" },
    { id: "23", Categoria: "Clásicos", Nombre: "Pollo kebab y salsa cheddar" },
    {
      id: "24",
      Categoria: "Clásicos",
      Nombre: "Pollo kebab, tomate y salsa 100M",
    },
    {
      id: "25",
      Categoria: "Clásicos",
      Nombre: "Pollo kebab, patatas paja y salsa BBQ",
    },
    {
      id: "26",
      Categoria: "Clásicos",
      Nombre: "Pollo kebab, bacon ahumado y mayonesa",
    },

    // --- IMPRESCINDIBLES ---
    {
      id: "27",
      Categoria: "Imprescindibles",
      Nombre: "Pulled pork BBQ y salsa cheddar",
    },
    {
      id: "28",
      Categoria: "Imprescindibles",
      Nombre: "Pulled pork BBQ y bacon ahumado",
    },
    {
      id: "29",
      Categoria: "Imprescindibles",
      Nombre: "Pulled pork BBQ y salsa brava",
    },
    {
      id: "30",
      Categoria: "Imprescindibles",
      Nombre: "Pulled pork BBQ y patatas paja",
    },
    {
      id: "31",
      Categoria: "Imprescindibles",
      Nombre: "Pulled pork BBQ y cebolla crujiente",
    },
    {
      id: "32",
      Categoria: "Imprescindibles",
      Nombre: "Lomo al ajillo y queso madurado",
    },
    {
      id: "33",
      Categoria: "Imprescindibles",
      Nombre: "Lomo al ajillo y queso gorgonzola",
    },
    {
      id: "34",
      Categoria: "Imprescindibles",
      Nombre: "Lomo al ajillo y mojo picón",
    },
    {
      id: "35",
      Categoria: "Imprescindibles",
      Nombre: "Lomo al ajillo, tomate y patatas paja",
    },
    {
      id: "36",
      Categoria: "Imprescindibles",
      Nombre: "Lomo al ajillo, tomate y mayonesa",
    },
    {
      id: "37",
      Categoria: "Imprescindibles",
      Nombre: "Lomo al ajillo, bacon ahumado y salsa alioli",
    },
    {
      id: "38",
      Categoria: "Imprescindibles",
      Nombre: "Calamarcitos y salsa alioli",
    },
    {
      id: "39",
      Categoria: "Imprescindibles",
      Nombre: "Calamarcitos y salsa 100M",
    },
    {
      id: "40",
      Categoria: "Imprescindibles",
      Nombre: "Calamarcitos y guacamole",
    },
    {
      id: "41",
      Categoria: "Imprescindibles",
      Nombre: "Calamarcitos, salsa brava y mayonesa",
    },
    {
      id: "42",
      Categoria: "Imprescindibles",
      Nombre: "Calamarcitos, tomate y mayonesa",
    },
    {
      id: "43",
      Categoria: "Imprescindibles",
      Nombre: "Bacon ahumado, tomate y mayonesa",
    },
    {
      id: "44",
      Categoria: "Imprescindibles",
      Nombre: "Bacon ahumado, cebolla crujiente y salsa 100M",
    },
    {
      id: "45",
      Categoria: "Imprescindibles",
      Nombre: "Bacon ahumado, tomate y queso gorgonzola",
    },
    {
      id: "46",
      Categoria: "Imprescindibles",
      Nombre: "Bacon ahumado, patatas paja y mayonesa",
    },
    {
      id: "47",
      Categoria: "Imprescindibles",
      Nombre: "Bacon ahumado, tomate y queso madurado",
    },

    // --- ESPECIALES ---
    {
      id: "48",
      Categoria: "Especiales",
      Nombre: "Jamón Gran Reserva y mantequilla",
    },
    {
      id: "49",
      Categoria: "Especiales",
      Nombre: "Jamón Gran Reserva y tomate",
    },
    {
      id: "50",
      Categoria: "Especiales",
      Nombre: "Jamón Gran Reserva, tomate y patatas paja",
    },
    {
      id: "51",
      Categoria: "Especiales",
      Nombre: "Jamón Gran Reserva y tortilla de patatas",
    },
    {
      id: "52",
      Categoria: "Especiales",
      Nombre: "Carrillera al vino tinto y salsa alioli",
    },
    {
      id: "53",
      Categoria: "Especiales",
      Nombre: "Carrillera al vino tinto y patatas paja",
    },
    {
      id: "54",
      Categoria: "Especiales",
      Nombre: "Carrillera al vino tinto y tomate",
    },
    {
      id: "55",
      Categoria: "Especiales",
      Nombre: "Carrillera al vino tinto y cebolla crujiente",
    },
    {
      id: "56",
      Categoria: "Especiales",
      Nombre: "Carrillera al vino tinto y bacon ahumado",
    },
    { id: "57", Categoria: "Especiales", Nombre: "Torreznos y mayonesa" },
    { id: "58", Categoria: "Especiales", Nombre: "Torreznos y salsa alioli" },
    { id: "59", Categoria: "Especiales", Nombre: "Torreznos y salsa 100M" },
    {
      id: "60",
      Categoria: "Especiales",
      Nombre: "Salmón ahumado y queso gorgonzola",
    },
    { id: "61", Categoria: "Especiales", Nombre: "Salmón ahumado y tomate" },
    {
      id: "62",
      Categoria: "Especiales",
      Nombre: "Salmón ahumado y salsa de mostaza y miel",
    },
    { id: "63", Categoria: "Especiales", Nombre: "Salmón ahumado y guacamole" },
    {
      id: "64",
      Categoria: "Especiales",
      Nombre: "Chorizo parrillero y salsa brava",
    },
    {
      id: "65",
      Categoria: "Especiales",
      Nombre: "Chorizo parrillero y queso gorgonzola",
    },
    {
      id: "66",
      Categoria: "Especiales",
      Nombre: "Chorizo parrillero y salsa BBQ",
    },
    {
      id: "67",
      Categoria: "Especiales",
      Nombre: "Chorizo parrillero y guacamole",
    },

    // --- MONTYCOOKIE ---
    {
      id: "68",
      Categoria: "MontyCookie",
      Nombre: "Montycookie doble chocolate y sirope de caramelo toffee",
    },
    {
      id: "69",
      Categoria: "MontyCookie",
      Nombre: "Montycookie chocolate y sirope de pistacho",
    },
    {
      id: "70",
      Categoria: "MontyCookie",
      Nombre: "Montycookie chocolate y sirope de chocolate",
    },

    // --- MONTYDINAS ---
    {
      id: "71",
      Categoria: "MontyDinas",
      Nombre: "Piadina de jamón cocido y queso mozzarella",
    },
    {
      id: "72",
      Categoria: "MontyDinas",
      Nombre: "Piadina de pepperoni y queso mozzarella",
    },
    {
      id: "73",
      Categoria: "MontyDinas",
      Nombre: "Piadina de pollo, tomate, queso mozzarella y orégano",
    },
    {
      id: "74",
      Categoria: "MontyDinas",
      Nombre: "Piadina de jamón Gran Reserva, queso mozzarella y orégano",
    },
    {
      id: "75",
      Categoria: "MontyDinas",
      Nombre: "Piadina de jamón cocido, queso madurado y tomate",
    },

    // --- MONTYPERROS ---
    {
      id: "76",
      Categoria: "MontyPerros",
      Nombre: "Hot dog, kétchup y mayonesa",
    },
    {
      id: "77",
      Categoria: "MontyPerros",
      Nombre: "Hot dog, cebolla crujiente y mojo picón",
    },
    {
      id: "78",
      Categoria: "MontyPerros",
      Nombre: "Hot dog, guacamole y salsa cheddar",
    },
    {
      id: "79",
      Categoria: "MontyPerros",
      Nombre: "Hot dog, patatas paja y salsa alioli",
    },
    {
      id: "80",
      Categoria: "MontyPerros",
      Nombre: "Hot dog, cebolla crujiente y salsa 100M",
    },

    // --- MONTYBURGERS ---
    {
      id: "81",
      Categoria: "MontyBurgers",
      Nombre: "Burger, queso madurado, tomate y mayonesa",
    },
    {
      id: "82",
      Categoria: "MontyBurgers",
      Nombre: "Burger, queso madurado y mojo picón",
    },
    {
      id: "83",
      Categoria: "MontyBurgers",
      Nombre: "Burger, guacamole y bacon ahumado",
    },
    {
      id: "84",
      Categoria: "MontyBurgers",
      Nombre: "Burger, bacon ahumado y salsa cheddar",
    },
    {
      id: "85",
      Categoria: "MontyBurgers",
      Nombre: "Burger, queso madurado y pepperoni",
    },

    // --- MONTYPIZZAS ---
    {
      id: "86",
      Categoria: "MontyPizzas",
      Nombre:
        "BBQ: bacon ahumado, queso mozzarella, cebolla crujiente y salsa BBQ",
    },
    {
      id: "87",
      Categoria: "MontyPizzas",
      Nombre: "Pollo: pollo kebab, queso mozzarella, salsa pizza y orégano",
    },
    {
      id: "88",
      Categoria: "MontyPizzas",
      Nombre:
        "3 Quesos: queso madurado, queso mozzarella, queso gorgonzola y orégano",
    },
    {
      id: "89",
      Categoria: "MontyPizzas",
      Nombre:
        "Pulled Pork: pulled pork BBQ, queso mozzarella, cebolla crujiente y salsa BBQ",
    },
    {
      id: "90",
      Categoria: "MontyPizzas",
      Nombre: "Pepperoni: pepperoni, queso mozzarella, salsa pizza y orégano",
    },

    // --- MONTYGOURMET ---
    {
      id: "91",
      Categoria: "MontyGourmet",
      Nombre: "Tortilla de patatas, tomate y mayonesa",
    },
    {
      id: "92",
      Categoria: "MontyGourmet",
      Nombre: "Salmón ahumado y huevo hilado",
    },
    {
      id: "93",
      Categoria: "MontyGourmet",
      Nombre: "Salmón ahumado y pintxo donostiarra",
    },
    {
      id: "94",
      Categoria: "MontyGourmet",
      Nombre: "Pintxo donostiarra y atún",
    },
    {
      id: "95",
      Categoria: "MontyGourmet",
      Nombre: "Pintxo donostiarra y huevo hilado",
    },
    {
      id: "96",
      Categoria: "MontyGourmet",
      Nombre: "Jamón cocido, queso madurado y mantequilla",
    },
    {
      id: "97",
      Categoria: "MontyGourmet",
      Nombre: "Jamón cocido, queso madurado, tomate y mayonesa",
    },
    { id: "98", Categoria: "MontyGourmet", Nombre: "Atún, tomate y mayonesa" },
    {
      id: "99",
      Categoria: "MontyGourmet",
      Nombre: "Atún, huevo hilado y mayonesa",
    },
    {
      id: "100",
      Categoria: "MontyGourmet",
      Nombre: "Jamón Gran Reserva y mantequilla",
    },
    // --- BEBIDAS ---
    { id: "200", Categoria: "Bebidas", Nombre: "Cerveza Quijote(33cl)" },
    { id: "201", Categoria: "Bebidas", Nombre: "Cerveza Sancho(54cl)" },
    { id: "202", Categoria: "Bebidas", Nombre: "Tinto Quijote(33cl)" },
    { id: "203", Categoria: "Bebidas", Nombre: "Tinto Sancho(54cl)" },
    { id: "204", Categoria: "Bebidas", Nombre: "Coca-Cola" },
    { id: "205", Categoria: "Bebidas", Nombre: "Coca-Cola Zero" },
    { id: "206", Categoria: "Bebidas", Nombre: "Fanta" },
    { id: "207", Categoria: "Bebidas", Nombre: "Sprite" },
    { id: "208", Categoria: "Bebidas", Nombre: "Fuze Tea" },
    { id: "209", Categoria: "Bebidas", Nombre: "Aquarius" },
    { id: "210", Categoria: "Bebidas", Nombre: "Appletiser" },
  ];

  try {
    console.log("Iniciando subida de la nueva carta...");
    for (const m of montaditos) {
      // Usamos setDoc con merge por si ya existe, que simplemente lo actualice sin romper otros campos
      await setDoc(doc(db, "montaditos", m.id), m, { merge: true });
    }
    console.log("¡Carta subida a Firebase con éxito!");
  } catch (error) {
    console.error("Error al subir la carta a Firebase: ", error);
  }
};
