!function(){"use strict";var e=angular.module("confab");e.constant("API_URL","http://localhost:3000"),e.constant("DOWNLOAD_URL","http://localhost:3000/getzip"),e.constant("UPLOAD_URL","http://localhost:8080/Ibis4Education/iaf/api/configurations"),e.constant("IAF_URL","http://localhost:8080/Ibis4Education/api"),e.factory("StaticDataFactory",["xmlTag","$http","StorageFactory","API_URL","IAF_URL","$interval",function(e,t,n,o,r,i){function a(e){O=e}function l(){return O}function s(e){S=e}function c(){i.cancel(S)}function u(){return b}function f(){return A}function g(){return _}function d(e){y=e}function p(){return y}function h(){return t.get(r+"/getjson").then(function(e){return console.info("returning json from server with status ",e.status),L=e.data.JSONMONSTER.MYMONSTER,e},function(e){console.log("server error :",e)})}function m(){return L}function v(e){return console.log("file to catch:",e),t.get(o+"/snippets?resource="+e).then(function(e){return e},function(e){console.log("error loading xml",e)})}var y="pipes",S=0,b=["twilight","monokai","neat"],A=[12,13,14,15,16,17,18,19,20],L=null,O=null,_={indent_size:4,xml:{end_with_newline:!0,js:{indent_size:2},css:{indent_size:2}},css:{indent_size:1},js:{"preserve-newlines":!0}};return{getJson:h,getStaticJson:m,loadXml:v,setDataSource:d,getDataSource:p,getFormattingSettings:g,getThemes:u,getFontSizes:f,setTimerId:s,stopTimer:c,setSelectedItem:a,getSelectedItem:l}}]),e.factory("ZipService",["StorageFactory","$http","DOWNLOAD_URL","UPLOAD_URL",function(e,t,n,o){function r(){return e.getGetter("thejson")()}function i(){return e.getGetter("myslots")()}function a(){return f}function l(t){return new Promise(function(n,o){function r(e){if(void 0===e)return"";var t=e.substring(e.lastIndexOf("/")+1,e.length);return t.length>0?t:e}var i=new JSZip,a=document.querySelectorAll("[ui-tree-node]");a.forEach(function(t){for(var n=angular.element(t).scope(),o=[];null!==n.$parentNodeScope;)o.push(n.$parentNodeScope.$modelValue.title),n=n.$parentNodeScope;for(var a="";o.length>0;)a+=r(o.pop())+"/";if("Configuration.xml"===r(angular.element(t).scope().$modelValue.title)?a="Ibis4Student/Configuration.xml":a+=r(angular.element(t).scope().$modelValue.title),angular.element(t).scope().$modelValue.isDirectory)i.folder(a);else{var l=e.getGetter(angular.element(t).scope().$modelValue.title)();i.file(a,e.getGetter(l)())}});var l=Date.now(),c="configuration.version="+l;i.file("BuildInfo_SC.properties",c),console.log("Zipfile ",i),t?(console.log("saving as a zip file..."),i.generateAsync({type:"blob"}).then(function(e){var t=new Blob([e],{type:"application/zip"});console.log("generated a zip...",t),saveAs(t,"configuration.zip"),n()})):s(i,l).then(function(e){console.log("returning from postconfig"),n(e)},function(e){console.log("returning error from postconfig"),o(e)})})}function s(e,n){return new Promise(function(r,i){if(void 0===o||"string"!=typeof o)return alert("add a correct IAF url"),"error";var a=o;alert(a),e.generateAsync({type:"blob"}).then(function(e){var o="configuration.zip",l=new FormData;l.append("realm","jdbc"),l.append("name","Ibis4Student"),l.append("version",n),l.append("encoding","utf-8"),l.append("multiple_configs",!1),l.append("activate_config",!0),l.append("automatic_reload",!0),l.append("file",e,o),console.log("posting to iaf",e),t({method:"POST",url:a,data:l,headers:{"Content-type":void 0}}).then(function(e){console.info("returning from backend",e),r(e)},function(e){console.info("returning error from backend",e),i(e)})})})}function c(t){return JSZip.loadAsync(t).then(function(t){function n(t){t>r.length-1||(r[t].dir?(t++,n(t)):r[t].async("string").then(function(o){var i="slot"+Math.ceil(1e3*Math.random());e.getSetter(r[t].name)(i),e.getSetter(i)(o),t++,n(t++)}))}function o(e,t){if(e===t)return!1;var n=t.lastIndexOf("/");return t.substring(0,n)===e}console.log("loadasync from file...",t),e.deleteAll();var r=[];t.forEach(function(e,t){"__"!==t.name.substring(0,2)&&r.push(t)}),n(0),console.log("zipfiles",r);var i=[];f={};for(var a=0;a<r.length;a++)if(r[a].dir)i.push({id:Math.ceil(1e4*Math.random()),isDirectory:r[a].dir,title:r[a].name.substring(0,r[a].name.length-1),nodes:[]});else{var l={id:Math.ceil(1e4*Math.random()),isDirectory:r[a].dir,title:r[a].name,nodes:[]};i.push(l),f[l.id]={title:l.title,isLocked:!1}}i.sort(function(e,t){return e.title.split("/").length>t.title.split("/").length?-1:e.title.split("/").length<t.title.split("/").length?1:0});for(var s=0,c=!0;c&&s<100;){c=!1;for(var u=i,g=0;g<i.length;g++){for(var d=0;d<u.length;d++)if(o(i[g].title,u[d].title)){i[g].nodes.push(u[d]),i.splice(d,1),c=!0;break}if(c)break}s++}return console.log("generated json out of zip:\n",i),e.getSetter("thejson")(i),e.getSetter("myslots")(f),i})}function u(){return t({method:"GET",url:n,responseType:"arraybuffer"}).then(function(t){return new Promise(function(n,o){JSZip.loadAsync(t.data).then(function(t){function o(t){t>i.length-1||(i[t].dir?(t++,o(t)):i[t].async("string").then(function(n){var r="slot"+Math.ceil(1e3*Math.random());e.getSetter(i[t].name)(r),e.getSetter(r)(n),t++,o(t++)}))}function r(e,t){if(e===t)return!1;var n=t.lastIndexOf("/");return t.substring(0,n)===e}console.log("loadasync...",t),e.deleteAll();var i=[];t.forEach(function(e,t){"__"!==t.name.substring(0,2)&&i.push(t)}),o(0),console.log("zipfiles",i);var a=[];f={};for(var l=0;l<i.length;l++)if(i[l].dir)a.push({id:Math.ceil(1e4*Math.random()),isDirectory:i[l].dir,title:i[l].name.substring(0,i[l].name.length-1),nodes:[]});else{var s={id:Math.ceil(1e4*Math.random()),isDirectory:i[l].dir,title:i[l].name,nodes:[]};a.push(s),f[s.id]={title:s.title,isLocked:!1}}a.sort(function(e,t){return e.title.split("/").length>t.title.split("/").length?-1:e.title.split("/").length<t.title.split("/").length?1:0});for(var c=0,u=!0;u&&c<100;){u=!1;for(var g=a,d=0;d<a.length;d++){for(var p=0;p<g.length;p++)if(r(a[d].title,g[p].title)){a[d].nodes.push(g[p]),a.splice(p,1),u=!0;break}if(u)break}c++}console.log("generated json out of zip:\n",a),e.setCurrentKey(f[0]),e.getSetter("thejson")(a),e.getSetter("myslots")(f),n(a)})})})}var f;return{init:r,getSlots:i,getZip:u,getZipFromFile:c,sendZip:l,getMySlots:a}}]),e.factory("StorageFactory",["storage","$log",function(e,t){function n(e,t){console.log(e,t,"\n",v,b,"\n");for(var n=-1,o="",r=0;r<v.length;r++)v[r].title===e&&(n=r,o=v[r].isLocked);n!==-1&&(b.title===e&&(b.title=t),v[n].title=t),console.log("after change: ",v,"\n",b,"\n")}function o(){var t=e.getKeys();t.forEach(function(e){"IAF_URL"!==e&&f(e)()})}function r(){var e=v.shift();return v.push(e),b=v[0],v[0]}function i(e,t){console.log("id ",t);var n="slot"+Math.ceil(1e3*Math.random()),o={title:e,isLocked:!1};v.push(o),f(n)('<?xml version="1.0" encoding="UTF-8"?>'),f(e)(n);var r=g("myslots")();return r[t]=o,f("myslots")(r),n}function a(){if(0===e.getKeys().length){f("slot1")(" start here..."),f("file1")("slot1");var t=[{id:1,title:"dir1",isDirectory:!0,nodes:[{id:2,title:"file1",isDirectory:!1,isLocked:!1,nodes:[]}]}],n={2:{title:"file1",isLocked:!1}};f("thejson")(t),f("myslots")(n),v=u(["file1"])}else{var o=e.getKeys();o.indexOf("thejson")>-1&&o.splice(o.indexOf("thejson"),1),o.indexOf("myslots")>-1&&o.splice(o.indexOf("myslots"),1),o.indexOf("IAF_URL")>-1&&o.splice(o.indexOf("IAF_URL"),1),v=u(o)}b=v[0]}function l(){var e=[];return S.forEach(function(t){e.push(g(t)())}),e}function s(e){console.log("set currentkey::",e),b=e}function c(){return b}function u(e){var t=[];return e.forEach(function(e){"slot"!==e.substring(0,4)&&t.push({title:e,isLocked:!1})}),t}function f(e){return d(e),y[e].setter}function g(e){return d(e),y[e].getter}function d(e){if(!e||angular.isUndefined(e))throw new Error("Key[ "+e+" ] is invalid");y.hasOwnProperty(e)||p(e)}function p(e){var t=h(e),n=m(e);y[e]={setter:t,getter:n}}function h(n){return function(o){if(angular.isDefined(o))try{e.set(n,o)}catch(r){t.info("[StorageFactory]"+r.message)}else e.remove(n)}}function m(t){return function(){var n=e.get(t);if(null===n){n=void 0;var o=y[t].setter;o(n)}return n}}var v,y={},S=["file1"],b="slot1";return{getSetter:f,getGetter:g,verifyKey:d,createAPIForKey:p,createSetter:h,createGetter:m,getAliases:l,switchKey:r,setCurrentKey:s,getCurrentKey:c,getNewSlotname:i,initialise:a,deleteAll:o,changeKeys:n}}]),e.factory("EditorFactory",function(){function e(e){function t(e,t){e.getCursor();return t&&!t()||setTimeout(function(){e.state.completionActive||e.showHint({completeSingle:!1})},100),CodeMirror.Pass}function n(e){return t(e,function(){var t=e.getCursor();return"<"==e.getRange(CodeMirror.Pos(t.line,t.ch-1),t)})}function o(e){return t(e,function(){var t=e.getTokenAt(e.getCursor());if("string"==t.type&&(!/['"]/.test(t.string.charAt(t.string.length-1))||1==t.string.length))return!1;var n=CodeMirror.innerMode(e.getMode(),t.state).state;return n.tagName})}e.getDoc();e.focus(),e.setOption("lineNumbers",!0),e.setOption("lineWrapping",!0),e.setOption("mode","xml"),e.setOption("beautify","true"),e.setOption("theme","twilight"),e.setOption("foldGutter",!0),e.setOption("gutters",["CodeMirror-linenumbers","CodeMirror-foldgutter"]),e.setOption("matchTags",{bothTags:!0});var r={"'<'":t,"'/'":n,"' '":o,"'='":o,"Ctrl-Space":"autocomplete"};e.setOption("extraKeys",r),console.log("editor loaded;",e.options);var i=window.innerHeight,a=document.getElementById("mynavbar").offsetHeight,l=document.querySelector(".CodeMirror");return l.style.height=i-a+"px",console.log("window, navbar, editor:",i,a,l.style.height),e}return{editorLoaded:e}}),e.factory("ValidationFactory",["StorageFactory","$http","API_URL",function(e,t,n){function o(){return t.get(n+"/validate").then(function(t){var n=e.getGetter(e.getCurrentKey())();console.log("xsd:\n",t),console.log("xml:\n",typeof n);var o=validateXML(n,t.data);return o},function(e){return console.log("failure....",e),e})}return{validateXml:o}}]),e.factory("IafFactory",["$http","StorageFactory","UPLOAD_URL",function(e,t,n){function o(){n=t.getGetter("UPLOAD_URL")()}function r(t){return new Promise(function(o,r){var i=n;alert(i),t.generateAsync({type:"blob"}).then(function(t){var n="configuration.zip",o=new FormData;return o.append("realm","jdbc"),o.append("name","Ibis4Student"),o.append("version",1),o.append("encoding","utf-8"),o.append("multiple_configs",!1),o.append("activate_config",!0),o.append("automatic_reload",!0),o.append("file",t,n),new Promise(function(n,r){return console.log("posting to iaf",t),e({method:"POST",url:i,data:o,headers:{"Content-type":void 0}}).then(function(e){console.info("returning from backend",e),n(e)},function(e){console.info("returning error from backend",e),r(e)})})}),o()})}function i(e,o,r){return console.log("server",e,o,r),e&&(n=e,console.log("upload url",n,typeof IAF_URL),t.getSetter("UPLOAD_URL")(e)),o=o,r=r,{apiurl:e,uname:o,pw:r}}return{postConfig:r,setCredentials:i,setIAFURL:o}}])}();
//# sourceMappingURL=services.js.map