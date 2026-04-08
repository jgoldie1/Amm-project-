const { v4: uuidv4 } = require('uuid');
function now(){ return new Date().toISOString(); }
function id(){ return uuidv4(); }
module.exports = { now, id };
