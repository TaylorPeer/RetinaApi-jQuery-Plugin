/**
 * Set the API key to be used for all tests
 * @type {string}
 */
$.retinaApi.defaults.apiKey = apiKey;

/**
 * Tests that retina information is returned
 */
QUnit.asyncTest("getRetinasTest", function (assert) {
    var callback = function (data) {
        assert.ok(data.length > 0 && (typeof data[0].retinaName != "undefined"), "API returned Retinas");
        QUnit.start();
    };
    $.retinaApi.retinas.getRetinas({}, callback);
});

/**
 * Tests that retina information is returned for a specific retina
 */
QUnit.asyncTest("getRetina", function (assert) {
    QUnit.stop();
    var firstCallback = function (data) {
        assert.ok(data.length > 0 && (typeof data[0].retinaName != "undefined"), "API returned Retinas");
        QUnit.start();

        var firstRetinaName = data[0].retinaName;
        var options = {retinaName: firstRetinaName};

        var secondCallback = function (data) {
            assert.ok(data.length > 0 && (typeof data[0].retinaName != "undefined") && (data[0].retinaName == firstRetinaName), "API returned single Retina");
            QUnit.start();
        };

        $.retinaApi.retinas.getRetinas(options, secondCallback);
    };
    $.retinaApi.retinas.getRetinas({}, firstCallback);
});

/**
 * Tests that getTerm throws an error if the retinaName option is not specified
 */
QUnit.asyncTest("getTermWithoutOptionsTest", function (assert) {
    assert.throws(function () {
            $.retinaApi.terms.getTerm({}, $.noop);
        }, "Call to 'getTerm' is missing the following required parameters: options.retinaName", "getTerm threw exception because retinaName was missing");
    QUnit.start();
});