import { invoke } from "@tauri-apps/api/core";

export interface FARMetadata {
  title: number;
  title_title: string;
  chapter: number;
  chapter_title: string;
  subchapter: string;
  subchapter_title: string;
  part: number;
  part_title: string;
}

export interface AIMMetadata {
  chapter: number;
  chapter_title: string;
  section: number;
  section_title: string;
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
}

export interface ManifestResponse {
  section_id: string;
  paragraphs: string[];
  content: [string, string][];
}

export interface FAREntry {
  title: number;
  chapter: number;
  subchapter: string;
  part: number;
  section: number;
  section_title: string;
  paragraph: string | null;
  subparagraph: number | null;
  item: number | null;
  content: string;
}

export interface AIMEntry {
  chapter: number;
  section: number;
  topic: number;
  topic_title: string;
  paragraph: string | null;
  subparagraph: number | null;
  item: number | null;
  content: string;
  image: string | null;
}

export interface PCGEntry {
  term: string;
  definition: string;
}

export interface MetadataResponse {
  chapter_title: string;
  section_title: string | null;
}

export async function getFARTableOfContents(): Promise<FARMetadata[]> {
  try {
    return await invoke("get_far_toc");
  } catch (error) {
    console.error("Failed to get FAR TOC:", error);
    throw error;
  }
}

export async function getAIMTableOfContents(): Promise<AIMMetadata[]> {
  try {
    return await invoke("get_aim_toc");
  } catch (error) {
    console.error("Failed to get AIM TOC:", error);
    throw error;
  }
}

// Search Functions
export async function searchFAR(
  query: string
): Promise<SearchResponse<FAREntry>> {
  try {
    return await invoke("search_far", { query });
  } catch (error) {
    console.error("Failed to search FAR:", error);
    throw error;
  }
}

export async function searchAIM(
  query: string
): Promise<SearchResponse<AIMEntry>> {
  try {
    return await invoke("search_aim", { query });
  } catch (error) {
    console.error("Failed to search AIM:", error);
    throw error;
  }
}

export async function searchPCG(
  term: string
): Promise<SearchResponse<PCGEntry>> {
  try {
    return await invoke("search_pcg", { term });
  } catch (error) {
    console.error("Failed to search PCG:", error);
    throw error;
  }
}

// Metadata and Manifest Functions
export async function getAIMMetadata(
  chapter: number,
  section?: number
): Promise<MetadataResponse> {
  try {
    return await invoke("fetch_aim_metadata", { chapter, section });
  } catch (error) {
    console.error("Failed to get AIM metadata:", error);
    throw error;
  }
}

export async function getSectionManifest(
  sectionId: string
): Promise<ManifestResponse> {
  try {
    return await invoke("get_section_manifest", { sectionId });
  } catch (error) {
    console.error("Failed to get section manifest:", error);
    throw error;
  }
}
