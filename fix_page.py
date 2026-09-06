import re

with open('frontend/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Remove duplicate background chakra
content = re.sub(r'\{\/\* Background Ashoka Chakra Watermark \*\/\}.*?<\/svg>\n\s*<\/div>', '', content, flags=re.DOTALL)

# 2. Fix massive h1
content = content.replace('text-5xl md:text-[5rem]', 'text-4xl md:text-[2.75rem]')
content = content.replace('leading-[1.1]', 'leading-tight')

# 3. Replace gray hero placeholder with the image
placeholder_pattern = r'<div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center relative">.*?<div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"><\/div>\n\s*<\/div>'
replacement = '<img src="/hero-building.png" alt="Parliament Building" className="w-full h-full object-cover absolute inset-0" />'
content = re.sub(placeholder_pattern, replacement, content, flags=re.DOTALL)

with open('frontend/app/page.tsx', 'w') as f:
    f.write(content)

print("done")
