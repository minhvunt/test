/*
 * jQuery Horizon Menu Plugin - A little solution for menus and paging for jQuery.
 *
 *	Author: Lander Ontoria <lander@irontec.com>, http://www.irontec.com , http://code.irontec.com
 *  
 * With special thanks Jabi Infante <jabi@irontec.com> (who started the first version of this plugin to work).
 * 
 * Website: http://code.irontec.com/jQuery/HorizonMenu
 *	
 * Copyright (c) 2008 Lander Ontoria <lander@irontec.com>, http://www.irontec.com
 * 
 * version 1.5 (24/04/2008)
 */

(function($) {
    $.fn.supermenu = function(options) {
			var settings = {
          		updateInterval : 100,
          		selected : false,
          		selectedClass : '',
          		oClass: ''
         	};
        	if(options)	$.extend(settings, options); 
			return this.each(function(a) {
				var self = this;
				var s = settings;
				this.s = s;
				$(this).wrap('<div class="supermenu'+s.oClass+'"></div>').css("left","0px");
				self.ulw = 0;				
				self.divw = $(this).parent(".supermenu"+s.oClass)[0].offsetWidth;
				self.initw = self.divw; 
				marg = (self.initw/3);
				if (s.selected) {
					var initialScroll = 0;
					var initialIndex = 0;
					var FoundClass = false;
				} 
				ali = [];
				$("li",$(this)).each(function(i) {
					if ((s.selected) && (!FoundClass)) {
						initialScroll = self.ulw; 
						initialIndex = i;
						if (($(this).attr("class")) && ($(this).attr("class").indexOf(s.selectedClass)!=-1)) {
							FoundClass = true;
						}
					}
					ali[i] = $(this)[0].offsetWidth+parseInt($(this).css("marginLeft"))+parseInt($(this).css("marginRight"));
					self.ulw += $(this)[0].offsetWidth+parseInt($(this).css("marginLeft"))+parseInt($(this).css("marginRight"));				
				});
				
				
				if (s.selected) {
					if (self.ulw-initialScroll<self.divw) {
						if ((initialScroll+marg)>(self.ulw-marg)){
							initialScroll = initialScroll - (self.divw - (self.ulw-initialScroll));
						}else{
						initialScroll = (initialScroll -marg);
						}
					}else	if (initialScroll< (self.initw/2)) {
						initialScroll=0;
					}else{
						initialScroll=initialScroll-marg;;					
					}
					$(this).css("left",(initialScroll*-1)+"px");
				}
				
				//$(this).css("width",self.ulw+"px");
				
				$.fn["right"] = function(fn){
          		return fn ? this.bind("right", fn) : this.trigger("right");
          	}
				$.fn["left"] = function(fn){
          		return fn ? this.bind("left", fn) : this.trigger("left");
          	}
				$(this)["left"](function(e,offset) {
					if (self.divw>=self.ulw) return;
        			var curLeft = parseFloat($(self).css("left"));
					var newLeft = ((curLeft+offset)>0)? 0:curLeft+offset;
					$(self).css("left",newLeft);
					return $(this);
				});		
				$(this)["right"](function(e,offset) {
					if (self.divw>=self.ulw) return;
        			var curLeft = parseFloat($(self).css("left"));
					var newLeft = (Math.abs(curLeft-offset)>(self.ulw-self.divw))? (self.ulw-self.divw)*(-1):curLeft-offset;
					$(self).css("left",newLeft);
					return $(this);
				});	
				return $(this);
			});   	
       return $(this); 	
	};
})(jQuery);