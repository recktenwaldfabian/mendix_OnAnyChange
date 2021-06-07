define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dojo/_base/lang"

], function (declare, _WidgetBase, lang) {
    "use strict";

    return declare("OnAnyChange.widget.OnSpecificChange", [_WidgetBase], {

        // Internal variables.
        _contextObj: null,
        _oldValues: null,

        // parameters
        listenerEnum: null,
        listenerAttr: null,
        listenerAttrs: null,
        microflowAction: null,
        nanoflowAction: null,

        update: function (obj, callback) {
            logger.debug(this.id + ".update");

            if (this._contextObj && (!obj || obj.getGuid() != this._contextObj.getGuid())) {
                this.unsubscribeAll();
            }
            if (obj && (!this._contextObj || obj.getGuid() != this._contextObj.getGuid())) {
                this._contextObj = obj;
                if (this.listenerEnum === "list" && this.listenerAttrs.length > 0) {
                    this.listenerAttrs.forEach(attr => this._subscribeAttributeChange(attr.listenerAttr), this);
                } else if (this.listenerEnum === "single" && this.listenerAttr) {
                    this._subscribeAttributeChange(this.listenerAttr);
                } else {
                    this._contextObj.getAttributes().forEach(attr => this._subscribeAttributeChange(attr), this);
                }
            }
            this._contextObj = obj;

            this._executeCallback(callback, "_update");
        },
        
        postCreate: function() {
            this._oldValues = [];
        },

        _subscribeAttributeChange: function (attr) {
            this._oldValues[attr] = this._contextObj.get(attr);
            this.subscribe({
                guid: this._contextObj.getGuid(),
                attr: attr,
                callback: lang.hitch(this, function (guid, attr, value) {
                    this._checkIfChanged(guid, attr, value);
                })
            })
        },

        _checkIfChanged: function (guid, attr, value) {
            var oldValue = this._oldValues[attr];
            // some cases were reported where this event was triggered without any change
            // thus we check if the value really changed
            if (this._contextObj.isDate(attr) && value != null && oldValue != null && value.getTime) {
                if (value.getTime() !== oldValue.getTime()) {
                    this._runAction();
                    this._oldValues[attr] = value;
                }
            } else if (this._contextObj.isNumeric(attr) && value != null && oldValue != null && value.eq) {
                if (!value.eq(oldValue)) {
                    this._runAction();
                    this._oldValues[attr] = value;
                }
            } else {
                if (value !== oldValue) {
                    this._runAction();
                    this._oldValues[attr] = value;
                }
            }
        },

        _runAction: function () {
            if (this.microflowAction) {
                this._execMf(this.microflowAction, this._contextObj.getGuid());
            }
            if (this.nanoflowAction.nanoflow && this.mxcontext) {
                this._execNano(this.nanoflowAction);
            }
        },

        // Shorthand for running a microflow
        _execMf: function (mf, guid, cb) {
            logger.debug(this.id + "._execMf");
            if (mf && guid) {
                mx.data.action({
                    params: {
                        actionname: mf,
                        applyto: "selection",
                        guids: [guid]
                    },
                    origin: this.mxform,
                    callback: lang.hitch(this, function (objs) {
                        if (cb && typeof cb === "function") {
                            cb(objs);
                        }
                    }),
                    error: lang.hitch(this, function (error) {
                        logger.error(this.id + ": An error ocurred while executing microflow: ", error);
                    })
                }, this);
            }
        },

        // Shorthand for running a nanoflow
        _execNano: function (nf, cb) {
            logger.debug(this.id + "._execNano");
            window.mx.data.callNanoflow({
                nanoflow: nf,
                origin: this.mxform,
                context: this.mxcontext,
                callback: lang.hitch(this, function (objs) {
                    if (cb && typeof cb === "function") {
                        cb(objs);
                    }
                }),
                error: function (error) {
                    console.debug(error.description);
                }
            }, this);
        },

        // Shorthand for executing a callback, adds logging to your inspector
        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["OnAnyChange/widget/OnSpecificChange"]);