import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeOlderMessages, dedupeOlderAgainstLive, toEpoch } from './messagePagination.ts';

type Msg = { _id: string; createdAt: string };

const getId = (m: Msg) => m._id;
const getTime = (m: Msg) => toEpoch(m.createdAt);
const ids = (list: Msg[]) => list.map((m) => m._id);

const msg = (id: string, minute: number): Msg => ({
  _id: id,
  createdAt: `2026-01-01T00:${String(minute).padStart(2, '0')}:00.000Z`,
});

test('mergeOlderMessages prepends older and returns ascending by time', () => {
  const existing = [msg('c', 3), msg('d', 4)];
  const incoming = [msg('a', 1), msg('b', 2)];
  const result = mergeOlderMessages(existing, incoming, getId, getTime);
  assert.deepEqual(ids(result), ['a', 'b', 'c', 'd']);
});

test('mergeOlderMessages dedupes overlap by id (51-message boundary case)', () => {
  const existing = [msg('b', 2), msg('c', 3)];
  const incoming = [msg('a', 1), msg('b', 2)];
  const result = mergeOlderMessages(existing, incoming, getId, getTime);
  assert.deepEqual(ids(result), ['a', 'b', 'c']);
  assert.equal(result.filter((m) => m._id === 'b').length, 1);
});

test('mergeOlderMessages with empty incoming keeps existing (sorted)', () => {
  const existing = [msg('b', 2), msg('a', 1)];
  const result = mergeOlderMessages(existing, [], getId, getTime);
  assert.deepEqual(ids(result), ['a', 'b']);
});

test('mergeOlderMessages sorts out-of-order incoming', () => {
  const result = mergeOlderMessages([], [msg('c', 3), msg('a', 1), msg('b', 2)], getId, getTime);
  assert.deepEqual(ids(result), ['a', 'b', 'c']);
});

test('mergeOlderMessages is idempotent when the same page is merged twice', () => {
  const existing = [msg('c', 3)];
  const incoming = [msg('a', 1), msg('b', 2)];
  const once = mergeOlderMessages(existing, incoming, getId, getTime);
  const twice = mergeOlderMessages(once, incoming, getId, getTime);
  assert.deepEqual(ids(twice), ['a', 'b', 'c']);
});

test('mergeOlderMessages does not mutate the input arrays', () => {
  const existing = [msg('c', 3)];
  const incoming = [msg('a', 1)];
  mergeOlderMessages(existing, incoming, getId, getTime);
  assert.deepEqual(ids(existing), ['c']);
  assert.deepEqual(ids(incoming), ['a']);
});

test('dedupeOlderAgainstLive removes ids already present in the live set', () => {
  const older = [msg('a', 1), msg('b', 2), msg('c', 3)];
  const live = [msg('c', 3), msg('d', 4), msg('e', 5)];
  assert.deepEqual(ids(dedupeOlderAgainstLive(older, live, getId)), ['a', 'b']);
});

test('dedupeOlderAgainstLive returns empty when every older message is live (small chat)', () => {
  const older = [msg('a', 1), msg('b', 2)];
  const live = [msg('a', 1), msg('b', 2), msg('c', 3)];
  assert.deepEqual(dedupeOlderAgainstLive(older, live, getId), []);
});

test('dedupeOlderAgainstLive keeps everything when there is no overlap', () => {
  const older = [msg('a', 1)];
  const live = [msg('b', 2)];
  assert.deepEqual(ids(dedupeOlderAgainstLive(older, live, getId)), ['a']);
});

test('toEpoch handles Date, ISO string, and invalid input', () => {
  assert.equal(toEpoch(new Date('2026-01-01T00:00:00.000Z')), Date.parse('2026-01-01T00:00:00.000Z'));
  assert.equal(toEpoch('2026-01-01T00:00:00.000Z'), Date.parse('2026-01-01T00:00:00.000Z'));
  assert.equal(toEpoch('not-a-date'), 0);
  assert.equal(toEpoch(undefined), 0);
  assert.equal(toEpoch(null), 0);
});
