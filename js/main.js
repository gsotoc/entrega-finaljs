/*Declaro variables globales carrrito de compras y productosque será el array de productos 
traidos de la API-*/
let productos = [];
let carritoDeCompras = [];
let cotizaciones = [];
const cardsContainer = document.getElementById("cards");
//Obtengo el valor por default de la moneda seleccionada, que será USD, lo hago globalmente para poder usar en las cards
let monedaSeleccionada = document.getElementById("monedas");


/*Creo un event listener, una vez que carga el documento quiero que haga fetch al API fakestore 
y espere los resultados*/
document.addEventListener('DOMContentLoaded', async ()=>{
  //Obtengo los productos mediante un fetch a fakestore api
    productos = await getJsonData('https://fakestoreapi.com/products');
    //Creo la propiedad precio USD en cada producto, que será el valor original
    productos.forEach(producto => {
      producto.priceUSD = producto.price; // ← Guardar valor original
    });
    crearTarjetas(productos);
  //Agrego la funcionalidad de los botones de agregar al carrito
    eventListenersBotonesAgregar();
 
  const inputUsuario = document.querySelector("#inputUsuario");
  inputUsuario.addEventListener('keyup',filtrarProductos);

  //Una vez que carga todo el contenido ejecuto la funcion para obtener la cotizaciones
  obtenerCotizacion();

  monedaSeleccionada.addEventListener('change', actualizarPrecio);
  
});
  