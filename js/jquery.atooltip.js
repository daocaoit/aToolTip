/*
	jQuery Version:				jQuery 1.9.1
	Plugin Name:				atooltip V 1.6
	Plugin by: 					Ara Abcarians: http://ara-abcarians.com
    update by:                  daocaoit:http://asura.im <hiro@ecdo.cc> 2013-4-8
	License:					aToolTip is licensed under a Creative Commons Attribution 3.0 Unported License
								Read more about this license at --> http://creativecommons.org/licenses/by/3.0/
*/

/*
本来想fork出来进行部分优化
但是实在忍受不了这个插件原有的一些参数命名以及处理方法
故而直接在此基础上进行部分重新开发和改造
重新命名atooltip
*/

(function($) {
    $.fn.atooltip = function(options) {
    	/**
    		setup default settings
    	*/
    	var defaults = {
    		// no need to change/override
    		closeBtnClass: 'closeBtn',
    		tipId: 'atooltip_',
    		// ok to override
    		fixed: true,
    		clickOpen: false,
            closeBlur:false,
    		inSpeed: 150,
    		outSpeed: 150,
    		tipContent: '',
    		tipClass: 'defaultTheme',
            position:'above', //above or under
    		xOffset: 0,
    		yOffset: 5,
    		onShow: null,
    		onHide: null
    	},
    	settings = $.extend({}, defaults, options);
        
		return this.each(function() {
			var obj = $(this);
			/**
				Decide weather to use a title attr as the tooltip content
                tipContent first
			*/
            if(settings.tipContent){
                var tipContent = settings.tipContent;
            }else if(obj.attr('title')){
                var tipContent = obj.attr('title');	 
            }
			
            var newTip = settings.tipId+obj.attr('id');
            
			/**
				Build the markup for atooltip
			*/
			var buildAtooltip = function(tipid){
                var tipid = tipid || newTip;
                
                obj.attr({title: ''});
                obj.addClass('actAtoolstip');
                
                if(!$('#'+tipid).hasClass('leaveAtooltip')){
                    $('#'+tipid).remove();
    				$('body').append("<div id='"+tipid+"' class='"+settings.tipClass+"'><p class='aToolTipContent'>"+tipContent+"</p></div>");
                }
                
				if(tipContent && settings.clickOpen){
					$('#'+tipid+' p.aToolTipContent')
					.append("<a id='"+settings.closeBtnClass+"' href='#' alt='close'>close</a>");
				}
                positionAtooltip(tipid);
			},
			/**
				Position atooltip
			*/
			positionAtooltip = function(tipid){
                var tipid = tipid || newTip;
                var under_height = above_height = tipheight = 0;
                var above_display = under_display = 1;
                
                //the atooltip.top above obj
                above_height = obj.offset().top - $('#'+tipid).outerHeight();
                //the atooltip.top under obj
                under_height = obj.offset().top + obj.outerHeight();
                //Can be displayed height above obj of window
                above_display = above_height-$(window).scrollTop();
                //Can be displayed height under obj of window
                under_display = $(window).height()-(under_height-$(window).scrollTop());
                
                if((above_height-$(window).scrollTop()) < $('#'+tipid).outerHeight(true)){
                    above_display = 0;//can not display above the obj
                }
                if(($(window).height()-(under_height-$(window).scrollTop())) < $('#'+tipid).outerHeight(true)){
                    under_display = 0;//can not display under the obj
                }
                
                
                if(settings.position=='under'){
                    tipheight = under_display>0?under_height:above_height;
                    tipheight = tipheight + settings.yOffset;
                }else{
                    tipheight = above_display==0?(under_display>0?under_height:above_height):above_height;
                    tipheight = tipheight - settings.yOffset;
                }
                
                //let it to be at center of obj
                var tipleft = obj.offset().left - ($('#'+tipid).outerWidth() - obj.outerWidth())*0.5 + settings.xOffset;
                
				$('#'+tipid).css({
					top: tipheight + 'px',
					left: tipleft + 'px'
				})
				.stop().fadeIn(settings.inSpeed, function(){
					if ($.isFunction(settings.onShow)){
						settings.onShow(obj);
					}
				});				
			},
            
            /**
                settimeout to remove atooltip
            */
            
            setRemovetime = function(tipid){
                var tipid = tipid || newTip;
                setTimeout(function(){
                    if($('#'+tipid).hasClass('inAtooltip') || obj.hasClass('actAtoolstip')){
                    }else{
                        removeAtooltip(tipid);
                    }
                },200);
            },
            
			/**
				Remove atooltip
			*/
			removeAtooltip = function(tipid){
                var tipid = tipid || newTip;
                obj.hasClass('actAtoolstip')?obj.removeClass('actAtoolstip'):'';
				// Fade out
				$('#'+tipid).stop().fadeOut(settings.outSpeed, function(){
				    if($.isFunction(settings.onHide)){
						settings.onHide(obj);
					}
                    $('#'+tipid).remove();
                    
				});
                
			};
			
			/**
				Decide what kind of tooltips to display
			*/
			// Regular aToolTip
            if(tipContent && settings.closeBlur){
                settings.onShow = function(){
                    $('#'+newTip).hover(function(){
                        $(this).addClass('inAtooltip');
                    },function(){
                        $(this).removeClass('inAtooltip');
                        $(this).addClass('leaveAtooltip');
                        setRemovetime();
                    });
                };
                
				obj.hover(function(){
					buildAtooltip(newTip);
			    }, function(){
                    obj.hasClass('actAtoolstip')?obj.removeClass('actAtoolstip'):'';
                    setRemovetime(newTip);
			    });	
                
            }else{
    			if(tipContent && !settings.clickOpen){	
    				// Activate on hover	
    				obj.hover(function(){
    					buildAtooltip(newTip);
    			    }, function(){ 
    					removeAtooltip(newTip);
    			    });	
    		    }
    		    // Click activated aToolTip
    		    if(tipContent && settings.clickOpen){
    				// Activate on click	
    				obj.click(function(el){
    					obj.attr({title: ''});
    					buildAtooltip(newTip);
    					// Click to close tooltip
    					$('#'+settings.closeBtnClass).click(function(){
    						removeAtooltip(newTip);
    						return false;
    					});		 
    					return false;			
    			    });
    		    }
            }
			
		    
		    // Follow mouse if enabled
		    if(!settings.fixed && !settings.clickOpen){
				obj.mousemove(function(el){
					$('#'+newTip).css({
						top: (el.pageY - $('#'+newTip).outerHeight() - settings.yOffset),
						left: (el.pageX + settings.xOffset)
					});
				});			
			}		    
		  
		}); // END: return this
    };
})(jQuery);