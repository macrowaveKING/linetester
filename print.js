
const Dom2Image = require('dom-image');
function Print() {

}
Print.prototype.performPrint = function () {
  var target=document.getElementById("printable")

  console.log("target is: "+target);
  var printers=document.getElementById("printers");
  var printerName=printers.options[printers.selectedIndex].text
  console.log(printerName);
  const Printer = require('printer');
  const fs = require('fs');

  //console.log(window.saveAs);
  //window.print();
  Dom2Image.toBlob(target).then(function (blob) {
    console.log("blob length is:"+blob);

    Printer.printDirect({data:blob,
      printer: printerName, // printer name, if missing then will print to default printer
      success:function(jobID){
        console.log("sent to printer with ID: "+jobID);
      },
      error:function(err){
        console.log(err);
      }
    });

  })


};

var Print=new Print();
