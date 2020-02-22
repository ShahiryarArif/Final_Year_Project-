App = {
    web3Provider: null,
    contracts: {},
    account: '0x95f7f07c365B69eE0B4071C04066f009890c3c68',
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,
  
    init: function() {
      console.log("App initialized...")
      return App.initWeb3();
    },
  
    initWeb3: function() {
      if (typeof web3 !== 'undefined') {
        // If a web3 instance is already provided by Meta Mask.
        App.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
      } else {
        // Specify default instance if no web3 instance provided
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        web3 = new Web3(App.web3Provider);
      }
      if(web3.isConnected()){
        console.log('web3 connected');
      }
      return App.initContracts();
    },
  
    initContracts: function() {
      $.getJSON("ERC20Sale.json", function(ERC20Sale) {
        App.contracts.ERC20Sale = TruffleContract(ERC20Sale);
        App.contracts.ERC20Sale.setProvider(App.web3Provider);
        App.contracts.ERC20Sale.deployed().then(function(ERC20Sale) {
          console.log("ERC20 Sale Address:", ERC20Sale.address);
        });
      }).done(function(){
        $.getJSON("IOTPool.json", function(IOTPool) {
            App.contracts.IOTPool = TruffleContract(IOTPool);
            App.contracts.IOTPool.setProvider(App.web3Provider);
            App.contracts.IOTPool.deployed().then(function(IOTPool) {
              console.log("IOTPool Address:", IOTPool.address);
            });
      })
    }).done(function() {
        $.getJSON("ERC20.json", function(ERC20) {
          App.contracts.ERC20 = TruffleContract(ERC20);
          App.contracts.ERC20.setProvider(App.web3Provider);
          App.contracts.ERC20.deployed().then(function(ERC20) {
            console.log("ERC20 Address:", ERC20.address);
          });
  
          App.listenForEvents();
          return App.render();
        });
      })
    },
  
    // Listen for events emitted from the contract
    listenForEvents: function() {
      App.contracts.ERC20Sale.deployed().then(function(instance) {
        instance.Sell({}, {
          fromBlock: 0,
          toBlock: 'latest',
        }).watch(function(error, event) {
          console.log("event triggered", event);
          App.render();
        })
      })
    },
  
    render: function() {
        
      // Load account data
      console.log("Your Account: " + App.account);
      web3.eth.getCoinbase(function(err, account) {
        if(err === null) {
          App.account = account;
          $('#exampleInputEmail1').val("" + account);
          console.log("Your Account: " + account);
        }
        else{
          console.log(err);
        }
      })
  
      // Load token sale contract
      App.contracts.ERC20Sale.deployed().then(function(instance) {
        ERC20SaleInstance = instance;
        return ERC20SaleInstance.tokenPrice();
      }).then(function(tokenPrice) {
        App.tokenPrice = tokenPrice;
        //$('.token-price').html(web3.utils.fromWei(App.tokenPrice, "ether").toNumber());
        return ERC20SaleInstance.tokensSold();
      }).then(function(tokensSold) {
        App.tokensSold = tokensSold.toNumber();
        $('.tokens-sold').html(App.tokensSold);
        $('.tokens-available').html(App.tokensAvailable);
  
        //Load token contract
        App.contracts.ERC20.deployed().then(function(instance) {
            ERC20Instance = instance;
          return ERC20Instance.balanceOf(App.account);
        }).then(function(balance) {
          $('.ERC20-balance').html(balance.toNumber());
        })
       });
    },
  
    buyTokens: function() {
      var numberOfTokens = $('quantity').val();
      App.contracts.ERC20Sale.deployed().then(function(instance) {
        return instance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000 // Gas limit
        });
      }).then(function(result) {
        console.log("Tokens bought...")
        //$('form').trigger('reset') // reset number of tokens in form
        // Wait for Sell event
      });
    },

    initiate_session: function(){
        App.contracts.IOTPool.deployed().then(function(instance) {
            return instance.initiate_session( {
              from: App.account,
              gas: 500000 // Gas limit
            });
          }).then(function(result) {
            console.log("session initiated...")
          });
    }

  }
  
  $(function() {
    $(window).on('load',function() {
      App.init();
    })
  });