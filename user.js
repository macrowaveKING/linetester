
const mysql = require('mysql');
class UserMgr{
  constructor(){
    this.leftSideBar = undefined;
    this.rightSideBar = undefined;
    this.user = undefined;
    this.userToolBar = undefined;
    this.addUserBtn = undefined;
    this.deleteUserBtn = undefined;
    this.refreshUserBtn = undefined;
    this.detailUser=undefined;
    this.connection=undefined;
    this.userCart=undefined;
    this.oldFormat=undefined;
  }

  init(){
    this.initConnection();
    this.initComponent();
    this.attachEvents();
  }
  attachEvents(){

    //增加用户按钮按下
    $$("addUser").attachEvent("onItemClick",()=>{
      var user=$$("user").getValues();
      delete user["userId"];
      console.log(user);
      user=JSON.parse(JSON.stringify(user));
      console.log(user);

      this.connection.query("insert into users set ?",user,function (error,result,fields) {
        if (error) {
          throw error;
        }
        user["userId"]=result["insertId"];
        $$("detailUser").add(user);
        webix.message("添加用户成功");
      })
    })

    //列表相关事件
    $$("userCart").attachEvent("onAfterAdd",(id,index)=>{
      console.log(id+" and "+index);
    })
    $$("userCart").attachEvent("onItemClick",(id,evt,node)=>{
      var user=$$("userCart").getItem(id);
      $$("user").parse(user);
    })

    //删除用户按钮按下
    $$("deleteUser").attachEvent("onItemClick",()=>{
      var userId=$$("user").getValues().userId;

      this.connection.query("delete from users where userId=?",userId,(error,results,fields)=>{
        if (error) {
          throw error;
        }
        $$("userCart").remove(userId);
        $$("user").parse([]);
      })
    })
    //更新按钮按下
    $$("refreshUser").attachEvent("onItemClick",()=>{
      this.changeFormat();
      var queryStatement="update users set userName=:userName,phone=:phone,company=:company,email=:email,position=:position,fix=:fix,chinese=:chinese where userId=:userId";

      var user=$$("user").getValues();
      this.connection.query(queryStatement,user,(error,results,fields)=>{
        if (error) {
          this.restoreFormat();
          throw error;
        }
      })
      $$("userCart").remove(user.userId);
      $$("detailUser").parse(user);
      $$("user").parse([]);

      this.restoreFormat();

    })

    $$("searchUser").attachEvent("onItemClick",()=>{
      var user=$$("user").getValues();

      var keys=[];
      var condition="";
      delete user["userId"];
      delete user["id"];
      user=JSON.parse(JSON.stringify(user));
      for(var key in user){

        if(user[key]!=null&&user[key]!=""&&user[key]!=undefined){
          condition+=key+"=:"+key+" and ";
        }
      }
      condition=condition.replace(/ and $/,"");
      console.log("condition is :"+condition);
      var queryStatement="select * from users where  "+condition;
      console.log(queryStatement);
      this.changeFormat();
      this.connection.query(queryStatement,user,(error,results,fields)=>{
        if (error) {
          this.restoreFormat();
          throw error;
        }
        this.restoreFormat();
        $$("detailUser").clearAll();
        $$("detailUser").parse(results);
      })
    })

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
  initComponent(){
    this.user={view:"property",elements:[
      {view:"template",template:"#userId#",label:"用户ID",id:"userId"},
      {id:"userName",type:"text",label:"用户名"},
      {type:"text",label:"E-mail",id:"email"},
      {id:"company",label:"公司",type:"text"},
      {type:"text",id:"phone",label:"手机"},
      {type:"text",id:"fix",label:"固定电话"},
      {id:"position",type:"text",label:"职位"},
      {id:"chinese",type:"text",label:"姓名"}],id:"user"};
    this.userCart={view:"list",maxHeight:150,template:"#userId#   #chinese# #userName#  #company#",drag:true,id:"userCart",externalData:(data,id)=>{

      delete data["password"];
      $$("user").parse(data);
      data.id=data["userId"];
      return data;
    }};
    this.userToolbar={
      id:"userToolbar",
      view:"toolbar",
      elements:[
        {id:"addUser",view:"button",type:"icon",icon:"plus",label:"添加"},
        {id:"deleteUser",view:"button",type:"icon",icon:"minus",label:"删除"},
        {id:"refreshUser",view:"button",type:"icon",icon:"refresh",label:"更新"},
        {id:"searchUser",view:"button",type:"icon",icon:"search",label:"搜索"}]};
    this.detailUser={rows:[{view:"template",template:"用户列表",type:"header"},{view:"datatable",autoConfig:true,drag:true,id:"detailUser"}]}

    this.leftSideBar={rows:[this.user,this.userCart,this.userToolbar],maxWidth:300};
    this.connection.query("select * from users",(error,results,fields)=>{
      console.log(results);
      $$("detailUser").parse(results);
    })

    webix.ui({
      cols:[this.leftSideBar,this.detailUser]
    })
  }

  initConnection(){
    global.initConnection();
    this.connection=global.getConnection();
    this.connection.connect();
  }


}

  webix.ready(function(){
    var user=new UserMgr();
    user.init();
  })
  window.onbeforeunload=function() {
    var connection=global.getConnection();
    connection.end();
  }
