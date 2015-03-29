function ANTimerUI(id, app) {
	
	this.id = id
	this.app = app
	
	this.previousSeconds = 0
	
	this.visible = false
	
	this.showSegmentsAs = 'minutes'
	
	this.wrapperDiv = 		newDiv('timer_wrapper')
	this.timerDiv = 		newDiv('timer')
	this.modeDisplayDiv = 	newDiv('timer_mode_display')
	this.timeDisplayDiv = 	newDiv('timer_time_display')
	this.animationCanvas = 	newCanvas('timer_animation')
	this.infoDiv = 			newDiv('timer_info')
	
	this.timerDiv.appendChild(this.modeDisplayDiv)
	this.timerDiv.appendChild(this.timeDisplayDiv)
	this.timerDiv.appendChild(this.animationCanvas)
	this.timerDiv.appendChild(this.infoDiv)
			
	this.wrapperDiv.appendChild(this.timerDiv)
	
	// Touch and mouse event properties
	this.mouseDownTargetClassName = undefined
	this.mouseUpTargetClassName = undefined
	this.mouseDownActionTimeoutId = undefined
	this.mouseDownActionDelay = 300
	this.mouseHeldDown = false
	
	this.timeReadout = ''
	this.timeBlinkingIntervalId = undefined
	
	this.theme = 'bright'
	var restoredTheme = getCookie(this.id, 'theme')
	if (restoredTheme) { 
		debugLog('Restoring ' + restoredTheme + ' theme')
		this.theme = restoredTheme
	}	
	
	this.eventController = undefined
	
	this.focusSound = this.loadSound('focus')
	this.relaxSound = this.loadSound('relax')
	
}


ANTimerUI.prototype.setEventController = function(ev) {

	this.eventController = ev

	this.setupEvents()

}

// Setup timer events
ANTimerUI.prototype.setupEvents = function() {

	// Timer interface should update
	this.eventController.subscribe('TimerInterfaceShouldUpdate', function(eventData) {


		document.body.className = this.theme
		this.setDisplayedMode(this.app.mode)
		this.updateTimeDisplay()
		this.updateClock()
		
		if (this.app.controller.paused) { this.startTimeBlinking() }
		
	}.bind(this))
	
	// Timer will start
	this.eventController.subscribe('TimerWillStart', function(eventData) {
		this.stopTimeBlinking()
	}.bind(this))
	
	// Timer seconds changed
	this.eventController.subscribe('TimerSecondsDidChange', function(eventData) {
		this.updateTimeDisplay(eventData.obj.secondsLeft)
		this.updateClock(eventData.obj.timeLeft)
		
	}.bind(this))
	
	// Timer paused
	this.eventController.subscribe('TimerDidPause', function(eventData) {
		this.startTimeBlinking()

	}.bind(this))
	
	// Mouse held down
	this.eventController.subscribe('MouseHeldDown', function(eventData) {
		var target = eventData.obj.mouseDownTargetClassName
		if (this.app.controller.running && target == 'timer_animation') {
			this.app.controller.setAccelerationFactor(10)
		}
	}.bind(this))
	
	// Mouse up after being held down
	this.eventController.subscribe('MouseUpAfterBeingHeldDown', function(eventData) {
		var target = eventData.obj.mouseDownTargetClassName
		if (this.app.controller.running && target == 'timer_animation') {
			this.app.timerEndedWithAccelerationFactor = 1
			this.app.controller.setAccelerationFactor(1)			
		}
		
	}.bind(this))


	
	// Mouse button released
	this.eventController.subscribe('MouseUpOnSameTarget', function(eventData) {
		
		var target = eventData.obj.mouseUpTargetClassName
		
		if (target == 'timer_mode_display') {
			this.app.toggleMode()
		
		} else if (target == 'timer_animation') {
			this.toggleTheme()

		} else if (target == 'timer_time_display') {
			
			if (this.app.controller.paused) {
				this.app.controller.start()
			} else {
				this.app.controller.pause()	
			}
		
		} else {
			debugLog('Clicked ' + target)
		}
		
	}.bind(this))

	

	
	
}


// Play the focus sound
ANTimerUI.prototype.playFocusSound = function() {
	
	if (this.relaxSound) { this.relaxSound.pause() }

	if (this.focusSound) {
		
		if (this.focusSound.currentTime && this.focusSound.currentTime > 0) {
			this.focusSound.pause()
			this.focusSound.currentTime = 0
		}
		
		debugLog('Playing focus sound')
		this.focusSound.play()
	}
}

// Play the relax sound
ANTimerUI.prototype.playRelaxSound = function() {
	
	if (this.focusSound) { this.focusSound.pause() }

	if (this.relaxSound) {
		
		if (this.relaxSound.currentTime && this.relaxSound.currentTime > 0) {
			this.relaxSound.pause()
			this.relaxSound.currentTime = 0
		}

		debugLog('Playing relax sound')		
		this.relaxSound.play()
	}
}

// Load a sound
ANTimerUI.prototype.loadSound = function(soundName) {

	var a 		= new Audio()
	var s 		= document.createElement('source')
	s.type 		= 'audio/mp4'
	s.src 		= 'resources/audio/' + soundName + '.m4a'
	a.appendChild(s)

	return a

}

// Set the timer theme
ANTimerUI.prototype.setTheme = function(newTheme, storeTheme) {
	
	storeTheme = storeTheme || true
	
	this.theme = newTheme
	document.body.className = newTheme

	if (storeTheme) { setCookie(this.id, 'theme', this.theme) }
	
	this.updateClock()
}

// Toggle the timer theme
ANTimerUI.prototype.toggleTheme = function() {
	if (this.theme == 'bright') {
		this.setTheme('dark')
	} else {
		this.setTheme('bright')
	}
}


// Set the displayed mode
ANTimerUI.prototype.setDisplayedMode = function(mode) {
	
	this.modeDisplayDiv.innerHTML = mode
	
}

// Start to blink the time
ANTimerUI.prototype.startTimeBlinking = function(s) {
	
	this.timeDisplayDiv.innerHTML = ':'
	
	this.timeBlinkingIntervalId = setInterval(function() {
		if (this.timeDisplayDiv.innerHTML == this.timeReadout) {
			this.timeDisplayDiv.innerHTML = ':'
		} else {
			this.timeDisplayDiv.innerHTML = this.timeReadout
		}
	}.bind(this), 600)
}

// Stop the time display from blinking
ANTimerUI.prototype.stopTimeBlinking = function(s) {
	
	clearInterval(this.timeBlinkingIntervalId)
	this.timeDisplayDiv.innerHTML = this.timeReadout
	
}

// Update the remaining time display
ANTimerUI.prototype.updateTimeDisplay = function(s) {
	
	if (this.visible === false) { return }
		
	
	

	if (s > 0 && s <= (60 * 60)) {
		var minutes = Math.floor(s / 60)
		var seconds = Math.floor(s % 60)
		if (minutes < 10 ) { minutes = '0' + minutes }
		if (seconds < 10 ) { seconds = '0' + seconds }
		this.timeReadout =  minutes + ':' + seconds
	} else {
		this.timeReadout = '00:00'
	}
	
	
	if (this.timeDisplayDiv.innerHTML != this.timeReadout) {
		this.postEvent('TimeDisplayWillChange')

		this.timeDisplayDiv.innerHTML = this.timeReadout	
		this.postEvent('TimeDisplayDidChange')
	}
	
}

// Draw the clock
ANTimerUI.prototype.updateClock = function(s) {

	s = s || this.previousSeconds
	
	if (this.visible === false) { return }
	
	if (s < 0) { s = 0 }
	
	if (this.showSegmentsAs == 'seconds') {
		this.drawClockWithSegment(0, s / 1000)
	} else if (this.showSegmentsAs == 'minutes') {
		this.drawClockWithSegment(0, s / 1000 / 60)	
	}
	
	this.previousSeconds = s			
}


// Draw a clock with a segment
ANTimerUI.prototype.drawClockWithSegment = function(segmentStart, segmentEnd) {

	
	
	var context = this.animationCanvas.getContext('2d')
	context.clearRect(0, 0, this.animationCanvas.width, this.animationCanvas.height)
	
	var clockFrameColor   = this.colorSetting('ClockFrameColor')
	var clockFrameWidth   = this.setting('ClockFrameWidth')
	var clockFrameRadius  = this.setting('ClockFrameRadius')
	var segmentFillColor  = this.colorSetting('SegmentFillColor')
	var segmentFrameColor = this.colorSetting('SegmentFrameColor')
	var segmentFrameWidth = this.setting('SegmentFrameWidth')
		
	// Clock frame
	context.beginPath()
	context.strokeStyle = clockFrameColor
	context.lineWidth = clockFrameWidth
	context.arc(clockFrameRadius, clockFrameRadius, clockFrameRadius - clockFrameWidth, 0, 2 * Math.PI)
	context.closePath()
	context.stroke()
	
	// Circle segment
	drawCircleSegment(
		context, 
		clockFrameRadius, 
		clockFrameWidth, 
		segmentStart,
		segmentEnd,
		segmentFillColor, 
		segmentFrameColor, 
		segmentFrameWidth
	)
	
}



// Add the timer to an HTML element on the page
ANTimerUI.prototype.insertIntoElement = function(e) {
	
	// debugLog('Inserting into element ' + e + ' with size ' + e.offsetWidth + 'x' + e.offsetHeight)
	
	this.animationCanvas.width = 400 // e.offsetWidth
	this.animationCanvas.height = 400 // e.offsetHeight
	this.addEventListeners()
	e.appendChild(this.wrapperDiv)
	
	this.visible = true
	
}


// Add the event listeners
ANTimerUI.prototype.addEventListeners = function() {
	
	// Disable text selection
	this.wrapperDiv.onselectstart 		= function () { return false }
	this.timerDiv.onselectstart 		= function () { return false }
	this.modeDisplayDiv.onselectstart 	= function () { return false }
	this.timeDisplayDiv.onselectstart 	= function () { return false }
	this.animationCanvas.onselectstart 	= function () { return false }
	this.infoDiv.onselectstart 			= function () { return false }
	
	var mouseDownFunction = function() { this.mouseDown() }.bind(this)
	var mouseUpFunction = function() { this.mouseUp() }.bind(this)
	
	// Add click and mouse down event to whole timer area
	if (this.timerDiv.addEventListener) {  
		// all browsers except IE before version 9
		if (isTouchDevice()) {
			this.timerDiv.addEventListener('touchstart', mouseDownFunction, false)
			this.timerDiv.addEventListener('touchend', 	 mouseUpFunction, 	false)
		} else {
			this.timerDiv.addEventListener('mousedown',  mouseDownFunction, false)
			this.timerDiv.addEventListener('mouseup', 	 mouseUpFunction, 	false)
		}					

	} else {

		if (this.timerDiv.attachEvent) {   
			// IE before version 9
			this.timerDiv.attachEvent('mousedown', 		mouseDownFunction)
			this.timerDiv.attachEvent('mouseup', 		mouseUpFunction)
		}

	}

}



// Handle a mouse down event
ANTimerUI.prototype.mouseDown = function(e) {
	
	this.mouseDownTargetClassName = this.eventTargetClassName(e)
	
	this.postEvent('MouseDown')
	
	this.mouseHeldDown = false
	
	if (this.mouseDownTargetClassName == 'timer_animation') {
		this.mouseDownActionTimeoutId = setTimeout(function() { 
			this.mouseDownAction() 
		}.bind(this), this.mouseDownActionDelay)
		
	}
	
}


// Perform the mouse down action
ANTimerUI.prototype.mouseDownAction = function() {
	
	this.mouseHeldDown = true
	this.postEvent('MouseHeldDown')
	
}
	
// Handle a mouse up event
ANTimerUI.prototype.mouseUp = function(e) {
	
	this.mouseUpTargetClassName = this.eventTargetClassName(e)
	
	this.postEvent('MouseUp')
	
	// Clear the mouse down action timeout
	clearTimeout(this.mouseDownActionTimeoutId)	
	this.mouseDownActionTimeoutId = undefined
	
	if (this.mouseHeldDown) {
		this.mouseHeldDown = false
		this.postEvent('MouseUpAfterBeingHeldDown')
	} else if (this.mouseDownTargetClassName == this.mouseUpTargetClassName) {
		this.postEvent('MouseUpOnSameTarget')
	}

}

// Get the class name for an event's target
ANTimerUI.prototype.eventTargetClassName = function(e) {
	e = e || window.event
	return (e.target || e.srcElement).className
}


// Return a setting
ANTimerUI.prototype.setting = function(settingName) {
	
	if (settingName == 'SegmentFrameWidth') {			
		return 6
	} else if (settingName == 'ClockFrameWidth') {
		return 6
	} else if (settingName == 'ClockFrameRadius') {
		return 200
	}
	
	
}

// Return a color setting
ANTimerUI.prototype.colorSetting = function(settingName) {
	
	if (this.theme == 'bright') {
		if (settingName == 'ClockFrameColor') {
			return '#000'
		} else if (settingName == 'SegmentFillColor') {
			return '#f3f3f3' 
		} else if (settingName == 'SegmentFrameColor') {			
			return '#000'
		}
	} else if (this.theme == 'dark') {
		if (settingName == 'ClockFrameColor') {
			return '#ccc' 
		} else if (settingName == 'SegmentFillColor') {
			return '#333'
		} else if (settingName == 'SegmentFrameColor') {			
			return '#ccc'
		}
	}
		
}



ANTimerUI.prototype.postEvent = function(eventName) {
	if (this.eventController) {
		setTimeout(function() {
			this.eventController.postEvent(eventName, this)
		}.bind(this), 0)
	}
}