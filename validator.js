(function($){
    var validatorMethods = {
        _fields: {}, // A static?! We're not going for the nodel price :(

        initialize: function(fieldToValidate) {
            this._isInitialized      = true;
            validatorMethods._fields = fieldToValidate;
            this._fields             = fieldToValidate;

            for(var selector in this._fields) {
                (function(selector) {
                    $(selector).click(function() {
                        $(this).validator().validateSelector(selector);
                    });
                    $(selector).keyup(function() {
                        $(this).validator().validateSelector(selector);
                    });
                })(selector);
            }

            return this;
        },

        validateSelector: function(selector) {
            var factory = this._getValidationFactory();

            for(var validationType in this._fields[selector].validation) {

                var type = this._fields[selector].validation[validationType].type;

                if(typeof factory[validationType] == "function") {
                    var $node       = $(selector);
                    var value       = $node.val();

                    var isValid = factory[validationType](value, this._fields[selector].validation[validationType], selector);

                    if(false === isValid) {
                        this._fields.onFail($node, this._fields[selector].validation[validationType].fail);

                        return false;
                    } else if(true === isValid) {
                        // All good.
                    } else {
                        // Probably an ajax call. This will be done async.
                    }
                } else {
                    console.log(this._fields[selector], validationType);
                    $.error("Validation type for (" + this._fields[selector] + ") no found.");
                }
            }

            this._fields.onSuccess($node, this._fields[selector].success);
            return true;
        }, 

        validate: function() {
            var hasFocussed = false;

            for(var selector in this._fields) {
                if(typeof this._fields[selector] != "function") {
                    if(!this.validateSelector(selector) && !hasFocussed) {
                        hasFocussed = true;
                        $(selector).focus();
                    }
                }
            }

            return this;
        },

        _getValidationFactory: function() {
            return this._validationFunctions;
        },

        // TODO: test -- Gerjo
        addType: function(key, fnName) {
            if(typeof key == "string" && typeof fnName == "function") {
                this._validationFunctions["key"] = fnName;
            } else {
                $.error("adding something wrong :(");
            }

            return this;
        },

        _validationFunctions: {
            remote: function(input, type, selector) {
                if(typeof type.url == "string") {
                    var craftedURL = type.url + "&" + $(selector).attr("name") + "=" + $(selector).val();

                    $.ajax({
                        url     : craftedURL,
                        async   : true,
                        success : function(data) {
                            data = eval(data);
                            if(data == true) {
                                validatorMethods._fields.onSuccess(
                                    $(selector), validatorMethods._fields[selector]["success"]
                                );
                            } else if(data == false) {
                                validatorMethods._fields.onFail(
                                    $(selector), validatorMethods._fields[selector].validation["remote"]["fail"]
                                );
                            } else {
                                $.error('Remote ajax call did not return true or false.');
                            }
                        }
                    });

                } else {
                    $.error('no url specified for remote call.');
                }

                return null;
            },

            alnum: function(input, type) {
                return /^(\d|\w)*$/.test(input);
            },

            minlength: function(input, type) {
                return input.length > type.criterea
            },

            maxlength : function(input, type) {
                return input.length < type.criterea
            },

            numeric: function(input, type) {
                return /^([0-9]{1,})$/.test(input);
            },

            email:  function(input, type) {
                // Granted email syntax will change sooner or later I'll just run a sanity check.
                return /\S+@\S+\.\S+/.test(input);
            }
        }
    };

    $.fn.validator = function(method) {
        if(!method || typeof method !== 'object') {
            return validatorMethods;
        } else if(typeof method === 'object') {
            return validatorMethods.initialize.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.validator');
        }
    }
})(jQuery);
