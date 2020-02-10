const assert = require('chai').assert;
const Node = require('../src/node')();
const tools = require('./tools');
const fse = require('fs-extra');

describe('Node', () => {
  let node;

  describe('instance creation', () => {
    it('should not create an instance because of port', async () => {
      const options = await tools.createNodeOptions({ port: '' });
      assert.throws(() => new Node(options));
    });

    it('should create an instance', async() => { 
      const options = await tools.createNodeOptions();
      assert.doesNotThrow(() => node = new Node(options));
    });
  });

  describe('.init()', () => {
    it('should not throw an exception', async () => {
      await node.init();
    });

    it('should create the db file', async () => {
      assert.isTrue(await fse.exists(tools.getDbFilePath(node.port)));
    });
  });

  describe('.getValueGivenNetworkSize()', () => {
    let networkSize;

    before(async () => {
      for(let i = 0; i < 9; i++) {
        await node.db.addMaster(`localhost:${i + 1}`, 1);
      }

      networkSize = await node.getNetworkSize();
    });

    after(async () => {
      await node.db.removeMasters();
    });

    it('should return the specified option value', async () => {
      const val = 2;
      assert.equal(await node.getValueGivenNetworkSize(val), val);
    });

    it('should return the percentage', async () => {
      assert.equal(await node.getValueGivenNetworkSize('50%'), Math.ceil(networkSize / 2));
    });

    it('should return sqrt', async () => {
      assert.equal(await node.getValueGivenNetworkSize('auto'), Math.ceil(Math.sqrt(networkSize)));
    });

    it('should return the network size', async () => {
      assert.equal(await node.getValueGivenNetworkSize(networkSize + 10), networkSize);
    });
  });

  describe('.deinit()', () => {
    it('should not throw an exception', async () => {
      await node.deinit();
    });

    it('should not remove the db file', async () => {
      assert.isTrue(await fse.exists(tools.getDbFilePath(node.port)));
    });
  });

  describe('reinitialization', () => {
    it('should not throw an exception', async () => {
      await node.init();
    });

    it('should create the db file', async () => {
      assert.isTrue(await fse.exists(tools.getDbFilePath(node.port)));
    });
  });

  describe('.destroy()', () => {
    it('should not throw an exception', async () => {
      await node.destroy();
    });

    it('should remove the db file', async () => {
      assert.isFalse(await fse.exists(tools.getDbFilePath(node.port)));
    });
  });
});