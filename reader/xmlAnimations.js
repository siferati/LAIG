/**
 *	Class that represents a parameterized line segment between two points in space
 * @param pointA Initial point of line segment (array of 3 coords)
 * @param pointB Final point of line segment (array of 3 coords)
 * @param linearVel Linear Velocity
 */
function lineSegment(pointA, pointB, linearVel) {
	this.pointA = pointA.slice(0);
	this.pointB = pointB.slice(0);
	//vector director
	this.vector = [pointB[0] - pointA[0], pointB[1] - pointA[1], pointB[2] - pointA[2]];
	// d = sqrt((x2 - x1)^2 + (y2 - y1)^2 + (z2 - z1)^2)
	this.distance = Math.sqrt(
		(pointB[0] - pointA[0]) * (pointB[0] - pointA[0]) +
		(pointB[1] - pointA[1]) * (pointB[1] - pointA[1]) +
		(pointB[2] - pointA[2]) * (pointB[2] - pointA[2]));
	// linear velocity
	this.linearVel = linearVel;
	// how long this lineSegment takes to go through (in milliseconds)
	this.totalDuration = this.distance / this.linearVel;
	// how long this segment has been active for (in milliseconds)
	this.activeDuration = 0;
	// current position in this line segment (array of 3 coords)
	this.currentPosition = this.pointA.slice(0);
}

/**
 * Calculates new position given time
 * @param timePassed Time passed since last call
 * @return Over duration (duration that is left to animate after this segment is done)
 */
lineSegment.prototype.update = function(timePassed) {

	// update active duration
	this.activeDuration += timePassed;

	// used as a control value by animation class
	var overDuration = this.activeDuration - this.totalDuration;

	// normalize time in order to calculate equation
	var time = timePassed / this.totalDuration;

	// currentPosition += pointA + t * vector

	// x
	this.currentPosition[0] += this.pointA[0] + time * this.vector[0];
	// y
	this.currentPosition[1] += this.pointA[1] + time * this.vector[1];
	// z
	this.currentPosition[2] += this.pointA[2] + time * this.vector[2];

	return overDuration;
};


/**
 * Class that represents animations tag in xml (it's basically just an array, but it helps with debugging)
 * @param arrayAnimations array of animations (object of class xmlAnim)
 */
function xmlAnimations(arrayAnimations) {
	this.animations = arrayAnimations.slice(0);
	//set active animation
	this.activeAnimationIndex = 0;
	this.activeAnimation = this.animations[this.activeAnimationIndex];
	//set start position
	this.objectPosition = [0, 0, 0];
}

/**
 * Updates the animations based on time passed
 * @param currTime The current time in milliseconds
 */
xmlAnimations.prototype.update = function(currTime) {
	var overDuration = this.activeAnimation.update(currTime);
	//TODO move to next animation if activeAnimation.done === true;
};

/**
 * Checks if there are multiple objects with the same id
 */
xmlAnimations.prototype.checkDoubleId = function() {
	for (var i = 0; i < this.animations.length - 1; i++) {
		for (var j = i + 1; j < this.animations.length; j++) {
			if (this.animations[i].id === this.animations[j].id) {
				return 'Found multiple animations with the same id: ' + this.animations[i].id;
			}
		}
	}
	return null;
};

/**
 * Scan animations array to find match with parameter id and return it
 * @param id Id to match with
 * @return Clone of matched element. False otherwise
 */
xmlAnimations.prototype.findById = function(id) {
	//percorrer o array
	for (var i = 0; i < this.animations.length; i++) {
		//match id
		if (this.animations[i].id === id) {
			return this.animations[i].clone();
		}
	}
	return false;
};

/**
 * Outputs every attr to the console
 */
xmlAnimations.prototype.consoleDebug = function() {
	console.log("--- START ANIMATIONS DEBUGGING ---");
	console.log("Animations[" + this.animations.length + "]:");
	for (var i = 0; i < this.animations.length; i++) {
		this.animations[i].consoleDebug();
	}
	console.log("--- FINISH ANIMATIONS BUGGING ---");
};

/**
 * Abstract Class that represents an animation
 * @param id ID
 * @param span Span of the animation
 * @param type Linear or Circular
 * @param linearVel Linear velocity
 */
function xmlAnim(id, span, type, linearVel) {
	this.id = id;
	this.span = span;
	this.type = type;
	this.linearVel = linearVel;
	// time of last update
	this.lastTime = 0;
	// how long this animation has been active for
	this.activeDuration = 0;
}

/**
 * Outputs every attr to the console
 */
xmlAnim.prototype.consoleDebug = function() {
	console.log("--- START ANIM DEBUGGING ---");
	console.log("Id: " + this.id);
	console.log("Span: " + this.span);
	console.log("Type: " + this.type);
	console.log("linearVel: " + this.linearVel);
};

/**
 * Class that represents a linear animation
 * @param id ID
 * @param span Span of the animation
 * @param type Linear or Circular
 * @param arrayControlPoints 2D array with control points
 */
function xmlLinearAnim(id, span, type, arrayControlPoints) {
	// initialize totalDistance
	var totalDistance = 0;

	// go through all control points to find totalDistance
	for (var i = 0; i < this.controlPoints - 1; i++) {
		var pointA = this.controlPoints[i];
		var pointB = this.controlPoints[i + 1];
		// d = sqrt((x2 - x1)^2 + (y2 - y1)^2 + (z2 - z1)^2)
		var distance = Math.sqrt(
			(pointB[0] - pointA[0]) * (pointB[0] - pointA[0]) +
			(pointB[1] - pointA[1]) * (pointB[1] - pointA[1]) +
			(pointB[2] - pointA[2]) * (pointB[2] - pointA[2]));
		totalDistance += distance;
	}

	// find linear velocity
	var linearVel = totalDistance / span;

	// line segments storage
	this.lineSegments = [];

	// go through all control points and create their line segments
	for (var i = 0; i < this.controlPoints - 1; i++) {
		var pointA = this.controlPoints[i];
		var pointB = this.controlPoints[i + 1];
		this.lineSegments.push(new lineSegment(pointA, pointB, linearVel));
	}

	// call to super constructor
	xmlAnim.call(this, id, span, type, linearVel);

	// set control points
	this.controlPoints = arrayControlPoints.slice(0);

	// set current line segment
	this.currentLineSegmentIndex = 0;
	this.currentLineSegment = this.lineSegments[this.currentLineSegmentIndex];
}
xmlLinearAnim.prototype = Object.create(xmlAnim.prototype);

/**
 * Updates animation based on time passed
 * @param currTime The current time in milliseconds
 * @return -1 if animation is not over, overDuration otherwise
 */
xmlLinearAnim.prototype.update = function(currTime) {
	// if it's the first update since program started
	if (this.lastTime === 0) {
		//set last time
		this.lastTime = currTime;
	}
	// if it's not the first time
	else {
		// get how much time passed since last update (in milliseconds)
		var timePassed = this.lastTime - currTime;
		// update lastTime
		this.lastTime = currTime;
		// update active duration
		this.activeDuration += timePassed;
		// update position in line segment
		var overDuration = this.currentLineSegment.update(timePassed);
		//TODO por isto em ciclo do while, no caso de ter de saltar varios segments num unico update
		// if overDuration >= 0 means currentLineSegment is over and need to move to the next overDurationLineSegment
		if (overDuration >= 0) {
			this.currentLineSegmentIndex++;
			// if last segment is over
			if (this.currentLineSegmentIndex >= this.lineSegments.length) {
				return overDuration;
			} else {
				// move to the next line segment
				this.currentLineSegment = this.lineSegments[this.currentLineSegmentIndex];
				// and update it as well
				this.currentLineSegment.update(timePassed);
			}
		}
		// means this animation isn't over yet
		return -1;
	}
};

/**
 * Clones this Object
 * @return Cloned Object
 */
xmlLinearAnim.prototype.clone = function() {
	return new xmlLinearAnim(this.id, this.span, this.type, this.controlPoints);
};

/**
 * Outputs every attr to the console
 */
xmlLinearAnim.prototype.consoleDebug = function() {
	xmlAnim.prototype.consoleDebug.call(this);
	var ss; //string variable that helps avoiding the console.log newline
	console.log("--- START CONTROL POINTS DEBUGGING ---");
	for (var i = 0; i < this.controlPoints.length; i++) {
		ss = "Point" + i + "[" + this.controlPoints[i].length + "]:";
		for (var j = 0; j < this.controlPoints[i].length; j++) {
			ss += " " + this.controlPoints[i][j];
		}
		console.log(ss);
	}
	console.log("--- FINISH CONTROL POINTS DEBUGGING ---");
	console.log("--- FINISH ANIM DEBUGGING ---");
};

/**
 * Class that represents a circular animation
 * @param id ID
 * @param span Span of the animation
 * @param type Linear or Circular
 * @param centerPoint Coordinates for center
 * @param radius radius
 * @param startang Starting angle (in degree!)
 * @param rotang Rotating angle (in degree!)
 */
function xmlCircularAnim(id, span, type, centerPoint, radius, startang, rotang) {
	//TODO calcular vel linear
	var linearVel = 0;
	//TODO calcular vel angular
	var angVel = 0;
	xmlAnim.call(this, id, span, type, linearVel);
	this.center = centerPoint.slice(0);
	this.radius = radius;
	this.startang = startang;
	this.rotang = rotang;
}
xmlCircularAnim.prototype = Object.create(xmlAnim.prototype);

/**
 * Clones this Object
 * @return Cloned Object
 */
xmlCircularAnim.prototype.clone = function() {
	return new xmlCircularAnim(this.id, this.span, this.type, this.center, this.radius, this.startang, this.rotang);
};

/**
 * Outputs every attr to the console
 */
xmlCircularAnim.prototype.consoleDebug = function() {
	xmlAnim.prototype.consoleDebug.call(this);
	var ss; //string variable that helps avoiding the console.log newline
	ss = "Center[" + this.center.length + "]:";
	for (var i = 0; i < this.center.length; i++) {
		ss += " " + this.center[i];
	}
	console.log(ss);
	console.log("Radius: " + this.radius);
	console.log("StartAng: " + this.startang);
	console.log("RotAng: " + this.rotang);
	console.log("--- FINISH ANIM DEBUGGING ---");
};
