define(function (require) {
    var activity = require("sugar-web/activity/activity");
    var colorpalette = require("activity/colorpalette");
    require("easel");

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();

        var paintCanvas = document.getElementById("paint-canvas");

        var updateSizes = function () {
            var toolbarElem = document.getElementById("main-toolbar");
            var height = window.innerHeight - toolbarElem.offsetHeight - 5;
            paintCanvas.width = window.innerWidth - 5;
            paintCanvas.height = height;
        }
        updateSizes();

        window.onresize = function (event) {
                updateSizes();
        }

        var stage = new createjs.Stage(paintCanvas);

        //check to see if we are running in a browser with touch support
        stage.autoClear = false;
        stage.enableDOMEvents(true);
        var touchEnabled = createjs.Touch.enable(stage);
        if (touchEnabled) {
            console.log("Touch enabled");
            stage.addEventListener("stagemousedown", handlePressDown);
            stage.addEventListener("stagemouseup", handlePressUp);
        } else {
            console.log("Touch not enabled");
            stage.addEventListener("stagemousedown", handleMouseDown);
            stage.addEventListener("stagemouseup", handleMouseUp);
        }
        createjs.Ticker.setFPS(24);

        // set up our defaults:
        var strokeColor = "#309090";
        var strokeSize = 40;
        var shape;

        // For touch interaction
        var pointers = [];

        // For mouse only interaction
        var oldPoint;
        var oldMidPoint;

        var shape = new createjs.Shape();
        stage.addChild(shape);

        // add handler for stage mouse events:
        function handleMouseDown(event) {
            oldPoint = new createjs.Point(stage.mouseX, stage.mouseY);
            oldMidPoint = oldPoint;
            stage.addEventListener("stagemousemove" , handleMouseMove);
        }

        function handleMouseUp(event) {
            stage.removeEventListener("stagemousemove" , handleMouseMove);
        }

        function handleMouseMove(event) {
            var midPoint = new createjs.Point(oldPoint.x + stage.mouseX>>1,
                                              oldPoint.y + stage.mouseY>>1);

            shape.graphics.clear().setStrokeStyle(strokeSize, 'round', 'round').
                beginStroke(strokeColor).moveTo(midPoint.x, midPoint.y).
                curveTo(oldPoint.x, oldPoint.y, oldMidPoint.x, oldMidPoint.y);

            oldPoint.x = stage.mouseX;
            oldPoint.y = stage.mouseY;

            oldMidPoint.x = midPoint.x;
            oldMidPoint.y = midPoint.y;

            stage.update();
        }

        function handlePressDown(event) {
            var pointerData = {};
            pointerData.oldPoint = new createjs.Point(event.stageX,
                                                      event.stageY);
            pointerData.oldMidPoint = pointerData.oldPoint;
            pointers[event.pointerID] = pointerData;
            if (pointers.length == 1) {
                stage.addEventListener("stagemousemove" , handlePressMove);
            }
        }

        function handlePressUp(event) {
            pointers.splice(pointers[event.pointerID], 1);
            if (pointers.length == 0) {
                stage.removeEventListener("stagemousemove" , handlePressMove);
            }
        }

        function handlePressMove(event) {
            pointerData = pointers[event.pointerID];
            var midPoint = new createjs.Point(
                pointerData.oldPoint.x + event.stageX>>1,
                pointerData.oldPoint.y + event.stageY>>1);

            shape.graphics.clear().setStrokeStyle(strokeSize, 'round', 'round').
                beginStroke(strokeColor).moveTo(midPoint.x, midPoint.y).
                curveTo(pointerData.oldPoint.x, pointerData.oldPoint.y,
                        pointerData.oldMidPoint.x, pointerData.oldMidPoint.y);

            pointerData.oldPoint.x = event.stageX;
            pointerData.oldPoint.y = event.stageY;

            pointerData.oldMidPoint.x = midPoint.x;
            pointerData.oldMidPoint.y = midPoint.y;

            stage.update();
        }

        // Color palette.

        function onColorChange(event) {
            strokeColor = event.target.style.backgroundColor;
            colorsButton.style.backgroundColor = strokeColor;
            colorInvoker.style.backgroundColor = strokeColor;
        }

        var colorsButton = document.getElementById("colors-button");
        colorPalette = new colorpalette.ColorPalette(colorsButton, undefined,
                                                     onColorChange);

        var colorInvoker = colorPalette.getPalette().
            querySelector('.palette-invoker');

        // Select the first color of the palette.
        colorPalette.setColor(0);

        // Clear button.

        var clearButton = document.getElementById("clear-button");
        clearButton.addEventListener('click', function (event) {
            stage.clear();
            stage.removeChild(shape);
            shape = new createjs.Shape();
            stage.addChild(shape);
            stage.update();
        });

        stage.update();
    });

});
