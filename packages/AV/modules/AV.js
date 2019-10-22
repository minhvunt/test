ReadyObject = {
	isReady: false,
	init:function()
	{
		this.isReady = true;
	},
	ready:function(func)
	{
		AV.ExecQueue.add(func, function(){return this.isReady;}, this);
	}
};
AV = $.extend({
	modules:{},
	UITheme:'vimua',
	oldHash:location.hash,
	hashs:{},
	version:1,
	elems:{},
	innerText:'textContent',
	ajaxIndicator:false,
	language:'vi',
	allOrderedLinks:[],
	cookie:function(name, value)
	{
		if(typeof(value) != 'undefined')
		{
			jQuery.cookie(name, value, {expires:7, path:AV.path});
		}
		else
		{
			return jQuery.cookie(name);
		}
	},
	rpc: function(url, success)
	{
		this.load('3rdparty/jQuery/jquery.rpc.js');
		return $.rpc(
		   url /* rpc server */
		   , "xml" /* say that our server is xml */
		   ,function(server) {
			   success.call(this);
		   }
 		);
	},
	call: function(url, method, params, callback)
	{
		this.load('3rdparty/jQuery/jqSOAPClient.beta.js', function(){
			var soapBody = new SOAPObject(method);
			if(typeof(params) == 'object')
			{
				var parts = [];
				for(var i in params)
				{
					parts.push({name:i, value:params[i]});
				}
				for(var i = parts.length-1; i>=0; i--)
				{
					soapBody.attr(parts[i].name,parts[i].value);
				}
			}
			var sr = new SOAPRequest(method, soapBody); 
			SOAPClient.Proxy = url; 
			SOAPClient.SendRequest(sr, callback);
		});
	},
	elem:function(id)
	{
		var elem = AV.elems[id];
		if(!elem)
		{
			return (AV.elems[id] = document.getElementById(id));
		}
		return elem;
	},
	sizeof:function(obj)
	{
		if(typeof(obj) == 'object')
		{
			if(obj.length) return obj.length;
			var size = 0;
			for(var i in obj)
			{
				if(typeof(obj[i])!='function')
				{
					size ++;
				}
			}
			return parseInt(size);
		}
		else
		if(typeof(obj.length) != 'undefined')
		{
			return obj.length;
		}
		return 0;
	},
	xml:function(fn, path)
	{
		return AV.xmlToJson($(path,AV.read(fn, {dataType:'xml', async:false})));
	},
	xmlToJson:function(xmlNode, parentNode)
	{
		var result = {}, count = 0, isArray = false;
		if(xmlNode.children)
		{
			xmlNode.children().each(function(){
				var children = $(this).children(), key;
				if(count == 0 && typeof(result[this.tagName]) == 'undefined' && !isArray)
				{
					if(typeof(parentNode) != 'undefined' && parentNode == this.tagName+'s')
					{
						key = 0;
						isArray = true;
						result = [];
					}
					else
					{
						key = this.tagName;
					}
				}
				else
				{
					if(count == 0 && typeof(result[this.tagName]) != 'undefined')
					{
						result = [result[this.tagName]];
					}
					key = ++count;
				}
				if(children.length > 0)
				{
					result[key] = AV.xmlToJson($(this), key);
				}
				else
				{
					result[key] = $(this).text();
				}
				children = null;
				//result[key]._index = count;
			});
		}
		else
		{
			return xmlNode;
		}
		return result;
	},
	template:function(id, data)
	{
		return $.fn.pureJSTemplate({
			id:id, 
			data:data
		});
	},
	request: function(param, defaultValue) {
		if(typeof(defaultValue) == 'undefined')
		{
			defaultValue = '';
		}
		var regex = '[?&]' + param + '=([^&#]*)';
		var results = (new RegExp(regex)).exec(location.href);
		if(results) return results[1];
		return defaultValue;
	},
	buildURL:function(options, urlMode){
		var url = '?';
		for(var i in options)
		{
			url += '&'+i+'='+encodeURI(options[i]);
		}
		return url;
	},
	read:function(fileName, options, func)
	{
		if(!fileName)return;
		if(AV.allLinks[fileName])
		{
			return;
		}
		if(typeof(options) == 'function')
		{
			func = options;
			options = {};
		}
		if(!options)
		{
			options = {};
		}
		if(!options.dataType)
		{
			options.dataType = 'html';
		}
		if(fileName.indexOf('http://') != -1)
		{
			$('body').append('<'+'script src="'+fileName+'"><'+'/script>');
			AV.allLinks[fileName] = 2;
			AV.allOrderedLinks.push(fileName);
		}
		else
		{
			if(fileName.indexOf('.css') != -1)
			{
				$('body').append('<link rel="stylesheet" type="text/css" href="'+fileName+'">');
				AV.allLinks[fileName] = 2;
				AV.allOrderedLinks.push(fileName);
				return;
			}
			if(fileName.indexOf('.js') != -1)
			{
				var node = document.createElement('SCRIPT');
				node.src = fileName;
				document.body.appendChild(node);
				var node2 = document.createElement('SCRIPT');
				node2.text = 'AV.allLinks["'+fileName+'"] = 2; AV.allOrderedLinks.push("'+fileName+'");';
				document.body.appendChild(node2);
				//$('body').append('<'+'script src="'+fileName+'"></'+'script><'+'script>AV.allLinks["'+fileName+'"] = 2; AV.allOrderedLinks.push("'+fileName+'");<'+'/script>');
				if(func)
				{
					AV.ExecQueue.add(function(){
						func.call(this);
					},function(){return AV.allLinks[fileName] == 2;});
				}
				return;
			}
			var returnValue = '';
			AV.allLinks[fileName] = 1;
			$.ajax($.extend({
				url: fileName+(/\?/.test(fileName)?'&':'?')+'v='+AV.version,
				cache:true,
				success:function(data)
				{
					if(options.dataType == 'html')
					{
						if(fileName.indexOf('.css') != -1)
						{
							var parts = fileName.split('/');
							parts.splice(parts.length - 1, 1);
							parts = parts.join('/')+'/';
							data = data.replace(/url\s*\(\s*(["']?)/gi, 'url($1'+parts);
							$('body').append('<style>'+data+'</style>');
						}
						else
						if(fileName.indexOf('.js') != -1)
						{
						//try {
							eval(data);
						//} catch (e) {}
						}
					}
					else
					{
						returnValue = data;
					}
					AV.allLinks[fileName] = 2;
					AV.allOrderedLinks.push(fileName);
					if(func)
					{
						func.call(this, data);
					}
				}
			}, options));
			return returnValue;
		}
	},
	getComponentURL:function(url)
	{
		var values = {path : '', type : ''};
		if(url.indexOf('http://') != -1)
		{
			values.path = AV.rootURL + 'get.php?url='+ encodeURI(url);
			values.type = 'cross-domain';
		}
		else if(url.indexOf('3rdparty') != -1)
		{
			values.path = AV.rootURL+url;
			values.type = '3rdparty';
		}
		else if(url.indexOf('.') != -1)
		{
			var parts = url.split('.');
			values.package = parts[0];
			parts.shift();
			
			values.path = AV.rootURL+'packages/'+values.package+'/modules/'+parts.join('.')+'.js';
			values.type = 'module';
		}
		else
		{
			values.packagePath = AV.rootURL+'packages/'+url+'/';
			values.path = values.packagePath+'modules/'+url+'.js';
			values.type = 'package';
			
		}
		return values;
	},
	load:function()
	{
		var args = [];
		if(arguments.length>0)
		{
			if(typeof(arguments[0]) == 'function')
			{
				arguments[0].call(this);
			}
			else
			{
				var length = arguments.length;
				if(typeof(arguments[arguments.length - 1]) == 'function')
				{
					length--;
				}
				if(typeof(arguments[0]) == 'object' && arguments[0].length && typeof(arguments[0][0]) == 'object' && arguments[0][0].length)
				{
					var args = arguments;
					var newArgs = args[0].splice(0,1)[0];
					if(args[0].length > 0)
					{
						newArgs.push(function(){
							AV.load(args[0], args[1]);
						});
					}
					else
					{
						newArgs.push(args[1]);
					}
					AV.load.apply(this, newArgs);
					return;
				}
				
				for(var i = 0; i < length; i++)
				{
					if(typeof(arguments[i]) == 'string')
					{
						args[i] = AV.getComponentURL(arguments[i]);
						args[i].name = arguments[i];
						if(!AV.allLinks[args[i].path])
						{
							if(args[i].type == 'module')
							{
								var parts = arguments[i].split('.');
								var files = [];
								
								for(var j = 0; j < parts.length - 1; j++)
								{
									var file = parts.slice(0, j+1).join('.');
									var url2 = AV.getComponentURL(file);
									if(!AV.allLinks[url2.path] || AV.allLinks[url2.path]<2)
									{
										files.push(file);
									}
								}
								if(files.length > 0)
								{
									var thisPath = arguments[i];
									files.push(function(){AV.load(thisPath)});
									AV.load.apply(this, files);
									continue;
								}
							}
							var currentArg = args[i];
							AV.read(args[i].path, function(){
								switch(currentArg.type)
								{
									case 'package':
										Lang.$import(currentArg.packagePath + 'languages/'+AV.language+'.js');
										if(AV[currentArg.name] && typeof(AV[currentArg.name].init) == 'function')
										{
											AV[currentArg.name].init();
										}
										break;
								}
							});
						}
					}
				}
				if(typeof(arguments[length]) == 'function')
				{
					var oldArgs = arguments;
					
					AV.ExecQueue.add(function(){
						oldArgs[length].call(this);
					},function(){
						for(var i = 0; i < length; i ++)
						{
							
							if(!AV.allLinks[args[i].path] || AV.allLinks[args[i].path] < 2)
							{
								return false;
							}
							else if(args[i].type == 'module' && args[i].name.substr(0,3) != 'AV.')
							{
								var ok = true;
								try{
									eval('$ok = (typeof(AV.'+args[i].name+') != "undefined");');
								}
								catch(e)
								{
									$ok = false;
								};
								if(!$ok)
								{
									return false;
								}
							}
						}
						return true;
					}, arguments);
				}
			}
		}
	},
	run:function()
	{
		AV.ready(function(){
			AV.read(AV.packagePath+'App.js', function(){
				AV.read(AV.path+'modules/App.js', function(){
					AV.App.init();
					AV.App.run();
				});
			});
		});
	},
	using:function(moduleName, options, success)
	{
		var currentModule = AV.App.currentModule;
		AV.load(moduleName, function(){
			var lastModule = AV.App.currentModule;
			AV.App.currentModule = currentModule;
			eval('var module = new AV.'+moduleName+'();');
			AV.App.currentModule = lastModule;
			module.name = moduleName;
			$.extend(module, options);
			if(module.modules)
			{
				var modules = {};
				module.applyFunction(function(){
					for(var i in this.modules)
					{
						AV.using(this.modules[i].name, $.extend({position:i},this.modules[i]), function(){
							modules[this.position] = 1;
						});
					}
				});
				AV.ExecQueue.add(function(){
					if(module.init)
					{
						module.init();
					}
					if(success)
					{
						success.call(module);
					}
				},function(){
					for(var i in module.modules)
					{
						if(!modules[i])
						{
							return false;
						}
					}
					return true;
				});
				return;
			}
			if(module.init)
			{
				module.init();
			}
			if(success)
			{
				success.call(module);
			}
		});
	},
	dialog:function(moduleName, data)
	{
		var module = $AV(moduleName), id = 'Dialog-'+moduleName.replace(/\./ig,'-');
		if(!module)
		{
			var options = {region:'dialog', position:0};
			if(data)
			{
				options.data = data;
			}
			AV.using(moduleName,{region:'dialog', position:0}, function(){
				if($('#'+id).length == 0)
				{
					$('body').append('<div id="'+id+'" style="width:100%;"></div>');
				}
				else
				{
					$('#'+id).show();
				}
				var moduleContent = this.applyFunction('draw');
				$('#'+id).html('<div id="module-'+this.id+'">'+(moduleContent?moduleContent:'')+'</div>');
			});
		}
		else
		{
			$('#'+id).show();
			if(data)
			{
				module.data = data;
				var moduleContent = module.applyFunction('draw');
				$('#'+id).html('<div id="module-'+module.id+'">'+(moduleContent?moduleContent:'')+'</div>');
			}
			
		}
	},
	extend:function(oldClass, properties)
	{
		var newClass = function()
		{
			if(typeof(oldClass) != 'undefined')
			{
				//this.parent = oldClass.prototype;
				oldClass.apply(this,arguments);
			}
		}
		if(typeof(oldClass) != 'undefined')
		{
			$.extend(newClass.prototype, oldClass.prototype, properties);
		}
		return newClass;
	},
	sizeof:function(obj)
	{
		if(typeof(obj) == 'object')
		{
			var size = 0;
			for(var i in obj)
			{
				if(typeof(obj[i])!='function')
				{
					size ++;
				}
			}
			return parseInt(size);
		}
		else
		if(typeof(obj.length) != 'undefined')
		{
			return obj.length;
		}
		return 0;
	},
	alert:function(message, options)
	{
		alert(message);
	},
	
	numberFormat: function(number, decimals, dec_point, thousands_sep ) {
		if(number && parseInt(number) != 'NAN')
		{
			var round = Math.round(number);
			var st = '';
			while(round > 0)
			{
				st = (round % 1000) + (st?','+st:number - Math.round(number));
				round = Math.round(round/1000);
			}
			return st;
		}
		if(number == 0)
		{
			return 0;
		}
		return number;
	},
	clientWidth: function(){
		if(this.oldClientWidth)
		{
			return this.oldClientWidth;
		}
		var myWidth = 0;
		if( typeof( window.innerWidth ) == 'number' ) {
		//Non-IE
			myWidth = window.innerWidth;
		
		} else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
		//IE 6+ in 'standards compliant mode'
			myWidth = document.documentElement.clientWidth;
		} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
		//IE 4 compatible
			myWidth = document.body.clientWidth;
		}
		return myWidth;
	},
	clientHeight: function(){
		if(this.oldClientHeight)
		{
			return this.oldClientHeight;
		}
		var myHeight = 0;
		if( typeof( window.innerWidth ) == 'number' ) {
		//Non-IE
			myHeight = window.innerHeight;
		} else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
		//IE 6+ in 'standards compliant mode'
			myHeight = document.documentElement.clientHeight;
		} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
		//IE 4 compatible
			myHeight = document.body.clientHeight;
		}
		return myHeight;
	}
	
}, ReadyObject, {
	init:function()
	{
		var pathname = location.pathname;
		var path = pathname.split('/');
		AV.path = path.slice(0, path.length-1).join('/')+'/';
		AV.packagePath = path.slice(0, path.length-2).join('/')+'/';
		AV.appName = path[path.length - 2];
		AV.rootURL = pathname.substr(0, pathname.indexOf('/apps/')+1);
		AV.fileName = path[path.length - 1];
		if(typeof(AV.allLinks) == 'undefined')
		{
			AV.allLinks = {};
			AV.allLinks[AV.rootURL+'3rdparty/jQuery/jquery-1.3.2.min.js'] = 2;
			AV.allLinks[AV.rootURL+'packages/AV/modules/AV.js'] = 2;
			var loader = jQuery('<div id="loader"><img src="'+AV.rootURL+'/packages/AV/images/loading.gif" alt="loading..." /></div>')
				.css({position: "absolute", top: "1em", left: "1em"})
				.appendTo("body")
				.hide();
			jQuery().ajaxStart(function() {
				loader.show();
			}).ajaxStop(function() {
				loader.hide();
			}).ajaxError(function(a, b, e) {
				throw e;
			});
			AV.load(
				'3rdparty/jQuery/jquery.cookie.js',
				'3rdparty/jQuery/json/jquery.json.min.js',				
				'AV.App',
				'AV.Module',
				'AV.Data',
				'AV.Lang',
				'AV.Options',
				'3rdparty/jQuery/pureJSTemplate.js', function(){
					$.fn.pureJSTemplate.setDelimiters("<.", ".>");
					AV.isReady = true;
				}
			);
		}
		$(window).resize(function(){
			AV.oldClientWidth = 0;
			AV.oldClientHeight = 0;
		});
	}
});
AV.ExecQueue = {
	queue:[],
	isRunning:false,
	interval:false,
	run:function()
	{
		if(!this.interval)
		{
			this.interval = setInterval(this.intervalFunction, 10);
		}
	},
	intervalFunction: function(){
		if(!AV.ExecQueue.isRunning)
		{
			AV.ExecQueue.isRunning = true;
			for(var i = 0; i < AV.ExecQueue.queue.length; i++)
			{
				if((AV.ExecQueue.queue[i].isLoop || !AV.ExecQueue.queue[i].isCalled) && AV.ExecQueue.queue[i].condition.call(AV.ExecQueue.queue[i].context))
				{
					AV.ExecQueue.queue[i].isCalled = true;
					AV.ExecQueue.queue[i].callback.call(AV.ExecQueue.queue[i].context);
				}
			}
			var i = 0; 
			while(i < AV.ExecQueue.queue.length)
			{
				if(AV.ExecQueue.queue[i].isCalled && !AV.ExecQueue.queue[i].isLoop)
				{
					AV.ExecQueue.queue.splice(i, 1);
				}
				else
				{
					i ++;
				}
			}
			if(AV.ExecQueue.queue.length == 0)
			{
				clearInterval(AV.ExecQueue.interval);
				AV.ExecQueue.interval = false;
			}
			AV.ExecQueue.isRunning = false;
		}
	},
	add:function(callback, condition, context, isLoop)
	{
		this.queue.push({
			callback : callback,
			condition : condition,
			context:context,
			isLoop : isLoop?true:false,
			isCalled : false
		});
		if(!this.interval)
		{
			this.run();
		}
	}
};
elem = AV.elem;
AV.init();