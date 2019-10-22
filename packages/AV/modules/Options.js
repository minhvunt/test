AV.Options = {
	definitions:
	{
		language:'vi' //lưu ngôn ngữ, mặc định là tiếng việt 
	},
	
	save: function()
	{
		for(var i in this.definitions)
		{
			if(typeof[this.definitions[i]] == 'object')
			{
				AV.cookie(i, $.toJSON(this[i]));
			}
			else
			{
				AV.cookie(i, this[i]);
			}
		}
	},
	load: function()
	{
		for(var i in this.definitions)
		{
			if(typeof[this.definitions[i]] == 'object')
			{
				var value = $.evalJSON(AV.cookie(i));
			}
			else
			{
				var value = AV.cookie(i);
			}
			this[i] = (value == null)?this.definitions[i]:value;
			AV.cookie(i, null);
		}
	}
};
window.onbeforeunload = confirmExit;
function confirmExit()
{
	AV.Options.save();
}
