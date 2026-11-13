import { expect, test } from 'vitest';
const request = require('supertest')
const express = require('express')

const app = express();

test('Basic Test', () => {
  expect(2 + 2).toBe(4)
})
