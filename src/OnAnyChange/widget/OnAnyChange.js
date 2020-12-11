define([
    "dojo/_base/declare",
    "OnAnyChange/widget/OnSpecificChange"
], function (declare, OnSpecificChange) {
    "use strict";

    return declare("OnAnyChange.widget.OnAnyChange", [OnSpecificChange]);
});

require(["OnAnyChange/widget/OnAnyChange"]);
