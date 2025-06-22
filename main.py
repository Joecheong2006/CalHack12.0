"""
Smart README.md Generator using OpenAI API
Scans project directory and generates professional README.md files automatically.
"""

import os
import sys
import argparse
from pathlib import Path
from openai import OpenAI
from google import genai
from google.genai import types
import json
from typing import Dict, List, Any, Set, Optional
import fnmatch

class ReadmeGenerator:
    def __init__(self, api_key: str = None, provider: str = "openai"):
        """
        Initialize the README generator with AI API.
        
        Args:
            api_key: API key for the chosen provider. If None, will try to get from environment variable.
            provider: AI provider to use ("openai" or "gemini")
        """
        self.provider = provider.lower()
        
        if self.provider == "openai":
            if api_key:
                self.client = OpenAI(api_key=api_key)
            else:
                api_key = os.getenv('OPENAI_API_KEY')
                if not api_key:
                    raise ValueError(
                        "OpenAI API key not provided. Set OPENAI_API_KEY environment variable "
                        "or pass api_key parameter."
                    )
                self.client = OpenAI(api_key=api_key)
                
        elif self.provider == "gemini":
            if api_key:
                print(f"Using provided API key (length: {len(api_key)})")
                self.client = genai.Client(api_key=api_key)
            else:
                api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
                if not api_key:
                    raise ValueError(
                        "Gemini API key not provided. Set GEMINI_API_KEY or GOOGLE_API_KEY "
                        "environment variable or pass api_key parameter."
                    )
                print(f"Using API key from environment (length: {len(api_key)})")
                self.client = genai.Client(api_key=api_key)
            
            # Test the API key with a simple request
            try:
                test_response = self.client.models.generate_content(
                    model="gemini-2.0-flash-exp",
                    contents="Test",
                    config=types.GenerateContentConfig(
                        max_output_tokens=10
                    )
                )
                print("✓ Gemini API key validated successfully")
            except Exception as e:
                raise ValueError(f"Gemini API key validation failed: {str(e)}")
            
        else:
            raise ValueError(f"Unsupported provider: {provider}. Use 'openai' or 'gemini'")
        
        # File extensions to analyze for content
        self.code_extensions = {
            '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', 
            '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala',
            '.html', '.css', '.scss', '.sass', '.vue', '.svelte', '.r', '.m'
        }
        
        # Configuration files to look for
        self.config_files = {
            'package.json', 'requirements.txt', 'Pipfile', 'pyproject.toml',
            'Cargo.toml', 'pom.xml', 'build.gradle', 'composer.json',
            'Gemfile', 'go.mod', 'Dockerfile', 'docker-compose.yml',
            '.gitignore', 'LICENSE', 'MANIFEST.in', 'setup.py', 'setup.cfg'
        }
        
        # Directories to ignore
        self.ignore_dirs = {
            'node_modules', '__pycache__', '.git', '.vscode', '.idea',
            'venv', 'env', '.env', 'dist', 'build', 'target', '.next',
            '.nuxt', 'coverage', '.coverage', '.pytest_cache', '.mypy_cache'
        }

    def scan_directory(self, directory: str) -> Dict[str, Any]:
        """
        Scan directory and extract project information.
        
        Args:
            directory: Path to the project directory
            
        Returns:
            Dictionary containing project analysis
        """
        directory = Path(directory).resolve()
        if not directory.exists():
            raise ValueError(f"Directory {directory} does not exist")
        
        analysis = {
            'project_name': directory.name,
            'directory_structure': [],
            'file_types': {},
            'config_files': {},
            'code_snippets': {},
            'total_files': 0,
            'main_language': None,
            'dependencies': {},
            'has_tests': False,
            'has_docs': False,
            'license_type': None
        }
        
        # Walk through directory
        for root, dirs, files in os.walk(directory):
            # Skip ignored directories
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]
            
            root_path = Path(root)
            relative_root = root_path.relative_to(directory)
            
            if relative_root != Path('.'):
                analysis['directory_structure'].append(str(relative_root))
            
            for file in files:
                file_path = root_path / file
                relative_path = file_path.relative_to(directory)
                analysis['total_files'] += 1
                
                # Analyze file extensions
                ext = file_path.suffix.lower()
                if ext:
                    analysis['file_types'][ext] = analysis['file_types'].get(ext, 0) + 1
                
                # Check for configuration files
                if file.lower() in [cf.lower() for cf in self.config_files]:
                    analysis['config_files'][file] = str(relative_path)
                    
                    # Extract dependencies from config files
                    try:
                        if file == 'package.json':
                            analysis['dependencies'].update(self._parse_package_json(file_path))
                        elif file == 'requirements.txt':
                            analysis['dependencies'].update(self._parse_requirements_txt(file_path))
                        elif file == 'pyproject.toml':
                            analysis['dependencies'].update(self._parse_pyproject_toml(file_path))
                    except Exception as e:
                        print(f"Warning: Could not parse {file}: {e}")
                
                # Check for tests
                if 'test' in file.lower() or 'spec' in file.lower():
                    analysis['has_tests'] = True
                
                # Check for documentation
                if any(doc in file.lower() for doc in ['readme', 'doc', 'docs']):
                    analysis['has_docs'] = True
                
                # Check for license
                if 'license' in file.lower():
                    analysis['license_type'] = self._detect_license_type(file_path)
                
                # Extract code snippets from main files
                if ext in self.code_extensions and file_path.stat().st_size < 50000:  # Skip large files
                    try:
                        content = self._read_file_safely(file_path)
                        if content and len([f for f in analysis['code_snippets']]) < 5:  # Limit snippets
                            analysis['code_snippets'][str(relative_path)] = content[:1000]  # First 1000 chars
                    except Exception:
                        pass  # Skip files that can't be read
        
        # Determine main language
        if analysis['file_types']:
            analysis['main_language'] = max(analysis['file_types'], key=analysis['file_types'].get)
        
        return analysis

    def _read_file_safely(self, file_path: Path) -> str:
        """Safely read file content with multiple encoding attempts."""
        encodings = ['utf-8', 'latin-1', 'cp1252']
        for encoding in encodings:
            try:
                return file_path.read_text(encoding=encoding)
            except UnicodeDecodeError:
                continue
        return ""

    def _parse_package_json(self, file_path: Path) -> Dict[str, str]:
        """Parse package.json for dependencies."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            deps = {}
            if 'dependencies' in data:
                deps.update(data['dependencies'])
            if 'devDependencies' in data:
                deps.update(data['devDependencies'])
            return deps
        except Exception:
            return {}

    def _parse_requirements_txt(self, file_path: Path) -> Dict[str, str]:
        """Parse requirements.txt for dependencies."""
        try:
            deps = {}
            with open(file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        if '==' in line:
                            name, version = line.split('==', 1)
                            deps[name.strip()] = version.strip()
                        elif '>=' in line:
                            name = line.split('>=')[0].strip()
                            deps[name] = 'latest'
                        else:
                            deps[line] = 'latest'
            return deps
        except Exception:
            return {}

    def _parse_pyproject_toml(self, file_path: Path) -> Dict[str, str]:
        """Parse pyproject.toml for dependencies."""
        try:
            import tomli
            with open(file_path, 'rb') as f:
                data = tomli.load(f)
            deps = {}
            if 'project' in data and 'dependencies' in data['project']:
                for dep in data['project']['dependencies']:
                    if '==' in dep:
                        name, version = dep.split('==', 1)
                        deps[name.strip()] = version.strip()
                    else:
                        deps[dep.strip()] = 'latest'
            return deps
        except Exception:
            return {}

    def _detect_license_type(self, file_path: Path) -> str:
        """Detect license type from license file."""
        try:
            content = self._read_file_safely(file_path).lower()
            if 'mit' in content:
                return 'MIT'
            elif 'apache' in content:
                return 'Apache 2.0'
            elif 'gpl' in content:
                return 'GPL'
            elif 'bsd' in content:
                return 'BSD'
            else:
                return 'Custom'
        except Exception:
            return 'Unknown'

    def generate_readme(self, directory: str, output_file: str = 'README.md', output_format: str = 'markdown') -> str:
        """
        Generate README.md based on directory analysis.
        
        Args:
            directory: Path to project directory
            output_file: Output filename for README
            output_format: Output format ('markdown' or 'text')
            
        Returns:
            Generated README content
        """
        print("Scanning directory...")
        analysis = self.scan_directory(directory)
        
        print(f"Generating README with {self.provider.title()}...")
        
        # Create prompt for AI
        prompt = self._create_readme_prompt(analysis, output_format)
        
        try:
            if self.provider == "openai":
                readme_content = self._generate_with_openai(prompt, output_format)
            elif self.provider == "gemini":
                readme_content = self._generate_with_gemini(prompt, output_format)
            else:
                raise ValueError(f"Unknown provider: {self.provider}")
            
            # Convert markdown to plain text if needed
            if output_format == 'text':
                readme_content = self._markdown_to_text(readme_content)
            
            # Write to file
            output_path = Path(directory) / output_file
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(readme_content)
            
            print(f"README generated successfully at {output_path}")
            return readme_content
            
        except Exception as e:
            raise Exception(f"Failed to generate README: {str(e)}")

    def _generate_with_openai(self, prompt: str, output_format: str = 'markdown') -> str:
        """Generate README using OpenAI API."""
        format_instruction = "markdown" if output_format == 'markdown' else "plain text without markdown formatting"
        system_content = f"You are an expert technical writer specializing in creating comprehensive, professional README files for software projects. Generate clear, well-structured documentation that follows best practices. Output in {format_instruction} format."
        
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": system_content
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=2000,
            temperature=0.7
        )
        return response.choices[0].message.content

    def _generate_with_gemini(self, prompt: str, output_format: str = 'markdown') -> str:
        """Generate README using Gemini API."""
        format_instruction = "markdown" if output_format == 'markdown' else "plain text without markdown formatting"
        system_prompt = f"""You are an expert technical writer specializing in creating comprehensive, professional README files for software projects. Generate clear, well-structured documentation that follows best practices. Output in {format_instruction} format.

Here's the project analysis:

"""
        full_prompt = system_prompt + prompt
        
        response = self.client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=full_prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=2000,
                temperature=0.7
            )
        )
        return response.text

    def _markdown_to_text(self, markdown_content: str) -> str:
        """Convert markdown to plain text."""
        import re
        
        # Remove markdown syntax
        text = markdown_content
        
        # Remove headers (# ## ###)
        text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
        
        # Remove bold (**text** or __text__)
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
        text = re.sub(r'__(.*?)__', r'\1', text)
        
        # Remove italic (*text* or _text_)
        text = re.sub(r'\*(.*?)\*', r'\1', text)
        text = re.sub(r'_(.*?)_', r'\1', text)
        
        # Remove code blocks (```code```)
        text = re.sub(r'```[\s\S]*?```', '', text)
        
        # Remove inline code (`code`)
        text = re.sub(r'`(.*?)`', r'\1', text)
        
        # Remove links [text](url)
        text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
        
        # Remove images ![alt](url)
        text = re.sub(r'!\[([^\]]*)\]\([^\)]+\)', r'\1', text)
        
        # Remove list markers (- * +)
        text = re.sub(r'^[\s]*[-\*\+]\s+', '• ', text, flags=re.MULTILINE)
        
        # Remove numbered list markers
        text = re.sub(r'^[\s]*\d+\.\s+', '', text, flags=re.MULTILINE)
        
        # Remove horizontal rules
        text = re.sub(r'^[\s]*[-=]{3,}[\s]*$', '', text, flags=re.MULTILINE)
        
        # Clean up extra whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = text.strip()
        
        return text

    def _create_readme_prompt(self, analysis: Dict[str, Any], output_format: str = 'markdown') -> str:
        """Create a detailed prompt for README generation."""
        
        format_note = ""
        if output_format == 'text':
            format_note = "\n\nIMPORTANT: Generate the output in plain text format without any markdown syntax (no #, *, `, etc.). Use simple text formatting with line breaks and spacing for structure."
        
        prompt = f"""
Generate a comprehensive README file for a software project based on the following analysis:

**Project Information:**
- Project Name: {analysis['project_name']}
- Main Language: {analysis.get('main_language', 'Unknown')}
- Total Files: {analysis['total_files']}
- Has Tests: {analysis['has_tests']}
- Has Documentation: {analysis['has_docs']}
- License: {analysis.get('license_type', 'Not specified')}

**File Types Found:**
{json.dumps(analysis['file_types'], indent=2)}

**Configuration Files:**
{json.dumps(analysis['config_files'], indent=2)}

**Dependencies (sample):**
{json.dumps(dict(list(analysis['dependencies'].items())[:10]), indent=2)}

**Directory Structure:**
{chr(10).join(analysis['directory_structure'][:20])}

**Code Samples (for context):**
{json.dumps({k: v[:200] + "..." if len(v) > 200 else v for k, v in list(analysis['code_snippets'].items())[:3]}, indent=2)}

Please generate a professional README that includes:

1. **Project Title and Description** - Infer the project's purpose from the code and structure
2. **Features** - Based on the code analysis
3. **Installation Instructions** - Based on the dependencies and config files found
4. **Usage Examples** - Appropriate for the detected language/framework
5. **Project Structure** - Clean overview of the directory layout
6. **Requirements/Dependencies** - Based on the config files
7. **Contributing Guidelines** - Standard section
8. **License** - Based on detected license
9. **Additional sections** as appropriate (API docs, testing, deployment, etc.)

Make it professional, clear, and tailored to this specific project.{format_note}
"""
        
        return prompt


def test_api_key(provider: str = "gemini", api_key: str = None):
    """Test API key functionality separately."""
    print(f"Testing {provider} API key...")
    
    if provider == "gemini":
        if not api_key:
            api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
            if not api_key:
                print("❌ No API key found in environment variables")
                return False
        
        try:
            from google import genai
            from google.genai import types
            
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents="Hello, respond with just 'Working!'",
                config=types.GenerateContentConfig(
                    max_output_tokens=10
                )
            )
            print(f"✓ API key works! Response: {response.text}")
            return True
            
        except Exception as e:
            print(f"❌ API key test failed: {str(e)}")
            return False
    
    elif provider == "openai":
        if not api_key:
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                print("❌ No OpenAI API key found")
                return False
        
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Say 'Working!'"}],
                max_tokens=10
            )
            print(f"✓ OpenAI API key works! Response: {response.choices[0].message.content}")
            return True
            
        except Exception as e:
            print(f"❌ OpenAI API key test failed: {str(e)}")
            return False


def main():
    """Main CLI interface."""
    parser = argparse.ArgumentParser(description='Generate README using AI based on project directory analysis')
    parser.add_argument('directory', help='Project directory to analyze')
    parser.add_argument('-o', '--output', help='Output filename (default: README.md or readme.txt based on format)')
    parser.add_argument('-k', '--api-key', help='API key for the chosen provider')
    parser.add_argument('-p', '--provider', choices=['openai', 'gemini'], default='openai', 
                       help='AI provider to use (default: openai)')
    parser.add_argument('-f', '--format', choices=['markdown', 'text'], default='markdown',
                       help='Output format: markdown (.md) or text (.txt) (default: markdown)')
    parser.add_argument('--test-key', action='store_true', help='Test API key without generating README')
    
    args = parser.parse_args()
    
    # Set default output filename based on format if not provided
    if not args.output:
        if args.format == 'text':
            args.output = 'readme.txt'
        else:
            args.output = 'README.md'
    
    # Test API key if requested
    if args.test_key:
        success = test_api_key(args.provider, args.api_key)
        sys.exit(0 if success else 1)
    
    try:
        generator = ReadmeGenerator(api_key=args.api_key, provider=args.provider)
        readme_content = generator.generate_readme(args.directory, args.output, args.format)
        
        print("\n" + "="*50)
        print(f"Generated README ({args.format} format):")
        print("="*50)
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
