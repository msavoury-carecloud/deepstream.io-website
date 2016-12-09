const hbs = require( 'handlebars' );

const types = {
	important: 'Important',
	hint: 'Hint',
	warning: 'Warning',
	info: 'Info'
}

module.exports = function( type, header, options ) {
	if( !types[ type ] ) {
		throw new Error( `Unknown infobox ${type}, currently only supporting ${Object.keys(types)}` );
	}

	if( typeof header !== 'string' ) {
		options = header;
		header = types[ type ];
	}

	// use '\n- u' as list item separator
	// prepend dummy newline so that we do not have to treat the first line
	// extra
	var rawListBody = '\n' + options.fn().trim();
	var strings = rawListBody.split('\n- ');
	strings.forEach( function(text, index, array) {
		strings[index] = '<li>' + text + '</li>';
	});
	var listItems = strings.slice(1).join('\n');

	return new hbs.SafeString(
		'<div class="docbox infobox"><h3>' +
		header +
		'</h3><ul>' +
		listItems +
		'</ul></div>\n\n' );
};
