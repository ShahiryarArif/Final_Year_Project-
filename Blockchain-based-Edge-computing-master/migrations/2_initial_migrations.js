const ERC20 = artifacts.require("ERC20");
const IOTPool = artifacts.require("IOTPool");
const ERC20Sale = artifacts.require("ERC20Sale");


module.exports = function(deployer) {
  deployer.deploy(ERC20,1000000).then(function(){
    //token price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(IOTPool,ERC20.address, tokenPrice).then(function(){
      return deployer.deploy(ERC20Sale,ERC20.address, tokenPrice);
    });
  });
};