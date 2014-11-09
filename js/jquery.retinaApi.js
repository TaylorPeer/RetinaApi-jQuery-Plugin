(function ($) {

    /**
     * TODO
     */
    $.retinaApi = (function () {

        /**
         * TODO
         */
        var basePath = "http://languages.cortical.io:80/rest/";

        /**
         * TODO
         * @param options
         * @param callback
         * @returns {void|n.extend|*}
         */
        var prepareOptions = function (options, callback) {

            if ($.isFunction(options)) {
                options = {callback: options};
            }

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
        var getUrlParameters = function (options) {

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

            if (typeof options.startIndex != "undefined") {
                params.start_index = options.startIndex;
            }

            if (typeof options.term != "undefined") {
                params.term = options.term;
            }

            return $.param(params);
        };

        /**
         * TODO
         * @param url
         * @param type
         * @param data
         * @param options
         */
        var sendRequest = function (url, type, data, options) {

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
                datatype: "json"
                // TODO error: handleRequestError
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
        };

        return {

            /**
             * TODO
             */
            defaultOptions: {
                apiKey: "",
                beforeSend: $.noop,
                callback: $.noop,
                contextId: undefined,
                getFingerprint: undefined,
                maxResults: undefined,
                posType: undefined,
                retinaName: undefined,
                term: undefined,
                startIndex: undefined
            },

            /**
             * TODO
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
                sendRequest('retinas', "GET", null, options);
            },

            /**
             * TODO
             * @param options
             * @param callback
             */
            getTerms: function (options, callback) {
                options = prepareOptions(options, callback);
                sendRequest('terms', "GET", null, options);
            },

            /**
             * TODO
             * @param options
             * @param callback
             */
            getTermContexts: function (options, callback) {
                options = prepareOptions(options, callback);
                sendRequest('terms/contexts', "GET", null, options);
            },

            /**
             * TODO
             * @param options
             * @param callback
             */
            getTermSimilarTerms: function (options, callback) {
                options = prepareOptions(options, callback);
                sendRequest('terms/similar_terms', "GET", null, options);
            }

        };

    }());

}(jQuery));