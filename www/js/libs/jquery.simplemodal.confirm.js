/*
 * SimpleModal Confirm Modal Dialog
 * http://simplemodal.com
 *
 * Copyright (c) 2013 Eric Martin - http://ericmmartin.com
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Modified by Kerry Knight 29May2013
 *  Added options parameter and ability to customize header, message and button text
 */

function confirm(options, callback) {
	$('#sm-confirm').modal({
		// closeHTML: "<a title='Close' class='sm-modal-close'>x</a>",
		position: ["30%",],
		overlayId: 'sm-confirm-overlay',
		containerId: 'sm-confirm-container', 
		onShow: function (dialog) {
			var modal = this;

			//customize text from passed in options
			$('.sm-header', dialog.data[0]).append(options.header);
			$('.sm-message', dialog.data[0]).append(options.message);

			//knightka, added checks to see if included a confirm/cancel button and hides if not;
			//other button will center itself as needed
			if (typeof (options.confirmButton) != 'undefined') {
				$('.sm-yes', dialog.data[0]).append(options.confirmButton);
			} else {
				$('.sm-yes').hide();
			}

			if (typeof (options.cancelButton) != 'undefined') {
				$('.sm-no', dialog.data[0]).append(options.cancelButton);
			} else {
				$('.sm-no').hide();
			}
			

			//knightka added dynamic height setting
			var headerHeight = parseInt($('.sm-header').css('height'), 10),
				textHeight = parseInt($('.sm-message').css('height'), 10),
				buttonHeight = parseInt($('.sm-yes').css('height'), 10),
				containerHeight = (headerHeight * 2) + textHeight + buttonHeight + 5; //little extra margin

			$('#sm-confirm-container').css('height', containerHeight);

			// if the user clicks "yes"
			$('.sm-yes', dialog.data[0]).click(function () {
				// call the callback
				if ($.isFunction(callback)) {
					callback.apply();
				}
				// close the dialog
				modal.close(); // or $.modal.close();
			});
		}
	});
}