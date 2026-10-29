#!/usr/bin/env python3
"""Import the supplied cosplay photographs without trusting archive paths."""
import argparse
import pathlib
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
PHOTOS = {
    '5413810511905759132.jpg': 'kira.jpg',
    '5413810511905759177.jpg': 'l.jpg',
    '5413810511905759247.jpg': 'zoro.jpg',
    '5413810511905759256.jpg': 'anelya.jpg',
    '5413810511905759258.jpg': 'explosion.jpg',
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=pathlib.Path)
    args = parser.parse_args()
    destination = ROOT / 'assets' / 'images'
    destination.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(args.archive) as archive:
        entries = {pathlib.PurePosixPath(i.filename).name: i for i in archive.infolist()}
        missing = PHOTOS.keys() - entries.keys()
        if missing:
            raise SystemExit('Missing photographs: ' + ', '.join(sorted(missing)))
        # Validate every selected file before changing any existing assets.
        images = {}
        for original, filename in PHOTOS.items():
            entry = entries[original]
            if entry.file_size > 20_000_000:
                raise SystemExit('Image too large: ' + original)
            data = archive.read(entry)
            if not data.startswith(b'\xff\xd8\xff'):
                raise SystemExit('Expected JPEG: ' + original)
            images[filename] = data
        for filename, data in images.items():
            (destination / filename).write_bytes(data)
            print(filename, len(data), 'bytes')
    print('Imported five photographs. Extra archive entries were not used.')


if __name__ == '__main__':
    main()
