const mysql = require('mysql');
const {ipcRenderer} = require('electron');
webix.i18n.parseFormat = "%Y-%m-%d";
webix.i18n.setLocale("zh-CN");

webix.GroupMethods.shortdate = function(prop, data){
  console.log(prop(data[0]));
  var day=prop(data[0]);
  return day.getFullYear()+"-"+(day.getMonth()+1);
};
class StockMgr{
  constructor(){
    this.connection=undefined;
    this.oldFormat=undefined;
    this.countPerPage=10;
    this.current=0;
    this.total=0;
    this.paymentOptions=["现金已结","未付款","支付宝已结","网银已结"];
  }
  init(){
    this.initConnection();
    this.initComponent();
    this.attachEvents();
  }
  initConnection(){
    global.initConnection();
    this.connection=global.getConnection();
    this.connection.connect();


  }




  initComponent(){

    webix.ui({
      id:"reporter",
      view:"window",
      modal:true,
      move:true,
      head:{
        view:"toolbar", cols:[
        {view:"label", label: "报表" },
        {},
        { view:"icon", type:"icon",icon:"close", click:"$$('reporter').hide();"}
      ]},

      position:"center",
      close:true,
      height:500,
      width:600,

      scroll:true,
      body:{
        rows:[{
          labelOffset:150,
          id:"reporter-bar",
          ariaLabel:"产品销售情况汇总",

          view:"chart",
          type:"bar",
          value:"#total#",
          label:"#total#",

          xAxis:{
            template:"#purchaseDate#",
            title:"日期"
          },
          yAxis:{
            //template:"总额"
            title:"profit"
          },
          /*
          scheme:{
            $group:{
              by:"productName",
              map:[{
                quantity:["quantity","sum"],
                productName:["productName","any"]
              }]
            }
          },*/

          barWidth:35,
          radius:0,
          gradient:"falling"
        }
        ]
      }
    })

    var userEditor={
      view:"toolbar",
      hidden:true,
      animate:{type:"flip", subtype:"vertical",direction:"top"},
      elements:[
        {view:"icon",icon:"plus"}
      ],
      id:"userEditor"
    }

    webix.ui({
      view:"popup",
      id:"productShowing",
      maxHeight:450,
      height:400,
      width:300,
      body:{
        rows:[
          {view:"form",margin:1,maxHeight:300,scroll:true,
            elements:[
              {view:"search",label:"产品ID",name:"productId",maxHeight:5,readonly:true,borderless:true,icon:"key"},
              {view:"text",label:"产品名称",name:"productName",required:true},
              {view:"text",label:"品牌",name:"brand",required:true},
              {view:"text",label:"型号",name:"productType",required:true},
              {view:"text",label:"规格",name:"specification",required:true},
              {view:"text",label:"单位",name:"unit",required:true},
              {view:"text",label:"图片",name:"picture"},
              {view:"text",label:"描述",id:"description"}],id:"product"}
        ]
      }
    })

    webix.ui({
      view:"popup",
      id:"userShowing",
      maxHeight:50,
      width:400,
      body:{view:"form",id:"operator",elements:[{margin:10,cols:[
        {view:"button",label:"现金已结",width:80},
        {view:"button",label:"支付宝支付",width:80},
        {view:"button",label:"网银支付",width:80},
        {view:"button",label:"未付款",width:80}
      ]}]}
    })

    webix.ui({
      view:"popup",
      id:"auxilary",
      height:350,
      width:300,
      header:"详情",
      position:"center",
      autoFit:true,
      body:{view:"property",
        elements:[
          {type:"text",label:"产品ID",id:"productId"},
          {type:"text",label:"产品名称",id:"productName"},
          {type:"text",label:"供应商",id:"userName"},
          {type:"text",label:"E-mail",id:"email"},
          {type:"text",label:"移动电话",id:"phone"},
          {type:"text",label:"图片",id:"picture"},{type:"text",label:"描述",id:"description"},{id:"payStatus",type:"select",label:"结算状态",options:["现金已结","未付款","支付宝已结","网银已结"]}],id:"detail"}
    })



    var user={hidden:true,rows:[

      {view:"form",editable:false,margin:15,
    elements:[
      {view:"text",label:"用户ID",name:"userId",disable:false},
      {view:"text",label:"姓名",name:"chinese",required:true,attributes:{placeholder:"姓名必须填写"}},
      {view:"text",type:"text",label:"电话",name:"phone"},
      {view:"text",type:"text",label:"固定电话",name:"fix"},
      {view:"text",type:"text",label:"E-mail",name:"email"},
      {view:"text",type:"text",label:"公司",name:"company"},
      {view:"text",type:"text",label:"职位",name:"position"}],id:"user"},
      userEditor,
      {view:"template",type:"header",template:"供应商缩影",id:"userAbbrev"}

      ,{view:"toolbar",elements:[]}],maxWidth:220};
      var userAndProductView={
        view:"tabview",
        id:"userAndProductView",
        multiview:true,
        animate:{type:"flip",subtype:"vertical"},

        cells:[
          {
            view:"list",
            id:"productResults",
            select:true,
            template:"#productId# #productName# #productType# #specification# #brand#",

            header:"产品详情",

          },
          {

            header:"用户详情",
            view:"list",
            select:"row",
            template:"#userId#  #userName#",
            id:"userResults",
            //maxHeight:200,

          }
        ]
      }

    var product={rows:[{rows:[{view:"template",hidden:true,template:"产品缩影",type:"header",id:"abbrev"}]},
    userAndProductView,
        {view:"toolbar",
        elements:[
          {rows:[
            {
              cols:[
                {view:"button",label:"进购",icon:"shopping-cart",type:"icon",id:"purchaseBtn"},
                {view:"label",label:"小计：0.0000 元",id:"total"}
              ]},
              {view:"search",id:"searchProduct",label:"搜索产品",placeholder:"输入产品信息搜索产品"},
              {view:"search",id:"searchUser",label:"搜索用户",icon:"search",placeholder:"输入信息搜索用户"},
              {view:"search",label:"收据单号",id:"groupNo",icon:"barcode",placeholder:"请填写收据单号"},
              {view:"counter",label:"数量",inputWidth:250,id:"quantity", validate:webix.rules.isNumber,required:true},
              {view:"counter",label:"单价(元)",inputWidth:250,id:"price", validate:webix.rules.isNumber,required:true},
              {view:"datepicker",label:"日期",value:new Date(),format:"%Y-%m-%d",id:"purchaseDate",required:true,validate:webix.rules.isNotEmpty},
              {view:"select",value:"现金已结",label:"结算状态",options:this.paymentOptions,id:"payStatus",required:true}
            ]
          }
        ],
        id:"stockFields"}
      ],
      maxWidth:300
    };




    var tools={view:"toolbar",maxHeight:100,cols:[{maxWidth:100,rows:[

      {view:"button",icon:"trash-o",label:"清空",type:"icon",id:"clearBtn",tooltip:"清空表格不影响后台"},
      {view:"button",type:"icon",label:"报表",id:"deleteBtn",tooltip:"删除条目不影响后台",icon:"bar-chart-o"},
      {view:"button",icon:"eraser",label:"减库存",type:"icon",id:"eraserBtn",tooltip:"删除条目影响后台"},
      {}]},{view:"spacer",borderless:false,width:1},
      {maxWidth:100,rows:[{view:"button",icon:"users",label:"用户管理",type:"icon",id:"userMgr"},{view:"button",icon:"gift",label:"产品管理",type:"icon",id:"productMgr"} ,
      {view:"button",icon:"money",label:"销售管理",type:"icon",id:"saleMgr"},{}]},
      {rows:[
        {view:"datepicker",label:"开始日期",id:"beginDay",validate:webix.rules.isNotEmpty,placeholder:"搜索开始日期"},
        {view:"datepicker",label:"结束日期",id:"endDay",validate:webix.rules.isNotEmpty,placeholder:"搜索结束日期"},
        {view:"combo",label:"供应商",id:"supplier",icon:"user",placeholder:"搜索供应商",
        suggest:{
          body:{
      			view:"list",
            template:"#chinese#",
            id:"suppliers"
      		},
        }}]},
      {rows:[{view:"combo",placeholder:"搜索结算状态",icon:"cc",label:"支付状态",id:"payStat",options:this.paymentOptions},{view:"search",label:"产品名称",id:"productNameInSearch",icon:"gift",placeholder:"搜索产品信息"},
      {view:"combo",placeholder:"搜索公司",label:"公司",id:"companyInSearch",icon:"building",options:{
        body:{
          template:"#company#",
          data:[]
        }
      }}]},
      {rows:[{view:"search",icon:"barcode",label:"收据单号",id:"groupNoInsearch",placeholder:"搜索单据号"}]}]}




    var Stock={rows:[
      {view:"toolbar",cols:[{view:"template",template:"供应商详情",type:"header",id:"detailHeader",borderless:true}]},
      {
        view:"datatable",
        onContext:{},
        math:true,
        tooltip:true,select:"row",
        autoConfig:true,
        id:"detailStock",
        editable:true,
        onContext:{},
      on:{
        "data->onStoreUpdated":function() {
          this.data.each(function(obj,i) {
            obj.index=i+1;
            //return obj;
          })
        }
      },
      columns:[
        {id:"index",adjust:true,header:"序号",sort:"int",tooltip:"双击显示详情"},
        { id:"productType",header:"型号",adjust:true},
        { id:"specification",header:"规格",width:180,adjust:true},
        { id:"groupNo",header:"收据单号",adjust:true},
        { id:"quantity",header:"数量",width:80},
        {id:"unit",header:"单位",width:60},
        { id:"price",header:"单价(元)",width:80},
        { id:"brand",header:"品牌",width:80},
        { id:"chinese",header:"姓名",width:80},
        { id:"purchaseDate",header:"日期",editor:"date",format:webix.Date.dateToStr("%Y-%m-%d"),footer:"总计(元):"},
        {header:"小计(元)",math:"[$r,quantity]*[$r,price]",footer:{content:"summColumn"},name:"total",id:"total"}

      ],footer:true},{view:"button",label:"加载更多",id:"more",hidden:true},tools]};

    /*
    var tabview={
      id:"tabview",
      view:"tabview",
      tabbar:{
        hidden:true
      },
      cells:[
        {
          id:"stockPage",
          header:"进货",
          body:Stock
        },{
          id:"userPage"
        },{
          id:"productPage"
        }
      ]
    }*/


    webix.ui({
      cols:[user,Stock,product]
    });


    webix.ui({
      view:"contextmenu",
      id:"paymentMenu",
      master:$$("detailStock"),
      data:this.paymentOptions,
      on:{
        onItemClick:function(id){
          var context = this.getContext();
          var list = context.obj;
          var listId = context.id;
          var stockId=list.getItem(listId).stockId;
          var oldPayment=list.getItem(listId).payStatus;
          if(id===oldPayment){
            return;
          }
          if (id==="现金已结") {

          }else if (id==="未付款") {

          }else if (id==="支付宝已结") {

          }else if (id==="网银已结") {

          }else {
            return;
          }



          global.getConnection().query("update stock set payStatus=? where stockId=?",[id,stockId],(error,results,fields)=>{
            if (error) {
              throw error;
            }
            webix.message("结算状态从 "+oldPayment+" 到 "+id);
          })
        }
      }
    })


  }

//绑定事件


  attachEvents(){


    $$("reporter-bar").attachEvent("onItemClick",(id,evt,node)=>{
      var record=$$("reporter-bar").getItem(id);
      console.log(record.groupCapacity);
    })
    $$("deleteBtn").attachEvent("onItemClick",()=>{
      var source=$$("detailStock").serialize();
      if (source.length<=0) {
        return;
      }
      console.log(source);
      $$("reporter-bar").clearAll()
      $$("reporter-bar").parse(source)
      //console.log($$("detailStock").data);
      /*
      $$("reporter-bar").define({
        value:"#quantity#",
        //label:"#productType#",
        xAxis:{
          template:"#productType#"
        },
        yAxis:{
          //template:"总额"
        }
      })*/

      $$("reporter-bar").refresh();
      $$("reporter-bar").group({
        by:(obj)=>{
          var day=obj.purchaseDate;
          return day.getFullYear()+""+day.getMonth();
        },
        map:{
          total:["total","sum"],
          productType:["productType","any"],
          groupCapacity:["productType","count"],
          purchaseDate:["purchaseDate","shortdate"]
        }
      });
      $$("reporter").show();

    })
    $$("more").attachEvent("onItemClick",()=>{
      this.updateStocks();
      $$("detailStock").showItemByIndex(this.current)
    })
    $$("clearBtn").attachEvent("onItemClick",()=>{
      this.current=0;
      this.clearCount();
      $$("detailStock").clearAll();
    })

    $$("beginDay").attachEvent("onChange",()=>{
      this.clearCount();
      this.current=0;
      $$("detailStock").clearAll();
      this.updateStocks();
    })

    $$("groupNoInsearch").attachEvent("onChange",()=>{
      this.clearCount();
      this.current=0;
      $$("detailStock").clearAll();
      this.updateStocks();
    })

    $$("endDay").attachEvent("onChange",()=>{
      this.clearCount();
      this.current=0;
      $$("detailStock").clearAll();
      this.updateStocks();
    })
    $$("payStat").attachEvent("onChange",()=>{
      this.clearCount();
      this.current=0;
      $$("detailStock").clearAll();
      this.updateStocks();
    })
    $$("supplier").attachEvent("onChange",()=>{
      this.clearCount();
      this.current=0;
      $$("detailStock").clearAll();
      this.updateStocks();

    })
    $$("supplier").attachEvent("onKeyPress",()=>{

      var content=$$("supplier").getText().trim();
      if(content==undefined||content==""){
        $$("suppliers").clearAll();
        return;
      }
      //var content=newContent;
      //console.log(content);

      this.connection.query("select chinese from users where chinese like ?","%"+content+"%",(error,results,fields)=>{
        if (error) {
          throw error;
        }
        //$$("tipMe").master=$$("supplier")
        $$("suppliers").clearAll();
        $$("suppliers").parse(results)
        console.log(results);
      })

    })


    $$("companyInSearch").attachEvent("onChange",()=>{
      this.clearCount();
      this.current=0;
      $$("detailStock").clearAll();
      this.updateStocks();
    })
    $$("companyInSearch").attachEvent("onKeyPress",()=>{
      console.log($$("companyInSearch").getPopup());
      var list=$$("companyInSearch").getPopup().getList();

      var content=$$("companyInSearch").getText().trim();
      if(content==undefined||content==""){
        list.clearAll();
        return;
      }
      content="%"+content+"%"
      this.connection.query("select distinct company from users where company like ?",content,(error,results,fields)=>{
        console.log(results);
        if (error) {

          throw error;
        }
        list.clearAll();
        list.parse(results);
      })

    })
    $$("productNameInSearch").attachEvent("onChange",()=>{
      this.clearCount();
      this.current=0;
      $$("detailStock").clearAll();
      this.updateStocks();
    })


    $$("userMgr").attachEvent("onItemClick",()=>{


      ipcRenderer.on('asynchronous-reply', (event, arg) => {
        console.log(arg) // prints "pong"
      })
      ipcRenderer.send('asynchronous-message', 'user')
    })

    $$("saleMgr").attachEvent("onItemClick",()=>{


      ipcRenderer.on('asynchronous-reply', (event, arg) => {
        console.log(arg) // prints "pong"
      })
      ipcRenderer.send('asynchronous-message', 'sale')
    })

    $$("productMgr").attachEvent("onItemClick",()=>{


      ipcRenderer.on('asynchronous-reply', (event, arg) => {
        console.log(arg) // prints "pong"
      })
      ipcRenderer.send('asynchronous-message', 'product')
    })

    $$("eraserBtn").attachEvent("onItemClick",()=>{

      //beginTransaction begin
      var stock=$$("detailStock").getSelectedItem()
      if (stock==undefined||stock==null) {
        return;
      }
      this.connection.beginTransaction((error)=>{
        if(error){
          return this.connection.rollback((error)=>{
            throw error;
          })
        }
        //delete query begin
        this.connection.query("delete from stock where stockId=?",stock.stockId,(error,results,fields)=>{
          if(error){
            return this.connection.rollback((error)=>{
              throw error;
            })
          }
          this.connection.query("update storage set quantity=quantity-?,lastUpdate=? where productId=?",[stock.quantity,new Date(),stock.productId],(error,results,fields)=>{
            if (error) {
              return this.connection.rollback((error)=>{
                throw error;
              })
            }
            this.connection.commit((error)=>{
              if (error) {
                return this.connection.rollback((error)=>{
                  if (error) {
                    throw error;
                  }
                })
              }
              webix.message("成功添加进货条目")
              $$("detailStock").remove(stock.id);
            })
          })


        })
        //delete query end

      })
      //beginTransaction end;

    });


    $$("searchUser").attachEvent("onKeyPress",()=>{
      if($$("userResults").count()>0){
        var id=$$("userResults").getFirstId();
        $$("userResults").select(id)
        //webix.message("select first id: "+id+" in user")
      }

      var userName=$$("searchUser").getValue();
      if (userName==""||userName==undefined) {
        return;
      }
      console.log(userName);
      this.connection.query("select * from users where userName like ?","%"+userName+"%",(error,results,fields)=>{
        if (error) {
          throw error;
        }
        console.log(results);
        console.log("retrive data form database!");
        var records=results;
        for(var index in records){
          console.log(index);
          results[index].id=results[index].userId;

          console.log("data has been loaded!");
          console.log(records);
        }
        records=JSON.parse(JSON.stringify(records));
        $$("userResults").clearAll();
        $$("userResults").parse(records);
        $$("userAbbrev").define({template:"供应商缩影("+results.length+")"});
        $$("userAbbrev").refresh();
      })
    });


    $$("userResults").attachEvent("onItemClick",(id,evt,node)=>{
      var user=$$("userResults").getItem(id);
      //delete user["id"];
      delete user["value"];
      delete user["password"];

      $$("user").parse(user);
      $$("user").refresh()
    })

    $$("searchUser").attachEvent("onFocus",()=>{

      $$("userAndProductView").setValue("userResults");
      //$$("userAndProductView").refresh()
    })
    $$("searchProduct").attachEvent("onFocus",()=>{
      $$("userAndProductView").setValue("productResults");
      console.log("called in page for product");
      //$$("userAndProductView").refresh()
    })
    $$("searchProduct").attachEvent("onChange",()=>{
      if($$("productResults").count()>0){
        $$("productResults").select($$("productResults").getFirstId())
      }
      var product=$$("searchProduct").getValue();
      if (product==""||product==undefined) {
        return;
      }
      product=product.replace(/^|\b|\u0020|$/g,"");



      console.log(product);
      this.connection.query("select * from product where match(productName,productType,specification,description,brand) against(? in natural language mode)",product,(error,results,fields)=>{
        if (error) {
          throw error;
        }
        //results.id=results.productId;
        $$("productResults").clearAll();
        $$("productResults").parse(results);
        $$("abbrev").define({template:"产品缩影("+results.length+")"});
        $$("abbrev").refresh();
        console.log(results);
      })
    });
    $$("productResults").attachEvent("onItemClick",(id,evt,node)=>{
      var product=$$("productResults").getItem(id);
      //delete product["id"];
      $$("product").parse(product);
    })

    $$("price").attachEvent("onChange",()=>{
      var price=$$("price").getValue();
      var quantity=$$("quantity").getValue();
      $$("total").setValue("小计："+price*quantity+" 元");
    })

    $$("quantity").attachEvent("onChange",()=>{
      var price=$$("price").getValue();
      var quantity=$$("quantity").getValue();
      $$("total").setValue("小计："+price*quantity+" 元");
    })

    $$("productResults").attachEvent("onItemClick",(id,evt,node)=>{
      var product=$$("productResults").getItem(id);
      $$("product").parse(product);
      $$("productShowing").show(node,{pos:"left"})
    })
    $$("detailStock").attachEvent("onItemDblClick",(id,evt,node)=>{
      var stock=$$("detailStock").getItem(id);

      $$("detail").parse(stock)
      $$("auxilary").show(node,{pos:"Right"})

    })

    $$("purchaseBtn").attachEvent("onItemClick",()=>{

      var purchaseDate=$$("purchaseDate").getValue();
      var price=$$("price").getValue();
      if (!$$("purchaseDate").validate()) {
        webix.message("请输入选择日期")
        return;
      }
      if (!$$("price").validate()) {
        webix.message("请输入数字")
        return;
      }
      if (!$$("quantity").validate()) {
        webix.message("请输入数字")
        return;
      }
      if(!quantity)

      var quantity=$$("quantity").getValue();
      var payStatus=$$("payStatus").getValue();
      var product=$$("productResults").getSelectedItem();
      var user=$$("userResults").getSelectedItem();
      var groupNo=$$("groupNo").getValue();
      if(product===null||product===undefined){
        webix.message({type:"error",text:"请搜索并选择产品"});
        return;
      }
      if(user===undefined||user===null){
        webix.message({type:"error",text:"请搜索并选择供应商"});
        return;
      }
      if (quantity===undefined||quantity<=0||quantity===null) {
        webix.message({type:"error",text:"非法数量"});
        return;
      }
      if (price===undefined||price<=0||price===null) {
        webix.message({type:"error",text:"非法价格"});
        return;
      }
      var stock={};
      var storage={};
      stock.groupNo=groupNo;
      stock.quantity=quantity;
      stock.price=price;
      stock.purchaseDate=purchaseDate;

      stock.productId=product["productId"];
      stock.userId=user["userId"];
      stock.payStatus=payStatus;
      storage.productId=product.productId;
      storage.quantity=quantity;
      storage.lastUpdate=purchaseDate;
      //$$("detailStock").parse(stock);
      delete stock["id"];
      console.log(stock);
      console.log(storage);
      var newStock={};
      this.connection.beginTransaction((error)=>{
        console.log("begin transaction error:"+error);
        if(error){
          return this.connection.rollback((error)=>{
            throw error;
          });
        }
        this.connection.query("insert into stock set ?",stock,(error,results,fields)=>{
          console.log("insert into stock error:"+error);
          if (error) {
            return this.connection.rollback((error)=>{
              if (error) {
                throw error;
              }
            });

          }

          newStock=stock;
          newStock.stockId=results.insertId;
          newStock.id=results.InsertId;
          console.log("stock results:");
          console.log(results);
          this.connection.query("select productId from storage where productId=?",product["productId"],(error,results,fields)=>{

            if(error){
              return this.connection.rollback();
            }

            if (results.length>0) {
              this.changeFormat();
              this.connection.query("update storage set quantity=:quantity+quantity where productId=:productId",storage,(error,results,fields)=>{
                if (error) {
                  this.restoreFormat();
                  return this.connection.rollback(()=>{
                    throw error;
                  })
                }
                this.restoreFormat();
                this.connection.commit((error)=>{
                  console.log("commit in  update storage error:"+error);
                  if (error) {
                    this.connection.rollback(()=>{
                      throw error;
                    })
                  }else{
                    //添加成功的记录到datatable
                    console.log("commit success update");

                    for(var key in user){

                      newStock[key]=user[key];
                    }
                    for (var key in product) {
                      newStock[key]=product[key];
                    }
                    //newStock.index=$$("detailStock").count();
                    delete newStock["id"];
                    $$("detailStock").add(newStock);

                    console.log(newStock);

                  }
                });
              })
            }else {
              this.connection.query("insert into storage set ?",storage,(error,results,fields)=>{
                console.log("query in insert into storage error:"+error);
                if (error) {
                  this.connection.rollback(()=>{
                    throw error;
                  });

                }
                this.connection.commit((error)=>{
                  if (error) {
                    console.log("commit in insert into storage error:"+error);
                    this.connection.rollback(()=>{
                      throw error;
                    })
                  }else{
                    //添加成功的记录到datatable
                    console.log("commit success insert");
                    console.log(user);
                    for(var key in user){
                      console.log(key);
                      newStock[key]=user[key];
                    }
                    for (var key in product) {
                      newStock[key]=product[key];
                    }
                    delete newStock["id"];
                    $$("detailStock").add(newStock);
                    console.log(newStock);

                  }

                })
              })
            }
          });


        });
      })


    })

  }
  clearCount(){
    $$("detailHeader").define({template:"进货详情"});
    $$("detailHeader").refresh();
    $$("more").hide();
  }
  changeFormat(){
    this.oldFormat=this.connection.config.queryFormat;
    this.connection.config.queryFormat = function (query, values) {
      if (!values) return query;
      return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
          return this.escape(values[key]);
        }
        return txt;
      }.bind(this));
    };
  }

  restoreFormat(){
    this.connection.config.queryFormat=this.oldFormat;
  }

  updateStocks(){

    var condition="";
    var beginDay=$$("beginDay").getValue();

    var endDay=$$("endDay").getValue();
    var supplier=$$("supplier").getText();
    var payStatus=$$("payStat").getValue();
    var company=$$("companyInSearch").getText().trim();
    var groupNo=$$("groupNoInsearch").getValue();
    //webix.message("beginDay: "+beginDay);
    //webix.message("endDay: "+endDay)
    var productName=$$("productNameInSearch").getValue()
    var doNothing=!$$("beginDay").validate()||(!$$("endDay").validate())


    if(doNothing){

    }else{
      condition+=" and purchaseDate between :beginDay and :endDay"
    }
    var cond=(company!=undefined&&company!=""&&company!=null);
    doNothing=!doNothing||cond;
    if(cond){
      condition+=" and company=:company"
    }
    var cond=(groupNo!=undefined&&groupNo!=""&&groupNo!=null);
    doNothing=doNothing||cond;
    if(cond){
      condition+=" and groupNo=:groupNo"
    }
    cond=(supplier!=undefined&&supplier!="");
    doNothing=doNothing||cond;
    if(cond){
      condition+=" and chinese=:chinese"
    }
    cond=(payStatus!=undefined&&payStatus!="");
    doNothing=doNothing||cond;

    if (cond){
      condition+=" and payStatus=:payStatus"
    }
    cond=(productName!=undefined&&productName!="");
    doNothing=doNothing||cond;
    if (cond) {
      condition+=" and match(productName,productType,specification,description,brand) against(:productName in boolean mode)"
    }
    if(!doNothing){
      webix.message("没有输入完整信息……")
      return;
    }
    var target={};
    target.productName=productName;
    target.chinese=supplier;
    target.beginDay=beginDay;
    target.endDay=endDay;
    target.payStatus=payStatus;
    target.company=company;
    target.groupNo=groupNo;
    console.log(target);
    var limits=" limit "+this.current+","+this.countPerPage
    var queryStatement='select groupNo,unit,productName,purchaseDate, stockId,quantity,price,userName,email,stock.userId,userName,chinese,brand,stock.productId,specification,productType,payStatus,position,phone,fix,company ';
    var countStatement='select count(*) as total '
    var tables=' from Stock,Users,Product where stock.productId=product.productId and stock.userId=users.userId '
    queryStatement+=tables;
    queryStatement+=condition;
    queryStatement+=limits;
    countStatement+=tables+condition;
    console.log(countStatement);
    this.total=0;
    this.changeFormat();
    this.connection.query(countStatement,target,(error,results,fields)=>{

      if (error) {
        throw error;
      }
      this.total=results[0].total;
      console.log(results);

    })

    console.log(queryStatement);
    //return;
    //

    this.connection.query(queryStatement,target,(error,results,fields)=>{

      console.log(results);
      if (error) {
        throw error;
      }
      this.current+=results.length;
      $$("detailStock").parse(results);
      $$("detailHeader").define({template:"进货详情（"+this.current+"-"+this.total+")"});
      $$("detailHeader").refresh();
      if(this.current<this.total){
        $$("more").show();
      }else{
        $$("more").hide();
      }
    })
    this.restoreFormat();
  }



}
webix.ready(function(){

  var stock=new StockMgr();
  stock.init();


})
window.onbeforeunload=function() {
  var connection=global.getConnection();
  connection.end();
}
