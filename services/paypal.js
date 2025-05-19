const axios = require("axios");

// Genera el token de acceso para PayPal
async function generateAccessToken() {
  try {
    const response = await axios({
      method: "post",
      url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: "grant_type=client_credentials",
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET,
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Error al generar el token de acceso:");
    console.error(error.response?.data || error.message);
    throw error;
  }
}

// ✅ Crea una orden con monto dinámico
exports.createOrderWithAmount = async (monto) => {
  try {
    const accessToken = await generateAccessToken();

    const response = await axios({
      url: process.env.PAYPAL_BASE_URL + "/v2/checkout/orders",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: monto,
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: monto,
                },
              },
            },
          },
        ],
        application_context: {
          return_url: "http://localhost:5246/Pago/ConfirmarPago",
          cancel_url: "http://localhost:5246/Pago/CancelarPago",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          brand_name: "SneakerWest",
        },
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error al crear la orden:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Captura el pago
exports.capturePayment = async (orderId) => {
  const accessToken = await generateAccessToken();

  const response = await axios({
    url: process.env.PAYPAL_BASE_URL + `/v2/checkout/orders/${orderId}/capture`,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};
