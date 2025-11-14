/**
 * Stripe fee calculation utilities
 * Standard Stripe fees: 2.9% + $0.30 per transaction
 */

export const STRIPE_PERCENTAGE_FEE = 0.029 // 2.9%
export const STRIPE_FIXED_FEE = 0.30 // $0.30

/**
 * Calculate Stripe processing fee for a given amount
 * @param amount The transaction amount in dollars
 * @returns The Stripe fee in dollars
 */
export function calculateStripeFee(amount: number): number {
  return (amount * STRIPE_PERCENTAGE_FEE) + STRIPE_FIXED_FEE
}

/**
 * Calculate the amount to charge when customer pays the fees
 * This adds fees on top of the base amount
 * @param baseAmount The base ticket/order amount in dollars
 * @param platformFee The platform fee in dollars
 * @returns Object with breakdown of charges
 */
export function calculateCustomerPaysAmount(
  baseAmount: number,
  platformFee: number
): {
  subtotal: number
  stripeFee: number
  platformFee: number
  total: number
} {
  const subtotal = baseAmount
  const stripeFee = calculateStripeFee(baseAmount + platformFee)
  const total = baseAmount + platformFee + stripeFee

  return {
    subtotal,
    stripeFee,
    platformFee,
    total
  }
}

/**
 * Calculate the amount when business pays the fees
 * The customer pays the base amount, fees are deducted from business revenue
 * @param baseAmount The base ticket/order amount in dollars (what customer pays)
 * @param platformFee The platform fee in dollars
 * @returns Object with breakdown of charges
 */
export function calculateBusinessPaysAmount(
  baseAmount: number,
  platformFee: number
): {
  subtotal: number
  stripeFee: number
  platformFee: number
  total: number
  businessReceives: number
} {
  const subtotal = baseAmount
  const stripeFee = calculateStripeFee(baseAmount)
  const total = baseAmount
  const businessReceives = baseAmount - stripeFee - platformFee

  return {
    subtotal,
    stripeFee,
    platformFee,
    total,
    businessReceives
  }
}

/**
 * Calculate the amount the connected account receives after all fees
 * @param chargedAmount The total amount charged to the customer in dollars
 * @param applicationFee The platform fee in dollars
 * @returns The amount the business receives in dollars
 */
export function calculateBusinessPayout(
  chargedAmount: number,
  applicationFee: number
): number {
  const stripeFee = calculateStripeFee(chargedAmount)
  return chargedAmount - stripeFee - applicationFee
}
