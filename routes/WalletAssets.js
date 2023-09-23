const TronWeb = require("tronweb");
const { User, decryption } = require("../model/users");
const { bot } = require("../utils/bot.js");
const { WalletClient, tokenContract } = require("../utils/utils");

// Stake TRX For Increase BandWith OR Energy From Wallet
async function TrxStake(args) {
  try {
    let chatId = args?.user?.chatId;
    const user = await User.findOne({ chatId });
    // wallet client
    const walletClient = await WalletClient(decryption(user?.privateKey));
    // get walllet balance
    let balance = await walletClient.trx.getBalance(user?.midAddress);
    // let bandwidth = await walletClient.trx.getBandwidth(user?.midAddress);
    if (TronWeb.fromSun(balance) >= "160") {
      const trans = await walletClient.transactionBuilder.freezeBalanceV2(
        "160000000",
        "BANDWIDTH",
        user?.midAddress
      );
      const signedtxn = await walletClient.trx.sign(trans);
      await walletClient.trx.sendRawTransaction(signedtxn);
      bot.deleteMessage(chatId, args?.msgId);
      bot.sendMessage(chatId, `Please Stake Again`);
    } else {
      bot.sendMessage(
        chatId,
        `Insufficient Balance For TRX Stake for Energy, Balance : ${TronWeb.fromSun(
          balance
        )}`
      );
    }
  } catch (error) {
    console.log(error, " =-==-==-=Wallet TRX Stake Error");
  }
}

async function handleWithdrawTrx(args) {
  await bot.sendMessage(
    args.user.chatId,
    "Please Enter Address_&_Amount_For_TRX Transfer\nFor Example: 0x...xfc 100",
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
}
async function handleWithdrawUsdt(args) {
  await bot.sendMessage(
    args.user.chatId,
    "Please Enter Address_&_Amount_For_USDT Transfer\n:For Example: 0x...xfc 100",
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
}

// Withdraw TRX from Wallet
async function withdrawTrx(chatID, msgId, Address, Amount) {
  let waitMsg = {};
  try {
    const user = await User.findOne({ chatId: chatID });
    bot.deleteMessage(chatID, msgId);
    waitMsg = await bot.sendMessage(chatID, "Withdraw TRX Progres...");

    if (!Address || !Amount) {
      // delete wait msg
      bot.deleteMessage(chatID, waitMsg.message_id);
      waitMsg = {};
      return bot.sendMessage(chatID, "Invalid Arguments For TRX Transaction");
    }
    // wallet client
    const walletClient = await WalletClient(decryption(user?.privateKey));
    // get walllet balance
    let balance = await walletClient.trx.getBalance(user?.midAddress);
    // let bandwidth = await walletClient.trx.getBandwidth(user?.midAddress);
    if (TronWeb.fromSun(balance) > Amount) {
      const trans = await walletClient.transactionBuilder.sendTrx(
        Address,
        TronWeb.toSun(Amount),
        user?.midAddress
      );
      const signedtxn = await walletClient.trx.sign(trans);
      let tx = await walletClient.trx.sendRawTransaction(signedtxn);
      // delete wait msg
      bot.deleteMessage(chatID, waitMsg.message_id);
      waitMsg = {};
      bot.sendMessage(
        chatID,
        `${Amount} TRX TRansfered to ${Address.slice(0, 4)}...${Address.slice(
          -4
        )}\nSee <a href='https://nile.tronscan.org/#/transaction/${
          tx?.transaction?.txID
        }'>Transaction</a> For Error Details`,
        {
          parse_mode: "HTML",
        }
      );
    } else {
      // delete wait msg
      bot.deleteMessage(chatID, waitMsg.message_id);
      waitMsg = {};
      bot.sendMessage(
        chatID,
        `Insufficient Balance For Transfer ${Amount} TRX`
      );
    }
  } catch (error) {
    // delete wait msg
    bot.deleteMessage(chatID, waitMsg.message_id);
    waitMsg = {};
    console.log(error, " =-==-==-=Wallet TRX Send Error");
    bot.sendMessage(chatID, `Error in Transfer TRX : ${error}`);
  }
}

// Withdraw USDT from Wallet
async function withdrawUsdt(chatID, msgId, Address, Amount) {
  let waitMsg = {};
  try {
    const user = await User.findOne({ chatId: chatID });
    bot.deleteMessage(chatID, msgId);
    waitMsg = await bot.sendMessage(chatID, "Withdraw USDT Progres...");

    if (!Address || !Amount) {
      // delete wait msg
      bot.deleteMessage(chatID, waitMsg.message_id);
      waitMsg = {};
      return bot.sendMessage(chatID, "Invalid Arguments For USDT Transaction");
    }
    // wallet client
    const contract = await tokenContract(decryption(user?.privateKey));
    // get walllet balance
    let balance = await contract.balanceOf(user?.midAddress);
    // let bandwidth = await walletClient.trx.getBandwidth(user?.midAddress);
    if (TronWeb.fromSun(balance) > Amount) {
      // Transfer USDT
      await contract.transfer(Address, TronWeb.toSun(Amount)).send({
        shouldPollResponse: true,
      });
      // delete wait msg
      bot.deleteMessage(chatID, waitMsg.message_id);
      waitMsg = {};
      bot.sendMessage(chatID, `${Amount} USDT Transfered to ${Address}`);
    } else {
      // delete wait msg
      bot.deleteMessage(chatID, waitMsg.message_id);
      waitMsg = {};
      bot.sendMessage(
        chatID,
        `Insufficient Balance For Transfered ${Amount} USDT`
      );
    }
  } catch (error) {
    // delete wait msg
    bot.deleteMessage(chatID, waitMsg.message_id);
    waitMsg = {};
    console.log(error?.error, " =-==-==-=Wallet USDT Send Error");
    bot.sendMessage(chatID, `Error in Transfer USDT : ${error?.error}`);
  }
}

module.exports.TrxStake = TrxStake;
module.exports.withdrawTrx = withdrawTrx;
module.exports.withdrawUsdt = withdrawUsdt;
module.exports.handleWithdrawTrx = handleWithdrawTrx;
module.exports.handleWithdrawUsdt = handleWithdrawUsdt;
