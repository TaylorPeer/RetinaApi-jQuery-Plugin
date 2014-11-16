(function ($) {

    $.retinaApi = (function () {

        /**
         * Ensures default options are used for REST calls if no options were specified
         * @param options
         * @param callback
         * @returns {void|n.extend|*}
         */
        function prepareOptions(options, callback) {

            // Checks if options is actually the callback function (for the case that no options were specified)
            if ($.isFunction(options)) {
                options = {callback: options};
            }

            // Add all default options
            options = $.extend({}, $.retinaApi.defaultOptions, options);

            if ($.isFunction(callback)) {
                options.callback = callback;
            }

            return options;
        }

        /**
         * Returns a list of URL parameters to append to API requests constructed from the options object
         * @param options
         * @returns {*}
         */
        function getUrlParameters(options) {

            this.parameters = {};

            this.availableParameters = {
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

            // Check if options contains any of the available parameters
            $.each(Object.keys(this.availableParameters), function (index, parameter) {
                if (typeof options[parameter] != "undefined") {
                    that.parameters[that.availableParameters[parameter]] = options[parameter];
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

                if (!data) {
                    options.callback(false, $.retinaApi.errors.NoDataError);
                    return;
                }

                try {
                    options.callback(data);
                } catch (e) {
                    options.callback(false, new $.retinaApi.errors.InvalidJSON(e));
                }

            });
        }

        return {

            /**
             * Standard options
             */
            defaultOptions: {
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
             * Returns a collection of available retinas or a specific retina if the parameter options.retinaName is set
             * @param options
             * @param callback
             */
            getRetinas: function (options, callback) {
                options = prepareOptions(options, callback);
                get('retinas', options);
            },

            /**
             * TODO
             * @param options
             * @param callback
             */
            getTerms: function (options, callback) {
                options = prepareOptions(options, callback);
                get('terms', options);
            },

            /**
             * TODO
             * @param options
             * @param callback
             */
            getTermContexts: function (options, callback) {
                options = prepareOptions(options, callback);
                get('terms/contexts', options);
            },

            /**
             * TODO
             * @param options
             * @param callback
             */
            getTermSimilarTerms: function (options, callback) {
                options = prepareOptions(options, callback);
                get('terms/similar_terms', options);
            },

            /**
             * TODO
             * @param options
             * @param callback
             */
            processText: function (options, callback) {
                options = prepareOptions(options, callback);
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
                post('expressions', options.data, options);
            },

            // TODO /expressions/contexts
            // TODO /expressions/similar_terms
            // TODO /expressions/bulk
            // TODO /expressions/contexts/bulk
            // TODO /expressions/similar_terms/bulk

            // TODO /compare

            /**
             * TODO
             * @param options
             * @param callback
             */
            getImage: function (options, callback) {
                options = prepareOptions(options, callback);
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
                post('image/bulk', options.data, options);
            }

        };

    }());

}(jQuery));