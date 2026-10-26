"""Audit local font files: python (with fonttools and brotli) scripts/verify-fonts.py."""
import hashlib
import json
from pathlib import Path
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent
polish = 'ąćęłńóśźżĄĆĘŁŃÓŚŹŻ'
records = json.loads((root / 'src/domain/google-fonts.json').read_text())
for record in records:
    for face in record['faces']:
        path = root / 'public' / face['file'].lstrip('/')
        assert hashlib.sha256(path.read_bytes()).hexdigest() == face['sha256'], path
        missing = ''.join(c for c in polish if ord(c) not in TTFont(path).getBestCmap())
        assert missing == face['missingPolish'], (path, missing)
        assert 'SIL OPEN FONT LICENSE' in (path.parent / 'OFL.txt').read_text()
    print(record['id'], 'limited Polish' if any(f['missingPolish'] for f in record['faces']) else 'Polish OK')
# Montserrat splits the repertoire between latin and latin-ext.
for style in ['normal', 'italic']:
    coverage = set()
    for subset in ['latin', 'latin-ext']:
        path = root / f'node_modules/@fontsource-variable/montserrat/files/montserrat-{subset}-wght-{style}.woff2'
        coverage.update(TTFont(path).getBestCmap())
    assert all(ord(c) in coverage for c in polish)
for path in (root / 'public/fonts/advercase').glob('*.woff2'):
    missing = ''.join(c for c in polish if ord(c) not in TTFont(path).getBestCmap())
    assert missing == 'ąćęłńśźżĄĆĘŁŃŚŹŻ'
print('Montserrat and legacy Advercase checked.')
