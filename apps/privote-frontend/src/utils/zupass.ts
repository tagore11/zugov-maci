/**
 * Zupass utility functions for proof generation and witness extraction
 * Based on MACI Platform implementation
 */

import { ZKEdDSAEventTicketPCD, ZKEdDSAEventTicketPCDClaim } from '@pcd/zk-eddsa-event-ticket-pcd';
import { uuidToBigInt } from '@pcd/util';
import { sha256 } from 'js-sha256';

// Baby Jubjub field modulus - 1 (used as "not revealed" indicator)
const BABY_JUB_NEGATIVE_ONE = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495616');

// Static nullifier for ticket PCDs
const STATIC_TICKET_PCD_NULLIFIER = BigInt(
  '21888242871839275222246405745257275088548364400416034343698204186575808495616'
);

/**
 * Converts a hex string to BigInt
 */
export function hexToBigInt(hex: string): bigint {
  return BigInt('0x' + hex);
}

/**
 * Converts a string array to BigInt array
 */
export function convertStringArrayToBigIntArray(arr: string[]): bigint[] {
  return arr.map(s => BigInt(s));
}

/**
 * Generates a SNARK-compatible message hash from a string
 * Uses SHA-256 and converts to BigInt
 */
export function generateSnarkMessageHash(message: string | undefined): string {
  if (!message) return BABY_JUB_NEGATIVE_ONE.toString();

  const hash = sha256(message);
  return hexToBigInt(hash).toString();
}

/**
 * Converts valid event IDs to SNARK input format
 * Pads to 20 values with -1 for unused slots
 */
export function snarkInputForValidEventIds(validEventIds: string[] | undefined): string[] {
  const result: string[] = [];
  const negOne = BABY_JUB_NEGATIVE_ONE.toString();

  if (validEventIds && validEventIds.length > 0) {
    // Add actual event IDs
    for (const eventId of validEventIds.slice(0, 20)) {
      result.push(eventId);
    }
  }

  // Pad remaining slots with -1
  while (result.length < 20) {
    result.push(negOne);
  }

  return result;
}

/**
 * Extracts public signals from a Zupass ticket claim
 * Returns 38 values that will be verified on-chain
 */
export function publicSignalsFromClaim(claim: ZKEdDSAEventTicketPCDClaim): string[] {
  const ret: string[] = [];
  const negOne = BABY_JUB_NEGATIVE_ONE.toString();

  // Outputs (11 values) - ticket information
  // Convert UUIDs to BigInt strings
  const ticketIdStr = claim.partialTicket.ticketId
    ? claim.partialTicket.ticketId.includes('-')
      ? uuidToBigInt(claim.partialTicket.ticketId).toString()
      : claim.partialTicket.ticketId
    : negOne;
  const eventIdStr = claim.partialTicket.eventId
    ? claim.partialTicket.eventId.includes('-')
      ? uuidToBigInt(claim.partialTicket.eventId).toString()
      : claim.partialTicket.eventId
    : negOne;
  const productIdStr = claim.partialTicket.productId
    ? claim.partialTicket.productId.includes('-')
      ? uuidToBigInt(claim.partialTicket.productId).toString()
      : claim.partialTicket.productId
    : negOne;

  ret.push(ticketIdStr);
  ret.push(eventIdStr);
  ret.push(productIdStr);
  ret.push(claim.partialTicket.timestampConsumed?.toString() || negOne);
  ret.push(claim.partialTicket.timestampSigned?.toString() || negOne);
  ret.push(claim.partialTicket.attendeeSemaphoreId || negOne);
  ret.push(claim.partialTicket.isConsumed ? '1' : negOne);
  ret.push(claim.partialTicket.isRevoked ? '1' : negOne);
  ret.push(claim.partialTicket.ticketCategory?.toString() || negOne);
  ret.push(generateSnarkMessageHash(claim.partialTicket.attendeeEmail) || negOne);
  ret.push(generateSnarkMessageHash(claim.partialTicket.attendeeName) || negOne);

  // Reserved field (1 value)
  ret.push(negOne);

  // Nullifier hash (1 value)
  ret.push(claim.nullifierHash || negOne);

  // Public inputs (25 values)
  ret.push(hexToBigInt(claim.signer[0]).toString()); // Signer public key part 1
  ret.push(hexToBigInt(claim.signer[1]).toString()); // Signer public key part 2

  // Valid event IDs (20 values)
  for (const eventId of snarkInputForValidEventIds(claim.validEventIds)) {
    ret.push(eventId);
  }

  ret.push(claim.validEventIds !== undefined ? '1' : '0'); // checkValidEventIds flag
  ret.push(claim.externalNullifier?.toString() || STATIC_TICKET_PCD_NULLIFIER.toString());
  ret.push(claim.watermark); // User's wallet address

  return ret; // Total: 38 values
}

/**
 * Generates witness data from a Zupass PCD for on-chain verification
 * Extracts proof components and public signals
 */
export function generateWitness(pcd: ZKEdDSAEventTicketPCD) {
  // Extract Groth16 proof components
  const _pA = pcd.proof.pi_a.slice(0, 2);
  const _pB = [pcd.proof.pi_b[0].slice(0).reverse(), pcd.proof.pi_b[1].slice(0).reverse()];
  const _pC = pcd.proof.pi_c.slice(0, 2);

  // Extract public signals (38 values)
  const publicSignals = publicSignalsFromClaim(pcd.claim);
  const _pubSignals = convertStringArrayToBigIntArray(publicSignals);

  return { _pA, _pB, _pC, _pubSignals };
}

/**
 * Type for EdDSA public key (2-part hex string array)
 */
export type EdDSAPublicKey = [string, string];
