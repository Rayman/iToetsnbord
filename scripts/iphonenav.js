// Some basic string functions
String.prototype.startsWith = function(str){
	return (this.match("^"+str)==str);
};

String.prototype.endsWith = function(str){
	return (this.match(str+"$")==str);
};

//Everything is wrapped in a function, so these ugly variables are hidden :)
(function() {

var animateX = -20;
var animateInterval = 24;

var currentPage = null;
var currentWidth = 0;
var currentHash = location.hash;
var hashPrefix = "#_";
var pageHistory = [];

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

        var orient = currentWidth == 320 ? "profile" : "landscape";
        document.body.setAttribute("orient", orient);
    }

    if (location.hash != currentHash)
    {
        currentHash = location.hash;
        var pageId = currentHash.substr(hashPrefix.length);
        var page = document.getElementById(pageId);
        if (page)
        {
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
    if (page.className.indexOf("dialog") != -1)
        showDialog(page);
    else
    {
        location.href = currentHash = hashPrefix + page.id;
        pageHistory.push(page.id);

        var fromPage = currentPage;
        currentPage = page;

        var pageTitle = document.getElementById("pageTitle");
        pageTitle.innerHTML = page.title || "";

        var homeButton = document.getElementById("homeButton");
        if (homeButton)
            homeButton.style.display = ("#"+page.id) == homeButton.hash ? "none" : "inline";

        if (fromPage)
            setTimeout(swipePage, 0, fromPage, page, backwards);
    }
}

function swipePage(fromPage, toPage, backwards)
{
    toPage.style.left = "100%";
    toPage.setAttribute("selected", "true");
    scrollTo(0, 1);

    var percent = 100;
    var timer = setInterval(function()
    {
        percent += animateX;
        if (percent <= 0)
        {
            percent = 0;
            fromPage.removeAttribute("selected");
            clearInterval(timer);
        }

        fromPage.style.left = (backwards ? (100-percent) : (percent-100)) + "%";
        toPage.style.left = (backwards ? -percent : percent) + "%";
    }, animateInterval);
}

function showDialog(form)
{
    form.setAttribute("selected", "true");
}

window.addEvent('domready', function() {

	// Get all elements with selected = true
	list = $(document.body).getChildren().filter(function(el){
		return el.getAttribute('selected')
	});

	//Startpage is the first selected = true, pick the fist div when no elements are found
	startPage = list.length > 0 ? list[0] : $(document.body).getElement('div');
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
