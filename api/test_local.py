import sys
import os

# Add current directory to path so we can import models and parser
sys.path.append(os.getcwd())

from parser import extract_text_from_pdf, extract_regex_info, parse_cv_with_llm
from models import CVData

def test_extraction():
    sample_cv = r"c:\DUAN\Phân tích CV\CV NGUYEN QUOC KHANH.pdf"
    
    if not os.path.exists(sample_cv):
        print(f"Error: Sample CV not found at {sample_cv}")
        return

    print("--- 1. Testing PDF Text Extraction ---")
    try:
        text = extract_text_from_pdf(sample_cv)
        print(f"Text length: {len(text)} characters")
        # Use repr() or encode to avoid terminal print errors
        print("First 200 chars:", text[:200].encode('ascii', 'ignore').decode('ascii'))
    except Exception as e:
        print(f"Failed to extract text: {e}")
        return

    print("\n--- 2. Testing RegEx Extraction ---")
    basic_info = extract_regex_info(text)
    print("Extracted Info:", basic_info)
    
    print("\n--- 3. Testing Ollama (Llama3) Integration ---")
    print("Note: This requires Ollama to be running with llama3 model.")
    # We'll try to call it and see if it works
    llm_info = parse_cv_with_llm(text)
    if llm_info:
        print("LLM extracted some data (JSON looks valid).")
        print(f"Full Name: {llm_info.get('full_name')}")
        print(f"Job Title: {llm_info.get('job_title')}")
        print(f"Experience Count: {len(llm_info.get('experience', []))}")
        if llm_info.get('experience'):
            print(f"Sample Company: {llm_info['experience'][0].get('company')}")
        print(f"Education Count: {len(llm_info.get('education', []))}")
        if llm_info.get('education'):
            print(f"Sample University: {llm_info['education'][0].get('university')}")
        print(f"Projects Count: {len(llm_info.get('projects', []))}")
    else:
        print("LLM extraction failed (check if Ollama is running).")

if __name__ == "__main__":
    test_extraction()
