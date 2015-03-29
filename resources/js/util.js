checkDebugMode()

// WORKAROUND FOR A LACK OF BIND()
if (!Function.prototype.bind) {

  Function.prototype.bind = function (oThis) {
  

    if (typeof this !== "function") {
    
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable")
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)))
        }

    fNOP.prototype = this.prototype
    fBound.prototype = new fNOP()

    return fBound
  }
}

// Enable or disable debug mode depending on the presence of the debug GET variable
function checkDebugMode() {

	var debugSetting = urlVariable('debug')
	
	if (debugSetting === '' || debugSetting === 'true') { 
		enableDebugMode()
	} else {
		disableDebugMode()
	}

}

// Enable debug mode
function enableDebugMode() {
	window.DEBUG_MODE = true
}

// Disable debug mode
function disableDebugMode() {
	window.DEBUG_MODE = false
}

// Log to console if debug mode is enabled
function debugLog(msg) {
	if (window.DEBUG_MODE) { console.log(msg) }
}

// Create a new div element with the specified class name
function newDiv(className) {
	var div = document.createElement('div')
	div.className = className
	return div
}

// Create a new canvas element with the specified class name, width and height
function newCanvas(className, width, height) {
	var canvas = document.createElement('canvas')
	canvas.className = className
	canvas.width = width
	canvas.height = height
	return canvas
}
	
// Get the contents of a GET variable
function urlVariable(varName) {
   
    var vars = {}
    var parts = window.location.href.replace(/[?&]+([^=&]+)=?([^&]*)/gi, function(m, key, value) {
        vars[key] = value
    })
    return vars[varName]
    
}

// Is the current device operated using a touch screen
function isTouchDevice() {
	 return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0))
}


// Check if a date is valid
function isValidDate(d) {

	if (Object.prototype.toString.call(d) === "[object Date]") {

		if (isNaN(d.getTime())) {
			return false
		} else {
			return true
		}
	} else {
		return false
	}
}



function serializeDate(d) {
	if (isValidDate(d)) {
		return d.getTime()
	} else {
		return false
	}

}

function unserializeDate(n) {
	return new Date(parseInt(n))
}
function newDateMillisecondsFromNow(ms) {
	
	var newDate = new Date()
	
	// Set the milliseconds
	newDate.setMilliseconds(newDate.getMilliseconds() + ms)
	
	return newDate

}

function newDateSecondsFromNow(seconds) {
	
	var newDate = new Date()
	
	// Set the seconds
	newDate.setSeconds(newDate.getSeconds() + Math.floor(seconds))
	
	// Set the milliseconds
	newDate.setMilliseconds(newDate.getMilliseconds() + Math.floor((seconds % 1) * 1000))
	
	return newDate

}


function newDateMinutesFromNow(minutes) {
	
	var newDate = new Date()
	
	// Set the minutes
	newDate.setMinutes(newDate.getMinutes() + Math.floor(minutes))
	
	// Set the seconds
	newDate.setSeconds(newDate.getSeconds() + Math.floor((minutes % 1) * 60))
	
	// Set the milliseconds
	newDate.setMilliseconds(newDate.getMilliseconds() + Math.floor((minutes % 1) * 60 * 1000))
	
	return newDate

}


// Draw a circle segment
function drawCircleSegment(context, radius, frameWidth, startValue, endValue, fillColor, strokeColor, lineWidth) {
	
	strokeColor = strokeColor || false
	lineWidth = lineWidth || false

	var startingAngle = (((startValue / 60) * 2) - .5) * Math.PI
	var endingAngle = (((endValue / 60) * 2) - .5) * Math.PI

	context.beginPath()
	context.lineJoin = 'round'
	context.arc(radius, radius, radius - frameWidth, startingAngle, endingAngle)
	context.lineTo(radius, radius)
	context.closePath()
	
	context.fillStyle = fillColor
	context.fill()
	if (lineWidth && strokeColor) {
		
		context.lineWidth = lineWidth
		context.strokeStyle = strokeColor
		context.stroke()
	
	}
	
}


function setCookie(id, key, value, expirationDate) {

	key = id + '_' + key
	
	if (!expirationDate) {
	    expirationDate = newDateMinutesFromNow(10 * 365 * 24 * 60)
	}

	var expirationDateString = expirationDate.toUTCString()
    var expires = 'expires=' + expirationDateString
	

	// debugLog('Storing value ' + value + ' for key ' + key + ' in cookie with expiration date set to ' + expirationDateString)
    document.cookie = key + '=' + value + '; ' + expires
    

}

function getCookie(id, key) {

	key = id + '_' + key
	keyWithEqualSign = key + '='
	
	var cookies = document.cookie.split(';')
    
    for	(var i = 0; i < cookies.length; i++) {
        
        var cookie = cookies[i]
        while (cookie.charAt(0) == ' ') {
	        cookie = cookie.substring(1)
		}
        
        if (cookie.indexOf(keyWithEqualSign) != -1) {
	        var value = cookie.substring(keyWithEqualSign.length, cookie.length)
	        // debugLog('Got value ' + value + ' for key ' + key + ' from cookie' )
	        return value
		}
    }

	// debugLog('Could not find key ' + key + ' in cookie' )
    return undefined
}