(function (){
    'use strict';

    angular.module('confab')
        .controller('IndexController', function ($scope,$interval,$timeout, xmlTag, attributeObject, StaticDataFactory, StorageFactory, EditorFactory, ValidationFactory)
        {

            console.log('IndexController...');
            var vm = this;
        
            //Functions
            vm.submitForm = submitForm;
            //vm.codemirrorLoaded = codemirrorLoaded;
            vm.codemirrorLoaded = getEditor;
            vm.setSelectedClass = setSelectedClass;
            vm.toggle_datasource = toggle_datasource;
            vm.styleEditorContent = styleEditorContent;
            vm.clearEditor = clearEditor;
            vm.showNav = showNav;
            vm.showConf = showConf;
            vm.loadXml = loadXml;
            vm.storeData = storeData;
            vm.retrieveData = retrieveData;
            vm.toggleSlot = toggleSlot;
            vm.modifyAlias = modifyAlias;
            vm.checkDefaults = checkDefaults;
            vm.changeTheme = changeTheme;
            vm.changeFontSize = changeFontSize;
            vm.validateXml = validateXml;

            //Static values
            vm.message = "Angular Controller is working allright...";
            vm.userInput = "";
            vm.datasource = StaticDataFactory.getDataSource();
            vm.navigatorModel = null;
            vm.selectedItem = null;
            vm.showPropertyDescription = false;
            vm.selectedProperties = {};
            vm.showConfig = false;
            vm.showNavigator = true;
            vm.showFullEditor = false;
            var editor = null;
            var thedocument = null;    
            vm.intervalID = null;
            vm.showValidationMessage = false;
            vm.validationMessage = null;

            //Editor Styling
            vm.themes = StaticDataFactory.getThemes();
            vm.selectedTheme = "twilight";
            vm.selectedFontSize = 14;
            vm.fontSizes = StaticDataFactory.getFontSizes();
            

            vm.currentSlotNumber = 0;
            vm.theslots = [];
            $interval(function()
            {
                StorageFactory.getSetter(StorageFactory.getCurrentKey())(thedocument.getValue());
            }, 5000);

            

            function validateXml()
            {
                vm.validationMessage = ValidationFactory.validateXml(vm.currentSlot, vm.theslots[3]);
                console.log("validating....", vm.validationMessage);
            }

            function changeFontSize()
            {   
                var ed = document.getElementsByClassName('CodeMirror')[0];
                ed.style.fontSize = vm.selectedFontSize.toString() + 'px';
            }

            //initialisation of editor(triggered by attribute in home.html), datamodel, and cache
            function getEditor(_editor)
            {
                editor = EditorFactory.editorLoaded(_editor);
                thedocument = editor.getDoc();
                StaticDataFactory.getJson().then(function success(response)
                {
                    vm.navigatorModel = response.data;
                    editor.setOption('hintOptions', {schemaInfo: vm.navigatorModel});
                    editor.foldCode(CodeMirror.Pos(0,0));
                    editor.foldCode(CodeMirror.Pos(thedocument.lineCount(),0));
                    toggle_datasource('pipes');
                    showNav(); 
                    showConf();
                    showConf();
                
                    //initialising the cache and loading it in the editor;
                    var avalue = StorageFactory.initialise();
                    retrieveData();
                    console.log("data:", vm.navigatorModel);
                },function error(response)
                {
                    console.log("error initialising:", response.data);
                });
            }

              

            function changeTheme()
            {

                editor.setOption('theme', vm.selectedTheme);
            }



                

            function modifyAlias(slotn, newname)
            {
                console.log("modify ",slotn, newname);
                StorageFactory.getSetter(slotn)(newname);
            }

            console.log("retrieved keys",StorageFactory.getKeys());

            function toggleSlot(slot)
            {
                
                console.log("slot: ", slot );
                if(slot.length === 1)
                {
                    var slotnumber = Number(slot) + 1;
                    if (slotnumber === 5)
                    {
                        slotnumber = 1 ;
                    }
                vm.currentSlot = "slot" + slotnumber.toString();
                console.log("current slot: ", vm.currentSlot);
                vm.currentSlotNumber = slotnumber;
                StorageFactory.setCurrentKey(vm.currentSlot);
                retrieveData(vm.currentSlot);
                }   

                //a keypress on an open folder, in other words, closing a folder
                else if(vm.currentSlot === slot)
                {
                    vm.currentSlot = vm.theslots[0];
                    vm.currentSlotNumber = slot.subString(4,5);
                    StorageFactory.setCurrentKey(vm.currentSlot);
                }
                //opening a slot
                else
                {
                    vm.currentSlot = slot;
                    vm.currentSlotNumber = slot.subString(4,5);
                    StorageFactory.setCurrentKey(vm.currentSlot);
                    retrieveData(slot);
                }

                // console.log("theslots:",vm.theslots, vm.currentSlot);
            }

            function storeData()
            {
                var mykey = StorageFactory.getCurrentKey();
                var myvalue = thedocument.getValue();
                console.log("storing data", mykey, myvalue);
                StorageFactory.getSetter(mykey)(myvalue);
            }

            function retrieveData(key)
            {
                console.log("retrieving data");
                
                if(key === undefined)
                {
                    var ks = StorageFactory.getCurrentKey();
                    thedocument.setValue(StorageFactory.getGetter(ks)());
                    vm.theslots = StorageFactory.getKeys();
                    vm.thealiases = StorageFactory.getAliases();
                    vm.currentSlot = vm.theslots[0];
                    // console.log("slots after initialisation:",vm.thealiases);
                }
                else
                {
                    // console.log("getting value for slot ", key);
                    thedocument.setValue(StorageFactory.getGetter(key)());
                   
                }
            
            // console.log("slots",vm.theslots);
            }

            function showConf()
            {
                var navigator = document.getElementById('navigatorcontainer');
                 
                if(vm.showConfig)
                {
                  navigator.style.left = "0%";
                }
                else
                {
                  navigator.style.left = '-25%';
                }
                vm.showConfig = !vm.showConfig;
              }
                


              function showNav()
              {
                var editor = document.getElementById('editorcontainer');
                var navItem = document.getElementById('navItem');
                var picture = document.getElementById('picture');
                
                if(!picture || !navItem || !editor){return;}


                if(vm.showNavigator)
                {
                  editor.style.width = '75%';
                  editor.style.left = '25%';
                  navItem.style.left = '90%';
                  picture.classList.add('fa-toggle-left');
                  picture.classList.remove('fa-toggle-right');
                }
                else
                {
                  editor.style.width = '100%';
                  editor.style.left = '0%';
                  navItem.style.left = '0%';
                  picture.classList.remove('fa-toggle-left');
                  picture.classList.add('fa-toggle-right');
                }
                vm.showNavigator = !vm.showNavigator;
              }

            
            //inserts an xml snippet at the cursor position;
            function loadXml()
            {
                StaticDataFactory.loadXml(vm.selectedItem.file).then(function succes(response)
                {
                    thedocument.replaceSelection(response.data);
                });
            }


            


            //responds to the selection of an item in the class Area;
            function setSelectedClass(item)
            {
                vm.selectedItem = item;
                vm.selectedProperties = {};
                
                for(var i=0 ; i<item.properties.length; i++)
                {
                    if(item.properties[i][0]=='classname' || item.properties[i][0]=='className')
                    {
                        

                        var checkbox = document.getElementById('checkbox' + i);
                        if(checkbox === null)
                        {
                            break;
                        }
                        checkbox.click();
                        break;
                    }
                }
            }



            //responds to the radiobuttons in the dataSource area and switches to pipe, receiver, snippet or general; the first item of 
            //the chosen type is selected.
            function toggle_datasource(string)
            {
                StaticDataFactory.setDataSource(string);
                vm.datasource = StaticDataFactory.getDataSource();
                vm.showPropertyDescription = false;
                
                var done = false;
                Object.keys(vm.navigatorModel).forEach(function(key)
                {
                    if (!done && vm.navigatorModel[key].type === string )
                    {
                        //vm.selectedItem = vm.navigatorModel[key];
                        //vm.selectedProperties = {};
                        setSelectedClass(vm.navigatorModel[key]);

                        done = true;
                    }
                });


                console.log("vm.datasource", vm.datasource);
            }


            // function codemirrorLoaded(_editor)
            // {
            //     var _doc = _editor.getDoc();
            //     _editor.focus();
            //     _editor.setOption('lineNumbers', true);
            //     _editor.setOption('lineWrapping', true);
            //     _editor.setOption('mode', 'xml');
            //     _editor.setOption('beautify', 'true');
            //     _editor.setOption('theme', 'twilight');
            //     _editor.setOption('hintOptions', {schemaInfo: vm.navigatorModel});
            //     _editor.setOption('matchTags', {bothTags: true});
            //     var extraKeys =  {
            //               "'<'": completeAfter,
            //               "'/'": completeIfAfterLt,
            //               "' '": completeIfInTag,
            //               "'='": completeIfInTag,
            //               "Ctrl-Space": "autocomplete"
            //                     };
            //     _editor.setOption('extraKeys', extraKeys);
                
            //     var map = {"Ctrl-A" : function(cm)
            //         {
            //             console.log("pushing ctrl-A");
            //             var position = _doc.getCursor();
            //             //var range = doc.getRange({'from' : position, 'to':{position.line, positon.ch+10}
            //             //console.log("range:", range);
            //         }};
            //     _editor.addKeyMap(map);    
            //     editor = _editor;
            //     thedocument = _doc;

                
            //     //initialising left panel.
            //     showNav(); 
            //     showConf();
            //     showConf();
                
            //     //initialising the cache and loading it in the editor;
            //     var avalue = StorageFactory.initialise();
            //     retrieveData();
            //     console.log("editor loaded;");



            //     var windowheight = window.innerHeight;
            //     var navbarheight = document.getElementById('mynavbar').offsetHeight;
            //     var ed = document.querySelector('.CodeMirror');
            //     ed.style.height = (windowheight - navbarheight) + 'px'; 
            //     console.log("window, navbar, editor:", windowheight, navbarheight, ed.style.height);

            //     function completeAfter(cm, pred) 
            //     {
            //         var cur = cm.getCursor();
            //         if (!pred || pred()) setTimeout(function() 
            //         {
            //             if (!cm.state.completionActive)
            //             cm.showHint({completeSingle: false});
            //         }, 100);
            //         return CodeMirror.Pass;
            //     }

            //     function completeIfAfterLt(cm) 
            //     {
            //         return completeAfter(cm, function() 
            //         {
            //             var cur = cm.getCursor();
            //             return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == "<";
            //         });
            //     }

            //     function completeIfInTag(cm) 
            //     {
            //     return completeAfter(cm, function() 
            //     {
            //         var tok = cm.getTokenAt(cm.getCursor());
            //         if (tok.type == "string" && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1)) return false;
            //         var inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
            //         return inner.tagName;
            //     });
            //   }
            // }

            function clearEditor()
            {
                thedocument.setValue("<?xml version='1.0' encoding='UTF-8'?>\n");
                thedocument.setCursor({line:thedocument.lastLine(),ch:0});
                editor.focus();
            }

            function styleEditorContent()
            {
                //get the currunt cursor position of the editor; check between which values that is and look that up
                // after reformatting the text to replace the cursor.
                var pos = thedocument.getCursor();
                var before = thedocument.getRange({line:pos.line,ch:0},pos);
                //regex to find tag segment left of the cursor : <[\w\/\s=\'\"]+$|<[\w\/\s=\'\"]+>$
                var beforesegment = before.match(/<[\w\/\s=\'\"]+$|<[\w\/\s=\'\"]+>[\w\s]*$/);
                if (beforesegment !== null)
                {
                    before = beforesegment[0];
                }
                var after = thedocument.getRange(pos,{line:pos.line,ch:null});
                //regex to find tag segment to the right of cursor : ^[\w\/\s=\'\"]+>|^<[\w\/\s=\'\"]+> 
                var aftersegment = after.match(/^[\w\/\s=\'\"]+>|^<[\w\/\s=\'\"]+>/);
                if (aftersegment !== null)
                {
                    after = aftersegment[0];
                }

                //search the correct position of the cursor, possibly many similar tags : the index of the search results
                //array is stored
                var cursor = editor.getSearchCursor(before);
                var counter =0 ;
                var original = {line:10000,ch:10000};
                var myindex = -1;
                while (cursor.find() === true)
                {   
                    var newval = cursor.to();
                    if (isTheBetter(pos, newval, original))
                    {
                        original = newval;
                        myindex = counter;
                    }
                    counter++;
                }
                //now that we know we can find the new cursor position we will format the complete text
                var settings = StaticDataFactory.getFormattingSettings();
                thedocument.setValue(html_beautify(thedocument.getValue(),settings));

                //put the cursor back in place
                cursor = editor.getSearchCursor(before);
                for(var i=0 ; i < myindex+1 ;i++)
                {
                    cursor.find();
                }
                if(cursor.to())
                {
                    thedocument.setCursor(cursor.to());
                }
                editor.focus();


                function isTheBetter(newpos, oldpos, standard)
                {
                    var linedifference1 = Math.abs(standard.line - oldpos.line);
                    var linedifference2 = Math.abs(standard.line - newpos.line);
                    if (linedifference1 > linedifference2)
                    {
                        return false;
                    }
                    if(linedifference2 > linedifference1)
                    {
                        return true;
                    }
                    var chardifference1 = Math.abs(standard.ch - oldpos.ch);
                    var chardifference2 = Math.abs(standard.ch - newpos.ch);
                    if (chardifference1 > chardifference2)
                    {
                        return false;
                    }
                    return true;
                }
            }


            //determines to check a value in the property area because they are obligatory;
            function checkDefaults(property)
            {
                if(property[0] === 'classname' || property[0] === 'className')
                {
                    vm.selectedProperties[property[0]] = new attributeObject('className', new Array(property[2]));
                    return true;
                }
                return false;
            }


/*Responds to the arrow button in the navBar. The current selected item and the current selected properties are converted
to a string and inserted in the editor;*/

            function submitForm()

            {

                if (vm.selectedItem === null)
                {
                    return;
                }
                if(vm.selectedItem.type === 'snippets')
                {
                    console.log("selectedItem:",vm.selectedItem);
                    loadXml(vm.selectedItem.file);
                }
                else
                {
                    var theproperties = [];    
                    console.log("props:", vm.selectedProperties);
                    if (Object.keys(vm.selectedProperties).length > 0 )
                    {
                        Object.keys(vm.selectedProperties).forEach(function(thekey)
                        {
                            
                            theproperties.push(vm.selectedProperties[thekey]);
                        }); 
                    }
                   var newtag = new xmlTag(vm.selectedItem.classname, theproperties);
                    thedocument.replaceSelection(newtag.toCompleteTag());
                    editor.focus();
                }
            }
        })
    /*determines which classes are shown in the navigator, based on the JSON item type (pipes, receivers, general or snippets)*/
.filter('datasourceFilter', function(StaticDataFactory)
    {
        return function(items)
        {
            var filtered = [];
            angular.forEach(items, function(item)
            {
               // console.log("item:", item);
               if (item.type === StaticDataFactory.getDataSource())
                {
                    filtered.push(item);
                }
            });
            return filtered;
        };
    })
    //replaces escaped tag signs with the proper symbols, used in the description area where sometimes strange symbols appear.
    .filter('cleanupFilter', function()
    {
        return function(item)
        {
            var newstring = item.replace(/&lt;/g,'<');
            var newerstring = newstring.replace(/&gt;/g,'>');
            return newerstring;
        };
    });
})();