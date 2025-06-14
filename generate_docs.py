#!/usr/bin/env python3
"""
Script to generate a comprehensive project documentation file.
Creates a file with:
1. Project tree structure (production code only)
2. Full content of each production file
"""

import os
from pathlib import Path
from datetime import datetime

# Project root directory
PROJECT_ROOT = Path(__file__).parent

def generate_focused_tree():
    """Generate a focused tree structure for production code."""
    tree_lines = []
    tree_lines.append("shiny-broccoli/\n")
    
    # Define the structure we want to show
    structure = {
        'README.md': None,
        'frontend/': {
            'package.json': None,
            'vite.config.ts': None,
            'index.html': None,
            'src/': {
                'main.tsx': None,
                'App.tsx': None,
                'index.css': None,
                'router.tsx': None,
                'components/': 'directory',
                'hooks/': 'directory',
                'pages/': 'directory',
                'services/': 'directory'
            }
        },
        'backend/': {
            'requirements.txt': None,
            'app/': {
                'main.py': None,
                'middleware.py': None,
                'logging.py': None,
                'core/': 'directory',
                'api/': 'directory'
            },
            'services/': 'directory'
        },
        'docs/': 'directory'
    }
    
    def build_tree(items, prefix="", is_root=False):
        if not isinstance(items, dict):
            return ""
        
        lines = []
        sorted_items = sorted(items.items(), key=lambda x: (x[0].endswith('/'), x[0]))
        
        for i, (name, content) in enumerate(sorted_items):
            is_last = i == len(sorted_items) - 1
            connector = "└── " if is_last else "├── "
            
            if name.endswith('/'):
                # Directory
                dir_name = name.rstrip('/')
                lines.append(f"{prefix}{connector}{dir_name}/\n")
                
                if content == 'directory':
                    # Show actual directory contents
                    actual_path = PROJECT_ROOT / dir_name if is_root else PROJECT_ROOT / prefix.replace('│   ', '').replace('    ', '').replace('├── ', '').replace('└── ', '').strip() / dir_name
                    if actual_path.exists():
                        actual_files = []
                        for item in actual_path.iterdir():
                            if item.is_file() and should_include_file(item):
                                actual_files.append(item.name)
                            elif item.is_dir() and not should_exclude_path(item.name):
                                actual_files.append(f"{item.name}/")
                        
                        for j, file_name in enumerate(sorted(actual_files)):
                            is_file_last = j == len(actual_files) - 1
                            file_connector = "└── " if is_file_last else "├── "
                            extension = "    " if is_last else "│   "
                            lines.append(f"{prefix}{extension}{file_connector}{file_name}\n")
                elif isinstance(content, dict):
                    # Nested structure
                    extension = "    " if is_last else "│   "
                    lines.append(build_tree(content, prefix + extension))
            else:
                # File
                lines.append(f"{prefix}{connector}{name}\n")
        
        return "".join(lines)
    
    tree_lines.append(build_tree(structure, is_root=True))
    return "".join(tree_lines)

def should_exclude_path(path_name):
    """Check if a path should be excluded."""
    exclude_dirs = {
        '__pycache__', 'node_modules', '.venv', 'venv', 'dist', 'build', '.git',
        '.next', 'coverage', '.pytest_cache', '.mypy_cache', 'logs', 'tests', 'test'
    }
    return path_name in exclude_dirs or path_name.startswith('.')

def should_include_file(file_path):
    """Check if a file should be included in content output."""
    exclude_files = {
        '.DS_Store', '.env', '.env.local', '.env.production', 'package-lock.json',
        'yarn.lock', 'poetry.lock', 'dev_init.sh', 'run_tests.sh', 'DEVELOPMENT.md',
        'AGENTS.md', 'CHANGELOG.md', 'LICENSE', 'mask.png', 'generate_project_docs.py',
        'PROJECT_DOCUMENTATION.md'
    }
    
    if file_path.name in exclude_files:
        return False
    
    # Check if it's a test file
    if 'test' in file_path.name.lower() or 'spec' in file_path.name.lower():
        return False
    
    # Check if it's in a test directory
    for part in file_path.parts:
        if 'test' in part.lower() or 'spec' in part.lower():
            return False
    
    # Check file extension
    include_extensions = {'.py', '.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.md', '.yml', '.yaml'}
    return file_path.suffix in include_extensions

def collect_production_files():
    """Collect all production files with their relative paths."""
    files = []
    
    # Define specific directories to include
    include_dirs = [
        PROJECT_ROOT / 'frontend' / 'src',
        PROJECT_ROOT / 'backend' / 'app',
        PROJECT_ROOT / 'backend' / 'services',
        PROJECT_ROOT / 'docs'
    ]
    
    # Add specific root files
    root_files = ['README.md']
    for root_file in root_files:
        root_path = PROJECT_ROOT / root_file
        if root_path.exists():
            files.append((Path(root_file), root_path))
    
    # Add frontend config files
    frontend_files = ['package.json', 'vite.config.ts', 'index.html']
    for frontend_file in frontend_files:
        file_path = PROJECT_ROOT / 'frontend' / frontend_file
        if file_path.exists():
            files.append((Path('frontend') / frontend_file, file_path))
    
    # Add backend config files
    backend_files = ['requirements.txt']
    for backend_file in backend_files:
        file_path = PROJECT_ROOT / 'backend' / backend_file
        if file_path.exists():
            files.append((Path('backend') / backend_file, file_path))
    
    # Collect files from specific directories
    for dir_path in include_dirs:
        if dir_path.exists():
            for item in dir_path.rglob('*'):
                if item.is_file() and should_include_file(item):
                    relative_path = item.relative_to(PROJECT_ROOT)
                    files.append((relative_path, item))
    
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
        '.ts': 'typescript',
        '.tsx': 'tsx',
        '.js': 'javascript',
        '.jsx': 'jsx',
        '.css': 'css',
        '.html': 'html',
        '.json': 'json',
        '.md': 'markdown',
        '.yml': 'yaml',
        '.yaml': 'yaml'
    }
    return mapping.get(ext, '')

def main():
    """Generate the project documentation file."""
    output_file = PROJECT_ROOT / "PROJECT_DOCUMENTATION.md"
    
    print(f"Generating project documentation...")
    print(f"Project root: {PROJECT_ROOT}")
    print(f"Output file: {output_file}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        # Write header
        f.write("# Shiny Broccoli - Project Documentation\n\n")
        f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("This document contains the complete structure and source code of the Shiny Broccoli project (production code only).\n\n")
        
        # Write project tree
        f.write("## Project Structure\n\n")
        f.write("```\n")
        tree = generate_focused_tree()
        f.write(tree)
        f.write("```\n\n")
        
        # Write file contents
        f.write("## File Contents\n\n")
        
        # Collect all production files
        files = collect_production_files()
        
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

if __name__ == "__main__":
    main()
