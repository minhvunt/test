AV.App = $.extend({
	layout:'TSS',
	skin:'TSS',
	version:'1.0',
	modules:{},
	modules:{},
	currentPage:false,
	maxModuleId:0,
	currentModule:null,
	configPath:'config.xml',
	run:function()
	{
		$.extend(AV.App, AV.xml(AV.path+this.configPath,'root'));
		AV.Options.load();
		var parts = location.pathname.split('/');
		this.pageName = parts[parts.length-1].replace(/\.html/i, '');
		if(!this.pageName) this.pageName='index';
		this.loadPage(this.pageName);
	},
	loadPage:function(page)
	{
		this.currentPage = AV.xml(AV.path+'pages/'+page+'.xml', 'page');
		if(!(this.pageLayout = this.currentPage.layout))
		{
			this.pageLayout = 'Default';
		}
		var modules = {};
		for(var i in this.currentPage.modules)
		{
			AV.using(this.currentPage.modules[i].name, $.extend({position:i},this.currentPage.modules[i]), function(){
				modules[this.position] = 1;
			});
		}
		AV.ExecQueue.add(function(){
			//'<div id="page'+page+'">'+
			//+'</div>'
			AV.App.isReady = true;
			//alert(AV.template(AV.App.pageLayout));
			$('body').append(AV.template(AV.App.pageLayout));
		},function(){
			for(var i in AV.App.currentPage.modules)
			{
				if(!modules[i])
				{
					//alert(i+','+AV.App.currentPage.modules[i].name);
					return false;
				}
			}
			return true;
		});
	},
	region:function(region)
	{
		if(this.currentModule)
		{
			var parent = this.currentModule;
		}
		else
		{
			var parent = null;
		}
		var st = '';
		for(var i in this.modules)
		{
			if(this.modules[i].region == region && ((parent==null && this.modules[i].parent == null) || (parent && this.modules[i].parent && parent.id == this.modules[i].parent.id)))
			{
				var moduleContent = this.modules[i].applyFunction('draw');
				st += '<div id="module-'+this.modules[i].id+'">'+(moduleContent?moduleContent:'')+'</div>';
			}
		}
		return st;
	},
	image: function(name)
	{
		return AV.path+'skins/'+this.skin+'/images/'+name;
	}
}, ReadyObject);
$AV = function(name)
{
	var modules = AV.App.modules;
	for(var i in modules)
	{
		if(modules[i].name == name)
		{
			return modules[i];
		}
	}
	return null;
};