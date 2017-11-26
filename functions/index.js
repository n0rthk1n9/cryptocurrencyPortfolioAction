'use strict';

const { DialogflowApp } = require('actions-on-google');
const functions = require('firebase-functions');
const firebase = require('firebase');
const cryptocurrencyExplanations = require('./cryptocurrencyExplanations');

process.env.DEBUG = 'actions-on-google:*';

const Actions = {
  TELL_CRYPTOCURRENCY: 'tell.cryptocurrency',
  WELOCME_INTENT: 'input.welcome',
  FALLBACK_INTENT: 'input.unknown',
  STOP_INTENT: 'tell.stop'
};

const findCryptocurrencyExplanations = searchQuery => {
  let found = cryptocurrencyExplanations.find(entry => {
    return entry.name === searchQuery;
  });
  return found;
};

const tellCryptocurrency = app => {
  console.log('tellCryptocurrency');
};

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
actionMap.set(Actions.WELOCME_INTENT, welcomeIntent);
actionMap.set(Actions.FALLBACK_INTENT, fallbackIntent);
actionMap.set(Actions.STOP_INTENT, stopIntent);

const cryptocurrencyPortfolio = functions.https.onRequest((request, response) => {
  const app = new DialogflowApp({ request, response });
  console.log(`Request headers: ${JSON.stringify(request.headers)}`);
  console.log(`Request body: ${JSON.stringify(request.body)}`);
  app.handleRequest(actionMap);
});

const fooBar = functions.https.onRequest((request, response) => {
  console.log('fooBar');
});

module.exports = {
  cryptocurrencyPortfolio,
  fooBar
};
