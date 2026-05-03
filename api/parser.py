# Module: api/parser.py - Quản lý logic hệ thống
"""
CV Parser Module
Provides functionality to extract and process data from CV PDFs using RegEx and Gemini AI.
"""
import fitz  # PyMuPDF
import re
import json
import os
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
import google.generativeai as genai
from models import CVData, Experience, Education, Project

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("[WARNING] GEMINI_API_KEY not found in environment variables.")

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts text from a PDF file using PyMuPDF."""
    print(f"[LOG] Starting text extraction: {pdf_path}")
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text()
    print(f"[LOG] Text extraction complete. Length: {len(text)} characters")
    return text

def extract_regex_info(text: str) -> Dict[str, Any]:
    """Extracts email, phone, and links using RegEx."""
    print("[LOG] Starting RegEx info extraction...")
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    phone_pattern = r'(?:\+84|0)(?:\s*\d){9,10}'
    github_pattern = r'https?://github\.com/[a-zA-Z0-9_-]+'
    
    emails = re.findall(email_pattern, text)
    phones = re.findall(phone_pattern, text)
    githubs = re.findall(github_pattern, text)
    
    res = {
        "email": emails[0] if emails else None,
        "phone": phones[0] if phones else None,
        "github": githubs[0] if githubs else None
    }
    print(f"[LOG] RegEx extraction result: {res}")
    return res

def call_gemini(prompt: str, model_name: str = "gemini-2.5-flash") -> str:
    """Calls Google Gemini API for structured extraction."""
    print(f"[LOG] Calling Gemini with model: {model_name}")
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[ERROR] GEMINI_API_KEY is missing!")
        return "{}"
        
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        res_text = response.text
        print(f"[LOG] Gemini response received. Length: {len(res_text)} characters")
        return res_text
    except Exception as e:
        print(f"[ERROR] Gemini call failed: {e}")
        return "{}"

def split_text_into_sections(text: str) -> Dict[str, str]:
    """Splits CV text into major sections using common headers."""
    sections = {
        "profile": "",
        "experience": "",
        "education": "",
        "projects": "",
        "skills": "",
        "about_me": ""
    }
    
    # Headers to look for (case insensitive)
    # Mapping keywords to section keys
    header_map = {
        "EXPERIENCE": "experience",
        "WORK EXPERIENCE": "experience",
        "EDUCATION": "education",
        "PROJECT": "projects",
        "PROJECTS": "projects",
        "SKILLS": "skills",
        "TECHNICAL SKILLS": "skills",
        "ABOUT ME": "about_me",
        "SUMMARY": "about_me",
        "CONTACT": "profile",
        "INFORMATION": "profile"
    }
    
    current_section = "profile"
    lines = text.split('\n')
    
    for line in lines:
        clean_line = line.strip().upper()
        if not clean_line:
            continue
            
        # Remove common bullet points or icons at start
        clean_line = re.sub(r'^[^\w\s]+', '', clean_line).strip()
        
        # Check if line IS a header (exact match or very short line with keyword)
        found_header = False
        for h, s in header_map.items():
            # If the line is exactly the header or starts with it and is short
            if clean_line == h or (clean_line.startswith(h) and len(clean_line) < len(h) + 5):
                current_section = s
                found_header = True
                break
        
        if not found_header:
            sections[current_section] += line + "\n"
            
    # Post-process: Merge 'about_me' into 'profile' for easier LLM context if needed,
    # or keep separate and handle in parse_cv_with_llm
    return sections

def normalize_item(item: Any, expected_keys: list) -> Dict[str, Any]:
    """Fixes dicts where LLM used data as keys instead of values."""
    if not isinstance(item, dict):
        return {}
    
    # CASE 1: LLM used the primary value as a key, e.g., {"Software Engineer": {"company": "...", "time": "..."}}
    # We want to move "Software Engineer" into the first expected key (e.g., "position" or "degree")
    if len(item) == 1:
        key = list(item.keys())[0]
        val = item[key]
        if isinstance(val, dict) and key not in expected_keys:
            primary_key = expected_keys[0]
            val[primary_key] = key
            return val
            
    # CASE 2: Ensure all expected keys exist and are NOT None
    for key in expected_keys:
        if key not in item or item[key] is None:
            item[key] = ""
        # Handle lists that might be None
        if key in ["description", "tech_stack", "technical"] and not isinstance(item[key], list):
            if isinstance(item[key], str) and item[key]:
                item[key] = [item[key]]
            else:
                item[key] = []
    return item

def clean_section_text(text: str) -> str:
    """Removes common PDF artifacts and noise for better LLM parsing."""
    # Remove icons/emojis (simplified regex)
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    # Remove excessive slashes or common dividers
    text = re.sub(r'//+', ' ', text)
    # Remove multiple spaces/newlines
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r' +', ' ', text)
    return text.strip()

def extract_section_data(section_name: str, section_text: str, model: str) -> Dict[str, Any]:
    """Extracts data for a specific section using a targeted prompt."""
    if not section_text.strip():
        return {}
    
    clean_text = clean_section_text(section_text)
    print(f"[DEBUG] Cleaned text for {section_name} (first 100 chars): {clean_text[:100]}...")
        
    # Mapping section to its expected schema keys for normalization
    schema_map = {
        "experience": ["position", "company", "time", "description", "technical"],
        "education": ["degree", "university", "time"],
        "projects": ["name", "time", "position", "description", "tech_stack"]
    }
        
    prompts = {
        "profile": f"Extract JSON: {{'full_name': '...', 'job_title': '...', 'location': '...', 'about_me': '...'}}. Text:\n{clean_text}",
        "experience": f"Extract work experience. Example: [{{'position': 'Dev', 'company': 'ABC', 'time': '2022', 'description': ['task1'], 'technical': 'React'}}]. Text:\n{clean_text}",
        "education": f"Extract education. Example: [{{'degree': 'B.S.', 'university': 'MIT', 'time': '2020'}}]. Text:\n{clean_text}",
        "projects": f"Extract projects. Example: [{{'name': 'App', 'time': '2021', 'position': 'Lead', 'description': 'desc', 'tech_stack': ['python']}}]. Text:\n{clean_text}",
        "skills": f"Extract skills as {{'Category': ['skill1']}}. Text:\n{clean_text}"
    }
    
    prompt = prompts.get(section_name, "")
    if not prompt: return {}
    
    prompt += "\n\nCRITICAL: Return ONLY valid JSON."
    
    res_text = call_gemini(prompt, model)
    try:
        data = json.loads(res_text)
        # Handle wrapping
        if isinstance(data, dict):
            # 1. Direct match
            if section_name in data:
                data = data[section_name]
            # 2. Heuristic: if only one key and its value is a list/dict
            elif len(data) == 1:
                key = list(data.keys())[0]
                data = data[key]
            # 3. Last resort: if it's a list section, find any list in the dict
            elif section_name in ["experience", "education", "projects"]:
                for val in data.values():
                    if isinstance(val, list) and len(val) > 0:
                        data = val
                        break
        
        # If it's a list (for experience, education, projects)
        if isinstance(data, list):
            expected_keys = schema_map.get(section_name, [])
            if expected_keys:
                data = [normalize_item(item, expected_keys) for item in data]
            return {section_name: data}
            
        return data
    except Exception as e:
        print(f"[ERROR] Failed to parse/normalize {section_name}: {e}")
        return {}

def parse_cv_with_llm(text: str) -> Dict[str, Any]:
    """Sends CV sections to Ollama iteratively for better accuracy."""
    print("[LOG] Splitting text into sections...")
    sections = split_text_into_sections(text)
    model = "gemini-2.5-flash"
    
    final_data = {}
    
    # 1. SPECIAL CASE: Profile/About Me/Skills often contain Name and Job Title
    # We combine them to ensure the LLM finds the name even if it's in the middle
    profile_context = sections["profile"] + "\n" + sections["about_me"] + "\n" + sections["skills"]
    print("[LOG] Processing consolidated profile info...")
    profile_data = extract_section_data("profile", profile_context, model)
    final_data.update(profile_data)
    
    # Ensure about_me is extracted from the specific section if profile extraction missed it
    if not final_data.get("about_me"):
        final_data["about_me"] = sections["about_me"].strip()

    # 2. Extract Skills (from the skills section only, to keep it clean)
    print("[LOG] Processing section: skills")
    skills_data = extract_section_data("skills", sections["skills"], model)
    final_data["skills"] = skills_data.get("skills", skills_data)

    # 3. Extract lists
    for section_name in ["experience", "education", "projects"]:
        print(f"[LOG] Processing section: {section_name}")
        section_text = sections[section_name]
        if not section_text.strip():
            print(f"[LOG] Section {section_name} is empty, skipping LLM call")
            final_data[section_name] = []
            continue
            
        section_data = extract_section_data(section_name, section_text, model)
        final_data[section_name] = section_data.get(section_name, [])
        if not isinstance(final_data[section_name], list) and final_data[section_name]:
            final_data[section_name] = [final_data[section_name]]
                
    return final_data

def process_cv(pdf_path: str) -> CVData:
    """Main function to process PDF and return CVData model with cleaning."""
    print(f"\n--- [LOG] Processing CV: {pdf_path} ---")
    text = extract_text_from_pdf(pdf_path)
    regex_info = extract_regex_info(text)
    llm_info = parse_cv_with_llm(text)

    # 1. Clean LLM info: Ensure list fields only contain dictionaries
    print("[LOG] Cleaning LLM info lists...")
    list_fields = ["experience", "education", "projects"]
    for field in list_fields:
        items = llm_info.get(field, [])
        if not isinstance(items, list):
            items = [items] if items else []
        
        orig_len = len(items)
        # Filter out non-dict items and empty dicts
        llm_info[field] = [item for item in items if isinstance(item, dict) and any(item.values())]
        new_len = len(llm_info[field])
        if orig_len != new_len:
            print(f"[LOG] Field '{field}' cleaned: removed {orig_len - new_len} invalid/empty items")
        print(f"[LOG] Final {field} count: {new_len}")

    # 2. Merge RegEx info
    print("[LOG] Merging RegEx info into LLM result...")
    if regex_info["email"]: llm_info["email"] = regex_info["email"]
    if regex_info["phone"]: llm_info["phone"] = regex_info["phone"]
    if regex_info["github"]: llm_info["github"] = regex_info["github"]
    
    # 3. Handle default values for required fields in CVData
    if "full_name" not in llm_info or not llm_info["full_name"]:
        print("[LOG] 'full_name' missing, set to default")
        llm_info["full_name"] = "Unknown candidate"

    print("[LOG] Instantiating CVData model...")
    try:
        result = CVData(**llm_info)
        print("[LOG] CVData model created successfully")
        return result
    except Exception as e:
        print(f"[ERROR] Pydantic validation failed: {e}")
        # Print keys for debugging
        print(f"[DEBUG] Keys in llm_info: {list(llm_info.keys())}")
        raise e

def safe_parse_json(v):
    if isinstance(v, str):
        try:
            return json.loads(v)
        except:
            return v
    return v

def get_job_recommendations_v2(cv_data: Dict[str, Any], jobs_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Matches a CV against a list of jobs using TF-IDF and Cosine Similarity."""
    try:
        # 1. Prepare CV Content
        cv_text = f"{cv_data.get('job_title') or ''} {cv_data.get('about_me') or ''} "
        
        # Add skills
        skills = safe_parse_json(cv_data.get('skills')) or {}
        if isinstance(skills, dict):
            for cat, s_list in skills.items():
                cv_text += f"{cat} {' '.join(s_list) if isinstance(s_list, list) else str(s_list)} "
        elif isinstance(skills, list):
            cv_text += " ".join(map(str, skills))
        elif isinstance(skills, str):
            cv_text += skills
            
        # Add experience
        experience = safe_parse_json(cv_data.get('experience')) or []
        if isinstance(experience, list):
            for exp in experience:
                if isinstance(exp, dict):
                    cv_text += f"{exp.get('position') or ''} {exp.get('company') or ''} {exp.get('description') or ''} {exp.get('technical') or ''} "
                else:
                    cv_text += f"{str(exp)} "
        
        # Add projects
        projects = safe_parse_json(cv_data.get('projects')) or []
        if isinstance(projects, list):
            for proj in projects:
                if isinstance(proj, dict):
                    tech_stack = proj.get('tech_stack') or []
                    tech_str = ' '.join(tech_stack) if isinstance(tech_stack, list) else str(tech_stack)
                    cv_text += f"{proj.get('name') or ''} {proj.get('position') or ''} {proj.get('description') or ''} {tech_str} "
        
        # 2. Prepare Jobs Content
        job_texts = []
        for job in jobs_list:
            job_text = f"{job.get('title') or ''} {job.get('description') or ''} {job.get('requirements') or ''}"
            job_texts.append(job_text)
            
        if not job_texts:
            return {"recommendations": []}
            
        print(f"[DEBUG] CV Text Length: {len(cv_text)}")
        print(f"[DEBUG] Jobs Count: {len(job_texts)}")
        # print(f"[DEBUG] CV Text Sample: {cv_text[:200]}...")
            
        # 3. Vectorization with Vietnamese & Tech term support
        all_texts = [cv_text] + job_texts
        # Use ngram_range=(1, 2) to capture Vietnamese words like "phần mềm", "lập trình"
        # token_pattern handles tech terms like C++, C#, .NET
        vectorizer = TfidfVectorizer(
            stop_words=None,
            ngram_range=(1, 2),
            token_pattern=r"(?u)\b\w\w+\b|\b[a-zA-Z0-9+#.]+\b"
        )
        tfidf_matrix = vectorizer.fit_transform(all_texts)
        
        # 4. Cosine Similarity
        scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
        
        # 5. Build Recommendations
        recommendations = []
        for i, score in enumerate(scores):
            job = jobs_list[i]
            # Boost score slightly to make it look heartier if there is any match
            match_score = float(score * 100)
            if match_score > 0 and match_score < 30:
                match_score *= 1.5 # Boost low scores for better UX
            
            match_score = min(match_score, 99.0) # Cap at 99
            
            # Enhanced reason logic
            if match_score > 70:
                reason = f"Rất phù hợp: CV của bạn có sự tương đồng cao với yêu cầu kỹ thuật và mô tả công việc ({int(match_score)}%)"
            elif match_score > 40:
                reason = f"Phù hợp tốt: Bạn sở hữu nhiều kỹ năng mà nhà tuyển dụng đang tìm kiếm ({int(match_score)}%)"
            elif match_score > 15:
                reason = f"Có tiềm năng: Một số kỹ năng và kinh nghiệm của bạn khớp với vị trí này ({int(match_score)}%)"
            else:
                reason = f"Tương đồng thấp: Cần bổ sung thêm kỹ năng hoặc kinh nghiệm phù hợp hơn ({int(match_score)}%)"
                
            recommendations.append({
                "job_id": job['id'],
                "match_score": match_score,
                "reason": reason
            })
            
        recommendations.sort(key=lambda x: x['match_score'], reverse=True)
        return {"recommendations": recommendations}
        
    except Exception as e:
        print(f"[ERROR] Traditional recommendation failed: {e}")
        return {"recommendations": []}

# Git update: Triggering change for push
