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
 * Valid context IDs for the testTerm
 * @type {Array}
 */
var testTermContextIds = [];

/**
 * Term used as a parameter in wildcard tests using asterisk
 * @type {string}
 */
var testTermAsterisk = "the*";

/**
 * Term used as a parameter in wildcard tests using question mark
 * @type {string}
 */
var testTermQuestionMark = "the?";

/**
 * Collection of setup functions to perform before unit test execution
 */
var setup = {

    /**
     * Collection of setup tasks and flags indicating their state of completion
     */
    progress: {
        setTestRetina: false,
    },

    isSetupComplete: function () {
        var isComplete = true;
        $.each(setup.progress, function (index, value) {
            // If any value is false, setup is not complete
            if (!value) {
                isComplete = false;
            }
        });
        return isComplete;
    },

    setTestRetina: function () {
        var callback = function (data) {
            testRetinaName = data[0].retinaName;
            setup.progress.setTestRetina = true;
            if (setup.isSetupComplete()) {
                runTests();
            }
        };
        $.retinaApi.retinas.getRetinas({}, callback);
    },

    runSetup: function () {
        setup.setTestRetina();
    }

};

setup.runSetup();

function runTests() {

    /**
     * Tests that beforeSend callback is executed before main callback function
     */
    QUnit.asyncTest("testBeforeSendExecutes", function (assert) {
        assert.expect(1);
        var counter = 0;
        var beforeSend = function () {
            counter++;
        };
        var callback = function (data) {
            assert.equal(counter, 1);
            QUnit.start();
        };
        $.retinaApi.retinas.getRetinas({beforeSend: beforeSend}, callback);
    });

    /**
     * Tests that the configured error handler is executed during AJAX exception handling
     */
    QUnit.asyncTest("testErrorHandlerExecutes", function (assert) {
        assert.expect(1);
        var errorHandler = function (jqXHR, textStatus, errorThrown) {
            assert.equal(jqXHR.status, 404, "Unable to reach invalid API endpoint");
            QUnit.start();
        };
        $.retinaApi.retinas.getRetinas({basePath: "invalidBasePath", errorHandler: errorHandler}, $.noop);
    });

    /**
     * Tests that retina information is returned
     */
    QUnit.asyncTest("testGetRetinas", function (assert) {
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
    QUnit.asyncTest("testGetRetina", function (assert) {
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
    QUnit.asyncTest("testGetTermWithoutOptions", function (assert) {
        assert.expect(1);
        assert.throws(function () {
            $.retinaApi.terms.getTerm({}, $.noop);
        }, "Call to 'getTerm' is missing the following required parameters: options.retinaName", "Exception thrown due to missing options");
        QUnit.start();
    });

    /**
     * Tests that getTerm returns terms
     */
    QUnit.asyncTest("testGetAllTerms", function (assert) {
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
    QUnit.asyncTest("testGetValidTerm", function (assert) {
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
    QUnit.asyncTest("testGetValidTermWithAsterisk", function (assert) {
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

    /**
     * Tests that getTerm returns valid results when using a question mark in query terms
     */
    QUnit.asyncTest("testGetValidTermWithQuestionMark", function (assert) {
        var options = {retinaName: testRetinaName, term: testTermQuestionMark};
        var callback = function (data) {
            assert.ok(data.length > 0, "At least one value returned");
            assert.notEqual(typeof data[0].term, "undefined", "Results contain a term");

            var prefix = testTermQuestionMark.substr(0, testTermQuestionMark.indexOf('?'));
            $.each(data, function (index, value) {
                var term = value.term;
                assert.equal(term.substr(0, prefix.length), prefix, "Returned term (" + term + ") matches query pattern: " + testTermQuestionMark);
                assert.equal(term.length, testTermQuestionMark.length, "Returned term (" + term + ") is same length as query term");
            });

            QUnit.start();
        };
        $.retinaApi.terms.getTerm(options, callback);
    });

    /**
     * Tests that getTerm returns only a single term when maxResults is configured to return only a single term
     */
    QUnit.asyncTest("testGetSingleTerm", function (assert) {
        assert.expect(3);
        var options = {retinaName: testRetinaName, term: testTerm, maxResults: 1};
        var callback = function (data) {
            assert.ok(data.length > 0, "Exactly one value returned");
            assert.notEqual(typeof data[0].term, "undefined", "Results contain a term");
            assert.equal(data[0].term, testTerm, "Results contain query term");
            QUnit.start();
        };
        $.retinaApi.terms.getTerm(options, callback);
    });

    /**
     * Tests that getContextsForTerm throws an error if no options were configured
     */
    QUnit.asyncTest("testGetContextsForTermWithoutOptions", function (assert) {
        assert.expect(1);
        assert.throws(function () {
            $.retinaApi.terms.getContextsForTerm({}, $.noop);
        }, "Call to 'getContextsForTerm' is missing the following required parameters: options.retinaName, options.term", "Exception thrown due to missing options");
        QUnit.start();
    });

    /**
     * Tests that getContextsForTerm returns information about a specific term
     */
    QUnit.asyncTest("testGetContextsForValidTerm", function (assert) {
        assert.expect(2);
        var options = {retinaName: testRetinaName, term: testTerm};
        var callback = function (data) {
            assert.ok(data.length > 0, "At least one value returned");
            assert.notEqual(typeof data[0].context_id, "undefined", "Results contain a contextId");
            QUnit.start();
        };
        $.retinaApi.terms.getContextsForTerm(options, callback);
    });

    /**
     * Tests that getSimilarTerms throws an error if no options were configured
     */
    QUnit.asyncTest("testGetSimilarTermWithoutOptions", function (assert) {
        assert.expect(1);
        assert.throws(function () {
            $.retinaApi.terms.getSimilarTerms({}, $.noop);
        }, "Call to 'getSimilarTerms' is missing the following required parameters: options.retinaName, options.term", "Exception thrown due to missing options");
        QUnit.start();
    });

    /**
     * Tests that getSimilarTerms returns related keywords for a given term
     */
    QUnit.asyncTest("testGetSimilarTermsForValidTerm", function (assert) {
        assert.expect(2);
        var options = {retinaName: testRetinaName, term: testTerm};
        var callback = function (data) {
            assert.ok(data.length > 0, "At least one value returned");
            assert.notEqual(typeof data[0].term, "undefined", "Results contain a term");
            QUnit.start();
        };
        $.retinaApi.terms.getSimilarTerms(options, callback);
    });

    /**
     * Tests that getSimilarTerms returns related keywords for a given term using POS tag filters
     */
    QUnit.asyncTest("testGetSimilarTermsWithPosFilter", function (assert) {
        var posTypeFilters = ["NOUN", "VERB", "ADJECTIVE"];

        $.each(posTypeFilters, function (index, posTypeFilter) {
            QUnit.stop();
            var options = {retinaName: testRetinaName, term: testTerm, posType: posTypeFilter};
            var callback = function (data) {
                assert.ok(data.length > 0, "At least one value returned");
                assert.notEqual(typeof data[0].term, "undefined", "Results contain a term");

                // Check POS tags of all returned terms
                $.each(data, function (index, term) {
                    var posTypes = term.pos_types;
                    var containsTargetPosType = false;
                    $.each(posTypes, function (index, posType) {
                        if (posType == posTypeFilter) {
                            containsTargetPosType = true;
                        }
                    });
                    assert.equal(containsTargetPosType, true, "POS of returned result matches filter: " + posTypeFilter);
                });
                QUnit.start();
            };
            $.retinaApi.terms.getSimilarTerms(options, callback);
        });
        QUnit.start();
    });

}