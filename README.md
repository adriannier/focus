# Focus
A timer to help you alternate between phases of focused work and relaxation

## Motivation
Apart from wanting to develop healthier work habits, I was interested in creating an offline web app, trying the HTML5 audio tag, and see how all of that performs on various devices.

## Getting started
View the demo at [https://adriannier.de/focus](https://adriannier.de/focus)

## Usage
When you first load the timer it will start in focus mode. Once 45 minutes have passed, the timer switches to relax mode for 15 minutes. This is repeated infinitely as long as you keep the browser window open.

##### Mode toggle

Switch between focus and relax mode immediately by pressing the text indicating the current mode above the time readout.

##### Pause

Tapping the time readout stops the timer until you press again.

##### Themes

To toggle between the black-on-white and white-on-black tap the the circular indicator.

##### Accelerate
Pressing and holding the circular indicator allows you to fast-forward the timer.

##### Reloading
The current mode and remaining time will be restored when the browser window is reloaded.

##### Zooming
Use your browser’s built-in zoom feature to control the size of the timer.

##### Desktop app
With [Fluid](http://fluidapp.com) you can create a stand-alone focus timer application on your Mac.

## Installation
Download the project and open index.html or copy the project files to a web server.

## Known issues
- Clicks have no effect in Firefox
- Sounds do not play when running from home screen on iOS

## Debugging
Load index.html with an empty GET variable named debug to have log messages appear in the console log.
Example: [https://adriannier.de/focus?debug](https://adriannier.de/focus?debug)

## Acknowledgements
The focus sound was provided by user [eliasheuninck](https://www.freesound.org/people/eliasheuninck) of freesound.org under the Creative Commons 0 License. Original file name: [Singing bowl, high and quiet](https://www.freesound.org/people/eliasheuninck/sounds/170670/)
