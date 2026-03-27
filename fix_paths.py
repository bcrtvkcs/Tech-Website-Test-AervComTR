import os

def fix_html_files():
    for root, _, files in os.walk('.'):
        for file in files:
            if file.endswith('.htm') or file.endswith('.html'):
                filepath = os.path.join(root, file)

                # Determine relative path back to root
                rel_dir = os.path.relpath('.', root)
                if rel_dir == '.':
                    script_trans = 'js/translations.js'
                    script_lm = 'js/language_manager.js'
                else:
                    script_trans = f'{rel_dir}/js/translations.js'
                    script_lm = f'{rel_dir}/js/language_manager.js'

                with open(filepath, 'r') as f:
                    content = f.read()

                # Fix the paths
                import re

                # Replace existing incorrect paths
                content = re.sub(r'<script src="[^"]*translations\.js[^"]*"></script>', f'<script src="{script_trans}"></script>', content)
                content = re.sub(r'<script src="[^"]*language_manager\.js[^"]*"></script>', f'<script src="{script_lm}"></script>', content)

                with open(filepath, 'w') as f:
                    f.write(content)

if __name__ == '__main__':
    fix_html_files()