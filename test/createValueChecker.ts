export default function createValueChecker<ResultType, TargetType>(
  create: (source: string) => Promise<ResultType>,
  check: (result: ResultType, target: TargetType) => void
) {
  return async function checkValues(tests: {
    values: string[];
    targets: TargetType[];
  }) {
    const results: Array<Promise<[ResultType, TargetType]>> = [];

    tests.values.forEach((value, i) => {
      results.push((async () => [await create(value), tests.targets[i]!])());
    });

    for (const [result, target] of await Promise.all(results)) {
      check(result, target);
    }
  };
}
