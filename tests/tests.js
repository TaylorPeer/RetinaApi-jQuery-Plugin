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
 * Text used as a parameter in various tests
 * @type {string}
 */
var testTexts = [
    "The National Aeronautics and Space Administration (NASA) is the United States government agency that is responsible for the civilian space program as well as for aeronautics and aerospace research. President Dwight D. Eisenhower established the National Aeronautics and Space Administration (NASA) in 1958 with a distinctly civilian (rather than military) orientation encouraging peaceful applications in space science. The National Aeronautics and Space Act was passed on July 29, 1958, disestablishing NASA's predecessor, the National Advisory Committee for Aeronautics (NACA). The new agency became operational on October 1, 1958. Since that time, most U.S. space exploration efforts have been led by NASA, including the Apollo moon-landing missions, the Skylab space station, and later the Space Shuttle. Currently, NASA is supporting the International Space Station and is overseeing the development of the Orion Multi-Purpose Crew Vehicle, the Space Launch System and Commercial Crew vehicles.", "Hong Kong, officially known as Hong Kong Special Administrative Region of the People's Republic of China, is a region on the southern coast of China geographically enclosed by the Pearl River Delta and South China Sea. Hong Kong is known for its expansive skyline and deep natural harbour, and with a land mass of 1,104 km2 (426 sq mi) and a population of over seven million people, is one of the most densely populated areas in the world. Hong Kong became a colony of the British Empire after the First Opium War (1839-42). Hong Kong Island was first ceded to Great Britain in perpetuity, followed by Kowloon Peninsula in 1860 and then the New Territories was put under lease in 1898. It was occupied by Japan during The Second World War (1941-45), after which the British resumed control until 1997.", "Stephen William Hawking (born 8 January 1942) is an English theoretical physicist, cosmologist, author and Director of Research at the Centre for Theoretical Cosmology within the University of Cambridge. Among his significant scientific works have been a collaboration with Roger Penrose on gravitational singularity theorems in the framework of general relativity, and the theoretical prediction that black holes emit radiation, often called Hawking radiation. Hawking was the first to set forth a cosmology explained by a union of the general theory of relativity and quantum mechanics. He is a vocal supporter of the many-worlds interpretation of quantum mechanics. Hawking has achieved success with works of popular science in which he discusses his own theories and cosmology in general; his A Brief History of Time stayed on the British Sunday Times best-sellers list for a record-breaking 237 weeks.", "The Battle of Wolf 359 is a fictional space battle in the Star Trek universe between the United Federation of Planets and the Borg Collective in the year 2367. The aftermath is depicted in the Star Trek: The Next Generation episode \"The Best of Both Worlds, Part II\" and the battle in Star Trek: Deep Space Nine pilot, \"Emissary.\" The battle occurs at the star Wolf 359, a real star system located 7.78 light years from Earth's solar system, and constitutes a total loss for the Federation, after the single attacking Borg ship obliterates the opposing fleet and proceeds to Earth without significant damage.", "Computational biology involves the development and application of data-analytical and theoretical methods, mathematical modeling and computational simulation techniques to the study of biological, behavioral, and social systems. The field is broadly defined and includes foundations in computer science, applied mathematics, animation, statistics, biochemistry, chemistry, biophysics, molecular biology, genetics, genomics, ecology, evolution, anatomy, neuroscience, and visualization."
];
/**
 * Collection of setup functions to perform before unit test execution
 */
var setup = {

    /**
     * Collection of setup tasks and flags indicating their state of completion
     */
    progress: {
        setTestRetina: false
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

    /**
     * Tests that getRepresentationForText throws an error if no options were configured
     */
    QUnit.asyncTest("testGetRepresentationWithoutOptions", function (assert) {
        assert.expect(1);
        assert.throws(function () {
            $.retinaApi.text.getRepresentationForText({}, $.noop);
        }, "Call to 'getRepresentationForText' is missing the following required parameters: options.retinaName, options.text", "Exception thrown due to missing options");
        QUnit.start();
    });

    /**
     * Tests that getSimilarTerms returns related keywords for a given term
     */
    QUnit.asyncTest("testGetRepresentationForValidText", function (assert) {
        assert.expect(2);
        var options = {retinaName: testRetinaName, text: testTexts[0]};
        var callback = function (data) {
            assert.ok(data.length == 1, "Data was returned");
            assert.notEqual(typeof data[0].positions, "undefined", "Results contain a fingerprint");
            QUnit.start();
        };
        $.retinaApi.text.getRepresentationForText(options, callback);
    });

    /**
     * Tests that getKeywordsForText throws an error if no options were configured
     */
    QUnit.asyncTest("testGetKeywordsForTextWithoutOptions", function (assert) {
        assert.expect(1);
        assert.throws(function () {
            $.retinaApi.text.getKeywordsForText({}, $.noop);
        }, "Call to 'getKeywordsForText' is missing the following required parameters: options.retinaName, options.text", "Exception thrown due to missing options");
        QUnit.start();
    });

    /**
     * Tests that getKeywordsForText returns related keywords for a given text
     */
    QUnit.asyncTest("testGetKeywordsForTextForValidText", function (assert) {
        assert.expect(1);
        var options = {retinaName: testRetinaName, text: testTexts[0]};
        var callback = function (data) {
            assert.ok(data.length > 0, "Keywords were returned");
            QUnit.start();
        };
        $.retinaApi.text.getKeywordsForText(options, callback);
    });

    /**
     * Tests that getTokensForText throws an error if no options were configured
     */
    QUnit.asyncTest("testGetTokensForTextWithoutOptions", function (assert) {
        assert.expect(1);
        assert.throws(function () {
            $.retinaApi.text.getTokensForText({}, $.noop);
        }, "Call to 'getTokensForText' is missing the following required parameters: options.retinaName, options.text", "Exception thrown due to missing options");
        QUnit.start();
    });

    /**
     * Tests that getTokensForText returns tokens for a given text
     */
    QUnit.asyncTest("testGetTokensForTextForValidText", function (assert) {
        assert.expect(1);
        var options = {retinaName: testRetinaName, text: testTexts[0]};
        var callback = function (data) {
            assert.ok(data.length > 0, "Tokens were returned");
            QUnit.start();
        };
        $.retinaApi.text.getTokensForText(options, callback);
    });

    /**
     * Tests that getTokensForText returns tokens for a given text using a POS tag filter
     */
    QUnit.asyncTest("testGetTokensForTextForValidText", function (assert) {
        assert.expect(3);
        var options = {retinaName: testRetinaName, text: testTexts[0]};
        var callback = function (data) {
            var unfilteredCount = JSON.stringify(data).match(/,/g).length;
            assert.ok(unfilteredCount > 0, "Tokens were returned");

            options.posTags = "NN";
            var filteredCallback = function (data) {
                var filteredCount = JSON.stringify(data).match(/,/g).length;
                assert.ok(filteredCount > 0, "Tokens were returned");
                assert.ok(unfilteredCount > filteredCount, "Filtered token count was less than the unfiltered token count");
                QUnit.start();
            };
            $.retinaApi.text.getTokensForText(options, filteredCallback);
        };
        $.retinaApi.text.getTokensForText(options, callback);
    });

    /**
     * Tests that getSlicesForText throws an error if no options were configured
     */
    QUnit.asyncTest("testGetSlicesForTextWithoutOptions", function (assert) {
        assert.expect(1);
        assert.throws(function () {
            $.retinaApi.text.getSlicesForText({}, $.noop);
        }, "Call to 'getSlicesForText' is missing the following required parameters: options.retinaName, options.text", "Exception thrown due to missing options");
        QUnit.start();
    });

    /**
     * Tests that getSlicesForText returns slices for a given text
     */
    QUnit.asyncTest("testGetSlicesForTextValidText", function (assert) {
        assert.expect(2);
        var options = {retinaName: testRetinaName, text: testTexts[0]};
        var callback = function (data) {
            assert.ok(data.length > 0, "Slices were returned");
            assert.notEqual(typeof data[0].fingerprint, "undefined", "Returned data contained a fingerprint");
            QUnit.start();
        };
        $.retinaApi.text.getSlicesForText(options, callback);
    });

    /**
     * Tests that getRepresentationsForBulkText throws an error if no options were configured
     */
    QUnit.asyncTest("testGetRepresentationsForBulkTextWithoutOptions", function (assert) {
        assert.expect(1);
        assert.throws(function () {
            $.retinaApi.text.getRepresentationsForBulkText({}, $.noop);
        }, "Call to 'getRepresentationsForBulkText' is missing the following required parameters: options.retinaName, options.texts", "Exception thrown due to missing options");
        QUnit.start();
    });

    /**
     * Tests that getRepresentationsForBulkText returns fingerprints for an array of texts
     */
    QUnit.asyncTest("testGetRepresentationsForValidBulk", function (assert) {
        var options = {retinaName: testRetinaName, texts: testTexts};
        var callback = function (data) {
            assert.ok(data.length > 0, "Data was returned");
            $.each(data, function (index, entry) {
                assert.notEqual(typeof entry.positions, "undefined", "Returned data contained a fingerprint");
            });
            QUnit.start();
        };
        $.retinaApi.text.getRepresentationsForBulkText(options, callback);
    });

}