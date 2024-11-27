import colors from "yoctocolors-cjs";

export default async function selector(
  choiceName: string,
  choices: string[],
  direction: "horizontal" | "vertical" = "horizontal"
): Promise<string | null> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.log("Not a TTY stdin or stdout");

    return null;
  }

  const stdin = process.stdin;
  const stdout = process.stdout;

  let choiceIndex = 0;

  function writeChoicesHorizontal(valid: boolean = false) {
    stdout.clearLine(0);
    stdout.cursorTo(0);

    const selectedChoice = choiceIndex >= choices.length ? choices[0] : choices[choiceIndex];

    const choicesText = choices
      .map((choice) =>
        selectedChoice === choice ? (valid ? colors.greenBright("> " + colors.underline(choice)) : "> " + colors.underline(choice)) : "  " + choice
      )
      .join("  ");

    stdout.write(`${colors.bold(colors.blueBright(choiceName))} ${choicesText}`);
  }

  function writeChoicesVertical(valid: boolean = false) {
    clearLines();

    stdout.write(`${colors.bold(colors.blueBright(choiceName))}\n`);

    const selectedChoice = choiceIndex >= choices.length ? choices[0] : choices[choiceIndex];

    choices.forEach((choice) => {
      const choiceText =
        selectedChoice === choice ? colors.blueBright(colors.bold(valid ? colors.greenBright(" > " + choice) : " > " + choice)) : " - " + choice;

      stdout.write(choiceText + "\n");
    });
  }

  function clearLines() {
    const n = choices.length + 2;

    for (let i = 0; i < n; i++) {
      //first clear the current line, then clear the previous line
      const y = i === 0 ? 0 : -1;
      process.stdout.moveCursor(0, y);
      process.stdout.clearLine(0);
    }
    process.stdout.cursorTo(0);
  }

  if (direction === "horizontal") writeChoicesHorizontal();
  else {
    for (let i = 0; i <= choices.length; i++) {
      stdout.write("\n");
    }

    writeChoicesVertical();
  }

  stdin.setRawMode(true);

  stdin.resume();

  return new Promise((resolve, reject) => {
    stdin.on("data", (d) => {
      let data = d.toJSON().data;

      if (data.length === 3 && data[0] === 27 && data[1] === 91 && (data[2] === 65 || data[2] === 66 || data[2] === 67 || data[2] === 68)) {
        let arrow: "up" | "down" | "left" | "right" | null = null;

        switch (data[2]) {
          case 65:
            arrow = "up";
            break;
          case 66:
            arrow = "down";
            break;
          case 67:
            arrow = "left";
            break;
          case 68:
            arrow = "right";
            break;
        }

        if ((arrow === "left" && direction === "horizontal") || (arrow === "down" && direction === "vertical")) {
          if (choiceIndex >= choices.length - 1) choiceIndex = 0;
          else choiceIndex++;
        } else if ((arrow === "right" && direction === "horizontal") || (arrow === "up" && direction === "vertical")) {
          if (choiceIndex === 0) choiceIndex = choices.length - 1;
          else choiceIndex--;
        }

        if (direction === "horizontal") writeChoicesHorizontal();
        else writeChoicesVertical();
      } else if (data.length === 1 && (data[0] === 13 || data[0] === 32)) {
        if (direction === "horizontal") writeChoicesHorizontal(true);
        else writeChoicesVertical(true);
        stdout.write("\n");
        resolve(choices[choiceIndex]);
        stdin.destroy();
      } else if (data.length === 1 && (data[0] === 3 || data[0] === 18)) {
        stdout.write("\n");
        reject("SIGINT");
        stdin.destroy();
      }
    });
  });
}
