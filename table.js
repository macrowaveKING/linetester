function Table() {
  this.targetElement=null;
  //this.lastRowNumber=0;
}
Table.prototype.init = function (target) {
  this.targetElement=document.getElementById(target)
  console.log(this.targetElement);


  console.log("init called");
};
Table.prototype.addRow = function (rowNumber) {

  var rowLength=this.targetElement.rows.length;
  var rowForInsert=rowLength;
  if(rowNumber==null)
  rowForInsert=rowLength
  if (rowNumber>rowLength) {
    return null;
  }

  var row=this.targetElement.insertRow(rowForInsert);
  //row.addEventListener('contextmenu')
  return row;
  //this.lastRowNumber++;
  console.log("add row called");
};
Table.prototype.addCell = function (rowNumber,content,id) {
  var cells=cellLength=this.targetElement.rows[rowNumber].cells;

  var cellLength=cells.lenght

  var cell=this.targetElement.rows[rowNumber].insertCell(length)
  cell.className="plain";
  cell.id=id;
  //cell.style.width='50px';
  cell.innerHTML=content;
};
Table.prototype.deleteRow = function (rowNumber) {
  if (rowNumber>=lastRowNumber) {
    return;
  }
  this.targetElement.deleteRow(rowNumber);

};
Table.prototype.addCaption = function (rowNumber,content) {
  var cells=this.targetElement.rows[rowNumber].cells;

  var cellLength=cells.lenght
  var cell=this.targetElement.rows[rowNumber].insertCell(length)
  cell.className="caption"
  cell.innerHTML=content;
};
Table.prototype.addImageCell = function (rowNumber,content) {
  var cells=this.targetElement.rows[rowNumber].cells;

  var cellLength=cells.lenght
  var cell=this.targetElement.rows[rowNumber].insertCell(length)
  cell.className="placeWhole"
  cell.colSpan=4;
  cell.innerHTML=content;
};

Table.prototype.deleteCell = function (rowNumber,cellNumber) {
this.targetElement.rows[rowNumber].deleteCell(cellNumber)
};
Table.prototype.createFooter = function (content) {
  var footer=this.targetElement.createTFoot()
  footer.innerHTML=content;
  footer.colSpan=4;
};
var table=new Table()
table.init('printable')
table.addRow()
table.addCell(0,"乐清金泰","supplier")
table.addCaption(0,"供应商")
table.addCell(0,"丁基胶塞")
table.addCaption(0,"品种")

table.addRow()

table.addCell(1,"SB02","recipe")
table.addCaption(1,"配方")
table.addCell(1,"2211","brand")
table.addCaption(1,"生胶牌号")

table.addRow()
table.addCell(2,"A级","grade")
table.addCaption(2,"硫化等级")
table.addCell(2,"20-A3","specification")
table.addCaption(2,"规格")
table.addRow()
table.addCell(3,"1234345","batchNo")
table.addCaption(3,"批号")
table.addCell(3,"123","quantity")
table.addCaption(3,"数量")

table.addRow()
table.addImageCell(4,'<svg id="barcode"></svg>')
//table.addCaption(3,"条形码")
