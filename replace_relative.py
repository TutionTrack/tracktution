import os
import glob

client_dir = "/Users/s.krishna1_gis/Movies/Antigravity/Track-Tutions-Sessions/client/src/pages"
files = glob.glob(os.path.join(client_dir, "*.tsx"))

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()
    
    # Replace absolute URLs with relative paths for monolithic deployment
    content = content.replace('`${import.meta.env.VITE_API_URL || "http://localhost:3000"}` + "', '"')
    content = content.replace("`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}` + '", "'")
    content = content.replace('http://localhost:3000', '')
    
    with open(file_path, "w") as f:
        f.write(content)

print("Replaced all absolute API URLs with relative paths.")
