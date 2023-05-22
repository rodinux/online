/* -*- js-indent-level: 8 -*- */
/*
 * JSDialog.FormulabarEdit - text field in the fromulabar, key events are sent using L.TextInput
 *
 * Example JSON:
 * {
 *     id: 'id',
 *     type: 'formulabaredit',
 *     test: 'text content\nsecond line',
 *     cursor: true,
 *     enabled: false
 * }
 *
 * 'cursor' specifies if user can type into the field or it is readonly
 * 'enabled' editable field can be temporarily disabled
 *
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

/* global JSDialog UNOKey UNOModifier */

function _sendSelection(edit, builder) {
	// for IME/TextInput.js we need to setup cursor at the end
	var currentText = edit.value;
	var startPos = edit.selectionStart;
	var endPos = edit.selectionEnd;
	var startPara = 0;
	var endPara = 0;

	edit._startPos = startPos;
	edit._endPos = endPos;
	edit._originalLen = currentText.length;

	if (currentText.indexOf('\n') >= 0) {
		var currentPos = 0;
		var found = currentText.indexOf('\n', currentPos);
		while (startPos > found) {
			if (found === -1)
				break;
			currentPos = found + 1;
			startPara++;
			found = currentText.indexOf('\n', currentPos);
		}

		startPos -= currentPos;

		currentPos = 0;
		found = currentText.indexOf('\n', currentPos);
		while (endPos > found) {
			if (found === -1)
				break;
			currentPos = found + 1;
			endPara++;
			found = currentText.indexOf('\n', currentPos);
		}

		endPos -= currentPos;
	}

	var selection = startPos + ';' + endPos + ';' + startPara + ';' + endPara;
	builder.callback('edit', 'textselection', edit, selection, builder);
}

function _formulabarEditControl(parentContainer, data, builder) {
	var controlType = 'textarea';
	if (data.cursor && (data.cursor === 'false' || data.cursor === false))
		controlType = 'p';

	var edit = L.DomUtil.create(controlType, 'ui-textarea ' + builder.options.cssClass, parentContainer);

	if (controlType === 'textarea')
		edit.value = builder._cleanText(data.text);
	else
	{
		data.text = data.text.replace(/(?:\r\n|\r|\n)/g, '<br>');
		edit.textContent = builder._cleanText(data.text);
	}

	edit.id = data.id;

	if (data.enabled === 'false' || data.enabled === false)
		edit.disabled = true;

	// uses TextInput.js logic and events handling (IME for mobile/touch devices)
	edit.addEventListener('input', builder.map._textInput._onInput.bind(builder.map._textInput));
	edit.addEventListener('beforeinput', builder.map._textInput._onBeforeInput.bind(builder.map._textInput));

	// sends key events over jsdialog
	var modifier = 0;

	edit.addEventListener('keydown', function(event) {
		if (edit.disabled) {
			event.preventDefault();
			return;
		}

		if (event.key === 'Enter') {
			builder.callback('edit', 'keypress', edit, UNOKey.RETURN | modifier, builder);
		} else if (event.key === 'Escape' || event.key === 'Esc') {
			builder.callback('edit', 'keypress', edit, UNOKey.ESCAPE | modifier, builder);
		} else if (event.key === 'Shift') {
			modifier = modifier | UNOModifier.SHIFT;
		} else if (event.key === 'Control') {
			modifier = modifier | UNOModifier.CTRL;
		} else if (event.key === 'Left' || event.key === 'ArrowLeft') {
			setTimeout(function () { _sendSelection(edit, builder); }, 0);
		} else if (event.key === 'Right' || event.key === 'ArrowRight') {
			setTimeout(function () { _sendSelection(edit, builder); }, 0);
		} else if (event.key === 'Up' || event.key === 'ArrowUp') {
			setTimeout(function () { _sendSelection(edit, builder); }, 0);
		} else if (event.key === 'Down' || event.key === 'ArrowDown') {
			setTimeout(function () { _sendSelection(edit, builder); }, 0);
		} else if (event.key === 'Home') {
			setTimeout(function () { _sendSelection(edit, builder); }, 0);
		} else if (event.key === 'End') {
			setTimeout(function () { _sendSelection(edit, builder); }, 0);
		}
	});

	edit.addEventListener('keyup', function(event) {
		if (edit.disabled) {
			event.preventDefault();
			return;
		}

		if (event.key === 'Shift') {
			modifier = modifier & (~UNOModifier.SHIFT);
		} else if (event.key === 'Control') {
			modifier = modifier & (~UNOModifier.CTRL);
		}
	});

	edit.addEventListener('blur', function() {
		modifier = 0;
	});

	edit.addEventListener('mouseup', function(event) {
		if (edit.disabled) {
			event.preventDefault();
			return;
		}

		builder.callback('edit', 'grab_focus', edit, null, builder);

		_sendSelection(event.target, builder);
		event.preventDefault();
	});

	edit._sendSelection = function () {
		_sendSelection(edit, builder);
	};

	if (data.hidden)
		L.DomUtil.addClass(edit, 'hidden');

	return false;
}

JSDialog.formulabarEdit = function (parentContainer, data, builder) {
	var buildInnerData = _formulabarEditControl(parentContainer, data, builder);
	return buildInnerData;
};
