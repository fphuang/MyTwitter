var assert = require('assert');
const bcrypt = require('bcrypt');

describe('#equal()', async () => {
    const plain = 'jb';
    const code = await bcrypt.hashSync(plain, 10);
    const result = await bcrypt.compareSync(plain, code);
    it("should be the same", () => {
        assert.equal(result, false);
    })
})

describe('Simple Math Test', () => {
    it('should return 9', () => {
           assert.equal(3 * 3, 9);
       });
   });



