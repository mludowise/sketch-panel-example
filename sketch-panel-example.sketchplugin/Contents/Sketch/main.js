@import "PanelManager.js"

// Tell cocoascript to retain information for action handlers
COScript.currentCOScript().setShouldKeepAround(true);

// Called with the Hide Panel menu item
function hidePanel(context) {
    Utils.debug(function() {
        var panelManager = new PanelManager(context.document)
        panelManager.hidePanel()
    })
}

// Called with the Show Panel menu item
function showPanel(context) {
    Utils.debug(function() {
        var panelManager = new PanelManager(context.document)
        panelManager.showPanel()
    })
}

// SelectionChanged.finish action
// Called when the user changes their selection
function selectionChanged(context) {
    Utils.debug(function() {
        var action = context.actionContext
        var panelManager = new PanelManager(action.document)
        panelManager.updatePanelContents()
    })
}

// OpenDocument action
// Called when the whenever a document is opened in Sketch
function openDocument(context) {
    Utils.debug(function() {
        // Slight hack - the OpenDocument action occurs before the MSDocument is
        // actually loaded, so we'll use a timer to check when it's done loading
        Utils.waitForDocumentToLoad(function(document) {
            var panelManager = new PanelManager(document)
            panelManager.documentOpened()
        })
    })
}

@import "utils.js"
