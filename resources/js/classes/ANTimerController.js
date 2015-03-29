function ANTimerController(id) {

	this.id = id || 'timer'
	
	debugLog('Creating new timer controller with id #' + this.id)
	this.eventController = undefined
	
	
	this.init()
	this.restoreState()
	

}

ANTimerController.prototype.setEventController = function(ev) {

	this.eventController = ev

	this.setupEvents()

}

ANTimerController.prototype.setupEvents = function(ev) {

	this.eventController.subscribe('TimerDateChanged', function(eventData) {
		this.updateOnce()
	}.bind(this))



}

// Initialize controller
ANTimerController.prototype.init = function() {
	
	// Determine the initial state of the controller
	
	this.paused = false
	this.stopped = true
	this.running = false
		
	this.date = false
	this.timeLeft = false
	this.secondsLeft = false
	this.timeLeftWhenPaused = false
	
	this.lastSeconds = undefined	
	this.accelerationFactor = 1
	
	debugLog('Initialized timer controller')
}

// Restore controller state
ANTimerController.prototype.restoreState = function() {
	
	var restoredPaused = getCookie(this.id, 'paused')

	if (restoredPaused === 'true') { 
		debugLog('Restoring paused state of timer controller')
		this.paused = true
		this.stopped = false
		this.running = false
		
		
		
	}
	
	var restoredRunning = getCookie(this.id, 'running')
	if (restoredRunning === 'true') { 
		debugLog('Restoring running state of timer controller')
		this.running = true 
		this.paused = false
		this.stopped = false
		

	}
	
	
	if (this.stopped) {
		this.date = false

	} else if (this.paused) {
		var restoredTimeLeftWhenPaused = getCookie(this.id, 'time_left_when_paused')
		if (restoredTimeLeftWhenPaused) { 
			debugLog('Restoring time left when paused to ' + restoredTimeLeftWhenPaused)
			this.timeLeftWhenPaused = parseInt(restoredTimeLeftWhenPaused )
			

			this.date = newDateMillisecondsFromNow(this.timeLeftWhenPaused)

			this.postEvent('TimerDidPause')
		}

	} else {
		var restoredDate = unserializeDate(getCookie(this.id, 'date'))
		if (isValidDate(restoredDate) && (restoredDate - new Date()) > 0) { 
			debugLog('Restoring date to ' + restoredDate)
			this.date = restoredDate 
		} else {
			debugLog('Will not restore date to ' + restoredDate + '. Stopping controller.')
			this.date = false
			this.paused = false
			this.stopped = true
			this.running = false
		}
	}
	
	
	
	
}

ANTimerController.prototype.saveState = function() {
	
	setCookie(this.id, 'paused', this.paused)
	setCookie(this.id, 'stopped', this.stopped)
	setCookie(this.id, 'running', this.running)
	setCookie(this.id, 'date', serializeDate(this.date), this.date)
	setCookie(this.id, 'time_left_when_paused', this.timeLeftWhenPaused)
	
}



ANTimerController.prototype.setMilliseconds = function(ms) {
	this.date = newDateMillisecondsFromNow(ms)
	this.postEvent('TimerDateChanged')
}

ANTimerController.prototype.setSeconds = function(s) {
	this.date = newDateSecondsFromNow(s)
	this.postEvent('TimerDateChanged')
}

ANTimerController.prototype.setMinutes = function(m) {
	this.date = newDateMinutesFromNow(m)
	this.postEvent('TimerDateChanged')
}

ANTimerController.prototype.setDate = function(d) {
	this.date = d
	this.postEvent('TimerDateChanged')
}


// Start the timer
ANTimerController.prototype.start = function() {
	
	debugLog('Starting timer')
	
	if (this.date === false || this.date === undefined) {
		throw 'ANTimerController: start(): Cannot start unset timer.'
	} 
	
	if (this.running) {
		throw 'ANTimerController: start(): Cannot start already running timer.'
	}
	
	this.postEvent('TimerWillStart')
	
	if (this.timeLeftWhenPaused !== false) {
		this.date = newDateMillisecondsFromNow(this.timeLeftWhenPaused)
	}
	
	this.paused = false
	this.stopped = false
	this.running = true
	this.saveState()
	
	// Start updates
	this.startUpdates()
	
	this.postEvent('TimerDidStart')
}

// Pause the timer
ANTimerController.prototype.pause = function() {
	
	debugLog('Pausing timer')
		
	if (this.date === false || this.date === undefined) {
		throw 'ANTimerController: start(): Cannot pause unset timer.'
	} 
	
	if (this.paused) {
		throw 'ANTimerController: start(): Cannot pause already paused timer.'
	}
	
	
	this.postEvent('TimerWillPause')
	
	// Stop updates
	this.stopUpdates()
	
	this.paused = true
	this.stopped = false
	this.running = false
	
	this.timeLeftWhenPaused = this.timeLeft
	
	this.saveState()	
	
	

	
	this.postEvent('TimerDidPause')
	
}

// Stop the timer
ANTimerController.prototype.stop = function() {
	
	debugLog('Stopping timer')
		
	if (this.date === false || this.date === undefined) {
		throw 'ANTimerController: start(): Cannot stop unset timer.'
	} 
	
	if (this.stopped) {
		throw 'ANTimerController: start(): Cannot stop already stopped timer.'
	}
	
	this.postEvent('TimerWillStop')
	
	// Start updates
	this.stopUpdates()
	
	
	this.init()
	this.saveState()
		

	
	this.postEvent('TimerDidStop')
}


ANTimerController.prototype.setAccelerationFactor = function(n) {

	this.accelerationFactor = n
	if (n == 1) { this.postEvent('TimerDateChanged') }
	
	this.stopUpdates()
	this.startUpdates()

}

ANTimerController.prototype.updateOnce = function() {
	this.saveState()
	this.update(false)
}

ANTimerController.prototype.startUpdates = function() {
	this.saveState()
	this.update(true)
}

ANTimerController.prototype.stopUpdates = function() {
	if (this.updateTimeoutId) { clearTimeout(this.updateTimeoutId) }
}

ANTimerController.prototype.update = function(keepUpdating) {
	
	if (this.paused || this.stopped) { keepUpdating = false }
	
	if (this.accelerationFactor > 1) {
		
		this.date = newDateMillisecondsFromNow((this.date - new Date()) - (1000 * this.accelerationFactor))
		
	
	} 
	
	if (this.date !== false) {
		this.timeLeft = this.date - new Date()
		this.secondsLeft = Math.round(this.timeLeft / 1000)
	} else {
		this.timeLeft = false
		this.secondsLeft = false
	}
	
	// Do we need to post an TimerSecondsDidChange event?
	if (this.accelerationFactor > 1 || this.lastSeconds != this.secondsLeft) {
		this.lastSeconds = this.secondsLeft
		this.postEvent('TimerSecondsDidChange')
	}
	
	// Timer ends
	if (this.timeLeft !== false && this.timeLeft <= -1000) {
		this.postEvent('TimerWillEnd', false)
		this.stop()
		this.postEvent('TimerDidEnd')
		return
	}
	
	
	
	if (keepUpdating) {
		// Timer keeps going
		var updateInterval
		if (this.accelerationFactor > 1) {
			updateInterval = 33
		} else {
			updateInterval = this.timeLeft % 1000
		}
	
		this.updateTimeoutId = setTimeout(
			function() { 
				if (this.paused === false) {
					this.update(true)
				}
			}.bind(this), updateInterval)
	}
	
}

ANTimerController.prototype.postEvent = function(eventName, asynchronously) {
	
	if (asynchronously === undefined) { asynchronously = true }
	
	if (this.eventController) {
		if (asynchronously) {
			setTimeout(function() {
				this.eventController.postEvent(eventName, this)
			}.bind(this), 0)
		} else {
			this.eventController.postEvent(eventName, this)
		}
		
	}
}