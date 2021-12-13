'use strict';

define('admin/plugins/dateintitle', ['settings', 'uploader'], function (settings, uploader) {
	var ACP = {};

	ACP.init = function () {
		setupUploader();
		settings.load('dateintitle', $('.dateintitle-settings'), function () {
			setupColorInputs();
		});
		$('#save').on('click', saveSettings);
	};

	function saveSettings() {
		settings.save('dateintitle', $('.dateintitle-settings'), function () {
			app.alert({
				type: 'success',
				alert_id: 'dateintitle-saved',
				title: 'Settings Saved',
				message: 'Please reload your NodeBB to apply these settings',
				clickfn: function () {
					socket.emit('admin.reload');
				},
			});
		});
	}

	function setupColorInputs() {
		var colorInputs = $('[data-settings="colorpicker"]');
		colorInputs.on('change', updateColors);
		updateColors();
	}

	function updateColors() {
		$('#preview').css({
			color: $('#color').val(),
			'background-color': $('#bgColor').val(),
		});
	}

	function setupUploader() {
		$('#content input[data-action="upload"]').each(function () {
			var uploadBtn = $(this);
			uploadBtn.on('click', function () {
				uploader.show({
					route: config.relative_path + '/api/admin/upload/file',
					params: {
						folder: 'dateintitle',
					},
					accept: 'image/*',
				}, function (image) {
					$('#' + uploadBtn.attr('data-target')).val(image);
				});
			});
		});
	}

	return ACP;
});
