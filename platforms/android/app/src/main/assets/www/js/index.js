let month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";

let weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

// Reminder Class: Represents a Reminder
class Reminder {
	constructor(
		text,
		timeBased,
		date,
		time,
		location,
		texttospeech,
		destination,
		image
	) {
		this.text = text;
		this.timeBased = timeBased;
		this.date = date;
		this.time = time;
		this.location = location;
		this.texttospeech = texttospeech;
		this.destination = destination;
		this.image = image;
	}

	getDate() {
		return new Date(`${this.date}T${this.time}:00`);
	}
}

// UI Class: Handle UI Tasks
class UI {
	static addNewRem(reminder) {
		reminder = new Reminder(
			reminder.text,
			reminder.timeBased,
			reminder.date,
			reminder.time,
			reminder.location,
			reminder.texttospeech,
			reminder.destination,
			reminder.image
		);

		const id = new Date().getMilliseconds();

		if (reminder.destination) {
			cordova.plugins.notification.local.addActions("yes-no", [
				{ id: "yes", title: "Yes", launch: true },
				{ id: "no", title: "No" },
			]);
			if (reminder.timeBased)
				cordova.plugins.notification.local.schedule({
					id: id,
					title: "Your Time Reminder!",
					text: `${reminder.text}
					Get directions to ${reminder.destination}?`,
					foreground: true,
					led: { color: "#8620d0", on: 500, off: 500 },
					vibrate: true,
					attachments: [reminder.image],
					at: reminder.getDate(),
					actions: "yes-no",
				});
			else {
				nativegeocoder.forwardGeocode(
					(coords) =>
						cordova.plugins.notification.local.schedule({
							id: id,
							title: "Your Location Reminder!",
							text: `${reminder.text}
							Get directions to ${reminder.destination}?`,
							foreground: true,
							led: { color: "#8620d0", on: 500, off: 500 },
							vibrate: true,
							attachments: [reminder.image],
							trigger: {
								type: "location",
								center: [coords[0].latitude, coords[0].longitude],
								radius: 15,
								notifyOnEntry: true,
							},
							actions: "yes-no",
						}),
					(err) => alert(err.message),
					reminder.location,
					{ useLocale: true, maxResults: 1 }
				);
			}
			nativegeocoder.forwardGeocode(
				(coords) =>
					cordova.plugins.notification.local.on("yes", () => {
						window.open(
							`geo:0,0?q=${parseFloat(coords[0].latitude)},${parseFloat(
								coords[0].longitude
							)}(${reminder.destination})`,
							"_system"
						);
					}),
				(err) => alert(err.message),
				reminder.destination,
				{ useLocale: true, maxResults: 1 }
			);
		} else {
			if (reminder.timeBased)
				cordova.plugins.notification.local.schedule({
					id: id,
					title: "Your Time Reminder!",
					text: reminder.text,
					foreground: true,
					led: { color: "#8620d0", on: 500, off: 500 },
					vibrate: true,
					attachments: [reminder.image],
					at: reminder.getDate(),
				});
			else {
				nativegeocoder.forwardGeocode(
					(coords) => {
						alert(`${coords[0].latitude}, ${coords[0].longitude}`);
						cordova.plugins.notification.local.schedule({
							id: id,
							title: "Your Location Reminder!",
							text: reminder.text,
							foreground: true,
							led: { color: "#8620d0", on: 500, off: 500 },
							vibrate: true,
							attachments: [reminder.image],
							trigger: {
								type: "location",
								center: [coords[0].latitude, coords[0].longitude],
							},
						});
					},
					(err) => alert(err.message),
					reminder.location,
					{ useLocale: true, maxResults: 1 }
				);
			}
		}

		let tts;
		if (reminder.texttospeech) {
			tts = setTimeout(() => {
				TTS.speak({ text: reminder.text, locale: "en-GB" });
			}, reminder.getDate() - new Date());
		}

		const container = document.querySelector(".reminders-list");
		const reminderDiv = document.createElement("div");
		reminderDiv.classList.add("reminderbox");
		let hour = reminder.getDate().getHours();
		let min = reminder.getDate().getMinutes();
		let AMPM = "AM";

		if (hour > 11) {
			AMPM = "PM";
			hour = hour - 12;
		}
		if (hour == 0) hour = 12; //In AMPM the hour is never zero.

		if (hour < 10) hour = `0${hour}`;
		if (min < 10) min = `0${min}`;

		//Fade reminder when it fires
		setTimeout(() => {
			reminderDiv.classList.add("dead");
		}, reminder.getDate() - new Date());

		reminderDiv.innerHTML = `
		<p style="margin:auto 0;overflow: hidden;"><b>${reminder.text}</b></p>
		<p>${hour}:${min} ${AMPM}
		<br><span class="small-font">${
			month[reminder.getDate().getMonth()]
		} ${reminder
			.getDate()
			.getDate()}, ${reminder.getDate().getFullYear()}</span></p>
		<img src="assets/del.svg" class="del-icon">
	`;
		container.appendChild(reminderDiv);

		document.querySelector(".reminders-list").addEventListener("click", (e) => {
			if (
				e.target.classList.contains("del-icon") &&
				e.target.parentElement.firstElementChild.textContent === reminder.text
			) {
				cordova.plugins.notification.local.cancel(id);
				if (tts != undefined) clearTimeout(tts);
			}
		});
	}
	static addRem(reminder) {
		const container = document.querySelector(".reminders-list");
		const reminderDiv = document.createElement("div");
		reminderDiv.classList.add("reminderbox");
		let hour = reminder.getDate().getHours();
		let min = reminder.getDate().getMinutes();
		let AMPM = "AM";

		if (hour > 11) {
			AMPM = "PM";
			hour = hour - 12;
		}
		if (hour == 0) hour = 12; //In AMPM the hour is never zero.

		if (hour < 10) hour = `0${hour}`;
		if (min < 10) min = `0${min}`;

		if (reminder.getDate() - new Date() <= 0) reminderDiv.classList.add("dead");

		reminderDiv.innerHTML = `
		<p style="margin:auto 0;overflow: hidden;"><b>${reminder.text}</b></p>
		<p>${hour}:${min} ${AMPM}
		<br><span class="small-font">${
			month[reminder.getDate().getMonth()]
		} ${reminder
			.getDate()
			.getDate()}, ${reminder.getDate().getFullYear()}</span></p>
		<img src="assets/del.svg" class="del-icon">
	`;
		container.appendChild(reminderDiv);
	}

	static displayReminders() {
		const remindersList = document.querySelector(".reminders-list");
		while (remindersList.firstChild) {
			remindersList.removeChild(remindersList.lastChild);
		}
		Store.getReminders().forEach((r) => {
			UI.addRem(r);
		});
		UI.displayTimer();
	}

	static displayTimer() {
		let lowestDelta = Infinity;
		let closestDate;

		let timer = setInterval(function () {
			//Getting the reminders and calculating the closest date
			const reminders = Store.getReminders();
			reminders.forEach((r) => {
				let date = r.getDate();
				if (date - new Date() < lowestDelta && date - new Date() > 0) {
					lowestDelta = date - new Date();
					closestDate = date;
				}
			});

			if (lowestDelta != Infinity) {
				let totalSec = Math.floor(lowestDelta / 1000);
				let totalMin = Math.floor(lowestDelta / 60000);
				let hour = Math.floor(lowestDelta / 3600000);

				let min = totalMin - hour * 60;
				let sec = totalSec - totalMin * 60;

				//Prefixing with 0 if needed
				if (sec < 10) sec = `0${sec}`;
				if (min < 10) min = `0${min}`;
				if (hour < 10) hour = `0${hour}`;

				//Finally adding to UI
				document.querySelector(
					"#timer"
				).innerHTML = `Time Remaining<br>${hour}:${min}:${sec}`;
			}

			if (closestDate != undefined) {
				//Getting the date and time
				let hour = closestDate.getHours();
				let min = closestDate.getMinutes();
				let AMPM = "AM";

				//Converting it to AMPM
				if (hour > 11) {
					AMPM = "PM";
					hour = hour - 12;
				}
				if (hour == 0) hour = 12; //In AMPM the hour is never zero.

				//Prefixing with 0 if needed
				if (hour < 10) hour = `0${hour}`;
				if (min < 10) min = `0${min}`;

				//Finally adding to UI
				document.querySelector("#next-reminder").innerHTML = `<h3>${
					weekday[closestDate.getDay()]
				}, ${month[closestDate.getMonth()]} ${closestDate.getDate()}</h3>
        <h1>${hour}:${min}</h1>
        <h3 style="text-align: right;">${AMPM}</h3>`;
			}
		}, 1000); // update about every second

		document.querySelector(".reminders-list").addEventListener("click", (e) => {
			if (e.target.classList.contains("del-icon")) {
				clearInterval(timer);
			}
		});
	}

	static deleteReminder(r) {
		r.parentElement.remove();
	}
}

// Store Class: Handles Storage
class Store {
	static getReminders() {
		let reminders;
		if (localStorage.getItem("reminders") === null) {
			reminders = [];
		} else {
			reminders = JSON.parse(localStorage.getItem("reminders"));
			reminders.forEach((r, i, arr) => {
				arr[i] = new Reminder(
					r.text,
					r.timeBased,
					r.date,
					r.time,
					r.location,
					r.texttospeech,
					r.destination,
					r.image
				);
			});
		}
		return reminders;
	}

	static addReminder(reminder) {
		const reminders = Store.getReminders();
		reminders.push(reminder);
		localStorage.setItem("reminders", JSON.stringify(reminders));
	}

	static deleteReminder(reminderText) {
		const reminders = Store.getReminders();
		reminders.forEach((r, index) => {
			if (r.text === reminderText) {
				reminders.splice(index, 1);
			}
		});
		localStorage.setItem("reminders", JSON.stringify(reminders));
	}
}

let app = {
	pages: [],
	show: new Event("show"),
	// Application Constructor
	initialize: function () {
		document.addEventListener(
			"deviceready",
			this.onDeviceReady.bind(this),
			false
		);
	},
	pageShown: function (ev) {},
	// deviceready Event Handler
	// Bind any cordova events here. Common events are:
	// 'pause', 'resume', etc.
	onDeviceReady: function () {
		app.pages = document.querySelectorAll(".page");
		app.pages.forEach((pg) => {
			pg.addEventListener("show", app.pageShown);
		});

		// Event: Display Reminders
		document.addEventListener("DOMContentLoaded", UI.displayReminders());

		document.querySelectorAll(".nav-link").forEach((link) => {
			link.addEventListener("click", app.nav);
		});

		//Event: Get current Location (form)
		document.querySelector("i").addEventListener("click", () => {
			navigator.geolocation.getCurrentPosition(
				(pos) =>
					nativegeocoder.reverseGeocode(
						(results) => {
							document.querySelector(
								"#rem-location"
							).value = `${results[0].postalCode}, ${results[0].countryName}`;
						},
						(err) => alert(err.message),
						pos.coords.latitude,
						pos.coords.longitude,
						{
							useLocale: true,
							maxResults: 1,
						}
					),
				(err) => console.log(err)
			);
		});

		//Event: Add a Reminder
		document.querySelector("#reminder-form").addEventListener("submit", (e) => {
			// Prevent actual submit
			e.preventDefault();

			// Get form values
			const text = document.querySelector("#remindername").value;
			let timeBased;
			if (document.querySelector("#time-based").checked) timeBased = true;
			else timeBased = false;
			const date = document.querySelector("#reminderdate").value;
			const time = document.querySelector("#remindertime").value;
			const location = document.querySelector("#rem-location").value;
			const texttospeech = document.querySelector("#texttospeech").checked;
			const destination = document.querySelector("#rem-dest").value;
			const image = document
				.querySelector("#imgURI")
				.getAttribute("data-target");

			// Validate
			if (text === "") {
				alert("Please enter a reminder!");
			} else {
				let exists = false;
				Store.getReminders().forEach((r) => {
					if (text === r.text) exists = true;
				});
				if (exists) alert("Reminder Already Exists! New Name Required.");
				else {
					// Instantiate reminder
					const reminder = {
						text,
						timeBased,
						date,
						time,
						location,
						texttospeech,
						destination,
						image,
					};
					// Add Reminder to UI
					UI.addNewRem(reminder);
					Store.addReminder(reminder);
				}
			}
		});

		// Event: Delete a Reminder
		document.querySelector(".reminders-list").addEventListener("click", (e) => {
			if (e.target.classList.contains("del-icon")) {
				UI.deleteReminder(e.target);
				Store.deleteReminder(
					e.target.parentElement.firstElementChild.textContent
				);
				UI.displayReminders();
			}
		});
		// Event: Add a Gallery Image to a Reminder
		document.querySelector("#gallLink").addEventListener("click", (e) => {
			let opts = {
				destinationType: Camera.DestinationType.FILE_URI,
				sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
				mediaType: Camera.MediaType.PICTURE,
			};

			navigator.camera.getPicture(
				(imgURI) => {
					document.querySelector("#imgURI").textContent =
						"Gallery Picture Added!";
					document.querySelector("#imgURI").setAttribute("data-target", imgURI);
				},
				(err) => alert(err),
				opts
			);
		});
		// Event: Add a Gallery Image to a Reminder
		document.querySelector("#camLink").addEventListener("click", (e) => {
			let opts = {
				destinationType: Camera.DestinationType.FILE_URI,
				sourceType: Camera.PictureSourceType.CAMERA,
				mediaType: Camera.MediaType.PICTURE,
			};

			navigator.camera.getPicture(
				(imgURI) => {
					document.querySelector("#imgURI").textContent =
						"Camera Picture Added!";
					document.querySelector("#imgURI").setAttribute("data-target", imgURI);
				},
				(err) => alert(err),
				opts
			);
		});

		// Event: Style radio button options in form
		document.querySelector("#time-based").addEventListener("click", (e) => {
			if (document.querySelector("#time-based").checked) {
				document.querySelector("#reminderdate").readonly = false;
				document.querySelector("#reminderdate").style.opacity = "1";
				document.querySelector("#date-label").style.opacity = "1";
				document.querySelector("#remindertime").readonly = false;
				document.querySelector("#remindertime").style.opacity = "1";
				document.querySelector("#time-label").style.opacity = "1";
				document.querySelector("#rem-location").readonly = true;
				document.querySelector("#rem-location").style.opacity = "0.4";
				document.querySelector("i").style.opacity = "0.4";
			}
		});

		document.querySelector("#location-based").addEventListener("click", (e) => {
			if (document.querySelector("#location-based").checked) {
				document.querySelector("#rem-location").readonly = false;
				document.querySelector("#rem-location").style.opacity = "1";
				document.querySelector("#reminderdate").readonly = true;
				document.querySelector("#reminderdate").style.opacity = "0.4";
				document.querySelector("#date-label").style.opacity = "0.4";
				document.querySelector("#remindertime").readonly = true;
				document.querySelector("#remindertime").style.opacity = "0.4";
				document.querySelector("#time-label").style.opacity = "0.4";
				document.querySelector("i").style.opacity = "1";
			}
		});
	},
	nav: function (e) {
		e.preventDefault();
		let currentPage = e.target.getAttribute("data-target");
		document.querySelector("div.active").classList.remove("active");
		document.getElementById(currentPage).classList.add("active");
		document.getElementById(currentPage).dispatchEvent(app.show);

		if (currentPage === "formcontainer") {
			document.querySelector(".navbar").classList.add("page");
		} else {
			document.querySelector(".navbar").classList.remove("page");
			const oldPage = document
				.querySelector("a.active")
				.getAttribute("data-target");
			document.querySelector("a.active > img").src = `assets/${oldPage}.svg`;
			document.querySelector("a.active").classList.remove("active");

			document
				.querySelector(`a[data-target='${currentPage}']`)
				.classList.add("active"); //Must add the active class before we query based on it in the next line.
			document.querySelector(
				`a.active > img`
			).src = `assets/${currentPage}active.svg`;
		}
		if (currentPage === "calendar") {
			let today = new Date();
			showCalendar(today.getMonth(), today.getFullYear());
		}
	},
};

app.initialize();
