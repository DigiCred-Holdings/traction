import axios from "axios";
import config from "config";
const TRACTION_URL: string = config.get("server.tractionUrl");
const INNKEEPER_USER = config.get("server.innkeeper.user");
const INNKEEPER_KEY = config.get("server.innkeeper.key");

/**
 * @function login
 * Use the configured Inkeeper Admin key to get the token
 * @returns {string} The inkeeper token
 * https://digicred.z.wolkins.net:3020/proxy/multitenancy/wallet/ab1d492c-3c4e-4c3e-b7d2-ff098f028174/token
 * https://digicred.z.wolkins.net:3020/proxy/multitenancy/tenant/ab1d492c-3c4e-4c3e-b7d2-ff098f028174/token
 */
export const login = async () => {
  const loginUrl = `${TRACTION_URL}/multitenancy/tenant/${INNKEEPER_USER}/token`;
  const payload = { wallet_key: INNKEEPER_KEY };
  console.log("Innkeeper login URL:", loginUrl);
  console.log("Innkeeper login payload:", payload);
  const res = await axios({
    method: "post",
    url: loginUrl,
    data: payload,
  });

  return res.data;
};

export const oidcLogin = async () => {
  const loginUrl = `${TRACTION_URL}/multitenancy/wallet/${INNKEEPER_USER}/token`;
  const payload = { wallet_key: INNKEEPER_KEY };
  console.log("Innkeeper login URL:", loginUrl);
  console.log("Innkeeper login payload:", payload);
  const res = await axios({
    method: "post",
    url: loginUrl,
    data: payload,
  });

  return res.data;
};

/**
 * @function createReservation
 * Create a reservation in Traction
 * @returns {object} the reservation object
 */
export const createReservation = async (req: any, token: string) => {
  try {
    const auth = `Bearer ${token}`;
    const reservationUrl = `${TRACTION_URL}/innkeeper/reservations`;
    const payload = req.body;

    const res = await axios({
      method: "post",
      url: reservationUrl,
      data: payload,
      headers: {
        Authorization: auth,
      },
    });
    return res.data;
  } catch (error) {
    return error;
  }
};
