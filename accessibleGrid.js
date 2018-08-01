/*
 * CTPS Accessibility Library
 *
 * This library currently supports (only) one 'accessible' object: the Accessible Grid.
 * This library depends upon the jQuery library. The jQuery support required is minimal,
 * so pretty much any version of jQuery should be adequate.
 *
 * VERSION = 0.04, 30 May 2012
 *
 * Author: Benjamin Krepp
 *
 * Revision history:
 * 
 * 0.04 - Wrapped everything in a wrapper object to minimize impact on global name space.
 *        Set datatable attribute on <table> element to "1".
 *        Ran through JsLint.
 * 0.03 - Documented column descriptor object.
 * 0.02 - Added support for renderer option in column descriptor object.
 *        loadArrayData clears contents of <tbody> before loading data.
 *        Added clearBody method.
 * 0.01 - Baseline version.
 *
*/
var CtpsAccessibilityLib = {};

/*
* AccessibleGrid() - Constructor function to create an accessible/navigable HTML grid object.
*                    Note: this constructor does NOT populate the body of the grid with data.
*
* WARNING/REMINDER: This is a *constructor* function. A call to it MUST be preceded by the "new"
*                   keyword, e.g.:
*                       var myGrid = new CtpsAccessibilityLib.AccessibleGrid( ... );
*                   Failure to do this will cause the global object to be (silently) clobbered!
*
* Parameters: oConfig (configuration object)
*
* Options in oConfig:
*     divId      - id of the <div> in which to create the table
*     tableId    - id of the <table> to be created
*     ariaLive   - value of aria-live attribute of the <div>; defaults to 'assertive'
*     summary    - string for summary attribute of the <table>
*     caption    - string for the <caption>
*     colDesc    - columns descriptor object
*
* Options in columns descriptor object:
*     header     - column header text
*     dataIndex  - name of field in input data object to be mapped to this column
*     renderer   - user-provided function to call to render data value (optional)
*
* @return - this (i.e., the object constructed)
*
*/
CtpsAccessibilityLib.AccessibleGrid = function(oConfig) {
	this.$divId = $('#' + oConfig.divId); // the jQuery object for the div into which to place the table
	this.tableId = oConfig.tableId;
	this.theadId = oConfig.tableId + '_head';
	this.tbodyId = oConfig.tableId + '_body';
	this.colDesc = oConfig.colDesc;
	this.nRows = 0; // Number of rows in the body of the table.
	
	var szCaption = oConfig.caption || '';
	var szSummary = oConfig.summary || '';
	var szAriaLive = oConfig.ariaLive || 'assertive';
  
	var szTemp = '';
	var i;
  
	szTemp  = '<table id="' + this.tableId + '"' + ' datatable="1"' + ' summary="' + szSummary + '"' + ' aria-live="' + szAriaLive + '"' + ' role="grid">';
	szTemp += '<caption>' + szCaption + '</caption>';
  
	szTemp += '<thead id="' + this.theadId + '"><tr>';
	for (i = 0; i < this.colDesc.length; i = i + 1) {
		szTemp += '<th id="' + this.tableId + '_' + this.colDesc[i].dataIndex + '"' + ' scope="col" role="gridcell">'; 
		szTemp += this.colDesc[i].header + '</th>';
	}
	szTemp += '</tr></thead>';
  
	szTemp += '<tbody ' + 'id="' + this.tableId + '_body">';
	szTemp += '</tbody>';
	szTemp += '</table>';

	$(szTemp).prependTo(this.$divId);
  
	this.$id = $('#' + this.tableId);                  // the jQuery object for the table
	this.$thead = $('#' + this.theadId);               // the jQuery object for the table header
	this.$headers = $('#' + this.theadId).find('th');  // an array of jquery objects for the header cells
	this.$data = $('#' + this.tbodyId);                // the jQuery object for the table body
}; // end AccessibleGrid() constructor

/*
 * loadArrayData() - Method to load the <tbody> of an AccessibleGrid object from a JavaScript array of objects.
 *                   Ensures that the <tbody> of the table is empty before loading the data.
 * 
 * Parameters: data - JavaScript array of objects.
 *
 * @return N/A
 */
CtpsAccessibilityLib.AccessibleGrid.prototype.loadArrayData = function(aData) {
	var thisObj = this;
	var count;
		
	// Remove any child nodes of the <tbody> element.
	thisObj.$data.empty();
		
	// Iterate over each record in the array, i.e., each row in the table.
	count = 0;
	$.each(aData, function(ndx, record) {
		count = count + 1;
		var szRow = '<tr>';
		var szRowId = thisObj.tableId + '_row_' + count;
		var i;
		var szTd;
		var szHeaders;

		// Iterate over the columns in a row.
		for (i = 0; i < thisObj.colDesc.length; i = i + 1) {
			if (i === 0) {
				szTd = '<td id="' + szRowId + '"' + ' scope="row" role="gridcell">';
			} else {
				szHeaders = thisObj.tableId + '_' + thisObj.colDesc[i].dataIndex + ' ' + szRowId;
				szTd = '<td headers="' + szHeaders + '" role="gridcell">';
			}
			szRow += szTd;
			szRow += (thisObj.colDesc[i].renderer === undefined) ? record[thisObj.colDesc[i].dataIndex] 
																 : thisObj.colDesc[i].renderer(record[thisObj.colDesc[i].dataIndex]);
			szRow += '</td>';
		} // for loop over columns
		szRow += '</tr>';
		thisObj.$data.append(szRow);
	});
	this.nRows = count;
}; // end loadArrayData()

/*
 * clearBody() - Method to remove the entire contents of the <tbody> of an AccessibleGrid object.
 * 
 * Parameters: none.
 *
 * @return N/A
 */
CtpsAccessibilityLib.AccessibleGrid.prototype.clearBody = function() {
	this.$data.empty();
	this.nRows = 0;
}; // end clearBody() 
