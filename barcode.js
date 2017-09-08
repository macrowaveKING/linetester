
console.log("barcode called");
/*
window.nodeRequire = require;
delete window.require;
delete window.exports;
delete window.module;
*/
const JsBarcode = require('jsbarcode');
//const Canvas = require('canvas');
//const jsbarcode = require('jsbarcode');
//<script src="../dist/JsBarcode.all.js"/>
//var container=document.getElementById('barcode2')


//const extjs = require('extjs');


function Barcode() {
  this.stringBarcode="12456789012345678901234";
  this.height=100;
  this.width=1.5;
}
//更新条形码--refresh barcode
Barcode.prototype.update = function () {
  //var input=document.getElementById('generateButton');
  //var me=this;
  //input.addEventListener('keyup',this.generateBarcode.bind(this));
  this.generateBarcode();
  //var table=document.getElementById('printable');
  //table.addEventListener('click',this.generateBarcode.bind(this));

};

//设置条码字符串--setting barcode string
Barcode.prototype.setStringBarcode = function (barcodeFromSerial) {
  this.stringBarcode=barcodeFromSerial;
};

//声称条形码--generate barcode
Barcode.prototype.generateBarcode = function () {
  JsBarcode("#barcode")
    .options({font: "OCR-B",height:20,width:this.width}) // Will affect all barcodes
    .CODE128(global.getBarcodeText(), {fontSize: 16, textMargin: 0})
    .blank(20) // Create space between the barcodes
    //.EAN5("12345", {height: 85, textPosition: "top", fontSize: 16, marginTop: 15})
    .render();
};
let code=new Barcode();
global.addListener(code);
code.generateBarcode();

code.update();
