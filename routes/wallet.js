const { ethers } = require("ethers");
const TronWeb = require("tronweb");
const { bot } = require("../utils/bot.js");
const { User, decryption } = require("../model/users.js");
const { tokenContract, tronWebClient } = require("../utils/utils.js");

async function details(args) {
  let waitMsg = {};
  try {
    bot.deleteMessage(args.user.chatId, args.msgId);
    waitMsg = await bot.sendMessage(args.user.chatId, "Progress...");
    let user = await User.findOne({ chatId: args.user.chatId });
    let contract = await tokenContract(decryption(user?.privateKey));
    const balance = await contract.balanceOf(user?.midAddress).call();
    // get Tron Native Wallet Assets
    const NativeBalance = await tronWebClient.trx.getBalance(user?.midAddress);
    const bandwidth = await tronWebClient.trx.getBandwidth(user?.midAddress);
    // let estimate = await tronWebClient.trx.getChainParameters();
    // console.log(estimate, "-=== =-= -== -estimate");

    // delete Wait Msg
    bot.deleteMessage(args.user.chatId, waitMsg.message_id);
    waitMsg = {};
    return bot.sendMessage(
      args.user.chatId,
      `----Details Of Your Mid Wallet Account ----
    
Wallet Address : ${user?.midAddress}
Wallet Balance : ${TronWeb.fromSun(NativeBalance)} TRX
Bandwidth : ${bandwidth}

Token Name : Tether USD
Token Symbol : USDT
Token Balance : ${TronWeb.fromSun(balance)}

NOTE : Withdraw Assets From Mid Wallet By WIthdraw TRX & USDT
      `,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Withdraw TRX",
                callback_data: JSON.stringify({
                  command: "withdrawtrx",
                  answer: "token withdraw",
                }),
              },
              {
                text: "Withdraw USDT",
                callback_data: JSON.stringify({
                  command: "withdrawusdt",
                  answer: "token withdraw",
                }),
              },
            ],
            [
              {
                text: "📱Main Menu",
                callback_data: JSON.stringify({
                  command: "mainmenu",
                  answer: "main menu",
                }),
              },
              {
                text: "🔃 Refresh",
                callback_data: JSON.stringify({
                  command: "details",
                  answer: "refresh token balance",
                }),
              },
            ],
          ],
        },
      }
    );
  } catch (error) {
    console.log(error);
    bot.deleteMessage(args.user.chatId, waitMsg.message_id);
    waitMsg = {};
  }
}

module.exports = { details };
