<!doctype html>
<?php include($_SERVER["DOCUMENT_ROOT"] . "/assets/php/common.php"); ?>
<html lang="en">

<head>
    <?php includeHead() ?>
    <title><?php echo 'Graphing Calculator' ?> | barty12's webpage</title>
    <style>
        body {
            color: #ffffff;
            background-image: none;
            height: 100%;
            width: 100%;
            overflow: hidden;
            position: absolute;
            touch-action: none;
        }

        .sub-container {
            margin: 10px 0;
            padding: 10px;
            border: 2px solid #4CAF50;
            display: flex;
            background-color: #222;
            flex-direction: column;
        }

        .wave-box {
            display: flex;
            flex-direction: column;
        }

        .sidebar {
            position: absolute;
            width: 100%;
            transition: transform 0.3s;
            /* animation: switch-page 1s; */
            /*timing-function delay iteration-count direction fill-mode;*/
            /* animation-fill-mode: forwards; */
            padding: 10px;
            display: flex;
            flex-direction: column;
        }

        /*.sidebar.hidden {*/
        /* animation: switch-page 1s; */
        /*timing-function delay iteration-count direction fill-mode;*/
        /* animation-direction: reverse; */
        /*}*/

        .error-img {
            position: absolute;
            display: none;
            z-index: 10;
            top: 7px;
            right: 5px;
            user-select: none;
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
        }

        .input-group .e-tooltip::after {
            content: "";
            position: absolute;
            bottom: 100%;
            right: 10px;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: transparent transparent red transparent;
        }

        .input-group .error-img:hover+.e-tooltip {
            visibility: visible;
        }

        #content {
            display: grid;
            grid-template-columns: 0 350px;
            height: 100%;
            /* max-height: 100vh; */
            width: 100%;
        }

        #content[panel-hidden] {
            grid-template-columns: auto 0 !important;
        }

        #graph-container {
            position: relative;
            display: flex;
            height: 100%;
        }

        #graph {
            border: 3px solid #4CAF50;
            width: 100%;
            height: 100%;
        }

        #side-panel {
            position: relative;
            height: 100%;
            background-color: #333;
            overflow-y: auto;
            overflow-x: hidden;
        }

        #show-btn {
            position: absolute;
            display: none;
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

        #content[panel-hidden] #show-btn {
            display: block;
        }

        #content[panel-hidden] #hide-btn {
            transform: translateX(-110%);
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

        .dropdown-item:hover {
            background-color: #111;
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
            /* margin: 0.1rem; */
            border: 2px solid #222;
            cursor: pointer;
            /* mix-blend-mode: difference; */
            /*background-color:white;*/
            transition: filter 0.15s ease-in-out;
        }

        .color-picker-button:hover {
            filter: brightness(60%);
        }

        .hidden{
            display: none;
        }

        @media (min-width: 768px) {

            /* #content {
                grid-template-columns: auto 50%;
            } */

            #backbtn {
                display: block;
            }
        }

        @media (max-width: 768px) {
            #content:not([panel-hidden]) #graph {
                border: none;
            }
        }

        /* @keyframes switch-page-left {
            from {
                transform: translateX(0%);
            }

            to {
                transform: translateX(-110%);
            }
        }

        @keyframes switch-page-right {
            from {
                transform: translateX(110%);
            }

            to {
                transform: translateX(0%);
            }
        } */
    </style>
</head>

<body>



    <a href="../" type="button" class="btn btn-outline-light" id="backbtn">‹
        <?php echo $lang['back'] ?>
    </a>

    <div id="content" style="grid-template-columns: auto 350px" panel-hidden>
        <div id="graph-container">
            <canvas id="graph"></canvas>
            <div id="graph-toolbar">
                <button class="graph-btn" id="graph-zoom-home">
                    <img src="/assets/images/home.svg">
                </button>
                <button class="graph-btn" id="graph-zoom-in">
                    <img src="/assets/images/zoom-in.svg">
                </button>
                <button class="graph-btn" id="graph-zoom-out">
                    <img src="/assets/images/zoom-out.svg">
                </button>
            </div>
            <button id="show-btn">
                << </button>
        </div>
        <div id="side-panel">
            <div id="wave-panel" class="sidebar">
                <div id="panel-control-buttons" class="d-flex">
                    <input type="button" class="btn btn-success" value=">>" id="hide-btn">
                    <a type="button" class="btn btn-secondary ms-auto" data-bs-toggle="modal" data-bs-target="#optionsModal" id="optionsbtn">
                        <img src="/assets/images/settings.svg">
                    </a>
                    <a type="button" class="btn btn-secondary ms-2" data-bs-toggle="modal" data-bs-target="#aboutModal" id="aboutbtn">
                        <img src="/assets/images/about.svg">
                    </a>
                </div>
                <div id="wave-boxes"></div>
                <div id="wave-buttons">
                    <input type="button" class="btn btn-success mtx-2 msx-2" value="Add" id="add">
                    <input type="button" class="btn btn-success mtx-2" value="Add audio" id="add-audio">
                    <input type="button" class="btn btn-success mtx-2" value="Add custom data" id="add-data">
                </div>
                <!-- <div id="tips">
                    How to use:

                </div> -->
            </div>
            <div id="audio-panel" class="sidebar">
                <div class="d-flex">
                    <input type="button" class="btn btn-success" value="‹ <?php echo $lang['back'] ?>" id="audio-back">
                    <a type="button" class="btn btn-success ms-auto" id="btn-play" style="display: block"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></a>
                </div>
                <div class="input-group mt-2">
                    <span class="input-group-text input-label-box">Wave type:</span>
                    <select class="form-select form-control" id="wave-select">
                        <option value="sine">Sine</option>
                        <option value="square">Square</option>
                        <option value="triangle">Triangle</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
                <div class="sub-container rounded" id="sub-time">
                    <h6>Playback:</h6>
                    <div class="input-group mt-1">
                        <span class="input-group-text input-label-box">Start:</span>
                        <input type="number" id="start-input" class="form-control" value="0" step="1">
                        <span class="input-group-text input-label-box">s</span>
                    </div>
                    <div class="input-group mt-1">
                        <span class="input-group-text input-label-box">End:</span>
                        <input type="number" id="end-input" class="form-control" value="1" step="1">
                        <span class="input-group-text input-label-box">s</span>
                    </div>
                    <div class="form-check mt-1">
                        <input class="form-check-input" type="checkbox" id="playback-current-view" disabled>
                        <label class="form-check-label" for="playback-current-view">Current view</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="playback-loop">
                        <label class="form-check-label" for="playback-loop">Loop</label>
                    </div>
                </div>
                <div class="sub-container rounded" id="sub-frequency">
                    <div class="input-group mt-1">
                        <span class="input-group-text input-label-box">Frequency:</span>
                        <input type="number" id="frequency-input" class="form-control" value="440" min='1' max="22000" step='1'>
                        <span class="input-group-text input-label-box">Hz</span>
                    </div>
                    <input type="range" min="1" max="22000" step="1" value="440" class="form-range input-slider" id="frequency-slider">
                </div>
                <div class="sub-container rounded" id="sub-duty">
                    <div class="input-group mt-1">
                        <span class="input-group-text input-label-box">Duty cycle:</span>
                        <input type="number" id="duty-input" class="form-control" value="50" min='0' max="100" step='1'>
                        <span class="input-group-text input-label-box">%</span>
                    </div>
                    <input type="range" min="0" max="100" step="1" value="50" class="form-range input-slider" id="duty-slider">
                </div>
                <div class="sub-container rounded" id="sub-skew">
                    <div class="input-group mt-1">
                        <span class="input-group-text input-label-box">Skew:</span>
                        <input type="number" id="skew-input" class="form-control" value="50" min='0' max="100" step='1'>
                        <span class="input-group-text input-label-box">%</span>
                    </div>
                    <input type="range" min="0" max="100" step="1" value="50" class="form-range input-slider" id="skew-slider">
                </div>
                <div class="sub-container rounded" id="sub-amplitude">
                    <div class="input-group mt-1">
                        <span class="input-group-text input-label-box">Amplitude:</span>
                        <input type="number" id="amplitude-input" class="form-control" value="50" min='0' max="100" step='1'>
                        <span class="input-group-text input-label-box">%</span>
                    </div>
                    <input type="range" min="0" max="100" step="1" value="50" class="form-range input-slider" id="amplitude-slider">
                </div>
                <div class="sub-container rounded" id="sub-phase">
                    <div class="input-group mt-1">
                        <span class="input-group-text input-label-box">Phase shift:</span>
                        <input type="number" id="phase-input" class="form-control" value="0" min='0' max="360" step='1'>
                        <span class="input-group-text input-label-box">°</span>
                    </div>
                    <input type="range" min="0" max="360" step="1" value="0" class="form-range input-slider" id="phase-slider">
                </div>


                <!-- <div class="sub-container rounded" id="sub-bias">
                            <div class="input-group mt-1">
                                <span class="input-group-text input-label-box">Bias:</span>
                                <input type="number" id="frequency-input" class="form-control" value="440" min='1' max="22000" step='1'>
                                <span class="input-group-text input-label-box">Hz</span>
                            </div>
                            <input type="range" min="1" max="22000" step="1" value="440" class="form-range input-slider" id="frequency-slider">
                        </div> -->
            </div>
        </div>


        <?php bootstrapModal('optionsModal', 'Options', <<<HTML
        <div class="form-check form-switch">
		    <input class="form-check-input" type="checkbox" role="switch" id="options-grid" checked>
            <label class="form-check-label" for="options-grid">Grid & axis</label>
        </div>
        <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="options-minor-grid" checked>
            <label class="form-check-label" for="options-minor-grid">Minor grid</label>
        </div>
        <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="options-axis-numbers" checked>
            <label class="form-check-label" for="options-axis-numbers">Axis numbers</label>
        </div>
        <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="options-connect" checked>
            <label class="form-check-label" for="options-connect">Connect points in lines</label>
        </div>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="options-degrees" id="options-degrees" checked>
            <label class="form-check-label" for="options-degrees">Degrees</label>
        </div>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="options-degrees" id="options-radians">
            <label class="form-check-label" for="options-radians">Radians</label>
        </div>

HTML); ?>

        <?php bootstrapModal('aboutModal', $lang['aboutmodal.title'], <<<HTML
		<h5 style="font-weight:bold;">Graphing Calculator, <span style="font-size:1rem">{$lang['aboutmodal.version']} 1.3</span></h5> 
		<span>{$lang['aboutmodal.created']}: {$lang['month.june']} 2022</span><br />
		<span>{$lang['aboutmodal.updated']}: {$lang['month.september']} 2022</span>
		<p>© 2022 by barty12</p>
HTML); ?>

        <!-- <script src="https://unpkg.com/@free-side/audioworklet-polyfill/dist/audioworklet-polyfill.js"></script> -->
        <script>
            !function(){var e,t=[];function r(e){var r=this,n={},i=-1;this.parameters.forEach(function(e,o){var a=t[++i]||(t[i]=new Float32Array(r.bufferSize));a.fill(e.value),n[o]=a}),this.processor.realm.exec("self.sampleRate=sampleRate="+this.context.sampleRate+";self.currentTime=currentTime="+this.context.currentTime);var a=o(e.inputBuffer),s=o(e.outputBuffer);this.instance.process([a],[s],n)}function o(e){for(var t=[],r=0;r<e.numberOfChannels;r++)t[r]=e.getChannelData(r);return t}function n(e){return e.$$processors||(e.$$processors={})}"function"==typeof AudioWorkletNode&&"audioWorklet"in AudioContext.prototype||(self.AudioWorkletNode=function(t,o,i){var a=n(t)[o],s=t.createScriptProcessor(void 0,2,i&&i.outputChannelCount?i.outputChannelCount[0]:2);if(s.parameters=new Map,a.properties)for(var u=0;u<a.properties.length;u++){var c=a.properties[u],l=t.createGain().gain;l.value=c.defaultValue,s.parameters.set(c.name,l)}var p=new MessageChannel;e=p.port2;var f=new a.Processor(i||{});return e=null,s.port=p.port1,s.processor=a,s.instance=f,s.onaudioprocess=r,s},Object.defineProperty((self.AudioContext||self.webkitAudioContext).prototype,"audioWorklet",{get:function(){return this.$$audioWorklet||(this.$$audioWorklet=new self.AudioWorklet(this))}}),self.AudioWorklet=function(){function t(e){this.$$context=e}return t.prototype.addModule=function(t,r){var o=this;return fetch(t).then(function(e){if(!e.ok)throw Error(e.status);return e.text()}).then(function(t){var i={sampleRate:o.$$context.sampleRate,currentTime:o.$$context.currentTime,AudioWorkletProcessor:function(){this.port=e},registerProcessor:function(e,t){n(o.$$context)[e]={realm:a,context:i,Processor:t,properties:t.parameterDescriptors||[]}}};i.self=i;var a=new function(e,t){var r=document.createElement("iframe");r.style.cssText="position:absolute;left:0;top:-999px;width:1px;height:1px;",t.appendChild(r);var o=r.contentWindow,n=o.document,i="var window,$hook";for(var a in o)a in e||"eval"===a||(i+=",",i+=a);for(var s in e)i+=",",i+=s,i+="=self.",i+=s;var u=n.createElement("script");u.appendChild(n.createTextNode('function $hook(self,console) {"use strict";\n        '+i+";return function() {return eval(arguments[0])}}")),n.body.appendChild(u),this.exec=o.$hook.call(e,e,console)}(i,document.documentElement);return a.exec((r&&r.transpile||String)(t)),null})},t}())}();
            //# sourceMappingURL=audioworklet-polyfill.js.map
        </script>
        <script src="js/calculator.js" type="module"></script>
        <!-- <script src="graph.js" type="module"></script> -->

        <?php includeAd(); ?>
</body>

</html>