var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/tsubscription',function(req,res,next){
  console.log("Received request!");
  console.log(req.body);
  res.json(req.body);
});

module.exports = router;
