/* function fullscreen() {
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
} */

function hideURLbar() {
	window.scrollTo(0, 0.9);
}

window.onload = function () {
	// fullscreen();
	hideURLbar();
};

/* no blue selection
document.addEventListener('click', function(){
  return false;
},false); */

window.addEventListener('load', function () {

  // Get all elements with class selected
	var list = document.getElementsByClassName('selected');	
	if(list.length !== 1) alert('Error, no startpage or too many startpages');
	//Startpage is the first selected = true
	var startPage = list[0];

  var	observeDelay  = 300,
      backButton    = 	$('backButton'), //This button is hidden when page.id == homepage.id
      homePage      = startPage,
      pageHistory   = [],
      currentPage;
      
  showPage(startPage);

	//Bind the events for form submitting
	/*
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
      removeClass(form, 'selected');

      //Check if the action is to a #id
      var index = form.action.lastIndexOf("#");
      if (index !== -1)
      {
        //Go to the submit location
        HistoryManager.goToPage(form.action.substr(index + 1));
      }
    });
	} */

  //Start the clickwatcher
  window.addEventListener('click', onClick);

  function 	onClick(event) {
    var link = event.target;

    //Hide the form if it's clicked on it
    if (link.nodeName.toLowerCase() === 'form') {
      removeClass(link, 'selected');
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

      goToPage(link.hash.substring(1));
    }
  }

  function goToPage(pageId) {
    var page = tryGetPage(pageId);
    if (page) {
      showPage(page);
    }
  }

  function showPage(page, backwards) {
    log('showPage', page);

    // If classname == dialog means that it is a form
    if (hasClass(page, 'dialog')) {
      showDialog(page);
    } else {
      //Change the location to the page that about to be shown
      location.href = currentHash = '#' + page.id;

      //Save the page in the history
      pageHistory.push(page.id);

      var fromPage = currentPage;
      currentPage = page;

      //Set the title
      $('title').innerHTML = page.title || "";

      //Hide the backButton when page === home
      backButton.style.display = page === homePage ? "none" : "inline";

      if (fromPage && fromPage !== currentPage) {
        setTimeout(swipePage, 0, fromPage, page, backwards);
      }
    }
  }

  function showDialog(form) {
    //Unhide the form
    addClass(form, 'selected');

    //Remove the old query
    form.getElementsByTagName('input').value = '';
  }

  function tryGetPage(pageId) {
    var page = $(pageId);
    if (!page) {
      alert('Page not found: ' + pageId);
    }
    return page;
  }

  var timeoutID = null;

  function swipePage(fromPage, toPage, backwards)	{
    //Stop the other page from hiding
    clearTimeout(timeoutID);

    // position the toPage right next to the current page
    toPage.style.left = backwards ? '-100%' : '100%';

    //Unhide it
    addClass(toPage, 'selected');

    //Scroll to the top
    scrollTo(0, 1);

    fromPage.style.left = (backwards ? '100' : '-100') + "%";
    toPage.style.left = '0%';

    timeoutID = setTimeout(function () {
      removeClass(fromPage, 'selected'); //Hide the fromPage
    }, 1000);
  }

}, false);