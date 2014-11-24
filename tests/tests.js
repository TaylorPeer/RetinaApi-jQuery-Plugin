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
 * Term used as a parameter in various tests
 * @type {string}
 */
var testTerm = "test";

/**
 * Term used as a parameter in asterisk tests
 * @type {string}
 */
var testTermAsterisk = "the*";

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
        assert.expect(2);
        var callback = function (data) {
            assert.ok(data.length > 0, "Data returned");
            assert.notEqual(typeof data[0].retinaName, "undefined", "Data contains a retinaName entry");
            QUnit.start();
        };
        $.retinaApi.retinas.getRetinas({}, callback);
    });

    /**
     * Tests that retina information is returned for a specific retina
     */
    QUnit.asyncTest("getRetina", function (assert) {
        assert.expect(3);
        var options = {retinaName: testRetinaName};
        var callback = function (data) {
            assert.equal(data.length, 1, "Data returned a single Retina");
            assert.notEqual(typeof data[0].retinaName, "undefined", "Data contains a retinaName entry");
            assert.equal(data[0].retinaName, testRetinaName, "Retina entry matches the query term");
            QUnit.start();
        };
        $.retinaApi.retinas.getRetinas(options, callback);
    });

    /**
     * Tests that getTerm throws an error if the retinaName option is not specified
     */
    QUnit.asyncTest("getTermWithoutOptions", function (assert) {
        assert.expect(1);
        assert.throws(function () {
            $.retinaApi.terms.getTerm({}, $.noop);
        }, "Call to 'getTerm' is missing the following required parameters: options.retinaName", "Exception thrown due to missing retinaName");
        QUnit.start();
    });

    /**
     * Tests that getTerm returns terms
     */
    QUnit.asyncTest("getAllTerms", function (assert) {
        assert.expect(2);
        var options = {retinaName: testRetinaName};
        var callback = function (data) {
            assert.ok(data.length > 0, "At least one value returned");
            assert.notEqual(typeof data[0].term, "undefined", "Results contain a term");
            QUnit.start();
        };
        $.retinaApi.terms.getTerm(options, callback);
    });

    /**
     * Tests that getTerm returns information about a specific term
     */
    QUnit.asyncTest("getValidTerm", function (assert) {
        assert.expect(3);
        var options = {retinaName: testRetinaName, term: testTerm};
        var callback = function (data) {
            assert.ok(data.length > 0, "At least one value returned");
            assert.notEqual(typeof data[0].term, "undefined", "Results contain a term");
            assert.equal(data[0].term, testTerm, "Results contain query term");
            QUnit.start();
        };
        $.retinaApi.terms.getTerm(options, callback);
    });

    /**
     * Tests that getTerm returns valid results when using an asterisk in query terms
     */
    QUnit.asyncTest("getValidTermWithAsterisk", function (assert) {
        var options = {retinaName: testRetinaName, term: testTermAsterisk};
        var callback = function (data) {
            assert.ok(data.length > 0, "At least one value returned");
            assert.notEqual(typeof data[0].term, "undefined", "Results contain a term");

            var prefix = testTermAsterisk.substr(0, testTermAsterisk.indexOf('*'));
            $.each(data, function (index, value) {
                var term = value.term;
                assert.equal(term.substr(0, prefix.length), prefix, "Returned result (" + term + ") matches query pattern: " + testTermAsterisk);
            });

            QUnit.start();
        };
        $.retinaApi.terms.getTerm(options, callback);
    });

}