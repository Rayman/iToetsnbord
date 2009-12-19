// Some basic string functions
String.implement({
	startsWith: function(str){
		return (this.match("^"+str)==str);
	}
});

String.implement({
	endsWith: function(str){
		return (this.match(str+"$")==str);
	}
});

HistoryManager = new new Class({
	Implements: [Options, Events],

	options: {
		observeDelay:	300,
		hashPrefix:		"#_", //The pageId gets prefixed in the url by this
		backButton: 	'', //This button is hidden when page.id == homepage.id
		homePage:		''
	},

	initialize: function(){
		this.currentWidth = 0;
		this.currentHash = location.hash;
		this.pageHistory = [];

		//Start the watch function
		this.observe.periodical(this.options.observeDelay, this);

		//Start the clickwatcher
		window.addEvent('click',this.onClick.bind(this));
	},

	// The function that checks the width and the location.hash for changes
	observe: function() {

		//If the width of the screen changes, fire this event
		if (window.outerWidth != this.currentWidth)
		{
			this.currentWidth = window.outerWidth;
			this.onWidthChanged(this.currentWidth);
		}

		//If back/forward buttons are used, the location.hash changes
		if (location.hash != this.currentHash)
		{
			this.currentHash = location.hash;
			this.onHashChanged(location.hash);
		}
	},

	onWidthChanged: function(newWidth){
		document.body.setAttribute("orient", newWidth == 320 ? "profile" : "landscape");
	},

	onHashChanged: function(newHash){
		var pageId = newHash.substr(this.options.hashPrefix.length);

		//Try to find that page in the history
		var index = this.pageHistory.indexOf(pageId);
		//If it is found, index != -1, thus backwards = true
		var backwards = index != -1;

		if (backwards)
			this.pageHistory.splice(index, this.pageHistory.length); //Remove from the index to the end

		var page = this.tryGetPage(pageId);
		if(page)
			this.showPage(page, backwards);
	},

	onClick: function(event){
		var link = event.target;

		//Hide the form if it's clicked on it
		if($(link).nodeName.toLowerCase()=='form')
			link.removeAttribute("selected");

		// Search the <a> tag
		while (link && link.localName && link.localName.toLowerCase() != "a")
			link = link.parentNode;

		// Dont do anything with normal links
		if (link && link.hash && link.hash != '' && link.hash != '#')
		{
			//Stop default action
			event.preventDefault();

			this.goToPage(link.hash.substring(1));
		}
	},

	goToPage: function(pageId){
		var page = this.tryGetPage(pageId);
		if(page)
			this.showPage(page);
	},

	showPage: function(page, backwards){

		// If classname == dialog means that it is a form
		if (page.hasClass('dialog'))
			this.showDialog(page);
		else
		{
			//Change the location to the page that about to be shown
			location.href = this.currentHash = this.options.hashPrefix + page.id;

			//Save the page in the history
			this.pageHistory.push(page.id);

			var fromPage = this.currentPage;
			this.currentPage = page;

			//Set the title
			$('pageTitle').set('html', page.title || "");

			//Hide the backButton when page == home
			this.options.backButton.setStyle('display', page == this.options.homePage ? "none" : "inline");

			if (fromPage && fromPage != this.currentPage)
				setTimeout(this.swipePage.bind(this), 0, fromPage, page, backwards);
		}
	},

	showDialog: function(form)
	{
		//Unhide the form
		form.setAttribute("selected", "true");

		//Remove the old query
		form.getElements('input').set('value','');
	},

	tryGetPage: function(pageId){
		var page = document.id(pageId);
		if(!page)
			alert('Page not found: ' + pageId);
		return page;
	},

	timeoutID: null,

	swipePage: function(fromPage, toPage, backwards)
	{
		//Stop the other page from hiding
		$clear(this.timeoutID);

		// position the toPage right next to the current page
		toPage.setStyle('left', backwards ? '-100%' : '100%');

		//Unhide it
		toPage.setAttribute("selected", "true");

		//Scroll to the top
		scrollTo(0, 1);

		fromPage.setStyle('left', (backwards ? '100' : '-100') + "%");
		toPage.setStyle('left', '0%');

		this.timeoutID = function(){
			fromPage.removeAttribute("selected"); //Hide the fromPage
		}.delay(1000);
	}
});

window.addEvent('domready', function() {

	// Get all elements with selected = true
	list = $(document.body).getChildren().filter(function(el){
		return el.getAttribute('selected')
	});

	//Startpage is the first selected = true, pick the fist div when no elements are found
	var startPage = list.length > 0 ? list[0] : $(document.body).getElement('div');

	//Set some options
	HistoryManager.setOptions({
		homePage:	$('home'),
		backButton:	$('backButton')
	});

	//Show the startpage
	HistoryManager.showPage(startPage);

	//Bind the events for form submitting
	$$('[class=dialog]').addEvent('submit',function(event){

		//Stop the submitting of the form
		event.preventDefault();

		var form = $(event.target);
		if(form.nodeName.toLowerCase()!='form')
			form = form.getParent('form');

		// Deselect all inputs
		form.getElements('input').each(function(item){
			item.blur();
		});

		//Hide the form
		form.removeAttribute("selected");

		//Check if the action is to a #id
		var index = form.action.lastIndexOf("#");
		if (index != -1)
		{
			//Go to the submit location
			HistoryManager.goToPage(form.action.substr(index+1));
		}
	}.bind(HistoryManager));
});