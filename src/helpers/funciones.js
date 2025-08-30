function verificarStock(producto) {
  const stockMinimo = 5; // Define el nivel crítico
  if (producto.stock < stockMinimo) {
    console.log(`⚠️ Alerta: El producto ${producto.nombre} tiene stock bajo (${producto.stock}).`);
  }
}

module.exports = { verificarStock };