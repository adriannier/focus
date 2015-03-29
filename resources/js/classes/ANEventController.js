function ANEventController() {

	this.subscribers = new Array()
	
}

ANEventController.prototype.subscribe = function(eventName, callback) {
	
	if (!this.subscribers[eventName]) {
		// Initialize array for this particular event
		this.subscribers[eventName] = new Array()
	}
	
	var subscriber = {'eventName': eventName, 'callback': callback}
	
	this.subscribers[eventName].push(subscriber)
	
}


ANEventController.prototype.postEvent = function(eventName, obj) {
	
	var eventData = { 'eventName': eventName, 'obj': obj}
	
	if (this.subscribers[eventName]) {
		for (var i = 0; i < this.subscribers[eventName].length ; i++ ) {
			this.subscribers[eventName][i].callback(eventData)
		}	
	}
	
}