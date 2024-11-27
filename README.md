# tty-selector

A lightweight multi-choice cli selector for NodeJs

### Installation

You can install this package by running:

```
npm i tty-selector
```

### Usage

You can use `tty-selector` like this:

```js
import selector from "tty-selector";

const result = await selector("What chocolate do you prefer?", [
  "White chocolate",
  "Dark chocolate",
  "Milk chocolate",
]).catch(() => {
  console.log("Choice cancelled!");
});

console.log("You have choosen:", result);
```
