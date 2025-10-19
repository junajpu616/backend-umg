const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/prisma");
const { signTmpToken } = require("./twofa.controller");

async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      role = "USUARIO",  // Por defecto será USUARIO si no se especifica
      // Datos adicionales
      telefono,
      direccion,
      // Datos específicos de proveedor
      nombreComercial,
      NIT,
      latitud,
      longitud
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "nombre, email y password son requeridos" });
    }

    // Validar que el rol sea válido
    if (!['USUARIO', 'PROVEEDOR'].includes(role)) {
      return res.status(400).json({ error: "Rol inválido" });
    }

    // Validar datos adicionales para proveedores
    if (role === 'PROVEEDOR') {
      if (!nombreComercial || !direccion || !telefono || latitud == null || longitud == null) {
        return res.status(400).json({
          error: "Para proveedores se requiere: nombreComercial, direccion, telefono, latitud y longitud"
        });
      }
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "El email ya está registrado" });

    if (password.length < 6) {
        return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Crear usuario y proveedor en una transacción si es necesario
    const result = await prisma.$transaction(async (tx) => {
      // Crear el usuario
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
          telefono,
          direccion
        }
      });

      // Si es proveedor, crear el registro de proveedor
      let proveedor = null;
      if (role === 'PROVEEDOR') {
        proveedor = await tx.proveedor.create({
          data: {
            userId: user.id,
            nombreComercial,
            nit: NIT,
            direccion,
            latitud,
            longitud,
            telefono
          }
        });
      }

      return { user, proveedor };
    });

    // Generar token
    const token = jwt.sign(
      {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Preparar respuesta
    const response = {
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        telefono: result.user.telefono,
        direccion: result.user.direccion
      }
    };

    // Agregar datos de proveedor si aplica
    if (result.proveedor) {
      response.proveedor = {
        id: result.proveedor.id,
        nombreComercial: result.proveedor.nombreComercial,
        NIT: result.proveedor.nit,
        direccion: result.proveedor.direccion,
        latitud: result.proveedor.latitud,
        longitud: result.proveedor.longitud,
        telefono: result.proveedor.telefono
      };
    }

    res.status(201).json(response);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error en registro" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        proveedor: true // Incluir datos de proveedor si existe
      }
    });

    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    // Verificar si el usuario está activo
    if (!user.active) {
      return res.status(403).json({ error: "Tu cuenta ha sido desactivada. Contacta al administrador" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    // If 2FA is enabled, return a temporary token and require TOTP
    if (user.twoFactorEnabled) {
      const tmpToken = signTmpToken(user);
      return res.json({ requires2FA: true, tmpToken });
    }

    // Generar token con rol incluido
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Preparar respuesta
    const response = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        telefono: user.telefono,
        direccion: user.direccion
      }
    };

    // Agregar datos de proveedor si existe
    if (user.proveedor) {
      response.proveedor = {
        id: user.proveedor.id,
        nombreComercial: user.proveedor.nombreComercial,
        NIT: user.proveedor.nit,
        direccion: user.proveedor.direccion,
        latitud: user.proveedor.latitud,
        longitud: user.proveedor.longitud,
        telefono: user.proveedor.telefono
      };
    }

    res.json(response);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error en login" });
  }
}

async function me(req, res) {
  try {
    // Obtener usuario con datos de proveedor si existe
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        proveedor: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Generar nuevo token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Preparar respuesta
    const response = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        telefono: user.telefono,
        direccion: user.direccion
      }
    };

    // Agregar datos de proveedor si existe
    if (user.proveedor) {
      response.proveedor = {
        id: user.proveedor.id,
        nombreComercial: user.proveedor.nombreComercial,
        NIT: user.proveedor.nit,
        direccion: user.proveedor.direccion,
        latitud: user.proveedor.latitud,
        longitud: user.proveedor.longitud,
        telefono: user.proveedor.telefono
      };
    }

    res.json(response);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al obtener datos del usuario" });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, telefono, direccion, currentPassword, newPassword } = req.body;

    // Validar que al menos un campo esté presente
    if (!name && !telefono && !direccion && !newPassword) {
      return res.status(400).json({ error: "Debes proporcionar al menos un campo para actualizar" });
    }

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (telefono !== undefined) dataToUpdate.telefono = telefono;
    if (direccion !== undefined) dataToUpdate.direccion = direccion;

    // Si se quiere cambiar la contraseña
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Se requiere la contraseña actual para cambiarla" });
      }

      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

      if (!isValid) {
        return res.status(401).json({ error: "La contraseña actual es incorrecta" });
      }

      dataToUpdate.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: dataToUpdate,
      include: { proveedor: true }
    });

    // Preparar respuesta
    const response = {
      message: "Perfil actualizado exitosamente",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        telefono: updatedUser.telefono,
        direccion: updatedUser.direccion
      }
    };

    // Agregar datos de proveedor si existe
    if (updatedUser.proveedor) {
      response.proveedor = {
        id: updatedUser.proveedor.id,
        nombreComercial: updatedUser.proveedor.nombreComercial,
        NIT: updatedUser.proveedor.nit,
        direccion: updatedUser.proveedor.direccion,
        latitud: updatedUser.proveedor.latitud,
        longitud: updatedUser.proveedor.longitud,
        telefono: updatedUser.proveedor.telefono
      };
    }

    res.json(response);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
}

async function deactivateAccount(req, res) {
  try {
    const { password } = req.body;

    // Validar que se proporcione la contraseña
    if (!password) {
      return res.status(400).json({ error: "Se requiere la contraseña para desactivar la cuenta" });
    }

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Verificar que no sea un administrador
    if (user.role === "ADMIN") {
      return res.status(403).json({ error: "Los administradores no pueden desactivar sus propias cuentas" });
    }

    // Desactivar cuenta
    await prisma.user.update({
      where: { id: req.user.id },
      data: { active: false }
    });

    res.json({ 
      message: "Tu cuenta ha sido desactivada exitosamente. Contacta al administrador si deseas reactivarla." 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al desactivar cuenta" });
  }
}

module.exports = { register, login, me, updateProfile, deactivateAccount };
