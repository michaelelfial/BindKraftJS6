(function () {
  var Base = Class("Base");

  /**
   * This control will do nothing if the browser does not support Barcodes
   */
  function BarcodeReadControl() {
    Base.apply(this, arguments);
  }
  BarcodeReadControl.Inherit(Base, "BarcodeReadControl")
    .Implement(IUIControl)
    .Implement(ICustomParameterizationStdImpl, "formats", "autoactivate")
    .Implement(ITemplateSourceImpl, new Defaults("templateName"),"autofill")
    .ImplementProperty("fakedetect", new InitializeStringParameter("generate fake entires",null))
    .ImplementReadProperty("functional", new InitializeBooleanParameter("Indicates if the control is functional under the current conditions.", false))
    .ImplementReadProperty("autoactivate", new InitializeBooleanParameter("If passed as a parameter activates the control on creation. Should not be used in bindings!", true))
    .ImplementProperty("formats", new InitializeArray("List of formats to detect, default is qr_code, can be coma separated string too.", ["qr_code"]))
    .ImplementReadProperty("detector", Initialize("Barcode detector when active.", null))
    .ImplementProperty("source", new Initialize("Source to observe when asked."), null, 
      function (oval, newval) {
        if (newval != null) {
          this.callAsync(this.onDetectSource);
        }
      },
      true
    )
    .ImplementActiveProperty("status", new InitializeStringParameter("various status reports", null))
    .Defaults({
      templateName: "bindkraftjs6/control-barcoderead"
    });    

  BarcodeReadControl.prototype.detectedevent = new InitializeEvent(
    "Fired when something is detected (successfully), but not when cleared and so on."
  );
  BarcodeReadControl.prototype.barcodeevent = new InitializeEvent(
    "Fired when something is detected (successfully), but not when cleared and so on."
  );

  BarcodeReadControl.prototype.get_formats = function () {
    if (Array.isArray(this.$formats)) return this.$formats;
    if (typeof this.$formats == "string")
      return this.$formats
        .split(",")
        .Select((i, f) => (typeof f == "string" ? f.trim() : null));
    return null;
  };

  BarcodeReadControl.prototype.get_hasdetected = function () {
    var d = this.get_detected();
    return (Array.isArray(d) && d.length > 0);
  };

  BarcodeReadControl.prototype.$testEnvironment = function () {
    if ("BarcodeDetector" in window) {
      this.$functional = true;
      this.$status = "BarcodeDetector is available. The control is functional.";
    } else {
      this.$functional = false;
      this.$status =
        "BarcodeDetector is NOT available. The control is NOT functional.";
    }
    return this.get_functional();
  };

  BarcodeReadControl.prototype.init = function () {
    this.$testEnvironment();
    if (this.get_functional() && this.get_autoactivate()) {
      this.ExecAfterFinalInit(function () {
        this.Activate();
      });
    }
  };
  
  BarcodeReadControl.prototype.$detected = new InitializeArray(
    "This array will be changed as new detection occurs"
  );

  BarcodeReadControl.prototype.clearDetected = function () {
    this.$detected = [];
    this.set_status("Cleared the detected codes.");
    this.detectedevent.invoke(this, null)
  };

  BarcodeReadControl.prototype.get_detected = function () {
    return this.$detected;
  };

  BarcodeReadControl.prototype.get_firstDetected = function () {
    var d = this.get_detected();
    if (Array.isArray(d) && d.length > 0) {
      return d[0];
    }
    return null;
  };

  BarcodeReadControl.prototype.get_firstDetectedValue = function () {
    var d = this.get_detected();
    if (Array.isArray(d) && d.length > 0) {
      return d[0].rawValue;
    }
    return null;
  };

  //#region Ready/Unready
  BarcodeReadControl.prototype.get_isactive = function () {
    return this.get_detector() != null;
  };

  BarcodeReadControl.prototype.Activate = function () {
    if (!this.get_functional()) return false;
    this.clearDetected();
    this.set_status("Activating ...");
    if (this.get_detector() == null) {
      this.$detector = new BarcodeDetector({
        formats: this.get_formats(),
      });
      if (this.get_detector() != null) {
        this.set_status("Activating ... Active");
      } else {
        this.set_status("Activating ... Failed to create");
      }
      return true;
    } else {
      this.set_status("Activating ... Already exists");
      return false;
    }
  };

  BarcodeReadControl.prototype.Deactivate = function () {
    if (this.$detector != null) {
      this.set_status("Deactivated");
      this.$detector = null;
    }
  };

  //#endregion

  //#region Detection
  
  BarcodeReadControl.prototype.detect = function (image) {
    if (typeof this.get_fakedetect() == "string" && this.get_fakedetect().length > 0) {
      this.$detected = [{ rawValue: this.get_fakedetect() }];
          this.barcodeevent.invoke(this, this.$detected[0]);
          this.detectedevent.invoke(this, this.$detected);
          this.set_fakedetect(null);
          return Operation.From(this.$detected);
    }
    if (!this.get_isactive()) {
      this.set_status("Detecting ... Error: not active.");
      console.log("not active");
      return Operation.Failed("Not active");
    }
    this.clearDetected();
    this.set_status("Detecting ...");

    //var op = new Operation('detect');

    return Operation.FromPromise( (async () => {
      //try {
        if (!this.get_isactive()) {
          this.set_status("Detecting ... Error: not active.");
          throw "BarcodeReadControl not active";
        }
        var target = null;
        if (image instanceof Blob) 
        {
          target = await window.createImageBitmap(image);
        } 
        else if(image instanceof HTMLImageElement || image instanceof HTMLCanvasElement || image instanceof ImageData || image instanceof HTMLVideoElement)
        {
          target = image;
        }
        else 
        {
          this.set_status(`Detecting ... Error: unsupported argument type`);
          throw "BarcodeReadControl - the argument type is not supported";
        }
    
        var barcodes = await this.get_detector().detect(target);
        this.clearDetected();
        if (Array.isArray(barcodes) && barcodes.length > 0) {
          //TODO Stop the detection
          this.$detected = Array.createCopyOf(barcodes);
          this.barcodeevent.invoke(this, barcodes[0]);
        }
        this.detectedevent.invoke(this, barcodes);
        return barcodes;
      //}
      // catch (error) {
      //   op.CompleteOperation(false, error);
      // }   
    })(),"detect");

  };
  BarcodeReadControl.prototype.onDetectSource = function () {
    if (this.get_hasdetected()) return;
    if (this.get_source() != null) {
      this.set_status(`Detecting source ... `);
      var op = this.detect(this.get_source());
      op.onfailure((err) => {
        // TODO: Do something with the error (but what?)
      });
    } else {
      this.set_status(`Detecting source ... no data.`);
    }
  };
  //#endregion

})();
