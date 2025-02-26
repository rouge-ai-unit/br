'use client'

import React, { useState } from "react";
import { FaLinkedin, FaGlobe } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "YOUR_API_KEY"; // Replace with your Google Gemini API Key
const genAI = new GoogleGenerativeAI('AIzaSyCp0a2lge4Hf_mJEIc_TpbJN0sNB3imgl8');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const CompanyFinder = () => {
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCompanyInfo = async () => {
    if (!company) return;

    setLoading(true);
    setWebsite("");
    setLinkedin("");

    try {
      const prompt = `Provide the official website and LinkedIn profile of the company "${company}". Format the response as: Website: <website_url>, LinkedIn: <linkedin_url>`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const websiteMatch = responseText.match(/Website: (https?:\/\/[^\s]+)/);
      const linkedinMatch = responseText.match(/LinkedIn: (https?:\/\/[^\s]+)/);

      setWebsite(websiteMatch ? websiteMatch[1] : "Not Found");
      setLinkedin(linkedinMatch ? linkedinMatch[1] : "Not Found");
    } catch (error) {
      console.error("Error fetching data:", error);
      setWebsite("Error fetching data");
      setLinkedin("Error fetching data");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Company Info Finder</h1>
      <input
        type="text"
        className="border border-gray-300 p-2 rounded w-80 mb-4"
        placeholder="Enter Company Name (e.g., Bayer Crop Science)"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <button
        onClick={fetchCompanyInfo}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Please Wait..." : "Generate"}
      </button>

      {website && (
        <div className="mt-6 p-4 bg-white shadow-md rounded w-80 text-center">
          <h2 className="text-lg font-semibold">Results</h2>
          <p className="mt-2">
            <FaGlobe className="inline text-blue-500 mr-2" />
            Website:{" "}
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600"
            >
              {website}
            </a>
          </p>
          <p className="mt-2">
            <FaLinkedin className="inline text-blue-700 mr-2" />
            LinkedIn:{" "}
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600"
            >
              {linkedin}
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyFinder;
