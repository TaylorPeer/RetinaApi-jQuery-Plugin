(function ($) {

    /**
     * Append plugin to jQuery object
     */
    $.retinaElements = (function () {

        /**
         * Include stylesheet
         */
        $(function () {
            $('head').append('<link rel="stylesheet" href="css/retina-styles.css" type="text/css" />');
        });

        /**
         * Create an expression editor editable text field out of a DOM element
         * @param $element
         */
        function expressionEditor($element) {

            var expressionTermTextBeforeDelete = '';
            var selectedExpressionTermText = '';
            var operatorKeys = {
                '+': 'AND',
                '|': 'OR',
                '!': 'NOT',
                '-': 'SUB',
                '^': 'XOR'
            };
            var lastSelectedExpressionTerm;
            var $currentRetinaExpression;
            var characterLimit = 30;

            createExpressionEditor($element);

            /**
             * TODO
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
             * TODO
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
             * TODO
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
                    var $this = $(this),
                        $span = $this.find('span'),
                        $newTerm = $this.find('.new-term'),
                        notInTheLastPosition = $span.index($newTerm) != $span.length - 1 ? true : false, // see if we are adding to the end of the expression or are somewhere in the middle
                        newTermText = $.trim($newTerm.text());
                    if (newTermText == '' && !notInTheLastPosition) {
                        $newTerm.removeClass('has-text');
                    }
                    if (newTermText == '' && $this.find('.expression-term').length == 0) {
                        $newTerm.removeClass('adding');
                    }
                    if (notInTheLastPosition && !($this.parent().equals($currentRetinaExpression))) {
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
                        // make sure at least one item is selected.
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
                $.each(operatorKeys, function (key, value) {
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
             * TODO
             * @type {_mouseStart}
             */
            // hook into sortable prototype so that we can remove <span>s before sorting starts, see the CustomBeforeStart option
            var oldMouseStart = $.ui.sortable.prototype._mouseStart;
            $.ui.sortable.prototype._mouseStart = function (event, overrideHandle, noActivation) {
                this._trigger("CustomBeforeStart", event, this._uiHash());
                oldMouseStart.apply(this, [event, overrideHandle, noActivation]);
            };

            $('body').on('keydown', function (e) { // key was pressed outside of field

                if (e.which == 8 || e.which == 46) { // DEL or BKSP
                    if ($currentRetinaExpression.find('.selected').length) { // there are selected expression-terms
                        e.preventDefault();
                        var eventToTrigger = $.Event('keydown');
                        eventToTrigger.which = 8; // BKSP
                        $currentRetinaExpression.find('.new-term').focus().trigger(eventToTrigger);
                    }
                }
                if ((e.which == 9 || e.which == 13) && $currentRetinaExpression.find('.selected').length) { // TAB or ENTER
                    e.preventDefault();
                    // TODO if (e.which == 13) fetchExpressionResults(); // if ENTER
                    // TODO if (e.which == 9) clearExpressionResults(); // if TAB
                    placeCursorAtEnd();
                }
                if (e.which == 37 || e.which == 39) { // LEFT ARROW or RIGHT ARROW
                    //e.preventDefault();
                    var $expressionTerm = $currentRetinaExpression.find('.expression-field').find('.expression-term'),
                        $selected = $expressionTerm.parent().find('.selected');
                    if ($selected.length) { // if we have some selected we can use arrow keys to move the selection
                        if (!(e.shiftKey)) {
                            $expressionTerm.removeClass('selected');
                        }
                        if (e.which == 37) {
                            if (lastSelectedExpressionTerm.equals($($selected[$selected.length - 1])) && $selected.length > 1) {
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
                            if (lastSelectedExpressionTerm.equals($($selected[0])) && $selected.length > 1) {
                                // they must have reversed direction so we're going to start unselecting
                                $($selected[0]).removeClass('selected');
                                lastSelectedExpressionTerm = $($selected[1]);
                            } else {
                                if ($expressionTerm.index($selected[$selected.length - 1]) != $expressionTerm.length - 1) {
                                    //prevents going past the right edge
                                    lastSelectedExpressionTerm = $($selected[$selected.length - 1]).nextAll('.expression-term:first').addClass('selected');
                                } else {
                                    //lastSelectedExpressionTerm = $($selected[$selected.length-1]).addClass('selected');
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
                var notInTheLastPosition = $span.index($(this)) != $span.length - 1 ? true : false; // see if we are adding to the end of the expression or are somewhere in the middle

                var newTermText = $.trim($(this).text());
                $this = $(this);

                if (e.which == 9 || e.which == 13) { // TAB or ENTER
                    e.preventDefault();
                    e.stopPropagation();
                    if (newTermText == '') { // if blank new-term
                        // TODO if (e.which == 13) fetchExpressionResults(); // if ENTER
                        if (notInTheLastPosition) { // if ENTER/TAB and in the middle
                            // TODO if (e.which == 9) clearExpressionResults(); // if TAB
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
                        return; // in case the field is blank, do nothing else
                    }
                    checkForOperator($this);
                    $this.addClass('expression-term').removeClass('new-term has-text adding').removeAttr('contenteditable');
                    addTermIfNeeded();
                    placeCursorAtEnd();
                    // TODO if (e.which == 9) clearExpressionResults(); // if TAB
                    // TODO if (e.which == 13) fetchExpressionResults(); // ENTER, runs after a new-term has been added
                }
                if (e.which == 8 || e.which == 46) { // DEL or BKSP
                    if (newTermText == '') {
                        e.preventDefault();
                        // if(notInTheLastPosition) return; // if we're somewhere in the middle, don't delete any terms

                        var $selected = $currentRetinaExpression.find('.expression-field').find('.selected');
                        if ($selected.length) { // if we've selected any, delete those first before deleting the previous
                            $selected.remove();
                        } else if (e.which == 8) { // BKSP
                            $this.prev().remove(); // if we just pressed BKSP with a blank new-term, remove the previous expression-term
                        }
                        placeCursorAtEnd();
                        // TODO clearExpressionResults();
                    }
                }
                if (e.which == 37 || e.which == 39) { // LEFT ARROW or RIGHT ARROW
                    if (newTermText == '') {
                        var newTermIndex = $span.index($this);
                        if (e.which == 37) {
                            if (newTermIndex != 0) { // prevent going left if at the first item
                                if (e.shiftKey) {
                                    e.stopPropagation();
                                    $($span.get(newTermIndex - 1)).trigger('click');
                                } else {
                                    $($span.get(newTermIndex - 2)).trigger('click');
                                }
                            }
                        } else {
                            if (notInTheLastPosition) $($span.get(newTermIndex + 2)).trigger('click');
                        }
                    }
                }
                if (e.which == 38 || e.which == 40) { // UP ARROW or DOWN ARROW
                    e.preventDefault(); // don't allow it
                }
                if (e.which == 32) { // SPACE -- prevents placeholder text bug
                    if (newTermText == '') e.preventDefault();
                }
            }).on('keyup', '.new-term', function (e) {
                var $this = $(this),
                    newTermText = $.trim($this.text());
                ensureNewTermPlaceholderTextCorrect();
                // TODO clearExpressionResults();
                $.each(operatorKeys, function (key, value) { // keyboard shortcut checker
                    if (newTermText === key) {
                        var eventToTrigger = $.Event('keydown');
                        eventToTrigger.which = 9; // TAB
                        $this.text(value); // Change text to the operator word
                        $this.trigger(eventToTrigger);
                        return false;
                    }
                });
                if (newTermText.length > characterLimit) {
                    $this.text(newTermText.substr(0, characterLimit));
                    placeCursorAtEnd();
                }
            }).on('keydown', '.expression-term', function (e) {
                if (e.which == 9 || e.which == 13) { // TAB or ENTER
                    e.preventDefault();
                    var $this = $(this);
                    checkForOperator($this);
                    placeCursorAtEnd();
                    selectedExpressionTermText = '';
                }
                if (e.which == 8 || e.which == 46) { // DEL or BKSP
                    expressionTermTextBeforeDelete = $.trim($(this).text());
                    if (expressionTermTextBeforeDelete == '') e.preventDefault(); // prevent browser from deleting <span> elements
                }
            }).on('keyup', '.expression-term', function (e) {
                var $this = $(this),
                    expressionTermText = $.trim($this.text());
                if (e.which == 8 || e.which == 46) { // DEL or BKSP

                    if ((expressionTermText == '' && expressionTermTextBeforeDelete == '' ) || (expressionTermTextBeforeDelete == selectedExpressionTermText && expressionTermText == '')) {
                        $this.remove();
                        placeCursorAtEnd();
                        // TODO clearExpressionResults();
                        selectedExpressionTermText = '';
                    }
                    expressionTermTextBeforeDelete = '';
                }
                if (expressionTermText.length > characterLimit) {
                    $this.text(expressionTermText.substr(0, characterLimit));
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
                var notInTheLastPosition = $currentRetinaExpression.find('.expression-field').find('span').index($(this)) != $span.length - 1 ? true : false; // see if we are adding to the end of the expression or are somewhere in the middle
                if (notInTheLastPosition) $(this).addClass('has-text');
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
            }).on('click', '.cortical-io-expression', function (e) {

            }).on('click', function (e) {

                $('.cortical-io-expression').find('.expression-term').removeClass('selected editing').removeAttr('contenteditable').blur(); // if there is a click anywhere
                sortableEnable();
                var $span = $currentRetinaExpression.find('.expression-field').find('span'),
                    $newTerm = $currentRetinaExpression.find('.new-term'),
                    notInTheLastPosition = $span.index($newTerm) != $span.length - 1 ? true : false, // see if we are adding to the end of the expression or are somewhere in the middle
                    newTermText = $.trim($newTerm.text());
                if (newTermText == '' && notInTheLastPosition && !($newTerm.is(":focus"))) {
                    $newTerm.remove();
                    addTermIfNeeded();
                    ensureBtwTermsCorrect();
                }
            }).on('blur', '.cortical-io-expression .new-term', function (e) {
                ensureNewTermPlaceholderTextCorrect();
                if (!($currentRetinaExpression.find('.similar-terms').length) && !($currentRetinaExpression.find('.nav').find('button').is('.active'))) { // we have don't have results AND nav is not active
                    $currentRetinaExpression.find('.expression-results').html('');
                }

            }).on('blur', '.cortical-io-expression .expression-term', function (e) {
                if ($.trim($(this).text()) == '') {
                    $(this).remove();
                }
            });
        }

        /**
         * Attach the expression editor function to the jQuery object prototype
         */
        $.fn.expressionEditor = function () {
            if (this.is("div")) {
                expressionEditor(this);
            } else {
                // TODO handle other elements
            }
        };

        // TODO replace with .is
        // for testing if two different jQuery objects contain the same set of elements
        $.fn.equals = function (compareTo) {
            if (!compareTo || this.length != compareTo.length) {
                return false;
            }
            for (var i = 0; i < this.length; ++i) {
                if (this[i] !== compareTo[i]) {
                    return false;
                }
            }
            return true;
        };

    }());

}(jQuery));