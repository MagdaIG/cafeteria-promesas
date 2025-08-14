document.addEventListener('DOMContentLoaded', () => {
  // Elementos de la interfaz
  const consoleOutput = document.getElementById('console');
  const logContainer = document.getElementById('log');
  const summarySection = document.getElementById('summary');
  const summaryBody = document.getElementById('summaryBody');
  const summaryAlert = document.getElementById('summaryAlert');
  const timerElement = document.getElementById('timer').querySelector('span');

  // Estado del pedido
  const pedido = {
    cafe: { listo: false, tiempo: null, error: null, icon: 'fa-mug-hot' },
    pan: { listo: false, tiempo: null, error: null, icon: 'fa-bread-slice' },
    jugo: { listo: false, tiempo: null, error: null, icon: 'fa-glass-water' }
  };

  // Variables de control
  let startTime = null;
  let timerInterval = null;

  // Función para limpiar la consola
  function limpiarConsola() {
    logContainer.innerHTML = '';
    summarySection.style.display = 'none';
    resetearPedido();
    detenerTemporizador();
    timerElement.textContent = '00:00';

    // Mostrar mensaje de bienvenida
    consoleOutput.querySelector('.welcome-message').style.display = 'block';
  }

  // Función para resetear el estado del pedido
  function resetearPedido() {
    Object.keys(pedido).forEach(key => {
      pedido[key] = {
        listo: false,
        tiempo: null,
        error: null,
        icon: pedido[key].icon
      };
    });
  }

  // Funciones del temporizador
  function iniciarTemporizador() {
    startTime = Date.now();
    timerInterval = setInterval(actualizarTemporizador, 1000);
  }

  function actualizarTemporizador() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    timerElement.textContent = `${minutes}:${seconds}`;
  }

  function detenerTemporizador() {
    clearInterval(timerInterval);
  }

  // Función para agregar mensajes a la consola
  function log(mensaje, tipo = 'info') {
    // Ocultar mensaje de bienvenida si existe
    const welcomeMsg = consoleOutput.querySelector('.welcome-message');
    if (welcomeMsg) welcomeMsg.style.display = 'none';

    const entry = document.createElement('div');
    entry.className = `log-entry ${tipo}`;

    const time = document.createElement('span');
    time.className = 'log-time';
    time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const icon = document.createElement('span');
    icon.className = 'log-icon';

    switch(tipo) {
      case 'success':
        icon.innerHTML = '<i class="fas fa-check-circle"></i>';
        break;
      case 'error':
        icon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
        break;
      default:
        icon.innerHTML = '<i class="fas fa-info-circle"></i>';
    }

    const message = document.createElement('span');
    message.className = 'log-message';
    message.textContent = mensaje;

    entry.appendChild(time);
    entry.appendChild(icon);
    entry.appendChild(message);

    logContainer.appendChild(entry);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }

  // Función para mostrar el resumen
  function mostrarResumen() {
    summarySection.style.display = 'block';
    summaryBody.innerHTML = '';

    for (const [itemKey, datos] of Object.entries(pedido)) {
      const fila = document.createElement('tr');

      // Nombre del ítem
      const nombreItem = document.createElement('td');
      nombreItem.innerHTML = `<i class="fas ${datos.icon} item-icon"></i>${itemKey.charAt(0).toUpperCase() + itemKey.slice(1)}`;

      // Estado
      const estado = document.createElement('td');
      const estadoBadge = document.createElement('span');
      estadoBadge.className = 'status-badge';

      if (datos.listo) {
        estadoBadge.classList.add('badge-success');
        estadoBadge.innerHTML = '<i class="fas fa-check"></i> Listo';
      } else if (datos.error) {
        estadoBadge.classList.add('badge-danger');
        estadoBadge.innerHTML = '<i class="fas fa-times"></i> Falló';
      } else {
        estadoBadge.classList.add('badge-secondary');
        estadoBadge.innerHTML = '<i class="fas fa-clock"></i> Pendiente';
      }

      estado.appendChild(estadoBadge);

      // Tiempo
      const tiempo = document.createElement('td');
      tiempo.textContent = datos.tiempo ? `${datos.tiempo.toFixed(1)} s` : '—';

      // Detalle
      const detalle = document.createElement('td');
      detalle.textContent = datos.listo ? 'Preparado correctamente' : (datos.error || 'No iniciado');

      fila.appendChild(nombreItem);
      fila.appendChild(estado);
      fila.appendChild(tiempo);
      fila.appendChild(detalle);

      summaryBody.appendChild(fila);
    }

    // Mostrar alerta resumen
    const itemsFallidos = Object.values(pedido).filter(item => item.error).length;

    summaryAlert.className = itemsFallidos > 0
      ? 'summary-alert alert-warning'
      : 'summary-alert alert-success';

    summaryAlert.innerHTML = itemsFallidos > 0
      ? `<i class="fas fa-exclamation-triangle"></i> Pedido completado con ${itemsFallidos} ${itemsFallidos === 1 ? 'incidencia' : 'incidencias'}`
      : `<i class="fas fa-check-circle"></i> ¡Pedido completado con éxito!`;
  }

  // Funciones que devuelven promesas para preparar los items
  function prepararCafe() {
    return new Promise((resolve, reject) => {
      const tiempo = 1 + Math.random() * 2; // 1-3 segundos
      const falla = Math.random() < 0.2; // 20% de probabilidad de fallo

      log(`Iniciando preparación de café...`, 'info');

      setTimeout(() => {
        if (falla) {
          const errores = ['Falta café', 'Máquina descompuesta', 'No hay agua'];
          const error = errores[Math.floor(Math.random() * errores.length)];
          reject(new Error(error));
        } else {
          resolve(tiempo);
        }
      }, tiempo * 1000);
    });
  }

  function tostarPan() {
    return new Promise((resolve, reject) => {
      const tiempo = 2 + Math.random() * 2; // 2-4 segundos
      const falla = Math.random() < 0.2; // 20% de probabilidad de fallo

      log(`Iniciando tostado de pan...`, 'info');

      setTimeout(() => {
        if (falla) {
          const errores = ['No hay pan', 'Tostadora rota', 'Se quemó el pan'];
          const error = errores[Math.floor(Math.random() * errores.length)];
          reject(new Error(error));
        } else {
          resolve(tiempo);
        }
      }, tiempo * 1000);
    });
  }

  function exprimirJugo() {
    return new Promise((resolve, reject) => {
      const tiempo = 1 + Math.random() * 1; // 1-2 segundos
      const falla = Math.random() < 0.2; // 20% de probabilidad de fallo

      log(`Iniciando exprimido de jugo...`, 'info');

      setTimeout(() => {
        if (falla) {
          const errores = ['No hay naranjas', 'Exprimidor roto', 'Faltan vasos'];
          const error = errores[Math.floor(Math.random() * errores.length)];
          reject(new Error(error));
        } else {
          resolve(tiempo);
        }
      }, tiempo * 1000);
    });
  }

  // Versión con .then() y .catch()
  function realizarPedidoThen() {
    limpiarConsola();
    iniciarTemporizador();
    log('Iniciando pedido con método .then/.catch', 'info');

    prepararCafe()
      .then(tiempo => {
        pedido.cafe.listo = true;
        pedido.cafe.tiempo = tiempo;
        log(`Café preparado en ${tiempo.toFixed(1)} segundos`, 'success');
        return tostarPan();
      })
      .catch(error => {
        pedido.cafe.error = error.message;
        log(`Error preparando café: ${error.message}`, 'error');
        return tostarPan();
      })
      .then(tiempo => {
        if (tiempo) {
          pedido.pan.listo = true;
          pedido.pan.tiempo = tiempo;
          log(`Pan tostado en ${tiempo.toFixed(1)} segundos`, 'success');
          return exprimirJugo();
        }
      })
      .catch(error => {
        pedido.pan.error = error.message;
        log(`Error tostando pan: ${error.message}`, 'error');
        return exprimirJugo();
      })
      .then(tiempo => {
        if (tiempo) {
          pedido.jugo.listo = true;
          pedido.jugo.tiempo = tiempo;
          log(`Jugo exprimido en ${tiempo.toFixed(1)} segundos`, 'success');
        }
      })
      .catch(error => {
        pedido.jugo.error = error.message;
        log(`Error exprimiendo jugo: ${error.message}`, 'error');
      })
      .finally(() => {
        detenerTemporizador();
        mostrarResumen();
      });
  }

  // Versión con async/await y try/catch
  async function realizarPedidoAsync() {
    limpiarConsola();
    iniciarTemporizador();
    log('Iniciando pedido con método async/await', 'info');

    try {
      const tiempoCafe = await prepararCafe();
      pedido.cafe.listo = true;
      pedido.cafe.tiempo = tiempoCafe;
      log(`Café preparado en ${tiempoCafe.toFixed(1)} segundos`, 'success');
    } catch (error) {
      pedido.cafe.error = error.message;
      log(`Error preparando café: ${error.message}`, 'error');
    }

    try {
      const tiempoPan = await tostarPan();
      pedido.pan.listo = true;
      pedido.pan.tiempo = tiempoPan;
      log(`Pan tostado en ${tiempoPan.toFixed(1)} segundos`, 'success');
    } catch (error) {
      pedido.pan.error = error.message;
      log(`Error tostando pan: ${error.message}`, 'error');
    }

    try {
      const tiempoJugo = await exprimirJugo();
      pedido.jugo.listo = true;
      pedido.jugo.tiempo = tiempoJugo;
      log(`Jugo exprimido en ${tiempoJugo.toFixed(1)} segundos`, 'success');
    } catch (error) {
      pedido.jugo.error = error.message;
      log(`Error exprimiendo jugo: ${error.message}`, 'error');
    }

    detenerTemporizador();
    mostrarResumen();
  }

  // Versión paralela con Promise.allSettled()
  async function realizarPedidoParalelo() {
    limpiarConsola();
    iniciarTemporizador();
    log('Iniciando pedido en paralelo con Promise.allSettled', 'info');

    const resultados = await Promise.allSettled([
      prepararCafe(),
      tostarPan(),
      exprimirJugo()
    ]);

    // Procesar resultados del café
    if (resultados[0].status === 'fulfilled') {
      pedido.cafe.listo = true;
      pedido.cafe.tiempo = resultados[0].value;
      log(`Café preparado en ${resultados[0].value.toFixed(1)} segundos`, 'success');
    } else {
      pedido.cafe.error = resultados[0].reason.message;
      log(`Error preparando café: ${resultados[0].reason.message}`, 'error');
    }

    // Procesar resultados del pan
    if (resultados[1].status === 'fulfilled') {
      pedido.pan.listo = true;
      pedido.pan.tiempo = resultados[1].value;
      log(`Pan tostado en ${resultados[1].value.toFixed(1)} segundos`, 'success');
    } else {
      pedido.pan.error = resultados[1].reason.message;
      log(`Error tostando pan: ${resultados[1].reason.message}`, 'error');
    }

    // Procesar resultados del jugo
    if (resultados[2].status === 'fulfilled') {
      pedido.jugo.listo = true;
      pedido.jugo.tiempo = resultados[2].value;
      log(`Jugo exprimido en ${resultados[2].value.toFixed(1)} segundos`, 'success');
    } else {
      pedido.jugo.error = resultados[2].reason.message;
      log(`Error exprimiendo jugo: ${resultados[2].reason.message}`, 'error');
    }

    detenerTemporizador();
    mostrarResumen();
  }

  // Event listeners para los botones
  document.getElementById('btnThen').addEventListener('click', realizarPedidoThen);
  document.getElementById('btnAsync').addEventListener('click', realizarPedidoAsync);
  document.getElementById('btnParallel').addEventListener('click', realizarPedidoParalelo);
  document.getElementById('btnClear').addEventListener('click', limpiarConsola);
});
