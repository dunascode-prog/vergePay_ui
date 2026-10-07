# Legal documents

Customer-facing terms, kept as HTML (the source) and published as PDF in `public/legal/` for download.

| Document | Source | Published | API version |
|---|---|---|---|
| Loan Terms and Conditions | `loan-terms-v1.html` | `public/legal/vergepay-loan-terms-v1.pdf` | `loan-terms-v1` |

**Changing the loan terms**
1. Copy `loan-terms-v1.html` to `loan-terms-v2.html` and edit it. Keep v1: existing loans stay on the terms their borrowers agreed to.
2. Print it to `public/legal/vergepay-loan-terms-v2.pdf` (A4, background graphics on). Any Chromium browser's "Save as PDF" works.
3. Update `LOAN_TERMS_PDF` in `lib/loans.ts`.
4. In the API, bump `LOAN_TERMS_VERSION` (and `LOAN_TERMS_EFFECTIVE`) in `services/loanTerms.js`. Applications naming the old version are then refused until the borrower agrees to the new terms.

The numbers in the terms (grace days, late fee and its minimum, default threshold, minimum payment) must match the API's `env.loans` settings. Changing any of them means a new version.

These documents are written in plain language from how the product actually works. **Have them reviewed by a lawyer before real customers rely on them.**
