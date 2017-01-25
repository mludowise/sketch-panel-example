const PACKAGE = "com.mludowise.sketchpanelexample"

// These IDs will be assigned to the custom NSView components that we will
// create. We'll use them whenever we need to retreive a specific view using the
// subviewWithID utility.
const PANEL_ID = PACKAGE + ".panel"
const LABEL_ID = PACKAGE + ".label"
const BUTTON_ID = PACKAGE + ".button"

// These keys will be used to store and retreive display preferences in NSUserDefaults
const PANEL_VISIBLE_KEY = PACKAGE + ".panel-visible"

function PanelManager(document) {
    // Get NSUserDefaults so we can save whether the user displayed the panel or not
    var defaults = NSUserDefaults.standardUserDefaults()

    // Get the NSWindow for the current document and its primary NSView
    var window = document.valueForKey("documentWindow")
    var contentView = window.contentView()

    // Get the NSView the ID "MSMainSplitView". This is the view in Sketch that
    // contains the layers list, canvas, and inspector
    var mainSplitView = contentView != null ? Utils.subviewWithID(contentView, "MSMainSplitView") : null

    // Get the NSView for our panel as well as the infoButton and label
    // displayed inside the view. These can be retrieved based on their unique
    // identifiers
    var panel = mainSplitView != null ? Utils.subviewWithID(mainSplitView, PANEL_ID) : null
    var infoButton = panel != null ? Utils.subviewWithID(panel, BUTTON_ID) : null
    var panelLabel = panel != null ? Utils.subviewWithID(panel, LABEL_ID) : null

    // Displays an alert showing the information for the currently selected layer
    function alertLayerInfo(sender) {
        var layer = document.selectedLayers().firstLayer();
        Utils.alert("x: " + layer.origin().x + ", y: " + layer.origin().y, layer.name())
    }

    // Creates a new panel and adds it to the main split view in Sketch
    this.showPanel = function() {
        // Check if the view has already been added
        if (panel != null) {
            return
        }

        // We must have access to the main split view in Sketch to add the panel
        if (mainSplitView == null) {
            return
        }

        // Use the full height of the parent view & default width to 100pt
        var panelHeight = mainSplitView.frame().size.height
        var panelWidth = 200
        var titleHeight = 28

        // Create view
        panel = NSView.alloc().initWithFrame(NSMakeRect(0, 0, panelWidth, panelHeight))
        panel.setIdentifier(PANEL_ID)

        // Create a title bar
        var titleView = NSView.alloc().initWithFrame(NSMakeRect(-1, panelHeight - titleHeight +1, panelWidth + 2, titleHeight))
        titleView.setWantsLayer(true);
        titleView.layer().setBackgroundColor(CGColorCreateGenericGray(.96, 1))
        titleView.layer().masksToBounds = true
        titleView.layer().borderWidth = 1
        titleView.layer().setBorderColor(CGColorCreateGenericGray(.72, 1))
        panel.addSubview(titleView)

        // Add a title
        var titleLabel = NSTextField.alloc().initWithFrame(NSMakeRect(0, 0, 1, 1))
        titleLabel.setStringValue("Custom Inspector")
        titleLabel.setFont(NSFont.boldSystemFontOfSize(12))
        titleLabel.setTextColor(NSColor.colorWithCGColor(CGColorCreateGenericGray(.32, 1)))
        titleLabel.setBezeled(false)
        titleLabel.setDrawsBackground(false)
        titleLabel.setEditable(false)
        titleLabel.setSelectable(false)
        titleLabel.sizeToFit()
        titleLabel.setFrameOrigin(NSMakePoint(5, (titleHeight - titleLabel.frame().size.height) / 2)) // Left middle
        titleView.addSubview(titleLabel)

        // Add close button which removes the view when clicked
        var closeButton = NSButton.alloc().initWithFrame(NSMakeRect(panelWidth - titleHeight, 0, titleHeight, titleHeight)) // We'll resize this later
        closeButton.setTitle("×")
        closeButton.setFont(NSFont.systemFontOfSize(16))
        closeButton.bezelStyle = NSSmallSquareBezelStyle   //NSSmallSquareBezelStyle
        closeButton.setBordered(false)
        // closeButton.sizeToFit()
        // closeButton.setFrameOrigin(NSMakePoint(panelWidth - closeButton.frame().size.width, (titleHeight - closeButton.frame().size.height) / 2)) // Right middle
        closeButton.setCOSJSTargetFunction(hidePanel)
        closeButton.setAction("callAction:")
        titleView.addSubview(closeButton)

        // Create a label for that displays the current selection in the panel
        panelLabel = NSTextField.alloc().initWithFrame(NSMakeRect(5, panelHeight - titleHeight - 30, panelWidth, 20))
        panelLabel.setIdentifier(LABEL_ID)
        panelLabel.setFont(NSFont.systemFontOfSize(12))
        panelLabel.setBezeled(false)
        panelLabel.setDrawsBackground(false)
        panelLabel.setEditable(false)
        panelLabel.setSelectable(false)
        panel.addSubview(panelLabel)

        // Add a button that opens an alert displaying information for the current selection
        infoButton = NSButton.alloc().initWithFrame(NSMakeRect(0, panelHeight - titleHeight - 70, 1, 1)) // We'll resize this later
        infoButton.setTitle("Show Info")
        infoButton.bezelStyle = NSRoundedBezelStyle
        infoButton.sizeToFit()
        // infoButton.setFrameOrigin(NSMakePoint(5, panelHeight - 100)) // Center horizontally
        infoButton.setIdentifier(BUTTON_ID)
        infoButton.setCOSJSTargetFunction(alertLayerInfo)
        // infoButton.setAction("callAction:")
        panel.addSubview(infoButton)

        // Update the panelLabel and infoButton based on the current selection
        updatePanelContents()

        // Add this view to the left of the main inspector. It's important that
        // the view cannot be the right-most view since Sketch assumes the
        // right-most view is the inspector and doesn't allow that view to be
        // resized.
        var inspectorView = mainSplitView.subviews().lastObject()
        if (inspectorView != null) {
            mainSplitView.addSubview_positioned_relativeTo(panel, NSWindowBelow, inspectorView)
        } else {
            mainSplitView.addSubview(panel)
        }

        // Resizes everything to accomodate the new view.
        mainSplitView.adjustSubviews()

        // Remember that the user chose show the panel & default to this next
        // time a document is opened
        defaults.setObject_forKey(true, PANEL_VISIBLE_KEY)
        defaults.synchronize()
    }

    // Removes the panel from its superview
    function hidePanel() {
        // If view doesn't exist yet, nothing to do
        if (panel == null) {
            return
        }

        // Remove the view
        panel.removeFromSuperview()

        // Resizes everything after view is removed
        mainSplitView.adjustSubviews()

        // Remember that the user chose to close the panel & default to this
        // next time a document is opened
        defaults.setObject_forKey(false, PANEL_VISIBLE_KEY)
        defaults.synchronize()
    }

    this.hidePanel = function() {
        hidePanel()
    }

    // Updates the panelLabel based on the current selection and hides the
    // infoButton if there is less than or more than one item selected.
    function updatePanelContents() {
        var selectedLayers = document.selectedLayers()
        var labelText = ""

        if (!selectedLayers.containsLayers()) {
            labelText = "Nothing Selected"
            infoButton.hidden = true
        } else if (selectedLayers.containsMultipleLayers()) {
            labelText = selectedLayers.containedLayersCount() + " Items Selected"
            infoButton.hidden = true
        } else {
            labelText = selectedLayers.firstLayer().name()
            infoButton.hidden = false
        }

        panelLabel.setStringValue(labelText)
    }

    this.updatePanelContents = function() {
        // Don't do anything if panel isn't open
        if (panel == null) {
            return
        }

        // Update label and button
        updatePanelContents()
    }

    // Open panel if it was open the last time the user had Sketch open
    this.documentOpened = function() {
        var panelWasOpen = defaults.objectForKey(PANEL_VISIBLE_KEY)
        if (panelWasOpen == true || panelWasOpen == undefined) {
            this.showPanel();
        }
    }
}

@import "utils.js"
