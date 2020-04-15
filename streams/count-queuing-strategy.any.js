// META: global=worker,jsshell
'use strict';

const highWaterMarkConversions = new Map([
  [-Infinity, -Infinity],
  [NaN, NaN],
  ['foo', NaN],
  ['0', 0],
  [{}, NaN],
  [() => {}, NaN]
]);

test(() => {

  new CountQueuingStrategy({ highWaterMark: 4 });

}, 'Can construct a CountQueuingStrategy with a valid high water mark');

test(() => {

  for (const [input, output] of highWaterMarkConversions.entries()) {
    const strategy = new CountQueuingStrategy({ highWaterMark: input });
    assert_equals(strategy.highWaterMark, output, `${input} gets set correctly`);
  }

}, 'Values are converted per the unrestricted double rules (but not further validated)');

test(() => {

  const highWaterMark = 1;
  const highWaterMarkObjectGetter = {
    get highWaterMark() { return highWaterMark; }
  };
  const error = new Error('wow!');
  const highWaterMarkObjectGetterThrowing = {
    get highWaterMark() { throw error; }
  };

  assert_throws_js(TypeError, () => new CountQueuingStrategy(), 'construction fails with undefined');
  assert_throws_js(TypeError, () => new CountQueuingStrategy(null), 'construction fails with null');
  assert_throws_js(TypeError, () => new CountQueuingStrategy(true), 'construction fails with true');
  assert_throws_js(TypeError, () => new CountQueuingStrategy(5), 'construction fails with 5');
  assert_throws_js(TypeError, () => new CountQueuingStrategy({}), 'construction fails with {}');
  assert_throws_js(Error, () => new CountQueuingStrategy(highWaterMarkObjectGetterThrowing),
    'construction fails with an object with a throwing highWaterMark getter');

  assert_equals((new CountQueuingStrategy(highWaterMarkObjectGetter)).highWaterMark, 1);

}, 'CountQueuingStrategy constructor behaves as expected with strange arguments');


test(() => {

  const thisValue = null;
  const chunk = {
    get byteLength() {
      throw new TypeError('shouldn\'t be called');
    }
  };

  assert_equals(CountQueuingStrategy.prototype.size.call(thisValue, chunk), 1);

}, 'CountQueuingStrategy.prototype.size should work generically on its this and its arguments');

test(() => {

  const size = 1024;
  const chunk = { byteLength: size };
  const chunkGetter = {
    get byteLength() { return size; }
  };
  const error = new Error('wow!');
  const chunkGetterThrowing = {
    get byteLength() { throw error; }
  };

  assert_equals(CountQueuingStrategy.prototype.size(), 1, 'size returns 1 with undefined');
  assert_equals(CountQueuingStrategy.prototype.size(null), 1, 'size returns 1 with null');
  assert_equals(CountQueuingStrategy.prototype.size('potato'), 1, 'size returns 1 with non-object type');
  assert_equals(CountQueuingStrategy.prototype.size({}), 1, 'size returns 1 with empty object');
  assert_equals(CountQueuingStrategy.prototype.size(chunk), 1, 'size returns 1 with a chunk');
  assert_equals(CountQueuingStrategy.prototype.size(chunkGetter), 1, 'size returns 1 with chunk getter');
  assert_equals(CountQueuingStrategy.prototype.size(chunkGetterThrowing), 1,
    'size returns 1 with chunk getter that throws');

}, 'CountQueuingStrategy size behaves as expected with strange arguments');

test(() => {

  for (const [input, output] of highWaterMarkConversions.entries()) {
    const strategy = new CountQueuingStrategy({ highWaterMark: 0 });
    strategy.highWaterMark = input;
    assert_equals(strategy.highWaterMark, output, `${input} gets set correctly`);
  }

}, 'CountQueuingStrategy\'s highWaterMark property setter does unrestricted double conversions');

class SubClass extends CountQueuingStrategy {
  size() {
    return 2;
  }

  subClassMethod() {
    return true;
  }
}

test(() => {

  const sc = new SubClass({ highWaterMark: 77 });
  assert_equals(sc.constructor.name, 'SubClass',
                'constructor.name should be correct');
  assert_equals(sc.highWaterMark, 77,
                'highWaterMark should come from the parent class');
  assert_equals(sc.size(), 2,
                'size() on the subclass should override the parent');
  assert_true(sc.subClassMethod(), 'subClassMethod() should work');

}, 'subclassing CountQueuingStrategy should work correctly');
