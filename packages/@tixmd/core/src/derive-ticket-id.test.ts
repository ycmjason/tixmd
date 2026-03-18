import { describe, expect, test } from 'vitest';
import { deriveTicketId } from './derive-ticket-id.ts';

describe('deriveTicketId', () => {
  test('simple title', () => {
    expect(deriveTicketId('Fix login bug')).toBe('fix-login-bug');
  });

  test('title with special characters', () => {
    expect(deriveTicketId('Add /tixmd-new — create tickets!')).toBe('add-tixmd-new-create-tickets');
  });

  test('title with multiple spaces', () => {
    expect(deriveTicketId('  lots   of   spaces  ')).toBe('lots-of-spaces');
  });

  test('title with numbers', () => {
    expect(deriveTicketId('Step 1: setup auth')).toBe('step-1-setup-auth');
  });

  test('already kebab-case', () => {
    expect(deriveTicketId('already-kebab-case')).toBe('already-kebab-case');
  });

  test('title with mixed case', () => {
    expect(deriveTicketId('MyComponent Setup')).toBe('mycomponent-setup');
  });
});
