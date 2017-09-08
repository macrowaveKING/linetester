
function Global() {
  this.supplier="4";
  this.specification="1"
  this.recipe="3"
  this.brand="1";
  this.grade="1";
  this.category="";
  this.quantity="12";
  this.weight="0012346";
  this.year="2017";
  this.month="03";
  this.batchNo="12345678";
  this.barcodeText="123456789012345678901234";
  this.listeners=new Array();

};
Global.prototype.connection = undefined;

Global.prototype.setBarcodeSegment = function (target) {
  var obj=document.getElementById(target)
  console.log("this is :"+obj);
  var value;

  if (obj instanceof HTMLSelectElement) {
    var option=obj.options[obj.selectedIndex];
    console.log("option is"+option);
    value=option.value;
  } else {

    value=obj.value;
  }
  console.log("setBarcodeSegment value is "+value);

  this[target]=value;
  this.composeBarcode();
  this.notify();
};


Global.prototype.getBarcodeText = function () {
  return this.barcodeText;
};

Global.prototype.composeBarcode= function () {
  this.barcodeText="";
  this.barcodeText+=this.category;
  this.barcodeText+=this.batchNo;
  this.barcodeText+=this.brand;
  this.barcodeText+=this.specification;
  this.barcodeText+=this.grade;
  this.barcodeText+=this.quantity;
  this.barcodeText+=this.year;
  this.barcodeText+=this.month;
  this.barcodeText+this.recipe;
  this.barcodeText+=this.weight;

};
Global.prototype.addListener = function (observer) {
  console.log("addListener observer is "+observer);
  this.listeners.push(observer)
};
Global.prototype.notify = function () {
  this.listeners.forEach(function (observer,index) {
    console.log("observer is "+observer);
    observer.update();
  })
};


setCellValue=function(obj) {

  console.log("this is :"+obj);
  var value;
  var text;
  if (obj instanceof HTMLSelectElement) {
    var option=obj.options[obj.selectedIndex];
    //console.log("option is"+option);
    value=option.value;
    text=option.text;
  } else {
    text=obj.value;
    value=obj.value;
  }
  global[obj.name]=value;
  global.composeBarcode();
  global.notify();
  document.getElementById(obj.name).innerHTML=text;
  //console.log("setCellValue leave");
};


Global.prototype.initConnection = function () {
  this.connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'13057877573',
    database:'business'
  });
  
};
Global.prototype.getConnection = function () {
  return this.connection;
};

const global=new Global();
