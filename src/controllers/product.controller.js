const { prisma } = require("../config/prisma");

// Listar productos por proveedor o todos los productos activos
async function list(req, res) {
  try {
    const { proveedorId, categoria, busqueda } = req.query;
    const where = {
      activo: true,
      ...(proveedorId && { proveedorId: parseInt(proveedorId) }),
      ...(categoria && { categoria }),
      ...(busqueda && {
        OR: [
          { nombre: { contains: busqueda, mode: 'insensitive' } },
          { descripcion: { contains: busqueda, mode: 'insensitive' } }
        ]
      })
    };

    const productos = await prisma.producto.findMany({
      where,
      include: {
        proveedor: {
          select: {
            nombreComercial: true,
            direccion: true,
            telefono: true,
            latitud: true,
            longitud: true
          }
        }
      },
      orderBy: { id: "asc" }
    });
    res.json(productos);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al listar productos" });
  }
}

// Listar productos del proveedor autenticado
async function listMyProducts(req, res) {
  try {
    const proveedor = await prisma.proveedor.findUnique({
      where: { userId: req.user.id }
    });

    if (!proveedor) {
      return res.status(403).json({ error: "Solo los proveedores pueden ver sus productos" });
    }

    const productos = await prisma.producto.findMany({
      where: { proveedorId: proveedor.id },
      orderBy: { id: "asc" }
    });
    res.json(productos);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al listar productos" });
  }
}

async function create(req, res) {
  try {
    const { nombre, precio, stock, descripcion, categoria, imagenUrl } = req.body;

    // Validar que sea un proveedor
    const proveedor = await prisma.proveedor.findUnique({
      where: { userId: req.user.id }
    });

    if (!proveedor) {
      return res.status(403).json({ error: "Solo los proveedores pueden crear productos" });
    }

    // Validar campos requeridos
    if (!nombre || !precio || !categoria) {
      return res.status(400).json({ error: "nombre, precio y categoria son requeridos" });
    }

    const producto = await prisma.producto.create({
      data: {
        nombre,
        precio,
        stock: stock || 0,
        descripcion,
        categoria,
        imagenUrl,
        proveedorId: proveedor.id,
        activo: true
      }
    });
    res.status(201).json(producto);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al crear producto" });
  }
}

async function getById(req, res) {
  try {
    const id = Number(req.params.id);
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        proveedor: {
          select: {
            nombreComercial: true,
            direccion: true,
            telefono: true,
            latitud: true,
            longitud: true
          }
        }
      }
    });

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(producto);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al obtener producto" });
  }
}

async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const { nombre, precio, stock, descripcion, categoria, imagenUrl, activo } = req.body;

    // Verificar que el producto exista y pertenezca al proveedor
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: { proveedor: true }
    });

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Verificar que sea el propietario del producto
    const proveedor = await prisma.proveedor.findUnique({
      where: { userId: req.user.id }
    });

    if (!proveedor || producto.proveedorId !== proveedor.id) {
      return res.status(403).json({ error: "No tienes permiso para modificar este producto" });
    }

    const productoActualizado = await prisma.producto.update({
      where: { id },
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(precio !== undefined && { precio }),
        ...(stock !== undefined && { stock }),
        ...(descripcion !== undefined && { descripcion }),
        ...(categoria !== undefined && { categoria }),
        ...(imagenUrl !== undefined && { imagenUrl }),
        ...(activo !== undefined && { activo })
      }
    });
    res.json(productoActualizado);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.id);

    // Verificar que el producto exista y pertenezca al proveedor
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: { proveedor: true }
    });

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Verificar que sea el propietario del producto
    const proveedor = await prisma.proveedor.findUnique({
      where: { userId: req.user.id }
    });

    if (!proveedor || producto.proveedorId !== proveedor.id) {
      return res.status(403).json({ error: "No tienes permiso para inactivar este producto" });
    }

    // En lugar de eliminar, marcar como inactivo
    await prisma.producto.update({
      where: { id },
      data: { activo: false }
    });

    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al desactivar producto" });
  }
}

module.exports = {
  list,
  listMyProducts,
  create,
  getById,
  update,
  remove
};
