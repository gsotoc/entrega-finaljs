//Función para obtener los datos
async function getJsonData(url) {
  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    return datos
  } catch (error) {
    console.error('Error al cargar datos: ', error);
  }
};

//Funcion para crear las tarjetas de productos
function crearTarjetas (array) {
  array.forEach((producto)=> {
      producto.count = 1
    });
    array.forEach((producto) => {
    cardsContainer.insertAdjacentHTML("beforeend", `
      <article class="card">
          <header>
            <p>${producto.title}</p>
          </header>
          <div class="producto" id="${producto.id}">
            <img src="${producto.image}" alt="${producto.description}">
            <p>Precio: ${monedaSeleccionada.value} ${producto.price}</p>
          </div>
          <div class="btn">
          <button class="btnAgregar" id=${producto.id}>Agregar al carrito</button>
          </div>
      </article>
    `);
  });
  //Vuelvo a agregar los event listeners en cada boton de agregar al carrito
  eventListenersBotonesAgregar();

}


//Funcion para crear el carrito de compras
function crearCarrito(array){
  //Limpio el carrito porque se me estan sumando todas las tarjetas
  carrito.innerHTML = "";
  array.forEach((producto)=>{
    subtotal = (producto.count * producto.price).toFixed(2);
    carrito.insertAdjacentHTML("beforeend", `
      <article class="card" id="${producto.id}">
          <header>
            <p>${producto.title}</p>
            <button class="eliminar">X</button>
          </header>
          <div class="producto">
            <img src="${producto.image}" alt="${producto.description}">
            <p>Precio: ${monedaSeleccionada.value} ${producto.price}</p>
            <div>
                <p>Cantidad de artículos:</p>
                <button class="btn-quitar">-</button>               
                <input type="number" min="0" value="${producto.count}" class="input-cantidad">               
                <button class="btn-agregar">+</button>
            </div>
            <div>
              <p class="subtotal">Subtotal: ${monedaSeleccionada.value}  ${subtotal}</p>
            </div>
          </div>
      </article>
    `);
    })
    actualizarTotal(carritoDeCompras);

    //Vuelvo a agregar los event listeners porque sino luego de que ejecute la función se borran
    const botones = Array.from(carrito.querySelectorAll("button"));
    botones.forEach(boton => boton.addEventListener("click", actualizarProducto));
  };

/*Funcion para encontar que producto se seleccionó para agregar al carrito y retornar el index del producto en el 
array "productos"*/
function encontarProducto (e) {
  const idProducto = parseInt(e.target.getAttribute("id"));
  const productoEncontrado = productos.find((elemento)=> elemento.id === Number(idProducto));
  return productoEncontrado
};


//Funcion para filtrar productos desde el input en la barra de navegación
function filtrarProductos () {
  const input = inputUsuario.value.toLowerCase();
  let productoEncontrado = productos.filter((producto)=> producto.title.toLocaleLowerCase().includes(input));
  cardsContainer.innerHTML="";
  crearTarjetas(productoEncontrado);
  //Vuelvo a agregar los event listeners en cada boton de agregar al carrito
  eventListenersBotonesAgregar();
}

//Función para obtener la cotización de monedas en base al dolar
async function obtenerCotizacion() {
  let cotizaciones = await getJsonData('https://uy.dolarapi.com/v1/cotizaciones');
  //No estoy interesado en todas las monedas así que voy a filtrar las que quiero
  let monedasAceptadas = ["USD", "UYU", "ARS", "BRL", "EUR"];

  cotizaciones = cotizaciones
    .filter(elem=>monedasAceptadas.includes(elem.moneda))
    .map(elem => ({
    moneda: elem.moneda,
    compra: elem.compra
      })
    );
  const cotizacionUSD = cotizaciones.find(m => m.moneda === "USD");
  const cotizacionesBaseDolar = cotizaciones.map(cotizacion => ({
    moneda: cotizacion.moneda,
    compra: cotizacionUSD.compra / cotizacion.compra,
  }));
  //Agrego el peso uruguayo y guardo en local storage
  cotizacionesBaseDolar.push({moneda: "UYU", compra: cotizacionUSD.compra});
  localStorage.setItem("cotizaciones", JSON.stringify(cotizacionesBaseDolar));  
}

//Funcion para cambiar el precio cuando se elige otra moneda tanto en el carrito como en index
function actualizarPrecio(e) {
  let cotizaciones = JSON.parse(localStorage.getItem("cotizaciones"));
  let nuevaMoneda = e.target.value;
  const cotizacionMoneda = cotizaciones.find(m => m.moneda === nuevaMoneda);

  //Parte de index
  /*Uso el if porque esta función se ejecuta en index.js donde carritoDeCompras no está definido y 
  en carrito.js donde productos no está definido*/
  if(typeof(productos) !== "undefined"){
    productos.forEach(producto => {
    producto.price = (producto.priceUSD * cotizacionMoneda.compra).toFixed(2);
    });

    cardsContainer.innerHTML = "";
    crearTarjetas(productos);
  }

  //Parte de carrito de compras
  if(typeof(carritoDeCompras) !== "undefined"){
    carritoDeCompras.forEach(producto => {
    producto.price = (producto.priceUSD * cotizacionMoneda.compra).toFixed(2);
    });

    carrito.innerHTML = "";
    crearCarrito(carritoDeCompras);
  }
  //Vuelvo a agregar los event listeners en cada boton de agregar al carrito
  eventListenersBotonesAgregar();
}

//Creo una función que me calcula el valor total de los productos del carrito
function actualizarTotal (array) {
  let total = 0;
  const sectionTotal = document.getElementById("total");
  array.forEach((elem)=>{
    total += elem.count * elem.price;
  });
  sectionTotal.innerHTML="";
  sectionTotal.innerHTML= ` ${monedaSeleccionada.value} ${total.toFixed(2)}`;
}

//Función para agregar los event listeners en cada boton de agregar al carrito
//(la cree porque luego de ejecutar crearTarjetas estaba creando las tarjetas nuevamente y quedan sin event listeners)
function eventListenersBotonesAgregar() {
  const botones = document.querySelectorAll(".btnAgregar");
  botones.forEach((boton)=>{
    boton.addEventListener('click',(e)=>{
      let prod = encontarProducto(e);
      const prodEnCarrito = carritoDeCompras.find(elem => elem.id === prod.id);
      if (!prodEnCarrito) {
        carritoDeCompras.push(prod);
      } else {
        prod.count += 1;
      }
      localStorage.setItem('carritoDeCompras', JSON.stringify(carritoDeCompras));
    });
  });
}

//Funcion para finalizar la compra
function comprar () {
  let totalTarjeta = document.getElementById("total");
  if(carritoDeCompras.length > 0){
    totalTarjeta.innerHTML= `${monedaSeleccionada.value} 0`
  carrito.innerHTML="";
  carrito.innerHTML=`
  <article id="compraFinalizada" class="card">
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
    <p>Compra realizada con exito</p>
  </article>`;
  localStorage.removeItem("carritoDeCompras");
  }
}
