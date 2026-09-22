# PlantPulse

Houseplant care scheduler that runs on each plant's own clock.

**Startup idea:** most houseplants die from care by vibes. A pothos needs water every ~7 days, a cactus every ~21 - a single "water weekly" habit kills one and starves the other. PlantPulse tracks per-species care intervals, sorts your plants thirstiest-first, and flags overdue water/fertilizer before the plant shows damage.

## Use

Open `app.html`. Add a plant, pick its species (intervals come from built-in presets), and tap "Watered" / "Fertilized" when you do the task. The list re-sorts so the most overdue plant is always on top. Data persists in localStorage; no account needed.

## Engine

`engine.js` holds the pure scheduling logic (per-task due dates, overdue detection, severity ordering) and is covered by node tests. The UI is a thin render layer over it.

Part of the hourly app factory - 60+ small tools, one per hour.
