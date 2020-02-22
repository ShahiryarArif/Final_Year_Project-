var ERC20 = artifacts.require("./ERC20.sol");
var ERC20Sale = artifacts.require("./ERC20Sale.sol");

contract('ERC20Sale',function(accounts){

    var tokenInstance;
    var tokenSaleInstance;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokensAvailable = 700000;
    var tokenPrice = 1000000000000000;
    var numberOfTokens;
    it('initializes contract with correct values', function(){
        return ERC20Sale.deployed().then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.address
        }).then(function(address){
            assert.notEqual(address, 0x0,'must have nonzero address');
            return tokenSaleInstance.tokenContract();
        }).then(function(address){
            assert.notEqual(address, 0x0,'must have nonzero address');
            return tokenSaleInstance.tokenPrice();
        }).then(function(price){
            assert.equal(price, tokenPrice,'token Price is correct');
        });
    });

    it('facilitates token buying',function(){
        return ERC20.deployed().then(function(instance){
            tokenInstance = instance;
            //grab token instance first
            return ERC20Sale.deployed();
        }).then(function(instance){
            //then grab token sale instance
            tokenSaleInstance = instance;
            //provision 75% of total tokens to token sale
            return tokenInstance.transfer(tokenSaleInstance.address,  tokensAvailable,{from: admin});
        }).then(function(receipt){
            numberOfTokens = 10;
            return tokenSaleInstance.buyTokens(numberOfTokens , {from: buyer, value: numberOfTokens *tokenPrice})
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
            return tokenSaleInstance.tokensSold();
        }).then(function(amount){
            assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance) {
          assert.equal(balance.toNumber(), 250010);
          return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance) {
          assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
            //Try to buy tokens different from the ether value
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.toString().indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
            return tokenSaleInstance.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available test');
        });
    });

    it('ends token sale',function(){
        return ERC20.deployed().then(function(instance){
            tokenInstance = instance;
            //grab token instance first
            return ERC20Sale.deployed();
        }).then(function(instance){
            //then grab token sale instance
            tokenSaleInstance = instance;
            return tokenSaleInstance.endSale({from:buyer});
        }).then(assert.fail).catch(function(error){
            assert(error.message.toString().indexOf('revert') >= 0,'must bean admin to end token sale');
            return tokenSaleInstance.endSale({from:admin});
        }).then(function(receipt){
            //receipt
            return tokenInstance.balanceOf(admin);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 749890,'returns all unsold dapp tokens to admin');
        });
    });

});