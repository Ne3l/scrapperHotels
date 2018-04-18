const browser = require('./browser').browser;
const cleanPreposiciones = str =>
  str.replace(/ DE /g, ' ').replace(/ LA /g, ' ');

const formatOutputCSV = value => (value == null ? '' : value);

module.exports = {
  cleanPreposiciones,
  browser,
  formatOutputCSV
};
