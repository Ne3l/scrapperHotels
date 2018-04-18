const cleanPreposiciones = str =>
  str.replace(/ DE /g, ' ').replace(/ LA /g, ' ');

module.exports = {
  cleanPreposiciones
};
