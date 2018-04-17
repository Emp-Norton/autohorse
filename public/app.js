
	/* TODO:
		- more robust typo prevention (a => qwsxz, h => gyujnb)
		- Refactor to allow recognition of any grading signs and input properties tabulated. I.e. instead of autonomy and horsepower (a+/-, h+/-): <input grading name> <input grading mark>
		- Implement an error correction method / update error notifs
		- Handle flashy update to results areas
		- Clean up the spaghetti I spilled below this comment

	*/


	let addToClip = () => {
		document.getElementById('notes').select()
		document.execCommand("copy");
	}

	let hideOptions = () => {
		document.querySelector('#initialLoadOptions').style.display = 'none';
	}

	let showActiveTools = () => {
		hideOptions();
		document.querySelector('#notes').style.display = 'block';
		document.querySelector('#activeNotes').style.display = 'block';
		
	}

	let showPassiveTools = () => {
		hideOptions();
		document.querySelector('.inputContainer').style.display = 'block';
		document.querySelector('#subbedNotes').style.display = 'block';
	}

	let updateErrors = () => {
		// select error display div 
		let errorNotificationArea = document.querySelector('#potentialErrors');
		// empty div to avoid repeating error lines
		errorNotificationArea.innerHTML = '';
		// create a label for the error notice div 
		let errorHeader = document.createElement("div");
		// style the label
		errorHeader.innerHTML = '<h3 style="color: red"> Error </h3>'
		// append it to the div
		errorNotificationArea.append(errorHeader)
		// make the notification area visible if the showErrors property is true 
		if (window.showErrors) errorNotificationArea.style.display = 'block';
		// iterate through errors on the window's error property 
		window.errorZone.forEach(error => {
			// create a div to store each error line 
			let errorDiv = document.createElement("div");
			// style the error line div 
			errorDiv.innerHTML = `<p>${error}</p>`;
			// append to DOM
			errorNotificationArea.append(errorDiv)
		})
	}

	window.stampedNotes = [];
	window.errorZone = [];

	let addToDOM = (notes) => {
		// create storage variable for each part of the input split on newline
		let parts;
		// check for active timestamped notes on window 
			// if found, assign to "parts"
			// else split notes on newline character for access to each specific timestamp
		window.stampedNotes.length > 0 ? parts = window.stampedNotes : parts = notes.split('\n')
		// clear out the current notes div
		document.querySelector('#notes').value = '';
		// iterate through parts one timestamp at a time 
		parts.forEach(part => {
			// create line-by-line boolean switch for error handling
			let potentialError;
			// grab last four characters of timestamp note to check for typos
			let grades = part.slice(part.length-4, part.length);
			if (grades.includes('=') || grades.includes("0")) {
				// common typo found, push to window's errorzone
				potentialError = true;
				// isolate timestamp of line with error in it
				errorLine = part.split(' ')[0];
				// check error isn't already identified 
					// save it if not 
				if (!window.errorZone.includes(errorLine)) window.errorZone.push(errorLine)
					// update our errors div / create one if necessary
			  updateErrors();
			}
			// create div to store note line 
			let partDiv = document.createElement("p");
			// add markup tags to make timestamp bold and highlight potential typos
			partDiv.innerHTML = potentialError ? `<p><b>${part.split(' ')[0]} - </b>${part.split(' ').slice(2).join(' ')}<h3 style="color: red"> ERROR ^^^ </h3></p>` : `<p><b>${part.split(' ')[0]} - </b>${part.split(' ').slice(2).join(' ')}</p>`
			//append the timestamped / marked-up note to DOM
			document.querySelector('#subbedNotes').append(partDiv);
			// in case of active notes, add to existing div (above will be hidden, and vice versa for existing note submission)
			document.querySelector('#notes').value += `${part}\n`
		});
		// create a horizontal rule and some whitespace below notes
		let horizRule = document.createElement("div");
		horizRule.innerHTML = "<br>"
		document.querySelector('#notes').append(horizRule)
		// hide our input interface after submitting
		document.querySelector('.inputContainer').style.display = 'none'


		
	}

	let updateResults = () => {
		let autonomy = window.totalAutonomy;
		let horsepower = window.totalHorsepower;
		// grab our result divs for reference 
		const autoResult = document.querySelector('#autonomyResult');
		const horseResult = document.querySelector('#horsepowerResult');

		// make our result divs visible
		autoResult.style.display = "flex"
		horseResult.style.display = "flex"
		// assign border colors based on positivity or negativity of result
		autonomy > 0 ? autoResult.style.borderColor = "green" : autonomyResult.style.borderColor ="red";
		horsepower > 0 ? horseResult.style.borderColor = "green" : horseResult.style.borderColor = "red";
		// add the resulting values to the spans in our results divs
		autoResult.innerHTML = `Autonomy: ${autonomy}`;
		horseResult.innerHTML = `Horsepower: ${horsepower}`;
		

	}

	let flashUpdate = (attribute) => {
		document.querySelector(`#${attribute}`).classList.add('tallyAttribute');
	}

	let getTally = (input) => {
		input = input ? input : window.stampedNotes.join('')
		let autonomyPlus = 0;
	  let autonomyMinus = 0;
	  let horsepowerPlus = 0;
	  let horsepowerMinus = 0;

	  let chars = input.split('');
	  for (let index = 0; index < chars.length; index++) {
	    if (chars[index] === "a" || chars[index] == "A") {
	      if (chars[index + 1] === "+") autonomyPlus++;
	      if (chars[index + 1] === "-") autonomyMinus++;
	    }
	    
	    if (chars[index] === "h" || chars[index] == 'H') {
	      if (chars[index + 1] === "+") horsepowerPlus++;
	      if (chars[index + 1] === "-") horsepowerMinus++;
	    }
	  }
	  
	  window.totalAutonomy = autonomyPlus - autonomyMinus;
	  window.totalHorsepower = horsepowerPlus - horsepowerMinus;

	}

	let evaluateNotes = () => {
		// grab submitted notes
		let input = document.querySelector('#notesInput').value;
		// hide active note-taking tools
		document.querySelector('#activeNotes').style.display = 'none';
		

	  getTally(input);
	  // formate notes and add to DOM
	  addToDOM(input)
	  // update results from tally 
	  updateResults();
	 
	}

	let checkKeyPress = (e) => {
		// check that key pressed is 'enter'
		if (e.keyCode === 13) {
			// if so, submit note
			stampNote();
		}
	}

	let stampNote = () => {
		// check if there's currently a timer running
		if (!window.timer) {
			// start one if not
			window.timer = 0;
			// increment it every second
			setInterval(function() {
				window.timer++;
			}, 1000)
		} 

		// grab note from active note field 
		let note = document.querySelector('#activeNote').value;
		// calculate time elapsed since timer start / first note stamped
		let seconds = (timer % 60).toString();
		let minutes = parseInt((timer / 60) % 60).toString();
		let hours = parseInt(timer / 3600).toString();

		// add a "0" for aesthetic purposes
		if (minutes.length < 2) {
			minutes = '0'.concat(minutes);
		}

		if (hours.length < 2) {
			hours = '0'.concat(hours);
		}

		if (seconds.length < 2) {
			seconds = '0'.concat(seconds);
		}

		// put stamp together
		let timeStamp = [hours, minutes, seconds].join(':');
		// join it with the note in a string 
		let stampedNote = `${timeStamp} - ${note}`;
		// add to the running list on window object
		window.stampedNotes.push(stampedNote);
		// reset our note holder area 
		document.querySelector('#activeNote').value = '';
		document.querySelector('#notes').innerHTML = '';
		

		// get new tally
		getTally();
		addToDOM(window.stampednotes)
		// update our results
		updateResults()
		// add our new note list to the now-empty note storage area in the addToDOM
	}

	let toggleErrorDisplay = () => {
		let errorDisplay = document.querySelector('#potentialErrors'); 
		if (errorDisplay.style.display == "none") {
			window.showErrors = true;
			errorDisplay.style.display = "block";
		} else {
			window.showErrors = false;
			errorDisplay.style.display = "none";
		}
	}

	let removeTransition = (e) => {
    if (e.propertyName !== 'transform') return;
    e.target.classList.remove('tallyAttribute');
  }

	let init = () => { 
		window.showErrors = true;
		console.log('run')
		// setup event listeners for buttons
		document.querySelector('#copyToClipboard').addEventListener('click', addToClip);
		document.querySelector('#submitNotes').addEventListener('click', evaluateNotes);
		document.querySelector('#activeNoteSubmit').addEventListener('click', stampNote);
		document.querySelector('#takeActiveNotes').addEventListener('click', showActiveTools);
		document.querySelector('#submitExistingNotes').addEventListener('click', showPassiveTools);
		document.querySelector('#toggleErrorDisplay').addEventListener('click', toggleErrorDisplay);
		window.addEventListener('keydown', checkKeyPress)
		document.querySelector('#horsepowerResult').addEventListener('transitionend', removeTransition);
		document.querySelector('#autonomyResult').addEventListener('transitionend', removeTransition)

		// hide tools that aren't yet needed
		document.querySelector('.inputContainer').style.display = 'none';
		document.querySelector('#activeNotes').style.display = 'none';
	}
