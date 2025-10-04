const { prisma } = require("../config/prisma");
const jwt = require("jsonwebtoken");

// Listar proveedores con filtros opcionales
async function list(req, res) {
  try {
    const { busqueda } = req.query;

    const where = {
      ...(busqueda && {
        OR: [
          { nombreComercial: { contains: busqueda, mode: 'insensitive' } },
          { direccion: { contains: busqueda, mode: 'insensitive' } },
          { telefono: { contains: busqueda, mode: 'insensitive' } }
        ]
      })
    };

    const proveedores = await prisma.proveedor.findMany({
      where,
      select: {
        id: true,
        nombreComercial: true,
        nit: true,
        direccion: true,
        latitud: true,
        longitud: true,
        telefono: true,
        createdAt: true,
        updatedAt: true,
        userId: true
      },
      orderBy: { id: 'asc' }
    });

    // Mapear rfc -> NIT para la respuesta pública
    const data = proveedores.map(p => ({
      id: p.id,
      nombreComercial: p.nombreComercial,
      NIT: p.nit ?? null,
      direccion: p.direccion,
      latitud: p.latitud,
      longitud: p.longitud,
      telefono: p.telefono,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      userId: p.userId
    }));

    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al listar proveedores" });
  }
}

// Obtener proveedor por id
async function getById(req, res) {
  try {
    const id = Number(req.params.id);
    const proveedor = await prisma.proveedor.findUnique({
      where: { id },
      select: {
        id: true,
        nombreComercial: true,
        nit: true,
        direccion: true,
        latitud: true,
        longitud: true,
        telefono: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!proveedor) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    // Mapear rfc -> NIT en la respuesta
    const dataById = {
      id: proveedor.id,
      nombreComercial: proveedor.nombreComercial,
      NIT: proveedor.nit ?? null,
      direccion: proveedor.direccion,
      latitud: proveedor.latitud,
      longitud: proveedor.longitud,
      telefono: proveedor.telefono,
      createdAt: proveedor.createdAt,
      updatedAt: proveedor.updatedAt,
      user: proveedor.user
    };

    res.json(dataById);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al obtener proveedor" });
  }
}

// Obtener mi perfil de proveedor (requiere providerAuth)
async function getMyProfile(req, res) {
  try {
    // providerAuthRequired asegura que req.proveedor existe
    const proveedor = await prisma.proveedor.findUnique({
      where: { id: req.proveedor.id },
      select: {
        id: true,
        nombreComercial: true,
        nit: true,
        direccion: true,
        latitud: true,
        longitud: true,
        telefono: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const myProfile = {
      id: proveedor.id,
      nombreComercial: proveedor.nombreComercial,
      NIT: proveedor.nit ?? null,
      direccion: proveedor.direccion,
      latitud: proveedor.latitud,
      longitud: proveedor.longitud,
      telefono: proveedor.telefono,
      createdAt: proveedor.createdAt,
      updatedAt: proveedor.updatedAt
    };

    res.json(myProfile);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al obtener el perfil del proveedor" });
  }
}

// Actualizar mi perfil de proveedor (requiere providerAuth)
async function updateMyProfile(req, res) {
  try {
    const { nombreComercial, NIT, direccion, latitud, longitud, telefono } = req.body;

    const updated = await prisma.proveedor.update({
      where: { id: req.proveedor.id },
      data: {
        ...(nombreComercial !== undefined && { nombreComercial }),
        ...(NIT !== undefined && { nit: NIT }),
        ...(direccion !== undefined && { direccion }),
        ...(latitud !== undefined && { latitud: Number(latitud) }),
        ...(longitud !== undefined && { longitud: Number(longitud) }),
        ...(telefono !== undefined && { telefono })
      },
      select: {
        id: true,
        nombreComercial: true,
        nit: true,
        direccion: true,
        latitud: true,
        longitud: true,
        telefono: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const updatedResponse = {
      id: updated.id,
      nombreComercial: updated.nombreComercial,
      NIT: updated.nit ?? null,
      direccion: updated.direccion,
      latitud: updated.latitud,
      longitud: updated.longitud,
      telefono: updated.telefono,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    };

    res.json(updatedResponse);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al actualizar el perfil del proveedor" });
  }
}

// Convertir usuario USUARIO a PROVEEDOR
async function becomeProvider(req, res) {
  try {
    const { nombreComercial, NIT, direccion, latitud, longitud, telefono } = req.body;

    // Validar usuario autenticado
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { proveedor: true }
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (user.role === 'PROVEEDOR' || user.proveedor) {
      return res.status(400).json({ error: "Ya eres proveedor" });
    }

    // Validar campos requeridos para proveedor
    if (!nombreComercial || !direccion || !telefono || latitud == null || longitud == null) {
      return res.status(400).json({
        error: "Se requiere nombreComercial, direccion, telefono, latitud y longitud"
      });
    }

    const lat = Number(latitud);
    const lon = Number(longitud);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return res.status(400).json({ error: "latitud y longitud deben ser números" });
    }

    // Crear proveedor y actualizar rol en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const proveedor = await tx.proveedor.create({
        data: {
          userId: user.id,
          nombreComercial,
          nit: NIT,
          direccion,
          latitud: lat,
          longitud: lon,
          telefono
        }
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { role: 'PROVEEDOR' }
      });

      return { proveedor, updatedUser };
    });

    // Firmar nuevo token con el rol actualizado
    const token = jwt.sign(
      { id: result.updatedUser.id, email: result.updatedUser.email, role: result.updatedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = {
      token,
      user: {
        id: result.updatedUser.id,
        name: result.updatedUser.name,
        email: result.updatedUser.email,
        role: result.updatedUser.role,
        telefono: result.updatedUser.telefono,
        direccion: result.updatedUser.direccion
      },
      proveedor: {
        id: result.proveedor.id,
        nombreComercial: result.proveedor.nombreComercial,
        NIT: result.proveedor.nit ?? null,
        direccion: result.proveedor.direccion,
        latitud: result.proveedor.latitud,
        longitud: result.proveedor.longitud,
        telefono: result.proveedor.telefono
      }
    };

    res.status(201).json(response);
  } catch (e) {
    console.error(e);
    // Conflicto por unique userId en proveedor
    if (e.code === 'P2002') {
      return res.status(409).json({ error: "Ya existe un registro de proveedor para este usuario" });
    }
    res.status(500).json({ error: "Error al convertir a proveedor" });
  }
}

module.exports = {
  list,
  getById,
  getMyProfile,
  updateMyProfile,
  becomeProvider
};
