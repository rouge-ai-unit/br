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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Download,
  Globe,
  ExternalLink,
  Linkedin,
  Pencil,
  Trash,
} from "lucide-react";
import { db } from "@/utils/dbConfig";
import { toast } from "sonner";
import { Companies } from "@/utils/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { FaLinkedin } from "react-icons/fa";

export function CompanyTable({ data, refreshData }) {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editData, setEditData] = useState({}); // For storing edited data

  // Open edit dialog and pre-fill form
  const handleEdit = (company) => {
    setSelectedCompany(company);
    setEditData(company);
    setIsEditOpen(true);
  };

  // Open delete confirmation dialog
  const handleDelete = (company) => {
    setSelectedCompany(company);
    setIsDeleteOpen(true);
  };

  // Handle delete confirmation
  const confirmDelete = async () => {
    if (!selectedCompany) return;
    await db.delete(Companies).where(eq(Companies.id, selectedCompany.id));
    refreshData();
    toast.success("Company deleted successfully.");
    setIsDeleteOpen(false);
    setSelectedCompany(null);
  };

  // Edit company data
  const handleEditCompany = async () => {
    if (!selectedCompany) return;
    await db
      .update(Companies)
      .set({
        companyName: editData.companyName,
        region: editData.region,
        companyWebsite: editData.companyWebsite,
        companyLinkedin: editData.companyLinkedin,
        industryFocus: editData.industryFocus,
        offerings: editData.offerings,
        marketingPosition: editData.marketingPosition,
        potentialPainPoints: editData.potentialPainPoints,
        contactName: editData.contactName,
        contactPosition: editData.contactPosition,
        linkedin: editData.linkedin,
        contactEmail: editData.contactEmail,
      })
      .where(eq(Companies.id, editData.id))
      .returning();

    refreshData();
    toast.success("Company updated successfully.");
    setIsEditOpen(false);
    setSelectedCompany(null);
    console.log(editData);
  };

  // Function to export data as CSV
  const exportToCsv = () => {
    if (!data || data.length === 0) return;

    // Define CSV headers
    const headers = [
      "No.",
      "Company Name",
      "Company Website",
      "Company LinkedIn",
      "Region",
      "Industry Focus",
      "Offerings",
      "Marketing Position",
      "Potential Pain Points",
      "Contact Name",
      "Contact Position",
      "Contact LinkedIn",
      "Contact Email",
    ].join(",");

    // Map data to CSV format
    const rows = data.map((company, index) =>
      [
        index + 1,
        company.companyName,
        company.companyWebsite || "N/A",
        company.companyLinkedin || "N/A",
        company.region,
        company.industryFocus,
        company.offerings,
        company.marketingPosition,
        company.potentialPainPoints,
        company.contactName,
        company.contactPosition,
        company.linkedin || "N/A",
        company.contactEmail,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    );

    // Create CSV content
    const csv = [headers, ...rows].join("\n");

    // Trigger file download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "companies.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex justify-end mb-2">
        <Button onClick={exportToCsv}>
          <Download /> Export CSV
        </Button>
      </div>
      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableCaption>A list of AgTech companies.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Edit/Delete</TableHead>
              <TableHead>No.</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Company Website</TableHead>
              <TableHead>Company LinkedIn</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Industry Focus</TableHead>
              <TableHead>Offerings</TableHead>
              <TableHead>Marketing Position</TableHead>
              <TableHead>Potential Pain Points</TableHead>
              <TableHead>Contact Name</TableHead>
              <TableHead>Contact Position</TableHead>
              <TableHead>Contact LinkedIn</TableHead>
              <TableHead>Contact Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((company, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex gap-2 items-center">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEdit(company)}
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      /
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDelete(company)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{company.companyName}</TableCell>
                  <TableCell>
                    {company.companyWebsite ? (
                      <a
                        href={company.companyWebsite}
                        target="_blank"
                        className="flex items-centercenter gap-1 text-blue-500 hover:underline"
                      >
                        Visit <ExternalLink size={20} />
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    {company.companyLinkedin ? (
                      <a
                        href={company.companyLinkedin}
                        target="_blank"
                        className="flex items-center gap-1 text-blue-500 hover:underline"
                      >
                        <FaLinkedin /> LinkedIn
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>{company.region}</TableCell>
                  <TableCell>{company.industryFocus}</TableCell>
                  <TableCell>{company.offerings}</TableCell>
                  <TableCell>{company.marketingPosition}</TableCell>
                  <TableCell>{company.potentialPainPoints}</TableCell>
                  <TableCell>{company.contactName}</TableCell>
                  <TableCell>{company.contactPosition}</TableCell>
                  <TableCell>
                    {company.linkedin ? (
                      <a
                        href={company.linkedin}
                        target="_blank"
                        className="flex items-center gap-1 text-blue-500 hover:underline"
                      >
                        <FaLinkedin /> LinkedIn
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>{company.contactEmail}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan="14"
                  className="text-center text-gray-500 py-4"
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="fixed h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Edit details for {selectedCompany?.companyName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label htmlFor="companyName" className="text-xs font-bold">
                Company Name
              </label>
              <Input
                value={editData.companyName || ""}
                onChange={(e) =>
                  setEditData({ ...editData, companyName: e.target.value })
                }
                placeholder="Company Name"
                id="companyName"
              />
            </div>
            <div>
              <label htmlFor="companyWebsite" className="text-xs font-bold">
                Company Website
              </label>
              <div className="flex items-center gap-2 ">
                <Input
                  value={editData.companyWebsite || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, companyWebsite: e.target.value })
                  }
                  placeholder="Company Website"
                  id="companyWebsite"
                />
                <Link href={editData.companyWebsite} target="_blank">
                  <Button>
                    <ExternalLink />
                  </Button>
                </Link>
              </div>
            </div>
            <div>
              <label htmlFor="companyLinkedin" className="text-xs font-bold">
                Company Linkedin
              </label>
              <div className="flex items-center gap-2 ">
                <Input
                  value={editData.companyLinkedin || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      companyLinkedin: e.target.value,
                    })
                  }
                  placeholder="Company Linkedin"
                  id="companyLinkedin"
                />
                <Link href={editData.companyWebsite} target="_blank">
                  <Button>
                    <ExternalLink />
                  </Button>
                </Link>
              </div>
            </div>
            <div>
              <label htmlFor="region" className="text-xs font-bold">
                Region
              </label>
              <Input
                value={editData.region || ""}
                onChange={(e) =>
                  setEditData({ ...editData, region: e.target.value })
                }
                placeholder="Region"
                id="region"
              />
            </div>
            <div>
              <label htmlFor="industryFocus" className="text-xs font-bold">
                Industry Focus
              </label>
              <Input
                value={editData.industryFocus || ""}
                onChange={(e) =>
                  setEditData({ ...editData, industryFocus: e.target.value })
                }
                placeholder="Industry Focus"
                id="industryFocus"
              />
            </div>
            <div>
              <label htmlFor="offerings" className="text-xs font-bold">
                Offerings
              </label>
              <Input
                value={editData.offerings || ""}
                onChange={(e) =>
                  setEditData({ ...editData, offerings: e.target.value })
                }
                placeholder="Offerings"
                id="offerings"
              />
            </div>
            <div>
              <label htmlFor="marketingPosition" className="text-xs font-bold">
                Marketing Position
              </label>
              <Input
                value={editData.marketingPosition || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    marketingPosition: e.target.value,
                  })
                }
                placeholder="Marketing Position"
                id="marketingPosition"
              />
            </div>
            <div>
              <label
                htmlFor="potentialPainPoints"
                className="text-xs font-bold"
              >
                Potential Pain Points
              </label>
              <Input
                value={editData.potentialPainPoints || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    potentialPainPoints: e.target.value,
                  })
                }
                placeholder="Potential Pain Points"
                id="potentialPainPoints"
              />
            </div>
            <div>
              <label htmlFor="contactName" className="text-xs font-bold">
                Contact Name
              </label>
              <Input
                value={editData.contactName || ""}
                onChange={(e) =>
                  setEditData({ ...editData, contactName: e.target.value })
                }
                placeholder="Contact Name"
                id="contactName"
              />
            </div>
            <div>
              <label htmlFor="contactPosition" className="text-xs font-bold">
                Contact Position
              </label>
              <Input
                value={editData.contactPosition || ""}
                onChange={(e) =>
                  setEditData({ ...editData, contactPosition: e.target.value })
                }
                placeholder="Contact Position"
                id="contactPosition"
              />
            </div>
            <div>
              <label htmlFor="linkedin" className="text-xs font-bold">
                Contact Linkedin
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={editData.linkedin || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, linkedin: e.target.value })
                  }
                  placeholder="Contact Linkedin"
                  id="linkedin"
                />
                <Link href={editData.linkedin} target="_blank">
                  <Button>
                    <ExternalLink />
                  </Button>
                </Link>
              </div>
            </div>
            <div>
              <label htmlFor="contactEmail" className="text-xs font-bold">
                Contact Email
              </label>
              <Input
                value={editData.contactEmail || ""}
                onChange={(e) =>
                  setEditData({ ...editData, contactEmail: e.target.value })
                }
                placeholder="Contact Email"
                id="contactEmail"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCompany}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCompany?.companyName}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
