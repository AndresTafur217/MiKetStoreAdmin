import { getAdminSales, recordAdminSale, recordInventoryMovements, saveAdminSales } from "./adminData.js";

const defaultCategories = [
  { id: 1, nombre: "Guitarras", descripcion: "Guitarras acústicas, eléctricas y electroacústicas", icon: "guitar" },
  { id: 2, nombre: "Bajos", descripcion: "Bajos eléctricos", icon: "bass" },
  { id: 3, nombre: "Pianos digitales", descripcion: "Pianos digitales y portátiles", icon: "piano" },
  { id: 4, nombre: "Teclados", descripcion: "Teclados y estaciones de escenario", icon: "keyboard" },
  { id: 5, nombre: "Pianos acústicos", descripcion: "Pianos acústicos verticales", icon: "piano" },
  { id: 6, nombre: "Violonchelos", descripcion: "Cellos para estudio e interpretación", icon: "cello" },
  { id: 7, nombre: "Violines", descripcion: "Violines acústicos y eléctricos", icon: "violin" },
  { id: 8, nombre: "Violas", descripcion: "Violas para estudiantes e intérpretes", icon: "viola" },
  { id: 9, nombre: "Ukeleles", descripcion: "Ukeleles acústicos", icon: "ukulele" },
  { id: 10, nombre: "Saxofones", descripcion: "Saxofones altos y otros registros", icon: "saxophone" },
  { id: 11, nombre: "Eufonios", descripcion: "Eufonios de viento metal", icon: "euphonium" },
  { id: 12, nombre: "Fagotes", descripcion: "Fagotes de sistema alemán", icon: "bassoon" },
  { id: 13, nombre: "Barítonos", descripcion: "Instrumentos barítonos de viento metal", icon: "baritone" },
  { id: 14, nombre: "Flautas piccolo", descripcion: "Flautas piccolo", icon: "piccolo" },
  { id: 15, nombre: "Tubas", descripcion: "Tubas de banda y concierto", icon: "tuba" },
  { id: 16, nombre: "Trombones", descripcion: "Trombones de vara", icon: "trombone" },
  { id: 17, nombre: "Melódicas", descripcion: "Melódicas portátiles", icon: "melodica" },
  { id: 18, nombre: "Aerófonos digitales", descripcion: "Instrumentos de viento electrónicos", icon: "digital-wind" },
  { id: 19, nombre: "Trompetas", descripcion: "Trompetas de viento metal", icon: "trumpet" },
];

const localImage = (file, alt) => ({
  url: `/productos/${file}`,
  alt,
});

const defaultProducts = [
  {
    id: 1,
    nombre: "Guitarra Acustica La Clasica Martin Sencilla Nylon",
    descripcion: "guitarra acustica martín sencilla tapa armónica en madera laminada, aros en moncoro, fondo en madera laminada, mástil en cedro, diapasón en moncoro, traste amarillo, roseta en calcomanía.",
    precio: 180500,
    descuento: -10,
    stock: 18,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [{ id: 1, nombre: "Guitarras" }],
    especificaciones: [
      { nombre: "Madera laminada" },
      { nombre: "6 cuerdas" },
      { nombre: "Mastil en cedro" },
      { nombre: "Diapasón en moncoro" },
      { nombre: "Traste amarillo" },
      { nombre: "Roseta en calcomanía" }
    ],
    imagenes: [
      localImage("guitar-acustic-martins-sencilla-1.webp", "Guitarra acústica sobre fondo claro")
    ],
    valoracionPromedio: 4.8,
    totalValoraciones: 24,
    createdAt: "2026-09-20",
  },
  {
    id: 2,
    nombre: "Guitarra Electrica Donner EC7484 Hush-X Pro Midnight Glow",
    descripcion: "guitarra eléctrica headless diseñada para músicos que buscan portabilidad, tecnología y versatilidad profesional. Su innovador diseño ultracompacto permite practicar y tocar en cualquier lugar con máxima comodidad, incorporando efectos integrados, conexión OTG y sistema silencioso para práctica con audífonos. El acabado Midnight Glow ofrece una apariencia moderna con efecto brillante y cambios de tono bajo diferentes luces, ideal para escenarios y contenido visual.",
    precio: 1790000,
    descuento: -5,
    stock: 15,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [{ id: 1, nombre: "Guitarras" }],
    especificaciones: [
      { nombre: "Cuerpo de caoba" },
      { nombre: "Pastillas Donner Lab Custom Alnico V" },
      { nombre: "Configuración Single-Coil + Humbucker" },
      { nombre: "Conexión OTG para dispositivos móviles" },
      { nombre: "Salida para audifonos y práctiva silenciosa" },
      { nombre: "Bateria recargable USB-C" },
      { nombre: "Sistema de afinación headless Donner" }
    ],
    imagenes: [
      localImage("donnerXpro_1.webp", "Guitarra Electríca Donner"),
      localImage("donnerXpro_2.webp", "Guitarra Electríca Donner parte trasera")
    ],
    valoracionPromedio: 4.6,
    totalValoraciones: 18,
    createdAt: "2026-09-18",
  },
  {
    id: 3,
    nombre: "Guitarra Electroacustica Mc-art A13ce-b Negra",
    descripcion: "Guitarra electroacústica de cuerpo sólido, ideal para ensayo y escenario.",
    precio: 539000,
    descuento: -10,
    stock: 12,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [{ id: 1, nombre: "Guitarras" }],
    especificaciones: [
      { nombre: "Marca MC-ART" },
      { nombre: "Madera Nato" },
      { nombre: "Microfono FreeMan A4T con afinador" },
      { nombre: "Sin estuche" }
    ],
    imagenes: [
      localImage("mc-art-a13ce-b-negra.webp", "Guitarra Electroacustica Mc-art A13ce-b Negra")
    ],
    valoracionPromedio: 4.7,
    totalValoraciones: 31,
    createdAt: "2026-09-15",
  },
  {
    id: 4,
    nombre: "Guitarra Electrica Mc-art E10w-s-b Negra",
    descripcion: "Guitarra eléctrica de cuerpo sólido, ideal para ensayo y escenario.",
    precio: 460000,
    descuento: 0,
    stock: 13,
    estado: "casi agotado",
    vendedor: "MiKet Store",
    categorias: [{ id: 1, nombre: "Guitarras" }],
    especificaciones: [
      { nombre: "Ref: E10W-S-B" },
      { nombre: "Microfono 3 Single" },
      { nombre: "Sin estuche" }
    ],
    imagenes: [
      localImage("guitar-electric-mc-art-e10w-s-b-1.webp", "Guitarra eléctrica Mc-art E10w-s-b"),
      localImage("guitar-electric-mc-art-e10w-s-b-2.webp", "Guitarra eléctrica Mc-art E10w-s-b"),
      localImage("guitar-electric-mc-art-e10w-s-b-3.webp", "Guitarra eléctrica Mc-art E10w-s-b")
    ],
    valoracionPromedio: 4.9,
    totalValoraciones: 12,
    createdAt: "2026-09-12",
  },
  {
    id: 5,
    nombre: "Guitarra Electrica Epiphone EGS1CHCH3 Ltd Ed Sg-Special-I Cherry",
    descripcion: "Perfecta para quienes buscan su primera SG o desean una guitarra ligera, confiable y con el sonido clásico del rock que ha marcado más de 50 años de historia. Mantiene el icónico diseño de doble corte, el tono poderoso de una SG tradicional y la comodidad que la ha convertido en un estándar en escenarios de todo el mundo.",
    precio: 979000,
    descuento: -5,
    stock: 15,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [{ id: 1, nombre: "Guitarras" }],
    especificaciones: [
      { nombre: "Ajustable" },
      { nombre: "Cuerpo en caoba" },
      { nombre: "Perfil SG de doble corte" },
      { nombre: "Pastillas Epiphone 700T y 650R" },
      { nombre: "Control de volumen y tono" },
      { nombre: "Puente Wraparound con clabilla sellada 15:1" },
    ],
    imagenes: [
      localImage("EGS1CHCH3_1.webp", "Guitarra electrica sobre fondo blanco"),
      localImage("EGS1CHCH3_2.webp", "Guitarra electrica sobre fondo blanco - controles")
    ],
    valoracionPromedio: 4.3,
    totalValoraciones: 9,
    createdAt: "2026-09-10",
  },
  {
    id: 6,
    nombre: "Guitarra Electroacustica Ibanez Frh10n-natural Flat Nylon",
    descripcion: "Guitarra eléctricoacustica de cuerpo sólido, ideal para ensayo y escenario.",
    precio: 1900000,
    descuento: -5,
    stock: 16,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [{ id: 1, nombre: "Guitarras" }],
    especificaciones: [
      { nombre: "Cuerpo FRH con refuerzo de ventilador" },
      { nombre: "Tapa maciza de pícea de Sitka" },
      { nombre: "Fondo de sapeli con aros de sapeli" },
      { nombre: "Mástil en forma de C Nyatoh" },
      { nombre: "Diapason y puente de nogal" },
      { nombre: "Pastilla Ibanez T-bar Undersaddle" }
    ],
    imagenes: [
      localImage("guitar-electroacustic-ibanez-frh10n-1.webp", "Guitarra eléctrica"),
      localImage("guitar-electroacustic-ibanez-frh10n-2.jpg", "Guitarra eléctrica - controles"),
      localImage("guitar-electroacustic-ibanez-frh10n-3.webp", "Guitarra eléctrica - parte trasera")
    ],
    valoracionPromedio: 4.8,
    totalValoraciones: 16,
    createdAt: "2026-09-08",
  },
  {
    id: 7,
    nombre: "Guitarra Acustica Epiphone Ea10nach1 Dr-100 Natural",
    descripcion: "Guitarra fiable y asequible con un sonido vibrante y colorido. Cuenta con una tapa de abeto y caoba detrás y a los lados, junto con la forma clásica del cuerpo acorazado, la guitarra entrega un tono rico y tiene un cuerpo con proyección de rango medio excelente, perfecto para prácticamente cualquier estilo y el magnífico acabado da un look propio de Epiphone.",
    precio: 1000000,
    descuento: -10,
    stock: 14,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 1, nombre: "Guitarras" },
    ],
    especificaciones: [
      { nombre: "Cuerpo en forma de Dreadnought" },
      { nombre: "Cuerdas de metal" },
      { nombre: "Diapason de palisandro" }
    ],
    imagenes: [
      localImage("guitar-acustic-epiphone-ea10nach1-dr-100-1.jpg", "Guitarra acústica Epiphone EA10NACH1 DR-100"),
      localImage("guitar-acustic-epiphone-ea10nach1-dr-100-2.jpg", "Guitarra acústica Epiphone EA10NACH1 DR-100 - parte trasera")
    ],
    valoracionPromedio: 4.9,
    totalValoraciones: 21,
    createdAt: "2026-09-06",
  },
  {
    id: 8,
    nombre: "Guitarra Electrica Ibanez IC420-ABM/ESTUCHE",
    descripcion: "Guitarra eléctrica Ibanez IC420-ABM con cuerpo de okumé y mástil encastrado.",
    precio: 3000000,
    descuento: -5,
    stock: 17,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [{ id: 1, nombre: "Guitarras" }],
    especificaciones: [
      { nombre: "Mástil encastrado IC Okoume de 3 piezas" },
      { nombre: "Cuerpo de okumé" },
      { nombre: "Diapasón de jatoba encuadernado con incrustaciones de acrílico y bloques de abulón" },
      { nombre: "Puente de Gibraltar Performer" },
      { nombre: "Pastilla de mástil y puente de Super 80 (H) pasiva/cerámica" }
    ],
    imagenes: [
      localImage("guitar-electric-ibanez_IC420_ABM_4L_01_1.jpg", "Guitarra eléctrica Ibanez IC420-ABM"),
      localImage("guitar-electric-ibanez_IC420_ABM_4L_01_2.jpg", "Guitarra eléctrica Ibanez IC420-ABM")
    ],
    valoracionPromedio: 4.7,
    totalValoraciones: 14,
    createdAt: "2026-09-04",
  },
  {
    id: 9,
    nombre: "Guitarra Electrica Kramer KEVDMBKBH3 Dave Mustaine Signature Vanguard Ebony - w/ Custom Hardshell Case",
    descripcion: "El Kramer Dave Mustaine Vanguard ofrece los sonidos potentes y pesados ​​y el rendimiento excepcional en el escenario y en el estudio que Dave exige. Está equipado con un cuerpo Vanguard de caoba simétrico, un mástil de caoba con escala de 25,5” con un perfil personalizado de Dave Mustaine en C medio, un diapasón de ébano con 24 trastes jumbo, herrajes cromados negros y el exclusivo juego de pastillas Seymour Duncan® Thrash Factor de Dave Mustaine. También se incluye un estuche rígido personalizado de Dave Mustaine.",
    precio: 7190000,
    descuento: -5,
    stock: 19,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [{ id: 1, nombre: "Guitarras" }],
    especificaciones: [
      { nombre: "Cuerpo en V de Vanguardia simétrica en Caoba" },
      { nombre: "Mástil en forma ce C mediano y diapasón de ébano de 24 trastes" },
      { nombre: "Pastillas de mástil y puente de Dave Mustaine Signature Seymour Duncan Thrash Factor Set" },
      { nombre: "Dos controles de volumen, control de Tono Maestro y potenciómetros CTS" }
    ],
    imagenes: [
      localImage("guitarra-electrica-kramer-kevdmbkbh3-1.webp", "Guitarra eléctrica Kramer KEVDMBKBH3"),
      localImage("guitarra-electrica-kramer-kevdmbkbh3-2.webp", "Guitarra eléctrica Kramer KEVDMBKBH3"),
      localImage("guitarra-electrica-kramer-kevdmbkbh3-3.webp", "Guitarra eléctrica Kramer KEVDMBKBH3")
    ],
    valoracionPromedio: 4.6,
    totalValoraciones: 28,
    createdAt: "2026-09-02",
  },
  {
    id: 10,
    nombre: "Guitarra Electrica Gibson DSXE00CHCH1 80s Explorer Cherry",
    descripcion: "La Gibson Explorer 80s está basada en los modelos Explorer de los años 80. Cuenta con cuerpo de caoba, mástil de caoba encolado con perfil SlimTaper y diapasón de palo de rosa con 22 trastes medio jumbo. Incorpora pastillas humbucker 80s Tribute, cableado a mano con condensadores Orange Drop, y selector de 3 posiciones. Su estética incluye hardware cromado, perillas Speed negras y no tiene golpeador. Incluye estuche rígido Gibson.",
    precio: 11900000,
    descuento: -5,
    stock: 15,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [{ id: 1, nombre: "Guitarras" }],
    especificaciones: [
      { nombre: "Cuerpo de caoba" },
      { nombre: "Mástil de caoba encolado, perfil SlimTaper" },
      { nombre: "Diapasón de palo de rosa con 22 trastes medio jumbo" },
      { nombre: "Pastillas humbucker 80s Tribute" }
    ],
    imagenes: [
      localImage("cherry.webp", "Guitarra Electrica Gibson en fondo blanco"),
      localImage("cherry_2.webp", "Guitarra Electrica Gibson en fondo blanco"),
      localImage("cherry_3.webp", "Guitarra Electrica Gibson en fondo blanco")
    ],
    valoracionPromedio: 4.8,
    totalValoraciones: 19,
    createdAt: "2026-08-29",
  },
  {
    id: 11,
    nombre: "Guitarra Electrica Jackson Rhoads X Srs Rrx24 W/blk 2913636520",
    descripcion: "Guitarra eléctrica Jackson X Series Rhoads RRX24, referencia 2913636520, con cuerpo de álamo, mástil de arce neck-through, diapasón de laurel, dos pastillas activas Seymour Duncan Blackouts y puente Floyd Rose Special de doble bloqueo. La Jackson X Series Rhoads RRX24 combina el diseño Rhoads con una construcción neck-through de arce, cuerpo de álamo y diapasón de laurel de radio compuesto. Integra dos pastillas activas Seymour Duncan Blackouts, controles independientes de volumen, control de tono y un puente Floyd Rose Special de doble bloqueo.",
    precio: 4900000,
    descuento: -5,
    stock: 14,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [{ id: 1, nombre: "Guitarras" }],
    especificaciones: [
      { nombre: "Mástil Neck-through-body de arce, con refuerzo de grafito y scarf joint" },
      { nombre: "Pastillas Dos Seymour Duncan Blackouts activas: AHB-1B en puente y AHB-1N en mástil" },
      { nombre: "Puente Floyd Rose Special Double-Locking Tremolo, recessed" },
      { nombre: "Diapasón Laurel con radio compuesto de 12 a 16 pulgadas y 24 trastes jumbo" }
    ],
    imagenes: [
      localImage("2913636520_jac_ins_frt_1_rr.webp", "Guitarra Electrica Jackson Rhoads X Srs Rrx24 W/blk 2913636520"),
      localImage("2913636520_jac_ins_bck_1_rr.webp", "Guitarra Electrica Jackson Rhoads X Srs Rrx24 W/blk 2913636520"),
      localImage("2913636520_jac_ins_bck_2_rr.webp", "Guitarra Electrica Jackson Rhoads X Srs Rrx24 W/blk 2913636520")
    ],
    valoracionPromedio: 4.5,
    totalValoraciones: 11,
    createdAt: "2026-08-26",
  },
  {
    id: 12,
    nombre: "Guitarra Electrica Kramer Tracii Guns Gunstar Voyager KVTGBKMCF3",
    descripcion: "Guitarra eléctrica Kramer Tracii Guns Gunstar Voyager KVTGBKMCF3, modelo signature del guitarrista Tracii Guns de LA Guns. Cuenta con cuerpo tipo Voyager de caoba con acabado Black Metallic y gráficos de llamas, mástil de arce de 3 piezas con perfil Slim C, diapasón de arce y sistema Floyd Rose Serie 1000. Equipada con dos pastillas Epiphone ProBucker con controles de volumen independientes y función push/pull para división de bobina, ofreciendo gran versatilidad tonal para rock y hard rock. Incluye estuche premium Kramer.",
    precio: 5737200,
    descuento: -5,
    stock: 16,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [{ id: 1, nombre: "Guitarras" }],
    especificaciones: [{
      nombre: "Cuerpo Voyager de caoba con acabado Black Metallic y gráficos de llamas"
    },
    { nombre: "Mástil de arce de 3 piezas con perfil Slim C y unión Set Neck" },
    { nombre: "Dos pastillas Epiphone ProBucker: ProBucker 2 (mástil) y ProBucker 3 (puente)" },
    { nombre: "Controles de volumen independientes con función push/pull para división de bobina" },
    { nombre: "Puente Floyd Rose Serie 1000 con cejuela bloqueadora Floyd Rose R2" },
    { nombre: "Diapasón de arce, radio 12.6 pulgadas y 22 trastes Jumbo" }
    ],
    imagenes: [
      localImage("guitarra-elec-kramer-tracii-guns-gunstar-voyayer-kvtgbkmcf3-1.webp", "Guitarra Kramer tracii Guns Gunstar Voyager KVTGBKMCF3"),
      localImage("guitarra-elec-kramer-tracii-guns-gunstar-voyayer-kvtgbkmcf3-2.webp", "Guitarra Kramer tracii Guns Gunstar Voyager KVTGBKMCF3"),
      localImage("guitarra-elec-kramer-tracii-guns-gunstar-voyayer-kvtgbkmcf3-3.webp", "Guitarra Kramer tracii Guns Gunstar Voyager KVTGBKMCF3")
    ],
    valoracionPromedio: 4.5,
    totalValoraciones: 11,
    createdAt: "2026-08-26",
  },
  {
    id: 13,
    nombre: "Guitarra Acustica Ibanez EWP14WB-OPN",
    descripcion: "Guitarra acústica Ibanez EWP14WB-OPN con cuerpo EW estilo tenor de tamaño compacto y cutaway superior. Construida con tapa, fondo y aros de ovangkol, mástil de okoume y diapasón de purpleheart (corazón púrpura). Su escala corta de 432 mm y afinación de fábrica A-D-G-C-E-A ofrecen una experiencia única entre una guitarra acústica tradicional y un instrumento de viaje. Incorpora puente embutido de purpleheart, roseta de abulón y clavijas cromadas de fundición de alta precisión.",
    precio: 890000,
    descuento: -5,
    stock: 18,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 1, nombre: "Guitarras" }
    ],
    especificaciones: [
      { nombre: "Cuerpo EW estilo tenor con cutaway superior" },
      { nombre: "Tapa, fondo y aros fabricados en ovangkol" },
      { nombre: "Mástil de okoume con diapasón de purpleheart" },
      { nombre: "Puente embutido de purpleheart con pines Ibanez Advantage" },
      { nombre: "19 trastes y escala de 432 mm (17 pulgadas)" },
      { nombre: "Clavijas cromadas de fundición con relación 15:1" }
    ],
    imagenes: [
      localImage("p_region_EWP14WB_OPN_2Y_09.webp", "Guitarra acústica Ibanez EWP14WB-OPN"),
      localImage("p_region_EWP14WB_OPN_2Y_09_sub_2.webp", "Guitarra acústica Ibanez EWP14WB-OPN")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 14,
    nombre: "Bajo Electrico Mc-Art E91B 5 Cuerdas BLK Mic Act",
    descripcion: "Bajo eléctrico Mc-Art E91B de 5 cuerdas con acabado negro (BLK) y sistema de micrófonos activos. Diseñado para ofrecer un amplio rango tonal gracias a su quinta cuerda, incorpora cuerpo de tilo, mástil de arce y electrónica activa con doble pastilla humbucker. Sus 24 trastes y ecualización activa permiten obtener sonidos profundos y definidos para estilos como rock, funk, pop, reggae y música contemporánea. Ideal para estudiantes, músicos en formación y bajistas que buscan potencia y versatilidad a un precio accesible. 【1-edf480】【2-a433eb】",
    precio: 890000,
    descuento: -5,
    stock: 16,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 2, nombre: "Bajos" }
    ],
    especificaciones: [
      { nombre: "Configuración de 5 cuerdas con rango extendido de frecuencias graves" },
      { nombre: "Cuerpo fabricado en tilo (Basswood)" },
      { nombre: "Mástil de arce de construcción ergonómica" },
      { nombre: "24 trastes para mayor alcance melódico" },
      { nombre: "Dos pastillas dobles activas tipo humbucker" },
      { nombre: "Electrónica activa con 4 controles para ajustes tonales" },
      { nombre: "Hardware cromado para estabilidad y durabilidad" },
      { nombre: "Acabado negro brillante (BLK)" }
    ],
    imagenes: [
      localImage("bajo-electrico-mc-art-e91b-5-cuerdas-blk-mic-act.webp", "Bajo eléctrico Mc-Art E91B 5 cuerdas negro activo")
    ],
    valoracionPromedio: 4.9,
    totalValoraciones: 11,
    createdAt: "2026-08-26"
  },
  {
    id: 15,
    nombre: "Bajo Electrico Epiphone EBTBVSBH1 T-Bird 4 Stg Rev",
    descripcion: "Bajo eléctrico Epiphone Thunderbird IV EBTBVSBH1 con el icónico diseño reverse Thunderbird desarrollado originalmente por Ray Dietrich. Construido con cuerpo de caoba, mástil de arce hard maple y diapasón de radio de 12 pulgadas, ofrece un sonido potente y definido gracias a sus dos pastillas humbucker Epiphone TB Plus. Su puente clásico de 3 puntos totalmente ajustable y controles independientes de volumen brindan una gran versatilidad para rock, hard rock y metal. Mantiene la estética clásica Thunderbird con hardware negro y acabado Vintage Sunburst.",
    precio: 2390000,
    descuento: -5,
    stock: 14,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 2, nombre: "Bajos" },
    ],
    especificaciones: [
      { nombre: "Cuerpo de caoba estilo Thunderbird Reverse" },
      { nombre: "Mástil de arce duro (Hard Maple) con perfil SlimTaper" },
      { nombre: "Diapasón con radio de 12 pulgadas y 20 trastes Jumbo Medium" },
      { nombre: "Dos pastillas Epiphone TB Plus Humbucker para bajo" },
      { nombre: "Puente clásico de 3 puntos totalmente ajustable" },
      { nombre: "Controles de volumen para mástil y puente más tono maestro" },
      { nombre: "Clavijeros Die-Cast Premium con relación 17:1" },
      { nombre: "Hardware negro y salida mono de 1/4 de pulgada" }
    ],
    imagenes: [
      localImage("bajo-electrico-epiphone-ebtbvsbh1-t-bird-4-stg-reverse-vint-sun-1.webp", "Bajo eléctrico Epiphone Thunderbird IV Vintage Sunburst"),
      localImage("bajo-electrico-epiphone-ebtbvsbh1-t-bird-4-stg-reverse-vint-sun-2.webp", "Bajo eléctrico Epiphone Thunderbird IV Vintage Sunburst")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 16,
    nombre: "Piano Digital Casio Privia PX-S1100MB Beige Meloso",
    descripcion: "Piano digital Casio Privia PX-S1100MB Beige diseñado para pianistas que buscan una experiencia auténtica en un formato compacto y portátil. Incorpora un teclado Smart Scaled Hammer Action de 88 teclas, motor de sonido Morphing AiR Multidimensional y una polifonía de 192 notas para una interpretación natural y expresiva. Incluye conectividad inalámbrica de audio y MIDI mediante el adaptador WU-BT10, grabador MIDI y de audio integrados, además de 18 sonidos de alta calidad y 60 canciones incorporadas para práctica y aprendizaje. 【1-6225d2】",
    precio: 3590000,
    descuento: 0,
    stock: 15,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 3, nombre: "Pianos digitales" }
    ],
    especificaciones: [
      { nombre: "Teclado Smart Scaled Hammer Action de 88 teclas" },
      { nombre: "Motor de sonido Morphing AiR Multidimensional" },
      { nombre: "Polifonía máxima de 192 notas" },
      { nombre: "18 sonidos integrados de alta calidad" },
      { nombre: "Conectividad inalámbrica de audio y MIDI mediante adaptador WU-BT10 incluido" },
      { nombre: "Grabador MIDI de 2 pistas y grabador de audio integrado" },
      { nombre: "Sistema de altavoces estéreo de 8 W + 8 W" },
      { nombre: "Alimentación por adaptador AD-A12150LW o 6 baterías AA" },
      { nombre: "Peso de 11,2 kg sin baterías" }
    ],
    imagenes: [
      localImage("PX-S1100MB-1BEIS.webp", "Piano Digital Casio Privia PX-S1100MB Beige Meloso")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 17,
    nombre: "Teclado Roland V-Stage 88",
    descripcion: "Teclado de escenario Roland V-Stage 88 diseñado para músicos profesionales que requieren máximo control y calidad sonora en directo. Integra cuatro motores de sonido independientes para órgano, piano acústico, piano eléctrico y sintetizador, cada uno con controles dedicados para una experiencia intuitiva y fluida. Su teclado contrapesado de 88 teclas con acción de martillo, escapement e Ivory Feel proporciona una respuesta auténtica para intérpretes de piano. Además, incorpora tecnología V-Piano, SuperNATURAL, Virtual Tone Wheel y ZEN-Core, ofreciendo una amplia biblioteca de sonidos y herramientas avanzadas para actuaciones en vivo.",
    precio: 17390000,
    descuento: -5,
    stock: 20,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 4, nombre: "Teclados" }
    ],
    especificaciones: [
      { nombre: "Teclado de 88 teclas con acción de martillo, escapement e Ivory Feel" },
      { nombre: "Cuatro motores de sonido independientes: Órgano, Piano Acústico, Piano Eléctrico y Sintetizador" },
      { nombre: "Tecnología V-Piano para pianos acústicos de alto realismo" },
      { nombre: "Motor SuperNATURAL para pianos eléctricos" },
      { nombre: "Motor ZEN-Core con más de 400 sonidos de sintetizador" },
      { nombre: "512 escenas y 128 cadenas de escenas para actuaciones en vivo" },
      { nombre: "Pantalla gráfica LCD a color de 4.3 pulgadas" },
      { nombre: "Conectividad MIDI, USB-C Audio/MIDI, USB-A, entradas de línea y entrada de micrófono XLR" },
      { nombre: "Salidas principales XLR y TRS balanceadas, además de salidas SUB dedicadas" },
      { nombre: "Dimensiones 1331 x 353 x 143 mm y peso aproximado de 21.8 kg" }
    ],
    imagenes: [
      localImage("v-stage_88_top_gal.webp", "Teclado Roland V-Stage 88"),
      localImage("v-stage_88_back_gal.avif", "Teclado Roland V-Stage 88")
    ],
    valoracionPromedio: 4.8,
    totalValoraciones: 7,
    createdAt: "2026-08-26"
  },
  {
    id: 18,
    nombre: "Piano Acustico Ritmuller Vertical RS118 A111",
    descripcion: "Piano acústico vertical Ritmüller RS118 A111 diseñado para estudiantes avanzados, instituciones musicales y pianistas que buscan un instrumento con excelente proyección sonora y calidad de construcción. Cuenta con una altura de 119 cm, tapa armónica de abeto de grano fino, cuerdas Röslau fabricadas en Alemania y martillos Pearl River de alta calidad. Incorpora tapa de teclado con cierre suave y mecánica Pearl River, ofreciendo una respuesta precisa y una interpretación cómoda y expresiva.",
    precio: 17900000,
    descuento: -5,
    stock: 12,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 5, nombre: "Pianos acústicos" }
    ],
    especificaciones: [
      { nombre: "Tipo: Piano acústico vertical" },
      { nombre: "Altura de 119 cm" },
      { nombre: "Ancho de 150 cm" },
      { nombre: "Profundidad de 60 cm" },
      { nombre: "Peso de 248 kg" },
      { nombre: "Cuerdas Röslau de alta calidad fabricadas en Alemania" },
      { nombre: "Martillos Pearl River de alta calidad" },
      { nombre: "Tapa armónica de abeto de grano fino" },
      { nombre: "Mecánica Pearl River" },
      { nombre: "Tapa de teclado con cierre suave" }
    ],
    imagenes: [
      localImage("RC118-BlackChrome-221019.webp", "Piano Acustico Ritmuller Vertical RS118 A111")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 19,
    nombre: "Cello Cervini HC-100 1/4",
    descripcion: "Violonchelo Cervini HC-100 tamaño 1/4 diseñado para estudiantes que inician su formación musical. Construido con tapa de abeto sólido, fondo y costados de arce sólido, mástil de arce y diapasón ebonizado. Su configuración facilita una digitación precisa y una correcta entonación durante el aprendizaje. Incluye componentes resistentes y acabado rojo tradicional barnizado.",
    precio: 1590000,
    descuento: -5,
    stock: 4,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 6, nombre: "Violonchelos" }
    ],
    especificaciones: [
      { nombre: "Tapa de abeto sólido" },
      { nombre: "Fondo y costados de arce sólido" },
      { nombre: "Mástil de arce sólido con acabado aceitado" },
      { nombre: "Diapasón de madera teñida tipo ebonizado" },
      { nombre: "Puente Cremona VP-14 de arce envejecido" },
      { nombre: "Cordal compuesto con afinadores finos integrados" }
    ],
    imagenes: [
      localImage("7700000006677_25b04db4-31d1-4c78-8563-4299f0f40000.webp", "Cello Cervini HC-100 1/4")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 20,
    nombre: "Cello Cervini HC-300 3/4",
    descripcion: "Violonchelo Cervini HC-300 tamaño 3/4 orientado a estudiantes intermedios. Fabricado con tapa de abeto, fondo de arce y componentes diseñados para proporcionar una correcta entonación y facilidad de ejecución. Incluye accesorios esenciales para comenzar a tocar inmediatamente.",
    precio: 2990000,
    descuento: -5,
    stock: 6,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 6, nombre: "Violonchelos" }
    ],
    especificaciones: [
      { nombre: "Tamaño 3/4" },
      { nombre: "Tapa de abeto" },
      { nombre: "Parte posterior de arce" },
      { nombre: "Diapasón de madera" },
      { nombre: "Espaciado optimizado para entonación precisa" },
      { nombre: "Incluye arco, tula de nylon y colofonia" }
    ],
    imagenes: [
      localImage("0911390.webp", "Cello Cervini HC-300 3/4")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 21,
    nombre: "Violin Cervini HV-300 3/4",
    descripcion: "Violín Cervini HV-300 tamaño 3/4 fabricado con maderas macizas seleccionadas de pícea y arce. Diseñado para estudiantes que requieren una mejor respuesta acústica y una entonación precisa. Incluye arco, estuche tipo mochila y colofonia.",
    precio: 690000,
    descuento: -5,
    stock: 6,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 7, nombre: "Violines" }
    ],
    especificaciones: [
      { nombre: "Tamaño 3/4" },
      { nombre: "Maderas macizas de pícea y arce" },
      { nombre: "Mentonera de ébano con acabado al aceite" },
      { nombre: "Espaciado optimizado para mejor entonación" },
      { nombre: "Arco Anton Breton AB-112" },
      { nombre: "Incluye estuche y colofonia" }
    ],
    imagenes: [
      localImage("violin-amadeus-3-4-hv30034_1.webp", "Violin Cervini HV-300 3/4")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 22,
    nombre: "Cello Cremona SC-75 4/4",
    descripcion: "Violonchelo Cremona SC-75 tamaño completo 4/4 perteneciente a la serie Novice. Construido con tapa de abeto macizo, fondo y costados de arce macizo, además de accesorios ebonizados. Diseñado para estudiantes que buscan calidad, facilidad de interpretación y una respuesta acústica equilibrada.",
    precio: 3390000,
    descuento: -5,
    stock: 5,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 6, nombre: "Violonchelos" }
    ],
    especificaciones: [
      { nombre: "Tapa de abeto macizo" },
      { nombre: "Fondo y costados de arce macizo" },
      { nombre: "Mástil de arce macizo con acabado aceitado" },
      { nombre: "Diapasón ebonizado" },
      { nombre: "Cordal compuesto con cuatro afinadores integrados" },
      { nombre: "Equipado con cuerdas Anton Breton" }
    ],
    imagenes: [
      localImage("900.webp", "Cello Cremona SC-75 4/4")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 23,
    nombre: "Viola Mc-Art L1413P 1/2 14\"",
    descripcion: "Viola Mc-Art L1413P de tamaño 1/2 (14 pulgadas), diseñada para estudiantes jóvenes que requieren un instrumento cómodo y fácil de tocar. Incluye estuche, arco y colofonia para comenzar a practicar desde el primer día.",
    precio: 312550,
    descuento: -5,
    stock: 8,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 8, nombre: "Violas" }
    ],
    especificaciones: [
      { nombre: "Tamaño 1/2 equivalente a 14 pulgadas" },
      { nombre: "Marca Mc-Art" },
      { nombre: "Referencia L1413P" },
      { nombre: "Incluye estuche protector" },
      { nombre: "Incluye arco" },
      { nombre: "Incluye colofonia" },
      { nombre: "Diapasón teñido" },
      { nombre: "Cuerpo teñido" }
    ],
    imagenes: [
      localImage("violamc-art.webp", "Viola Mc-Art L1413P 1/2 14")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 24,
    nombre: "Ukelele Martin Concierto W/GB 1120210XKCONCERTUK",
    descripcion: "Ukelele acústico Martin 0XK Concert Uke perteneciente a la reconocida serie X. Su cuerpo tamaño concierto está construido con laminado de alta presión (HPL) con patrón de koa, ofreciendo gran resistencia y una estética elegante. Incorpora mástil de abedul laminado, diapasón de sipo y puente de morado. Incluye funda blanda para facilitar su transporte y almacenamiento.",
    precio: 1900000,
    descuento: -5,
    stock: 6,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 9, nombre: "Ukeleles" }
    ],
    especificaciones: [
      { nombre: "Formato concierto (Concert Ukulele)" },
      { nombre: "Tapa, fondo y aros en HPL con patrón de koa" },
      { nombre: "Mástil de laminado de abedul marrón" },
      { nombre: "Diapasón de sipo con incrustaciones de puntos" },
      { nombre: "Puente de morado" },
      { nombre: "Cejuela y selleta compensada TUSQ blanca" },
      { nombre: "17 trastes" },
      { nombre: "Escala de 15 pulgadas" },
      { nombre: "Clavijas niqueladas para ukelele" },
      { nombre: "Incluye funda blanda" }
    ],
    imagenes: [
      localImage("OXK-Uke-Koa_frente-900x900.webp", "Ukelele Martin Concierto 0XK"),
      localImage("0XK-CONCERT-UKE_h.webp", "Ukelele Martin Concierto 0XK")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 25,
    nombre: "Ukulele Fender Seaside Soprano 0971620521",
    descripcion: "Ukulele Fender Seaside Soprano diseñado para principiantes y músicos que buscan un instrumento portátil y fácil de tocar. Presenta un sonido brillante y cálido gracias a su construcción en nogal y cuerdas de nailon. Se entrega como paquete completo con funda, correa, soporte, afinador de clip, púas y un juego adicional de cuerdas.",
    precio: 990000,
    descuento: -5,
    stock: 5,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 9, nombre: "Ukeleles" }
    ],
    especificaciones: [
      { nombre: "Formato soprano" },
      { nombre: "Tapa en nogal" },
      { nombre: "Fondo en nogal" },
      { nombre: "4 cuerdas de nailon" },
      { nombre: "Acabado natural" },
      { nombre: "Diseño Fender Seaside" },
      { nombre: "Incluye funda tipo gig bag" },
      { nombre: "Incluye afinador de clip" },
      { nombre: "Incluye correa y soporte" },
      { nombre: "Incluye cuerdas adicionales y púas" }
    ],
    imagenes: [
      localImage("ukulele-fender-seaside-soprano-0971620521-the-music-site-1.jfif", "Ukulele Fender Seaside Soprano"),
      localImage("ukulele-fender-seaside-soprano-0971620521-the-music-site-4.jfif", "Ukulele Fender Seaside Soprano")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 26,
    nombre: "Violin Electrico Mc-Art LVE-W14",
    descripcion: "Violín eléctrico Mc-Art LVE-W14 con diseño moderno y ligero, ideal para práctica, grabación y presentaciones en vivo. Ofrece un sonido claro y potente mediante su sistema electrónico integrado. Su construcción liviana facilita largas sesiones de interpretación y permite conectarlo a amplificadores o utilizar audífonos para practicar de forma silenciosa.",
    precio: 719100,
    descuento: -10,
    stock: 6,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 7, nombre: "Violines" }
    ],
    especificaciones: [
      { nombre: "Violín eléctrico de 4 cuerdas" },
      { nombre: "Diseño ergonómico y ligero" },
      { nombre: "Sistema electrónico integrado" },
      { nombre: "Control de volumen y tono incorporado" },
      { nombre: "Salida para amplificador y para audífonos" },
      { nombre: "Incluye arco" },
      { nombre: "Incluye estuche" },
      { nombre: "Incluye hombrera y colofonia" }
    ],
    imagenes: [
      localImage("2_ec6ef224-569c-4a32-b2cb-9e5e10acc938.webp", "Violin Electrico Mc-Art LVE-W14"),
      localImage("3_c16dd3f9-d919-4721-88b6-bdecd4609691.webp", "Violin Electrico Mc-Art LVE-W14"),
      localImage("1_4483944c-c1e9-425c-a090-2db72cf5bea3.webp", "Violin Electrico Mc-Art LVE-W14")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 27,
    nombre: "Saxofon Alto Victory G2-UAGB",
    descripcion: "Saxofón alto profesional Victory G2-UAGB de la serie Uprise, afinado en Mi bemol (Eb). Diseñado para músicos exigentes que buscan potencia, ergonomía y calidad sonora profesional. Incorpora una campana ampliada que mejora la proyección y presencia del sonido, chimeneas roladas individualmente que enriquecen la resonancia y prolongan la vida útil de las zapatillas, además de resonadores metálicos que aportan mayor brillo y volumen. Sus zapatillas italianas Pisoni premium, muelles de acero azul y llaves de palma ajustables garantizan una respuesta rápida, cómoda y precisa. Incluye estuche rígido de protección y transporte.",
    precio: 16000000,
    descuento: -5,
    stock: 4,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 10, nombre: "Saxofones" }
    ],
    especificaciones: [
      { nombre: "Saxofón alto profesional afinado en Mi bemol (Eb)" },
      { nombre: "Llave de Fa# agudo para mayor extensión tonal" },
      { nombre: "Campana ampliada para mayor proyección y presencia sonora" },
      { nombre: "Chimeneas roladas individualmente para mejorar la respuesta acústica" },
      { nombre: "Zapatillas italianas Pisoni de grado premium" },
      { nombre: "Muelles de acero azul para acción rápida y duradera" },
      { nombre: "Llaves de palma ajustables para ergonomía personalizada" },
    ],
    imagenes: [
      localImage("WhatsAppImage2026-06-25at2.37.51PM.webp", "Saxofon Alto Victory G2-UAGB")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 28,
    nombre: "Eufonio Besson BE164-2-0 4 Pistones",
    descripcion: "Eufonio Besson Prodige BE164-2-0 afinado en Sib (Bb), diseñado para estudiantes avanzados y músicos que buscan la calidad y tradición sonora característica de la marca Besson. Fabricado en latón amarillo con acabado plateado, combina una respuesta equilibrada, excelente proyección y una gran facilidad de ejecución. Está equipado con cuatro pistones en línea de acero inoxidable que proporcionan una acción suave, rápida y precisa. Su campana de gran diámetro produce un sonido cálido, centrado y rico en armónicos, ideal tanto para bandas sinfónicas como para ensambles de metales. Incluye estuche rígido, boquilla, aceite para pistones y paño de limpieza.",
    precio: 10355000,
    descuento: -5,
    stock: 5,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 11, nombre: "Eufonios" }
    ],
    especificaciones: [
      { nombre: "Afinación en Sib (Bb)" },
      { nombre: "4 pistones en línea de acero inoxidable" },
      { nombre: "Tubería de 14.72 mm (0.580 pulgadas)" },
      { nombre: "Campana de 280 mm (11 pulgadas)" },
      { nombre: "Cuerpo fabricado en latón amarillo" },
      { nombre: "3 llaves de desagüe para mantenimiento" },
      { nombre: "Soporte para lira integrado" },
    ],
    imagenes: [
      localImage("Bessoneufonio4pistoniBE164-22_1.webp", "Eufonio Besson BE164-2-0 4 Pistones"),
      localImage("Bessoneufonio4pistoniBE164-22_3.webp", "Eufonio Besson BE164-2-0 4 Pistones"),
      localImage("Bessoneufonio4pistoniBE164-22_4.webp", "Eufonio Besson BE164-2-0 4 Pistones")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 29,
    nombre: "Fagot Schreiber WS5016-2-0",
    descripcion: "Fagot Schreiber S16 WS5016-2-0 de sistema alemán, diseñado para estudiantes avanzados, conservatorios y escuelas de música que buscan un instrumento con características semiprofesionales. Fabricado en madera de arce alpino envejecida durante 10 años, ofrece una afinación precisa, gran proyección y un timbre cálido y equilibrado. Incorpora mejoras técnicas como bloqueador en la llave Whisper, segunda llave de Sib para el dedo anular y llave de trino de Do# para el dedo índice derecho, proporcionando mayor comodidad y versatilidad en la interpretación. Su taladro rediseñado con recubrimiento Luracast protege la madera de la humedad y mejora la respuesta acústica. Incluye estuche rígido con funda exterior tipo mochila y compartimentos para accesorios y partituras. 【1-5c8d83】【2-9cc316】",
    precio: 41705000,
    descuento: -5,
    stock: 4,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 12, nombre: "Fagotes" }
    ],
    especificaciones: [
      { nombre: "Sistema alemán" },
      { nombre: "Cuerpo fabricado en madera de arce alpino envejecida durante 10 años" },
      { nombre: "25 llaves plateadas incluyendo llave de Re agudo" },
      { nombre: "Llave doble de Do grave" },
      { nombre: "Bloqueador integrado en la llave Whisper" },
      { nombre: "Segunda llave de Sib para el dedo anular" },
      { nombre: "Llave de trino de Do# para el dedo índice derecho" },
      { nombre: "Taladro rediseñado con recubrimiento Luracast contra la humedad" },
      { nombre: "2 tudeles plateados KER1 y KER2 martilleados a mano" },
    ],
    imagenes: [
      localImage("fagot_schreiber_5016_estudiante_ws5016_ede8a51a-b844-4998-9c4a-60a33638f96b.webp", "Fagot Schreiber WS5016-2-0"),
      localImage("fagot_schreiber_5016_estudiante_ws5016__0.webp", "Fagot Schreiber WS5016-2-0"),
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 30,
    nombre: "Baritono Roy Benson BH-302 RB701468",
    descripcion: "Barítono Roy Benson BH-302 RB701468, instrumento de viento-metal diseñado para estudiantes avanzados, bandas sinfónicas y músicos que buscan una respuesta equilibrada y una construcción robusta. Fabricado en latón con acabado lacado transparente, ofrece una sonoridad cálida y una excelente proyección. Su sistema de 3 pistones frontales de acero inoxidable proporciona una acción suave y precisa, mientras que la campana de gran diámetro contribuye a una emisión sonora rica y potente. Incluye estuche ligero tipo mochila para facilitar el transporte y almacenamiento del instrumento.",
    precio: 3030500,
    descuento: -5,
    stock: 5,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 13, nombre: "Barítonos" }
    ],
    especificaciones: [
      { nombre: "Afinación en Sib (Bb)" },
      { nombre: "3 pistones frontales de acero inoxidable" },
      { nombre: "Diámetro de tubería de 13.2 mm" },
      { nombre: "Campana de 240 mm de diámetro" },
      { nombre: "Cuerpo fabricado en latón" },
      { nombre: "Acabado lacado transparente" },
      { nombre: "Llaves de desagüe para mantenimiento" },
      { nombre: "Incluye boquilla original Roy Benson" },
      { nombre: "Incluye estuche ligero tipo mochila" },
    ],
    imagenes: [
      localImage("BH-302RB701468.webp", "Baritono Roy Benson BH-302 RB701468"),
      localImage("BH-302RB701468_3.webp", "Baritono Roy Benson BH-302 RB701468"),
      localImage("BH-302RB701468_1.webp", "Baritono Roy Benson BH-302 RB701468")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 31,
    nombre: "Flauta Piccolo Jupiter JPC-905ES / JPC 1100E",
    descripcion: "Flauta Piccolo Jupiter JPC-1100E diseñada para músicos avanzados que buscan una sonoridad cálida, potente y con gran proyección. Fabricada con cuerpo y cabezal de madera de grenadilla, ofrece una respuesta refinada y una riqueza tonal característica de los instrumentos profesionales. Incorpora mecanismo Split E para mejorar la afinación y respuesta en el registro agudo, especialmente en la nota Mi, mientras que su diseño de taladro cónico favorece una entonación uniforme y una emisión rápida. Las llaves plateadas proporcionan precisión, durabilidad y una ejecución cómoda tanto en bandas sinfónicas como en repertorio de concierto. Incluye estuche de madera estilo francés para una protección segura del instrumento. 【1-440200】【2-75097b】",
    precio: 6165500,
    descuento: -5,
    stock: 6,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 14, nombre: "Flautas piccolo" }
    ],
    especificaciones: [
      { nombre: "Afinación en Do (C)" },
      { nombre: "Cuerpo fabricado en madera de grenadilla" },
      { nombre: "Cabezal de grenadilla tallado a mano" },
      { nombre: "Llaves de níquel plateado" },
      { nombre: "Mecanismo Split E para mejorar la respuesta en el registro agudo" },
      { nombre: "Sistema de llaves tipo Plateau" },
      { nombre: "Muelles de acero inoxidable" },
      { nombre: "Zapatillas de alta calidad" },
    ],
    imagenes: [
      localImage("poccolojpc1100e.webp", "Flauta Piccolo Jupiter JPC-905ES JPC-1100E")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 32,
    nombre: "Tuba Victory VTU-TGL450R",
    descripcion: "Tuba Victory VTU-TGL450R perteneciente a la serie Triumph, diseñada para intérpretes avanzados, bandas sinfónicas y agrupaciones de metales que requieren una sonoridad potente y una excelente proyección. Afinada en Sib (BBb), cuenta con una construcción robusta en latón lacado en oro que proporciona un sonido profundo, cálido y equilibrado. Su sistema de 4 pistones ofrece una respuesta rápida y una digitación cómoda, permitiendo una ejecución precisa en todos los registros. Incluye estuche rígido para facilitar el transporte y proteger el instrumento durante ensayos y presentaciones.",
    precio: 24605000,
    descuento: -5,
    stock: 1,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 15, nombre: "Tubas" }
    ],
    especificaciones: [
      { nombre: "Afinación en Sib (BBb)" },
      { nombre: "Serie Triumph Professional" },
      { nombre: "Sistema de 4 pistones" },
      { nombre: "Construcción en latón" },
      { nombre: "Acabado Gold Lacquer (lacado dorado)" },
      { nombre: "Incluye boquilla original" },
    ],
    imagenes: [
      localImage("WhatsAppImage2024-05-22at14.53.36_146e7530.webp", "Tuba Victory VTU-TGL450R")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 33,
    nombre: "Trombone Tenor Victory VTRB-TSGL203",
    descripcion: "Trombón tenor Victory VTRB-TSGL203 perteneciente a la serie Triumph, diseñado para estudiantes avanzados, bandas sinfónicas y músicos que buscan una combinación de potencia, precisión y durabilidad. Construido en latón con acabado Gold Lacquer, proporciona una sonoridad cálida, equilibrada y de excelente proyección. Su vara de deslizamiento ofrece un movimiento suave y preciso, facilitando la interpretación en todos los registros. El diseño de la campana favorece una respuesta uniforme y una proyección clara tanto en ensambles como en presentaciones solistas.",
    precio: 3705000,
    descuento: -5,
    stock: 9,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 16, nombre: "Trombones" }
    ],
    especificaciones: [
      { nombre: "Trombón tenor afinado en Sib (Bb)" },
      { nombre: "Serie Triumph Professional" },
      { nombre: "Construcción en latón" },
      { nombre: "Acabado Gold Lacquer (lacado dorado)" },
      { nombre: "Incluye boquilla original" },
    ],
    imagenes: [
      localImage("TB_triumph1.webp", "Trombone Tenor Victory VTRB-TSGL203")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 34,
    nombre: "Melodica Hohner Airboard C944014 32 Key Carbon",
    descripcion: "Melódica Hohner AirBoard Carbon C944014 de 32 teclas, diseñada para músicos modernos que buscan un instrumento portátil, ligero y expresivo. Su diseño inspirado en instrumentos de escenario combina la facilidad de interpretación de un teclado con la expresividad de los instrumentos de viento. Cuenta con una carcasa robusta de color negro tipo carbono, teclado de respuesta cómoda y una boquilla ergonómica que permite tocar de pie o en movimiento. Es ideal para educación musical, ensambles, práctica personal y presentaciones en vivo. Incluye estuche acolchado para transporte seguro.",
    precio: 378100,
    descuento: -5,
    stock: 8,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 17, nombre: "Melódicas" }
    ],
    especificaciones: [
      { nombre: "Melódica de 32 teclas" },
      { nombre: "Rango tonal desde Fa hasta Do" },
      { nombre: "Diseño AirBoard Carbon de apariencia moderna" },
      { nombre: "Cuerpo ligero y resistente" },
    ],
    imagenes: [
      localImage("s-l1600.webp", "Melodica Hohner Airboard Carbon C944014 32"),
      localImage("WhiteAirboard-5.webp", "Melodica Hohner Airboard Carbon C944014 32")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 35,
    nombre: "Aerofono Digital Roland AE-05",
    descripcion: "Aerófono digital Roland AE-05 GO:LIVECAST, un instrumento de viento electrónico portátil diseñado para principiantes, estudiantes y músicos que desean explorar una amplia variedad de sonidos utilizando una digitación similar a la de instrumentos acústicos tradicionales. Incorpora tecnología SuperNATURAL de Roland, conectividad Bluetooth MIDI y audio, altavoz integrado y una gran selección de sonidos de saxofón, flauta, clarinete, trompeta, violín y sintetizadores. Su diseño ligero y compacto facilita la práctica en cualquier lugar, mientras que la aplicación Aerophone GO Plus amplía las posibilidades de aprendizaje e interpretación.",
    precio: 3231000,
    descuento: -10,
    stock: 7,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 18, nombre: "Aerófonos digitales" }
    ],
    especificaciones: [
      { nombre: "Más de 50 sonidos integrados de instrumentos acústicos y electrónicos" },
      { nombre: "Tecnología de sonido Roland SuperNATURAL" },
      { nombre: "Boquilla sensible a la respiración y articulación" },
      { nombre: "Conectividad Bluetooth MIDI y Bluetooth Audio" },
      { nombre: "Salida para auriculares de 3.5 mm y Puerto USB para conexión con ordenador y dispositivos compatibles" },
      { nombre: "Compatible con aplicación Aerophone GO Plus" },
      { nombre: "Funcionamiento mediante baterías o adaptador de corriente" },
    ],
    imagenes: [
      localImage("aerofono-digital-roland-go-ae-05-the-music-site-1.webp", "Aerofono Digital Roland AE-05")
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
  {
    id: 36,
    nombre: "Trompeta Victory VTRP-TSGL Triumph Series Gold Lacquer",
    descripcion: "Trompeta Victory VTRP-TSGL perteneciente a la serie Triumph, diseñada para músicos que buscan un instrumento con excelente respuesta, proyección y fiabilidad. Afinada en Sib (Bb), combina una construcción robusta en latón con un elegante acabado Gold Lacquer que favorece tanto la estética como la durabilidad. Su diseño permite una emisión clara, articulaciones precisas y una respuesta equilibrada en todos los registros, convirtiéndola en una opción adecuada para estudiantes avanzados, bandas sinfónicas, agrupaciones de jazz y músicos en formación profesional.",
    precio: 3505500,
    descuento: -5,
    stock: 10,
    estado: "disponible",
    vendedor: "MiKet Store",
    categorias: [
      { id: 19, nombre: "Trompetas" }
    ],
    especificaciones: [
      { nombre: "Trompeta afinada en Sib (Bb)" },
      { nombre: "Serie Triumph Professional" },
      { nombre: "Construcción en latón de alta resistencia" },
      { nombre: "Acabado Gold Lacquer (lacado dorado)" },
      { nombre: "Incluye boquilla original" },
    ],
    imagenes: [
      localImage( "trompeta-victory-vtrp-tsgl-triumph-series-gold-lacquer-the-music-site-1.webp", "Trompeta Victory VTRP-TSGL Triumph Series Gold Lacquer" ),
      localImage( "trompeta-victory-vtrp-tsgl-triumph-series-gold-lacquer-the-music-site-2.webp", "Trompeta Victory VTRP-TSGL Triumph Series Gold Lacquer" )
    ],
    valoracionPromedio: 0,
    totalValoraciones: 0,
    createdAt: "2026-08-26"
  },
];

const catalogChangeEvent = "miketstore:catalog-change";
const readCatalogCollection = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key);
    if (value === null) return fallback;
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export let categories = readCatalogCollection("miketstore-categories", defaultCategories);
export let products = readCatalogCollection("miketstore-products", defaultProducts)
  .map((product) => ({ ...product, proveedor: product.proveedor || "Por registrar" }));

export const getCatalogChangeEvent = () => catalogChangeEvent;

export function saveCatalogProducts(nextProducts) {
  products = nextProducts;
  window.localStorage.setItem("miketstore-products", JSON.stringify(products));
  window.dispatchEvent(new Event(catalogChangeEvent));
}

export function saveCatalogCategories(nextCategories) {
  categories = nextCategories;
  window.localStorage.setItem("miketstore-categories", JSON.stringify(categories));
  window.dispatchEvent(new Event(catalogChangeEvent));
}

export const demoUser = {
  id: "demo-user",
  nombre: "Andrea Tafur",
  email: "andrea.tafur@miketstore.com",
  password: "MiKet2026!",
};

const userStorageKey = "miketstore-current-user";
const authChangeEvent = "miketstore:auth-change";
let currentUserCacheRaw;
let hasCurrentUserCache = false;
let currentUserCacheValue = null;

export function subscribeToCurrentUser(callback) {
  window.addEventListener(authChangeEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(authChangeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

function notifyAuthChange() {
  window.dispatchEvent(new Event(authChangeEvent));
}

function userKey(name, userId = demoUser.id) {
  return `miketstore - ${name} - ${userId}`;
}

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function getCurrentUser() {
  try {
    const rawUser = localStorage.getItem(userStorageKey);
    if (!hasCurrentUserCache || rawUser !== currentUserCacheRaw) {
      currentUserCacheRaw = rawUser;
      hasCurrentUserCache = true;
      try {
        const storedUser = JSON.parse(rawUser || "null");
        currentUserCacheValue = storedUser?.id === demoUser.id
          ? { ...storedUser, nombre: demoUser.nombre, email: demoUser.email }
          : storedUser;
      } catch {
        currentUserCacheValue = null;
      }
    }
    return currentUserCacheValue;
  } catch {
    return null;
  }
}

export function loginDemoUser(email, password) {
  if (email.trim().toLowerCase() !== demoUser.email || password !== demoUser.password) return false;
  localStorage.setItem(userStorageKey, JSON.stringify({ id: demoUser.id, nombre: demoUser.nombre, email: demoUser.email }));
  notifyAuthChange();
  return true;
}

export function logoutDemoUser() {
  localStorage.removeItem(userStorageKey);
  notifyAuthChange();
}

export function getLocalFavorites(userId = demoUser.id) {
  const key = userKey("favorites", userId);
  let savedIds = readList(key);
  if (savedIds.length === 0 && localStorage.getItem(key) === null && userId === demoUser.id) {
    savedIds = [
      { productId: 1, createdAt: "2026-09-18T10:00:00.000Z" },
      { productId: 3, createdAt: "2026-09-19T10:00:00.000Z" },
      { productId: 7, createdAt: "2026-09-20T10:00:00.000Z" },
    ];
    localStorage.setItem(key, JSON.stringify(savedIds));
  }
  return savedIds
    .map(({ productId, createdAt }) => {
      const producto = products.find((product) => product.id === productId);
      return producto ? { id: productId, producto, createdAt } : null;
    })
    .filter(Boolean);
}

export function toggleLocalFavorite(productId, userId = demoUser.id) {
  const key = userKey("favorites", userId);
  const savedFavorites = getLocalFavorites(userId);
  const isSaved = savedFavorites.some((favorite) => favorite.id === productId);
  const nextFavorites = isSaved
    ? savedFavorites.filter((favorite) => favorite.id !== productId)
    : [{ id: productId, producto: products.find((product) => product.id === productId), createdAt: new Date().toISOString() }, ...savedFavorites];

  localStorage.setItem(key, JSON.stringify(nextFavorites.map(({ id, createdAt }) => ({ productId: id, createdAt }))));
  return nextFavorites;
}

export function getLocalCart(userId = demoUser.id) {
  return readList(userKey("cart", userId))
    .map(({ productId, quantity }) => {
      const producto = products.find((product) => product.id === productId);
      return producto ? { producto, quantity } : null;
    })
    .filter(Boolean);
}

export function addToCart(productId, userId = demoUser.id) {
  const key = userKey("cart", userId);
  const cart = getLocalCart(userId);
  const existing = cart.find((item) => item.producto.id === productId);
  const product = products.find((item) => item.id === productId);
  if (!product || product.stock < 1 || (existing && existing.quantity >= product.stock)) return cart;
  const updated = existing
    ? cart.map((item) => item.producto.id === productId ? { ...item, quantity: item.quantity + 1 } : item)
    : [...cart, { producto: product, quantity: 1 }];
  localStorage.setItem(key, JSON.stringify(updated.map(({ producto, quantity }) => ({ productId: producto.id, quantity }))));
  return updated;
}

export function updateCartQuantity(productId, quantity, userId = demoUser.id) {
  const key = userKey("cart", userId);
  const product = products.find((item) => item.id === productId);
  const updated = quantity < 1
    ? getLocalCart(userId).filter((item) => item.producto.id !== productId)
    : getLocalCart(userId).map((item) => item.producto.id === productId
      ? { ...item, quantity: Math.min(quantity, product?.stock ?? quantity) }
      : item);
  localStorage.setItem(key, JSON.stringify(updated.map(({ producto, quantity: itemQuantity }) => ({ productId: producto.id, quantity: itemQuantity }))));
  return updated;
}

export function removeFromCart(productId, userId = demoUser.id) {
  return updateCartQuantity(productId, 0, userId);
}

export function getLocalOrders(userId = demoUser.id) {
  const key = userKey("orders", userId);
  const orders = readList(key);
  const now = Date.now();
  let changed = false;
  const updatedOrders = orders.map((order) => {
    const paymentDueAt = Date.parse(order.paymentDueAt);
    if (order.status !== "En espera del pago" || !Number.isFinite(paymentDueAt) || paymentDueAt > now) {
      return order;
    }
    changed = true;
    return { ...order, status: "Pagado", paidAt: new Date(now).toISOString() };
  });

  if (changed) {
    localStorage.setItem(key, JSON.stringify(updatedOrders));
    const updatedIds = new Set(updatedOrders.filter((order) => order.status === "Pagado").map((order) => order.id));
    saveAdminSales(getAdminSales().map((sale) => updatedIds.has(sale.id) && !sale.fecha_pago
      ? { ...sale, estado: "Pagada", fecha_pago: new Date(now).toISOString() }
      : sale));
  }
  return updatedOrders;
}

export function checkoutCart(userId = demoUser.id, paymentMethod = "PSE", options = {}) {
  const cart = getLocalCart(userId);
  if (cart.length === 0 || cart.some(({ producto, quantity }) => quantity > producto.stock)) return null;
  const ordersKey = userKey("orders", userId);
  const paymentStartedAt = Date.now();
  const subtotal = cart.reduce((total, { producto, quantity }) => total + producto.precio * quantity, 0);
  const deliveryPrice = options.requiere_domicilio ? Number(options.precio_domicilio) || 0 : 0;
  const order = {
    id: `MK - ${Date.now()}`,
    createdAt: new Date(paymentStartedAt).toISOString(),
    status: "En espera del pago",
    paymentMethod,
    paymentDueAt: new Date(paymentStartedAt + 60_000).toISOString(),
    items: cart.map(({ producto, quantity }) => ({ productId: producto.id, nombre: producto.nombre, precio: producto.precio, quantity, imagenes: producto.imagenes })),
    total: subtotal + deliveryPrice,
  };
  localStorage.setItem(ordersKey, JSON.stringify([order, ...getLocalOrders(userId)]));
  localStorage.setItem(userKey("cart", userId), "[]");
  const saleUser = userId === demoUser.id ? { id: "USR-001", nombre: "Andrea", apellidos: "Tafur" } : { id: userId, nombre: "Cliente" };
  recordAdminSale(order, saleUser, { ...options, id_vendedor: options.id_vendedor || "USR-002" });
  const nextProducts = products.map((product) => {
    const quantitySold = cart.filter((item) => item.producto.id === product.id)
      .reduce((total, item) => total + item.quantity, 0);
    if (quantitySold === 0) return product;
    const stock = product.stock - quantitySold;
    return { ...product, stock, estado: stock === 0 ? "agotado" : stock <= 5 ? "casi agotado" : "disponible" };
  });
  saveCatalogProducts(nextProducts);
  recordInventoryMovements(cart.map(({ producto, quantity }) => ({
    id_producto: producto.id,
    id_referencia: order.id,
    tipo: "Salida por venta",
    unidades: quantity,
    id_usuario: userId === demoUser.id ? "USR-001" : userId,
  })));
  return order;
}