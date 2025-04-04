"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, SendHorizontal, Trash2 } from "lucide-react";
import { db } from "@/utils/dbConfig";
import { Companies, MailingList } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { toast } from "sonner";

export function MailList({ data, refreshData }) {
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  // Toggle selection
  const toggleSelection = (companyId) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  // Select all companies
  const selectAll = () => {
    setSelectedCompanies(data.map((company) => company.id));
  };

  // Deselect all companies
  const deselectAll = () => {
    setSelectedCompanies([]);
  };

  // Function to generate mail object
  const generateMailObject = (selected) => {
    return selected.map((company) => ({
      from: "Acme <onboarding@resend.dev>",
      to: [company.contactEmail],
      subject: `Hello ${company.contactName}`,
      html: `<h1>${company.companyName}</h1>
             <p><strong>Website:</strong> ${company.companyWebsite || "N/A"}</p>
             <p><strong>LinkedIn:</strong> ${
               company.companyLinkedin || "N/A"
             }</p>
             <p><strong>Industry Focus:</strong> ${company.industryFocus}</p>
             <p><strong>Offerings:</strong> ${company.offerings}</p>
             <p><strong>Marketing Position:</strong> ${
               company.marketingPosition
             }</p>
             <p><strong>Potential Pain Points:</strong> ${
               company.potentialPainPoints
             }</p>
             <p><strong>Contact Name:</strong> ${company.contactName}</p>
             <p><strong>Contact Position:</strong> ${
               company.contactPosition
             }</p>
             <p><strong>Contact Email:</strong> ${company.contactEmail}</p>`,
    }));
  };

  // Function to send selected emails
  const sendSelectedMails = () => {
    const selectedCompaniesData = data.filter((company) =>
      selectedCompanies.includes(company.id)
    );

    const mailArray = generateMailObject(selectedCompaniesData);
    console.log(mailArray);
  };

  // Function to send all emails
  const sendAllMails = () => {
    const mailArray = generateMailObject(data);
    console.log(mailArray);
  };

  // Function to delete a company
  const deleteCompany = async (id) => {
    try {
      const result = await db
        .delete(MailingList)
        .where(eq(MailingList.id, id))
        .returning();

      if (result) {
        const r1 = await db
          .update(Companies)
          .set({
            addedToMailList: false,
          })
          .where(eq(Companies.id, id))
          .returning();

        refreshData(); // Refresh Data after deletion
        toast.success("Company deleted:", result.deletedCompany);
      } else {
        console.error("Error:", result.error);
      }
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="mb-4 flex justify-between">
        <p className="text-lg font-bold">Mailing List ({data.length})</p>
        <div className="flex gap-2">
          <Button
            onClick={selectAll}
            variant="outline"
            disabled={selectedCompanies.length === data.length}
          >
            Select All
          </Button>
          <Button
            onClick={deselectAll}
            variant="outline"
            disabled={selectedCompanies.length === 0}
          >
            Deselect All
          </Button>
          <Button
            onClick={sendSelectedMails}
            disabled={selectedCompanies.length === 0}
            variant="default"
            className="flex items-center gap-2"
          >
            <SendHorizontal className="h-4 w-4" />
            Send Selected
          </Button>
          <Button
            onClick={sendAllMails}
            variant="default"
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send All
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableCaption>List of companies to be mailed.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Select</TableHead>
              <TableHead>No.</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Contact Name</TableHead>
              <TableHead>Contact Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((company, index) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCompanies.includes(company.id)}
                      onCheckedChange={() => toggleSelection(company.id)}
                    />
                  </TableCell>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{company.companyName}</TableCell>
                  <TableCell>{company.contactName}</TableCell>
                  <TableCell>{company.contactEmail}</TableCell>
                  <TableCell>
                    {company.isMailed ? (
                      <span className="text-green-600">Mailed</span>
                    ) : (
                      <span className="text-yellow-600">Pending</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          console.log(generateMailObject([company]))
                        }
                      >
                        Mail
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteCompany(company.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan="7"
                  className="text-center text-gray-500 py-4"
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
