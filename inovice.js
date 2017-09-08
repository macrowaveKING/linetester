
const jquery = require('jquery');
const xmldom = require('xmldom');
var DOMParser=xmldom.DOMParser;
var XMLSerializer = xmldom.XMLSerializer
var addon = require('./build/Release/hello.node');
function formatXml(xml) {
    var formatted = '';
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;
    jquery.each(xml.split('\r\n'), function(index, node) {
        var indent = 0;
        if (node.match( /.+<\/\w[^>]*>$/ )) {
            indent = 0;
        } else if (node.match( /^<\/\w/ )) {
            if (pad != 0) {
                pad -= 1;
            }
        } else if (node.match( /^<\w([^>]*[^\/])?>.*$/ )) {
            indent = 1;
        } else {
            indent = 0;
        }

        var padding = '';
        for (var i = 0; i < pad; i++) {
            padding += '  ';
        }

        formatted += padding + node + '\r\n';
        pad += indent;
    });

    return formatted;
}

function composeTextNode(doc,tagName,text){
  let node=doc.createElement(tagName);
  let textNode=doc.createTextNode(text);
  node.appendChild(textNode);
  return node;
}
function composeCommonNode(doc,businessName,comment){
  var business=doc.createElement('business');
  business.setAttribute('comment',comment);
  business.setAttribute('id',businessName);
  let body=doc.createElement('body');
  body.setAttribute('yylxdm','1');
  var input=doc.createElement('input');
  body.appendChild(input);
  business.appendChild(body);
  doc.appendChild(business);
  return business;

}
function queryDiskInfo(diskPassword){
  var doc=new DOMParser().parseFromString('<?xml version="1.0" encoding="gbk" ?>');

  var business=composeCommonNode(doc,"SKPXXCX","税控盘信息查询")
  var input=doc.getElementsByTagName('input')[0];
  var skpxxcx=composeTextNode(doc,'skpxxcx',regInfo);
  input.appendChild(skpxxcx);
  return doc;
}
function registryIntroduce(regInfo){//regInfo 注册码信息
  var doc=new DOMParser().parseFromString('<?xml version="1.0" encoding="gbk" ?>');

  var business=composeCommonNode(doc,"ZCMDR","注册码导入")
  var input=doc.getElementsByTagName('input')[0];
  var zcmxx=composeTextNode(doc,'zcmxx',regInfo);
  input.appendChild(zcmxx)
  return doc;
}
function inovice(){
  var doc=new DOMParser().parseFromString('<?xml version="1.0" encoding="gbk" ?>');

  var business=composeCommonNode(doc,"FPKJ","发票开具")
  var input=doc.getElementsByTagName('input')[0]
  console.log(doc.getElementsByTagName('input'));
  var skpbh=composeTextNode(doc,'skpbh','税控盘编号')
  input.appendChild(skpbh);

  var skpkl=composeTextNode(doc,'skpkl','税控盘口令')
  input.appendChild(skpkl)


  var keypwd=composeTextNode(doc,'keypwd','数字证书密码')
  input.appendChild(keypwd)

  var fplxdm=composeTextNode(doc,'fplxdm','发票类型代码')
  input.appendChild(fplxdm)


  var kplx=composeTextNode(doc,'kplx','开票类型')
  input.appendChild(kplx)

  var tspz=composeTextNode(doc,'tspz','特殊票种标识')
  input.appendChild(tspz)

  var xhdwsbh=composeTextNode(doc,'xhdwsbh','销货单位识别号')
  input.appendChild(xhdwsbh)

  var xhdwmc=composeTextNode(doc,'xhdwmc','销货单位名称')
  input.appendChild(xhdwmc)

  var xhdwdzdh=composeTextNode(doc,'xhdwdzdh','销货单位地址电话')
  input.appendChild(xhdwdzdh)

  var xhdwyhzh=composeTextNode(doc,'xhdwyhzh','销货单位银行帐号')
  input.appendChild(xhdwyhzh)

  var ghdwsbh=composeTextNode(doc,'ghdwsbh','购货单位识别号')
  input.appendChild(ghdwsbh)


  var ghdwmc=composeTextNode(doc,'ghdwmc','购货单位名称')
  input.appendChild(ghdwmc)

  var ghdwdzdh=composeTextNode(doc,'ghdwdzdh','购货单位地址电话')
  input.appendChild(ghdwdzdh)

  var ghdwyhzh=composeTextNode(doc,'ghdwyhzh','购货单位银行帐号')
  input.appendChild(ghdwyhzh)

  var bmbbbh=composeTextNode(doc,'bmbbbh','编码表版本号')
  input.appendChild(bmbbbh)


  var hsslbs=composeTextNode(doc,'hsslbs','含税税率标识')
  input.appendChild(hsslbs)


  var fyxm=doc.createElement('fyxm')//
  fyxm.setAttribute('count','1')
  var group=doc.createElement('group')//
  group.setAttribute('xh','1')

  var fphxz=composeTextNode(doc,'fphxz','发票行性质')
  group.appendChild(fphxz)

  var spmc=composeTextNode(doc,'spmc','商品名称')
  group.appendChild(spmc)

  var spsm=composeTextNode(doc,'spsm','商品税目')
  group.appendChild(spsm)

  var ggxh=composeTextNode(doc,'ggxh','规格型号')
  group.appendChild(ggxh)

  var dw=composeTextNode(doc,'dw','单位')
  group.appendChild(dw)

  var spsl=composeTextNode(doc,'spsl','商品数量')
  group.appendChild(spsl)

  var dj=composeTextNode(doc,'dj','单价')
  group.appendChild(dj)

  var je=composeTextNode(doc,'je','金额')
  group.appendChild(je)

  var kcje=composeTextNode(doc,'kcje','扣除金额')
  group.appendChild(kcje)

  var sl=composeTextNode(doc,'sl','税率')
  group.appendChild(sl)

  var se=composeTextNode(doc,'se','税额')
  group.appendChild(se)

  var hsbz=composeTextNode(doc,'hsbz','含税标志')
  group.appendChild(hsbz)

  var spbm=composeTextNode(doc,'spbm','商品编码')
  group.appendChild(spbm)

  var zxbm=composeTextNode(doc,'zxbm','纳税人自行编码')
  group.appendChild(zxbm)

  var yhzcbs=composeTextNode(doc,'yhzcbs','优惠政策标识')
  group.appendChild(yhzcbs)

  var slbs=composeTextNode(doc,'slbs','0税率标识')
  group.appendChild(slbs)

  var zzstsgl=composeTextNode(doc,'zzstsgl','增值税特殊管理')
  group.appendChild(zzstsgl)
  fyxm.appendChild(group)
  input.appendChild(fyxm)

  var zhsl=composeTextNode(doc,'zhsl','')

  input.appendChild(zhsl)

  var hjje=composeTextNode(doc,'hjje','合计金额')
  input.appendChild(hjje)

  var hjse=composeTextNode(doc,'hjse','合计税额')
  input.appendChild(hjse)

  var jshj=composeTextNode(doc,'jshj','价税合计')
  input.appendChild(jshj)

  var bz=composeTextNode(doc,'bz','备注')
  input.appendChild(bz)

  var skr=composeTextNode(doc,'skr','收款人')
  input.appendChild(skr)

  var fhr=composeTextNode(doc,'fhr','复核人')
  input.appendChild(fhr)

  var kpr=composeTextNode(doc,'kpr','开票人')
  input.appendChild(kpr)

  var jmbbh=composeTextNode(doc,'jmbbh','加密版本号')
  input.appendChild(jmbbh)

  var zyspmc=composeTextNode(doc,'zyspmc','主要商品名称')
  input.appendChild(zyspmc)

  var spsm=composeTextNode(doc,'spsm','商品税目')
  input.appendChild(spsm)

  var qdbz=composeTextNode(doc,'qdbz','清单标志')
  input.appendChild(qdbz)

  var ssyf=composeTextNode(doc,'ssyf','所属月份')
  input.appendChild(ssyf)

  var kpjh=composeTextNode(doc,'kpjh','开票机号')
  input.appendChild(kpjh)

  var tzdbh=composeTextNode(doc,'tzdbh','通知单编号')
  input.appendChild(tzdbh)

  var yfpdm=composeTextNode(doc,'yfpdm','原发票代码')
  input.appendChild(yfpdm)

  var yfphm=composeTextNode(doc,'yfphm','原发票号码')
  input.appendChild(yfphm)

  var gmcs=composeTextNode(doc,'gmcs','签名参数')
  input.appendChild(gmcs)


  var request = new XMLSerializer().serializeToString(doc);
  console.log(request);
  request=formatXml(request)
  //document.getElementById('xmlloader').innerHTML=request
  $$("xmlloader").define({value:"<xmp>"+request+"</xmp>"})
  $$("xmlloader").refresh()
  return doc;
}




console.log(addon.hello());
const edge = require('edge');
webix.ui({
  view:"form",
  elements:[{
    view:"text",
    label:"dll名称",
    id:"dllId"
  },{
    view:"text",
    label:"函数名称",
    id:"functionId"
  },{
    view:"text",
    label:"税控口令",
    id:"password"
  },{
    view:"button",
    label:"获取信息",
    id:"getInfoBtn"

  },{
    view:"richtext",
    id:"xmlloader",
    height:600,
    label:"XML文档"
  }]
})
$$("getInfoBtn").attachEvent("onItemClick",()=>{
  dllName=$$("dllId").getValue();
  functionName=$$("functionId").getValue();
  passwordText=$$("password").getValue();


  inovice();




})
