(function ($) {

    /**
     * Append the Retina API to the jQuery object
     */
    $.retinaApi = (function () {

        /**
         * Base path of the API endpoint
         */
        var basePath = "http://54.78.205.206/rest/";

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
        };

        /**
         * Returns a list of URL parameters to append to API requests constructed from the options object
         * @param options
         * @returns {*}
         */
        function getUrlParameters(options) {

            var params = {};

            if (typeof options.contextId != "undefined") {
                params.context_id = options.contextId;
            }

            if (typeof options.getFingerprint != "undefined") {
                params.get_fingerprint = options.getFingerprint;
            }

            if (typeof options.maxResults != "undefined") {
                params.max_results = options.maxResults;
            }

            if (typeof options.posType != "undefined") {
                params.pos_type = options.posType;
            }

            if (typeof options.retinaName != "undefined") {
                params.retina_name = options.retinaName;
            }

            if (typeof options.sparsity != "undefined") {
                params.sparsity = options.sparsity;
            }

            if (typeof options.startIndex != "undefined") {
                params.start_index = options.startIndex;
            }

            if (typeof options.term != "undefined") {
                params.term = options.term;
            }

            return $.param(params);
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

            var params = getUrlParameters(options);

            url = basePath + url;

            if (params.length) {
                url = [url, params].join('?');
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
                beforeSend: $.noop,
                callback: $.noop,
                contextId: undefined,
                data: undefined,
                errorHandler: $.noop,
                getFingerprint: undefined,
                maxResults: undefined,
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

            // TODO /text
            // TODO /text/keywords
            // TODO /text/tokenize
            // TODO /text/slices
            // TODO /text/bulk

            processExpression: function (options, callback) {
                options = prepareOptions(options, callback);
                post('expressions', options.data, options);
            }

            // TODO /expressions/contexts
            // TODO /expressions/similar_terms
            // TODO /expressions/bulk
            // TODO /expressions/contexts/bulk
            // TODO /expressions/similar_terms/bulk

            // TODO /compare

            // TODO /image
            // TODO /image/compare
            // TODO /image/bulk

        };

    }());

}(jQuery));