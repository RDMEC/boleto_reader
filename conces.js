module.exports.verify = function (req, res) {
	var boleto = req.params.boletonumber;
	var isMod10 = ['6', '7'].indexOf(boleto[2]) != -1;
	var hasValue = ['6', '8'].indexOf(boleto[2]) != -1;

	var chunks = [];
    var cutPos = 0
    for(var i = 0; i < 4; i++) {
        chunks[i] = boleto.substr(cutPos, 12);
        cutPos = cutPos + 12;
    }

    var dvs = false;
    for(var i = 0; i < chunks.length; i++) {
    	dvs = module(chunks[i], false, isMod10);
    	if(!dvs) break;
    }

    if(dvs) {
    	var barcode = chunks[0].substr(0,11) + chunks[1].substr(0,11) + chunks[2].substr(0,11) + chunks[3].substr(0,11);
    	var generalDV = module(barcode, true, isMod10);
    	if(generalDV) {
    		var valueDecimal = "Consultar Boleto Físico";
    		if(hasValue) {
    			var value = chunks[0].substr(4,7) + chunks[1].substr(0,4);
				var valueDecimal = 'R$ ' + parseInt(value) / 100;
    		}
    		var expiry = "Consultar Boleto Físico";
    		var possibleDate = chunks[1].substr(8,3) + chunks[2].substr(0,1) + '/' + chunks[2].substr(1,2) + '/' + chunks[2].substr(3,2);
    		if(Date.parse(possibleDate)) {
    			expiry = chunks[2].substr(3,2) + '/' + chunks[2].substr(1,2) + '/' + chunks[1].substr(8,3) + chunks[2].substr(0,1)
    		}
    		res.status(200).send({
				'Boleto Válido'    : true,
				'Valor'            : valueDecimal,
				'Vencimento'       : expiry,
				'Código de Barras' : barcode
			});
    	} else {
    		res.status(400).send({"Boleto Válido" : false})
    	}
    } else {
    	res.status(400).send({"Boleto Válido" : false})
    }
}



var datify = function (fv) {
	var baseDate = new Date(1997, 9, 7)
	baseDate.setDate(baseDate.getDate() + parseInt(fv));
	return baseDate;
};

var module = function(field, isGeneralDV, isMod10) {
	if(isGeneralDV) {
		dv = field.substr(3,1);
		field = field.substr(0,3) + field.substr(4,40);
	} else {
    	var fieldSize = field.length - 1;
    	dv = field[fieldSize];
    	field = field.substr(0, fieldSize);
	}

	if(isMod10) {
    	field = field.split('').reverse();
    	var sum = 0;
    	var dvFound;
    	for (var i = 0; i < field.length; i++) {
    		var mult = field[i] * (i % 2 == 0 ? 2 : 1);
    	    if (mult > 9) {
    	        sum += mult.toString().split('').reduce(function(a, b) {
    	            return parseInt(a) + parseInt(b);
    	        });
    	    } else {
    	        sum += mult;
    	    }
    	    if (field.length -1 == i) {
    	    	var remainder = sum % 10;
   				remainder == 0 ? dvFound = 0 : dvFound = 10 - remainder;
    	    }
    	}
	} else {
		field = field.split('').reverse();
    	var sum = 0;
    	var dvFound;
    	for(var i = 0; i < field.length; i++) {
    		var multipliers = [2, 3, 4, 5, 6, 7, 8, 9];
    		var multIndex = i % multipliers.length;
    	    sum += field[i] * multipliers[multIndex];
    	    if (field.length - 1 == i) {
    	        var remainder = sum % 11;
    	        if (remainder == 0 || remainder == 1) {
    	            dvFound = 0;
    	        } else {
    	            dvFound = 11 - remainder;
    	        }
    	    }
    	}
	}
	return dvFound == dv;
}