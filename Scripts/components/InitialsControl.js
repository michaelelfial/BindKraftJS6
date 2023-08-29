(function(){
    var Control = Class("Control");
    function InitialsControl() {
        Control.apply(this, arguments);
    }
    InitialsControl.Inherit(Control, "InitialsControl")
        .Implement(ITemplateSourceImpl, new Defaults("templateName"),"autofill")
        .Implement(ICustomParameterizationStdImpl, "fullregex","noname","nonametitle")
        .ImplementProperty("fullregex", new InitializeStringParameter("regex to parse fullname into first last, uses to capture groups","^(\w+)\s+(\w+)$"),true,"OnNameChanged")
        .ImplementProperty("first", new InitializeStringParameter("First name",null),true,"OnNameChanged")
        .ImplementProperty("last", new InitializeStringParameter("Last nam",null),true,"OnNameChanged")
        .ImplementProperty("noname", new InitializeStringParameter("What to display if no names are available", "??"))
        .ImplementProperty("nonametitle", new InitializeStringParameter("Alt text for no names", "unknown person"))
        .Defaults({
            templateName: "bindkraftjs6/control-initials"
        });

        InitialsControl.prototype.OnNameChanged = function(prop,on,en) {
            this.namechangedevent.invoke(this,null);
        }
        InitialsControl.prototype.init = function() {
            this.on("click",e => this.activatedevent.invoke(this,null));
        }
        InitialsControl.prototype.activatedevent = new InitializeEvent("Fired when user clicks on initials");
        InitialsControl.prototype.namechangedevent = new InitializeEvent("Fired whenever name data changes");

        InitialsControl.prototype.get_fullname = function() {
            return this.get_first() + " " + this.get_last();
        }
        InitialsControl.prototype.set_fullname = function(v) {
            var ns = v + "";
            if (ns != null && !/^\s*$/.test(ns)) {
                var re = this.get_fullregex();
                if (typeof re == "string"){
                    re = new RegExp(re);
                }   
                if (re instanceof RegExp) {
                    var m = re.exec(ns);
                    if (m) {
                        this.set_first(m[1]);
                    } else {
                        this.set_last(m[2]);
                    }
                    
                } else {
                    this.set_first(ns);
                    this.set_last(null);
                } 
            }
        }
        InitialsControl.prototype.get_initials = function() {
            var s ="";
            if (this.get_first() && this.get_last()) {
                s += this.get_first().charAt(0);
                s += this.get_last().charAt(0);
            } else if (this.get_first()) {
                s += this.get_first().charAt(0);
            } else if (this.get_last()) {
                s += this.get_last().charAt(0);
            } else {
                s =this.get_noname();
            }
            return s;
        }
        InitialsControl.prototype.get_hasname = function() {
            var n = 0;
            if (this.get_first()) {
                n++;
            }
            if (this.get_last()) {
                n++;
            }
            return n;
        }
        InitialsControl.prototype.get_title = function() {
            if (this.get_hasname()) {
                return this.get_fullname();
            } else {
                return this.get_nonametitle();
            }
        }
})();