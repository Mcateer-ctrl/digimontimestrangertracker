# Mega Digimon Tracker

A clean, modern checklist tracker for Mega-level Digimon with progress tracking and filtering.

## Features

- ✅ Interactive checklist for all Mega Digimon
- 📊 Real-time progress bar showing completion percentage
- 🎨 Filter by attribute (Vaccine, Data, Virus, Free, Unknown)
- � Direct links to Game8 wiki pages for each Digimon
- 🖼️ Support for Digimon images (optional)
- �💾 Progress saved to browser localStorage
- 🌓 Clean, modern UI with smooth animations
- 📱 Fully responsive design

## Local Development

```bash
npm install -g vercel
npm run dev
```

Visit http://localhost:3000

## Deployment

```bash
vercel
```

Follow the prompts to deploy to Vercel.

## Usage

- Click on any Digimon card to mark it as collected
- Use attribute filters to view specific types
- Track your progress with the visual progress bar
- Click "View Details" link to see more info on Game8 wiki
- Your progress is automatically saved

## Adding Images

To add Digimon images:

1. Place PNG/JPG images in `public/images/`
2. Name them exactly as the Digimon name (e.g., `Apollomon.png`, `WarGreymon.png`)
3. Recommended size: 400x400px to 600x600px
4. Images will automatically appear on cards (gracefully hidden if missing)

See `public/images/README.md` for detailed instructions.
