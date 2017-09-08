
const Printer = require('printer');
util = require('util');
console.log("installed printers:\n"+util.inspect(Printer.getPrinters(), {colors:true, depth:10}));
console.log(Printer.getSupportedPrintFormats());
function Device() {

}
Device.prototype.init = function () {

};
Device.prototype.initPrinter = function () {
  var printersDom=document.getElementById('printers')
  var printers=Printer.getPrinters();
  console.log("supported job commands:\n"+util.inspect(Printer.getSupportedJobCommands(), {colors:true, depth:10}));
  printers.forEach(function (printer,index) {

    if (printer.name) {
      var option=document.createElement("option")
      option.value=printer.name;
      option.text=printer.name;
      printersDom.appendChild(option)
    }
  })
};
Device.prototype.initWeighter = function () {

};
Device.prototype.initScanner = function () {

};
var device=new Device();
device.initPrinter();
