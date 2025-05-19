require("dotenv").config();
const express = require("express");
const paypal = require("./services/paypal");

const app = express();

app.use(express.urlencoded({ extended: false })); // NECESARIO
app.use(express.json()); // NECESARIO

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/pay", async (req, res) => {
  try {
    const order = await paypal.createOrder();
    console.log(order);
    const approveLink = order.links.find((link) => link.rel === "approve");
    res.redirect(approveLink.href);
  } catch (error) {
    console.error("Error al crear la orden:", error);
    res.status(500).send("Hubo un error al crear la orden");
  }
});

app.get("/complete-order", async (req, res) => {
  try {
    await paypal.capturePayment(req.query.token);
    res.send("Orden completada correctamente. Gracias por tu compra.");
  } catch (error) {
    res.send("error: " + error);
  }

  // res.send("Orden completada correctamente. Gracias por tu compra.");
});

app.get("/cancel-order", (req, res) => {
  res.send("El pago fue cancelado.");
});

app.listen(3000, () => console.log("Server is running on port 3000"));
