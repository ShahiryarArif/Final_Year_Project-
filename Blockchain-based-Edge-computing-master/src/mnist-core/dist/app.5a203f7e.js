// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../js/app.js":[function(require,module,exports) {
App = {
  web3Provider: null,
  contracts: {},
  account: '0x95f7f07c365B69eE0B4071C04066f009890c3c68',
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,
  init: function () {
    console.log("App initialized...");
    return App.initWeb3();
  },
  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }

    if (web3.isConnected()) {
      console.log('web3 connected');
    }

    return App.initContracts();
  },
  initContracts: function () {
    $.getJSON("ERC20Sale.json", function (ERC20Sale) {
      App.contracts.ERC20Sale = TruffleContract(ERC20Sale);
      App.contracts.ERC20Sale.setProvider(App.web3Provider);
      App.contracts.ERC20Sale.deployed().then(function (ERC20Sale) {
        console.log("ERC20 Sale Address:", ERC20Sale.address);
      });
    }).done(function () {
      $.getJSON("IOTPool.json", function (IOTPool) {
        App.contracts.IOTPool = TruffleContract(IOTPool);
        App.contracts.IOTPool.setProvider(App.web3Provider);
        App.contracts.IOTPool.deployed().then(function (IOTPool) {
          console.log("IOTPool Address:", IOTPool.address);
        });
      });
    }).done(function () {
      $.getJSON("ERC20.json", function (ERC20) {
        App.contracts.ERC20 = TruffleContract(ERC20);
        App.contracts.ERC20.setProvider(App.web3Provider);
        App.contracts.ERC20.deployed().then(function (ERC20) {
          console.log("ERC20 Address:", ERC20.address);
        });
        App.listenForEvents();
        return App.render();
      });
    });
  },
  // Listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.ERC20Sale.deployed().then(function (instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function (error, event) {
        console.log("event triggered", event);
        App.render();
      });
    });
  },
  render: function () {
    // Load account data
    console.log("Your Account: " + App.account);
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $('#exampleInputEmail1').val("" + account);
        console.log("Your Account: " + account);
      } else {
        console.log(err);
      }
    }); // Load token sale contract

    App.contracts.ERC20Sale.deployed().then(function (instance) {
      ERC20SaleInstance = instance;
      return ERC20SaleInstance.tokenPrice();
    }).then(function (tokenPrice) {
      App.tokenPrice = tokenPrice; //$('.token-price').html(web3.utils.fromWei(App.tokenPrice, "ether").toNumber());

      return ERC20SaleInstance.tokensSold();
    }).then(function (tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable); //Load token contract

      App.contracts.ERC20.deployed().then(function (instance) {
        ERC20Instance = instance;
        return ERC20Instance.balanceOf(App.account);
      }).then(function (balance) {
        $('.ERC20-balance').html(balance.toNumber());
      });
    });
  },
  buyTokens: function () {
    var numberOfTokens = $('quantity').val();
    App.contracts.ERC20Sale.deployed().then(function (instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit

      });
    }).then(function (result) {
      console.log("Tokens bought..."); //$('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  },
  initiate_session: function () {
    App.contracts.IOTPool.deployed().then(function (instance) {
      return instance.initiate_session({
        from: App.account,
        gas: 500000 // Gas limit

      });
    }).then(function (result) {
      console.log("session initiated...");
    });
  }
};
$(function () {
  $(window).on('load', function () {
    App.init();
  });
});
},{}]},{},["../js/app.js"], null)
//# sourceMappingURL=/app.5a203f7e.js.map