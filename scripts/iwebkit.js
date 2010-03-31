function fullscreen() {
	var a = document.getElementsByTagName("a");
	for (var i = 0; i < a.length;i++) {
		if (a[i].className.match("noeffect")) {
		}
		else {
			a[i].onclick = function () {
				window.location = this.getAttribute("href");
				return false;
			};
		}
	}
}

function hideURLbar() {
	window.scrollTo(0, 0.9);
}

window.onload = function () {
	fullscreen();
	hideURLbar();
};

/* no blue selection
document.addEventListener('click', function(){
  return false;
},false); */

log('Start iPhoneNav');
var iPhoneNav = new Class({

	Implements: [Options],

	options: {
		observeDelay:	300,
		hashPrefix:   "#_", //The pageId gets prefixed in the url by this
		backButton:   '', //This button is hidden when page.id == homepage.id
		homePage:     ''
	},

	initialize: function (options) {
		this.setOptions(options);

		this.currentWidth = 0;
		this.currentHash = location.hash;
		this.pageHistory = [];

		//Start the clickwatcher
		window.addEventListener('click', this.onClick.bind(this));
	},

	onClick: function (event) {
		var link = event.target;

		//Hide the form if it's clicked on it
		if (link.nodeName.toLowerCase() === 'form') {
			link.removeAttribute("selected");
		}

		// Search the <a> tag
		while (link && link.localName && link.localName.toLowerCase() !== "a") {
			link = link.parentNode;
		}

		// Dont do anything with normal links
		if (link && link.hash && link.hash !== '' && link.hash !== '#')
		{
			//Stop default action
			event.preventDefault();

			this.goToPage(link.hash.substring(1));
		}
	},

	goToPage: function (pageId) {
		var page = this.tryGetPage(pageId);
		if (page) {
			this.showPage(page);
		}
	},

	showPage: function (page, backwards) {

		// If classname == dialog means that it is a form
		if (hasClass(page, 'content')) {
			this.showDialog(page);
		} else {
			//Change the location to the page that about to be shown
			location.href = this.currentHash = this.options.hashPrefix + page.id;

			//Save the page in the history
			this.pageHistory.push(page.id);

			var fromPage = this.currentPage;
			this.currentPage = page;

			//Set the title
			$('title').innerHTML = page.title || "";

			//Hide the backButton when page === home
			this.options.backButton.style.display = page === this.options.homePage ? "none" : "inline";

			if (fromPage && fromPage !== this.currentPage) {
				setTimeout(this.swipePage.bind(this), 0, fromPage, page, backwards);
			}
		}
	},

	showDialog: function (form) {
		//Unhide the form
		form.setAttribute("selected", "true");

		//Remove the old query
		form.getElementsByTagName('input').value = '';
	},

	tryGetPage: function (pageId) {
		var page = $(pageId);
		if (!page) {
			alert('Page not found: ' + pageId);
		}
		return page;
	},

	timeoutID: null,

	swipePage: function (fromPage, toPage, backwards)
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

		this.timeoutID = function () {
			fromPage.removeAttribute("selected"); //Hide the fromPage
		}.delay(1000);
	}
});

window.addEventListener('load', function () {

	// Get all elements with class selected
	var list = document.getElementsByClassName('selected');
	
	if(list.length == 0) alert('Error, no startpage set');

	//Startpage is the first selected = true, pick the fist div when no elements are found
	var startPage = list[0];

	//Set some options
	var HistoryManager = new iPhoneNav({
		homePage:	startPage,
		backButton:	$('backButton')
	});

	//Show the startpage
	HistoryManager.showPage(startPage);

	//Bind the events for form submitting
	var elements = document.getElementsByClassName('dialog');
	var i = 0;
	for(;i<elements.length;i++){
    elements[i].addEventListener('submit', function (event) {
      //Stop the submitting of the form
      event.preventDefault();

      var form = $(event.target);
      if (form.nodeName.toLowerCase() !== 'form') {
        form = form.getParent('form');
      }

      // Deselect all inputs
      form.getElements('input').each(function (item) {
        item.blur();
      });

      //Hide the form
      form.removeAttribute("selected");

      //Check if the action is to a #id
      var index = form.action.lastIndexOf("#");
      if (index !== -1)
      {
        //Go to the submit location
        HistoryManager.goToPage(form.action.substr(index + 1));
      }
    });
	}
});