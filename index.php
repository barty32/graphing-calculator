<?php include($_SERVER["DOCUMENT_ROOT"] . "/assets/php/common.php"); ?>

<!doctype html>
<html lang="<?php echo $langName ?>">

<head>
	<?php includeHead($lang('graphing.title'), new HeadOptions()); ?>

	<link rel="stylesheet" href="mathquill/mathquill.css" />
	<script src="mathquill/mathquill.min.js" defer></script>
	<style>
		body {
			background-image: none;
			background-color: #333;
			height: 100%;
			width: 100%;
			overflow: hidden;
			position: fixed;
			touch-action: none;
		}

		.sub-container {
			color: var(--bs-gray-100);
			margin: 10px 0 0;
			padding: 10px;
			border: 2px solid var(--bs-primary);
			display: flex;
			background-color: #222;
			flex-direction: column;
		}

		.wave-box:first-child {
			margin-top: 0;
		}

		.wave-box {
			display: flex;
			flex-direction: column;
		}

		.sidebar {
			position: absolute;
			width: 100%;
			transition: transform 0.3s;
			padding: 10px;
			display: flex;
			flex-direction: column;
		}

		.offcanvas.show {
			position: relative;
		}

		.offcanvas:not(.show),
		.offcanvas.hiding {
			position: absolute;
		}

		.small-input {
			width: 100%;
			min-width: 30px;
			max-width: 60px;
			background-color: transparent;
			color: white;
			white-space: nowrap;
			border: none;
			border-bottom: 3px solid var(--bs-primary);
		}

		.slider-config {
			display: flex;
			justify-content: space-evenly;
			align-items: center;
		}

		.slider-sub {
			display: flex;
			align-items: center;
		}

		.error-img {
			display: none;
			z-index: 10;
			margin: auto -5px;
			user-select: none;
			cursor: default;
		}

		.input-group .e-tooltip {
			visibility: hidden;
			width: 100%;
			background-color: red;
			color: white;
			text-align: left;
			padding: 5px 10px;
			position: absolute;
			z-index: 10;
			top: 120%;
			right: 0;
			font-family: Verdana, system-ui, Arial, sans-serif;
			font-size: 1rem;
			line-height: 1.5;
		}

		.input-group .e-tooltip::after {
			content: "";
			position: absolute;
			bottom: 100%;
			right: 10px;
			margin-left: -6px;
			border-width: 5px;
			border-style: solid;
			border-color: transparent transparent red transparent;
		}

		.input-group .error-img:hover+.e-tooltip {
			visibility: visible;
		}

		.error-text {
			color: red;
		}

		.warn-img {
			position: absolute;
			display: none;
			z-index: 10;
			top: 7px;
			right: 5px;
			user-select: none;
		}

		.input-group .w-tooltip {
			visibility: hidden;
			width: 100%;
			background-color: yellow;
			color: black;
			text-align: left;
			padding: 5px 10px;
			position: absolute;
			z-index: 10;
			top: 120%;
		}

		.playback-options {
			display: flex;
			align-items: flex-end;
		}

		.input-group .warn-img:hover+.w-tooltip {
			visibility: visible;
		}

		.warn-text {
			color: orange;
		}

		.clipping {
			width: 100%;
			background-color: gold;
			text-align: left;
			padding: 5px;
			display: flex;
			color: black;
			margin-top: 10px;
		}

		#content {
			display: flex;
			grid-template-columns: 0 350px;
			height: 100%;
			width: 100%;
		}

		#graph-container {
			position: relative;
			display: flex;
			height: 100%;
			width: 100%;
		}

		#graph {
			border: 3px solid var(--bs-primary);
			width: 100%;
			height: 100%;
		}

		#side-panel {
			height: 100%;
			background-color: #333;
			overflow-y: auto;
			overflow-x: hidden;
			flex-shrink: 0;
		}

		#wave-panel{
			padding: 0 10px 10px;
		}

		#show-btn {
			position: fixed;
			right: 0;
			top: 20px;
			color: white;
			background-color: rgba(128, 128, 128, 0.4);
			border: 3px solid gray;
			border-radius: 5px;
			transition: filter 0.1s;
		}

		#show-btn:hover {
			filter: brightness(70%);
		}

		#panel-control-buttons{
			position: sticky;
			top: 0px;
			background: #333;
			z-index: 10;
			padding: 10px 0;
		}

		#panel-control-buttons>a {
			width: 50px;
		}

		#audio-panel {
			transform: translateX(110%);
			display: none;
		}

		#graph-toolbar {
			display: flex;
			position: absolute;
			flex-direction: column;
			width: 40px;
			bottom: 0;
			right: 0;
			margin: 10px;
		}

		.graph-btn {
			background-color: white;
			width: 37px;
			height: 35px;
			padding: 0;
			border: 1px solid dimgray;
			border-radius: 5px;
			margin-top: 3px;
			transition: filter 0.1s;
		}

		.graph-btn:hover {
			filter: brightness(70%);
		}

		#keyboard {
			bottom: 0;
			left: 0;
			width: 100%;
			/* height: 250px; */
			max-height: 100%;
			z-index: 1200;
			background-color: #111;
			user-select: none;
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		#keyboard:not(.hidden) {
			position: fixed;
		}

		.keyboard-switcher {
			align-self: flex-start;
			display: flex;
		}

		.keyboard-switcher>span {
			padding: 5px 10px;
			margin: 3px 1px;
			color: white;
			cursor: pointer;
		}

		.keyboard-switcher>span:not(.active):hover {
			color: var(--bs-primary);
			background: #333;
			border-radius: 5px;
		}

		.keyboard-switcher>span.active {
			color: var(--bs-primary);
			border-bottom: 2px solid var(--bs-primary)
		}

		.keyboard-button {
			background: #222;
			color: white;
			font-size: 25px;
			border-radius: 10px;
			cursor: pointer;
			/* touch-action: none; */
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.symbol {
			font-family: Symbola, 'Times New Roman', serif;
		}

		.char {
			font-family: 'Times New Roman', Symbola, serif;
		}

		.italic {
			font-style: italic;
		}

		.keyboard-button svg {
			width: 40px;
			height: 40px;
		}

		.keyboard-button:hover {
			background-color: #333;
		}

		.keyboard-button:active {
			background-color: #111;
		}

		.keyboard-container {
			/* background: #00ff00bb; */
			width: 100%;
			height: 100%;
			max-width: 800px;
			padding: 5px;
		}

		.keyboard-container>div {
			display: grid;
			gap: 5px;
			/* height: 200px; */
			width: 100%;
			height: 100%;
		}

		#keyboard-numbers {
			grid-template-columns: 4fr 4fr 1fr repeat(4, 4fr) 1fr repeat(3, 4fr);
			grid-template-rows: repeat(4, 1fr);
		}

		#keyboard-functions {
			grid-template-columns: 2fr 2fr 1fr repeat(3, 4fr 4fr 1fr);
			grid-template-rows: repeat(4, 1fr);
			overflow-x: auto;
		}

		#keyboard-letters {
			grid-template-columns: repeat(20, 1fr);
			grid-template-rows: repeat(5, 1fr);
		}

		.kb-control-button {
			position: absolute;
			padding: 2px 5px;
			margin: 5px;
			color: white;
			background: #222;
			cursor: pointer;
			border-radius: 5px;
			display: flex;
			align-items: center;
		}

		#keyboard-open {
			position: fixed;
			right: 0;
			bottom: 0;
			z-index: 4;
			border: 1px solid #333;
		}

		#keyboard-close {
			right: 0;
			top: 0;
		}

		#keyboard.hidden #keyboard-close {
			display: none;
		}

		.kb-control-button svg {
			margin: 2px;
		}

		.kb-control-button:hover {
			background: #444;
		}

		#backbtn {
			position: fixed;
			margin: 20px;
			z-index: 100;
			display: none;
		}

		.dropdown-menu {
			background-color: #3F3B3B;
			max-width: 100%;
		}

		.dropdown-item {
			color: white;
		}

		.dropdown-item:hover {
			background-color: #111;
			color: white;
		}

		.color-picker {
			display: grid;
			grid-template-columns: repeat(8, 1fr);
			gap: 0.1rem;
			padding: 0 .5rem;
		}

		.color-picker-button {
			width: 2rem;
			height: 2rem;
			padding: 0;
			border: 2px solid #222;
			cursor: pointer;
			transition: filter 0.15s ease-in-out;
		}

		.color-picker-button:hover {
			filter: brightness(60%);
		}

		.hidden {
			display: none;
		}

		@media (min-width: 768px) {
			#backbtn {
				display: block;
			}
		}

		@media (max-width: 400px) {
			#side-panel.show {
				margin-left: -6px;
			}
		}
	</style>
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
		<div id="side-panel" class="offcanvas offcanvas-end" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1">
			<div id="wave-panel" class="sidebar">
				<div id="panel-control-buttons" class="d-flex flex-wrap">
					<div class="d-flex">
						<a type="button" class="btn btn-success me-2" id="hide-btn" data-bs-toggle="offcanvas" data-bs-target="#side-panel" data-bs-tooltip="tooltip" data-bs-placement="bottom" data-bs-title="<?php lang('graphing.tooltip.closePanel') ?>"><b>&gt;&gt;</b></a>
						<a type="button" class="btn btn-secondary" data-bs-toggle="dropdown" aria-expanded="false">
							<?php insertSVG('plus'); ?>
						</a>
						<ul class="dropdown-menu">
							<li><a class="dropdown-item" type="button" id="add">Expression</a></li>
							<li><a class="dropdown-item" type="button" id="add-audio">Audio</a></li>
							<li><a class="dropdown-item" type="button" id="add-variable">Variable</a></li>
							<li><a class="dropdown-item" type="button" id="add-function">Function</a></li>
							<li><a class="dropdown-item" type="button" id="add-data">File</a></li>
						</ul>
					</div>
					<div class="d-flex ms-auto">
						<a type="button" class="btn btn-secondary me-2" data-bs-toggle="modal" data-bs-target="#optionsModal" id="optionsbtn" data-bs-tooltip="tooltip" data-bs-placement="bottom" data-bs-title="<?php lang('graphing.tooltip.settings') ?>">
							<?php insertSVG('settings'); ?>
						</a>
						<div id="info" class="input-group">
							<?php insertLangSwitch('langbtn'); ?>
							<a type="button" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#aboutModal" id="aboutbtn" data-bs-tooltip="tooltip" data-bs-placement="bottom" data-bs-title="<?php lang('graphing.tooltip.about') ?>">
								<?php insertSVG('about'); ?>
							</a>
						</div>
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
			<span id="keyboard-open" class="kb-control-button" tabindex="0">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 576 512" fill="currentColor">
					<path d="M64 112c-8.8 0-16 7.2-16 16V384c0 8.8 7.2 16 16 16H512c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H64zM0 128C0 92.7 28.7 64 64 64H512c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM176 320H400c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16zm-72-72c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H120c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H120c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16zm64 96c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H200c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H200c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16zm64 96c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H280c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H280c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16zm64 96c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H360c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H360c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16zm64 96c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H440c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H440c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16z" />
				</svg>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 320 512" fill="currentColor">
					<path d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z" />
				</svg>
			</span>
		</div>
	</div>

	<div id="keyboard" class="hidden"></div>



	<?php bootstrapModal('optionsModal', $lang('graphing.options.title'), <<<HTML
        <div class="form-check form-switch">
		    <input class="form-check-input" type="checkbox" role="switch" id="options-grid" checked>
            <label class="form-check-label" for="options-grid">{$lang('graphing.options.grid')}</label>
        </div>
        <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="options-minor-grid" checked>
            <label class="form-check-label" for="options-minor-grid">{$lang('graphing.options.gridMinor')}</label>
        </div>
        <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="options-axis-numbers" checked>
            <label class="form-check-label" for="options-axis-numbers">{$lang('graphing.options.axisNumbers')}</label>
        </div>
        <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="options-connect" checked>
            <label class="form-check-label" for="options-connect">{$lang('graphing.options.connectLines')}</label>
        </div>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="options-degrad" id="options-degrees">
            <label class="form-check-label" for="options-degrees">{$lang('graphing.options.degrees')}</label>
        </div>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="options-degrad" id="options-radians" checked>
            <label class="form-check-label" for="options-radians">{$lang('graphing.options.radians')}</label>
        </div>

HTML); ?>

	<?php bootstrapModal('aboutModal', $lang('aboutmodal.title'), <<<HTML
		<h5 style="font-weight:bold;">{$lang('graphing.title')}, <span style="font-size:1rem">{$lang('aboutmodal.version')} 1.6.1</span></h5> 
		<span>{$lang('aboutmodal.created')}: {$lang('month.june')} 2022</span><br />
		<span>{$lang('aboutmodal.updated')}: {$lang('month.november')} 2022</span>
		<p>© 2022 by barty12</p>
HTML); ?>

	<!-- <script src="https://unpkg.com/@free-side/audioworklet-polyfill/dist/audioworklet-polyfill.js"></script> -->
	<script src="js/audioworklet-polyfill.min.js"></script>
	<script src="js/module-workers-polyfill.min.js"></script>
	<script src="js/calculator.js" type="module"></script>
	<!-- <script src="graph.js" type="module"></script> -->

	<?php includeAd(); ?>
</body>

</html>