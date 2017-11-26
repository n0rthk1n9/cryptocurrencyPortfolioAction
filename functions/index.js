'use strict';

const { DialogflowApp } = require('actions-on-google');
const functions = require('firebase-functions');
const firebase = require('firebase');
const request = require('request');
const cryptocurrencyExplanations = require('./cryptocurrencyExplanations');

var config = {
  apiKey: "AIzaSyA-SXYc3CXfjYu3M_gTNbxMt21ESNKkEGo",
  authDomain: "ccpf-44d3c.firebaseapp.com",
  databaseURL: "https://ccpf-44d3c.firebaseio.com",
  projectId: "ccpf-44d3c",
  storageBucket: "ccpf-44d3c.appspot.com",
  messagingSenderId: "559699961753"
};
firebase.initializeApp(config);

var cryptocurrency = '';
var amount = 0;
var userId = 0

process.env.DEBUG = 'actions-on-google:*';

const Actions = {
  TELL_CRYPTOCURRENCY: 'tell.cryptocurrency',
  ADD_TO_PORTFOLIO: 'add.portfolio',
  TELL_PORTFOLIO: 'tell.portfolio',
  WELOCME_INTENT: 'input.welcome',
  FALLBACK_INTENT: 'input.unknown',
  STOP_INTENT: 'tell.stop'
};

const saveMarketData = function(marketData, cb) {
  const database = firebase.database();
  database.ref('market').set(marketData);
  cb(true);
}

const formatMarketData = function(market, cb) {
  var formatted = {};
  market.forEach(function(currency) {
    formatted[currency.id] = currency;
  })
  cb(formatted);
}

const findCryptocurrencyExplanations = searchQuery => {
  let found = cryptocurrencyExplanations.find(entry => {
    return entry.name === searchQuery;
  });
  return found;
};

const tellCryptocurrency = app => {
  const database = firebase.database();
  const cryptocurrencyValueRef = database.ref('market/' + cryptocurrency.toLowerCase() + '/price_usd');
  cryptocurrencyValueRef.on('value', snapshot => {
    var priceForOneUnit = snapshot.val();
    var valueOfAskedAmount = amount * priceForOneUnit;
    var roundedValueOfAskedAmount = Math.round(valueOfAskedAmount).toFixed(2);
    app.tell(amount + ' ' + cryptocurrency + ' is currently worth ' + roundedValueOfAskedAmount + ' US Dollar');
  });
};

const addToPortfolio = app => {
  const database = firebase.database();
  database.ref('users/' + userId).set({
    email: 'foo@bar.de',
    portfolio: {
      [cryptocurrency.toLowerCase()]:  {
        amount: amount,
        currencyId: cryptocurrency.toLowerCase()
      }
    },
    token: 'tbd',
    uuid: userId
  });
  app.tell('I added ' + amount + ' ' + cryptocurrency + ' to your portfolio.');
};

const tellPortfolio = app => {
  // const database = firebase.database();
  // const portfolioRef = database.ref('users/' + userId + '/portfolio/');
  // var valueOfAskedAmount = 0;
  // var roundedValueOfAskedAmount = 0;
  // portfolioRef.on('value', snapshot => {
  //   var portfolio = snapshot.val();
  //   console.log(portfolio);
  //   for (var i in portfolio) {
  //     var portfolioElement = portfolio[i];
  //     var portfolioElementAmount = portfolioElement.amount;
  //     const cryptocurrencyValueRef = database.ref('market/' + portfolioElement + '/price_usd');
  //     cryptocurrencyValueRef.on('value', snapshot => {
  //       var priceForOneUnit = snapshot.val();
  //       valueOfAskedAmount = portfolioElement.amount * priceForOneUnit;
  //       roundedValueOfAskedAmount = Math.round(valueOfAskedAmount).toFixed(2);
  //     });
  //   }
  //   app.tell('Your portfolio is currently worth ' + roundedValueOfAskedAmount + ' US Dollar');
  // });
  app.tell('Your portfolio is currently worth 999 US Dollar');
}

const welcomeIntent = app => {
  app.tell('welcomeIntent');
};

const fallbackIntent = app => {
  app.tell('fallbackIntent');
};

const stopIntent = app => {
  app.tell('stopIntent');
}

const actionMap = new Map();
actionMap.set(Actions.TELL_CRYPTOCURRENCY, tellCryptocurrency);
actionMap.set(Actions.ADD_TO_PORTFOLIO, addToPortfolio);
actionMap.set(Actions.TELL_PORTFOLIO, tellPortfolio);
actionMap.set(Actions.WELOCME_INTENT, welcomeIntent);
actionMap.set(Actions.FALLBACK_INTENT, fallbackIntent);
actionMap.set(Actions.STOP_INTENT, stopIntent);

const cryptocurrencyPortfolio = functions.https.onRequest((request, response) => {
  const app = new DialogflowApp({ request, response });
  console.log(`Request headers: ${JSON.stringify(request.headers)}`);
  console.log(`Request body: ${JSON.stringify(request.body)}`);
  if (request.body.result.parameters.cryptocurrency) {
    cryptocurrency = request.body.result.parameters.cryptocurrency;
  } else {
    cryptocurrency = 'unknown';
  }
  if (request.body.result.parameters.number) {
    amount = request.body.result.parameters.number;
  } else {
    amount = 999;
  }
  if (request.body.originalRequest.data.user.userId) {
    userId = request.body.originalRequest.data.user.userId;
  } else {
    userId = Math.floor(Math.random() * (9999 - 1)) + 1;
  }
  app.handleRequest(actionMap);
});

const fooBar = functions.https.onRequest((req, response) => {
  console.log('fooBar');
  request.get('https://api.coinmarketcap.com/v1/ticker/?limit=10', function(err, res, body) {
    console.log('error:', err); // Print the error if one occurred
    console.log('statusCode:', res && res.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
    formatMarketData(JSON.parse(body), function(market) {
      saveMarketData(market, function(ok) {
        response.status(200).end('ok');
      })
    });
  });
  // response.status(200).end('ok');
});

module.exports = {
  cryptocurrencyPortfolio,
  fooBar
};
