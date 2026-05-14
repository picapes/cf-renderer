# Rendering script example via python
import requests

URL = "http://127.0.0.1:8787" # replace with Cloudflare Worker URL

# example for local: 
# URL = "http://127.0.0.1:8787"

# example for hosted worker:
# URL = "https://...workers.dev"

files = {
    "cape": open("cape.png", "rb")
}

response = requests.post(URL, files=files)

print("Status:", response.status_code)

if response.status_code == 200:
    with open("out.png", "wb") as f:
        f.write(response.content)

    print("Saved as out.png")
else:
    print(response.text)
