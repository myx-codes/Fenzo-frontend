const os = require("os");

const interfaces = os.networkInterfaces();
const preferredNames = ["en0", "en1", "wifi0", "Wi-Fi", "Ethernet"];

function getAddresses(name) {
  return (interfaces[name] || []).filter(
    (address) => address.family === "IPv4" && !address.internal,
  );
}

let selected = null;

for (const name of preferredNames) {
  const [address] = getAddresses(name);
  if (address) {
    selected = { name, address: address.address };
    break;
  }
}

if (!selected) {
  for (const [name, addresses] of Object.entries(interfaces)) {
    const [address] = addresses.filter(
      (item) => item.family === "IPv4" && !item.internal,
    );
    if (address) {
      selected = { name, address: address.address };
      break;
    }
  }
}

if (!selected) {
  console.log("LAN IP topilmadi. WiFi/Ethernet ulanmagan bo‘lishi mumkin.");
  process.exit(0);
}

console.log(`Current network: ${selected.name}`);
console.log(`Frontend LAN URL: http://${selected.address}:3000`);
console.log(`Backend LAN URL:  http://${selected.address}:3002`);
console.log("");
console.log("Telefon bir xil WiFi’da bo‘lsa, frontend URL’ni oching.");
