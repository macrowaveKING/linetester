const mysql = require('mysql');
const {render}=require('electron')

function ProductMgr() {

}




ProductMgr.prototype.connection = undefined;

//左边栏的各个字段
ProductMgr.prototype.templateField = undefined;
ProductMgr.prototype.productNameField = undefined;
ProductMgr.prototype.productTypeField = undefined;
ProductMgr.prototype.specificationField = undefined;
ProductMgr.prototype.brandField = undefined;
ProductMgr.prototype.unitField = undefined;
ProductMgr.prototype.pictureField = undefined;
ProductMgr.prototype.descriptionField = undefined;
ProductMgr.prototype.toolbarField = undefined;
ProductMgr.prototype.addProductBtn = undefined;
ProductMgr.prototype.deleteProductBtn = undefined;
ProductMgr.prototype.searchProductBtn = undefined;
ProductMgr.prototype.refreshProductBtn = undefined;
ProductMgr.prototype.carts=undefined;
//整个左边栏
ProductMgr.prototype.leftArea = undefined;
ProductMgr.prototype.record = undefined;
//产品详细信息表
ProductMgr.prototype.detailProduct = undefined;

ProductMgr.prototype.refreshButton = undefined;
ProductMgr.prototype.searchButton = undefined;
var infos=[];

ProductMgr.prototype.init = function () {
  this.initConnection();

  this.initComponents();
};
ProductMgr.prototype.composePage = function () {

  //左边栏
  this.initLeftArea();

  //产品信息表格
  this.initDetailProduct();

  //产品管理器

  webix.ui({
    cols:[
      this.leftArea,this.detailProduct
    ]
  })

};
ProductMgr.prototype.initComponents = function () {
  this.composePage();
};
ProductMgr.prototype.initDetailProduct = function () {

  this.detailProduct={rows:[{ view:"template",type:"header",template:"产品信息"},
  {view:"datatable",id:"detailProduct",gravity:3,autoConfig:true,drag:true}]};
  this.connection.query('select * from Product',function (error,results,fields) {
    if(error){
      webix.message({type:"error",text:error});
      throw error;
    }
    $$("detailProduct").parse(results);

  });
  //this.connection.end();
};
ProductMgr.prototype.initLeftArea = function () {
  this.templateField={view:"template",template:"请在此处输入产品信息",maxHeight:"50",borderless:true};
  this.productIdField={id:"productId",label:"产品ID",view:"template",template:"#productId#"};
  this.productNameField={id:"productName",type:"text",label:"产品名称"};
  this.productTypeField={id:"productType",type:"text",label:"型号"};
  this.specificationField={id:"specification",type:"text",label:"规格"};
  this.brandField={id:"brand",type:"text",label:"品牌"};
  this.pictureField={id:"picture",type:"text",label:"图片"};
  this.descriptionField={id:"description",type:"text",label:"描述"};
  this.unitField={id:"unit",type:"text",label:"单位"};
  this.record={
    view:"property",
    elements:[this.productIdField,this.productNameField,this.unitField,this.productTypeField,this.specificationField,this.brandField,this.pictureField,this.descriptionField],id:"product",drag:true
  }
  this.addProductBtn={view:"button",type:"icon",icon:"plus",label:"添加",click:() =>{
    console.log("here is record !");
    var product=$$("product").getValues();
    if (product.productName==""||product.productType==""||product.specification==""||product.brand=="",product.unit=="") {
      webix.message("产品信息不完整，请填写必要的信息");
      return;
    }

    delete product["productId"];
    var r=JSON.stringify(product);
    product=JSON.parse(r);
    console.log(r);

    //product.productId=null;




    this.connection.query('insert into product set ?',product,(error,results,fields)=>{
      if (error) {
        webix.message({type:"error",text:error})
        throw error;
      }
      console.log(results);
      product["productId"]=results["insertId"];
      $$("detailProduct").add(product);

    });
    //this.connection.end();

  }};
  this.carts={id:"carts",view:"list",height:100,on:{
    onItemClick:(id,e,node)=>{

      var rec=$$("carts").getItem(id);
      $$("product").parse(rec);
      console.log(rec);
    }
  },template:"#productId# #productName# #productType# #specification#",data:[

  ],externalData:(data,id)=>{
    console.log(data);
    $$("product").parse(data);
    data.id=data.productId;


    return data;

  },
  drag:true
};
  this.deleteProductBtn={view:"button",type:"icon",icon:"minus",label:"删除",click:()=>{
    var productId=$$("product").getValues()["productId"];
    this.connection.query('delete from product where productId=?',productId,(error,result,fields)=>{
      if (error) {
        webix.message({type:"error",text:error})
        throw error;
      }
      $$("carts").remove(productId);
    });
  }};
  this.refreshProductBtn={view:"button",type:"icon",icon:"refresh",label:"更新",click:()=>{
    var oldFormat=this.connection.config.queryFormat;
    this.connection.config.queryFormat = function (query, values) {
      if (!values) return query;
      return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
          return this.escape(values[key]);
        }
        return txt;
      }.bind(this));
    };


    var product=$$("product").getValues();
    if (product["productId"]==null||product["productId"]==undefined||product["productId"]=="") {
      return;
    }
    //delete product["productId"];
    product=JSON.parse(JSON.stringify(product))
    var queryStatement='update product set unit=:unit, productName=:productName,productType=:productType,specification=:specification,brand=:brand,picture=:picture, description=:description where productId=:productId';
    //console.log(queryStatement);

    var productId=$$("product").getValues()["productId"];
    this.connection.query(queryStatement,product,(error,result,fields)=>{
      if (error) {
        webix.message({type:"error",text:error})
        this.connection.config.queryFormat=oldFormat;
        throw error;
      }
      this.connection.config.queryFormat=oldFormat;
      product=JSON.parse(JSON.stringify(product));
      $$("detailProduct").add(product);
      $$("carts").remove(productId);
      $$("product").parse();
    });
  }};
  this.searchProductBtn={view:"button",type:"icon",icon:"search",label:"查询",click:()=>{
    var values=$$("product").getValues();
    console.log(values);
    var context=values["productName"]+" "+values["productType"]+" "+values["brand"]+" "+values["specification"];
    var queryStatement='select * from product where match(productName,productType,specification,description,brand) against(? in natural language mode)';
    console.log(context);
    console.log(queryStatement);
    this.connection.query(queryStatement,context,(error,results,fields)=>{
      if (error) {
        webix.message({type:"error",text:error})
        throw error;
      }
      $$("detailProduct").clearAll();
      $$("detailProduct").parse(results);
    })
  }};

  this.toolbarField={view:"toolbar",elements:[this.addProductBtn,this.deleteProductBtn,this.refreshProductBtn,this.searchProductBtn]};
  this.leftArea={rows:[
    this.templateField,this.record,this.carts,this.toolbarField
  ],maxWidth:350};


};
ProductMgr.prototype.attachEvents = function () {

};
ProductMgr.prototype.initPeripherals = function () {

};
ProductMgr.prototype.initConnection = function () {
  global.initConnection();
  this.connection=global.getConnection();
  this.connection.connect();

};


webix.ready(function(){

  var product=new ProductMgr();
  product.init();


})
window.onbeforeunload=function() {
  var connection=global.getConnection();
  connection.end();
}
