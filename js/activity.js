define(function (require) {
    var activity = require("sugar-web/activity/activity");
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
        } else {
            console.log("Touch not enabled");
        }
        createjs.Ticker.setFPS(24);

        stage.addEventListener("stagemousedown", handleMouseDown);
        stage.addEventListener("stagemouseup", handleMouseUp);

        // set up our defaults:
        var strokeColor = "#309090";
        var strokeSize = 40;
        var shape;
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
                                              oldPoint.y+stage.mouseY>>1);

            shape.graphics.clear().setStrokeStyle(strokeSize, 'round', 'round').
                beginStroke(strokeColor).moveTo(midPoint.x, midPoint.y).
                curveTo(oldPoint.x, oldPoint.y, oldMidPoint.x, oldMidPoint.y);

            oldPoint.x = stage.mouseX;
            oldPoint.y = stage.mouseY;

            oldMidPoint.x = midPoint.x;
            oldMidPoint.y = midPoint.y;

            stage.update();
        }

        stage.update();
    });

});
