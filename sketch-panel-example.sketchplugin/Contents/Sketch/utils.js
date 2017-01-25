var Utils = {}

function runCommand(cmd, path){
	var task = NSTask.alloc().init()
	task.setLaunchPath("/bin/bash")
	task.setArguments(cmd)
	task.launch()
}

// Displays an alert with an error sound
Utils.alertError = function(msg, title) {
	runCommand(['-c', 'afplay /System/Library/Sounds/Basso.aiff'])
	this.alert(msg, title)
}

// Displays an alert
Utils.alert = function(msg, title) {
	title = title || "Alert"
	var app = NSApplication.sharedApplication()
    app.displayDialog_withTitle(msg, title)
}

// Utility to exit the plugin
Utils.exit = function() {
	throw(null)
}

// Wraps the callback in a try/catch block and displays any exceptions in an
// error alert as well as in the console.
Utils.debug = function(callback) {
    try {
        callback()
    } catch(e) {
		if (e != null) { // Null error means plugin was exited without error
			log(e)
			this.alertError(e, "Plugin Error")
		}
	}
}

// Utility that iterates through an NSArray, since the JS for syntax doesn't work
Utils.forEach = function(array, callback) {
    for (var i = 0; i < array.count(); i++) {
        var object = array.objectAtIndex(i)
        var result = callback(object, i, array)
        if (result != undefined) {
            return result
        }
    }
}

// Waits until the document has loaded and then calls the completionHandler
Utils.waitForDocumentToLoad = function(completionHandler) {
    coscript.scheduleWithInterval_jsFunction(0.5, function() {
        var document = MSDocument.currentDocument()
        if (document == null) {
            waitForDocumentToLoad(completionHandler)
        } else {
            completionHandler(document)
        }
    })
}

// Utility function to retrieve a subview of an NSView based on its identifier
Utils.subviewWithID = function(parent, id) {
    return Utils.forEach(parent.subviews(), function(subview) {
        if (subview.identifier() == id) {
            return subview
        }
    })
}
