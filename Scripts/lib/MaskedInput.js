(function() {
    function _stringDiff(first,second,bRtoL) {
        var i,longer = Math.max(first.length,second.length);        
        if (bRtoL) {

        } else {
            for (i = 0; i < longer;i++) {

            }
        }
    }
    var _patts = ["aA","dD"," ","_"];
    var _repatts = ["\\p{General_Category=L}","\\p{General_Category=N}","\\s","(?:\\p{General_Category=P}|\\p{General_Category=S})"];
    function genRE(patt,compact) {
        var repatt = [];
        if (patt == null || patt.length == 0) return null;
        var t = null;
        var num = 0;
        var p,i,pidx;
        for (i = 0;i < patt.length;i++) {
            p = patt[i];
            if (!_patts.some(pt => pt.includes(p))) {
                throw "Wrong pattern";
            }
            if (t != null && num > 0 && p != t) { // commit
                repatt.push({t:_patts.findIndex(pt => pt.includes(t)),n:num});
                num = 0;
            }
            t = p; num ++;
        }
        if (t != null && num > 0) { // commit
            repatt.push({t:_patts.findIndex(pt => pt.includes(t)),n:num});
        }
        var restr = "";
        if (compact) { // Just regular expression
            repatt.forEach(t => {
                if (typeof _repatts[t.t] == "string") {
                    restr += _repatts[t.t] + `{${t.n}}`;
                }
            });
            if (restr.length > 0) return new RegExp(restr,"u");
            return null;
        } else { // Array with re-s for single symbols
            if (repatt.length > 0) {
                var r = [];
                repatt.forEach(t => {
                    if (typeof _repatts[t.t] == "string") {
                        for (i = 0;i < t.n; i++) r.push(new RegExp(_repatts[t.t],"u"));
                    }
                });
                if (r.length > 0) return r;
            } 
            return null;
        }
    }
    function matchRE(arrRE,text,bExtInfo) {
        if (typeof text == "string") {
            if (arrRE != null) {

            } else { // No condition
                if (bExtInfo) {
                    return {
                        success: true,
                        start: 0,
                        end: text.length -1
                    };
                } else {
                    return true;
                }

            }
        }
    }

    function _patternTest(patt,v) {


    }
    function _nullState() {
        return {
            start:0,
            end:0,
            value:""
        }
    }

    function MaskedInput(...args) {
        Base.apply(this,args);
    }
    MaskedInput.Inherit(Base,"MaskedInput")
        .Implement(ICustomParameterizationStdImpl, "pattern")
        .ImplementProperty("pattern", new InitializeStringParameter("use regular expression", null)) //aaAAdd
        .ImplementProperty("advanced", new InitializeBooleanParameter("Use advanced change detection", false))
        .ImplementProperty("condition"); // Callback that can check additional conditions

    MaskedInput.prototype.init = function() {
        if (this.root instanceof HTMLInputElement) {
            this.root.addEventListener("beforeinput", this.onBeforeInput);
            this.root.addEventListener("input", this.onAfterInput)
        } else {
            this.LASTERROR("MaskedInput can be placed only on text inputs");
        }
    }
    
    MaskedInput.prototype.get_currentvalue = function() {
        return this.root.value;
    }
    MaskedInput.prototype.$beforeState = _nullState();
    MaskedInput.prototype.$afterState = _nullState();

    MaskedInput.prototype.$inputState = function() {
        var sel_start = this.root.selectionStart;
        var sel_end = this.root.selectionEnd;
        var state = {
            value: this.root.value,
            start: Math.min(sel_start,sel_end),
            end: Math.max(sel_start,sel_end)
        }
        return state;
    }
    MaskedInput.prototype.$whatChanged = function(changeType, data) {
        var before = this.$beforeState;
        var after = this.$afterState;
        change = {};
        if (this.get_advanced()) {
            if (before.value == after.value) {
                change.value = "";
                change.from = 0;
                change.to = 0;
            } else {
                var longer = Math.max(before.value.length,after.value.length);
                if (changeType.startsWith("insert")) {

                } else if (changeType.startsWith("delete")) {

                } else if (changeType.startsWith("history")) {

                } else {

                }
                
            }
        } else {
            if (before.value == after.value) {
                change.value = "";
                change.from = 0;
                change.to = 0;
            } else {
                //if (after.start)
            }
        }
    }
    MaskedInput.prototype.g = genRE;
    MaskedInput.prototype.$checkAndCorrect = function() {

    }
    MaskedInput.prototype.onBeforeInput = new InitializeMethodCallback("handles before input", function(e) {
        this.$beforeState = this.$inputState();
        this.$afterState = this.$beforeState; // Equalize them
        console.log(`bi:${e.inputType}[${e.data}](${this.root.value})`);
        console.log(e);
        //this.root.value - current value
        //this.root.selectionStart
        // this.root.selectionEnd
    });
    MaskedInput.prototype.onAfterInput = new InitializeMethodCallback("handles before input", function(e) {
        this.$afterState = this.$inputState();
        this.$checkAndCorrect();
        console.log(`ai:${e.inputType}[${e.data}](${this.root.value})`);
        console.log(e);
        //this.root.value - current value
        //this.root.selectionStart
        // this.root.selectionEnd
    });
})();

/// 4-23
    /// 12