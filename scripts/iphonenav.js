// Some basic string functions
String.prototype.startsWith = function(str){
	return (this.match("^"+str)==str);
};

String.prototype.endsWith = function(str){
	return (this.match(str+"$")==str);
};

//Everything is wrapped in a function, so these ugly variables are hidden :)
(function() {

//Constants for the page swiping
var animateX = -20; //Percentage of the screen moved in one step
var animateInterval = 24; //Time between two intervals of the animation in ms

//Usefull variables for page navigation
var currentPage = null; //Hold the element of the current page
var currentWidth = 0; //Hold the current width of the window
var currentHash = location.hash; //Holds the current id of the page
var hashPrefix = "#_"; //The pageId gets prefixed in the url by this
var pageHistory = []; //Hold the history so that back/forward buttons work

addEventListener("click", function(event)
{
    var link = event.target;
    // Search the <a> tag
    while (link && link.localName && link.localName.toLowerCase() != "a")
        link = link.parentNode;

    // Dont do anything with normal links
    if (link && link.hash && link.hash != '' && link.hash != '#')
    {
		//Stop default action
		event.preventDefault();

		//Get the page, and when found, go to it
		var page = document.getElementById(link.hash.substr(1));
		if(page)
		{
			showPage(page);
		}
		else
		{
			alert('Page not found: '+link.hash);
		}
    }
}, true);

function checkOrientAndLocation()
{
    if (window.outerWidth != currentWidth)
    {
        currentWidth = window.outerWidth;
        document.body.setAttribute("orient", currentWidth == 320 ? "profile" : "landscape");
    }

    //If back/forward buttons are used, the location.hash changes
    if (location.hash != currentHash)
    {
		//Save current hash
        currentHash = location.hash;
        var pageId = currentHash.substr(hashPrefix.length);

        //Try to get the page
        var page = $(pageId);
        if (page)
        {
			//Try to find that page in the history
            var index = pageHistory.indexOf(pageId);
            var backwards = index != -1;
            if (backwards)
                pageHistory.splice(index, pageHistory.length);

            showPage(page, backwards);
        }
        else
        {
			alert('Page not found: '+pageId);
		}
    }
}

function showPage(page, backwards)
{
    // If classname == dialog means that it is a form
    if (page.hasClass('dialog'))
        showDialog(page);
    else
    {
		//Change the location to the page that about to be shown
        location.href = currentHash = hashPrefix + page.id;

        //Save the page in the history
        pageHistory.push(page.id);

        var fromPage = currentPage;
        currentPage = page;

        //Set the title
        $('pageTitle').set('html', page.title || "");

		//Hide the homebutton when page == home
        $('homeButton').setStyle('display', ("#"+page.id) == $('homeButton').hash ? "none" : "inline");

        if (fromPage && fromPage != currentPage)
            setTimeout(swipePage, 0, fromPage, page, backwards);
    }
}

function swipePage(fromPage, toPage, backwards)
{
	// position the toPage right next to the current page ???
    toPage.setStyle('left', '100%');

    //Unhide it
    toPage.setAttribute("selected", "true");

    //Scroll to the top
    scrollTo(0, 1);

    var percent = 100;
    var timer = function()
    {
        percent += animateX;
        if (percent <= 0)
        {
            percent = 0;
            fromPage.removeAttribute("selected"); //Hide the fromPage
            $clear(timer); //Stop the timer
        }

        fromPage.setStyle('left', (backwards ? (100-percent) : (percent-100)) + "%");
        toPage.setStyle('left', (backwards ? -percent : percent) + "%");
    }.periodical(animateInterval);
}

function showDialog(form)
{
	//Unhide the form
    form.setAttribute("selected", "true");
}

window.addEvent('domready', function() {

	// Get all elements with selected = true
	list = $(document.body).getChildren().filter(function(el){
		return el.getAttribute('selected')
	});

	//Startpage is the first selected = true, pick the fist div when no elements are found
	var startPage = list.length > 0 ? list[0] : $(document.body).getElement('div');
	//Show the startpage
	showPage(startPage);

	//Add some time stuff
    setInterval(checkOrientAndLocation, 300);
    setTimeout(scrollTo, 0, 0, 1);

	//Add some events to forms with class=dialog
    $$('[class=dialog]').addEvents({

		//Add an onsubmit event handler to all forms that have class=dialog
		'submit': function(event){

			//Stop the submitting of the form
			event.preventDefault();

			// Deselect all inputs
			this.getElements('input').each(function(item){
				item.blur();
			});

			//Hide the form
			this.removeAttribute("selected");

			//Check if the action is to a #id
			var index = this.action.lastIndexOf("#");
			if (index != -1)
			{
				//Get the submit location
				var element = document.getElementById(this.action.substr(index+1));
				if(element)
				{
					showPage(element);
				}
				else
				{
					alert('Page not found');
				}
			}

		},

		//Hide the form when an click event occurs
		'click': function(event){
			if (event.target == this)
				this.removeAttribute("selected");
		}
	});
});


})(); //End of wrapper function
