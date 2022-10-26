(function() {

    var Base = Class("Base");

    /**
     * This control will do nothing if the browser does not support Barcodes
     */
    function BarcodeReadControl() {
        Base.apply(this, arguments);
    }
    BarcodeReadControl.Inherit(Base,"BarcodeReadControl")
        .Implement(ICustomParameterizationStdImpl,"formats","autoactivate")
        .ImplementReadProperty("functional", new InitializeBooleanParameter("Indicates if the control is functional under the current conditions.", false))
        .ImplementReadProperty("autoactivate", new InitializeBooleanParameter("If passed as a parameter activates the control on creation. Should not be used in bindings!", true))
        .ImplementProperty("formats", new InitializeArray("List of formats to detect, default is qr_code, can be coma separated string too.",["qr_code"]))
        .ImplementReadProperty("detector", new Initialize("Barcode detector when active.",null))
        .ImplementProperty("source", new Initialize("Source to observe when asked."),null,function(oval, newval) {
            if (newval != null) {
                this.callAsync(this.onDetectSource);
            }
        }, true)
        .ImplementActiveProperty("status", new InitializeStringParameter("various status reports", null));
        
    BarcodeReadControl.prototype.detectedevent = new InitializeEvent("Fired when something is detected (successfully), but not when cleared and so on.");

    BarcodeReadControl.prototype.get_formats = function() {
        if (Array.isArray(this.$formats)) return this.$formats;
        if (typeof this.$formats == "string") return this.$formats.split(",").Select((i, f) => (typeof f == "string")?f.trim:null);
        return null;
    }
    BarcodeReadControl.prototype.$testEnvironment = function() {
        if ( 'BarcodeDetector' in window ) {
            this.$functional = true;
            this.$status = "BarcodeDetector is available. The control is functional.";
          }else {
            this.$functional = false;
          }
          return this.get_functional();
    }
    BarcodeReadControl.prototype.init = function() {
        this.$testEnvironment();
        if (this.get_functional() && this.get_autoactivate()) {
            this.ExecAfterFinalInit(function() {
                this.Activate();
            })
        }
    }
    BarcodeReadControl.prototype.$detected = new InitializeArray("This array will be changed as new detection occurs");
    BarcodeReadControl.prototype.clearDetected = function() {
        this.$detected = [];
        this.set_status("Cleared the detected codes.")
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
        this.set_status("Activating ...");
        if (this.get_detector() != null) {
            this.$detector = new BarcodeDetector({
                formats: this.get_formats()
            });
            this.set_status("Activating ... Active");
            return true;
        } else {
            this.set_status("Activating ... Failed");
            return false;
        }
    }
    BarcodeReadControl.prototype.Deactivate = function() {
        if (this.$detector != null) {
            this.set_status("Deactivated");
            this.$detector = null;
        }
    }
    //#endregion

    //#region Detection
    BarcodeReadControl.prototype.detect = function(image) {
        this.clearDetected();
        this.set_status("Detecting ...");
        if (!this.get_isactive()) {
            this.set_status("Detecting ... Error: not active.");
            return Operation.Failed("BarcodeReadControl not active");
        }
        if (image instanceof Blob ||
            image instanceof HTMLImageElement || image instanceof HTMLCanvasElement ||
            image instanceof ImageData
            ) {
                this.set_status("Detecting ... Trying ...");
                var op = Operation.FromPromise(this.get_detector().detect(image));
                op.onsuccess(results => {
                    this.clearDetected();
                    if (Array.isArray(results) && results.length > 0) {
                        this.set_status(`Detecting ... Trying ... Detected ${results.length} codes`);
                        this.$detected = Array.createCopyOf(results);
                        this.detectedevent.invoke(this, results);
                    }
                
                }).onfailure(err => {
                    this.set_status(`Detecting ... Trying ... Failed to detect`);
                });
            return op;
        } else {
            this.set_status(`Detecting ... Error: unsupported argument type`);
            return Operation.Failed("BarcodeReadControl - the argument type is not supported");
        }
    }
    BarcodeReadControl.prototype.onDetectSource = function() {
        if (this.get_source() != null) {
            this.set_status(`Detecting source ... `);
            var op = this.detect(this.get_source());
            op.onfailure(err => {
                // TODO: Do something with the error (but what?)
            });
        } else {
            this.set_status(`Detecting source ... no data.`);
        }
    }
    //#endregion
})();