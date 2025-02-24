"use client";

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
import { Download, Globe, Linkedin } from "lucide-react"; // Import icons

export function CompanyTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-gray-500">No company data available.</p>
    );
  }

  // Define column headers
  const columns = [
    { header: "Company Name", accessorKey: "companyName" },
    { header: "Region", accessorKey: "region" },
    {
      header: "Website",
      accessorKey: "companyWebsite",
      isLink: true,
      icon: <Globe className="h-4 w-4 text-blue-500" />,
    },
    {
      header: "LinkedIn",
      accessorKey: "companyLinkedin",
      isLink: true,
      icon: <Linkedin className="h-4 w-4 text-blue-500" />,
    },
    { header: "Industry Focus", accessorKey: "industryFocus" },
    { header: "Offerings", accessorKey: "offerings" },
    { header: "Marketing Position", accessorKey: "marketingPosition" },
    { header: "Potential Pain Points", accessorKey: "potentialPainPoints" },
    { header: "Contact Name", accessorKey: "contactName" },
    { header: "Contact Position", accessorKey: "contactPosition" },
    {
      header: "Contact LinkedIn",
      accessorKey: "linkedin",
      isLink: true,
      icon: <Linkedin className="h-4 w-4 text-blue-500" />,
    },
    { header: "Contact Email", accessorKey: "contactEmail" },
  ];

  // Function to export data as CSV
  const exportToCsv = () => {
    if (data.length === 0) return;

    // Create CSV headers
    const headers = columns.map((column) => column.header).join(",");

    // Create CSV rows
    const rows = data.map((item) =>
      columns
        .map((column) => {
          const key = column.accessorKey;
          const value = item[key] || ""; // Handle missing values
          return `"${String(value).replace(/"/g, '""')}"`; // Escape quotes
        })
        .join(",")
    );

    // Combine headers and rows
    const csv = [headers, ...rows].join("\n");

    // Create and trigger download
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
      {/* Export Button */}
      <div className="mb-4 flex justify-end">
        <Button
          onClick={exportToCsv}
          disabled={data.length === 0}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableCaption>A list of AgTech companies.</TableCaption>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.accessorKey}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((company, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.accessorKey} className="text-sm">
                    {/* If it's a link, show an icon */}
                    {column.isLink && company[column.accessorKey] ? (
                      <a
                        href={company[column.accessorKey]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-500 hover:underline"
                      >
                        {column.icon}
                        <span>Visit</span>
                      </a>
                    ) : (
                      company[column.accessorKey] || "N/A"
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
