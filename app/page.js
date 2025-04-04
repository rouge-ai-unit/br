"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataChart } from "@/components/DataChart";
import { Loader2, RefreshCw } from "lucide-react";
import { generateCompanyData } from "@/lib/aiGenerate";
import { analyzeCompany } from "@/lib/aiGenerate";
import { CompanyTable } from "@/components/CompanyTable";
import { db } from "@/utils/dbConfig";
import { Companies } from "@/utils/schema";
import { toast } from "sonner";
import { MailList } from "@/components/MailingList";

export default function Home() {
  const [companies, setCompanies] = useState([]);
  const [CompanyList, setCompanyList] = useState("");
  const [mailingList, setMailingList] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanyList();
  }, []);

  // 🔹 Fetch Company Lis
  const fetchCompanyList = async () => {
    const comp_response = await fetch(`/api/companies`);
    const companies = await comp_response.json();

    const mail_response = await fetch(`/api/mailing-list`);
    const mails = await mail_response.json();

    setCompanies(companies);
    setMailingList(mails);

    // Extract company names and store as a comma-separated string
    const companyNames = [...companies]
      .map((company) => company.companyName)
      .join(", ");
    setCompanyList((prevList) =>
      prevList ? `${prevList}, ${companyNames}` : companyNames
    );

    console.log(companyNames);
  };

  const refreshData = () => {
    fetchCompanyList();
  };

  // 🔹 Fetch Company Data
  const handleGenerateData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await generateCompanyData(CompanyList);

      for (const company of data) {
        await db
          .insert(Companies)
          .values({
            companyName: company.companyName,
            region: company.region,
            companyWebsite: company.companyWebsite,
            companyLinkedin: company.companyLinkedin,
            industryFocus: company.industryFocus,
            offerings: company.offerings,
            marketingPosition: company.marketingPosition,
            potentialPainPoints: company.potentialPainPoints,
            contactName: company.contactName,
            contactPosition: company.contactPosition,
            linkedin: company.linkedin,
            contactEmail: company.contactEmail,
          })
          .returning({ companyName: Companies.companyName });
      }

      toast.success("8 Unique Company Details Generated!");
      refreshData();

      setSelectedCompany(null); // Reset selection on new data
      setAnalysis(null);
      localStorage.setItem("companyData", JSON.stringify(data));
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to generate company data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Analyze Selected Company
  const handleAnalyzeCompany = async () => {
    if (!selectedCompany) {
      setAnalysis("Please select a company to analyze.");
      return;
    }

    try {
      setAnalyzing(true);
      const result = await analyzeCompany(selectedCompany);
      setAnalysis(result.analysis);
    } catch (error) {
      console.error("Error analyzing company:", error);
      setAnalysis("Failed to fetch analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">
          Company List ({companies.length})
        </h1>
        <Button
          onClick={handleGenerateData}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Generate Data
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          {/* <TabsTrigger value="mail">Mail List</TabsTrigger> */}
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="analysis">Company Analysis</TabsTrigger>
        </TabsList>

        {/* Table View */}
        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardContent className="mt-5">
              <CompanyTable
                data={companies}
                refreshData={() => refreshData()}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Section */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Companies by Region</CardTitle>
              </CardHeader>
              <CardContent>
                <DataChart data={companies} type="region" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Industry Focus Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <DataChart data={companies} type="industry" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution ($M)</CardTitle>
              </CardHeader>
              <CardContent>
                <DataChart data={companies} type="revenue" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Share (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <DataChart data={companies} type="marketShare" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employee Count</CardTitle>
              </CardHeader>
              <CardContent>
                <DataChart data={companies} type="employeeSize" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technology Stack Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <DataChart data={companies} type="techStack" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Company Analysis Section */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyze a Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show dropdown only when companies exist */}
              {companies.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <label htmlFor="company-select" className="font-medium">
                    Select a company:
                  </label>
                  <select
                    id="company-select"
                    value={selectedCompany ? selectedCompany.companyName : ""}
                    onChange={(e) =>
                      setSelectedCompany(
                        companies.find(
                          (company) => company.companyName === e.target.value
                        )
                      )
                    }
                    className="border rounded-md p-2 w-full bg-white"
                  >
                    <option value="">-- Choose a company --</option>
                    {companies.map((company) => (
                      <option
                        key={company.companyName}
                        value={company.companyName}
                      >
                        {company.companyName}
                      </option>
                    ))}
                  </select>

                  <Button
                    onClick={handleAnalyzeCompany}
                    disabled={analyzing || !selectedCompany}
                  >
                    {analyzing ? "Analyzing..." : "Analyze"}
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500">
                  Generate data to analyze a company.
                </p>
              )}

              {/* Display analysis results */}
              {analysis && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mail">
          <MailList
            data={mailingList}
            refreshData={() => {
              refreshData();
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
