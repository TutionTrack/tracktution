import os
import glob

client_dir = "/Users/s.krishna1_gis/Movies/Antigravity/Track-Tutions-Sessions/client/src/pages"
files = glob.glob(os.path.join(client_dir, "*.tsx"))

mapping = {
    '/api/auth/login': '/api/auth.php?action=login',
    '/api/auth/register': '/api/auth.php?action=register',
    '/api/auth/verify-otp': '/api/auth.php?action=verify',
    '/api/students': '/api/students.php',
    '/api/sessions': '/api/sessions.php',
    '/api/logs': '/api/logs.php',
    '/api/reports': '/api/reports.php'
}

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()
    
    for old, new in mapping.items():
        content = content.replace(f'"{old}"', f'"{new}"')
        content = content.replace(f"'{old}'", f"'{new}'")
    
    with open(file_path, "w") as f:
        f.write(content)

print("Updated frontend to use PHP API endpoints.")
