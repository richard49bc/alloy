var path = require('path'),
	_ = require('../../../lib/alloy/underscore')._,
	CU = require('../compilerUtils'),
	U = require('../../../utils'),
	TYPES = ['view','widget'];

exports.parse = function(node, state) {
	return require('./base').parse(node, state, parse);
};

function parse(node, state, args) {
	var code = '',
		type = node.getAttribute('type') || 'view',
		src = node.getAttribute('src'),
		method;

	// validate src
	if (!src) {
		U.die('<Require> elements must have a "src" attribute.');
	} else if (U.XML.getElementsFromNodes(node.childNodes).length !== 0) {
		U.die('<Require> elements may not have child elements.');
	}

	// determine which Alloy method to use
	switch(type) {
		case 'view':
			method = 'getController';
			break;
		case 'widget':
			method = 'getWidget';
			break;
		default:
			U.die('Invalid <Require> type "' + type + '"');
	}

	// TODO: do a compile time check to make sure the src exists based on 
	//       its location determined by type

	// Generate runtime code
	code += args.symbol + " = new (Alloy." + method + "('" + src + "'))(" + CU.generateStyleParams(
		state.styles, 
		args.classes, 
		args.id, 
		node.nodeName, 
		args.createArgs
	) + ");\n";
	if (args.parent.symbol) {
		code += args.symbol + '.setParent(' + args.parent.symbol + ');\n';
	} 

	return {
		parent: {
			node: node,
			symbol: args.symbol + '.getRoots()'
		},
		styles: state.styles,
		code: code
	}
};