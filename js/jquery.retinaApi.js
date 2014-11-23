(function ($) {

    $.retinaApi = (function () {

        /**
         * Ensures default options are used for REST calls if no options were specified
         * @param options
         * @param callback
         */
        function prepareOptions(options, callback) {

            // Checks if options variable is actually the callback function (for the case that no options were specified)
            if ($.isFunction(options)) {
                options = {callback: options};
            }

            // Add all default options
            options = $.extend({}, $.retinaApi.defaults, options);

            if ($.isFunction(callback)) {
                options.callback = callback;
            }

            return options;
        }

        /**
         * Checks that a API call has all required parameters configured
         * @param callDescriptor
         * @param options
         * @param required
         */
        function checkForRequiredParameters(callDescriptor, options, required) {
            var missingParameters = [];
            $.each(required, function (index, value) {
                if (typeof options[getKeyFromValue($.retinaApi.parameters, value)] === "undefined") {
                    var missingParameterOptionName = getKeyFromValue($.retinaApi.parameters, value);
                    missingParameters.push(missingParameterOptionName);
                }
            });
            if (missingParameters.length > 0) {
                throw "Call to '" + callDescriptor + "' is missing the following required parameters: options." + missingParameters.join(", options.");
            }
        }

        /**
         * Returns a key from a collection based on its value
         * @param object
         * @param value
         * @returns {string}
         */
        function getKeyFromValue(object, value) {
            for (var prop in object) {
                if (object.hasOwnProperty(prop)) {
                    if (object[prop] === value) {
                        return prop;
                    }
                }
            }
        }

        /**
         * Returns a list of URL parameters to append to API requests constructed from the options object
         * @param options
         */
        function getUrlParameters(options) {

            this.parameters = {};
            this.possibleUrlParameters = {
                contextId: "context_id",
                getFingerprint: "get_fingerprint",
                imageEncoding: "image_encoding",
                imageScalar: "image_scalar",
                maxResults: "max_results",
                plotShape: "plot_shape",
                posType: "pos_type",
                retinaName: "retina_name",
                sparsity: "sparsity",
                startIndex: "start_index",
                term: "term"
            };
            var that = this;

            $.each(Object.keys(that.possibleUrlParameters), function (index, parameter) {
                if (typeof options[parameter] != "undefined") {
                    that.parameters[that.possibleUrlParameters[parameter]] = options[parameter];
                }
            });
            return $.param(this.parameters);
        }

        /**
         * Makes a GET request
         * @param url
         * @param options
         */
        function get(url, options) {
            sendRequest(url, "GET", null, options);
        }

        /**
         * Makes a POST request
         * @param url
         * @param data
         * @param options
         */
        function post(url, data, options) {
            sendRequest(url, "POST", data, options);
        }

        /**
         * Sends an API request
         * @param url
         * @param type
         * @param data
         * @param options
         */
        function sendRequest(url, type, data, options) {

            // Construct request URL
            url = options.basePath + url;
            var parameters = getUrlParameters(options);
            if (parameters.length) {
                url = [url, parameters].join('?');
            }

            $.ajax({
                url: url,
                beforeSend: options.beforeSend,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'api-key': options.apiKey
                },
                type: type,
                data: data,
                datatype: "json",
                error: options.errorHandler
            }).then(function (data) {

                // Ensure the response contained data
                if (!data) {
                    options.callback(false, $.retinaApi.errors.NoDataError);
                    return;
                }

                try {
                    options.callback(data);
                } catch (e) {
                    if (typeof options.callback == "undefined") {
                        throw "No callback defined to handle returned data: \n" + data;
                    } else {
                        options.callback(false, new $.retinaApi.errors.InvalidJSON(e));
                    }
                }

            });
        }

        return {

            /**
             * Standard options
             */
            defaults: {
                apiKey: "",
                basePath: "http://api.cortical.io/rest/",
                beforeSend: $.noop,
                callback: $.noop,
                contextId: undefined,
                errorHandler: $.noop,
                getFingerprint: undefined,
                imageEncoding: undefined,
                imageScalar: undefined,
                maxResults: undefined,
                plotShape: undefined,
                posType: undefined,
                retinaName: undefined,
                sparsity: undefined,
                term: undefined,
                text: undefined,
                startIndex: undefined
            },

            /**
             * API errors
             */
            errors: {
                NoDataError: { type: 'NoDataError', message: "No data was supplied to the callback."},
                InvalidJSON: function (data) {
                    return {
                        type: 'InvalidJSON',
                        message: "The request returned invalid JSON: \n" + data
                    };
                }
            },

            /**
             * Call parameters
             */
            parameters: {
                contextId: "context_id",
                getFingerprint: "get_fingerprint",
                imageEncoding: "image_encoding",
                imageScalar: "image_scalar",
                maxResults: "max_results",
                plotShape: "plot_shape",
                posType: "pos_type",
                retinaName: "retina_name",
                sparsity: "sparsity",
                startIndex: "start_index",
                term: "term",
                text: "text"
            },

            /**
             * Retinas API
             */
            retinas: {

                /**
                 * If no value is chosen for the retinaName option, this method returns an overview of all available retinas.
                 * If a specific retina is chosen, then only information about that retina is returned.
                 * @param options
                 * @param callback
                 */
                getRetinas: function (options, callback) {
                    options = prepareOptions(options, callback);
                    get('retinas', options);
                }

            },

            /**
             * Terms API
             */
            terms: {

                /**
                 * When the term option for this endpoint is not specified, a listing of all terms in the retina will be
                 * returned. Otherwise this endpoint returns a term object with meta-data for an exact match, or a list
                 * of potential retina terms if the string contains one or more of the wildcard characters, '*' and '?'.
                 *
                 * The wildcard characters must be initially preceded by at least 3 characters.
                 * - The asterisk wildcard, '*', represents zero or more characters.
                 * - The question mark wildcard, '?', represents exactly one character.
                 *
                 * If the startIndex option for this method is not specified, the default of 0 will be assumed.
                 * If the maxResults option for this method is not specified, the default of 10 will be assumed.
                 *
                 * For this method the maximum number of results per page is limited to 1000.
                 * @param options
                 * @param callback
                 */
                getTerm: function (options, callback) {
                    options = prepareOptions(options, callback);
                    checkForRequiredParameters("getTerm", options, [$.retinaApi.parameters.retinaName]);
                    get('terms', options);
                },

                /**
                 * Returns a listing of all the contexts of this term.
                 *
                 * If the startIndex option for this method is not specified, the default of 0 will be assumed.
                 * If the maxResults option for this method is not specified, then the default value of 5 will be assumed.
                 *
                 * Each term can have as many different contexts as semantic meanings.
                 * @param options
                 * @param callback
                 */
                getContextsForTerm: function (options, callback) {
                    options = prepareOptions(options, callback);
                    checkForRequiredParameters("getContextsForTerm", options, [$.retinaApi.parameters.retinaName, $.retinaApi.parameters.term]);
                    get('terms/contexts', options);
                },

                /**
                 * This method returns a listing of similar terms for the specified input term.
                 *
                 * If any valid contextId is specified the method returns similar terms for the term in this specific context.
                 *
                 * If the startIndex option for this method is not specified, the default of 0 will be assumed.
                 *
                 * If the maxResults option for this method is not specified, then the default value of 10 will be assumed.
                 * For this method the maximum number of results per page is limited to 10.
                 *
                 * If the contextId parameter is not specified, this method returns a list of similar terms over all contexts.
                 *
                 * The posType option enables filtering of the results by parts of speech (one of: NOUN, VERB, ADJECTIVE).
                 * If this option is unspecified, no filtering will occur.
                 * @param options
                 * @param callback
                 */
                getSimilarTerms: function (options, callback) {
                    options = prepareOptions(options, callback);
                    checkForRequiredParameters("getSimilarTerms", options, [$.retinaApi.parameters.retinaName, $.retinaApi.parameters.term]);
                    get('terms/similar_terms', options);
                }

            },

            /**
             * Text API
             */
            text: {

                /**
                 * Returns a retina representation (a Fingerprint) of the input text.
                 * @param options
                 * @param callback
                 */
                getRepresentationForText: function (options, callback) {
                    options = prepareOptions(options, callback);
                    checkForRequiredParameters("getRepresentationForText", options, [$.retinaApi.parameters.retinaName, $.retinaApi.parameters.text]);
                    post('text', options.text, options);
                },

                /**
                 * Returns a list of keywords from the input text.
                 * @param options
                 * @param callback
                 */
                getKeywordsForText: function (options, callback) {
                    options = prepareOptions(options, callback);
                    checkForRequiredParameters("getKeywordsForText", options, [$.retinaApi.parameters.retinaName, $.retinaApi.parameters.text]);
                    post('text', options.text, options);
                }

                // TODO /text/tokenize
                // TODO /text/slices
                // TODO /text/bulk

            },

            /**
             * Expressions API
             */
            expressions: {

                /**
                 * TODO
                 * @param options
                 * @param callback
                 */
                processExpression: function (options, callback) {
                    options = prepareOptions(options, callback);
                    // TODO checkForRequiredParameters
                    post('expressions', options.data, options);
                }

                // TODO /expressions/contexts
                // TODO /expressions/similar_terms
                // TODO /expressions/bulk
                // TODO /expressions/contexts/bulk
                // TODO /expressions/similar_terms/bulk

            },

            /**
             * Compare API
             */
            compare: {

                /**
                 * This method enables a comparison between two elements and returns a representation of similarity.
                 * @param options
                 * @param callback
                 */
                compare: function (options, callback) {
                    var path = 'compare';
                    options = prepareOptions(options, callback);
                    checkForRequiredParameters(path, options, [$.retinaApi.parameters.retinaName]);
                    post(path, options.data, options);
                }

            },

            /**
             * Image API
             */
            image: {

                /**
                 * TODO
                 * @param options
                 * @param callback
                 */
                getImage: function (options, callback) {
                    options = prepareOptions(options, callback);
                    // TODO checkForRequiredParameters
                    post('image', options.data, options);
                },

                // TODO /image/compare

                /**
                 * TODO
                 * @param options
                 * @param callback
                 */
                getImageBulk: function (options, callback) {
                    options = prepareOptions(options, callback);
                    // TODO checkForRequiredParameters
                    post('image/bulk', options.data, options);
                }

            }

        };

    }());

}(jQuery));