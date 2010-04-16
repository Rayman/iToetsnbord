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



/* no blue selection
document.addEventListener('click', function () {
  return false;
},false); */

window.addEventListener('DOMContentLoaded', function () {

  //Hide the url bar, delay it a bit
  setTimeout(hideURLbar, 0);

  // Get all elements with class selected
	var list = document.getElementsByClassName('selected');
	if (list.length !== 1) {
    alert('Error, no startpage or too many startpages');
  }
	//Startpage is the first selected = true
	var startPage = list[0];

  var	observeDelay  = 200,
      backButton    = $('leftnav'), //This button is hidden when page.id == homepage.id
      homeButton    = $('blueleftbutton'),
      homePage      = startPage,
      pageHistory   = [],
      currentPage,
      currentHash;

  showPage(startPage);

	//Bind the events for form submitting
	$each(document.getElementsByClassName('searchbox'), function (element) {

    element.addEventListener('submit', function (event) {

      //Stop the submitting of the form
      event.preventDefault();
      var form = event.target;

      // Deselect all inputs
      $each(form.getElementsByTagName('input'), function (item) {
        item.blur();
      });

      //Hide the form
      removeClass(this, 'selected');

      //Check if the action is to a #id
      var index = form.action.lastIndexOf("#");
      if (index !== -1) {
        //Go to the submit location
        goToPage(form.action.substr(index + 1));
      }
    }, false);
	});

  //Start the clickwatcher
  window.addEventListener('click', onClick);

  setInterval(checkHash, observeDelay);


  $('backButton').addEventListener('click', function(e) {
   goBack();
  });


  //private functions

  function hideURLbar() {
    window.scrollTo(0, 0.9);
  }

  function checkHash() {
    if (currentHash !== location.hash) {
      if (!transitionInProgress) {
        currentHash = location.hash;
        onHashChanged(location.hash);
      }
    }
  }

  function onHashChanged(newHash) {
		var pageId = newHash.substr(1); //strip the #

		//Try to find that page in the history
		var index = pageHistory.indexOf(pageId);
		//If it is found, index != -1, thus backwards = true
		var backwards = index !== -1;

		if (backwards) {
			pageHistory.splice(index, pageHistory.length); //Remove from the index to the end
		}

		var page = tryGetPage(pageId);
		if (page) {
			showPage(page, backwards);
		}
	}

  function onClick(event) {
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

  function goBack() {
    history.back();
    checkHash();
	}

  function goToPage(pageId) {
    var page = tryGetPage(pageId);
    if (page) {
      showPage(page);
    }
  }

  function showPage(page, backwards) {

    // If classname == dialog means that it is a form
    if (hasClass(page, 'searchbox')) {
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
      if (page === homePage) {
        backButton.style.display =  "none";
        homeButton.style.display = "inline";
      } else {
        backButton.style.display =  "inline";
        homeButton.style.display = "none";
      }

      if (fromPage && fromPage !== currentPage) {
        setTimeout(swipePage, 0, fromPage, page, backwards);
      }
    }
  }

  function showDialog(form) {
    //Unhide the form
    toggleClass(form, 'selected');

    //Remove the old query
    $each(form.getElementsByTagName('input'), function(el) {
      el.value = '';
    });
  }

  function tryGetPage(pageId) {
    var page = $(pageId);
    if (!page) {
      alert('Page not found: ' + pageId);
    }
    return page;
  }

  var transitionInProgress = false;
  var $chain = [];

  function swipePage(fromPage, toPage, backwards)	{
    //Stop the other page from hiding
    if (transitionInProgress) {
      $chain.push(function () {
        swipePage(fromPage, toPage, backwards);
      });
    } else {
      transitionInProgress = true;

      // position the toPage right next to the current page
      toPage.style.webkitTransform = 'translate(' + (backwards ? '-100' : '100') + '%)';

      //Unhide it
      addClass(toPage, 'selected');

      //Scroll to the top
      hideURLbar();

      fromPage.style.webkitTransform = 'translate(' + (backwards ? '100' : '-100') + '%)';
      toPage.style.webkitTransform = 'translate(0px)';

      setTimeout(function () {
        transitionInProgress = false;
        removeClass(fromPage, 'selected'); //Hide the fromPage
        setTimeout($chain.shift(), 0);
      }, 1000);
    }
  }

}, false);