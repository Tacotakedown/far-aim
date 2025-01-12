import { useState, useEffect } from "react";
import {
  FARMetadata,
  AIMMetadata,
  FAREntry,
  AIMEntry,
  PCGEntry,
  SearchResponse,
  ManifestResponse,
  getFARTableOfContents,
  getAIMTableOfContents,
  searchFAR,
  searchAIM,
  searchPCG,
  getAIMMetadata,
  getSectionManifest,
} from "./Util/database";

type SearchType = "FAR" | "AIM" | "PCG";

export default function RegulationsViewer() {
  // State for TOC data
  const [farToc, setFarToc] = useState<FARMetadata[]>([]);
  const [aimToc, setAimToc] = useState<AIMMetadata[]>([]);

  // State for search
  const [searchType, setSearchType] = useState<SearchType>("FAR");
  const [searchQuery, setSearchQuery] = useState("");
  const [farResults, setFarResults] = useState<SearchResponse<FAREntry> | null>(
    null
  );
  const [aimResults, setAimResults] = useState<SearchResponse<AIMEntry> | null>(
    null
  );
  const [pcgResults, setPcgResults] = useState<SearchResponse<PCGEntry> | null>(
    null
  );

  // State for section viewing
  const [currentManifest, setCurrentManifest] =
    useState<ManifestResponse | null>(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load TOC data on mount
  useEffect(() => {
    const loadTocData = async () => {
      try {
        setIsLoading(true);
        const [farData, aimData] = await Promise.all([
          getFARTableOfContents(),
          getAIMTableOfContents(),
        ]);
        setFarToc(farData);
        setAimToc(aimData);
      } catch (err) {
        setError("Failed to load table of contents");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTocData();
  }, []);

  // Handle search
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearchQuery(query);

    try {
      switch (searchType) {
        case "FAR":
          const farData = await searchFAR(query);
          setFarResults(farData);
          setAimResults(null);
          setPcgResults(null);
          break;
        case "AIM":
          const aimData = await searchAIM(query);
          setAimResults(aimData);
          setFarResults(null);
          setPcgResults(null);
          break;
        case "PCG":
          const pcgData = await searchPCG(query);
          setPcgResults(pcgData);
          setFarResults(null);
          setAimResults(null);
          break;
      }
    } catch (err) {
      setError(`Failed to search ${searchType}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load section manifest
  const loadSection = async (sectionId: string) => {
    try {
      setIsLoading(true);
      const manifest = await getSectionManifest(sectionId);
      setCurrentManifest(manifest);
    } catch (err) {
      setError(`Failed to load section ${sectionId}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header and Search Controls */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Regulations Browser</h1>

        <div className="flex gap-4 mb-4">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            className="border rounded p-2"
          >
            <option value="FAR">FAR</option>
            <option value="AIM">AIM</option>
            <option value="PCG">PCG</option>
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
            placeholder={`Search ${searchType}...`}
            className="border rounded p-2 flex-grow"
          />

          <button
            onClick={() => handleSearch(searchQuery)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FAR Results */}
        {farResults && (
          <div className="border rounded p-4">
            <h2 className="text-xl font-semibold mb-3">
              FAR Results ({farResults.total})
            </h2>
            <div className="space-y-4">
              {farResults.results.map((result, idx) => (
                <div key={idx} className="border-b pb-2">
                  <h3 className="font-medium">
                    {result.part}.{result.section}
                    {result.paragraph && `(${result.paragraph})`}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {result.section_title}
                  </p>
                  <p className="mt-1">{result.content}</p>
                  <button
                    onClick={() =>
                      loadSection(`${result.part}.${result.section}`)
                    }
                    className="text-blue-500 text-sm mt-2"
                  >
                    View Full Section
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AIM Results */}
        {aimResults && (
          <div className="border rounded p-4">
            <h2 className="text-xl font-semibold mb-3">
              AIM Results ({aimResults.total})
            </h2>
            <div className="space-y-4">
              {aimResults.results.map((result, idx) => (
                <div key={idx} className="border-b pb-2">
                  <h3 className="font-medium">
                    Chapter {result.chapter}, Section {result.section}
                  </h3>
                  <p className="text-sm text-gray-600">{result.topic_title}</p>
                  <p className="mt-1">{result.content}</p>
                  {result.image && (
                    <img
                      src={result.image}
                      alt={result.topic_title}
                      className="mt-2 max-w-full h-auto"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PCG Results */}
        {pcgResults && (
          <div className="border rounded p-4">
            <h2 className="text-xl font-semibold mb-3">
              PCG Results ({pcgResults.total})
            </h2>
            <div className="space-y-4">
              {pcgResults.results.map((result, idx) => (
                <div key={idx} className="border-b pb-2">
                  <h3 className="font-medium">{result.term}</h3>
                  <p className="mt-1">{result.definition}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Current Section Manifest */}
      {currentManifest && (
        <div className="mt-6 border rounded p-4">
          <h2 className="text-xl font-semibold mb-3">
            Section {currentManifest.section_id}
          </h2>
          <div className="space-y-4">
            {currentManifest.content.map(([id, content], idx) => (
              <div key={idx} className="border-b pb-2">
                <h3 className="font-medium">{id}</h3>
                <p className="mt-1">{content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
