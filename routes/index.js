var express = require('express');
var router = express.Router();
var pool = require('./pool');
const { Server } = require("socket.io");


const io = new Server({ /* options */ });

io.on("connection", (socket) => {
  // ...
  console.log('connected')
});

io.listen(4000);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
