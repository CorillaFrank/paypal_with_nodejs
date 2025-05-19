require("dotenv").config();
const express = require("express");
const paypal = require("./services/paypal");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

// ✅ Ruta que se llama desde tu proyecto .NET (via HttpClient)
app.get("/create-paypal-order", async (req, res) => {
  try {
    const monto = req.query.monto;
    const order = await paypal.createOrderWithAmount(monto);
    res.json(order); // devuelves el JSON a .NET
  } catch (error) {
    console.error("Error al crear la orden:", error);
    res.status(500).json({ error: "Error al crear la orden" });
  }
});

// ✅ Ruta que PayPal llama cuando el usuario aprueba el pago
app.get("/complete-order", async (req, res) => {
  try {
    await paypal.capturePayment(req.query.token);
    res.send("Orden completada correctamente. Gracias por tu compra.");
  } catch (error) {
    console.error("Error al capturar el pago:", error);
    res.status(500).send("Error al completar el pago");
  }
});

// ✅ Ruta que PayPal llama cuando el usuario cancela el pago
app.get("/cancel-order", (req, res) => {
  res.send("El pago fue cancelado por el usuario.");
});

app.listen(3000, () => console.log("Server is running on port 3000"));
