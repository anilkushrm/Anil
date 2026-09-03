import assert from "node:assert/strict";
import test from "node:test";
import { isQuietTime, isValidTimeZone, nextAllowedTime, validateTriggerConfig } from "./automation-schedule.ts";

test("quiet hours support overnight windows in a workspace timezone", () => {
  const lateEvening = new Date("2026-08-29T17:00:00.000Z"); // 22:30 Asia/Kolkata
  const businessTime = new Date("2026-08-29T07:00:00.000Z"); // 12:30 Asia/Kolkata
  assert.equal(isQuietTime(lateEvening, "Asia/Kolkata", "21:00", "09:00"), true);
  assert.equal(isQuietTime(businessTime, "Asia/Kolkata", "21:00", "09:00"), false);
});

test("next allowed time defers execution until quiet hours end", () => {
  const start = new Date("2026-08-29T17:00:00.000Z");
  const allowed = nextAllowedTime(start, "Asia/Kolkata", "21:00", "09:00");
  assert.equal(isQuietTime(allowed, "Asia/Kolkata", "21:00", "09:00"), false);
  assert.ok(allowed > start);
});

test("automatic trigger activation requires a valid condition", () => {
  assert.equal(validateTriggerConfig("manual", ""), null);
  assert.match(validateTriggerConfig("new_lead", "") ?? "", /require/i);
  assert.equal(validateTriggerConfig("new_lead", "any"), null);
  assert.match(validateTriggerConfig("no_reply", "soon") ?? "", /minutes/i);
  assert.equal(validateTriggerConfig("no_reply", "60"), null);
  assert.equal(validateTriggerConfig("stage_changed", "qualified"), null);
});

test("timezone validation rejects malformed IANA names", () => {
  assert.equal(isValidTimeZone("Asia/Kolkata"), true);
  assert.equal(isValidTimeZone("UTC"), true);
  assert.equal(isValidTimeZone("Mars/Olympus_Mons"), false);
});