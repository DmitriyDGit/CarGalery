// Create "Class"
class Task {
	constructor(title = 'Task') {
		// Property
		this._title = title;
		this._done = false;
	}

	get title() {
		return this.title;
	}

	set title(value) {
		this._title = value;
	}

	// Method in prototype
	complete() {
		this._done = true;
	}

	// Static method
	static getDefaultTitle() {
		return 'Task';
	}
}

// Inheritance
class SubTask extends Task {
	constructor(title, parent) {
		// Call parent constructor
		super(title);
	}
}

// Create object
let task = new Task('Leasr JS');
let subtask = new SubTask('Learn ES6', task);

console.log(task);
console.log(subtask);

