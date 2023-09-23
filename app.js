var express = require("express");
const TronWeb = require("tronweb");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var { config } = require("dotenv");
const bodyParser = require("body-parser");
const EventEmitter = require("eventemitter3");
const { bot } = require("./utils/bot.js");
var { User } = require("./model/users.js");
var dbConnect = require("./utils/dbConnect.js");
const { WalletClient, tokenContract } = require("./utils/utils.js");

var { details } = require("./routes/wallet.js");
var {
  mainmenu,
  createWalletId,
  createWalletKey,
  UserPrivateKey,
} = require("./routes/menu.js");
var {
  handleWithdrawUsdt,
  handleWithdrawTrx,
  withdrawTrx,
  withdrawUsdt,
} = require("./routes/WalletAssets.js");
var {
  stakemenu,
  stakeTokenPlan,
  stakeTokenAmount,
  stakeToken,
} = require("./routes/stake.js");
var {
  stakeDetails,
  unStakeToken,
  claimStakeReward,
  // write function of staking Contract
  handleUnStake,
  handleClaim,
} = require("./routes/stakeDetail.js");

// cron Job At Plans Details
const PlanDetailsData = require("./routes/plansDetail.js");

const events = new EventEmitter();

events.on("mainmenu", mainmenu);
events.on("details", details);
events.on("walletid", createWalletId);
events.on("walletkey", UserPrivateKey);

events.on("withdrawtrx", handleWithdrawTrx);
events.on("withdrawusdt", handleWithdrawUsdt);

events.on("stakemenu", stakemenu);
events.on("staketokenplan", stakeTokenPlan);
events.on("staketokenamount", stakeTokenAmount);

events.on("stakedetails", stakeDetails);
events.on("unstake", unStakeToken);
events.on("claim", claimStakeReward);

config();
dbConnect();

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

bot.onText(/^\/start$/, async (msg) => {
  try {
    let chatId = msg.chat.id;
    let firstName = msg.chat.first_name;
    let lastName = msg.chat.last_name;

    let user = await User.findOne({
      chatId,
    });
    let Count = await User.find().count();
    // const account = await WalletClient(process.env.defautlPrivate);
    let contract = await tokenContract(process.env.defautlPrivate);
    const balance = await contract.balanceOf(process.env.StakingAddress).call();

    if (!user) {
      return bot.sendMessage(
        chatId,
        `\nWelcome to CryptoBot ${firstName} ${lastName}.\n\n` +
          `Contract Balance : ${TronWeb.fromSun(balance)}\n` +
          `Total Users : ${Count}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Generate Wallet",
                  callback_data: JSON.stringify({
                    command: "walletid",
                    answer: `generate wallet`,
                  }),
                },
              ],
              [
                {
                  text: "⬇️ Import Wallet",
                  callback_data: JSON.stringify({
                    command: "walletkey",
                    answer: `${chatId}`,
                  }),
                },
              ],
            ],
          },
        }
      );
    }
    events.emit(
      "mainmenu",
      (args = {
        user,
        msgId: msg?.message_id,
      })
    );
  } catch (error) {
    console.log(error, "app error -= - - = -=- ");
  }
});

bot.on("callback_query", async (callbackQuery) => {
  const message = callbackQuery.message;
  const category = JSON.parse(callbackQuery.data);

  let user = await User.findOne({
    chatId: message.chat.id,
  });

  events.emit(
    category.command,
    (args = {
      user,
      msgId: message.message_id,
      answer: category.answer,
      message: message,
    })
  );
});

bot.on("message", async (msg) => {
  const chatId = msg?.chat?.id;
  const text = msg?.reply_to_message?.text;
  const messageId = msg.message_id;

  // generate wallet from privateKey
  if (text?.includes("Private_Key")) {
    createWalletKey(msg);
  }

  // Plan Related amount for stake
  if (text?.includes("Stake_Token_Amount & Send Transaction")) {
    bot.deleteMessage(chatId, msg?.message_id);
    // bot.deleteMessage(chatId, msg?.reply_to_message?.message_id);
    stakeToken(chatId, msg.text);
  }
  // unStake Handle
  if (text?.includes("Stake_Index_To_unStake")) {
    handleUnStake(chatId, msg.text, messageId);
  }
  // Claim Handle
  if (text?.includes("Stake_Index_To_Claim")) {
    handleClaim(chatId, msg.text, messageId);
  }
  if (text?.includes("Address_&_Amount_For_TRX")) {
    let value = msg.text.split(" ");
    withdrawTrx(chatId, messageId, value[0], value[1]);
  }
  if (text?.includes("Address_&_Amount_For_USDT")) {
    let value = msg.text.split(" ");
    withdrawUsdt(chatId, messageId, value[0], value[1]);
  }
});

module.exports = app;
