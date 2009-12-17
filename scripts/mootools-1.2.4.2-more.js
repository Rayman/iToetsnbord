MooTools.More={version:"1.2.4.2",build:"bd5a93c0913cce25917c48cbdacde568e15e02ef"};

(function(){

var global = this;

var log = function(){
	if (global.console && console.log){
		try {
			console.log.apply(console, arguments);
		} catch(e) {
			console.log(Array.slice(arguments));
		}
	} else {
		Log.logged.push(arguments);
	}
	return this;
};

var disabled = function(){
	this.logged.push(arguments);
	return this;
};

this.Log = new Class({
	
	logged: [],
	
	log: disabled,
	
	resetLog: function(){
		this.logged.empty();
		return this;
	},

	enableLog: function(){
		this.log = log;
		this.logged.each(function(args){
			this.log.apply(this, args);
		}, this);
		return this.resetLog();
	},

	disableLog: function(){
		this.log = disabled;
		return this;
	}
	
});

Log.extend(new Log).enableLog();

// legacy
Log.logger = function(){
	return this.log.apply(this, arguments);
};

})();

Element.implement({measure:function(e){var g=function(h){return !!(!h||h.offsetHeight||h.offsetWidth)};if(g(this)){return e.apply(this)}var d=this.getParent(),f=[],b=[];while(!g(d)&&d!=document.body){b.push(d.expose());d=d.getParent()}var c=this.expose();var a=e.apply(this);c();b.each(function(h){h()});return a},expose:function(){if(this.getStyle("display")!="none"){return $empty}var a=this.style.cssText;this.setStyles({display:"block",position:"absolute",visibility:"hidden"});return function(){this.style.cssText=a}.bind(this)},getDimensions:function(a){a=$merge({computeSize:false},a);var f={};var d=function(g,e){return(e.computeSize)?g.getComputedSize(e):g.getSize()};var b=this.getParent("body");if(b&&this.getStyle("display")=="none"){f=this.measure(function(){return d(this,a)})}else{if(b){try{f=d(this,a)}catch(c){}}else{f={x:0,y:0}}}return $chk(f.x)?$extend(f,{width:f.x,height:f.y}):$extend(f,{x:f.width,y:f.height})},getComputedSize:function(a){a=$merge({styles:["padding","border"],plains:{height:["top","bottom"],width:["left","right"]},mode:"both"},a);var c={width:0,height:0};switch(a.mode){case"vertical":delete c.width;delete a.plains.width;break;case"horizontal":delete c.height;delete a.plains.height;break}var b=[];$each(a.plains,function(g,f){g.each(function(h){a.styles.each(function(i){b.push((i=="border")?i+"-"+h+"-width":i+"-"+h)})})});var e={};b.each(function(f){e[f]=this.getComputedStyle(f)},this);var d=[];$each(a.plains,function(g,f){var h=f.capitalize();c["total"+h]=c["computed"+h]=0;g.each(function(i){c["computed"+i.capitalize()]=0;b.each(function(k,j){if(k.test(i)){e[k]=e[k].toInt()||0;c["total"+h]=c["total"+h]+e[k];c["computed"+i.capitalize()]=c["computed"+i.capitalize()]+e[k]}if(k.test(i)&&f!=k&&(k.test("border")||k.test("padding"))&&!d.contains(k)){d.push(k);c["computed"+h]=c["computed"+h]-e[k]}})})});["Width","Height"].each(function(g){var f=g.toLowerCase();if(!$chk(c[f])){return}c[f]=c[f]+this["offset"+g]+c["computed"+g];c["total"+g]=c[f]+c["total"+g];delete c["computed"+g]},this);return $extend(e,c)}});Element.implement({isDisplayed:function(){return this.getStyle("display")!="none"},isVisible:function(){var a=this.offsetWidth,b=this.offsetHeight;return(a==0&&b==0)?false:(a>0&&b>0)?true:this.isDisplayed()},toggle:function(){return this[this.isDisplayed()?"hide":"show"]()},hide:function(){var b;try{if((b=this.getStyle("display"))=="none"){b=null}}catch(a){}return this.store("originalDisplay",b||"block").setStyle("display","none")},show:function(a){return this.setStyle("display",a||this.retrieve("originalDisplay")||"block")},swapClass:function(a,b){return this.removeClass(a).addClass(b)}});Fx.Reveal=new Class({Extends:Fx.Morph,options:{link:"cancel",styles:["padding","border","margin"],transitionOpacity:!Browser.Engine.trident4,mode:"vertical",display:"block",hideInputs:Browser.Engine.trident?"select, input, textarea, object, embed":false},dissolve:function(){try{if(!this.hiding&&!this.showing){if(this.element.getStyle("display")!="none"){this.hiding=true;this.showing=false;this.hidden=true;this.cssText=this.element.style.cssText;var d=this.element.getComputedSize({styles:this.options.styles,mode:this.options.mode});this.element.setStyle("display","block");if(this.options.transitionOpacity){d.opacity=1}var b={};$each(d,function(f,e){b[e]=[f,0]},this);this.element.setStyle("overflow","hidden");var a=this.options.hideInputs?this.element.getElements(this.options.hideInputs):null;this.$chain.unshift(function(){if(this.hidden){this.hiding=false;$each(d,function(f,e){d[e]=f},this);this.element.style.cssText=this.cssText;this.element.setStyle("display","none");if(a){a.setStyle("visibility","visible")}}this.fireEvent("hide",this.element);this.callChain()}.bind(this));if(a){a.setStyle("visibility","hidden")}this.start(b)}else{this.callChain.delay(10,this);this.fireEvent("complete",this.element);this.fireEvent("hide",this.element)}}else{if(this.options.link=="chain"){this.chain(this.dissolve.bind(this))}else{if(this.options.link=="cancel"&&!this.hiding){this.cancel();this.dissolve()}}}}catch(c){this.hiding=false;this.element.setStyle("display","none");this.callChain.delay(10,this);this.fireEvent("complete",this.element);this.fireEvent("hide",this.element)}return this},reveal:function(){try{if(!this.showing&&!this.hiding){if(this.element.getStyle("display")=="none"||this.element.getStyle("visiblity")=="hidden"||this.element.getStyle("opacity")==0){this.showing=true;this.hiding=this.hidden=false;var d;this.cssText=this.element.style.cssText;this.element.measure(function(){d=this.element.getComputedSize({styles:this.options.styles,mode:this.options.mode})}.bind(this));$each(d,function(f,e){d[e]=f});if($chk(this.options.heightOverride)){d.height=this.options.heightOverride.toInt()}if($chk(this.options.widthOverride)){d.width=this.options.widthOverride.toInt()}if(this.options.transitionOpacity){this.element.setStyle("opacity",0);d.opacity=1}var b={height:0,display:this.options.display};$each(d,function(f,e){b[e]=0});this.element.setStyles($merge(b,{overflow:"hidden"}));var a=this.options.hideInputs?this.element.getElements(this.options.hideInputs):null;if(a){a.setStyle("visibility","hidden")}this.start(d);this.$chain.unshift(function(){this.element.style.cssText=this.cssText;this.element.setStyle("display",this.options.display);if(!this.hidden){this.showing=false}if(a){a.setStyle("visibility","visible")}this.callChain();this.fireEvent("show",this.element)}.bind(this))}else{this.callChain();this.fireEvent("complete",this.element);this.fireEvent("show",this.element)}}else{if(this.options.link=="chain"){this.chain(this.reveal.bind(this))}else{if(this.options.link=="cancel"&&!this.showing){this.cancel();this.reveal()}}}}catch(c){this.element.setStyles({display:this.options.display,visiblity:"visible",opacity:1});this.showing=false;this.callChain.delay(10,this);this.fireEvent("complete",this.element);this.fireEvent("show",this.element)}return this},toggle:function(){if(this.element.getStyle("display")=="none"||this.element.getStyle("visiblity")=="hidden"||this.element.getStyle("opacity")==0){this.reveal()}else{this.dissolve()}return this},cancel:function(){this.parent.apply(this,arguments);this.element.style.cssText=this.cssText;this.hidding=false;this.showing=false}});Element.Properties.reveal={set:function(a){var b=this.retrieve("reveal");if(b){b.cancel()}return this.eliminate("reveal").store("reveal:options",a)},get:function(a){if(a||!this.retrieve("reveal")){if(a||!this.retrieve("reveal:options")){this.set("reveal",a)}this.store("reveal",new Fx.Reveal(this,this.retrieve("reveal:options")))}return this.retrieve("reveal")}};Element.Properties.dissolve=Element.Properties.reveal;Element.implement({reveal:function(a){this.get("reveal",a).reveal();return this},dissolve:function(a){this.get("reveal",a).dissolve();return this},nix:function(){var a=Array.link(arguments,{destroy:Boolean.type,options:Object.type});this.get("reveal",a.options).dissolve().chain(function(){this[a.destroy?"destroy":"dispose"]()}.bind(this));return this},wink:function(){var b=Array.link(arguments,{duration:Number.type,options:Object.type});var a=this.get("reveal",b.options);a.reveal().chain(function(){(function(){a.dissolve()}).delay(b.duration||2000)})}});Fx.Slide=new Class({Extends:Fx,options:{mode:"vertical",hideOverflow:true},initialize:function(b,a){this.addEvent("complete",function(){this.open=(this.wrapper["offset"+this.layout.capitalize()]!=0);if(this.open&&Browser.Engine.webkit419){this.element.dispose().inject(this.wrapper)}},true);this.element=this.subject=document.id(b);this.parent(a);var d=this.element.retrieve("wrapper");var c=this.element.getStyles("margin","position","overflow");if(this.options.hideOverflow){c=$extend(c,{overflow:"hidden"})}this.wrapper=d||new Element("div",{styles:c}).wraps(this.element);this.element.store("wrapper",this.wrapper).setStyle("margin",0);this.now=[];this.open=true},vertical:function(){this.margin="margin-top";this.layout="height";this.offset=this.element.offsetHeight},horizontal:function(){this.margin="margin-left";this.layout="width";this.offset=this.element.offsetWidth},set:function(a){this.element.setStyle(this.margin,a[0]);this.wrapper.setStyle(this.layout,a[1]);return this},compute:function(c,b,a){return[0,1].map(function(d){return Fx.compute(c[d],b[d],a)})},start:function(b,e){if(!this.check(b,e)){return this}this[e||this.options.mode]();var d=this.element.getStyle(this.margin).toInt();var c=this.wrapper.getStyle(this.layout).toInt();var a=[[d,c],[0,this.offset]];var g=[[d,c],[-this.offset,0]];var f;switch(b){case"in":f=a;break;case"out":f=g;break;case"toggle":f=(c==0)?a:g}return this.parent(f[0],f[1])},slideIn:function(a){return this.start("in",a)},slideOut:function(a){return this.start("out",a)},hide:function(a){this[a||this.options.mode]();this.open=false;return this.set([-this.offset,0])},show:function(a){this[a||this.options.mode]();this.open=true;return this.set([0,this.offset])},toggle:function(a){return this.start("toggle",a)}});Element.Properties.slide={set:function(b){var a=this.retrieve("slide");if(a){a.cancel()}return this.eliminate("slide").store("slide:options",$extend({link:"cancel"},b))},get:function(a){if(a||!this.retrieve("slide")){if(a||!this.retrieve("slide:options")){this.set("slide",a)}this.store("slide",new Fx.Slide(this,this.retrieve("slide:options")))}return this.retrieve("slide")}};Element.implement({slide:function(d,e){d=d||"toggle";var b=this.get("slide"),a;switch(d){case"hide":b.hide(e);break;case"show":b.show(e);break;case"toggle":var c=this.retrieve("slide:flag",b.open);b[c?"slideOut":"slideIn"](e);this.store("slide:flag",!c);a=true;break;default:b.start(d,e)}if(!a){this.eliminate("slide:flag")}return this}});