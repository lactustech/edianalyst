import { benefitStatus, coverageLevel, gender, maintenanceReason, transactionPurpose } from "../codelists/misc";
import { dtpQualifiers } from "../codelists/dtpQualifiers";
import { insuranceLine } from "../codelists/insuranceLine";
import { maintenanceType } from "../codelists/maintenanceType";
import { relationship } from "../codelists/relationship";
import type { TransactionSchema } from "./types";

/**
 * The 834 005010X220A1 (Benefit Enrollment and Maintenance) structure, modeled
 * as data (spec §4.2). This drives both the readable transform and the future
 * developer-view loop nesting / SEO reference pages. All names are our own
 * plain-English wording; the `codes` maps come from /lib/codelists.
 */
export const x834: TransactionSchema = {
  code: "834",
  version: "005010X220A1",
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
      tag: "BGN",
      name: "Beginning of the file",
      required: true,
      elements: [
        { ref: "353", name: "Purpose code" },
        { ref: "127", name: "File reference number" },
        { ref: "373", name: "File creation date", format: "date8" },
        { ref: "337", name: "File creation time" },
        { ref: "623", name: "Time zone" },
        { ref: "127", name: "Original file reference" },
        { ref: "640", name: "Action requested" },
        { ref: "306", name: "What this file is for", codes: transactionPurpose },
      ],
    },
    {
      tag: "REF",
      name: "Master policy number",
      elements: [
        { ref: "128", name: "Reference type" },
        { ref: "127", name: "Master policy number" },
      ],
    },
    {
      tag: "DTP",
      name: "File effective date",
      elements: [
        { ref: "374", name: "Date qualifier", codes: dtpQualifiers },
        { ref: "1250", name: "Date format" },
        { ref: "1251", name: "File effective date", format: "date8" },
      ],
    },
    {
      tag: "QTY",
      name: "Control totals",
      elements: [
        { ref: "673", name: "Quantity qualifier" },
        { ref: "380", name: "Quantity", format: "num" },
      ],
    },
  ],
  loops: [
    {
      id: "1000A",
      name: "Sponsor",
      trigger: "N1*P5",
      repeat: false,
      segments: [
        {
          tag: "N1",
          name: "Sponsor name",
          elements: [
            { ref: "98", name: "Entity role" },
            { ref: "93", name: "Sponsor name" },
            { ref: "66", name: "Id qualifier" },
            { ref: "67", name: "Sponsor id" },
          ],
        },
      ],
    },
    {
      id: "1000B",
      name: "Payer",
      trigger: "N1*IN",
      repeat: false,
      segments: [
        {
          tag: "N1",
          name: "Payer name",
          elements: [
            { ref: "98", name: "Entity role" },
            { ref: "93", name: "Payer name" },
            { ref: "66", name: "Id qualifier" },
            { ref: "67", name: "Payer id" },
          ],
        },
      ],
    },
    {
      id: "2000",
      name: "Member",
      trigger: "INS",
      repeat: true,
      segments: [
        {
          tag: "INS",
          name: "Member enrollment status",
          required: true,
          elements: [
            { ref: "1073", name: "Is this the subscriber?" },
            { ref: "1069", name: "Relationship to subscriber", codes: relationship },
            { ref: "875", name: "Type of change", codes: maintenanceType },
            { ref: "1203", name: "Reason for the change", codes: maintenanceReason },
            { ref: "1216", name: "Benefit status", codes: benefitStatus },
            { ref: "1218", name: "Medicare status" },
            { ref: "584", name: "Employment status" },
            { ref: "1220", name: "Student status" },
          ],
        },
        {
          tag: "REF",
          name: "Member reference ids",
          elements: [
            { ref: "128", name: "Reference type" },
            { ref: "127", name: "Reference value" },
          ],
        },
        {
          tag: "DTP",
          name: "Member dates",
          elements: [
            { ref: "374", name: "Date qualifier", codes: dtpQualifiers },
            { ref: "1250", name: "Date format" },
            { ref: "1251", name: "Date value", format: "date8" },
          ],
        },
      ],
      loops: [
        {
          id: "2100A",
          name: "Member name",
          trigger: "NM1*IL",
          repeat: false,
          segments: [
            {
              tag: "NM1",
              name: "Member name",
              elements: [
                { ref: "98", name: "Entity role" },
                { ref: "1065", name: "Person or organization" },
                { ref: "1035", name: "Last name" },
                { ref: "1036", name: "First name" },
                { ref: "1037", name: "Middle name" },
                { ref: "1038", name: "Name prefix" },
                { ref: "1039", name: "Name suffix" },
                { ref: "66", name: "Id qualifier" },
                { ref: "67", name: "Member id" },
              ],
            },
            {
              tag: "DMG",
              name: "Demographics",
              elements: [
                { ref: "1250", name: "Date format" },
                { ref: "1251", name: "Birth date", format: "date8" },
                { ref: "1068", name: "Gender", codes: gender },
              ],
            },
            {
              tag: "N3",
              name: "Street address",
              elements: [
                { ref: "166", name: "Address line 1" },
                { ref: "166", name: "Address line 2" },
              ],
            },
            {
              tag: "N4",
              name: "City, state, ZIP",
              elements: [
                { ref: "19", name: "City" },
                { ref: "156", name: "State" },
                { ref: "116", name: "ZIP" },
              ],
            },
          ],
        },
        {
          id: "2300",
          name: "Health coverage",
          trigger: "HD",
          repeat: true,
          segments: [
            {
              tag: "HD",
              name: "Coverage",
              elements: [
                { ref: "875", name: "Type of change", codes: maintenanceType },
                { ref: "1205", name: "" },
                { ref: "1205", name: "Coverage type", codes: insuranceLine },
                { ref: "1204", name: "Plan description" },
                { ref: "1207", name: "Who is covered", codes: coverageLevel },
              ],
            },
            {
              tag: "DTP",
              name: "Coverage dates",
              elements: [
                { ref: "374", name: "Date qualifier", codes: dtpQualifiers },
                { ref: "1250", name: "Date format" },
                { ref: "1251", name: "Date value", format: "date8" },
              ],
            },
          ],
        },
      ],
    },
  ],
};
