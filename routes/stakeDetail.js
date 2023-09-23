const { User, decryption } = require("../model/users.js");
const { bot } = require("../utils/bot.js");
const TronWeb = require("tronweb");
const { stakingContract, timeFromStemp } = require("../utils/utils.js");

async function stakeDetails(args) {
  let waitMsg = {};
  try {
    bot.deleteMessage(args.user.chatId, args.msgId);
    waitMsg = await bot.sendMessage(
      args.user?.chatId,
      "Stake Details In Progress..."
    );

    let user = await User.findOne({ chatId: args.user.chatId });
    const contract1 = await stakingContract(decryption(user?.privateKey));

    const stakeCount = await contract1.users(user?.midAddress).call();

    // get STake Records
    let record = [];
    let stakedDetails = "";
    if (stakeCount.numOfStakes > 0) {
      for (let i = 0; i < +stakeCount?.numOfStakes; i++) {
        const data = await contract1
          .viewStake(user?.midAddress, i.toString())
          .call();
        record.push(data);
      }

      for (let i = 0; i < +stakeCount?.numOfStakes; i++) {
        stakedDetails += `${record[i]?.active ? "✅" : "❌"}${
          i + 1
        }. Amount: ${TronWeb.fromSun(record[i]?.amount)} -  Plan: ${
          +record[i]?.plan + 1
        } - unstakeAt: ${timeFromStemp(record[i]?.unstakeTime)}\n`;
      }
    } else {
      stakedDetails = `Stake Count ${+stakeCount?.numOfStakes}
      Stake Record Not Found`;
    }
    bot.deleteMessage(args.user.chatId, waitMsg.message_id);
    waitMsg = {};
    return bot.sendMessage(
      args.user.chatId,
      `View Stakes\n\n${stakedDetails}

Please perform actions by Index
NOTE : For Claim & unStake you need to provide Index`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "UnStake",
                callback_data: JSON.stringify({
                  command: "unstake",
                  answer: "unstake",
                }),
              },
              {
                text: "Claim",
                callback_data: JSON.stringify({
                  command: "claim",
                  answer: "claim reward",
                }),
              },
            ],
            [
              {
                text: "📱 Main Menu",
                callback_data: JSON.stringify({
                  command: "mainmenu",
                  answer: "main menu",
                }),
              },
              {
                text: "🔃 Refresh",
                callback_data: JSON.stringify({
                  command: "stakedetails",
                  answer: "refresh StakeDetail",
                }),
              },
            ],
          ],
        },
      }
    );
  } catch (error) {
    bot.deleteMessage(args.user.chatId, waitMsg.message_id);
    waitMsg = {};
    bot.sendMessage(args?.user?.chatId, `Error in View Stakes`);
    console.log(error?.error, "-=-=-==> Error in Stake view");
  }
}

async function unStakeToken(args) {
  await bot.sendMessage(
    args.user.chatId,
    "Please Enter Stake_Index_To_unStake",
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
}
async function claimStakeReward(args) {
  await bot.sendMessage(args.user.chatId, "Please Enter Stake_Index_To_Claim", {
    reply_markup: {
      force_reply: true,
    },
  });
}

async function handleUnStake(chatID, stakeIndex, messageId) {
  let waitMsg = {};
  try {
    bot.deleteMessage(chatID, messageId);
    waitMsg = await bot.sendMessage(chatID, "UnStake In Progress...");
    const user = await User?.findOne({ chatId: chatID });
    const contract1 = await stakingContract(decryption(user?.privateKey));
    // estimate unstake Duration

    const data = await contract1
      .viewStake(user?.midAddress, stakeIndex - 1)
      .call();
    let unstakeTime = data?.unstakeTime;
    var currentTime = new Date().getTime() / 1000;
    if (unstakeTime < currentTime) {
      // unstake Handle
      await contract1.unstake(stakeIndex - 1).send({
        shouldPollResponse: true,
      });
      // delete Wait Msg
      bot.deleteMessage(chatID, waitMsg.message_id);
      waitMsg = {};
      await bot.sendMessage(chatID, `Success! unStake Confirmed.`);
    } else {
      // delete Wait Msg
      bot.deleteMessage(chatID, waitMsg.message_id);
      waitMsg = {};
      await bot.sendMessage(
        chatID,
        `Please Wait For UnStake Time, (unstakeTime : ${timeFromStemp(
          unstakeTime
        )})`
      );
    }
  } catch (error) {
    // delete Wait Msg
    bot.deleteMessage(chatID, waitMsg.message_id);
    waitMsg = {};
    console.log(error?.error, "-=-=-==-Error in unStake");
    bot.sendMessage(
      chatID,
      `Error in UnStake! ${error?.error} : See <a href='https://nile.tronscan.org/#/transaction/${error?.transaction?.txID}'>Transaction</a> For Error Details`,
      {
        parse_mode: "HTML",
      }
    );
  }
}
async function handleClaim(chatID, stakeIndex, messageId) {
  let waitMsg = {};
  try {
    bot.deleteMessage(chatID, messageId);
    waitMsg = await bot.sendMessage(chatID, "ClaimReward In Progress...");
    const user = await User?.findOne({ chatId: chatID });
    const contract1 = await stakingContract(decryption(user?.privateKey));
    // Claim Handle
    await contract1.claimReward(stakeIndex - 1).send({
      shouldPollResponse: true,
    });
    // delete Wait Msg
    bot.deleteMessage(chatID, waitMsg.message_id);
    waitMsg = {};
    await bot.sendMessage(chatID, `Success! Claim Reward Confirmed. `);
  } catch (error) {
    // delete Wait Msg
    bot.deleteMessage(chatID, waitMsg.message_id);
    waitMsg = {};
    console.log(error, "-=-=-==-Error in Claim");
    bot.sendMessage(
      chatID,
      `Error in Claim! ${error?.error} : See <a href='https://nile.tronscan.org/#/transaction/${error?.transaction?.txID}'>Transaction</a> For Error Details`,
      {
        parse_mode: "HTML",
      }
    );
  }
}

module.exports = {
  stakeDetails,
  unStakeToken,
  claimStakeReward,
  // write function of staking Contract
  handleUnStake,
  handleClaim,
};
