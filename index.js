console.log("this is message from index.js");
const electron = require('electron').remote
const SerialPort = require('serialport');
// Module to control application life.
//const jsbarcode = require('jsbarcode');
const Menu=electron.Menu
const MenuItem=electron.MenuItem
//const window=electron.window
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var menu = new Menu();
menu.append(new MenuItem({ label: 'MenuItem1', click: function() { console.log('item 1 clicked'); } }));
menu.append(new MenuItem({ type: 'separator' }));
menu.append(new MenuItem({ label: 'MenuItem2', type: 'checkbox', checked: true }));

window.addEventListener('contextmenu', function (e) {
//e.preventDefault();
menu.popup(electron.getCurrentWindow());
}, false);

SerialPort.list(function (error,ports) {
  console.log(ports);
})
