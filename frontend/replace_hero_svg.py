from pathlib import Path
import re

path = Path('src/pages/Home.jsx')
text = path.read_text(encoding='utf-8')
pattern = re.compile(r'<svg\s+width="665".*?</svg>', re.DOTALL)
if not pattern.search(text):
    raise SystemExit('SVG block not found')
replacement = '''<img
              src={bannerImg}
              alt="Homepage hero banner"
              className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 w-40 h-40 md:w-52 md:h-52 drop-shadow-xl object-cover rounded-xl"
            />'''
new_text = pattern.sub(replacement, text, count=1)
path.write_text(new_text, encoding='utf-8')
print('updated')
