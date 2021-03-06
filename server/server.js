(function()
{
var app;
var Iaftag;
var fs;
var path;
var _;
var spawn;

/*
	Iaftag
	{
		"classname": "",
		"children" : [],
		"description": "",
		"attrs": {},
		"properties" : [],
		"xml" : ""
	}
*/

init();
initDb();

/**************** DEFAULT INITIALIZATION *********************/
function init()
{
	var express = require('express'); // basic API builder
	var cors = require('cors');// anticipate cross browser origin requests
	var bodyParser = require('body-parser');//easy post request handling
	//require('body-parser-xml')(bodyParser);
	fs = require('fs');
	path = require('path');
	spawn = require('child_process').spawn;
	
	_ = require('underscore-node'); //convenience library

	app = express();
	app.use(cors());
	app.set('port', process.env.PORT || 3000);
	//app.use(bodyParser.json());
	//app.use(bodyParser.xml());
	app.use(bodyParser.json({limit: "50mb"}));
	app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
	app.listen(app.get('port'), function ()
	{
	    console.log('\nApp listening on port\n ' + app.get('port'));
	});
}

//*************** CONNECTING MONGOLAB DATABASE
function initDb()
{
	var options = {
		userMongoClient : true,
	    server: {socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}},
	    replset: {socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}}
		};
	var mongoose = require('mongoose');
	Iaftag = require('./iaftagmodel.js');
	var mongodbUri = 'mongodb://apreinders:mongolabOsiris74@ds011158.mlab.com:11158/db_apstraction';
	mongoose.connect(mongodbUri, options).then(function (db)
	{
		console.log("\ndb connection established...");
	});
}

/**********************  API URLS **********************************/
app.get('/', function (req, res)
{
	var filepath = path.join(__dirname,'./resources/landingpage.html');
	fs.readFile(filepath, {encoding :'utf-8'}, function read(err, data)
	{
		res.send(data);
	});
});

/*
Retrieving the saved json file;
*/
app.get('/json', function (req, res)
{
	var filepath = path.join(__dirname,'./resources//datamonster.json');
	
	fs.readFile(filepath,{encoding:'utf-8'}, function read(err, data)
	{
		if(err)
		{
			res.status(500).send(err);
		}
		else
		{
			res.set('Content-type','application/json');
			res.status(200).send(data);
		}
	});
});


app.get('/getzip', function(req, res)
{
	var filepath = path.join(__dirname,'./resources/Ibis4Student.zip');
	fs.readFile(filepath, function read(err, data)//removing the utf-8 encoding flag
	{
		if(err)
		{
			res.status(500).send(err);
		}
		else
		{
			res.set('Content-type','application/zip');
			res.status(200).send(data);
		}
	});
});


app.post('/postIaftag', function(req, res)
{
	console.log("req",req.body, '\n');
	var tag = new Iaftag(req.body);
	Iaftag.update({classname: tag.classname},
		{
			classname:tag.classname,
			type:tag.type,
			description: tag.description,
			attrs: tag.attrs,
			properties : tag.properties,
			xml : tag.xml,
			free : tag.free,
			url : tag.url
		}, 
		{upsert : true},
		function (err, result)
		{
			console.log("result:", result);
			if(err)
			{
				throw err;
			}
			else
			{
				if(tag.type === 'snippet')
				{
					var convert = require('xml-js');
					var contents = convert.json2xml(tag.xml,{compact:true, spaces: 4});
					fs.writeFile(filepath , contents, function(result)
					{
						console.log('write result',result);
					});
					saveJson();
					res.status(200).send('successfully saved snippet.');
				}
				else
				{	
					saveJson();
					res.status(200).send('successfully saved iaftag.');
				}
				
			}
		});

});

/*Posts a complete json body of the type {"mytag1":{"classname":"name1", ......},"mytag2":{"classname":"name2", ......}}*/
app.post('/postJsonBulk', function(req, res)
{
	console.log("receiving...");
	var iaftags = [];
	_.each(req.body, function(item, index)
	{
		iaftags.push(new Iaftag(
		{
			classname:item.classname,
			type: item.type,
			description: item.description,
			attrs: item.attrs,
			properties: item.properties,
			xml: item.xml,
			url:item.url,
			free:item.free
		}));
	});
	console.log("tags length ", iaftags.length);
	Iaftag.insertMany(iaftags, function(err, resp)
	{
		if(err)
			{
				console.log("error",err);
				res.status(500).send(err);
			}
		else
		{
			res.status(200).send(resp);
			console.log("inserted ", iaftags.length, " objects.");
			saveJson();
		}
	});

});

app.post('/convertToXml', function(req, res)
{
	console.log("converting to xml\n");
	res.set('Content-type','application/xml');
	var convert = require('xml-js');
	res.status(200).send(convert.json2xml(req.body));
});

app.post('/convertToJson', function(req, res)
{
	console.log("converting xml to json\n");
	res.set('Content-type','application/json');
	var thebody = "";
	req.on('data' , function(chunk)
	{
		thebody += chunk;
	}).on('end', function()
	{
		var convert = require('xml-js');
		res.status(200).send(convert.xml2json(thebody));
	});
});

app.post('/postZipFile', function(req, res)
{
	var thebody = "";
	req.on('data' , function(chunk)
	{
		thebody += chunk;
	}).on('end', function()
	{
		var JSZIP = require('jszip');
		//console.log("body:",thebody);
		JSZIP.loadAsync(thebody).then(function(zip)
		{
			  var myzipfiles = [];
	          zip.forEach(function(relativePath, file)
	          {
	              myzipfiles.push(file);
	          });
			  console.log("reading zipdata...",myzipfiles);
			res.status(200).send();
		}, function(err)
		{
			console.log("error reading zipdata...",err);
			res.status(500).send();
		});
	});



		
});





/* the delete request looks like: "http://localhost:3000/deleteItem?resource=HelloWorld"; */
app.get('/deleteItem', function (req, res)
{
	var param = req.query.resource;
	console.log("requesting to delete ", param);
	Iaftag.remove({classname : param}, function (err, result)
	{
		if (err)
		{
			console.log("deletion failed...", err);
			res.status(500).send(err);
		}
		else
		{
			// var filepath = path.join(__dirname,'./resources/snippets/' + param +'.xml');
			// fs.stat(filepath, function(err, stats)
			// {
			// 	if(stats)
			// 	{
			// 		fs.unlink(filepath, function(err)
			// 		{
			// 			if (err)
			// 			{
			// 				console.log("deletion error on",filepath,'\n', err);
			// 			}
			// 			else
			// 			{
			// 				console.log("succesfully deleted ", filepath);
			// 			}
			// 		});
			// 	}
			// });
			res.status(200).send(result);
			saveJson();
		}
	});

});

/* Posts an xsd schemafile, stores it only in the file system*/
app.post('/postSchema', function(req,res)
{
	var filepath = path.join(__dirname,'./resources/schema.xsd');
	var thebody = "";
	req.on('data' , function(chunk)
	{
		thebody += chunk;
	}).on('end', function()
	{
		fs.writeFile(filepath, thebody, {encoding:'utf-8'}, function (err)
		{
			if(err) throw err;
	 		res.status(200).send("Schema successfully saved.\n");
		});
	});
});


/*returning the applicable schema document to validate against on the client side.*/
app.get('/validate', function (req, res)
{
	//xmllint validates but crashes afterwards: the code works in the node shell but
	//not in express environment...TODO : solve this issue
	// var xml = fs.readFileSync('./server/test.xml').toString();
	// var  schema = fs.readFileSync('./server/test.xsd').toString();
	// var xmllint =  require('xmllint');
	// xmllint.validateXML({xml:xml, schema:schema});
	console.log("validating...");
	var filepath = path.join(__dirname,'./resources/schema1.xsd');
	fs.readFile(filepath,{encoding:'utf-8'} , function read(err, myxsd)
	{
		if(err)
		{
			res.status(500).send();
		}else
		{
			console.log("sending xml...");
			res.set('Content-type', 'application/xml');
			res.send(myxsd);
		}
	});		
});


/*
The content of an xml snippet  is retrieved ; 
An example request looks like "http://localhost:3000/snippets?resource=HelloWorld";
In case the file is not found the system will try to recover it from the db.
*/
// app.get('/snippets', function(req, res)
// {
// 	var param = req.query.resource;
// 	var filepath = path.join(__dirname,'./resources/snippets/' + param + '.xml');
// 	console.log("Getting an xml snippet called ", param);
// 	res.set('Content-type','application/xml');
// 	fs.readFile(filepath,{encoding:'utf-8'}, function(err, doc)
// 	{
// 		if(err)
// 		{
// 			Iaftag.find({classname:param},{xml:1}, function(err, result)
// 			{
// 				var convert = require('xml-js');
// 				try
// 				{
// 					var myres = convert.json2xml(JSON.stringify(result[0].xml),{compact:true, spaces: 4});
// 					fs.writeFile(filepath , myres, function(result)
// 					{
// 						console.log('written ' + filepath );
// 						res.status(200).send(myres);
// 					});
// 				}
// 				catch (err)
// 				{
// 					res.status(400).send(err);
// 				}
// 			});
// 		}
// 		else
// 		{
// 			res.status(200).send(doc);
// 		}
// 	});
// });




/*
Retrieves the whole Iaftag collection from the db; a new object is created here
that contains them all. To easily iterate over a JSON object the underscore _.each method
is used. The result is written in datamonster.json
*/
function saveJson()
{
	var filepath = path.join(__dirname,'./resources/datamonster.json');
	Iaftag.find({}, function(err, data)
		{
			if(err)
			{
				console.log("error", err);
			}
			else			
			{
				var myjson = {};
				_.each(data,function(item, index)
				{
					myjson[item.classname] = item;
				});

			fs.writeFile(filepath , JSON.stringify(myjson), function(result)
			{
				console.log("file write result ok");
			});
			}
		});
}

}());


// ds011158.mlab.com:11158/db_apstraction -u apreinders -p mongolabOsiris74 --authenticationDatabase "db_apstraction"
// mongoose.connect(mongodbUri, options);
// var conn = mongoose.connection;
// conn.on('error', console.error.bind(console, 'mongodb connection error:'));
// conn.once('open', function ()
// {
//     console.log('connection with mongodb established!');
// });

//setting these API urls to retrieve files directoy without stating an endpoint
	//app.use('/json', express.static(path.resolve(__dirname , 'resources/json')));
	//app.use('/snippets', express.static(path.resolve(__dirname , 'resources/snippets')));

// function getJsonMonster()
// {
// 	JsonMonster.findOne({}, function(err, data)
// 	{
// 		if(err)
// 		{
// 			console.log("error", err);
// 		}
// 		else
// 		{
// 			console.log("the data",data.json);
// 		}
// 	});
// }

// function readFile()
// {
// 	var filepath = path.join(__dirname,'./resources//datamonster.json');
// 	fs.readFile(filepath,{encoding:'utf-8'}, function read(err, data)
// 	{
// 		addToJson(data);
// 	});
// }

// 	function addToJson(jsonfile)
// 	{
// 		var obj = JSON.parse(jsonfile);
// 		for (var key in obj)
// 		{
// 			if(obj.hasOwnProperty(key))
// 			{
// 				//console.log("key",key);
// 				//console.log("value",obj[key]);
// 			}
// 		}
// 	}
// }

// function hashCode (str)
// {
//     var hash = 0;
//     if (str.length == 0) return hash;
//     for (i = 0; i < str.length; i++) 
//     {
//         char = str.charCodeAt(i);
//         hash = ((hash<<5)-hash)+char;
//         hash = hash & hash; // Convert to 32bit integer
//     }
// 	return hash;
// }
