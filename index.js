var stylus = require('stylus');
var path = require('path');
var fs = require('fs');

var stFunctions = fs.readFileSync(path.resolve(__dirname, './node_modules/stylus/lib/functions/index.styl'), 'utf-8');

var options = {};

var parseStringedNodes = function(stringed) {
	var parsed = '';

	try {
		stringed = stringed
			.replace(/\\/g, '')
			.replace(/"\({/g, '{')
			.replace(/}\)"/g, '}');
		parsed = JSON.parse(stringed);
		for (var key in parsed) {
			if (parsed[key] instanceof Object) {
				parsed[key] = parseStringedNodes(JSON.stringify(parsed[key]));
			} else {
				parsed[key] = removeRoundBrackets(parsed[key].toString());
			}
		}
	} catch (e) {
		parsed = removeRoundBrackets(stringed.toString());
	}

	return parsed;
};

var removeRoundBrackets = function(string) {
	var symbols = /^\(+/.exec(string);
	var splittedSymbols = symbols && symbols[0] ? symbols[0].split('') : [];
	var length = splittedSymbols.length;

	if (length > 0) {
		return string.substring(length).slice(0, length * -1);
	} else {
		return string;
	}
};

var expressionsToObject = function(content) {
	content = stFunctions + content;
	var obj = {};

	var astC = new stylus.Parser(content, options).parse();
	var ast = new stylus.Parser(content, options).parse();
	var evaluator = new stylus.Evaluator(ast, options);
	ast = evaluator.evaluate();

	for (var index in ast.nodes) {
		var node = ast.nodes[index];
		var nodeC = astC.nodes[index];
		if (node.constructor.name === 'Expression') {
			var name = nodeC.name;
			var value = node.nodes.map(function(n) {
				var stringed = n.toString();
				return parseStringedNodes(stringed);
			});

			if (value[0] instanceof Object) {
				value = value[0];
			} else {
				value = value.join(' ');
			}

			obj[name] = value;
		}
	}

	//remove default stylus functions variables
	['called-from', 'vendors', 'PI', 'add-property-function', '$stylus_mixin_cache'].map(function(n) {
		delete obj[n];
	});

	return obj;
};

module.exports = function(content) {
	this.cacheable();
	var expressions = expressionsToObject(content);
	return 'module.exports = ' + JSON.stringify(expressions);
};
