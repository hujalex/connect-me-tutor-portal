"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";

const WorksheetsList = () => {
  const [worksheets, setWorksheets] = useState<any[]>([]);
  const [filteredWorksheets, setFilteredWorksheets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  useEffect(() => {
    const fetchFiles = async () => {
      const { data, error } = await supabase.storage
        .from("worksheets")
        .list("");
      if (!error && data) {
        setWorksheets(data);
      }
    };

    fetchFiles();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredWorksheets(worksheets);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results = worksheets.filter((file) =>
      file.name.toLowerCase().includes(query),
    );

    setFilteredWorksheets(results);
  }, [searchQuery, worksheets]);

  const getTags = (fileName: string): string[] => {
    const name = fileName.toLowerCase();
    const tags: string[] = [];

    if (name.includes("math")) tags.push("math");
    if (name.includes("english")) tags.push("english");
    if (name.includes("8")) tags.push("8th grade");

    return tags;
  };

  const downloadFile = async (path: string) => {
    const { data } = await supabase.storage.from("worksheets").download(path);
    const url = URL.createObjectURL(data);
    const download = document.createElement("a");
    download.href = url;
    download.download = path;
    download.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    let results = worksheets;

    if (selectedTag !== "all") {
      results = results.filter((file) =>
        getTags(file.name).includes(selectedTag),
      );
    }

    setFilteredWorksheets(results);
  }, [selectedTag, worksheets]);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Worksheets</h1>

      <div className="space-x-2 mb-6">
        <input
          type="text"
          placeholder="Search Worksheets"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-md"
        />
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All</option>
          <option value="math">Math</option>
          <option value="english">English</option>
          <option value="8th grade">8th Grade</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-6">
        {filteredWorksheets.map((file) => (
          <Card
            key={file.name}
            className="w-80 transition-shadow hover:shadow-md"
          >
            <CardHeader className="pb-6">
              <CardTitle className="text-lg font-semibold text-center">
                {file.name}
              </CardTitle>
              <div className="flex flex-wrap justify-center gap-2 mt-2 text-sm text-gray-600">
                {getTags(file.name).map((tag) => (
                  <span key={tag} className="bg-gray-100 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </CardHeader>

            <CardFooter>
              <div className="flex gap-3 w-full">
                <Button
                  className="w-1/2"
                  onClick={() => {
                    const { data } = supabase.storage
                      .from("worksheets")
                      .getPublicUrl(file.name);
                    window.open(data.publicUrl, "_blank");
                  }}
                >
                  Open
                </Button>
                <Button
                  className="w-1/2"
                  onClick={() => downloadFile(file.name)}
                >
                  Download
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
};

export default WorksheetsList;
