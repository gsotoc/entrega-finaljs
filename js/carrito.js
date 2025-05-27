//Obtengo el contenedor del carrito, del total, el carrito de compras del local storage y declaro la variable subtotal
const carrito = document.getElementById("carrito");
const carritoDeCompras = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
let subtotal = 0;
//Obtengo el valor por default de la moneda seleccionada, que será USD, lo hago globalmente para poder usar en las cards
let monedaSeleccionada = document.getElementById("monedas");
let finalizarCompra = document.getElementById("comprar");


/*Creo la función que me actualiza cada producto, puedo eliminar, sumar o restar en la cantidad del producto y se 
actualiza en el carrito*/
function actualizarProducto (e) {
  const target = e.target;
  const card = target.closest(".card");
  //Si no hay tarjetas salgo de la función para evitar ejecutar la funcion cuando no hay tarjetas para evitar errores
  if (!card) return; 

  const inputCantidad = card.querySelector(".input-cantidad").value;
  const idProducto = card.getAttribute("id");
  const prodSubtotal = card.querySelector(".subtotal");
  //Encuentro el producto en el carrito de compras y obtengo su index. Tuve que usar number porque el idProducto era un string
  const indexEnCarrito = carritoDeCompras.indexOf(carritoDeCompras.find(prod=> prod.id === Number(idProducto)));
  const producto = carritoDeCompras[indexEnCarrito];
  if(target.classList.contains("eliminar")){
      carritoDeCompras.splice(indexEnCarrito,1);
      card.remove();
  } else if (target.classList.contains("btn-agregar")) {
    producto.count++;
    inputCantidad = producto.count;
  } else if (target.classList.contains("btn-quitar") && producto.count > 1) {
    producto.count--;
    inputCantidad = producto.count;
  }

  if(!target.classList.contains("eliminar")){
    const subtotal = producto.count * producto.price;
    prodSubtotal.textContent = `Subtotal: ${monedaSeleccionada.value} ${subtotal.toFixed(2)}`;
  }

  actualizarTotal(carritoDeCompras)
  return localStorage.setItem("carritoDeCompras", JSON.stringify(carritoDeCompras));
}

document.addEventListener('DOMContentLoaded', ()=>{
    crearCarrito(carritoDeCompras);
    let botones = Array.from(document.querySelectorAll('button'))
    botones.forEach((boton)=> {boton.addEventListener("click", actualizarProducto)});

    //Event listener para cuando se cambia de moneda
    monedaSeleccionada.addEventListener('change', actualizarPrecio);

    //Event listener para finalizar la compra
    finalizarCompra.addEventListener('click',comprar);
});

