/**
 * TODO
 */
(function ($) {

    /**
     * TODO
     */
    $.retinaElements = (function () {

        var expressionTermTextBeforeDelete = '';
        var selectedExpressionTermText = '';
        var operatorKeys = {
            '+': 'AND',
            '|': 'OR',
            '!': 'NOT',
            '-': 'SUB',
            '^': 'XOR'};
        var expressionHistory = [];
        var shortcutHints = '';
        var lastRenderedExpression;
        var lastRenderedResults = "";
        var lastSelectedExpressionTerm;
        var currentCorticalIOExpression;
        var characterLimit = 30;
        var fetchingContent = false;

        /**
         * TODO
         * @param element
         */
        var placeCaretAtEnd = function (element) {

            if (typeof element === "undefined") {
                element = currentCorticalIOExpression.find('.new-term');
                element.parent().find('.expression-term').removeClass('selected editing'); // remove any selections
                ensureBtwTermsCorrect();
            }

            var el = element.get(0);
            el.focus();
            if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
                var range = document.createRange();
                range.selectNodeContents(el);
                range.collapse(false);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } else if (typeof document.body.createTextRange != "undefined") {
                var textRange = document.body.createTextRange();
                textRange.moveToElementText(el);
                textRange.collapse(false);
                textRange.select();
            }
        };

        return {

        };

    }());

}(jQuery));