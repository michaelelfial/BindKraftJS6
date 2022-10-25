(function() {

    var Base = Class("Base");

    /**
     * This control will do nothing if the browser does not support Barcodes
     */
    function BarcodeReadControl() {
        Base.apply(this, arguments);
    }
    BarcodeReadControl.Inherit(Base,"BarcodeReadControl")
        .Implement(ICustomParameterizationStdImpl,"formats")
        .ImplementReadProperty("functional", new InitializeBooleanParameter("Indicates if the control is functional under the current conditions.", false))
        .ImplementProperty("formats", new InitializeArray("List of formats to detect, default is qr_code, can be coma separated string too.",["qr_code"]))
        .ImplementReadProperty("detector", new InitializeArray("Barcode detector when active.",null))
        .ImplementReadProperty("codes", new InitializeArray("Last detected codes - initially empty"))
        .ImplementProperty("source", new Initialize("Source to observe when asked."),null,function(oval, newval) {
            if (newval != null) {
                this.callAsync(this.onDetectSource);
            }
        }, true);
        
    BarcodeReadControl.prototype.detectedevent = new InitializeEvent("Fired when something is detected (successfully), but not when cleared and so on.");

    BarcodeReadControl.prototype.get_formats = function() {
        if (Array.isArray(this.$formats)) return this.$formats;
        if (typeof this.$formats == "string") return this.$formats.split(",").Select((i, f) => (typeof f == "string")?f.trim:null);
        return null;
    }
    BarcodeReadControl.prototype.$testEnvironment = function() {
        if ( 'BarcodeDetector' in window ) {
            this.$functional = true;
          }else {
            this.$functional = false;
          }
          return this.get_functional();
    }
    BarcodeReadControl.prototype.init = function() {
        this.$testEnvironment();
    }
    BarcodeReadControl.prototype.$detected = new InitializeArray("This array will be changed as new detection occurs");
    BarcodeReadControl.prototype.clearDetected = function() {
        this.$detected = [];
    }
    BarcodeReadControl.prototype.get_detected = function() {
        return this.$detected;
    }
    BarcodeReadControl.prototype.get_firstDetected = function() {
        var d = this.get_detected();
        if (Array.isArray(d) && d.length > 0) {
            return d[0];
        }
        return null;
    }
    BarcodeReadControl.prototype.get_firstDetectedValue = function() {
        var d = this.get_detected();
        if (Array.isArray(d) && d.length > 0) {
            return d[0].rawValue;
        }
        return null;
    }

    //#region Ready/Unready
    BarcodeReadControl.prototype.get_isactive = function() {
        return this.get_detector() != null;
    }
    BarcodeReadControl.prototype.Activate = function() {
        if (!this.get_functional()) return false;
        this.clearDetected();
        if (this.get_detector() == null) {
            this.$detector = new BarcodeDetector({
                formats: this.get_formats()
            });
            this.get_codes().splice(0);
            return true;
        } else {
            return false;
        }
    }
    BarcodeReadControl.prototype.Deactivate = function() {
        if (this.$detector != null) {
            this.$detector = null;
        }
    }
    //#endregion

    //#region Detection
    BarcodeReadControl.prototype.detect = function(image) {
        this.clearDetected();
        if (!this.get_isactive()) {
            return Operation.Failed("BarcodeReadControl not active");
        }
        if (image instanceof Blob ||
            image instanceof HTMLImageElement || image instanceof HTMLCanvasElement ||
            image instanceof ImageData
            ) {
            var op = Operation.FromPromise(this.get_detector().detect(image));
            op.onsuccess(results => {
                this.clearDetected();
                if (Array.isArray(results) && results.length > 0) {
                    this.$detected = Array.createCopyOf(results);
                    this.detectedevent.invoke(this, results);
                }
            });
            return op;
        } else {
            return Operation.Failed("BarcodeReadControl - the argument type is not supported");
        }
    }
    BarcodeReadControl.prototype.onDetectSource = function() {
        if (this.get_source() != null) {
            var op = this.detect(this.get_source());
            op.onfailure(err => {
                // TODO: Do something with the error (but what?)
            });
        }
    }
    //#endregion
})();