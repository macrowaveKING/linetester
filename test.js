const ctypes = require('ctypes');
var lib = ctypes.open("C:\\WINDOWS\\system32\\user32.dll");

/* Declare the signature of the function we are going to call */
var msgBox = lib.declare("MessageBoxW"/* 函数名称*/,
                         ctypes.winapi_abi,/*ABI类型，有3种，这里指调用系统的接口*/
                         ctypes.int32_t,/*返回值*/
                         ctypes.int32_t,/*告警类型*/
                         ctypes.jschar.ptr,/*告警内容*/
                         ctypes.jschar.ptr,/*标题*/
                         ctypes.int32_t);/*按钮类型*/
var MB_OK = 0;

var ret = msgBox(0, "Hello world", "title", MB_OK);

lib.close();
