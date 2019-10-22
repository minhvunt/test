AV.Module = function(){
	this.id = ++AV.App.maxModuleId;
	AV.App.modules[this.id] = this;
	this.parent = AV.App.currentModule;
};
$.extend(AV.Module.prototype,{
	$cache:false,
	data:{},
	layout:'',
	applyFunction:function(func){
		var oldModule = AV.App.currentModule;
		AV.App.currentModule = this;
		if(typeof(func) == 'function')
		{
			var returnValue = func.call(this);
		}
		else
		{
			var returnValue = this[func]();
		}
		AV.App.currentModule = oldModule;
		return returnValue;
	},
	
	draw: function(){
		this.ready(function(){
			this.reload();
		});
	},
	reload: function()
	{
		this.applyFunction(function(){
			if(this.layout)
			{
				this.html(AV.template(this.layout, this.data));
				this.initEvents();
			}
		});
	},
	initEvents: function(){
	},
	$: function()
	{
		if(this.$cache && this.$cache.length > 0)
		{
			return this.$cache;
		}
		else
		{
			this.$cache = $('#module-'+this.id);
			return this.$cache;
		}
	},
	html: function(code)
	{
		return this.$().html(code);
	},
	append: function(code)
	{
		return this.$().append(code);
	},
	close:function()
	{
		$('#Dialog-'+this.name.replace(/\./ig,'-')).hide();
	}
}, ReadyObject, {
	ready:function(callback)
	{
		AV.ExecQueue.add(function(){this.applyFunction(callback);}, function(){return this.isReady;}, this);
	}
});