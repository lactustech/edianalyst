import { diagnosisQualifier, payerResponsibility, placeOfService } from "../codelists/claim837";
import { filingIndicator } from "../codelists/remittance";
import { relationship } from "../codelists/relationship";
import type { TransactionSchema } from "./types";

/**
 * The 837P 005010X222A1 (Health Care Claim — Professional) structure, modeled as
 * data (spec §11). The transaction is hierarchical (HL loops): billing provider →
 * subscriber → optional patient → claim → service lines. The readable transform
 * walks that hierarchy; this schema documents it. Names are our own wording.
 */
export const x837p: TransactionSchema = {
  code: "837",
  version: "005010X222A1",
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
      tag: "BHT",
      name: "Beginning of the claim batch",
      required: true,
      elements: [
        { ref: "1005", name: "Hierarchy structure" },
        { ref: "353", name: "Purpose" },
        { ref: "127", name: "Batch reference" },
        { ref: "373", name: "Created date", format: "date8" },
        { ref: "337", name: "Created time" },
        { ref: "640", name: "Claim or encounter" },
      ],
    },
  ],
  loops: [
    {
      id: "2000A",
      name: "Billing provider",
      trigger: "HL*20",
      repeat: true,
      segments: [{ tag: "HL", name: "Hierarchy", elements: [{ ref: "628", name: "Hierarchy id" }] }],
      loops: [
        {
          id: "2010AA",
          name: "Billing provider name",
          trigger: "NM1*85",
          repeat: false,
          segments: [
            {
              tag: "NM1",
              name: "Billing provider",
              elements: [
                { ref: "98", name: "Entity role" },
                { ref: "1065", name: "Person or organization" },
                { ref: "1035", name: "Name" },
                { ref: "1036", name: "First name" },
                { ref: "1037", name: "Middle name" },
                { ref: "1038", name: "Prefix" },
                { ref: "1039", name: "Suffix" },
                { ref: "66", name: "Id qualifier" },
                { ref: "67", name: "Provider NPI" },
              ],
            },
          ],
        },
        {
          id: "2000B",
          name: "Subscriber",
          trigger: "HL*22",
          repeat: true,
          segments: [
            {
              tag: "SBR",
              name: "Subscriber",
              elements: [
                { ref: "1138", name: "Payer responsibility", codes: payerResponsibility },
                { ref: "1069", name: "Relationship to subscriber", codes: relationship },
                { ref: "127", name: "Group number" },
                { ref: "93", name: "Group name" },
                { ref: "1032", name: "Insurance type" },
                { ref: "1143", name: "" },
                { ref: "1073", name: "" },
                { ref: "584", name: "" },
                { ref: "1032", name: "Claim filing indicator", codes: filingIndicator },
              ],
            },
          ],
          loops: [
            {
              id: "2010BA",
              name: "Subscriber name",
              trigger: "NM1*IL",
              repeat: false,
              segments: [
                {
                  tag: "NM1",
                  name: "Subscriber",
                  elements: [
                    { ref: "98", name: "Entity role" },
                    { ref: "1065", name: "Person or organization" },
                    { ref: "1035", name: "Last name" },
                    { ref: "1036", name: "First name" },
                    { ref: "1037", name: "Middle name" },
                    { ref: "1038", name: "Prefix" },
                    { ref: "1039", name: "Suffix" },
                    { ref: "66", name: "Id qualifier" },
                    { ref: "67", name: "Member id" },
                  ],
                },
              ],
            },
            {
              id: "2010BB",
              name: "Payer name",
              trigger: "NM1*PR",
              repeat: false,
              segments: [
                {
                  tag: "NM1",
                  name: "Payer",
                  elements: [
                    { ref: "98", name: "Entity role" },
                    { ref: "1065", name: "Person or organization" },
                    { ref: "1035", name: "Payer name" },
                  ],
                },
              ],
            },
            {
              id: "2300",
              name: "Claim",
              trigger: "CLM",
              repeat: true,
              segments: [
                {
                  tag: "CLM",
                  name: "Claim",
                  required: true,
                  elements: [
                    { ref: "1028", name: "Patient control number" },
                    { ref: "782", name: "Total charge", format: "num" },
                  ],
                },
                {
                  tag: "HI",
                  name: "Diagnoses",
                  elements: [{ ref: "C022", name: "Diagnosis", codes: diagnosisQualifier }],
                },
              ],
              loops: [
                {
                  id: "2400",
                  name: "Service line",
                  trigger: "LX",
                  repeat: true,
                  segments: [
                    { tag: "LX", name: "Line number", elements: [{ ref: "554", name: "Number" }] },
                    {
                      tag: "SV1",
                      name: "Professional service",
                      elements: [
                        { ref: "C003", name: "Procedure" },
                        { ref: "782", name: "Charge", format: "num" },
                        { ref: "355", name: "Unit basis" },
                        { ref: "380", name: "Units", format: "num" },
                        { ref: "1331", name: "Place of service", codes: placeOfService },
                        { ref: "1365", name: "" },
                        { ref: "C004", name: "Diagnosis pointers" },
                      ],
                    },
                    {
                      tag: "DTP",
                      name: "Service date",
                      elements: [
                        { ref: "374", name: "Date qualifier" },
                        { ref: "1250", name: "Date format" },
                        { ref: "1251", name: "Date", format: "date8" },
                      ],
                    },
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
