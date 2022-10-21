(function() {

    var Base = Class("Base");

    /**
     * This control will do nothing if the browser does not support Barcodes
     */
    function BarcodeReadControl() {
        Base.apply(this, arguments);
    }
    BarcodeReadControl.Inherit(Base,"BarcodeReadControl")
        .Implment(ICustomParameterizationStdImpl,"formats")
        .ImplementReadProperty("functional", new InitializeBooleanProperty("Indicates if the control is functional under the current conditions.", false))
        .ImplementReadProperty("formats", new InitializeArray("List of formats to detect, default is qr_code, can be coma separated string too.",["qr_code"]))
        .ImplementReadProperty("detector", new InitializeArray("Barcode detector when active.",null))
        .ImplementReadProperty("codes", new InitializeArray("Last detected codes - initially empty"));

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

    //#region Ready/Unready
    BarcodeReadControl.prototype.get_isactive = function() {
        return this.detector() != null;
    }
    BarcodeReadControl.prototype.Activate = function() {
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
    BarcodeReadControl.prototype.trace = function(image) {
        if (!this.get_isactive()) {
            var op = Operation.FromPromise(this.get_detector().detect(image));
            return op;
        }
        if (image instanceof Blob) {

        }
    }
    //#endregion
})();