AV.Data = {
	schema:{},
	addSchema: function(name, serviceURL)
	{
		var parts = name.split('.');
		var obj = AV.Data;
		for(var i = 0; i < parts.length - 1; i++)
		{
			if(typeof(obj[parts[i]]) == 'undefined')
			{
				obj[parts[i]] = {};
			}
			obj = obj[parts[i]];
		}
		obj[parts[parts.length-1]] = this.schema[name] = function(params, success){
			AV.call(serviceURL, name, params, success);
		};
	}
};