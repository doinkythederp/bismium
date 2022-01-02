import { StringInterpreter, TextNode, TextNodeVariant } from '../src';
import createValueChecker from './createValueChecker';

describe(StringInterpreter, () => {
  const checkStringContent = (result: TextNode, target: string) =>
    expect(result.content).toBe(target);
  const checkSourceLength = (result: TextNode, target: string) =>
    expect(result.meta.sourceLength).toBe(target.length + 1);

  const createTextNodeFactory =
    (variant: TextNodeVariant) => async (data: string) =>
      new StringInterpreter(variant).run(data);

  const checkSingleQuoteValues = createValueChecker<TextNode, string>(
    createTextNodeFactory(TextNodeVariant.SINGLE_QUOTE),
    checkStringContent
  );

  const checkDoubleQuoteValues = createValueChecker<TextNode, string>(
    createTextNodeFactory(TextNodeVariant.DOUBLE_QUOTE),
    checkStringContent
  );

  const checkSingleQuoteSourceLength = createValueChecker<TextNode, string>(
    createTextNodeFactory(TextNodeVariant.SINGLE_QUOTE),
    checkSourceLength
  );

  const checkDoubleQuoteSourceLength = createValueChecker<TextNode, string>(
    createTextNodeFactory(TextNodeVariant.DOUBLE_QUOTE),
    checkSourceLength
  );

  it('parses single quoted strings', async () => {
    await checkSingleQuoteValues({
      // beginning of strings is handled by ValueInterpreter
      values: ["abc123'", "a b c d 1 2 34 '", '`"`\u200b\''],
      targets: ['abc123', 'a b c d 1 2 34 ', '`"`\u200b']
    });
  });

  it('parses double quoted strings', async () => {
    await checkDoubleQuoteValues({
      values: ['abc123"', 'a b c d 1 2 34 "', '`\'`\u200b"'],
      targets: ['abc123', 'a b c d 1 2 34 ', "`'`\u200b"]
    });
  });

  it('correctly handles escapes', async () => {
    await checkSingleQuoteValues({
      values: [
        "abc123\\''",
        "a b c \\'d 1 2 34 '",
        "1234567\\89acb'",
        '1234567\\"89acb\''
      ],
      targets: ["abc123'", "a b c 'd 1 2 34 ", '123456789acb', '1234567"89acb']
    });
    await checkDoubleQuoteValues({
      values: [
        'abc123\\""',
        'a b c \\"d 1 2 34 "',
        '1234567\\89acb"',
        '1234567\\"89acb"'
      ],
      targets: ['abc123"', 'a b c "d 1 2 34 ', '123456789acb', '1234567"89acb']
    });
  });

  it('correctly calculates sourceLength', async () => {
    let values = ["abc123'", "a b c d 1 2 34 '", '`"`\u200b\''];

    await checkSingleQuoteSourceLength({
      values,
      targets: values
    });

    values = values.map((data) =>
      data
        .split('"')
        .map((chunk) => chunk.replaceAll("'", '"'))
        .join("'")
    );

    await checkDoubleQuoteSourceLength({
      values,
      targets: values
    });
  });
});
