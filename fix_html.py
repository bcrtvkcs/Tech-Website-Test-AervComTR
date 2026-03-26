import os

def fix_html_files():
    for root, _, files in os.walk('.'):
        for file in files:
            if file.endswith('.htm') or file.endswith('.html'):
                filepath = os.path.join(root, file)

                # Determine relative path back to root
                rel_dir = os.path.relpath('.', root)
                if rel_dir == '.':
                    script_src = 'js/menu_fix.js'
                else:
                    script_src = f'{rel_dir}/js/menu_fix.js'

                with open(filepath, 'r') as f:
                    content = f.read()

                if 'menu_fix.js' not in content:
                    content = content.replace('</body>', f'<script src="{script_src}"></script></body>')
                    with open(filepath, 'w') as f:
                        f.write(content)

if __name__ == '__main__':
    fix_html_files()