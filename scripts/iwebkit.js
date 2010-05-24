/*global window: false, $: false, $each: false, addClass: false, removeClass: false */

/**
 * Removes the click delay in the target element
 * @constructor
 */
function NoClickDelay(el) {
	this.element = el;
	if( window['Touch'] ) this.element.addEventListener('touchstart', this, false);
}

NoClickDelay.prototype = {

	onTouchStart: function(e) {
		//e.preventDefault();
		this.moved = false;

		this.theTarget = document.elementFromPoint(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
		if(this.theTarget.nodeType == 3) this.theTarget = theTarget.parentNode;
		//this.theTarget.className+= ' pressed';

		this.element.addEventListener('touchmove', this, false);
		this.element.addEventListener('touchend', this, false);
	},

	onTouchMove: function(e) {
		this.moved = true;
		this.theTarget.className = this.theTarget.className.replace(/ ?pressed/gi, '');
	},

	onTouchEnd: function(e) {
		this.element.removeEventListener('touchmove', this, false);
		this.element.removeEventListener('touchend', this, false);

		if( !this.moved && this.theTarget ) {
			this.theTarget.className = this.theTarget.className.replace(/ ?pressed/gi, '');
			var theEvent = document.createEvent('MouseEvents');
			theEvent.initEvent('tap', true, true);
			this.theTarget.dispatchEvent(theEvent);
		}

		this.theTarget = undefined;
	}
};

//This is so closure compiler doesn't rename 'handleEvent'
NoClickDelay.prototype['handleEvent'] = function(e) {
  switch(e.type) {
    case 'touchstart': this.onTouchStart(e); break;
    case 'touchmove': this.onTouchMove(e); break;
    case 'touchend': this.onTouchEnd(e); break;
  }
};

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


  if(window['Touch']) { //iPhone
    window.addEventListener('click', function (e) {
      //For each click a tap is fired, so we dont do anything with click
      event.preventDefault();
    }, false);
  } else { //other
    window.addEventListener('click', function (e) {
      e.preventDefault();
      var theEvent = document.createEvent('MouseEvents');
      theEvent.initEvent('tap', true, true);
      e.target.dispatchEvent(theEvent);
    }, false);
  }

  //Attach the ontap listener
  window.addEventListener('tap', onTap, false);

  setInterval(checkHash, observeDelay);

  $('backButton').addEventListener('tap', function (e) {
    goBack();
  }, false);

  var noDelay = new NoClickDelay(document.body);

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

  function onTap(event) {

    var link = event.target;

    //External links are allowed
    if(link.getAttribute('rel') == 'external' && event.type == 'tap') {
      window.location.href = link.href;
    }

    //Hide the form if it's clicked on it
    if (link.nodeName.toLowerCase() === 'form') {
      removeClass(link, 'selected');
    }

    // Search the <a> tag
    while (link && link.localName && link.localName.toLowerCase() !== "a") {
      link = link.parentNode;
    }

    // Dont do anything with normal links
    if (link && link.hash && link.hash !== '' && link.hash !== '#') {
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
    $each(form.getElementsByTagName('input'), function (el) {
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
      toPage.style['webkitTransform'] = 'translate(' + (backwards ? '-100' : '100') + '%)';

      //Unhide it
      addClass(toPage, 'selected');

      //Scroll to the top
      hideURLbar();
      
      //wait a bit for the translation for better performance
      setTimeout(function () {       
        fromPage.style['webkitTransform'] = 'translate(' + (backwards ? '100' : '-100') + '%)';
        toPage.style['webkitTransform'] = 'translate(0px)';
      }, 0);

      setTimeout(function () {
        transitionInProgress = false;
        removeClass(fromPage, 'selected'); //Hide the fromPage
        if ($chain.length) {
          setTimeout($chain.shift(), 0);
        }
      }, 500);
    }
  }

}, false);