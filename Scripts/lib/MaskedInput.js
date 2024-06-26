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
        if (typeof text == "string" && text.length > 0) {
            if (arrRE != null) {
                var result = {
                    success: false,
                    full: false
                };
                var i,t;//c = text[0]
                i = arrRE.findIndex((re, idx, are) => (idx + text.length <= are.length) && are.slice(idx,idx + text.length).every((r,_i) => r.test(text[_i])));
                if (i >= 0) {
                    if (bExtInfo) {
                        result.success = true;
                        if (i == 0 && text.length == arrRE.length) result.full = true;
                        result.start = i;
                        result.end = i + text.length - 1;
                        return result;
                    } else {
                        return true;
                    }
                } else {
                    if (bExtInfo) return result;
                    return false;
                }
            } else { // No condition
                if (bExtInfo) {
                    return {
                        success: true,
                        full: true,
                        start: 0,
                        end: text.length -1
                    };
                } else {
                    return true;
                }

            }
        } else {
            if (bExtInfo) {
                return {
                    success: true,
                    full: (arrRE == null || arrRE.length == 0),
                    start: 0,
                    end: 0
                };
            } else {
                return true;
            }
        }
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
        .Implement(ICustomParameterizationStdImpl, "pattern","selectonfocus")
        .ImplementProperty("pattern", new InitializeStringParameter("use regular expression", null),null, function(ov,nv){
            this.$pattern_re = null; // cause regeneration
        }) //aaAAdd
        .ImplementProperty("selectonfocus", new InitializeBooleanParameter("If true selects the text on focus", true))
        .ImplementProperty("advanced", new InitializeBooleanParameter("Use advanced change detection", false))
        .ImplementProperty("condition"); // Callback that can check additional conditions

    MaskedInput.prototype.get_value = function() {
        return this.root.value;
    }
    MaskedInput.prototype.set_value = function(v) {
        this.root.value = v;
    }
    MaskedInput.prototype.get_iscorrect = function() {
        var r = matchRE(this.$get_re(),this.root.value,true);
        if (r.success && r.full) return true;
        return false;
    }
    MaskedInput.prototype.get_ispartialycorrect = function() {
        var r = matchRE(this.$get_re(),this.root.value,true);
        if (r.success) return true;
        return false;
    }
    MaskedInput.prototype.init = function() {
        if (this.root instanceof HTMLInputElement) {
            this.root.addEventListener("beforeinput", this.onBeforeInput);
            this.root.addEventListener("input", this.onAfterInput);
            this.root.addEventListener("focus",this.onFocus);
        } else {
            this.LASTERROR("MaskedInput can be placed only on text inputs");
        }
    }
    
    MaskedInput.prototype.get_currentvalue = function() {
        return this.root.value;
    }
    MaskedInput.prototype.$pattern_re = null;
    MaskedInput.prototype.$get_re = function() {
        if (this.$pattern_re == null) {
            this.$pattern_re = genRE(this.get_pattern());
        }
        return this.$pattern_re;
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
    // MaskedInput.prototype.$whatChanged = function(changeType, data) {
    //     var before = this.$beforeState;
    //     var after = this.$afterState;
    //     change = {};
    //     if (this.get_advanced()) {
    //         if (before.value == after.value) {
    //             change.value = "";
    //             change.from = 0;
    //             change.to = 0;
    //         } else {
    //             var longer = Math.max(before.value.length,after.value.length);
    //             if (changeType.startsWith("insert")) {

    //             } else if (changeType.startsWith("delete")) {

    //             } else if (changeType.startsWith("history")) {

    //             } else {

    //             }
                
    //         }
    //     } else {
    //         if (before.value == after.value) {
    //             change.value = "";
    //             change.from = 0;
    //             change.to = 0;
    //         } else {
    //             //if (after.start)
    //         }
    //     }
    // }
    MaskedInput.prototype.g = genRE;
    MaskedInput.prototype.$checkAndCorrect = function() {
        if (this.get_advanced()) {
            // Not implemented
            throw "Advanced mode not implemented yet";
        } else { // Check for partial match and rollback if not matching
            var r = matchRE(this.$get_re(),this.$afterState.value,true);
            if (r.success && r.full) {
                if (BaseObject.isCallback(this.get_condition())) {
                    if (BaseObject.callCallback(this.get_condition(),this,this.$afterState.value) === false) {
                        r.success = false;
                    }
                }

            }
            //console.log(r);
            if (!r.success) {
                this.root.value = this.$beforeState.value;
            }
        }

    }
    MaskedInput.prototype.onBeforeInput = new InitializeMethodCallback("handles before input", function(e) {
        this.$beforeState = this.$inputState();
        this.$afterState = this.$beforeState; // Equalize them
    });
    MaskedInput.prototype.onAfterInput = new InitializeMethodCallback("handles before input", function(e) {
        this.$afterState = this.$inputState();
        this.$checkAndCorrect();
    });
    MaskedInput.prototype.onFocus = new InitializeMethodCallback("handles on foucus", function(e) {
        if (this.get_selectonfocus()) {
            this.root.select();
        }
    });
})();

/// 4-23
    /// 12