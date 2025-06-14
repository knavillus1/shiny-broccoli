#!/usr/bin/env python3
"""
General-purpose script to generate comprehensive project documentation.
Creates a file with:
1. Project tree structure (production code only)
2. Full content of each production file

Features:
- Works with any project structure (not hardcoded for specific projects)
- Automatically excludes common unwanted files and directories:
  * Build artifacts (node_modules, dist, build, __pycache__, etc.)
  * Version control (.git, .svn)
  * Environment files (.env*, venv, .venv)
  * Test files and directories (optional with --include-tests flag)
  * IDE/editor files (.vscode, .idea)
  * Lock files (package-lock.json, yarn.lock, poetry.lock)
  * Binary and media files
- Supports many programming languages and file types
- Configurable output filename and project path
- Optional tree-only mode for quick structure overview
- Optional inclusion of test files and directories
- Command-line interface with helpful options

Designed for typical web projects with frontend/backend structure.

USAGE GUIDELINES:
===============

Basic Usage:
-----------
# Generate documentation for current directory
python generate_docs.py

# Generate for a different project
python generate_docs.py --project-path /path/to/your/project

Output Options:
--------------
# Custom output filename
python generate_docs.py -o my_project_docs.md

# Generate only project tree (no file contents)
python generate_docs.py --no-content

# Limit tree depth for large projects
python generate_docs.py -d 3

Including Tests:
---------------
# Include test files and directories
python generate_docs.py --include-tests

# Tests with custom output
python generate_docs.py --include-tests -o complete_docs.md

Common Use Cases:
----------------
1. Code Review Preparation:
   python generate_docs.py -o code_review.md

2. Project Overview for New Team Members:
   python generate_docs.py --no-content -o project_structure.md

3. Complete Documentation with Tests:
   python generate_docs.py --include-tests -o full_documentation.md

4. Large Project Overview (limited depth):
   python generate_docs.py -d 2 --no-content

5. External Project Analysis:
   python generate_docs.py --project-path /path/to/external/project -o analysis.md

Best Practices:
--------------
- For large projects, start with --no-content to see the structure first
- Use --include-tests when documenting test coverage or for complete code audits
- Limit depth (-d flag) for very large codebases to avoid overwhelming output
- Use descriptive output filenames for different documentation purposes
- Place this script in your project root or tools directory

File Size Considerations:
------------------------
- Without tests: Typically 1-5 MB for medium projects
- With tests: Can be 2-3x larger
- Use --no-content for quick structure overviews (usually < 100 KB)
- Large projects may generate files > 10 MB; consider using depth limits

Supported File Types:
--------------------
Source Code: .py, .js, .jsx, .ts, .tsx, .vue, .svelte, .php, .rb, .go, .rs, .java, .c, .cpp, .cs, .swift, .kt
Styles: .css, .scss, .sass, .less
Config: .json, .yaml, .yml, .toml, .xml, .ini, .cfg
Markup: .html, .md, .txt, .rst
Build: Dockerfile, Makefile, CMakeLists.txt

Excluded by Default:
-------------------
- Build artifacts: node_modules/, dist/, build/, __pycache__/
- Dependencies: package-lock.json, yarn.lock, poetry.lock
- Environment: .env*, venv/, .venv/
- Version control: .git/, .svn/
- Tests: tests/, test/, *test.*, *spec.* (unless --include-tests)
- IDE files: .vscode/, .idea/
- Binary/media: .png, .jpg, .pdf, .zip, etc.
- OS files: .DS_Store, Thumbs.db

Tips:
----
- Run from project root for best results
- Check output file size before opening very large documentation
- Use version control to track documentation changes
- Consider gitignoring the generated documentation files
- Combine with other tools for enhanced documentation workflows
"""

import os
import argparse
from pathlib import Path
from datetime import datetime

# Project root directory (default to current directory)
PROJECT_ROOT = Path(__file__).parent

def generate_project_tree(include_tests=False):
    """Generate a tree structure for the entire project, excluding unwanted directories."""
    tree_lines = []
    project_name = PROJECT_ROOT.name
    tree_lines.append(f"{project_name}/\n")
    
    def build_tree(directory, prefix="", max_depth=None, current_depth=0):
        """Recursively build tree structure."""
        if max_depth is not None and current_depth >= max_depth:
            return ""
            
        lines = []
        try:
            items = []
            for item in directory.iterdir():
                if item.name.startswith('.'):
                    continue  # Skip hidden files/directories
                if item.is_dir() and should_exclude_path(item.name, include_tests):
                    continue
                if item.is_file() and not should_include_file(item, include_tests):
                    continue
                items.append(item)
            
            # Sort items: directories first, then files
            items.sort(key=lambda x: (x.is_file(), x.name.lower()))
            
            for i, item in enumerate(items):
                is_last = i == len(items) - 1
                connector = "└── " if is_last else "├── "
                
                if item.is_dir():
                    lines.append(f"{prefix}{connector}{item.name}/\n")
                    extension = "    " if is_last else "│   "
                    lines.append(build_tree(item, prefix + extension, max_depth, current_depth + 1))
                else:
                    lines.append(f"{prefix}{connector}{item.name}\n")
        
        except PermissionError:
            pass  # Skip directories we can't read
        
        return "".join(lines)
    
    tree_lines.append(build_tree(PROJECT_ROOT))
    return "".join(tree_lines)

def should_exclude_path(path_name, include_tests=False):
    """Check if a path should be excluded."""
    exclude_dirs = {
        # Python
        '__pycache__', '.pytest_cache', '.mypy_cache', 'venv', '.venv', 'env', '.env',
        # Node.js
        'node_modules', 'dist', 'build', '.next', 'coverage',
        # General
        '.git', '.svn', '.hg', 'logs', 'log', 'tmp', 'temp',
        # IDE/Editor
        '.vscode', '.idea', '.vs',
        # OS
        '.DS_Store', 'Thumbs.db'
    }
    
    # Testing directories - only exclude if include_tests is False
    test_dirs = {'tests', 'test', '__tests__', 'spec', 'specs'}
    
    if not include_tests:
        exclude_dirs.update(test_dirs)
    
    return path_name in exclude_dirs or path_name.startswith('.')

def should_include_file(file_path, include_tests=False):
    """Check if a file should be included in content output."""
    # Common files to exclude
    exclude_files = {
        # OS files
        '.DS_Store', 'Thumbs.db',
        # Environment files
        '.env', '.env.local', '.env.production', '.env.development',
        # Lock files
        'package-lock.json', 'yarn.lock', 'poetry.lock', 'Pipfile.lock',
        # Build/compile files
        '*.pyc', '*.pyo', '*.pyd', '__pycache__',
        # Documentation generation
        'generate_docs.py', 'generate_project_docs.py',
        'PROJECT_DOCUMENTATION.md', 'DOCUMENTATION.md',
        # Common development files
        'dev_init.sh', 'run_tests.sh',
        # Binary/media files (add more as needed)
        '*.png', '*.jpg', '*.jpeg', '*.gif', '*.ico', '*.svg',
        '*.pdf', '*.zip', '*.tar.gz', '*.exe', '*.dmg'
    }
    
    # Check exact filename matches
    if file_path.name in exclude_files:
        return False
    
    # Check if it's a test file - only exclude if include_tests is False
    if not include_tests:
        file_lower = file_path.name.lower()
        if any(test_indicator in file_lower for test_indicator in ['test', 'spec']):
            return False
        
        # Check if it's in a test directory
        for part in file_path.parts:
            part_lower = part.lower()
            if any(test_indicator in part_lower for test_indicator in ['test', 'spec', '__test__']):
                return False
    
    # Check file extension - include common source code and config files
    include_extensions = {
        # Source code
        '.py', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
        '.html', '.css', '.scss', '.sass', '.less',
        '.php', '.rb', '.go', '.rs', '.java', '.c', '.cpp', '.h', '.hpp',
        '.cs', '.swift', '.kt', '.scala', '.clj', '.elm',
        # Config and data files
        '.json', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf',
        '.xml', '.md', '.txt', '.rst',
        # Web-specific
        '.dockerfile', '.gitignore', '.gitattributes',
        # Build files
        'Makefile', 'makefile', 'CMakeLists.txt'
    }
    
    # Files without extensions that we want to include
    include_no_ext = {
        'Dockerfile', 'Makefile', 'makefile', 'Rakefile', 'Gemfile', 'Procfile'
    }
    
    if file_path.suffix.lower() in include_extensions:
        return True
    
    if file_path.name in include_no_ext:
        return True
    
    return False

def collect_production_files(include_tests=False):
    """Collect all production files with their relative paths."""
    files = []
    
    def scan_directory(directory, base_path=None):
        """Recursively scan directory for production files."""
        if base_path is None:
            base_path = directory
            
        try:
            for item in directory.iterdir():
                # Skip hidden files and excluded directories
                if item.name.startswith('.') or (item.is_dir() and should_exclude_path(item.name, include_tests)):
                    continue
                
                if item.is_file() and should_include_file(item, include_tests):
                    relative_path = item.relative_to(base_path)
                    files.append((relative_path, item))
                elif item.is_dir():
                    scan_directory(item, base_path)
        except PermissionError:
            pass  # Skip directories we can't read
    
    scan_directory(PROJECT_ROOT)
    return sorted(files, key=lambda x: str(x[0]))

def get_file_content(file_path):
    """Get the content of a file, handling encoding issues."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        try:
            with open(file_path, 'r', encoding='latin-1') as f:
                return f.read()
        except Exception:
            return "[Binary file or encoding error]"
    except Exception as e:
        return f"[Error reading file: {e}]"

def get_syntax_highlighting(file_path):
    """Get the appropriate syntax highlighting for markdown."""
    ext = file_path.suffix.lower()
    mapping = {
        '.py': 'python',
        '.js': 'javascript',
        '.jsx': 'jsx',
        '.ts': 'typescript',
        '.tsx': 'tsx',
        '.vue': 'vue',
        '.svelte': 'svelte',
        '.html': 'html',
        '.css': 'css',
        '.scss': 'scss',
        '.sass': 'sass',
        '.less': 'less',
        '.json': 'json',
        '.yaml': 'yaml',
        '.yml': 'yaml',
        '.toml': 'toml',
        '.xml': 'xml',
        '.md': 'markdown',
        '.txt': 'text',
        '.sh': 'bash',
        '.bash': 'bash',
        '.zsh': 'zsh',
        '.php': 'php',
        '.rb': 'ruby',
        '.go': 'go',
        '.rs': 'rust',
        '.java': 'java',
        '.c': 'c',
        '.cpp': 'cpp',
        '.h': 'c',
        '.hpp': 'cpp',
        '.cs': 'csharp',
        '.swift': 'swift',
        '.kt': 'kotlin',
        '.scala': 'scala',
        '.clj': 'clojure',
        '.elm': 'elm'
    }
    return mapping.get(ext, '')

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description='Generate comprehensive project documentation',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python generate_docs.py                    # Generate docs for current directory
  python generate_docs.py -o docs.md        # Custom output filename
  python generate_docs.py -d 3              # Limit tree depth to 3 levels
  python generate_docs.py --include-tests   # Include test files and directories
  python generate_docs.py --project-path /path/to/project
        """
    )
    
    parser.add_argument(
        '--project-path', 
        type=Path,
        default=Path.cwd(),
        help='Path to the project root directory (default: current directory)'
    )
    
    parser.add_argument(
        '-o', '--output',
        type=str,
        default='PROJECT_DOCUMENTATION.md',
        help='Output filename (default: PROJECT_DOCUMENTATION.md)'
    )
    
    parser.add_argument(
        '-d', '--max-depth',
        type=int,
        help='Maximum directory depth for tree structure (default: unlimited)'
    )
    
    parser.add_argument(
        '--no-content',
        action='store_true',
        help='Generate only the project tree, skip file contents'
    )
    
    parser.add_argument(
        '--include-tests',
        action='store_true',
        help='Include test files and test directories in the documentation'
    )
    
    return parser.parse_args()

def main():
    """Generate the project documentation file."""
    args = parse_arguments()
    
    global PROJECT_ROOT
    PROJECT_ROOT = args.project_path.resolve()
    
    if not PROJECT_ROOT.exists():
        print(f"Error: Project path does not exist: {PROJECT_ROOT}")
        return 1
    
    if not PROJECT_ROOT.is_dir():
        print(f"Error: Project path is not a directory: {PROJECT_ROOT}")
        return 1
    
    output_file = PROJECT_ROOT / args.output
    project_name = PROJECT_ROOT.name
    
    print(f"Generating project documentation...")
    print(f"Project root: {PROJECT_ROOT}")
    print(f"Output file: {output_file}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        # Write header
        f.write(f"# {project_name} - Project Documentation\n\n")
        f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("This document contains the complete structure and source code of the project (production code only).\n\n")
        
        # Write project tree
        f.write("## Project Structure\n\n")
        f.write("```\n")
        tree = generate_project_tree(args.include_tests)
        f.write(tree)
        f.write("```\n\n")
        
        if not args.no_content:
            # Write file contents
            f.write("## File Contents\n\n")
            
            # Collect all production files
            files = collect_production_files(args.include_tests)
            
            print(f"Found {len(files)} production files to document")
            
            for relative_path, file_path in files:
                try:
                    # Write file header
                    f.write(f"### {relative_path}\n\n")
                    f.write(f"```{get_syntax_highlighting(file_path)}\n")
                    
                    # Write file content
                    content = get_file_content(file_path)
                    f.write(content)
                    
                    # Ensure content ends with newline
                    if content and not content.endswith('\n'):
                        f.write('\n')
                    
                    f.write("```\n\n")
                    
                except Exception as e:
                    f.write(f"Error processing {relative_path}: {e}\n\n")
                    print(f"Error processing {relative_path}: {e}")
    
    print(f"Project documentation generated: {output_file}")
    file_size = output_file.stat().st_size
    print(f"File size: {file_size / 1024:.1f} KB")
    return 0

if __name__ == "__main__":
    main()
