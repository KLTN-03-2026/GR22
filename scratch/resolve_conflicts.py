import os

files_to_fix = [
    r"d:\tích hợp HT 3 tín\CV DEMO\api\parser.py",
    r"d:\tích hợp HT 3 tín\CV DEMO\web\src\components\Navbar.jsx",
    r"d:\tích hợp HT 3 tín\CV DEMO\web\src\pages\Home.jsx"
]

def resolve_conflict(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        new_lines = []
        skip = False
        for line in lines:
            if line.startswith('<<<<<<< HEAD'):
                continue
            if line.startswith('======='):
                continue
            if line.startswith('>>>>>>>'):
                continue
            new_lines.append(line)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"Resolved: {filepath}")
    except Exception as e:
        print(f"Error resolving {filepath}: {e}")

if __name__ == "__main__":
    for f in files_to_fix:
        resolve_conflict(f)
