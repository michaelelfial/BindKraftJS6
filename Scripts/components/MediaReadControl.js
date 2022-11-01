(function () {

  var Base = Class("Base");

  /**
   * This control will do nothing if the browser does not support Barcodes
   */
  function MediaReadControl() {
    Base.apply(this, arguments);
  }
  MediaReadControl.Inherit(Base, "MediaReadControl")
    .Implement(IUIControl)
    .Implement(ICustomParameterizationStdImpl, "formats", "autoactivate")
    .Implement(ITemplateSourceImpl, new Defaults("templateName"),"autofill")
    .ImplementProperty("isavailable", new InitializeBooleanParameter("Indicates video source is available", false))
    .ImplementProperty("videoObj", new Initialize("Video object", null))
    .ImplementProperty("mediaStream", new Initialize("Camera stream", null))
    .Defaults({
      templateName: "bindkraftjs6/control-mediaread"
    });

  MediaReadControl.prototype.detectedevent = new InitializeEvent(
    "Fired when something is detected (successfully), but not when cleared and so on."
  );

  MediaReadControl.prototype.streamavailableevent = new InitializeEvent(
    "Fired when something is detected (successfully), but not when cleared and so on."
  );

  MediaReadControl.prototype.init = function () {
    
  };

  MediaReadControl.prototype.finalinit = function () {
    var video = this.get_videoObj();

    video.addEventListener('canplay', (event) => {
      this.set_isavailable(true);
      this.streamavailableevent.invoke(this, null);
    });

    video.addEventListener('ended', (event) => {
      this.set_isavailable(false);
      this.streamavailableevent.invoke(this, null);
    });

    video.addEventListener('error', (event) => {
      this.set_isavailable(false);
      this.streamavailableevent.invoke(this, null);
    });
  };
  

  //#endregion

  

  MediaReadControl.prototype.onScanning = async function () {
    //Show the div with canvas and initialize the chain
    //this.get_videoObj().classList.remove('hidden');
    await this.initScanning();
    var barcodeDetector = this.get_detector();
    var video = this.get_videoObj();

    video.addEventListener('canplay', (event) => {
      this.set_isavailable(true);
    });

    var isDetected = false;
    function render() {
      barcodeDetector
    .detect(video)
    .then((barcodes) => {
      if (Array.isArray(barcodes) && barcodes.length > 0) {
        barcodes.forEach((barcode) => {
          console.log(barcode.rawValue);
        });
        return true;
      }
      else{
        console.log("Nothing detected");
      }
    })
    .catch(console.error);
    return false;
    }
  
    (function renderLoop() {
      
      if (!isDetected)
      {
        requestAnimationFrame(renderLoop);
        isDetected = render();
      }
      else{
        //clean up
      }
    })();
    
  };


  //#region Scanning from the camera
  MediaReadControl.prototype.startScanning = async function () {
    if (this.get_mediaStream()) return;
    var constraints = {
      audio: false,
      video: { 
          //deviceId: videoSource ? { exact: videoSource } : undefined,
          facingMode: { ideal: "environment" }
        }
    };

    try {
      var stream = await navigator.mediaDevices.getUserMedia(constraints);

      this.set_mediaStream(stream);
      this.get_videoObj().srcObject = stream;
      //this.set_imageCapture(new ImageCapture(stream.getVideoTracks()[0]));
      /* use the stream */
    } catch (err) {
      /* handle the error */
      this.stopScanning();
    }
  };

  MediaReadControl.prototype.stopScanning = async function () {
    // TODO stop the tracks and maybe stop the video element first
    this.set_mediaStream(null);
    this.get_videoObj().srcObject = null;

  };


})();
