import { adjustmentGroup, carc, claimStatus, filingIndicator, paymentMethod } from "../codelists/remittance";
import type { TransactionSchema } from "./types";

/**
 * The 835 005010X221A1 (Health Care Claim Payment/Advice) structure, modeled as
 * data (spec §11 — new transaction sets reuse the same TransactionSchema shape).
 * Drives the developer view and future reference pages; the readable transform
 * reads segments directly. All names are our own plain-English wording.
 */
export const x835: TransactionSchema = {
  code: "835",
  version: "005010X221A1",
  header: [
    {
      tag: "ST",
      name: "Transaction set start",
      required: true,
      elements: [
        { ref: "143", name: "Transaction set code" },
        { ref: "329", name: "Transaction set control number" },
      ],
    },
    {
      tag: "BPR",
      name: "Payment summary",
      required: true,
      elements: [
        { ref: "305", name: "Payment handling" },
        { ref: "782", name: "Total paid amount", format: "num" },
        { ref: "478", name: "Credit or debit" },
        { ref: "591", name: "Payment method", codes: paymentMethod },
        { ref: "812", name: "Payment format" },
        { ref: "506", name: "Sender bank routing" },
        { ref: "569", name: "Sender account" },
        { ref: "508", name: "Sender account number" },
        { ref: "509", name: "Originating company id" },
        { ref: "510", name: "Receiver bank routing" },
        { ref: "508", name: "Receiver account number" },
        { ref: "373", name: "Payment effective date", format: "date8" },
      ],
    },
    {
      tag: "TRN",
      name: "Reassociation trace",
      required: true,
      elements: [
        { ref: "481", name: "Trace type" },
        { ref: "127", name: "Check or EFT number" },
        { ref: "509", name: "Payer identifier" },
      ],
    },
    {
      tag: "DTM",
      name: "Production date",
      elements: [
        { ref: "374", name: "Date qualifier" },
        { ref: "373", name: "Date", format: "date8" },
      ],
    },
  ],
  loops: [
    {
      id: "1000A",
      name: "Payer",
      trigger: "N1*PR",
      repeat: false,
      segments: [
        {
          tag: "N1",
          name: "Payer name",
          elements: [
            { ref: "98", name: "Entity role" },
            { ref: "93", name: "Payer name" },
          ],
        },
      ],
    },
    {
      id: "1000B",
      name: "Payee",
      trigger: "N1*PE",
      repeat: false,
      segments: [
        {
          tag: "N1",
          name: "Payee name",
          elements: [
            { ref: "98", name: "Entity role" },
            { ref: "93", name: "Payee name" },
            { ref: "66", name: "Id qualifier" },
            { ref: "67", name: "Payee id" },
          ],
        },
      ],
    },
    {
      id: "2000",
      name: "Header number",
      trigger: "LX",
      repeat: true,
      segments: [{ tag: "LX", name: "Header number", elements: [{ ref: "554", name: "Number" }] }],
      loops: [
        {
          id: "2100",
          name: "Claim payment",
          trigger: "CLP",
          repeat: true,
          segments: [
            {
              tag: "CLP",
              name: "Claim payment",
              required: true,
              elements: [
                { ref: "1028", name: "Claim id" },
                { ref: "1029", name: "Claim status", codes: claimStatus },
                { ref: "782", name: "Total charge", format: "num" },
                { ref: "782", name: "Total paid", format: "num" },
                { ref: "782", name: "Patient responsibility", format: "num" },
                { ref: "1032", name: "Coverage type", codes: filingIndicator },
                { ref: "127", name: "Payer claim control number" },
              ],
            },
            {
              tag: "NM1",
              name: "Patient",
              elements: [
                { ref: "98", name: "Entity role" },
                { ref: "1065", name: "Person or organization" },
                { ref: "1035", name: "Last name" },
                { ref: "1036", name: "First name" },
                { ref: "1037", name: "Middle name" },
                { ref: "1038", name: "Prefix" },
                { ref: "1039", name: "Suffix" },
                { ref: "66", name: "Id qualifier" },
                { ref: "67", name: "Patient id" },
              ],
            },
            {
              tag: "CAS",
              name: "Claim adjustment",
              elements: [
                { ref: "1033", name: "Adjustment group", codes: adjustmentGroup },
                { ref: "1034", name: "Reason code", codes: carc },
                { ref: "782", name: "Amount", format: "num" },
              ],
            },
            {
              tag: "DTM",
              name: "Claim date",
              elements: [
                { ref: "374", name: "Date qualifier" },
                { ref: "373", name: "Date", format: "date8" },
              ],
            },
          ],
          loops: [
            {
              id: "2110",
              name: "Service payment",
              trigger: "SVC",
              repeat: true,
              segments: [
                {
                  tag: "SVC",
                  name: "Service payment",
                  elements: [
                    { ref: "C003", name: "Procedure" },
                    { ref: "782", name: "Charge", format: "num" },
                    { ref: "782", name: "Paid", format: "num" },
                    { ref: "234", name: "Revenue code" },
                    { ref: "380", name: "Units", format: "num" },
                  ],
                },
                {
                  tag: "CAS",
                  name: "Service adjustment",
                  elements: [
                    { ref: "1033", name: "Adjustment group", codes: adjustmentGroup },
                    { ref: "1034", name: "Reason code", codes: carc },
                    { ref: "782", name: "Amount", format: "num" },
                  ],
                },
                {
                  tag: "LQ",
                  name: "Remark code",
                  elements: [
                    { ref: "1270", name: "Code list" },
                    { ref: "1271", name: "Remark code" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
