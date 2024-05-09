(function() {
    function MaskedInput(...args) {
        Base(...args);
    }
    MaskedInput.Inherit(Base,"MaskedInput")
        .Implement(ICustomParameterizationStdImpl, "pattern")
        .ImplementProperty("pattern", new InitializeStringParameter("use regular expression", null)) //aaAAdd
        .ImplementProperty("condition"); // Callback that can check additional conditions

    MaskedInput.prototype.init = function() {
        if (this.root instanceof HTMLInputElement) {
            this.root.addEventListener("beforeinput", this.onBeforeInput)
        } else {
            this.LASTERROR("MaskedInput can be placed only on text inputs");
        }
    }


    MaskedInput.prototype.onBeforeInput = new InitializeMethodCallback("handles before input", function(e) {
        this.root.value
    });
})();

/// 4-23
    /// 12