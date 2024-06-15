# Tasker projects

A collection of scripts and projects for the [Tasker Android app](https://tasker.joaoapps.com/).

Many of the projects here are used to automate or streamline tasks in my daily life. Writing JavaScript directly in the Tasker app is cumbersome and error-prone, so over time I've iterated on this repo to create a development environment/workflow tailored to my needs. 

I also use this as a playground for experimenting with different tools/technologies (e.g., [Tailwind CSS](https://tailwindcss.com/), the [Temporal API](https://tc39.es/proposal-temporal/docs/), `bash` scripting), design choices, etc.

## JavaScript module loading

This project uses a [custom implementation of `require`](./src/typescript/modules/require.ts) for module imports. The implementation is customized for my setup and does not fully adhere to the [`require` specification](https://wiki.commonjs.org/wiki/Modules/1.1.1). 

To use it:
- [Build the project](#building) using `npm run build`
- Place the resulting `/build/javascript/modules/require.js` file in a directory on your phone where you'd like to store JS modules
- Place any JS files containing modules you'd like to use **in the same directory you placed `require.js`**
- Create a Tasker global variable called `CommonJS` containing the full path to the `require.js` file (e.g., `/sdcard/Tasker/javascript/modules/require.js`)
- Finally, add `%CommonJS` in the `Libraries` field of your JavaScript(let) action in Tasker

Now, you can import modules using standard `require` syntax using **filename only -- no path or file extensions.**

### Examples

```javascript
// Default imports
const sayHi = require("greetings").default;
sayHi();
```

```javascript
// Destructured imports
const { sayHi, sayHello } = require("greetings");
sayHi();
sayHello();
```

```javascript
// Global imports
require("greetings");
sayHi();
```

```javascript
// Module as object imports
const greetings = require("greetings");
greetings.sayHi();
```

## Building

`npm run compile` or `npx tsc` simply compiles the project and outputs to `/build`.

`npm run build` runs [`build.sh`](./build.sh), which runs tests, compiles the project, runs some `sed` find/replace operations, removes unneeded files, and finally copies the contents of the resulting `/build` directory to the phone if it's connected.
