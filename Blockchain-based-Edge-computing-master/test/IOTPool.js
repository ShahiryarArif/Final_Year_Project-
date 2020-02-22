const ERC20 = artifacts.require("ERC20");
const IOTPool = artifacts.require("IOTPool");

contract('IOTPool',function(accounts){

    var tokenInstance;
    var IOTPOOLInstance;
    var admin = accounts[0];

    it('initializes contract with correct admin',function(){
        return IOTPool.deployed().then(function(instance){
            IOTPOOLInstance = instance;
            return IOTPOOLInstance.address
        }).then(function(address){
            assert.notEqual(address, 0x0,'must have nonzero address');
            return IOTPOOLInstance.tokenContract();
        }).then(function(address){
            assert.notEqual(address, 0x0,'must have nonzero address');
        });

    });

    it('tries to get access',function(){
        return ERC20.deployed().then(function(instance){
            tokenInstance = instance;
            //grab token instance first
            return IOTPool.deployed();
        }).then(function(instance){
            //then grab pool instance
            IOTPOOLInstance = instance;
            return IOTPOOLInstance.initiate_session({from:admin});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Access_Granted', 'should be the "Access" event');
            assert.equal(receipt.logs[0].args._device,admin,'device must match caller address');
        });
    });

    it('terminates session',function(){
        return ERC20.deployed().then(function(instance){
            tokenInstance = instance;
            //grab token instance first
            return IOTPool.deployed();
        }).then(function(instance){
            //then grab pool instance
            IOTPOOLInstance = instance;
            return IOTPOOLInstance.terminate_session(5,{from:admin});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Token_Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from,tokenInstance.address,'device must match caller address');
            assert.equal(receipt.logs[0].args._to,admin,'device must match caller address');
        });
    });


});