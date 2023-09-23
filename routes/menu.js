const { User, decryption } = require("../model/users.js");
const { WalletPrivateId } = require("../model/walletId.js");
const { bot } = require("../utils/bot.js");
const TronWeb = require("tronweb");
const {
  tokenContract,
  walletGeneration,
  WalletClient,
} = require("../utils/utils.js");

async function mainmenu(args) {
  try {
    if (args?.msgId) {
      bot.deleteMessage(args.user.chatId, args.msgId);
    }

    // contract balance Call
    let user = await User.findOne({
      chatId: args.user.chatId,
    });
    let Count = await User.find().count();
    let contract = await tokenContract(decryption(user?.privateKey));
    const balance = await contract.balanceOf(process.env.StakingAddress).call();

    return bot.sendMessage(
      args.user.chatId,
      `Welcome to CryptoBot ${args.user.firstName} ${args.user.lastName}.\n` +
        `Contract Balance : ${TronWeb.fromSun(balance)} USDT \n` +
        `Total Users : ${Count}\n\n` +
        `═══ <a>Your Mid Wallet</a>═══ \n\n${args.user.midAddress}`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Wallet Details",
                callback_data: JSON.stringify({
                  command: "details",
                  answer: "show wallet",
                }),
              },
              {
                text: "Stake Tokens",
                callback_data: JSON.stringify({
                  command: "stakemenu",
                  answer: "stake Menu",
                }),
              },
              {
                text: "View Stakes",
                callback_data: JSON.stringify({
                  command: "stakedetails",
                  answer: "stake record",
                }),
              },
            ],
          ],
        },
      }
    );
  } catch (error) {
    console.log(error.message, "main menu message error--= - = -= =- ");
  }
}

async function createWalletId(args) {
  let waitMsg = {};
  try {
    let chatId = args.message.chat.id;
    let firstName = args.message.chat.first_name;
    let lastName = args.message.chat.last_name;
    waitMsg = await bot.sendMessage(chatId, "Progress...");

    let wallet = "";
    let user = await User.find().count();
    if (user > 0) {
      let walletId = await WalletPrivateId.findOneAndUpdate(
        { title: "midId" },
        { $inc: { midId: 1 } },
        {
          new: true,
        }
      );
      wallet = walletGeneration(walletId?.midId);
    } else {
      let walletId = await WalletPrivateId.create({});
      wallet = walletGeneration(walletId?.midId);
    }

    user = new User({
      chatId,
      firstName,
      lastName,
      privateKey: wallet.privateKey.substring(2),
      midAddress: wallet.address,
    });

    await user.encrypt();
    await user.save();
    bot.deleteMessage(chatId, waitMsg.message_id);
    waitMsg = {};
    mainmenu({ user });
  } catch (error) {
    bot.deleteMessage(args.message.chat.id, waitMsg.message_id);
    waitMsg = {};
    console.log(error, "error in create wallet by id");
  }
}

async function UserPrivateKey(args) {
  await bot.sendMessage(
    args?.answer,
    "Please Enter Your Private_Key To Import Wallet ",
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
}
async function createWalletKey(msg) {
  let waitMsg = {};
  try {
    let chatId = msg.chat.id;
    let firstName = msg.chat.first_name;
    let lastName = msg.chat.last_name;
    bot.deleteMessage(chatId, msg.message_id);
    waitMsg = await bot.sendMessage(chatId, "Progress...");

    let wallet = await WalletClient(msg?.text);
    let user = new User({
      chatId,
      firstName,
      lastName,
      privateKey: wallet.defaultPrivateKey,
      midAddress: wallet.defaultAddress.base58,
    });

    await user.encrypt();
    await user.save();

    bot.deleteMessage(chatId, waitMsg.message_id);
    waitMsg = {};
    mainmenu({ user });
  } catch (error) {
    bot.deleteMessage(msg.chat.id, waitMsg.message_id);
    waitMsg = {};
    console.log(error, "error in create wallet by key");
  }
}

module.exports = {
  mainmenu,
  createWalletId,
  createWalletKey,
  UserPrivateKey,
};
