/* PlantPulse engine - pure functions for plant care schedules. */
(function (root) {
  'use strict';
  var DAY = 86400000;

  var SPECIES = {
    pothos:     { label: 'Pothos',      water: 7,  fertilize: 30 },
    monstera:   { label: 'Monstera',    water: 10, fertilize: 30 },
    succulent:  { label: 'Succulent',   water: 14, fertilize: 60 },
    snake:      { label: 'Snake plant', water: 21, fertilize: 90 },
    fiddle:     { label: 'Fiddle leaf', water: 7,  fertilize: 30 },
    cactus:     { label: 'Cactus',      water: 21, fertilize: 90 },
    fern:       { label: 'Fern',        water: 4,  fertilize: 30 },
    calathea:   { label: 'Calathea',    water: 5,  fertilize: 30 }
  };

  function toDate(iso) {
    var d = new Date(iso + (iso.length === 10 ? 'T00:00:00Z' : ''));
    if (isNaN(d.getTime())) throw new Error('bad date: ' + iso);
    return d;
  }
  function iso(d) { return new Date(d).toISOString().slice(0, 10); }
  function diffDays(laterISO, earlierISO) {
    return Math.round((toDate(laterISO) - toDate(earlierISO)) / DAY);
  }

  // one care task: last done + interval. Positive = days overdue.
  function taskStatus(lastDone, intervalDays, nowISO) {
    if (!lastDone) return { state: 'never', due: null, overdueBy: null };
    var due = iso(toDate(lastDone).getTime() + intervalDays * DAY);
    var until = diffDays(due, nowISO); // negative = overdue
    return {
      state: until < 0 ? 'overdue' : until <= 2 ? 'due-soon' : 'ok',
      due: due,
      overdueBy: until < 0 ? -until : 0,
      daysUntil: until
    };
  }

  // plant: {name, species, lastWatered, lastFertilized}
  function plantStatus(plant, nowISO) {
    var sp = SPECIES[plant.species] || { water: 7, fertilize: 30 };
    var water = taskStatus(plant.lastWatered, sp.water, nowISO);
    var fert = taskStatus(plant.lastFertilized, sp.fertilize, nowISO);
    // the worse of the two drives the plant; water outranks fertilizer on ties
    var driver, severity = { overdue: 0, 'due-soon': 1, ok: 2, never: 3 };
    var wSev = severity[water.state], fSev = severity[fert.state];
    if (wSev < fSev) driver = 'water';
    else if (fSev < wSev) driver = 'fertilize';
    else driver = (water.overdueBy || 0) >= (fert.overdueBy || 0) ? 'water' : 'fertilize';
    var worst = severity[water.state] <= severity[fert.state] ? water : fert;
    return { water: water, fertilize: fert, driver: driver, severity: severity[water.state] <= severity[fert.state] ? wSev : fSev, plant: plant };
  }

  // thirstiest first: overdue (most overdue), due-soon, ok, never
  function sortPlants(plants, nowISO) {
    return plants.map(function (p) { return plantStatus(p, nowISO); })
      .sort(function (a, b) {
        if (a.severity !== b.severity) return a.severity - b.severity;
        var aw = a.water.overdueBy || 0, bw = b.water.overdueBy || 0;
        return bw - aw;
      });
  }

  var api = { SPECIES: SPECIES, taskStatus: taskStatus, plantStatus: plantStatus, sortPlants: sortPlants };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PlantPulse = api;
})(typeof window !== 'undefined' ? window : this);
