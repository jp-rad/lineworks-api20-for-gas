import Lineworks from "../src/Lineworks";
describe("Lineworks test on node.js", () => {
  beforeAll(() => {
    Logger.log = jest.fn().mockImplementation(msg => {
      return console.log(msg);
    });
    jest.spyOn(Logger, "log");
  });
  test("Content", () => {
    const text = "Hello";
    const expected = { content: {type: 'text', text: text,}, };
    const actual = Lineworks.Bot.Content.TextContent(text);
    expect(actual).toEqual(expected);
  });
});