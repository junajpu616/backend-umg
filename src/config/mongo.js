const mongoose = require("mongoose");

async function connectMongo(uri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("MongoDB conectado");
  console.log("Prueba");
  console.log("Prueba2")
}

module.exports = { connectMongo };
