// Some basic string functions
String.prototype.startsWith = function(str){
	return (this.match("^"+str)==str);
};

String.prototype.endsWith = function(str){
	return (this.match(str+"$")==str);
};

// Now comes all the nav stuff
var lastSubmittedForm = null;

(function() {

var animateX = -20;
var animateInterval = 24;

var currentPage = null;
var currentDialog = null;
var currentWidth = 0;
var currentHash = location.hash;
var hashPrefix = "#_";
var pageHistory = [];

addEventListener("load", function(event)
{
    var body = document.getElementsByTagName("body")[0];
    for (var child = body.firstChild; child; child = child.nextSibling)
    {
        if (child.nodeType == 1 && child.getAttribute("selected") == "true")
        {
            showPage(child);
            break;
        }
    }

    setInterval(checkOrientAndLocation, 300);
    setTimeout(scrollTo, 0, 0, 1);
}, false);
    
addEventListener("click", function(event)
{
    var link = event.target;
    // Search the <a> tag
    while (link && link.localName && link.localName.toLowerCase() != "a")
        link = link.parentNode;

    if (link && link.hash)
    {
		// Dont do anything with javascript links
		if(!link.href.startsWith('javascript:'))
		{
			//Stop event
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
    if (currentDialog)
    {
        currentDialog.removeAttribute("selected");
        currentDialog = null;
    }

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
    currentDialog = form;
    form.setAttribute("selected", "true");
    
    form.onsubmit = function(event)
    {
        event.preventDefault();
        form.removeAttribute("selected");
        
        //Check if the action is to a #id
        var index = form.action.lastIndexOf("#");
        if (index != -1)
        {
			// Get the submit data
			var data = new Hash();
			$$('#searchForm input').each(function(item){
				data.set(item.name,item.value);
				item.blur();
			});
			
			//Get the submit location
			var element = document.getElementById(form.action.substr(index+1));
			if(element)
			{
				//element.set('data',data);
				lastSubmittedForm = form;
				showPage(element);
			}
			else
			{
				alert('Page not found');
			}
        }
    }

    form.onclick = function(event)
    {
        if (event.target == form)
            form.removeAttribute("selected");
    }
}

})();
