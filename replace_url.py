import os
import glob

client_dir = "/Users/s.krishna1_gis/Movies/Antigravity/Track-Tutions-Sessions/client/src/pages"
files = glob.glob(os.path.join(client_dir, "*.tsx"))

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()
    
    # Replace hardcoded localhost with an environment variable
    new_content = content.replace('"http://localhost:3000', '`${import.meta.env.VITE_API_URL || "http://localhost:3000"}` + "')
    new_content = new_content.replace("'http://localhost:3000", "`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}` + '")
    
    with open(file_path, "w") as f:
        f.write(new_content)

print("Replaced all localhost URLs with environment variables.")
