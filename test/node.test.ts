import { NumberNode, BaseNode } from '../src/Node';

function testNodeJSON(NodeType: typeof BaseNode) {
  class Node extends NodeType {}

  const json = new Node(999, null).toJSON();
  expect(json).toHaveProperty('parent', null);
  expect(json).toHaveProperty('meta');
  expect(json).toHaveProperty('meta.sourceLocation', 999);
}

describe(NumberNode, () => {
  it('successfully converts to JSON', () => {
    testNodeJSON(NumberNode);
  });
});
