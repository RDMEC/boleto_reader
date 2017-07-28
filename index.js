var express = require('express');
app = express();

app.set('port', 5000);
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var bank = require(__dirname + '/bank.js')
var conces = require(__dirname + '/conces.js')


/* RETIRAR ANTES DA ENTREGA */
log = function(message){
  var stacklist = (new Error()).stack.split('\n')
  var parseError = stacklist[2].split('/')
  var fileNameLineNumber = parseError[parseError.length - 1] + " -"

  if(typeof message == 'string'){
    console.log(fileNameLineNumber, message)
  }
  else {
    console.log(fileNameLineNumber)
    console.log(message)
  }
  return fileNameLineNumber + "\n" + JSON.stringify(message)
}
/* RETIRAR ANTES DA ENTREGA */

app.get('/getboleto/:boletonumber',
	function(req, res, next){
		var boletoN = req.params.boletonumber;
		if (boletoN && (boletoN.length == 47 || boletoN.length == 48)) {
			next();
		} else {
			return res.status(400).send({"Boleto Válido" : false});
		}
	},
	function(req, res){
		req.params.boletonumber.length == 47 ? bank.verify(req, res) : conces.verify(req, res);
	}
)