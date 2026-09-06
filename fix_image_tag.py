import re

with open('frontend/app/page.tsx', 'r') as f:
    content = f.read()

# Add Image import if it doesn't exist
if "import Image from 'next/image';" not in content:
    content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport Image from 'next/image';")

# Replace img tag
old_img = '<img src="/hero-building.png" alt="Parliament Building" className="w-full h-full object-cover absolute inset-0" />'
new_img = '<Image src="/hero-building.png" alt="Parliament Building" fill className="object-cover" priority />'
content = content.replace(old_img, new_img)

with open('frontend/app/page.tsx', 'w') as f:
    f.write(content)

print("Image tag fixed")
