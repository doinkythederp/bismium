# bismium

An easy to learn programming language designed for templating, based on [oxxgen-cc](https://github.com/doinkythederp/oxxgen-cc).

## Get Started

Bismuim is a templating language, meaning that a source file is used to "fill in the blanks."
Source code written in Bismium use the extension `.bis`.

### Syntax

Here's an example, `warranty.bis`, which describes an (un)helpful message sent over text:

<!-- TODO: update once syntax & API are finished -->

```
{! This file could be called "warrenty.bis". }
Hello, {$name}!
We've been trying to contact you for {random} days
about your {$vehicleType}'s extended warranty!
```

On the first line, we see a comment containing some information about what's happening:

`{! This file could be called "warrenty.bis". }`

Comments are completely removed during processing and don't have special meaning to the interpreter.

On the second line, there is a variable.

`Hello, {$name}!`

Their values are supplied during processing and can be accessed using a `$`, then the name of the variable. For example, if `name` was set to `foobar`, this line would output `Hello, foobar!`.

Finally, on the last line, we are introduced to functions.

`We've been trying to contact you for {random} days ...`

These can have a different output each time they're run. They can also optionally use one or more inputs to determine their output. Functions are run by entering their name without a preceeding `$`.

### Processing API

Once your template file has been written, you'll need to run it. Bismium has a JavaScript/TypeScript api which can be used to process files:

```ts
import * as Bismium from '@doinkythederp/bismium';
import * as fs from 'fs/promises';
import { stdout } from 'process';

// read source code
const sourceFile = await fs.readFile('warranty.bis');

// interpret into syntax tree
const interpreted = Bismium.interpret(sourcefile);

// run file to produce output
const runtime = new Bismium.Runtime({
  context: new Bismium.Context({
    name: 'Bismium',
    vehicleType: 'car',
    random() {
      return Math.ceil(Math.random() * 365);
    }
  })
});

let output = await runtime.start(interpreted);
// remove dangling newlines
output = output.trim();

stdout.write(output);
```

The above should produce an output similar to the following:

```
Hello, Bismium!
We've been trying to contact you for 56 days
about your car's extended warranty!
```

<!-- TODO: CLI interface? -->
