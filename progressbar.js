/* ***********************************************************
Example 4-3 (DHTMLAPI.js)
"Dynamic HTML:The Definitive Reference"
2nd Edition
by Danny Goodman
Published by O'Reilly & Associates  ISBN 1-56592-494-0
http://www.oreilly.com
Copyright 2002 Danny Goodman.  All Rights Reserved.
************************************************************ */
// DHTMLapi.js custom API for cross-platform
// object positioning by Danny Goodman (http://www.dannyg.com).
// Release 2.0. Supports NN4, IE, and W3C DOMs.

// Global variables
var isCSS, isW3C, isIE4, isNN4, isIE6CSS;
// Initialize upon load to let all browsers establish content objects
function initDHTMLAPI() {
    if (document.images) {
        isCSS = (document.body && document.body.style) ? true : false;
        isW3C = (isCSS && document.getElementById) ? true : false;
        isIE4 = (isCSS && document.all) ? true : false;
        isNN4 = (document.layers) ? true : false;
        isIE6CSS = (document.compatMode && document.compatMode.indexOf("CSS1") >= 0) ? true : false;
    }
}
// Set event handler to initialize API
window.onload = initDHTMLAPI;

// Seek nested NN4 layer from string name
function seekLayer(doc, name) {
    var theObj;
    for (var i = 0; i < doc.layers.length; i++) {
        if (doc.layers[i].name == name) {
            theObj = doc.layers[i];
            break;
        }
        // dive into nested layers if necessary
        if (doc.layers[i].document.layers.length > 0) {
            theObj = seekLayer(document.layers[i].document, name);
        }
    }
    return theObj;
}

// Convert object name string or object reference
// into a valid element object reference
function getRawObject(obj) {
    var theObj;
    if (typeof obj == "string") {
        if (isW3C) {
            theObj = document.getElementById(obj);
        } else if (isIE4) {
            theObj = document.all(obj);
        } else if (isNN4) {
            theObj = seekLayer(document, obj);
        }
    } else {
        // pass through object reference
        theObj = obj;
    }
    return theObj;
}

// Convert object name string or object reference
// into a valid style (or NN4 layer) reference
function getObject(obj) {
    var theObj = getRawObject(obj);
    if (theObj && isCSS) {
        theObj = theObj.style;
    }
    return theObj;
}

// Position an object at a specific pixel coordinate
function shiftTo(obj, x, y) {
    var theObj = getObject(obj);
    if (theObj) {
        if (isCSS) {
            // equalize incorrect numeric value type
            var units = (typeof theObj.left == "string") ? "px" : 0 
            theObj.left = x + units;
            theObj.top = y + units;
        } else if (isNN4) {
            theObj.moveTo(x,y)
        }
    }
}

// Move an object by x and/or y pixels
function shiftBy(obj, deltaX, deltaY) {
    var theObj = getObject(obj);
    if (theObj) {
        if (isCSS) {
            // equalize incorrect numeric value type
            var units = (typeof theObj.left == "string") ? "px" : 0 
            theObj.left = getObjectLeft(obj) + deltaX + units;
            theObj.top = getObjectTop(obj) + deltaY + units;
        } else if (isNN4) {
            theObj.moveBy(deltaX, deltaY);
        }
    }
}

// Set the z-order of an object
function setZIndex(obj, zOrder) {
    var theObj = getObject(obj);
    if (theObj) {
        theObj.zIndex = zOrder;
    }
}

// Set the background color of an object
function setBGColor(obj, color) {
    var theObj = getObject(obj);
    if (theObj) {
        if (isNN4) {
            theObj.bgColor = color;
        } else if (isCSS) {
            theObj.backgroundColor = color;
        }
    }
}

// Set the visibility of an object to visible
function show(obj) {
    var theObj = getObject(obj);
    if (theObj) {
        theObj.visibility = "visible";
    }
}

// Set the visibility of an object to hidden
function hide(obj) {
    var theObj = getObject(obj);
    if (theObj) {
        theObj.visibility = "hidden";
    }
}

// Retrieve the x coordinate of a positionable object
function getObjectLeft(obj)  {
    var elem = getRawObject(obj);
    var result = 0;
    if (document.defaultView) {
        var style = document.defaultView;
        var cssDecl = style.getComputedStyle(elem, "");
        result = cssDecl.getPropertyValue("left");
    } else if (elem.currentStyle) {
        result = elem.currentStyle.left;
    } else if (elem.style) {
        result = elem.style.left;
    } else if (isNN4) {
        result = elem.left;
    }
    return parseInt(result);
}

// Retrieve the y coordinate of a positionable object
function getObjectTop(obj)  {
    var elem = getRawObject(obj);
    var result = 0;
    if (document.defaultView) {
        var style = document.defaultView;
        var cssDecl = style.getComputedStyle(elem, "");
        result = cssDecl.getPropertyValue("top");
    } else if (elem.currentStyle) {
        result = elem.currentStyle.top;
    } else if (elem.style) {
        result = elem.style.top;
    } else if (isNN4) {
        result = elem.top;
    }
    return parseInt(result);
}

// Retrieve the rendered width of an element
function getObjectWidth(obj)  {
    var elem = getRawObject(obj);
    var result = 0;
    if (elem.offsetWidth) {
        result = elem.offsetWidth;
    } else if (elem.clip && elem.clip.width) {
        result = elem.clip.width;
    } else if (elem.style && elem.style.pixelWidth) {
        result = elem.style.pixelWidth;
    }
    return parseInt(result);
}

// Retrieve the rendered height of an element
function getObjectHeight(obj)  {
    var elem = getRawObject(obj);
    var result = 0;
    if (elem.offsetHeight) {
        result = elem.offsetHeight;
    } else if (elem.clip && elem.clip.height) {
        result = elem.clip.height;
    } else if (elem.style && elem.style.pixelHeight) {
        result = elem.style.pixelHeight;
    }
    return parseInt(result);
}

// Return the available content width space in browser window
function getInsideWindowWidth() {
    if (window.innerWidth) {
        return window.innerWidth;
    } else if (isIE6CSS) {
        // measure the html element's clientWidth
        return document.body.parentElement.clientWidth
    } else if (document.body && document.body.clientWidth) {
        return document.body.clientWidth;
    }
    return 0;
}

// Return the available content height space in browser window
function getInsideWindowHeight() {
    if (window.innerHeight) {
        return window.innerHeight;
    } else if (isIE6CSS) {
        // measure the html element's clientHeight
        return document.body.parentElement.clientHeight
    } else if (document.body && document.body.clientHeight) {
        return document.body.clientHeight;
    }
    return 0;
}


// Center a positionable element whose name is passed as 
// a parameter in the current window/frame, and show it
function centerOnWindow(elemID) {
    // 'obj' is the positionable object
    var obj = getRawObject(elemID);
    // window scroll factors
    var scrollX = 0, scrollY = 0;
    if (document.body && typeof document.body.scrollTop != "undefined") {
        scrollX += document.body.scrollLeft;
        scrollY += document.body.scrollTop;
        if (document.body.parentNode && 
            typeof document.body.parentNode.scrollTop != "undefined") {
            scrollX += document.body.parentNode.scrollLeft;
            scrollY += document.body.parentNode.scrollTop
        }
    } else if (typeof window.pageXOffset != "undefined") {
        scrollX += window.pageXOffset;
        scrollY += window.pageYOffset;
    }
    var x = Math.round((getInsideWindowWidth()/2) - (getObjectWidth(obj)/2)) + scrollX;
    var y = Math.round((getInsideWindowHeight()/2) -  (getObjectHeight(obj)/2)) + scrollY;
    shiftTo(obj, x, y);
    show(obj);
}

function initProgressBar() {
  // create quirks object whose default (CSS-compatible) values
    // are zero; pertinent values for quirks mode filled in later  
  if (navigator.appName == "Microsoft Internet Explorer" && 
        navigator.userAgent.indexOf("Win") != -1 && 
        (typeof document.compatMode == "undefined" || 
        document.compatMode == "BackCompat")) {
        document.getElementById("progressBar").style.height = "81px";
        document.getElementById("progressBar").style.width = "444px";
        document.getElementById("sliderWrapper").style.fontSize = "xx-small";
        document.getElementById("slider").style.fontSize = "xx-small";
        document.getElementById("slider").style.height = "13px";
        document.getElementById("slider").style.width = "415px";
    }
}

function showProgressBar() {
    centerOnWindow("progressBar");
}

function calcProgress(current, total) {
    if (current <= total) {
        var factor = current/total;
        var pct = Math.ceil(factor * 100);
        document.getElementById("sliderWrapper").firstChild.nodeValue = pct + "%";
        document.getElementById("slider").firstChild.nodeValue = pct + "%";
        document.getElementById("slider").style.clip = "rect(0px " + parseInt(factor * 417) + "px 16px 0px)";
    }
}

function hideProgressBar() {
    hide("progressBar");
    calcProgress(0, 0);
}

// Test bench to see progress bar in action at random intervals
var loopObject = {start:0, end:10, current:0, interval:null};

function runit() {
    if (loopObject.current <= loopObject.end) {
        calcProgress(loopObject.current, loopObject.end);
        loopObject.current += Math.random();
        loopObject.interval = setTimeout("runit()", 700);
    } else {
        calcProgress(loopObject.end, loopObject.end);
        loopObject.current = 0;
        loopObject.interval = null;
        setTimeout("hideProgressBar()", 500);
    }
}

function test() {
    showProgressBar();
    runit();
}
