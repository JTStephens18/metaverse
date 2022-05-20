const Land = artifacts.require("Land");

module.exports = async function (deployer) {

    const NAME = "South Alabama Buildings"
    const SYMBOL = "SAB"
    const COST = web3.utils.toWei('1', 'ether')

await deployer.deploy(Land, NAME, SYMBOL, COST);
};