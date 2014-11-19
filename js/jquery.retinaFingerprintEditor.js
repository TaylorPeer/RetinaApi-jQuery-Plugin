(function ($) {

    $.fn.fingerprintEditor = function (options) {

        /**
         * Create a fingerprint editor out of a DOM element
         * @param $element
         * @param options
         */
        function createFingerprintEditor($element, options) {
            // Add all default options
            options = $.extend({}, $.fn.expressionBuilder.defaults, options);
        }

        return this.each(function (options) {

            // Add all default options
            options = $.extend({}, $.fn.expressionBuilder.defaults, options);

            if (!$(this).is("div")) {
                throw "fingerprintEditor is only applicable to DIV elements";
            } else {
                createFingerprintEditor($(this), options);
            }
        });
    };

    /**
     * Collection of default plugin options
     */
    $.fn.fingerprintEditor.defaults = {

    };

})(jQuery);