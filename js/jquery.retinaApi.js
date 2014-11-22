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
         * @param call
         * @param options
         * @param required
         */
        function checkForRequiredParameters(call, options, required) {
            var missingParameters = [];
            $.each(required, function (index, value) {
                if (typeof options[getKeyFromValue($.retinaApi.parameters, value)] === "undefined") {
                    var missingParameterOptionName = getKeyFromValue($.retinaApi.parameters, value);
                    missingParameters.push(missingParameterOptionName);
                }
            });
            if (missingParameters.length > 0) {
                throw "Call to '" + call + "' is missing the following required parameters: options." + missingParameters.join(", ");
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
                    if (object[ prop ] === value) {
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
            var that = this;
            this.parameters = {};
            $.each(Object.keys($.retinaApi.parameters), function (index, parameter) {
                if (typeof options[parameter] != "undefined") {
                    that.parameters[$.retinaApi.parameters[parameter]] = options[parameter];
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
                data: undefined,
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
                term: "term"
            },

            /**
             * Returns a collection of available retinas or a specific retina if the parameter options.retinaName is set
             * @param options
             * @param callback
             */
            getRetinas: function (options, callback) {
                options = prepareOptions(options, callback);
                // TODO checkForRequiredParameters
                get('retinas', options);
            },

            /**
             * TODO
             * @param options
             * @param callback
             */
            getTerms: function (options, callback) {
                options = prepareOptions(options, callback);
                // TODO checkForRequiredParameters
                get('terms', options);
            },

            /**
             * TODO
             * @param options
             * @param callback
             */
            getTermContexts: function (options, callback) {
                options = prepareOptions(options, callback);
                // TODO checkForRequiredParameters
                get('terms/contexts', options);
            },

            /**
             * TODO
             * @param options
             * @param callback
             */
            getTermSimilarTerms: function (options, callback) {
                options = prepareOptions(options, callback);
                // TODO checkForRequiredParameters
                get('terms/similar_terms', options);
            },

            /**
             * TODO
             * @param options
             * @param callback
             */
            processText: function (options, callback) {
                options = prepareOptions(options, callback);
                // TODO checkForRequiredParameters
                post('text', options.data, options);
            },

            // TODO /text/keywords
            // TODO /text/tokenize
            // TODO /text/slices
            // TODO /text/bulk

            /**
             * TODO
             * @param options
             * @param callback
             */
            processExpression: function (options, callback) {
                options = prepareOptions(options, callback);
                // TODO checkForRequiredParameters
                post('expressions', options.data, options);
            },

            // TODO /expressions/contexts
            // TODO /expressions/similar_terms
            // TODO /expressions/bulk
            // TODO /expressions/contexts/bulk
            // TODO /expressions/similar_terms/bulk

            /**
             * Makes a comparison between two elements and returns a representation of similarity
             * @param options
             * @param callback
             */
            compare: function (options, callback) {
                var path = 'compare';
                options = prepareOptions(options, callback);
                checkForRequiredParameters(path, options, [$.retinaApi.parameters.retinaName]);
                post(path, options.data, options);
            },

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

        };

    }());

}(jQuery));