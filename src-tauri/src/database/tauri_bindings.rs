use super::{
    AIMEntry, AIMMetadata, FAREntry, FARMetadata, PCGEntry, RegulationsDB, SectionManifest,
};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{Manager, State};

pub struct DBState(pub Mutex<RegulationsDB>);

#[derive(Debug, Serialize)]
pub struct SearchResponse<T> {
    pub results: Vec<T>,
    pub total: usize,
}

#[derive(Debug, Serialize)]
pub struct MetadataResponse {
    pub chapter_title: String,
    pub section_title: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ManifestResponse {
    pub section_id: String,
    pub paragraphs: Vec<String>,
    pub content: Vec<(String, String)>, // [(id, content),...]
}

#[tauri::command]
pub async fn get_far_toc(state: State<'_, DBState>) -> Result<Vec<FARMetadata>, String> {
    state
        .0
        .lock()
        .map_err(|_| "Failed to lock database".to_string())?
        .get_far_toc()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_aim_toc(state: State<'_, DBState>) -> Result<Vec<AIMMetadata>, String> {
    state
        .0
        .lock()
        .map_err(|_| "Failed to lock database".to_string())?
        .get_aim_toc()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_far(
    query: String,
    state: State<'_, DBState>,
) -> Result<SearchResponse<FAREntry>, String> {
    let results = state
        .0
        .lock()
        .map_err(|_| "Failed to lock database".to_string())?
        .search_far(&query)
        .map_err(|e| e.to_string())?;

    Ok(SearchResponse {
        total: results.len(),
        results,
    })
}

#[tauri::command]
pub async fn search_aim(
    query: String,
    state: State<'_, DBState>,
) -> Result<SearchResponse<AIMEntry>, String> {
    let results = state
        .0
        .lock()
        .map_err(|_| "Failed to lock database".to_string())?
        .search_aim(&query)
        .map_err(|e| e.to_string())?;

    Ok(SearchResponse {
        total: results.len(),
        results,
    })
}

#[tauri::command]
pub async fn search_pcg(
    term: String,
    state: State<'_, DBState>,
) -> Result<SearchResponse<PCGEntry>, String> {
    let results = state
        .0
        .lock()
        .map_err(|_| "Failed to lock database".to_string())?
        .search_pcg(&term)
        .map_err(|e| e.to_string())?;

    Ok(SearchResponse {
        total: results.len(),
        results,
    })
}

#[tauri::command]
pub async fn fetch_aim_metadata(
    chapter: i32,
    section: Option<i32>,
    state: State<'_, DBState>,
) -> Result<MetadataResponse, String> {
    let (chapter_title, section_title) = state
        .0
        .lock()
        .map_err(|_| "Failed to lock database".to_string())?
        .fetch_aim_metadata(chapter, section)
        .map_err(|e| e.to_string())?;

    Ok(MetadataResponse {
        chapter_title,
        section_title,
    })
}

#[tauri::command]
pub async fn get_section_manifest(
    section_id: String,
    state: State<'_, DBState>,
) -> Result<ManifestResponse, String> {
    let db = state
        .0
        .lock()
        .map_err(|_| "Failed to lock database".to_string())?;

    let manifest = db
        .get_section_content(&section_id)
        .ok_or_else(|| format!("Section {} not found", section_id))?;

    Ok(ManifestResponse {
        section_id: manifest.section_id.clone(),
        paragraphs: manifest.paragraphs.clone(),
        content: manifest
            .content_map
            .iter()
            .map(|(k, v)| (k.clone(), v.clone()))
            .collect(),
    })
}
