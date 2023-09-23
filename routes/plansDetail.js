const cron = require("node-cron");
const { PlansRecord } = require("../model/plans.js");
const TronWeb = require("tronweb");
const { stakingContract } = require("../utils/utils.js");

async function plansDetails() {
  console.log("Plans Details Updated");
  const contract1 = await stakingContract(process.env.defautlPrivate); //call first walllet private Key for Contract Read Methods
  const plansCount = await contract1.plans().call();
  // Plans Min Max Duration Fetch
  for (let i = 0; i < +plansCount; i++) {
    let min = await contract1.minAmounts(i).call();
    let max = await contract1.maxAmounts(i).call();
    let time = await contract1.maxDuration(i).call();

    let planData = await PlansRecord.findOne({
      Index: i,
    });
    if (planData) {
      await PlansRecord.findOneAndUpdate(
        {
          Index: i,
        },
        { MinAmount: min, MaxAmount: max, Duration: time }
      );
    } else {
      await PlansRecord.create({
        Index: i,
        MinAmount: +min,
        MaxAmount: +max,
        Duration: +time,
      });
    }
  }
}

cron.schedule("0 0 */1 * * *", () => {
  console.log("Cron Job At Every Hour");
  plansDetails();
});
