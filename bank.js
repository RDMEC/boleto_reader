module.exports.verify = function (req, res) {
	var boleto = req.params.boletonumber;
	var field1  = boleto.substr(0, 10);
	var field2  = boleto.substr(10, 11);
	var field3  = boleto.substr(21, 11);
	var field4  = boleto.substr(32, 1);
	var field5  = boleto.substr(33, 14);
	var dv1     = module10(field1);
	var dv2     = module10(field2);
	var dv3     = module10(field3);

	if(dv1 && dv2 && dv3) {
		var instFin = field1.substr(0,3);
		var currency = field1.substr(3,1);
		var pos20to24 = field1.substr(4,5);
		var pos25to34 = field2.substr(0,10);
		var pos35to44 = field3.substr(0,10);
		var fv = field5.substr(0,4);
		var fvDatified = datify(fv);
		var value = field5.substr(4,10);
		var valueDecimal = currency == 9 ? 'R$ ' + parseInt(value) / 100 : parseInt(value) / 100;
	} else {
		return res.status(400).send({"Boleto Válido" : false});
	}

	var barcode = instFin + currency + fv + value + pos20to24 + pos25to34 + pos35to44;
	var dv4 = module11(barcode, field4);
	
	if(dv4) {
		barcode = barcode.split('');
		barcode.splice(4, 0, field4);
		barcode = barcode.join('');

		res.status(200).send({
			'Boleto Válido'    : true,
			'Valor'            : valueDecimal,
			'Vencimento'       : fvDatified,
			'Código de Barras' : barcode
		});
	} else {
		return res.status(400).send({"Boleto Válido" : false});
	}
}



var datify = function (fv) {
	var baseDate = new Date(1997, 9, 7)
	baseDate.setDate(baseDate.getDate() + parseInt(fv));
	return baseDate.getUTCDate() +"/"+ (baseDate.getUTCMonth()+1) +"/"+ baseDate.getUTCFullYear();
};

var module10 = function (field) {
	var fieldSize = field.length - 1;
    var dv = field[fieldSize];
    field = field.substr(0, fieldSize);
    field = field.split('').reverse();
    var sum = 0;
    var dvFound = null;
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
   			var superiorTen = (Math.ceil(sum / 10) * 10);
   			dvFound = (superiorTen - remainder).toString().split('')[1]
        }
    }
    return dvFound == dv;
};

var module11 = function (barcode, dv) {
    barcode = barcode.split('').reverse();
    var sum = 0;
    var dvFound;
    for (var i = 0; i < barcode.length; i++) {
    	var multipliers = [2, 3, 4, 5, 6, 7, 8, 9];
    	var multIndex = i % multipliers.length;
        sum += barcode[i] * multipliers[multIndex];
        if (barcode.length -1 == i) {
            var remainder = sum % 11;
            if (remainder == 0 || remainder == 1) {
                dvFound = 1;
            } else {
                dvFound = 11 - remainder;
            }
        }
    }
    return dvFound == dv;
}