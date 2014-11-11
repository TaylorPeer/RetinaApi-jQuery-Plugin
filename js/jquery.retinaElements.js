(function ($) {

    /**
     * Append plugin to jQuery object
     */
    $.retinaElements = (function () {

        /**
         * Load external stylesheet and append to the current document
         */
        $(function () {
            $('head').append('<link rel="stylesheet" href="css/retina-styles.css" type="text/css" />');
        });

        /**
         * Create an expression editor editable text field out of a DOM element
         * @param $element
         */
        function expressionEditor($element) {

            /**
             * Maximum length of a retina term in characters
             * @type {number}
             */
            var TERM_CHAR_LIMIT = 30;

            /**
             * Collection of operators used in Retina expressions
             */
            var OPERATORS = {
                '+': 'AND',
                '|': 'OR',
                '!': 'NOT',
                '-': 'SUB',
                '^': 'XOR'
            };

            /**
             * Collection of key code aliases
             */
            var KEYSTROKES = {
                'BACKSPACE': 8,
                'TAB': 9,
                'ENTER': 13,
                'SPACE': 32,
                'LEFT_ARROW': 37,
                'UP_ARROW': 38,
                'RIGHT_ARROW': 39,
                'DOWN_ARROW': 40,
                'DELETE' : 46
            };

            var expressionTermTextBeforeDelete = '';
            var selectedExpressionTermText = '';
            var lastSelectedExpressionTerm;
            var $currentRetinaExpression;

            createExpressionEditor($element);

            /**
             * Create an expression editor out of a DOM element
             * @param $element
             */
            function createExpressionEditor($element) {

                $currentRetinaExpression = $element;
                var contentToRender = '<div class="expression-field"></div><div class="expression-results"></div>';
                $currentRetinaExpression.html(contentToRender);

                addTermIfNeeded();
                $currentRetinaExpression = $element.first();
                placeCursorAtEnd();

                sortableEnable();
            }

            /**
             * Adds a new-term span if the expression editor does not already contain one
             */
            function addTermIfNeeded() {
                $('.expression-field', $element).each(function () {
                    var $this = $(this);
                    if (!($this.find('.new-term').length)) {
                        // add a class so the placeholder text can be changed if it is not the first term in the expression
                        var adding = $this.find('.expression-term').length ? ' adding' : '';
                        $this.append('<span class="new-term' + adding + '" spellcheck="false" contenteditable></span>');
                    }
                });
            }

            /**
             * Moves the cursor to the end of the expression
             * @param $elements
             */
            function placeCursorAtEnd($elements) {

                if (typeof $elements === "undefined") {

                    $elements = $currentRetinaExpression.find('.new-term');

                    // remove any selections
                    $elements.parent().find('.expression-term').removeClass('selected editing');

                    ensureBtwTermsCorrect();
                }

                var element = $elements.get(0);
                element.focus();
                if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
                    var range = document.createRange();
                    range.selectNodeContents(element);
                    range.collapse(false);
                    var selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else if (typeof document.body.createTextRange != "undefined") {
                    var textRange = document.body.createTextRange();
                    textRange.moveToElementText(element);
                    textRange.collapse(false);
                    textRange.select();
                }
            }

            /**
             * Ensures that span elements are located between all terms in the expression, so that new terms may be entered at any position
             */
            function ensureBtwTermsCorrect() {

                var previousItem;
                var btwTermHTML = '<span contenteditable spellcheck="false" class="btw-term"></span>';

                var $span = $currentRetinaExpression.find('.expression-field').find('span');
                var spanLength = $span.length;

                $span.each(function (index) {

                    if (index == spanLength - 1 && $(this).hasClass('expression-term')) {
                        $(this).after(btwTermHTML).next().addClass('adding').removeClass('has-text');
                    }

                    if (previousItem) {
                        if ((previousItem.hasClass('btw-term') && $(this).hasClass('expression-term')) || (previousItem.hasClass('expression-term') && $(this).hasClass('btw-term')) || (previousItem.hasClass('expression-term') && $(this).hasClass('new-term')) || (previousItem.hasClass('new-term') && $(this).hasClass('expression-term'))) {
                            previousItem = $(this);
                            return;
                        }
                        if (previousItem.hasClass('btw-term') && $(this).hasClass('btw-term')) {
                            $(this).remove();
                            return;
                        }
                        if (previousItem.hasClass('expression-term') && $(this).hasClass('expression-term')) {
                            $(this).before(btwTermHTML);
                            previousItem = $(this);
                            return;
                        }
                        if (previousItem.hasClass('btw-term') && $(this).hasClass('new-term')) {
                            previousItem.remove();
                            previousItem = $(this);
                            return;
                        }
                        if (previousItem.hasClass('new-term') && $(this).hasClass('btw-term')) {
                            $(this).remove();
                            return;
                        }
                    } else {
                        if ($(this).hasClass('expression-term')) {
                            $(this).before(btwTermHTML);
                        }
                        previousItem = $(this);
                        return;
                    }

                })
            }

            /**
             * TODO
             */
            function ensureNewTermPlaceholderTextCorrect() {
                $element.find('.expression-field').each(function () {
                    var $this = $(this);
                    var $span = $this.find('span');
                    var $newTerm = $this.find('.new-term');

                    // Check if term is being added at the end of the expression or somewhere in the middle
                    var notInTheLastPosition = !isLastPosition($newTerm, $span);

                    var newTermText = $.trim($newTerm.text());
                    if (newTermText == '' && !notInTheLastPosition) {
                        $newTerm.removeClass('has-text');
                    }
                    if (newTermText == '' && $this.find('.expression-term').length == 0) {
                        $newTerm.removeClass('adding');
                    }
                    if (notInTheLastPosition && !($this.parent().is($currentRetinaExpression))) {
                        $newTerm.removeClass('new-term').addClass('btw-term');
                        addTermIfNeeded();
                    }
                });
            }

            /**
             * TODO
             */
            function sortableEnable() {
                $element.find('.expression-field').sortable({
                    placeholder: "ui-state-highlight",
                    cursor: "move",
                    CustomBeforeStart: function (e, ui) {
                        $('.new-term, .btw-term').remove();
                        // have to set the cursor since we'll be cloning elements
                        $element.find('.expression-field').sortable("option", "cursorAt", { left: ui.item.outerWidth() / 2, top: ui.item.outerHeight() / 2 });
                    },
                    items: ".expression-term", // specifically exclude new-terms and btw-terms
                    start: function (event, ui) {
                        ui.placeholder.addClass(ui.helper.attr('class')).removeClass('selected').html('&nbsp;').outerWidth(ui.item.outerWidth());
                        ui.item.parent().blur();
                    },
                    tolerance: "pointer",
                    helper: function (event, item) {

                        // make sure at least one item is selected
                        if (!item.hasClass("selected")) {
                            item.addClass("selected").siblings().removeClass("selected");
                        }

                        var $helper = $("<span class='" + item.get(0).className + "'><span id='helper-container'></span></span>");
                        var $selected = item.parent().children(".selected");
                        var $cloned = $selected.clone();
                        $helper.find("helper-container").append($cloned);

                        // hide it, don't remove!
                        $selected.hide();

                        // save the selected items
                        item.data("multi-sortable", $cloned);

                        return $helper;
                    },
                    stop: function (event, ui) {

                        // add the cloned ones
                        var $cloned = ui.item.data("multi-sortable");
                        ui.item.removeData("multi-sortable");

                        $cloned.removeClass('selected editing');

                        // append it
                        ui.item.after($cloned);

                        // remove the hidden ones
                        ui.item.siblings(":hidden").remove();

                        // remove self, it's duplicated
                        ui.item.remove();

                        addTermIfNeeded();
                        placeCursorAtEnd();
                    },
                    disabled: false
                }).disableSelection();
            }

            /**
             * Disables sorting within the expression editor field
             */
            function sortableDisable() {
                $element.find('.expression-field').sortable("disable");
            }

            /**
             * TODO
             * @param $el
             */
            function checkForOperator($el) {
                var isOperator = false,
                    termText = $el.text();
                $.each(OPERATORS, function (key, value) {
                    if (termText.toUpperCase() === value) { // if matches the word name of operator, add it as an operator
                        termText = value;
                        isOperator = true;
                        return false;
                    }
                    var termTextWithoutQuotes = termText.replace(/["']/g, "");
                    if (termTextWithoutQuotes.toUpperCase() === value) {
                        termText = termTextWithoutQuotes; // if matches an operator, but has quotes, just remove the quotes and keep as a standard term
                    }
                });
                isOperator ? $el.addClass('operator') : $el.removeClass('operator');
                $el.text(termText);
            }

            /**
             * Checks if a term is located at the last position of a span
             * @param $term
             * @param $span
             * @returns {boolean}
             */
            function isLastPosition($term, $span) {
                return $span.index($term) == $span.length - 1;
            }

            // Override sortable prototype so that span elements can be removed before sorting
            var oldMouseStart = $.ui.sortable.prototype._mouseStart;
            $.ui.sortable.prototype._mouseStart = function (event, overrideHandle, noActivation) {
                this._trigger("CustomBeforeStart", event, this._uiHash());
                oldMouseStart.apply(this, [event, overrideHandle, noActivation]);
            };

            // Listen for keystrokes outside of field
            $('body').on('keydown', function (e) {

                if (e.which == KEYSTROKES.BACKSPACE || e.which == KEYSTROKES.DELETE) {
                    // there are selected expression-terms
                    if ($currentRetinaExpression.find('.selected').length) {
                        e.preventDefault();
                        var eventToTrigger = $.Event('keydown');
                        eventToTrigger.which = KEYSTROKES.BACKSPACE;
                        $currentRetinaExpression.find('.new-term').focus().trigger(eventToTrigger);
                    }
                }

                if ((e.which == KEYSTROKES.TAB || e.which == KEYSTROKES.ENTER) && $currentRetinaExpression.find('.selected').length) {
                    e.preventDefault();
                    // TODO if (e.which == KEYSTROKES.ENTER) fetchExpressionResults();
                    // TODO if (e.which == KEYSTROKES.TAB) clearExpressionResults();
                    placeCursorAtEnd();
                }

                if (e.which == KEYSTROKES.LEFT_ARROW || e.which == KEYSTROKES.RIGHT_ARROW) {

                    var $expressionTerm = $currentRetinaExpression.find('.expression-field').find('.expression-term');
                    var $selected = $expressionTerm.parent().find('.selected');

                    if ($selected.length) { // if we have some selected we can use arrow keys to move the selection

                        if (!(e.shiftKey)) {
                            $expressionTerm.removeClass('selected');
                        }

                        if (e.which == KEYSTROKES.LEFT_ARROW) {

                            if (lastSelectedExpressionTerm.is($($selected[$selected.length - 1])) && $selected.length > 1) {
                                // they must have reversed direction so we're going to start unselecting
                                $($selected[$selected.length - 1]).removeClass('selected');
                                lastSelectedExpressionTerm = $($selected[$selected.length - 2]);
                            } else {
                                if ($expressionTerm.index($selected[0]) != 0) {
                                    //prevents going past the left edge
                                    lastSelectedExpressionTerm = $($selected[0]).prevAll('.expression-term:first').addClass('selected');
                                } else {
                                    lastSelectedExpressionTerm = $($selected[0]).addClass('selected');
                                }
                            }

                        } else {

                            if (lastSelectedExpressionTerm.is($($selected[0])) && $selected.length > 1) {
                                // they must have reversed direction so we're going to start unselecting
                                $($selected[0]).removeClass('selected');
                                lastSelectedExpressionTerm = $($selected[1]);
                            } else {
                                if ($expressionTerm.index($selected[$selected.length - 1]) != $expressionTerm.length - 1) {
                                    //prevents going past the right edge
                                    lastSelectedExpressionTerm = $($selected[$selected.length - 1]).nextAll('.expression-term:first').addClass('selected');
                                } else {
                                    if (!(e.shiftKey)) { // jump into new-term
                                        placeCursorAtEnd();
                                    }
                                }
                            }
                        }
                    }
                }
            }).on('keydown', '.new-term', function (e) {

                $(this).addClass('has-text');
                var $span = $currentRetinaExpression.find('.expression-field').find('span');

                // Check if term is being added at the end of the expression or somewhere in the middle
                var notInTheLastPosition = !isLastPosition($(this), $span);

                var newTermText = $.trim($(this).text());
                $this = $(this);

                if (e.which == KEYSTROKES.TAB || e.which == KEYSTROKES.ENTER) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (newTermText == '') { // if blank new-term
                        // TODO if (e.which == KEYSTROKES.ENTER) fetchExpressionResults();
                        if (notInTheLastPosition) { // if ENTER/TAB and in the middle
                            // TODO if (e.which == KEYSTROKES.TAB) clearExpressionResults();
                            $this.remove();
                            addTermIfNeeded();
                            placeCursorAtEnd();
                        } else {
                            var $currentRetinaExpressions = $element;
                            if ($currentRetinaExpressions.length > 1) {
                                var currentIndex = $currentRetinaExpressions.index($currentRetinaExpression);
                                if (e.shiftKey) { // go to the left
                                    if (currentIndex > 0) { // protect against moving past beginning
                                        $currentRetinaExpression = $($currentRetinaExpressions[currentIndex - 1]);
                                        placeCursorAtEnd();
                                    }
                                } else { // go to the right
                                    if (currentIndex < ($currentRetinaExpressions.length - 1)) {  // protect against moving past end
                                        $currentRetinaExpression = $($currentRetinaExpressions[$currentRetinaExpressions.index($currentRetinaExpression) + 1]);
                                        placeCursorAtEnd();
                                    }
                                }
                            }
                        }

                        // in case the field is blank, do nothing else
                        return;
                    }
                    checkForOperator($this);
                    $this.addClass('expression-term').removeClass('new-term has-text adding').removeAttr('contenteditable');
                    addTermIfNeeded();
                    placeCursorAtEnd();
                    // TODO if (e.which == KEYSTROKES.TAB) clearExpressionResults(); // if TAB
                    // TODO if (e.which == KEYSTROKES.ENTER) fetchExpressionResults(); // runs after a new-term has been added
                }

                if (e.which == KEYSTROKES.BACKSPACE || e.which == KEYSTROKES.DELETE) {
                    if (newTermText == '') {
                        e.preventDefault();
                        // if(notInTheLastPosition) return; // if we're somewhere in the middle, don't delete any terms

                        var $selected = $currentRetinaExpression.find('.expression-field').find('.selected');
                        if ($selected.length) { // if we've selected any, delete those first before deleting the previous
                            $selected.remove();
                        } else if (e.which == KEYSTROKES.BACKSPACE) {
                            $this.prev().remove(); // if we just pressed BKSP with a blank new-term, remove the previous expression-term
                        }
                        placeCursorAtEnd();
                        // TODO clearExpressionResults();
                    }
                }

                if (e.which == KEYSTROKES.LEFT_ARROW || e.which == KEYSTROKES.RIGHT_ARROW) {
                    if (newTermText == '') {
                        var newTermIndex = $span.index($this);
                        if (e.which == KEYSTROKES.LEFT_ARROW) {
                            if (newTermIndex != 0) { // prevent going left if at the first item
                                if (e.shiftKey) {
                                    e.stopPropagation();
                                    $($span.get(newTermIndex - 1)).trigger('click');
                                } else {
                                    $($span.get(newTermIndex - 2)).trigger('click');
                                }
                            }
                        } else if (notInTheLastPosition) {
                            $($span.get(newTermIndex + 2)).trigger('click');
                        }
                    }
                }

                if (e.which == KEYSTROKES.UP_ARROW || e.which == KEYSTROKES.DOWN_ARROW) {
                    e.preventDefault();
                }

                if (e.which == KEYSTROKES.SPACE) {
                    if (newTermText == '') e.preventDefault();
                }

            }).on('keyup', '.new-term', function (e) {

                var $this = $(this),
                    newTermText = $.trim($this.text());
                ensureNewTermPlaceholderTextCorrect();
                // TODO clearExpressionResults();
                $.each(OPERATORS, function (key, value) { // keyboard shortcut checker
                    if (newTermText === key) {
                        var eventToTrigger = $.Event('keydown');
                        eventToTrigger.which = KEYSTROKES.TAB; // TAB
                        $this.text(value); // Change text to the operator word
                        $this.trigger(eventToTrigger);
                        return false;
                    }
                });

                if (newTermText.length > TERM_CHAR_LIMIT) {
                    $this.text(newTermText.substr(0, TERM_CHAR_LIMIT));
                    placeCursorAtEnd();
                }

            }).on('keydown', '.expression-term', function (e) {

                if (e.which == KEYSTROKES.TAB || e.which == KEYSTROKES.ENTER) {
                    e.preventDefault();
                    var $this = $(this);
                    checkForOperator($this);
                    placeCursorAtEnd();
                    selectedExpressionTermText = '';
                }
                if (e.which == KEYSTROKES.BACKSPACE || e.which == KEYSTROKES.DELETE) {
                    expressionTermTextBeforeDelete = $.trim($(this).text());
                    // prevent browser from deleting <span> elements
                    if (expressionTermTextBeforeDelete == '') {
                        e.preventDefault();
                    }
                }

            }).on('keyup', '.expression-term', function (e) {

                var $this = $(this),
                    expressionTermText = $.trim($this.text());
                if (e.which == KEYSTROKES.BACKSPACE || e.which == KEYSTROKES.DELETE) {

                    if ((expressionTermText == '' && expressionTermTextBeforeDelete == '' ) || (expressionTermTextBeforeDelete == selectedExpressionTermText && expressionTermText == '')) {
                        $this.remove();
                        placeCursorAtEnd();
                        // TODO clearExpressionResults();
                        selectedExpressionTermText = '';
                    }
                    expressionTermTextBeforeDelete = '';
                }
                if (expressionTermText.length > TERM_CHAR_LIMIT) {
                    $this.text(expressionTermText.substr(0, TERM_CHAR_LIMIT));
                    placeCursorAtEnd($this);
                }

            }).on('click', '.new-term', function () {
                $currentRetinaExpression = $(this).parent().parent();
                placeCursorAtEnd();
            }).on('click', '.btw-term', function () {

                $currentRetinaExpression = $(this).parent().parent();
                $currentRetinaExpression.find('.new-term').remove();
                $(this).removeClass('btw-term').addClass('new-term');
                var $span = $currentRetinaExpression.find('.expression-field').find('span');

                // Check if term is being added at the end of the expression or somewhere in the middle
                var notInTheLastPosition = !isLastPosition($(this), $currentRetinaExpression.find('.expression-field').find('span'));

                if (notInTheLastPosition) {
                    $(this).addClass('has-text');
                }

                placeCursorAtEnd();

            }).on('click', '.expression-field .expression-term', function (e) {

                $currentRetinaExpression = $(this).parent().parent();
                e.stopPropagation(); // prevents bubbling up -- we have a click anywhere set to deselect expression terms
                var $this = $(this);
                if (!($this.hasClass('selected') || $this.hasClass('editing')) || $this.parent().find('.selected').length > 1) {
                    if (!(e.ctrlKey || e.metaKey || e.shiftKey)) { // not CTRL, CMD, SHIFT
                        $this.parent().find('.expression-term').removeClass('selected editing');
                    } else if (e.shiftKey) { // SHIFT
                        var $expressionTerm = $currentCorticalIOExpression.find('.expression-field').find('.expression-term');
                        var thisIndex = $expressionTerm.index($this);
                        var lastSelectedIndex = $expressionTerm.index(lastSelectedExpressionTerm);
                        $expressionTerm.filter(function (index) {
                            if ((thisIndex - lastSelectedIndex) > 0) {
                                if (lastSelectedIndex < index && index < thisIndex) return true;
                            } else {
                                if (lastSelectedIndex > index && index > thisIndex) return true;
                            }
                        }).addClass('selected');
                    }
                    $this.addClass('selected');
                    lastSelectedExpressionTerm = $this;
                    $('.new-term').blur();
                } else if ($this.hasClass('selected')) {
                    sortableDisable();
                    $this.removeClass('selected').addClass('editing').attr('contenteditable', 'true');
                    // select all text inside clicked element
                    var range, selection;
                    if (window.getSelection) {
                        selection = window.getSelection();
                        range = document.createRange();
                        range.selectNodeContents(this);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } else if (document.body.createTextRange) {
                        range = document.body.createTextRange();
                        range.moveToElementText(this);
                        range.select();
                    }
                    selectedExpressionTermText = $(this).text();
                } else if ($this.hasClass('editing')) {
                }
            }).on('click', '.expression-history li, .expression-examples li', function (e) {
                $currentRetinaExpression = $(this).parent().parent().parent();
                $currentRetinaExpression.find('.expression-field').html($(this).html());
                addTermIfNeeded();
                placeCursorAtEnd();
                // TODO fetchExpressionResults();
            }).on('click', $element, function (e) {
                // TODO
            }).on('click', function (e) {

                $element.find('.expression-term').removeClass('selected editing').removeAttr('contenteditable').blur(); // if there is a click anywhere
                sortableEnable();
                var $span = $currentRetinaExpression.find('.expression-field').find('span');
                var $newTerm = $currentRetinaExpression.find('.new-term');

                // Check if term is being added at the end of the expression or somewhere in the middle
                var notInTheLastPosition = !isLastPosition($newTerm, $span);

                var newTermText = $.trim($newTerm.text());
                if (newTermText == '' && notInTheLastPosition && !($newTerm.is(":focus"))) {
                    $newTerm.remove();
                    addTermIfNeeded();
                    ensureBtwTermsCorrect();
                }
            })
        }

        /**
         * Create a fingerprint canvas
         * @param $element
         */
        function fingerprintCanvas($element) {
            // TODO
        }

        /**
         * Attach the expression editor function to the jQuery object prototype
         */
        $.fn.expressionEditor = function () {
            if (this.is("div")) {
                expressionEditor(this);
            } else {
                throw "expressionEditor() is only applicable to DIV elements";
            }
        };

        /**
         * Attach the fingerprint canvas function to the jQuery object prototype
         */
        $.fn.fingerprintCanvas = function () {
            if (this.is("div")) {
                fingerprintCanvas(this);
            } else {
                throw "fingerprintCanvas() is only applicable to DIV elements";
            }
        };

    }());

}(jQuery));