import selector from "../src";

test("Making basic choice with 2 options", async () => {
  const result = selector("Test:", ["Choice 1", "Choice 2"]).catch((e) => {
    throw new Error(e);
  });

  await expect(result).resolves.toBe("Choice 1");

  const rightStdin = Buffer.from([27, 91, 67]);
  process.stdin.write(rightStdin);
  process.stdin.write(rightStdin);

  process.stdin.write(Buffer.from([13]));
});
