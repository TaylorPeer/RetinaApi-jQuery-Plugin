/**
 * Set the API key to be used for all tests
 * @type {string}
 */
$.retinaApi.defaults.apiKey = apiKey;

/**
 * Random retina name to be used as a parameter in tests
 */
var testRetinaName;

/**
 * Term used as a parameter in tests
 * @type {string}
 */
var testTerm = "test";

/**
 * Callback to set the test retina name and then execute test cases
 * @param data
 */
var callback = function (data) {
    testRetinaName = data[0].retinaName;
    runTests();
};
$.retinaApi.retinas.getRetinas({}, callback);

function runTests() {

    /**
     * Tests that retina information is returned
     */
    QUnit.asyncTest("getRetinas", function (assert) {
        var callback = function (data) {
            assert.ok(data.length > 0 && (typeof data[0].retinaName != "undefined"), "Return all Retinas");
            QUnit.start();
        };
        $.retinaApi.retinas.getRetinas({}, callback);
    });

    /**
     * Tests that retina information is returned for a specific retina
     */
    QUnit.asyncTest("getRetina", function (assert) {
        var options = {retinaName: testRetinaName};
        var callback = function (data) {
            assert.ok(data.length > 0 && (typeof data[0].retinaName != "undefined") && (data[0].retinaName == testRetinaName), "Return single Retina");
            QUnit.start();
        };
        $.retinaApi.retinas.getRetinas(options, callback);
    });

    /**
     * Tests that getTerm throws an error if the retinaName option is not specified
     */
    QUnit.asyncTest("getTermWithoutOptions", function (assert) {
        assert.throws(function () {
            $.retinaApi.terms.getTerm({}, $.noop);
        }, "Call to 'getTerm' is missing the following required parameters: options.retinaName", "Throw exception due to missing retinaName");
        QUnit.start();
    });

    /**
     * Tests that getTerm returns terms
     */
    QUnit.asyncTest("getAllTerms", function (assert) {
        var options = {retinaName: testRetinaName};
        var callback = function (data) {
            assert.ok(data.length > 0 && (typeof data[0].term != "undefined"), "Return some terms");
            QUnit.start();
        };
        $.retinaApi.terms.getTerm(options, callback);
    });

    /**
     * Tests that getTerm returns information about a specific term
     */
    QUnit.asyncTest("getValidTerm", function (assert) {
        var options = {retinaName: testRetinaName, term: testTerm};
        var callback = function (data) {
            assert.ok(data.length > 0 && (typeof data[0].term != "undefined") && data[0].term == testTerm, "Return information about a specific term");
            QUnit.start();
        };
        $.retinaApi.terms.getTerm(options, callback);
    });

}

