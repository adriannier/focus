function ANFocusTimer(id) {

	this.id = id || 'timer'
	
	debugLog('Creating new focus timer with id #' + this.id)
			
	this.eventController = new ANEventController()	

	this.ui = new ANTimerUI(id, this)
	this.ui.setEventController(this.eventController)
	
	var pageElement = document.getElementById(this.id)
	if (pageElement) {
		this.ui.insertIntoElement(pageElement)
	}
	
	this.controller = new ANTimerController(id)
	this.controller.setEventController(this.eventController)
	
	this.setupEvents()
	
	this.mode = 'Focus'
	var restoredMode = getCookie(this.id, 'mode')
	if (restoredMode) { 
		debugLog('Restoring ' + restoredMode + ' mode')
		this.mode = restoredMode
	}
	
	this.timerEndedWithAccelerationFactor = 1
	
	this.update()
				
}

// Setup timer events
ANFocusTimer.prototype.setupEvents = function() {

	// Time is up
	this.eventController.subscribe('TimerWillEnd', function(eventData) {
		this.timerEndedWithAccelerationFactor = this.controller.accelerationFactor
	}.bind(this))
	
	// Timer ended
	this.eventController.subscribe('TimerDidEnd', function(eventData) {
		this.toggleMode()
	}.bind(this))
	
	// Update ready
	window.applicationCache.addEventListener('updateready', this.onUpdateReady)
	if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
		this.onUpdateReady()
	}
	
	
}

// Handle a new version event
ANFocusTimer.prototype.onUpdateReady = function() {
	debugLog('New version available. Reloading.')
	location.reload()
}

ANFocusTimer.prototype.update = function() {
	
	this.postEvent('TimerInterfaceShouldUpdate')

	if (this.controller.stopped) { 
		if (this.mode == 'Focus') {
			this.controller.setMinutes(45)
			this.ui.playFocusSound()
		} else if (this.mode == 'Relax') {
			this.controller.setMinutes(15)
			this.ui.playRelaxSound()
		}
		this.controller.start()
		
	} else {
		this.controller.startUpdates()
	}


	
	
}
	
// Set the current mode
ANFocusTimer.prototype.setMode = function(newMode, storeMode) {
	
	debugLog('Setting mode to ' + newMode)
	
	storeMode = storeMode || true
	
	this.mode = newMode
	this.ui.setDisplayedMode(newMode)
	
	
	
	if (this.controller.accelerationFactor == 1) {
		if (this.controller.stopped === false) { this.controller.stop() }		
	}
	

	
	if (this.controller.date === false) {
		if (this.mode == 'Focus') {
			this.controller.setMinutes(45)
			this.ui.playFocusSound()
			
		} else if (this.mode == 'Relax') {
			this.controller.setMinutes(15)
			this.ui.playRelaxSound()
		}
		
	}
	
	if (this.controller.accelerationFactor == 1) {
		if (this.controller.running === false) {
			this.controller.start()		
		}
	}
	
	this.controller.setAccelerationFactor(this.timerEndedWithAccelerationFactor)

	if (storeMode) { setCookie(this.id, 'mode', this.mode, this.controller.date) }
	
}
	
// Switch between Focus and Relax mode
ANFocusTimer.prototype.toggleMode = function() {

	debugLog('Toggling mode')
	
	if (this.mode == 'Focus') {
		this.setMode('Relax')
	} else {
		this.setMode('Focus')
	}
	
}





ANFocusTimer.prototype.postEvent = function(eventName) {
	if (this.eventController) {
		setTimeout(function() {
			this.eventController.postEvent(eventName, this)
		}.bind(this), 0)
	}
}