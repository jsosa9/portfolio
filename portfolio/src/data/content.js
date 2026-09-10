// This file used to hold the raw content directly. It now just re-exports
// the shared JSON files in ../../../shared-data/ — a sibling folder to both
// this repo and ide-portfolio, so there's exactly one copy of this content,
// not a per-repo duplicate to keep in sync.
//
// Edit the JSON files in ../../../shared-data/ to change what shows up here.

import profileData from '../../../shared-data/profile.json'
import projectsData from '../../../shared-data/projects.json'
import experienceData from '../../../shared-data/experience.json'
import hackathonsData from '../../../shared-data/hackathons.json'

export const profile = profileData
export const projects = projectsData
export const experience = experienceData
export const hackathons = hackathonsData
