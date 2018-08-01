/*
 * CTPS Accessibility Library
 *
 * This library currently supports (only) one 'accessible' object: the Accessible Grid.
 * This library depends upon the jQuery library. The jQuery support required is minimal,
 * so pretty much any version of jQuery should be adequate. The current (0.05) version 
 * of this library has been successfully tested with versions of jQuery going back as 
 * far as version 1.0.
 *
 * VERSION = 0.06, 5 June 2012
 *
 * Author: Benjamin Krepp
 *
 * Revision history:
 * 
 * 0.06 - Added support for thcls and cls options in columns descriptor.
 *        Tightend up the code a bit.
 * 0.05 - Interface change: Renamed constructor 'AccessibleGrid' simply to 'Grid',
 *        in belated recognition of encapsulation by the CtpsAccessibilityLib object. 
 *        "prototype" functions made explicit members of Grid.prototype object.
 *        Added col1th, scopeAttrs, and style configuration options.
 *        Added versionID string.
 * 0.04 - Interface change: Introduced CtspAccessibilityLib object to minimize impact
 *        on the global name space.
 *        Added datatable attribute to <table> element; set its value to "1".
 *        Ran through JsLint.
 * 0.03 - Documented column descriptor object.
 * 0.02 - Added support for renderer option in column descriptor object.
 *        loadArrayData clears contents of <tbody> before loading data.
 *        Added clearBody method.
 * 0.01 - Baseline version - first cut, rough implementation.
 *
*/
var CtpsAccessibilityLib = {};

/*
* Grid() - Constructor function to create an accessible/navigable HTML grid object.
*          Note: this constructor does NOT populate the body of the grid with data.
*
* WARNING/REMINDER: This is a *constructor* function. A call to it MUST be preceded by the "new"
*                   keyword, e.g.:
*                       var myGrid = new CtpsAccessibilityLib.Grid( ... );
*                   Due to a defect inherent in the JavaScript runtime model, failure to do this
*                   will cause the global object to be (silently) clobbered when ANY constructor
*                   function is invoked! Caveat emptor.
*
* Parameters: oConfig (configuration object)
*
* Options in oConfig:
*     divId      - id of the <div> in which to create the table (REQUIRED)
*     tableId    - id of the <table> to be created
*     ariaLive   - value of aria-live attribute of the <div>; defaults to 'assertive'
*     caption    - string for the table's <caption>
*     colDesc    - columns descriptor object (see below)
*     col1th     - generate a <th> element (rather than a <td> element) for the first  
*                  data cell in each row; defaults to false
*     scopeAttrs - generate a scope="col" attribute for the <th> element for each column
*                  in the table and a scope="row" for the first element (<td> or <th>) in 
*                  each row in the table; defaults to true
*     style      - value of style attribute to be assigned to the <table> created;
*                  this is specified as a string, e.g., style="width:500"
*     summary    - string for summary attribute of the <table>
*     tablecls   - CSS class to assign to <table> element
*     capcls     - CSS class to assgin to <caption> element
*     theadcls   - CSS class to assign to <thead> element
*     tbodycls   - CSS class to assign to <tbody> element
*
* Options in columns descriptor object:
*     cls        - CSS class to assign to "data" elements for this colum (<td> or <th>).
*     dataIndex  - name of field in input data object to be mapped to this column (REQUIRED)
*     header     - column header text
*     renderer   - user-provided function to call to render each data value (optional)
*     style      - value of style attribute to be assigned to the table header (<th>) element
*                  created for the column; this is specified as a string, e.g., style="width:50"
*     thcls      - CSS class to assign to column header <th> element
*
* @return - this (i.e., the object constructed)
*
*/
CtpsAccessibilityLib.Grid = function(oConfig) {
	this.$divId = $('#' + oConfig.divId); // the jQuery object for the div into which to place the table
	this.tableId = (oConfig.tableId !== undefined) ? oConfig.tableId : this.$divId + '_table';
	this.theadId = oConfig.tableId + '_head';
	this.tbodyId = oConfig.tableId + '_body';
	this.colDesc = oConfig.colDesc;
	this.col1th  = oConfig.col1th || false;
	this.scopeAttrs = (oConfig.scopeAttrs !== undefined) ? oConfig.scopeAttrs : true;
	this.nRows   = 0; // Number of rows in the body of the table.
	
	var szCaption  = oConfig.caption || '';
	var szSummary  = oConfig.summary || '';
	var szAriaLive = oConfig.ariaLive || 'assertive';
	
	var szTablecls = oConfig.tablecls || '';
	var szTheadcls = oConfig.theadcls || '';
	var szTbodycls = oConfig.tbodycls || '';
	var szCapcls   = oConfig.capcls || '';
	
	var szTemp = '';
	var i;
  
	szTemp  = '<table id="' + this.tableId + '"' ;
	szTemp += ' datatable="1"' + ' summary="' + szSummary + '"' ;
	szTemp += (oConfig.tablecls !== undefined) ? ' class="' + oConfig.tablecls + '"' : '';
	szTemp += (oConfig.style !== undefined) ? ' style="' + oConfig.style + '"' : '';
	szTemp += ' aria-live="' + szAriaLive + '"' + ' role="grid">';

	szTemp += '<caption '; 
	szTemp += (oConfig.capcls !== undefined) ? ' class="' + oConfig.capcls + '"' : '';
	szTemp += '>' + szCaption + '</caption>';
  
	szTemp += '<thead id="' + this.theadId;
	szTemp += (oConfig.theadcls !== undefined) ? ' class="' + oConfig.theadcls + '"' : '';
	szTemp += '">';
	
	szTemp += '<tr>';
	for (i = 0; i < this.colDesc.length; i++) {
		szTemp += '<th id="' + this.tableId + '_' + this.colDesc[i].dataIndex + '"' ;
		szTemp += (this.colDesc[i].thcls !== undefined) ? ' class="' + this.colDesc[i].thcls + '"' : '';
		szTemp += (this.colDesc[i].style !== undefined) ? ' style="' + this.colDesc[i].style + '"' : '';
		szTemp += (this.scopeAttrs === true) ? ' scope="col"' : '';
		szTemp += ' role="gridcell">'; 
		szTemp += this.colDesc[i].header + '</th>';
	}
	szTemp += '</tr>';
	szTemp += '</thead>';
  
	szTemp += '<tbody ' + 'id="' + this.tableId + '_body"' 
	szTemp += (oConfig.tbodycls !== undefined) ? ' class="' + oConfig.tbodycls + '"' : '';
	szTemp += '>';
	szTemp += '</tbody>';
	szTemp += '</table>';

	$(szTemp).prependTo(this.$divId);
  
	this.$id = $('#' + this.tableId);                  // the jQuery object for the table
	this.$thead = $('#' + this.theadId);               // the jQuery object for the table header
	this.$headers = $('#' + this.theadId).find('th');  // an array of jquery objects for the header cells
	this.$data = $('#' + this.tbodyId);                // the jQuery object for the table body
	return this; // This line is here only to be explicit. This is the default behavior for all constructors.
}; // end CtpsAccessibilityLib.Grid() constructor

CtpsAccessibilityLib.Grid.prototype = {
	szVersionID : "0.06",
	/*
	 * loadArrayData() - Method to load the <tbody> of an Grid object from a JavaScript array of objects.
	 *                   Ensures that the <tbody> of the table is empty before loading the data.
	 * 
	 * Parameters: data - JavaScript array of objects.
	 *
	 * @return N/A
	 */
	loadArrayData : function(aData) {
		var thisObj = this;
		var count;
			
		// Remove any child nodes of the <tbody> element.
		thisObj.$data.empty();
			
		// Iterate over all the records in the array, i.e., all the rows in the table.
		count = 0;
		$.each(aData, function(ndx, record) {
			count = count + 1;
			var szRow = '<tr>';
			var szRowId = thisObj.tableId + '_row_' + count;
			var i;
			var szTd;
			var szHeaders;

			// Iterate over all the columns in a row.
			for (i = 0; i < thisObj.colDesc.length; i++) {
				if (i === 0) {
					szTd = (thisObj.col1th === true) ? '<th ' : '<td '; 
					szTd += 'id="' + szRowId + '"';
					if (thisObj.colDesc[i].cls !== undefined) {
						szTd += ' class="' + thisObj.colDesc[i].cls + '"';
					}
					if (thisObj.scopeAttrs === true) {
						szTd += ' scope="row"';
					}
					szTd += ' role="gridcell">';
				} else {
					szHeaders = thisObj.tableId + '_' + thisObj.colDesc[i].dataIndex + ' ' + szRowId;
					szTd = '<td ';
					if (thisObj.colDesc[i].cls !== undefined) {
						szTd += ' class="' + thisObj.colDesc[i].cls + '"';
					}
					szTd += ' headers="' + szHeaders + '" role="gridcell">';
				}
				szRow += szTd;
				szRow += (thisObj.colDesc[i].renderer === undefined) ? record[thisObj.colDesc[i].dataIndex] 
																	 : thisObj.colDesc[i].renderer(record[thisObj.colDesc[i].dataIndex]);
				szRow += ((i === 0) && (thisObj.col1th === true)) ? '</th>' : '</td>';
			} // for loop over columns
			szRow += '</tr>';
			thisObj.$data.append(szRow);
		});
		this.nRows = count;
	}, // end loadArrayData()
	
	/*
	 * clearBody() - Method to remove the entire contents of the <tbody> of an Grid object.
	 * 
	 * Parameters: none.
	 *
	 * @return N/A
	 */
	clearBody : function() {
		this.$data.empty();
		this.nRows = 0;
	} // end clearBody() 
}; // end CtpsAccessibilityLib.Grid.prototype
