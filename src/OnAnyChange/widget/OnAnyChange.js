define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",


], function (declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent) {
    "use strict";

    return declare("OnAnyChange.widget.OnAnyChange", [ _WidgetBase ], {


        // Internal variables.
        _handles: null,
        _contextObj: null,

        // parameters
        microflowAction: null,
        nanoflowAction: null,

        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;

            if ( this._contextObj ) {
                var attributes = this._contextObj.getAttributes();
                attributes.forEach( function( attr ) {
                    this.subscribe({
                        guid: this._contextObj.getGuid(),
                        attr: attr,
                        callback: lang.hitch(this, function( guid, attr, value ) {
                            this._runAction();
                        })
                    })
                }, this);
            }
            this._executeCallback(callback, "_update");
        },

        _runAction: function() {
            if ( this.microflowAction ) {
                this._execMf( this.microflowAction, this._contextObj.getGuid() );
            }
            if ( this.nanoflowAction.nanoflow && this.mxcontext ) {
                this._execNano( this.nanoflowAction );
            }
        },

        // Shorthand for running a microflow
        _execMf: function (mf, guid, cb) {
            logger.debug(this.id + "._execMf");
            if (mf && guid) {
                mx.ui.action(mf, {
                    params: {
                        applyto: "selection",
                        guids: [guid]
                    },
                    callback: lang.hitch(this, function (objs) {
                        if (cb && typeof cb === "function") {
                            cb(objs);
                        }
                    }),
                    error: function (error) {
                        console.debug(error.description);
                    }
                }, this);
            }
        },

        // Shorthand for running a microflow
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

require(["OnAnyChange/widget/OnAnyChange"]);
