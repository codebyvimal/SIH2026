import re

with open('frontend/components/NavBar.tsx', 'r') as f:
    content = f.read()

replacement = """
            <div className="hidden sm:flex flex-col justify-center">
              <span className="text-[10px] sm:text-xs font-medium text-gray-300 leading-tight">Government of India</span>
              <span className="text-[10px] sm:text-xs font-medium text-gray-300 leading-tight">MoSPI</span>
            </div>
            <div className="h-8 w-px bg-white/30 hidden md:block mx-1 md:mx-2"></div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-sm md:text-lg leading-tight whitespace-nowrap">National Learning Portal</span>
              <span className="text-[10px] text-gray-300 leading-tight hidden md:block">Ministry of Statistics & Programme Implementation</span>
            </div>
"""

# Find the block to replace
pattern = r'<div className="hidden sm:flex flex-col justify-center">.*?<span className="font-bold text-sm md:text-lg">National Learning Portal<\/span>'
content = re.sub(pattern, replacement.strip(), content, flags=re.DOTALL)

with open('frontend/components/NavBar.tsx', 'w') as f:
    f.write(content)

print("done")
