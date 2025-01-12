pub mod tauri_bindings;

use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct FARMetadata {
    pub title: i32,
    pub title_title: String,
    pub chapter: i32,
    pub chapter_title: String,
    pub subchapter: String,
    pub subchapter_title: String,
    pub part: i32,
    pub part_title: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIMMetadata {
    pub chapter: i32,
    pub chapter_title: String,
    pub section: i32,
    pub section_title: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FAREntry {
    pub title: i32,
    pub chapter: i32,
    pub subchapter: String,
    pub part: i32,
    pub section: i32,
    pub section_title: String,
    pub paragraph: Option<String>,
    pub subparagraph: Option<i32>,
    pub item: Option<i32>,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIMEntry {
    pub chapter: i32,
    pub section: i32,
    pub topic: i32,
    pub topic_title: String,
    pub paragraph: Option<String>,
    pub subparagraph: Option<i32>,
    pub item: Option<i32>,
    pub content: String,
    pub image: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PCGEntry {
    pub term: String,
    pub definition: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SectionManifest {
    pub section_id: String,
    pub paragraphs: Vec<String>,
    pub content_map: HashMap<String, String>,
}

pub struct RegulationsDB {
    conn: Connection,
    manifest: HashMap<String, SectionManifest>,
}

impl RegulationsDB {
    pub fn new(db_path: &str) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        let mut db = RegulationsDB {
            conn,
            manifest: HashMap::new(),
        };
        db.build_manifest()?;
        Ok(db)
    }

    fn build_manifest(&mut self) -> Result<()> {
        let mut statement = self.conn.prepare(
            "SELECT title, part, section, paragraph, content FROM far_entries ORDER BY title, part, section, paragraph"
        )?;

        let rows = statement.query_map([], |row| {
            Ok((
                row.get::<_, i32>(0)?,            // title
                row.get::<_, i32>(1)?,            // part
                row.get::<_, i32>(2)?,            // section
                row.get::<_, Option<String>>(3)?, // paragraph
                row.get::<_, String>(4)?,         // content
            ))
        })?;

        for row in rows {
            let (title, part, section, paragraph, content) = row?;
            let section_id = format!("{}.{}", part, section);

            let manifest_entry =
                self.manifest
                    .entry(section_id.clone())
                    .or_insert_with(|| SectionManifest {
                        section_id: section_id.clone(),
                        paragraphs: Vec::new(),
                        content_map: HashMap::new(),
                    });

            if let Some(para) = paragraph {
                manifest_entry.paragraphs.push(para.clone());
                let full_id = format!("{}.{}({})", part, section, para);
                manifest_entry.content_map.insert(full_id, content);
            } else {
                manifest_entry
                    .content_map
                    .insert(section_id.clone(), content);
            }
        }
        Ok(())
    }

    pub fn get_far_toc(&self) -> Result<Vec<FARMetadata>> {
        let mut stmt = self.conn.prepare(
            "SELECT DISTINCT title, title_title, chapter, chapter_title, 
             subchapter, subchapter_title, part, part_title 
             FROM far_metadata 
             ORDER BY title, chapter, part",
        )?;

        let metadata_iter = stmt.query_map([], |row| {
            Ok(FARMetadata {
                title: row.get(0)?,
                title_title: row.get(1)?,
                chapter: row.get(2)?,
                chapter_title: row.get(3)?,
                subchapter: row.get(4)?,
                subchapter_title: row.get(5)?,
                part: row.get(6)?,
                part_title: row.get(7)?,
            })
        })?;

        metadata_iter.collect()
    }

    pub fn get_aim_toc(&self) -> Result<Vec<AIMMetadata>> {
        let mut stmt = self.conn.prepare(
            "SELECT DISTINCT chapter, chapter_title, section, section_title 
             FROM aim_metadata 
             ORDER BY chapter, section",
        )?;

        let metadata_iter = stmt.query_map([], |row| {
            Ok(AIMMetadata {
                chapter: row.get(0)?,
                chapter_title: row.get(1)?,
                section: row.get(2)?,
                section_title: row.get(3)?,
            })
        })?;

        metadata_iter.collect()
    }

    pub fn search_far(&self, query: &str) -> Result<Vec<FAREntry>> {
        let mut stmt = self.conn.prepare(
            "SELECT * FROM far_entries 
             WHERE content LIKE ?1 OR section_title LIKE ?1 
             ORDER BY title, chapter, part, section",
        )?;

        let entries_iter = stmt.query_map([&format!("%{}%", query)], |row| {
            Ok(FAREntry {
                title: row.get(1)?,
                chapter: row.get(2)?,
                subchapter: row.get(3)?,
                part: row.get(4)?,
                section: row.get(5)?,
                section_title: row.get(6)?,
                paragraph: row.get(7)?,
                subparagraph: row.get(8)?,
                item: row.get(9)?,
                content: row.get(10)?,
            })
        })?;

        entries_iter.collect()
    }

    pub fn search_aim(&self, query: &str) -> Result<Vec<AIMEntry>> {
        let mut stmt = self.conn.prepare(
            "SELECT * FROM aim_entries 
             WHERE content LIKE ?1 OR topic_title LIKE ?1 
             ORDER BY chapter, section, topic",
        )?;

        let entries_iter = stmt.query_map([&format!("%{}%", query)], |row| {
            Ok(AIMEntry {
                chapter: row.get(1)?,
                section: row.get(2)?,
                topic: row.get(3)?,
                topic_title: row.get(4)?,
                paragraph: row.get(5)?,
                subparagraph: row.get(6)?,
                item: row.get(7)?,
                content: row.get(8)?,
                image: row.get(9)?,
            })
        })?;

        entries_iter.collect()
    }

    pub fn search_pcg(&self, term: &str) -> Result<Vec<PCGEntry>> {
        let mut stmt = self.conn.prepare(
            "SELECT * FROM pcg_entries 
             WHERE term LIKE ?1 OR definition LIKE ?1",
        )?;

        let entries_iter = stmt.query_map([&format!("%{}%", term)], |row| {
            Ok(PCGEntry {
                term: row.get(1)?,
                definition: row.get(2)?,
            })
        })?;

        entries_iter.collect()
    }

    pub fn fetch_aim_metadata(
        &self,
        chapter: i32,
        section: Option<i32>,
    ) -> Result<(String, Option<String>)> {
        match section {
            Some(section_num) => {
                let mut stmt = self.conn.prepare(
                    "SELECT chapter_title, section_title 
                 FROM aim_metadata 
                 WHERE chapter = ? AND section = ?",
                )?;
                let (chapter_title, section_title) =
                    stmt.query_row([chapter, section_num], |row| Ok((row.get(0)?, row.get(1)?)))?;
                Ok((chapter_title, Some(section_title)))
            }
            None => {
                let mut stmt = self.conn.prepare(
                    "SELECT chapter_title 
                 FROM aim_metadata 
                 WHERE chapter = ? 
                 LIMIT 1",
                )?;
                let chapter_title: String = stmt.query_row([chapter], |row| row.get(0))?;
                Ok((chapter_title, None))
            }
        }
    }

    pub fn get_section_content(&self, section_id: &str) -> Option<&SectionManifest> {
        self.manifest.get(section_id)
    }
}
