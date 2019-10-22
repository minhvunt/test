try { document.execCommand('BackgroundImageCache', false, true); } catch (e) { }

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
    modules: {},
    UITheme: 'stockboard',
    oldHash: location.hash,
    hashs: {},
    version: 1.4,
    elems: {},
    innerText: 'textContent',
    ajaxIndicator: false,
    allOrderedLinks: [],
    cookie: function (name, value) {
        if (typeof (value) != 'undefined') {
            jQuery.cookie(name, value, { expires: 10000, path: AV.path });
        }
        else {
            return jQuery.cookie(name);
        }
    },
    rpc: function (url, success) {
        this.load('3rdparty/jQuery/jquery.rpc.js');
        return $.rpc(
            url /* rpc server */
            , "xml" /* say that our server is xml */
            , function (server) {
                success.call(this);
            }
        );
    },
    call: function (url, method, params, callback) {
        this.load('3rdparty/jQuery/jqSOAPClient.beta.js', function () {
            var soapBody = new SOAPObject(method);
            if (typeof (params) == 'object') {
                var parts = [];
                for (var i in params) {
                    parts.push({ name: i, value: params[i] });
                }
                for (var i = parts.length - 1; i >= 0; i--) {
                    soapBody.attr(parts[i].name, parts[i].value);
                }
            }
            var sr = new SOAPRequest(method, soapBody);
            SOAPClient.Proxy = url;
            SOAPClient.SendRequest(sr, callback);
        });
    },
    elem: function (id) {
        var elem = AV.elems[id];
        if (!elem) {
            return (AV.elems[id] = document.getElementById(id));
        }
        return elem;
    },
    sizeof: function (obj) {
        if (typeof (obj) == 'object') {
            if (obj.length) return obj.length;
            var size = 0;
            for (var i in obj) {
                if (typeof (obj[i]) != 'function') {
                    size++;
                }
            }
            return parseInt(size);
        }
        else
            if (typeof (obj.length) != 'undefined') {
                return obj.length;
            }
        return 0;
    },
    xml: function (fn, path) {
        return AV.xmlToJson($(path, AV.read(fn, { dataType: 'xml', async: false })));
    },
    xmlToJson: function (xmlNode, parentNode) {
        var result = {}, count = 0, isArray = false;
        if (xmlNode.children) {
            xmlNode.children().each(function () {
                var children = $(this).children(), key;
                if (count == 0 && typeof (result[this.tagName]) == 'undefined' && !isArray) {
                    if (typeof (parentNode) != 'undefined' && parentNode == this.tagName + 's') {
                        key = 0;
                        isArray = true;
                        result = [];
                    }
                    else {
                        key = this.tagName;
                    }
                }
                else {
                    if (count == 0 && typeof (result[this.tagName]) != 'undefined') {
                        result = [result[this.tagName]];
                    }
                    key = ++count;
                }
                if (children.length > 0) {
                    result[key] = AV.xmlToJson($(this), key);
                }
                else {
                    result[key] = $(this).text();
                }
                children = null;
                //result[key]._index = count;
            });
        }
        else {
            return xmlNode;
        }
        return result;
    },
    template: function (id, data) {
        return $.fn.pureJSTemplate({
            id: id,
            data: data
        });
    },
    request: function (param, defaultValue) {
        if (typeof (defaultValue) == 'undefined') {
            defaultValue = '';
        }
        var regex = '[?&]' + param + '=([^&#]*)';
        var results = (new RegExp(regex)).exec(location.href);
        if (results) return results[1];
        return defaultValue;
    },
    buildURL: function (options, urlMode) {
        var url = '?';
        for (var i in options) {
            url += '&' + i + '=' + encodeURI(options[i]);
        }
        return url;
    },
    read: function (fileName, options, func) {
        if (!fileName) return;

        if (typeof (options) == 'function') {
            func = options;
            options = {};
        }
        if (AV.allLinks[fileName]) {
            if (func) func.call(this);
            return;
        }
        if (!options) {
            options = {};
        }
        if (!options.dataType) {
            options.dataType = 'html';
        }
        if (fileName.indexOf('http://') != -1 && fileName.indexOf('.js') != -1) {
            $('body').append('<' + 'script src="' + fileName + '"><' + '/script>');
            AV.allLinks[fileName] = 2;
            AV.allOrderedLinks.push(fileName);
        }
        else {
            if (fileName.indexOf('http://') == 0 && fileName.indexOf(location.host) == -1) {
                fileName = /*AV.rootURL + 'get.php?url='+ */encodeURIComponent(fileName);
            }
            if (fileName.indexOf('.css') != -1) {
                $('body').append('<link rel="stylesheet" type="text/css" href="' + fileName + '">');
                AV.allLinks[fileName] = 2;
                AV.allOrderedLinks.push(fileName);
                return;
            }
            if (fileName.indexOf('.js') != -1 && navigator.userAgent.toLowerCase().indexOf('chrome') == -1 && navigator.userAgent.toLowerCase().indexOf('safari') == -1 && navigator.userAgent.toLowerCase().indexOf('mozilla/5.0') == -1) {
                var node = document.createElement('SCRIPT');
                node.src = fileName;
                //node.text = 'AV.allLinks["'+fileName+'"] = 2; AV.allOrderedLinks.push("'+fileName+'");';
                document.body.appendChild(node);
                //if($.browser.msie)
                //{
                //	AV.ExecQueue.add(function(){
                //		AV.allLinks[fileName] = 2; 
                //		AV.allOrderedLinks.push(fileName);
                //		if(func) func.call(this);
                //	}, function(){
                //		return node.readyState == 'complete' || node.readyState == 'loaded';
                //	});
                //}
                //else
                //{
                var node2 = document.createElement('SCRIPT');
                node2.text = 'AV.allLinks["' + fileName + '"] = 2; AV.allOrderedLinks.push("' + fileName + '");';
                document.body.appendChild(node2);
                if (func)
                    AV.ExecQueue.add(function () {
                        func.call(this);
                    }, function () {
                        return AV.allLinks[fileName] >= 2;
                    });
                //}

                //$('body').append('<'+'script src="'+fileName+'"></'+'script><'+'script>AV.allLinks["'+fileName+'"] = 2; AV.allOrderedLinks.push("'+fileName+'");<'+'/script>');

                return;
            }
            var returnValue = '';
            AV.allLinks[fileName] = 1;
            $.ajax($.extend({
                url: fileName + (/\?/.test(fileName) ? '&' : '?') + 'v=' + AV.version,
                cache: true,
                success: function (data) {
                    if (options.dataType == 'html') {
                        if (fileName.indexOf('.css') != -1) {
                            var parts = fileName.split('/');
                            parts.splice(parts.length - 1, 1);
                            parts = parts.join('/') + '/';
                            data = data.replace(/url\s*\(\s*(["']?)/gi, 'url($1' + parts);
                            $('body').append('<style>' + data + '</style>');
                        }
                        else if (fileName.indexOf('.js') != -1) {
                            //console.log(fileName);
                            //try {
                            eval(data);
                            //} catch (e) {}
                        }
                    }
                    else {
                        returnValue = data;
                    }
                    AV.allLinks[fileName] = 2;
                    //					alert(fileName);
                    AV.allOrderedLinks.push(fileName);
                    if (func) {
                        func.call(this, data);
                    }
                }
            }, options));
            return returnValue;
        }
    },
    getComponentURL: function (url) {
        var values = { name: url, path: '', type: '' };
        if (url.indexOf('http://') != -1) {
            values.path = AV.rootURL + 'get.php?url=' + encodeURI(url);
            values.type = 'cross-domain';
        }
        else if (url.indexOf('3rdparty') != -1) {
            values.path = AV.rootURL + url;
            values.type = '3rdparty';
        }
        else if (url.indexOf('.') != -1) {
            var parts = url.split('.');
            values.package = parts[0];
            parts.shift();

            values.path = AV.rootURL + 'packages/' + values.package + '/' + parts.join('.') + '.js';
            values.type = 'module';
        }
        else {
            values.packagePath = AV.rootURL + 'packages/' + url + '/';
            values.path = values.packagePath + url + '.js';
            values.type = 'package';

        }
        return values;
    },
    load: function () {
        var args = [];
        if (arguments.length > 0) {
            if (typeof (arguments[0]) == 'function') {
                arguments[0].call(this);
            }
            else {
                var length = arguments.length;
                if (typeof (arguments[arguments.length - 1]) == 'function') {
                    length--;
                }
                if (typeof (arguments[0]) == 'object' && arguments[0].length && typeof (arguments[0][0]) == 'object' && arguments[0][0].length) {
                    var args = arguments;
                    var newArgs = args[0].splice(0, 1)[0];
                    if (args[0].length > 0) {
                        newArgs.push(function () {
                            AV.load(args[0], args[1]);
                        });
                    }
                    else {
                        newArgs.push(args[1]);
                    }
                    AV.load.apply(this, newArgs);
                    return;
                }

                for (var i = 0; i < length; i++) {
                    if (typeof (arguments[i]) == 'string') {
                        args[i] = AV.getComponentURL(arguments[i]);

                        if (!AV.allLinks[args[i].path]) {
                            var currentArg = args[i];
                            if (args[i].type == 'module') {
                                var parts = arguments[i].split('.');
                                var files = [];

                                for (var j = 0; j < parts.length - 1; j++) {
                                    var file = parts.slice(0, j + 1).join('.');
                                    var url2 = AV.getComponentURL(file);
                                    if (!AV.allLinks[url2.path] || AV.allLinks[url2.path] < 2) {
                                        files.push(file);
                                        //files.push(url2.packagePath + 'languages/'+AV.Options.language+'.js');
                                    }
                                }
                                if (files.length > 0) {
                                    //alert('Load package '+parts[0]+' before module '+parts[1]+':'+files);
                                    var thisPath = arguments[i];
                                    files.push(function () { AV.load(thisPath) });
                                    AV.load.apply(this, files);
                                    continue;
                                }
                            }
							/*else if(args[i].type == 'package')
							{
								var language = $.cookie('language');
								var lfn = currentArg.packagePath + 'languages/'+(language?language.replace('"','').replace('"',''):'vi')+'.js';
								
								if(!AV.allLinks[lfn] || AV.allLinks[lfn]<2)
								{
									AV.read(lfn);		  
								}
							}*/

                            AV.read(args[i].path, function () {
                                switch (currentArg.type) {
                                    case 'package':
                                        //AV.read(currentArg.packagePath + 'languages/'+AV.Options.language+'.js', function(){
                                        if (AV[currentArg.name] && typeof (AV[currentArg.name].init) == 'function') {
                                            AV[currentArg.name].init();
                                        }
                                        //});
                                        break;
                                }
                            });
                        }
                    }
                }
                if (typeof (arguments[length]) == 'function') {
                    var oldArgs = arguments;

                    AV.ExecQueue.add(function () {
                        oldArgs[length].call(this);
                    }, function () {
                        for (var i = 0; i < length; i++) {

                            if (!AV.allLinks[args[i].path] || AV.allLinks[args[i].path] < 2) {
                                return false;
                            }
                            else if (args[i].type == 'module' || args[i].type == 'package') {
                                var ok = true;
                                try {
                                    eval('$ok = (typeof(AV.' + args[i].name + ') != "undefined");');
                                }
                                catch (e) {
                                    $ok = false;
                                };
                                if (!$ok) {
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
    run: function () {
        AV.ready(function () {
            AV.read(AV.packagePath + 'App.js', function () {
                AV.read(AV.path + 'App.js', function () {
                    AV.App.init();
                    AV.App.run();
                });
            });
        });
    },
    using: function (moduleName, options, success) {
        var currentModule = AV.App.currentModule;
        AV.load(moduleName, function () {
            var lastModule = AV.App.currentModule;
            AV.App.currentModule = currentModule;
            eval('var module = new AV.' + moduleName + '();');
            AV.App.currentModule = lastModule;
            module.name = moduleName;
            $.extend(module, options);
            if (module.modules) {
                var modules = {};
                module.applyFunction(function () {
                    for (var i in this.modules) {
                        AV.using(this.modules[i].name, $.extend({ position: i }, this.modules[i]), function () {
                            modules[this.position] = 1;
                        });
                    }
                });
                AV.ExecQueue.add(function () {
                    if (module.init) {
                        module.init();
                    }
                    if (success) {
                        success.call(module);
                    }
                }, function () {
                    for (var i in module.modules) {
                        if (!modules[i]) {
                            return false;
                        }
                    }
                    return true;
                });
                return;
            }
            if (module.init) {
                module.init();
            }
            if (success) {
                success.call(module);
            }
        });
    },
    dialog: function (moduleName, data, reload) {
        var module = $AV(moduleName), id = 'Dialog-' + moduleName.replace(/\./ig, '-');
        if (!module) {
            var options = { region: 'dialog', position: 0 };
            if (data) {
                $.extend(options, data);
            }
            AV.using(moduleName, options, function () {
                if ($('#' + id).length == 0) {
                    $('body').append('<div id="' + id + '" style="width:100%;"></div>');
                }
                else {
                    $('#' + id).show();
                }
                var moduleContent = this.applyFunction('draw');
                $('#' + id).html('<div id="module-' + this.id + '">' + (moduleContent ? moduleContent : '') + '</div>');
                if (typeof (this.onOpen) == 'function') this.onOpen();
            });
        }
        else {
            if (data) {
                $.extend(module, data);
            }
            $('#' + id).show();
            if (reload || $('#' + id).html() == '') {
                var moduleContent = module.applyFunction('draw');
                $('#' + id).html('<div id="module-' + module.id + '">' + (moduleContent ? moduleContent : '') + '</div>');
            }
            if (typeof (module.onOpen) == 'function') module.onOpen();
        }
    },
    extend: function (oldClass, properties) {
        var newClass = function () {
            if (typeof (oldClass) != 'undefined') {
                //this.parent = oldClass.prototype;
                oldClass.apply(this, arguments);
            }
        }
        if (typeof (oldClass) != 'undefined') {
            $.extend(newClass.prototype, oldClass.prototype, properties);
        }
        return newClass;
    },
    sizeof: function (obj) {
        if (typeof (obj) == 'object') {
            var size = 0;
            for (var i in obj) {
                if (typeof (obj[i]) != 'function') {
                    size++;
                }
            }
            return parseInt(size);
        }
        else
            if (typeof (obj.length) != 'undefined') {
                return obj.length;
            }
        return 0;
    },
    alert: function (message, options) {
        //alert(message);
        AV.load('3rdparty/jQuery/jGrowl/jquery.jgrowl.css');
        AV.load('3rdparty/jQuery/jGrowl/jquery.jgrowl_minimized.js', function () {
            $.jGrowl(message, options);
        });
    },
    log: function (content) {
        if (typeof (console) != 'undefined') {
            console.log(content);
        }
        else {
            if (!$('#log-content').length) {
                $('body').append('<div id="log-content"></div>');
            }
            $('#log-content').append((typeof (content) == 'object') ? $.toJSON(content) : content);
        }
    },
    numberFormat: function (number, decimals, dec_point, thousands_sep) {
        if (number && number != 'ATC' && number != 'ATO') {
            var abs = Math.abs(number);
            if (!(abs >= 0)) return 0;
            var round = Math.floor(abs), frac = Math.abs(Math.round(abs * 100) - round * 100) / 100;

            if (frac) {
                frac = frac.toString().substr(1, 3);
                if (frac[2] == '0') {
                    frac = frac.substr(0, 2);
                }
            }
            var st = '', lastRound = -1;

            do {

                if (lastRound != -1) {
                    if (lastRound < 10) st = '00' + st;
                    else if (parseInt(lastRound) < 100) st = '0' + st.toString();
                }
                lastRound = round % 1000;
                st = lastRound + (st ? ',' + st : frac);

                round = Math.floor(round / 1000);

            }
            while (round > 0);
            if (number < 0) return '-' + st;

            return st;
        }
        if (number == 0) {
            return 0;
        }
        if (typeof (number) == 'undefined') {
            return 0;
        }
        return number;
    },
    weightFormat: function (number) {
        var s = 1;
        if (number == 0)
            return '';

        var value = AV.numberFormat(Math.round(number * 10)) + "";
        if (value)
            return value.substr(0, value.length - 1);
        else
            return value;
    },
    getParameter: function (queryString, parameterName) {
        // Add "=" to the parameter name (i.e. parameterName=value)
        var parameterName = parameterName + "=";
        if (queryString.length > 0) {
            // Find the beginning of the string
            begin = queryString.indexOf(parameterName);
            // If the parameter name is not found, skip it, otherwise return the value
            if (begin != -1) {
                // Add the length (integer) to the beginning
                begin += parameterName.length;
                // Multiple parameters are separated by the "&" sign
                end = queryString.indexOf("&", begin);
                if (end == -1) {
                    end = queryString.length
                }
                // Return the string
                return unescape(queryString.substring(begin, end)).replace('#', '');
            }
            // Return "null" if no parameter has been found
            return "null";
        }
    },

    clientWidth: function () {
        if (this.oldClientWidth) {
            return this.oldClientWidth;
        }
        var myWidth = 0;
        if (typeof (window.innerWidth) == 'number') {
            //Non-IE
            myWidth = window.innerWidth;

        } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
            //IE 6+ in 'standards compliant mode'
            myWidth = document.documentElement.clientWidth;
        } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
            //IE 4 compatible
            myWidth = document.body.clientWidth;
        }
        this.oldClientWidth = myWidth;
        return myWidth;
    },
    clientHeight: function () {
        if (AV.oldClientHeight) {
            return AV.oldClientHeight;
        }
        var myHeight = 0;
        if (typeof (window.innerWidth) == 'number') {
            //Non-IE
            myHeight = window.innerHeight;
        } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
            //IE 6+ in 'standards compliant mode'
            myHeight = document.documentElement.clientHeight;
        } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
            //IE 4 compatible
            myHeight = document.body.clientHeight;
        }
        AV.oldClientHeight = myHeight;
        return myHeight;
    },
    makeCache: function (pageName) {
        var allLinks = {};
        for (var i in AV.allOrderedLinks) {
            allLinks['links[' + i + ']'] = AV.allOrderedLinks[i];
        }
        allLinks.appName = AV.packageApp;
        $.post(AV.rootURL + 'model/makePageCache.php', allLinks);
    },
    resizeFunctions: [],
    resize: function (f) {
        if (f) {
            AV.resizeFunctions.push(f);
        }
        else {
            for (var i = 0, length = AV.resizeFunctions.length; i < length; i++) {
                AV.resizeFunctions[i].call(null);
            }
        }
    },
    ExecQueue: {
        queue: [],
        isRunning: false,
        interval: false,
        run: function () {
            if (!this.interval) {
                this.interval = setInterval(this.intervalFunction, 10);
            }
        },
        intervalFunction: function () {
            if (!AV.ExecQueue.isRunning) {
                AV.ExecQueue.isRunning = true;
                for (var i = 0; i < AV.ExecQueue.queue.length; i++) {
                    if ((AV.ExecQueue.queue[i].isLoop || !AV.ExecQueue.queue[i].isCalled) && AV.ExecQueue.queue[i].condition.call(AV.ExecQueue.queue[i].context)) {
                        AV.ExecQueue.queue[i].isCalled = true;
                        AV.ExecQueue.queue[i].callback.call(AV.ExecQueue.queue[i].context);
                    }
                }
                var i = 0;
                while (i < AV.ExecQueue.queue.length) {
                    if (AV.ExecQueue.queue[i].isCalled && !AV.ExecQueue.queue[i].isLoop) {
                        AV.ExecQueue.queue.splice(i, 1);
                    }
                    else {
                        i++;
                    }
                }
                if (AV.ExecQueue.queue.length == 0) {
                    clearInterval(AV.ExecQueue.interval);
                    AV.ExecQueue.interval = false;
                }
                AV.ExecQueue.isRunning = false;
            }
        },
        add: function (callback, condition, context, isLoop) {
            if (condition.call(context)) {
                callback.call(context);
            }
            else {
                this.queue.push({
                    callback: callback,
                    condition: condition,
                    context: context,
                    isLoop: isLoop ? true : false,
                    isCalled: false
                });
                if (!this.interval) {
                    this.run();
                }
            }
        }
    },
    Options: {
        definitions:
        {
            language: 'vi' //lưu ngôn ngữ, mặc định là tiếng việt 
        },

        save: function (name, value) {
            if (typeof (name) != 'undefined') {
                if (typeof (value) != 'undefined') {
                    this[name] = value;
                }
                if (typeof [this.definitions[name]] == 'object' || typeof [this.definitions[name]] == 'array') {
                    AV.cookie(name, $.toJSON(this[name]));
                }
                else {
                    AV.cookie(name, this[name]);
                }
                return;
            }
            for (var i in this.definitions) {
                if (typeof [this.definitions[i]] == 'object' || typeof [this.definitions[i]] == 'array') {
                    AV.cookie(i, $.toJSON(this[i], {}));
                }
                else {
                    AV.cookie(i, this[i]);
                }
            }
        },
        load: function () {
            for (var i in this.definitions) {
                var value = null;
                if (AV.cookie(i)) {
                    if (typeof [this.definitions[i]] == 'object' || typeof [this.definitions[i]] == 'array') {
                        if (typeof ($.evalJSON) != 'undefined') {
                            value = $.evalJSON(AV.cookie(i));
                        }
                    }
                    else {
                        value = AV.cookie(i);
                    }
                }
                this[i] = (value == null) ? this.definitions[i] : value;
                //AV.cookie(i, null);
            }
            /*
			if(!AV.Options.hideColumns)
			{
				AV.Options.hideColumns = this.definitions.hideColumns;
			}
            */
        }
    },
    Data: {
        schema: {},
        addSchema: function (name, serviceURL) {
            var parts = name.split('.');
            var obj = AV.Data;
            for (var i = 0; i < parts.length - 1; i++) {
                if (typeof (obj[parts[i]]) == 'undefined') {
                    obj[parts[i]] = {};
                }
                obj = obj[parts[i]];
            }
            obj[parts[parts.length - 1]] = this.schema[name] = function (params, success) {
                AV.call(serviceURL, name, params, success);
            };
        }
    },
    App: $.extend({
        layout: '',
        skin: '',
        version: '1.0',
        modules: {},
        currentPage: false,
        maxModuleId: 0,
        currentModule: null,
        configPath: 'config.xml',
        run: function () {
            $.extend(AV.App, AV.xml(AV.path + this.configPath, 'root'));
            AV.Options.load();
            if (AV.App.isGoLive == '1') {
                AV.read(AV.path + AV.App.layout + '.html', { async: false }, function (data) { $('body').append(data); });
            }
            var parts = location.pathname.split('/');
            this.pageName = parts[parts.length - 1].replace(/\.html/i, '');
            if (!this.pageName) this.pageName = 'index';
            this.ready(function () {

                AV.App.loadPage(AV.App.pageName);
            });
        },
        loadPage: function (page) {
            this.currentPage = AV.xml(AV.path + 'pages/' + page + '.xml', 'page');
            if (!(this.pageLayout = this.currentPage.layout)) {
                this.pageLayout = 'Default';
            }
            var modules = {};

            for (var i in this.currentPage.modules) {
                if (typeof (this.currentPage.modules[i]) == 'object') {
                    AV.using(this.currentPage.modules[i].name, $.extend({ position: i }, this.currentPage.modules[i]), function () {
                        modules[this.position] = 1;
                    });
                }
            }
            AV.ExecQueue.add(function () {
                AV.App.isReady = true;
                $('body').append(AV.template(AV.App.pageLayout));
            }, function () {
                for (var i in AV.App.currentPage.modules) {
                    if (typeof (AV.App.currentPage.modules[i]) == 'object' && !modules[i]) {

                        return false;
                    }
                }
                return true;
            });
        },
        region: function (region) {
            if (this.currentModule) {
                var parent = this.currentModule;
            }
            else {
                var parent = null;
            }
            var st = '';
            for (var i in this.modules) {
                if (this.modules[i].region == region && ((parent == null && this.modules[i].parent == null) || (parent && this.modules[i].parent && parent.id == this.modules[i].parent.id))) {
                    var moduleContent = this.modules[i].applyFunction('draw');
                    st += '<div id="module-' + this.modules[i].id + '">' + (moduleContent ? moduleContent : '') + '</div>';
                }
            }
            return st;
        },
        image: function (name) {
            return AV.path + 'skins/' + AV.App.skin + '/images/' + name;
        },
        isChild: function (childId, parentId) {
            while (childId != -1) {
                if (childId == parentId) {
                    return true;
                }
                if (AV.App.modules[childId] && AV.App.modules[childId].parent) {
                    childId = AV.App.modules[childId].parent.id;
                }
                else {
                    return false;
                }
            }
            return false;
        }
    }, ReadyObject),
    Module: function () {
        this.id = ++AV.App.maxModuleId;
        AV.App.modules[this.id] = this;
        this.parent = AV.App.currentModule;
    }
}, ReadyObject, {
        init: function () {
            var pathname = location.pathname;
            var path = pathname.split('/');
            AV.path = path.slice(0, path.length - 1).join('/') + '/';
            AV.packagePath = path.slice(0, path.length - 2).join('/') + '/';
            AV.packageApp = path[path.length - 3] + '/' + path[path.length - 2] + '/';
            AV.appName = path[path.length - 2];
            AV.App.layout = AV.App.skin = AV.appName;
            AV.rootURL = pathname.substr(0, pathname.indexOf('/apps/') + 1);
            AV.fileName = path[path.length - 1];
            if (typeof (AV.allLinks) == 'undefined') {
                AV.allLinks = {};
                AV.allLinks[AV.rootURL + '3rdparty/jquery-3.4.1.min.js'] = 2;
                AV.allLinks[AV.rootURL + 'packages/AV.js'] = 2;
                AV.allOrderedLinks.push(AV.rootURL + '3rdparty/jquery-3.4.1.min.js');
                AV.allOrderedLinks.push(AV.rootURL + 'packages/AV.js');
                var loader = jQuery('<div id="loader"><img src="' + AV.rootURL + 'packages/loading.gif" alt="loading..." /></div>')
                    .css({ position: "absolute", top: "1em", left: "1em" })
                    .appendTo("body")
                    .hide();
                jQuery().ajaxStart(function () {
                    //loader.show();
                }).ajaxStop(function () {
                    //loader.hide();
                }).ajaxError(function (a, b, e) {
                    //throw e;
                });
                AV.load(
                    '3rdparty/jQuery/jquery.cookie.js',
                    '3rdparty/jQuery/json/jquery.json.min.js',
                    '3rdparty/jQuery/pureJSTemplate.js', function () {
                        AV.ExecQueue.add(function () {
                            $.fn.pureJSTemplate.setDelimiters("(*", "*)");
                            AV.isReady = true;
                        }, function () { return $.fn.pureJSTemplate; });
                    }
                );
            }
            $(window).resize(function () {
                var oldWidth = AV.oldClientWidth;
                var oldHeight = AV.oldClientHeight;
                AV.oldClientWidth = 0;
                AV.oldClientHeight = 0;
                if (oldWidth != AV.clientWidth() || oldHeight != AV.clientHeight()) {
                    AV.resize();
                }
            });
        },
        Lang: function (word) {
            
            if (typeof (word) == 'string' && typeof (AV.Lang[word]) == 'string') {
                return AV.Lang[word];
            }
            return word;
        }
    });
elem = AV.elem;

$L = Lang = AV.Lang;
$AV = function (name, context) {
    var modules = AV.App.modules, parentId = -1, path = name.split(' ');
    if (path.length > 1) {
        var obj = $AV(path.splice(0, 1), context);
        if (obj) return $AV(path.join(' '), obj);
        return null;
    }
    if (typeof (context) == 'object') {
        parentId = context.id;
    }
    else if (typeof (context) == 'number') {
        parentId = context;
    }
    for (var i in modules) {
        if (modules[i].name == name) {
            if (parentId == -1 || AV.App.isChild(modules[i].id, parentId)) {
                return modules[i];
            }

        }
    }
    return null;
};
$.extend(AV.Module.prototype, {
    $cache: false,
    data: {},
    layout: '',
    applyFunction: function (func) {
        var oldModule = AV.App.currentModule;
        module = AV.App.currentModule = this;
        if (typeof (func) == 'function') {
            var returnValue = func.call(this);
        }
        else {
            var returnValue = this[func]();
        }
        AV.App.currentModule = oldModule;
        return returnValue;
    },

    draw: function () {
        this.ready(function () {
            this.reload();
        });
    },
    reload: function () {
        this.applyFunction(function () {
            if (this.layout) {
                //alert(AV.template(this.layout, this.data));
                this.html(AV.template(this.layout, this.data));
                this.initEvents();
            }
        });
    },
    initEvents: function () {
    },
    $: function () {
        if (this.$cache && this.$cache.length > 0) {
            return this.$cache;
        }
        else {
            this.$cache = $('#module-' + this.id);
            return this.$cache;
        }
    },
    html: function (code) {
        return this.$().html(code);
    },
    append: function (code) {
        return this.$().append(code);
    },
    close: function () {
        $('#Dialog-' + this.name.replace(/\./ig, '-')).hide();
        if (typeof (this.onClose) == 'function') {
            this.onClose();
        }
    }
}, ReadyObject, {
        ready: function (callback) {
            AV.ExecQueue.add(function () { this.applyFunction(callback); }, function () { return this.isReady && this.$().length; }, this);
        }
    });
AV.init();