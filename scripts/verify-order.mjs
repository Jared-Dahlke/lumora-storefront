// Live integration check: runs the real 4-step order flow against the openct backend.
// Usage: node scripts/verify-order.mjs
const API = process.env.VITE_API_BASE_URL || 'https://openct-api.onrender.com';
const AUTH = process.env.VITE_AUTH_BASE_URL || 'https://openct-auth.onrender.com';
const PROJECT_KEY = process.env.VITE_PROJECT_KEY || 'openct-dev';
const CLIENT_ID = process.env.VITE_CLIENT_ID || 'lumora-store';
const CLIENT_SECRET = process.env.VITE_CLIENT_SECRET || 'Dk9ECs80MehnXH-biDZT4qKJSxUwgw7j';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getToken() {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  for (let i = 0; i < 8; i++) {
    try {
      const res = await fetch(`${AUTH}/oauth/${PROJECT_KEY}/anonymous/token`, {
        method: 'POST',
        headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials',
      });
      if (res.ok) return (await res.json()).access_token;
      console.log(`  auth ${res.status}, retrying...`);
    } catch (e) {
      console.log(`  auth err ${e.message}, retrying...`);
    }
    await sleep(Math.min(2000 + i * 1500, 8000));
  }
  throw new Error('could not get token');
}

async function post(token, path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`POST ${path} -> ${res.status}: ${text}`);
  return JSON.parse(text);
}

(async () => {
  console.log('Getting anonymous token...');
  const token = await getToken();
  console.log('Token OK.');

  console.log('1) create cart');
  let cart = await post(token, `/${PROJECT_KEY}/me/carts`, {
    currency: 'USD',
    country: 'US',
    customerEmail: 'verify@example.com',
  });
  console.log(`   cart ${cart.id} v${cart.version}`);

  console.log('2) addLineItem');
  cart = await post(token, `/${PROJECT_KEY}/me/carts/${cart.id}`, {
    version: cart.version,
    actions: [
      { action: 'addLineItem', sku: 'LUMORA-RING', quantity: 2 },
      { action: 'addLineItem', sku: 'DAILY-RESET', quantity: 1 },
    ],
  });
  console.log(`   v${cart.version}, total ${cart.totalPrice?.centAmount}`);

  console.log('3) setShippingAddress');
  cart = await post(token, `/${PROJECT_KEY}/me/carts/${cart.id}`, {
    version: cart.version,
    actions: [
      {
        action: 'setShippingAddress',
        address: {
          firstName: 'Verify',
          lastName: 'Bot',
          streetName: '1 Test St',
          city: 'Austin',
          postalCode: '78701',
          country: 'US',
          state: 'TX',
        },
      },
    ],
  });
  console.log(`   v${cart.version}`);

  console.log('4) create order');
  const order = await post(token, `/${PROJECT_KEY}/me/orders`, {
    id: cart.id,
    version: cart.version,
  });
  console.log('\nORDER CREATED:');
  console.log(`  orderNumber: ${order.orderNumber}`);
  console.log(`  id:          ${order.id}`);
  console.log(`  total:       ${order.totalPrice?.centAmount} ${order.totalPrice?.currencyCode}`);
  console.log(`  orderState:  ${order.orderState}`);
})().catch((e) => {
  console.error('\nFAILED:', e.message);
  process.exit(1);
});
