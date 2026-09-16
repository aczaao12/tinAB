#!/usr/bin/env python3
import os
import glob
import re
import json
import subprocess

def clean_spaces(s):
    return re.sub(r"\s+", " ", s).strip()

def strip_prefix(s):
    return re.sub(r"^[A-E]\.\s*", "", s).strip()

def clean_prompt(p):
    p = clean_spaces(p)
    p = re.sub(r"^\.\s*", "", p)
    p = re.sub(r"^\d+[\.\)]\s*", "", p)
    return p.strip()

def parse_pdf(pdf_path):
    match = re.search(r"TEST\s*(\d+)", pdf_path)
    test_num = int(match.group(1)) if match else 1
    test_id = f"test-{test_num}"
    test_short_title = f"TEST {test_num}"
    test_title = f"Bài Ôn Tập TEST {test_num}"
    
    tmp_layout = f"/tmp/test_{test_num}_layout.txt"
    subprocess.run(["pdftotext", "-layout", pdf_path, tmp_layout], check=True)
    
    with open(tmp_layout, "r", encoding="utf-8") as f:
        text = f.read()
        
    # Clean page headers, moodle footers and jump-to
    text = re.sub(r"\d{1,2}/\d{1,2}/\d{2,4},\s*\d{1,2}:\d{2}\s*(?:AM|PM)\s+TEST \d+: Attempt review\s*", "", text)
    text = re.sub(r"192\.168\.\d+\.\d+/moodle[^\n]*\s+\d+/\d+\s*(\x0c)?", "", text)
    text = re.sub(r"(?:◄\s*TEST\s*\d+\s*)?Jump to\.\.\..*", "", text, flags=re.DOTALL)
    
    parts = re.split(r"(?:^|\n)\s*Question (\d+)\s*\n", text)
    questions = []
    
    for i in range(1, len(parts), 2):
        q_idx = int(parts[i])
        q_body = parts[i+1]
        
        # Clean status line
        q_body_clean = re.sub(r"^\s*(?:Not answered|Correct|Incorrect|Partially correct)\s*\n\s*Marked out of [0-9.]+\s*\n*", "", q_body)
        
        sel_match = re.search(r"\n\s*(Select one(?: or more)?):\s*\n", q_body_clean)
        if not sel_match:
            print(f"Warning: No selector found in {pdf_path} Q{q_idx}")
            continue
            
        selector_str = sel_match.group(1)
        is_multiple = "more" in selector_str.lower()
        
        prompt_raw = q_body_clean[:sel_match.start()]
        prompt = clean_prompt(prompt_raw)
        
        rest = q_body_clean[sel_match.end():]
        ans_match = re.search(r"\n\s*The correct answers? (?:is|are):\s*", rest)
        if not ans_match:
            print(f"Warning: No answer found in {pdf_path} Q{q_idx}")
            continue
            
        opts_raw = rest[:ans_match.start()]
        ans_raw = clean_spaces(rest[ans_match.end():])
        ans_raw = re.sub(r"(?:◄\s*TEST\s*\d+\s*)?Jump to\.\.\..*", "", ans_raw).strip()
        ans_raw = re.sub(r"TEST \d+ ►.*", "", ans_raw).strip()
        
        opt_chunks = [clean_spaces(c) for c in re.split(r"\n\s*\n+", opts_raw) if clean_spaces(c)]
        
        options = []
        for opt_idx, opt_text in enumerate(opt_chunks):
            pref_m = re.match(r"^([A-E])\.\s*(.*)", opt_text)
            if pref_m:
                opt_letter = pref_m.group(1)
                opt_content = pref_m.group(2).strip()
            else:
                opt_letter = chr(ord("A") + opt_idx)
                opt_content = opt_text.strip()
                
            opt_core = strip_prefix(opt_text)
            ans_core = strip_prefix(ans_raw)
            
            is_corr = False
            if not is_multiple:
                if opt_text == ans_raw or opt_core == ans_core:
                    is_corr = True
            else:
                ans_items = [strip_prefix(clean_spaces(x)) for x in ans_raw.split(",")]
                if opt_text == ans_raw or opt_core == ans_core or opt_core in ans_raw or opt_text in ans_raw or any(opt_core == it for it in ans_items):
                    is_corr = True
                    
            options.append({
                "id": opt_letter,
                "text": opt_content if pref_m else opt_text,
                "isCorrect": is_corr
            })
            
        corr_count = sum(1 for o in options if o["isCorrect"])
        q_type = "multiple" if (is_multiple or corr_count > 1) else "single"
        
        questions.append({
            "id": f"{test_id}-q{q_idx}",
            "testId": test_id,
            "testTitle": test_short_title,
            "questionNumber": q_idx,
            "prompt": prompt,
            "type": q_type,
            "options": options,
            "correctAnswerText": ans_raw
        })
        
    return {
        "id": test_id,
        "title": test_title,
        "shortTitle": test_short_title,
        "filename": os.path.basename(pdf_path),
        "totalQuestions": len(questions),
        "questions": questions
    }

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    pdf_files = sorted(glob.glob(os.path.join(root_dir, "TEST *.pdf")))
    
    print(f"Found {len(pdf_files)} PDF files.")
    test_suites = []
    
    for pdf in pdf_files:
        suite = parse_pdf(pdf)
        print(f"Parsed {suite['shortTitle']}: {suite['totalQuestions']} questions")
        test_suites.append(suite)
        
    out_json = os.path.join(root_dir, "src", "data", "testsData.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(test_suites, f, ensure_ascii=False, indent=2)
    print(f"Saved JSON data to {out_json}")
    
    out_ts = os.path.join(root_dir, "src", "data", "testsData.ts")
    with open(out_ts, "w", encoding="utf-8") as f:
        f.write("import type { TestSuite } from './types';\n\n")
        f.write("export const TEST_SUITES: TestSuite[] = ")
        f.write(json.dumps(test_suites, ensure_ascii=False, indent=2))
        f.write(";\n\n")
        f.write("export const ALL_TESTS_MAP = new Map(TEST_SUITES.map(t => [t.id, t]));\n")
    print(f"Saved TS data to {out_ts}")

if __name__ == "__main__":
    main()
