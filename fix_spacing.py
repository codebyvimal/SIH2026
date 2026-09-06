with open('frontend/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Tighten gaps
content = content.replace('mb-20', 'mb-12')
content = content.replace('gap-12', 'gap-8')
content = content.replace('gap-8', 'gap-6')
content = content.replace('h-[400px]', 'h-[350px] md:h-[450px]')

# 2. Adjust cards
content = content.replace('p-8', 'p-6 md:p-8')
content = content.replace('text-2xl font-bold', 'text-xl md:text-2xl font-bold')

# 3. Clean up the pills so they are not huge
content = content.replace('px-3 py-1.5 rounded-full', 'px-3 py-1 rounded-full')

with open('frontend/app/page.tsx', 'w') as f:
    f.write(content)

print("done")
