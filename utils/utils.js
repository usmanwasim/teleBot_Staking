const TronWeb = require("tronweb");

function secondsToDaysOrHours(seconds) {
  const days = Math.floor(seconds / 86400); // 1 day has 86400 seconds
  const hours = Math.floor((seconds % 86400) / 3600); // 1 hour has 3600 seconds

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""}`;
  } else {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }
}
function timestampToDateTimeString(timestamp) {
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  // Define the date-time format (adjust as needed)
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    // second: "2-digit",
  };
  return date.toLocaleString("en-US", options);
}

const walletGeneration = (midId) => {
  const fullNode = "https://api.nileex.io";
  const solidityNode = "https://api.nileex.io";
  const eventServer = "https://api.nileex.io";
  const apiKey = process.env.TRON_API;

  const tronWeb = new TronWeb({
    fullHost: fullNode,
    headers: { "TRON-PRO-API-KEY": apiKey },
    solidityNode,
    eventServer,
  });

  const tronAddress = tronWeb.fromMnemonic(
    process.env.MID_MNEMONIC,
    `m/44'/195'/0'/0/${midId}`
  );
  return tronAddress;
};
// not used generate private key
const privateKeyGeneration = (midId) => {
  const fullNode = "https://api.nileex.io";
  const solidityNode = "https://api.nileex.io";
  const eventServer = "https://api.nileex.io";

  // Define your API Key from TronGrid
  const apiKey = process.env.API_KEY;

  // Create an instance of TronWeb with the API Key
  const tronWeb = new TronWeb({
    fullHost: fullNode,
    headers: { "TRON-PRO-API-KEY": apiKey },
    solidityNode,
    eventServer,
  });

  const tronAddress = tronWeb.fromMnemonic(
    process.env.MID_MNEMONIC,
    `m/44'/195'/0'/0/${midId}`
  );

  return tronAddress.privateKey.substring(2);
};

const tokenContract = async (Key) => {
  const tronWeb = new TronWeb({
    fullHost: "https://api.nileex.io",
    headers: { "TRON-PRO-API-KEY": process.env.API_KEY },
    privateKey: Key,
  });
  const instance = await tronWeb.contract().at(process.env.TokenAddress);
  return instance;
};
const stakingContract = async (Key) => {
  const tronWeb = new TronWeb({
    fullHost: "https://api.nileex.io",
    headers: { "TRON-PRO-API-KEY": process.env.API_KEY },
    privateKey: Key,
  });

  const instance = await tronWeb.contract().at(process.env.StakingAddress);
  return instance;
};
const tronWeb = new TronWeb({
  fullHost: "https://api.nileex.io", // Use the TronGrid API or your own node
});

// for Wallet TRX Stake  For Energy Or BandWidth Currently Not Used
const WalletClient = async (Key) => {
  const tronweb = new TronWeb({
    fullHost: "https://api.nileex.io",
    headers: { "TRON-PRO-API-KEY": process.env.API_KEY },
    privateKey: Key,
  });
  return tronweb;
};

module.exports.tronWebClient = tronWeb;
module.exports.WalletClient = WalletClient;

module.exports.walletGeneration = walletGeneration;
module.exports.privateKeyGeneration = privateKeyGeneration;
module.exports.tokenContract = tokenContract;
module.exports.stakingContract = stakingContract;
// date format
module.exports.timeFromSeconds = secondsToDaysOrHours;
module.exports.timeFromStemp = timestampToDateTimeString;
