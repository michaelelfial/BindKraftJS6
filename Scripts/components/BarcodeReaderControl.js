(function () {

  var Base = Class("Base");

  /**
   * This control will do nothing if the browser does not support Barcodes
   */
  function BarcodeReaderControl() {
    Base.apply(this, arguments);
  }
  BarcodeReaderControl.Inherit(Base, "BarcodeReaderControl")
    .Implement(ICustomParameterizationStdImpl, "formats", "autoactivate")
    
    .ImplementProperty("isavailable", new InitializeBooleanParameter("Indicates video source is available", false))
    .ImplementProperty("videoObj", new Initialize("Video object", null))
    .ImplementProperty("mediaStream", new Initialize("Camera stream", null));

  BarcodeReaderControl.prototype.detectedevent = new InitializeEvent(
    "Fired when something is detected (successfully), but not when cleared and so on."
  );

  BarcodeReaderControl.prototype.streamavailableevent = new InitializeEvent(
    "Fired when something is detected (successfully), but not when cleared and so on."
  );

  BarcodeReaderControl.prototype.init = function () {
    
  };

  BarcodeReaderControl.prototype.finalinit = function () {
    var video = this.get_videoObj();

    video.addEventListener('canplay', (event) => {
      this.set_isavailable(true);
    });

    video.addEventListener('ended', (event) => {
      this.set_isavailable(false);
    });

    video.addEventListener('error', (event) => {
      this.set_isavailable(false);
    });
  };
  

  //#endregion

  

  BarcodeReaderControl.prototype.onScanning = async function () {
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
  BarcodeReaderControl.prototype.startScanning = async function () {

    var constraints = {
      audio: false,
      video: { 
          //deviceId: videoSource ? { exact: videoSource } : undefined,
          facingMode: { exact: "environment" }
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
    }
  };

  BarcodeReaderControl.prototype.stopScanning = async function () {

  };


})();
