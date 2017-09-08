const mysql = require('mysql');
const vis = require('vis');

//const $ = require('jquery');
//const datatables = require('datatables')(window,$);
//const webix = require('webix');
//const spreadsheet = require('spreadsheet');
const connection=mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'13057877573',
  database:'business'
});
connection.connect();
var suggests=[];
function getOptions(field) {

}
connection.query('select productId As 产品ID, productName As 名称 ,productType As 型号, specification As 规格, brand As 品牌, picture As 图片,description As 描述 from business.Product',function (error,results,fields) {
  if (error) {
    throw error;
  }
  console.log(results);


var leftArea=[
  {view:"combo",label:"产品名称",options:["交流接触器","Contactor"]},
  {view:"text",suggest:[{id:1,value:"test"}],label:"型号"},
  {view:"combo",label:"规格",options:["220V 10A","380V 10A"]},
  {view:"combo",label:"品牌",options:suggests,on:{"onKeyPress":function(){
    suggests=[];

    connection.query('select distinct productName'+' from product',function(error,results,fields){

      webix.message(JSON.stringify(results));
      suggests=["test"];
      console.log(suggests);
    })
  }}},
  {view:"text",label:"图片"},
  {view:"textarea",label:"描述"},
  {view:"toolbar",elements:[{view:"button",label:"添加",type:"icon",icon:"plus"},{view:"button",label:"删除",type:"icon",icon:"minus"},{view:"button",label:"查询",type:"icon",icon:"search"},{view:"button",label:"刷新",type:"icon",icon:"refresh"}]}
  ];


webix.ui({
  //container:"productDetail",
  cols:[

    {view:"form",elements:leftArea,maxWidth:"300"},
  {rows:[
      { view:"template",
        type:"header", template:"产品信息" },
      { view:"datatable",
        autoConfig:true,
        data:results,
        editable:true,
        gravity:0.5
      }
  ]}
  ]
});

/*
  console.log(fields);
  console.log(results);
  var nodes=[];
  var edges=[];
  var index=0;
  results.forEach(function (result) {
      var productName=result['productName'];
      var brand=result['brand'];
      var productType=result['productType'];
      var specification=result['specification'];

      console.log(result['productName']+'  '+result['brand']);
      nodes.push({id:index,label:productName});
      index++;
      nodes.push({id:index,label:brand});
      index++;
      nodes.push({id:index,label:productType});
      index++;
      nodes.push({id:index,label:specification});
      index++;

  })
  console.log(nodes.length);
  for(var i=0;i<nodes.length;i++){
    console.log(i+'%4='+parseInt(i%4));
    console.log(i+'/4='+parseInt(i/4));

    if (parseInt(i%4)===0) {

      if (i/4<nodes.length/4) {
        edges.push({from:parseInt(i/4)*4,to:parseInt(i/4+1)*4});
      }

    }else {

      edges.push({from:parseInt(i/4)*4,to:i,arrows:'to'})
    }

  }
  var container = document.getElementById('productDetail');
  var data = {
    nodes: nodes,
    edges: edges
  };
  var options = {};
  var network = new vis.Network(container, data, options);*/
});
//connection.end();


// create a network
