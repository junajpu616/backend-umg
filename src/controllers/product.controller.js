const { prisma } = require("../config/prisma");

// Listar productos por proveedor o todos los productos activos
async function list(req, res) {
  try {
    const { proveedorId, categoria, busqueda, q, caracteristica } = req.query;
    const term = busqueda || q || caracteristica;

    const where = {
      activo: true,
      ...(proveedorId && { proveedorId: parseInt(proveedorId) }),
      ...(categoria && { categoria }),
      ...(term && {
        OR: [
          { nombre: { contains: term, mode: 'insensitive' } },
          { descripcion: { contains: term, mode: 'insensitive' } },
          { categoria: { contains: term, mode: 'insensitive' } }
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

    // Validar que imagenUrl sea un array con máximo 5 elementos
    if (imagenUrl && (!Array.isArray(imagenUrl) || imagenUrl.length > 5)) {
      return res.status(400).json({ error: "imagenUrl debe ser un array con máximo 5 elementos" });
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

    // Validar que imagenUrl sea un array con máximo 5 elementos
    if (imagenUrl && (!Array.isArray(imagenUrl) || imagenUrl.length > 5)) {
      return res.status(400).json({ error: "imagenUrl debe ser un array con máximo 5 elementos" });
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

// Función auxiliar para manejar activación/inactivación
async function toggleProductActivation(req, res, estado) {
    try {
        const id = + req.params.id;

        // Verificar que el producto exista y pertenezca al proveedor
        const producto = await prisma.producto.findUnique({
            where: { id },
            include: { proveedor: true }
        });

        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        // Verificar que el usuario sea el dueño del producto
        const proveedor = await prisma.proveedor.findUnique({
            where: { userId: req.user.id }
        });

        if (!proveedor || producto.proveedorId !== proveedor.id) {
            return res.status(403).json({ error: "No tienes permiso para modificar este producto" });
        }

        // Verificar el estado actual del producto
        if (producto.activo === estado) {
            const estadoActual = estado ? "activo" : "inactivo";
            return res.status(406).json({ error: `Producto ya ${estadoActual}` });
        }

        // Actualizar el estado del producto
        await prisma.producto.update({
            where: { id },
            data: { activo: estado }
        });

        const mensaje = estado ? "Producto activado" : "Producto inactivado";
        return res.status(200).json({ message: mensaje });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error al modificar el estado del producto" });
    }
}

// Controlador para activar un producto
async function activate(req, res) {
    return toggleProductActivation(req, res, true);
}

// Controlador para inactivar un producto
async function remove (req, res) {
    return toggleProductActivation(req, res, false);
}

module.exports = {
  list,
  listMyProducts,
  create,
  getById,
  update,
  remove,
  activate,
};
