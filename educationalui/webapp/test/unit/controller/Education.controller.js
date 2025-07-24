/*global QUnit*/

sap.ui.define([
	"com/lt/educationalui/controller/Education.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Education Controller");

	QUnit.test("I should test the Education controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
