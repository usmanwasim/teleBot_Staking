const TronWeb = require("tronweb");
const { User, decryption } = require("../model/users.js");
const { PlansRecord } = require("../model/plans.js");
const { bot } = require("../utils/bot.js");
const {
  tokenContract,
  stakingContract,
  timeFromSeconds,
  tronWebClient,
} = require("../utils/utils.js");
const { mainmenu } = require("./menu.js");

async function stakemenu(args) {
  try {
    const chatId = args.user.chatId;
    bot.deleteMessage(chatId, args.msgId);
    // waitMsg = await bot.sendMessage(chatId, "Plans Detail Progress...");
    const user = await User?.findOne({ chatId });
    const plan = await PlansRecord?.find({});

    await bot.sendMessage(
      chatId,
      `Stake Tokens According To Plans\n
      Plans Details :
      1.  Duration: ${timeFromSeconds(plan[0]?.Duration)} - minAmount: ${
        plan[0]?.MinAmount
      } - maxAmount: ${plan[0]?.MaxAmount}
      2.  Duration: ${timeFromSeconds(plan[1]?.Duration)} - minAmount: ${
        plan[1]?.MinAmount
      } - maxAmount: ${plan[1]?.MaxAmount}
      3.  Duration: ${timeFromSeconds(plan[2]?.Duration)} - minAmount: ${
        plan[2]?.MinAmount
      } - maxAmount: ${plan[2]?.MaxAmount}
      4.  Duration: ${timeFromSeconds(plan[3]?.Duration)} - minAmount: ${
        plan[3]?.MinAmount
      } - maxAmount: max`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📱 Menu",
                callback_data: JSON.stringify({
                  command: "mainmenu",
                  answer: "main menu",
                }),
              },
            ],
            [
              {
                text: "▓▓▓ Select Plan ▓▓▓",
                callback_data: JSON.stringify({
                  command: "Select",
                  answer: "",
                }),
              },
            ],
            [
              {
                text: `Plan 1 ${user?.stakeIndex === "1" ? "✅" : ""}`,
                callback_data: JSON.stringify({
                  command: "staketokenplan",
                  answer: "1",
                }),
              },
              {
                text: `Plan 2 ${user?.stakeIndex === "2" ? "✅" : ""}`,
                callback_data: JSON.stringify({
                  command: "staketokenplan",
                  answer: "2",
                }),
              },
              {
                text: `Plan 3 ${user?.stakeIndex === "3" ? "✅" : ""}`,
                callback_data: JSON.stringify({
                  command: "staketokenplan",
                  answer: "3",
                }),
              },
              {
                text: `Plan 4 ${user?.stakeIndex === "4" ? "✅" : ""}`,
                callback_data: JSON.stringify({
                  command: "staketokenplan",
                  answer: "4",
                }),
              },
            ],
            [
              {
                text: "📝  Enter Amount & Send TX  📝",
                callback_data: JSON.stringify({
                  command: "staketokenamount",
                  answer: "stake amount",
                }),
              },
            ],
          ],
        },
      }
    );
  } catch (error) {
    console.log(error, "error in stake");
  }
}

async function stakeTokenPlan(args) {
  try {
    const chatId = args.user.chatId;
    const plan = args.answer;
    const user = await User?.findOneAndUpdate(
      { chatId },
      { stakeIndex: plan },
      { returnOriginal: false }
    );

    await bot.editMessageReplyMarkup(
      {
        inline_keyboard: [
          [
            {
              text: "📱 Menu",
              callback_data: JSON.stringify({
                command: "mainmenu",
                answer: "main menu",
              }),
            },
          ],
          [
            {
              text: "▓▓▓ Select Plan ▓▓▓",
              callback_data: JSON.stringify({
                command: "",
                answer: "",
              }),
            },
          ],
          [
            {
              text: `Plan 1 ${user?.stakeIndex === "1" ? "✅" : ""}`,
              callback_data: JSON.stringify({
                command: "staketokenplan",
                answer: "1",
              }),
            },
            {
              text: `Plan 2 ${user?.stakeIndex === "2" ? "✅" : ""}`,
              callback_data: JSON.stringify({
                command: "staketokenplan",
                answer: "2",
              }),
            },
            {
              text: `Plan 3 ${user?.stakeIndex === "3" ? "✅" : ""}`,
              callback_data: JSON.stringify({
                command: "staketokenplan",
                answer: "3",
              }),
            },
            {
              text: `Plan 4 ${user?.stakeIndex === "4" ? "✅" : ""}`,
              callback_data: JSON.stringify({
                command: "staketokenplan",
                answer: "4",
              }),
            },
          ],
          [
            {
              text: "📝  Enter Amount & Send TX  📝",
              callback_data: JSON.stringify({
                command: "staketokenamount",
                answer: "stake amount",
              }),
            },
          ],
        ],
      },
      { chat_id: chatId, message_id: args?.msgId }
    );
  } catch (error) {
    console.log(error, "error in update index for stake -==- =-=-==");
  }
}

async function stakeTokenAmount(args) {
  await bot.sendMessage(
    args.user.chatId,
    "Please Enter Stake_Token_Amount & Send Transaction",
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
}
async function stakeToken(chatID, Amount) {
  let waitMsg = {};
  const user = await User.findOne({ chatId: chatID });
  try {
    // valicate ammount
    const validateAmount = async () => {
      const plan = await PlansRecord.findOne({ Index: user?.stakeIndex - 1 });
      if (+Amount >= +plan?.MinAmount && +Amount <= +plan?.MaxAmount) {
        return Amount;
      } else {
        bot.sendMessage(chatID, "Please Enter Amount According To Plan ");
        return;
      }
      // check amount against index in database not work
      // if (+user?.stakeIndex === 1) {
      //   if (+Amount >= 100 && +Amount <= 499) {
      //     return Amount;
      //   } else {
      //     bot.sendMessage(chatID, "Please Enter Amount According To Plan ");
      //     return;
      //   }
      // } else if (+user?.stakeIndex === 2) {
      //   if (+Amount >= 500 && +Amount <= 4999) {
      //     return Amount;
      //   } else {
      //     bot.sendMessage(chatID, "Please Enter Amount According To Plan ");
      //     return;
      //   }
      // } else if (+user?.stakeIndex === 3) {
      //   if (+Amount >= 5000 && +Amount <= 49999) {
      //     return Amount;
      //   } else {
      //     bot.sendMessage(chatID, "Please Enter Amount According To Plan ");
      //     return;
      //   }
      // } else if (+user?.stakeIndex === 4) {
      //   if (+Amount >= 50000) {
      //     return Amount;
      //   } else {
      //     bot.sendMessage(chatID, "Please Enter Amount According To Plan ");
      //     return;
      //   }
      // } else {
      //   bot.sendMessage(chatID, "Please Enter Amount According To Plan ");
      //   return;
      // }
    };

    let validAmount = await validateAmount();
    if (validAmount) {
      // wait msg for wait for Stake
      waitMsg = await bot.sendMessage(
        chatID,
        "Please Wait, Stake in Progress..."
      );

      let contract = await tokenContract(decryption(user?.privateKey));
      let contract1 = await stakingContract(decryption(user?.privateKey));

      const balance = await contract.balanceOf(user?.midAddress).call();
      if (+validAmount <= TronWeb.fromSun(balance)) {
        const allowance = await contract
          .allowance(user?.midAddress, process.env.StakingAddress)
          .call();
        // Allowance
        if (+validAmount >= TronWeb.fromSun(allowance)) {
          await contract.approve(process.env.StakingAddress, balance).send({
            shouldPollResponse: true,
          });
        }
        // Stake
        await contract1
          .stake(
            TronWeb.toSun(validAmount.toString()),
            user?.stakeIndex - 1,
            "TCTSMeC5C3hg3UHzxusbXwuok8EfQo1Y9t" //referral
          )
          .send({
            shouldPollResponse: true,
          });
        // delete wait msg
        bot.deleteMessage(chatID, waitMsg.message_id);
        waitMsg = {};
        bot.sendMessage(chatID, `Success! Token Staked`);
        mainmenu({ user });
      } else {
        // delete wait msg
        bot.deleteMessage(chatID, waitMsg.message_id);
        waitMsg = {};
        bot.sendMessage(
          chatID,
          `Insufficient Token Balance For Stake, Balance : ${TronWeb.fromSun(
            balance
          )}`
        );
      }
    }
  } catch (error) {
    if (error?.error?.includes("Not enough energy")) {
      // wallet Assets
      const NativeBalance = await tronWebClient.trx.getBalance(
        user?.midAddress
      );
      const bandwidth = await tronWebClient.trx.getBandwidth(user?.midAddress);
      // delete wait msg
      bot.deleteMessage(chatID, waitMsg.message_id);
      waitMsg = {};
      bot.sendMessage(
        chatID,
        `Not Enough Resourses For Stake ,Balance ${TronWeb.fromSun(
          NativeBalance
        )} TRX, BandWidth ${bandwidth}
      Error in Stake! ${error?.error} `
      );
    } else {
      console.log("error msg=-=-=-", error?.error);
      bot.sendMessage(
        chatID,
        `Error in Stake! ${error?.error}: See <a href='https://nile.tronscan.org/#/transaction/${error?.transaction?.txID}'>Transaction</a> For Error Details`,
        {
          parse_mode: "HTML",
        }
      );
    }
  }
}

module.exports = {
  stakemenu,
  stakeTokenPlan,
  stakeTokenAmount,
  stakeToken,
};
