const { ethers, Contract, BigNumber } = require("ethers");
const tokenAbi = require("./TokenAbi.json");
const stakingAbi = require("./StakingAbi.json");

let walletAddress = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";

const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc-mumbai.maticvigil.com"
);
const voidAccount = new ethers.VoidSigner(walletAddress, provider);

function contract(address, ABI, signer) {
  if (signer) {
    return new Contract(address, ABI, signer);
  } else {
    return new Contract(address, ABI, voidAccount);
  }
}

function useTokenContract(signer) {
  return contract(process.env.TokenAddress, tokenAbi, signer);
}

function useStakingContract(signer) {
  return contract(process.env.StakingAddress, stakingAbi, signer);
}

function calculateGasMargin(value) {
  return +(
    (value * BigNumber.from(10000).add(BigNumber.from(1000))) /
    BigNumber.from(10000)
  ).toFixed(0);
}

const gasEstimationPayable = async (account, fn, data, amount) => {
  if (account) {
    const estimateGas = await fn(...data, ethers.constants.MaxUint256).catch(
      () => {
        return fn(...data, { value: amount.toString() });
      }
    );
    return calculateGasMargin(estimateGas);
  }
};

const gasEstimationForAll = async (account, fn, data) => {
  if (account) {
    const estimateGas = await fn(...data, ethers.constants.MaxUint256).catch(
      () => {
        return fn(...data);
      }
    );
    return calculateGasMargin(estimateGas);
  }
};

module.exports.provider = provider;
module.exports.voidAccount = voidAccount;
module.exports.gasEstimationForAll = gasEstimationForAll;
module.exports.gasEstimationPayable = gasEstimationPayable;
module.exports.useTokenContract = useTokenContract;
module.exports.useStakingContract = useStakingContract;
