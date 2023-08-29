<?php include($_SERVER["DOCUMENT_ROOT"] . "/assets/php/common.php"); ?>

<!doctype html>
<html lang="<?php echo $langName ?>">

<head>
	<?php includeHead($lang('graphing.title'), new HeadOptions()); ?>

	<link rel="stylesheet" href="mathquill/mathquill.css" />
	<script src="mathquill/mathquill.min.js" defer></script>
	<link rel="stylesheet" href="css/calculator.css">
	<link rel="stylesheet" href="css/keyboard.css">
</head>

<body>
	<a href="../" type="button" class="btn btn-outline-light" id="backbtn">‹
		<?php lang('back') ?>
	</a>

	<div id="content">
		<div id="graph-container">
			<canvas id="graph"></canvas>
			<div id="graph-toolbar">
				<button class="graph-btn" id="graph-zoom-home" data-bs-tooltip="tooltip" data-bs-placement="left" data-bs-title="<?php lang('graphing.tooltip.defaultZoom') ?>">
					<?php insertSVG('home'); ?>
				</button>
				<button class="graph-btn" id="graph-zoom-in" data-bs-tooltip="tooltip" data-bs-placement="left" data-bs-title="<?php lang('graphing.tooltip.zoomIn') ?>">
					<?php insertSVG('zoom-in'); ?>
				</button>
				<button class="graph-btn" id="graph-zoom-out" data-bs-tooltip="tooltip" data-bs-placement="left" data-bs-title="<?php lang('graphing.tooltip.zoomOut') ?>">
					<?php insertSVG('zoom-out'); ?>
				</button>
			</div>
			<button id="show-btn" data-bs-toggle="offcanvas" data-bs-target="#side-panel" data-bs-tooltip="tooltip" data-bs-placement="left" data-bs-title="<?php lang('graphing.tooltip.openPanel') ?>"><b>&lt;&lt;</b></button>
		</div>
		<div id="side-panel" class="offcanvas offcanvas-var show" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" style="width: 400px">
			<div id="resizer"></div>
			<div id="wave-panel" class="sidebar">
				<div id="panel-control-buttons">
					<a type="button" class="btn btn-success" id="hide-btn" data-bs-toggle="offcanvas" data-bs-target="#side-panel" data-bs-tooltip="tooltip" data-bs-placement="bottom" data-bs-title="<?php lang('graphing.tooltip.closePanel') ?>"><b>&gt;&gt;</b></a>
					<a type="button" class="btn btn-secondary me-auto" data-bs-toggle="dropdown" aria-expanded="false">
						<?php insertSVG('plus'); ?>
					</a>
					<ul class="dropdown-menu">
						<li><a class="dropdown-item" type="button" id="add"><?php lang('graphing.expression') ?></a></li>
						<li><a class="dropdown-item" type="button" id="add-audio"><?php lang('graphing.audio') ?></a></li>
						<li><a class="dropdown-item" type="button" id="add-variable"><?php lang('graphing.variable') ?></a></li>
						<li><a class="dropdown-item" type="button" id="add-function"><?php lang('graphing.function') ?></a></li>
						<li><a class="dropdown-item" type="button" id="add-data"><?php lang('graphing.file') ?></a></li>
					</ul>
					<a type="button" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#savesModal" id="savebtn" data-bs-tooltip="tooltip" data-bs-placement="bottom" data-bs-title="<?php lang('graphing.tooltip.save') ?>">
						<?php insertSVG('download'); ?>
					</a>
					<a type="button" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#optionsModal" id="optionsbtn" data-bs-tooltip="tooltip" data-bs-placement="bottom" data-bs-title="<?php lang('graphing.tooltip.settings') ?>">
						<?php insertSVG('settings'); ?>
					</a>
					<div id="info" class="input-group">
						<?php insertLangSwitch('langbtn'); ?>
						<a type="button" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#aboutModal" id="aboutbtn" data-bs-tooltip="tooltip" data-bs-placement="bottom" data-bs-title="<?php lang('graphing.tooltip.about') ?>">
							<?php insertSVG('about'); ?>
						</a>
					</div>
				</div>
				<div id="wave-boxes"></div>
				<!-- <div id="tips">
                    How to use:

                </div> -->
			</div>
			<div id="audio-panel" class="sidebar">
				<div class="d-flex">
					<input type="button" class="btn btn-success" value="‹ <?php lang('back') ?>" id="audio-back">
					<a type="button" class="btn btn-success ms-auto" id="btn-play" style="display: block">
						<?php insertSVG('play'); ?>
					</a>
				</div>
				<div class="input-group mt-2">
					<span class="input-group-text input-label-box"><?php lang('graphing.waveType') ?>:</span>
					<select class="form-select form-control" id="wave-select">
						<option value="sine"><?php lang('graphing.sine') ?></option>
						<option value="square"><?php lang('graphing.square') ?></option>
						<option value="triangle"><?php lang('graphing.triangle') ?></option>
						<!-- <option value="custom"><?php lang('graphing.custom') ?></option> -->
					</select>
				</div>
				<!-- <div class="sub-container rounded" id="sub-time">
                    <h6><?php lang('graphing.playback') ?>:</h6>
                    <div class="input-group mt-1">
                        <span class="input-group-text input-label-box"><?php lang('graphing.start') ?>:</span>
                        <input type="number" id="start-input" class="form-control" value="0" step="1">
                        <span class="input-group-text input-label-box">s</span>
                    </div>
                    <div class="input-group mt-1">
                        <span class="input-group-text input-label-box"><?php lang('graphing.end') ?>:</span>
                        <input type="number" id="end-input" class="form-control" value="1" step="1">
                        <span class="input-group-text input-label-box">s</span>
                    </div>
                    <div class="form-check mt-1">
                        <input class="form-check-input" type="checkbox" id="playback-current-view" disabled>
                        <label class="form-check-label" for="playback-current-view"><?php lang('graphing.currentView') ?></label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="playback-loop">
                        <label class="form-check-label" for="playback-loop"><?php lang('graphing.loop') ?></label>
                    </div>
                </div> -->
				<div class="sub-container rounded" id="sub-frequency">
					<div class="input-group mt-1">
						<span class="input-group-text input-label-box"><?php lang('graphing.frequency') ?>:</span>
						<input type="number" id="frequency-input" class="form-control" value="440" min='1' max="22000" step='1'>
						<span class="input-group-text input-label-box">Hz</span>
					</div>
					<input type="range" min="1" max="22000" step="1" value="440" class="form-range input-slider" id="frequency-slider">
				</div>
				<div class="sub-container rounded" id="sub-duty">
					<div class="input-group mt-1">
						<span class="input-group-text input-label-box"><?php lang('graphing.duty') ?>:</span>
						<input type="number" id="duty-input" class="form-control" value="50" min='0' max="100" step='1'>
						<span class="input-group-text input-label-box">%</span>
					</div>
					<input type="range" min="0" max="100" step="1" value="50" class="form-range input-slider" id="duty-slider">
				</div>
				<div class="sub-container rounded" id="sub-skew">
					<div class="input-group mt-1">
						<span class="input-group-text input-label-box"><?php lang('graphing.skew') ?>:</span>
						<input type="number" id="skew-input" class="form-control" value="50" min='0' max="100" step='1'>
						<span class="input-group-text input-label-box">%</span>
					</div>
					<input type="range" min="0" max="100" step="1" value="50" class="form-range input-slider" id="skew-slider">
				</div>
				<div class="sub-container rounded" id="sub-amplitude">
					<div class="input-group mt-1">
						<span class="input-group-text input-label-box"><?php lang('graphing.amplitude') ?>:</span>
						<input type="number" id="amplitude-input" class="form-control" value="50" min='0' max="100" step='1'>
						<span class="input-group-text input-label-box">%</span>
					</div>
					<input type="range" min="0" max="100" step="1" value="50" class="form-range input-slider" id="amplitude-slider">
				</div>
				<div class="sub-container rounded" id="sub-phase">
					<div class="input-group mt-1">
						<span class="input-group-text input-label-box"><?php lang('graphing.phase') ?>:</span>
						<input type="number" id="phase-input" class="form-control" value="0" min='0' max="360" step='1'>
						<span class="input-group-text input-label-box">°</span>
					</div>
					<input type="range" min="0" max="360" step="1" value="0" class="form-range input-slider" id="phase-slider">
				</div>


				<!-- <div class="sub-container rounded" id="sub-bias">
                            <div class="input-group mt-1">
                                <span class="input-group-text input-label-box"><?php //lang('graphing.loop') 
																				?>:</span>
                                <input type="number" id="frequency-input" class="form-control" value="440" min='1' max="22000" step='1'>
                                <span class="input-group-text input-label-box">Hz</span>
                            </div>
                            <input type="range" min="1" max="22000" step="1" value="440" class="form-range input-slider" id="frequency-slider">
                        </div> -->
			</div>
			<span id="keyboard-open" class="kb-control-button" tabindex="0" style="display: none">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 576 512" fill="currentColor">
					<path d="M64 112c-8.8 0-16 7.2-16 16V384c0 8.8 7.2 16 16 16H512c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H64zM0 128C0 92.7 28.7 64 64 64H512c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM176 320H400c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16zm-72-72c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H120c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H120c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16zm64 96c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H200c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H200c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16zm64 96c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H280c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H280c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16zm64 96c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H360c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H360c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16zm64 96c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H440c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H440c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16z" />
				</svg>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 320 512" fill="currentColor">
					<path d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z" />
				</svg>
			</span>
		</div>
	</div>

	<div id="keyboard"></div>



	<?php bootstrapModal('optionsModal', $lang('graphing.options.title'), <<<HTML
        <div class="form-check form-switch">
		    <input class="form-check-input" type="checkbox" role="switch" id="options-grid"  autocomplete="off" checked>
            <label class="form-check-label" for="options-grid">{$lang('graphing.options.grid')}</label>
        </div>
        <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="options-minor-grid"  autocomplete="off" checked>
            <label class="form-check-label" for="options-minor-grid">{$lang('graphing.options.gridMinor')}</label>
        </div>
        <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="options-axis-numbers"  autocomplete="off" checked>
            <label class="form-check-label" for="options-axis-numbers">{$lang('graphing.options.axisNumbers')}</label>
        </div>
        <!-- <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="options-connect"  autocomplete="off" checked>
            <label class="form-check-label" for="options-connect">{$lang('graphing.options.connectLines')}</label>
        </div> -->
		<div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="options-dpi"  autocomplete="off" checked>
            <label class="form-check-label" for="options-dpi">{$lang('graphing.options.dpi')}</label>
        </div>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="options-degrad" id="options-degrees" autocomplete="off">
            <label class="form-check-label" for="options-degrees">{$lang('graphing.options.degrees')}</label>
        </div>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="options-degrad" id="options-radians"  autocomplete="off" checked>
            <label class="form-check-label" for="options-radians">{$lang('graphing.options.radians')}</label>
        </div>

HTML); ?>

	<?php bootstrapModal('aboutModal', $lang('aboutmodal.title'), <<<HTML
		<h5 style="font-weight:bold;">{$lang('graphing.title')}, <span style="font-size:1rem">{$lang('aboutmodal.version')} 1.7</span></h5> 
		<span>{$lang('aboutmodal.created')}: {$lang('month.june')} 2022</span><br />
		<span>{$lang('aboutmodal.updated')}: {$lang('month.august')} 2023</span>
		<p>© 2023 by barty12</p>
HTML); ?>

	<div class="modal fade" id="savesModal" tabindex="-1" aria-labelledby="savesModalLabel" aria-hidden="true">
		<div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="savesModalLabel">Save</h1>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
				</div>
			</div>
		</div>
	</div>

	<script>
		const lng = {
			'file': "<?php lang('graphing.file') ?>",
			'audio': "<?php lang('graphing.audio') ?>",
			'line': "<?php lang('graphing.line') ?>",
			'step': "<?php lang('graphing.step') ?>",
			'min': "<?php lang('graphing.min') ?>",
			'max': "<?php lang('graphing.max') ?>",
			'playback': "<?php lang('graphing.playback') ?>",
			'start': "<?php lang('graphing.start') ?>",
			'end': "<?php lang('graphing.end') ?>",
			'current_view': "<?php lang('graphing.currentView') ?>",
			'loop': "<?php lang('graphing.loop') ?>",
			'clipping': "<?php lang('graphing.clipping') ?>",
		}
		window.lang = (key) => {
			return lng[key] ?? key;
		}
	</script>

	<!-- <script src="https://unpkg.com/@free-side/audioworklet-polyfill/dist/audioworklet-polyfill.js"></script> -->
	<script src="js/audioworklet-polyfill.min.js"></script>
	<script src="js/module-workers-polyfill.min.js"></script>
	<script src="js/calculator.js" type="module"></script>
	<!-- <script src="graph.js" type="module"></script> -->

	<?php includeAd(); ?>
</body>

</html>