import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { pseudonym, secretsMatch } from "../security"

describe("secretsMatch", () => {
  const secret = "s3cret-value_0123456789abcdef"

  it("accepts only the exact secret", () => {
    assert.equal(secretsMatch(secret, secret), true)
    assert.equal(secretsMatch(secret + "x", secret), false)
    assert.equal(secretsMatch(secret.slice(0, -1), secret), false)
    assert.equal(secretsMatch(secret.toUpperCase(), secret), false)
    assert.equal(secretsMatch("", secret), false)
    assert.equal(secretsMatch(null, secret), false)
    assert.equal(secretsMatch(undefined, secret), false)
  })

  it("never accepts anything when no secret is configured", () => {
    assert.equal(secretsMatch("", ""), false)
    assert.equal(secretsMatch("anything", ""), false)
  })
})

describe("pseudonym", () => {
  it("is stable, keyed and does not contain the id", () => {
    const a = pseudonym("secret-one", 424242424)
    assert.equal(a, pseudonym("secret-one", 424242424))
    assert.notEqual(a, pseudonym("secret-two", 424242424))
    assert.notEqual(a, pseudonym("secret-one", 424242425))
    assert.match(a, /^[0-9a-f]{24}$/)
    assert.ok(!a.includes("424242424"))
  })
})
