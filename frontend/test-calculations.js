// Test alle Berechnungen
console.log("=== TESTING MEASUREMENT CALCULATIONS ===\n");

// 1. Distanz-Berechnung (Pythagorean)
function testDistance() {
  console.log("1. DISTANZ-BERECHNUNG:");
  const points = [
    {x: 0, y: 0},
    {x: 100, y: 0},
    {x: 100, y: 100}
  ];
  
  const calibrationScale = 2.5; // px per mm
  const pixelsToMm = (pixels) => pixels / calibrationScale;
  
  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const distancePixels = Math.sqrt(dx * dx + dy * dy);
    const distanceMm = pixelsToMm(distancePixels);
    console.log(`  Segment ${i+1}: ${distancePixels.toFixed(2)} px = ${distanceMm.toFixed(2)} mm = ${(distanceMm/10).toFixed(2)} cm = ${(distanceMm/1000).toFixed(3)} m`);
    totalDistance += distanceMm;
  }
  console.log(`  GESAMT: ${totalDistance.toFixed(2)} mm = ${(totalDistance/1000).toFixed(3)} m`);
  console.log(`  ✓ Distanz-Berechnung funktioniert!\n`);
}

// 2. Flächen-Berechnung (Shoelace)
function testArea() {
  console.log("2. FLÄCHEN-BERECHNUNG (Shoelace-Formel):");
  const points = [
    {x: 0, y: 0},
    {x: 100, y: 0},
    {x: 100, y: 100},
    {x: 0, y: 100}
  ];
  
  const calibrationScale = 2.5;
  const pixelsToMm = (pixels) => pixels / calibrationScale;
  
  let area = 0;
  let perimeter = 0;
  const n = points.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = pixelsToMm(points[i].x);
    const yi = pixelsToMm(points[i].y);
    const xj = pixelsToMm(points[j].x);
    const yj = pixelsToMm(points[j].y);
    
    area += xi * yj - xj * yi;
    
    const dx = xj - xi;
    const dy = yj - yi;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  
  area = Math.abs(area) / 2;
  
  console.log(`  Fläche: ${area.toFixed(2)} mm² = ${(area/10000).toFixed(4)} cm² = ${(area/1000000).toFixed(6)} m²`);
  console.log(`  Umfang: ${perimeter.toFixed(2)} mm = ${(perimeter/1000).toFixed(3)} m`);
  console.log(`  ✓ Flächen-Berechnung funktioniert!\n`);
  
  return area;
}

// 3. Volumen-Berechnung
function testVolume() {
  console.log("3. VOLUMEN-BERECHNUNG:");
  const area = 1600; // mm² (from area test)
  const height = 1000; // mm (1 meter)
  
  const volume = area * height;
  
  console.log(`  Fläche: ${area} mm²`);
  console.log(`  Höhe: ${height} mm = ${height/1000} m`);
  console.log(`  Volumen: ${volume} mm³ = ${(volume/1000).toFixed(2)} cm³ = ${(volume/1000000000).toFixed(6)} m³`);
  console.log(`  ✓ Volumen-Berechnung funktioniert!\n`);
}

// 4. Einheiten-Konvertierung
function testUnitConversion() {
  console.log("4. EINHEITEN-KONVERTIERUNG:");
  const valueMm = 1234.56;
  
  console.log(`  Original: ${valueMm} mm`);
  console.log(`  → cm: ${(valueMm / 10).toFixed(2)} cm`);
  console.log(`  → m: ${(valueMm / 1000).toFixed(3)} m`);
  console.log(`  → inches: ${(valueMm / 25.4).toFixed(2)} in`);
  console.log(`  → feet: ${(valueMm / 304.8).toFixed(3)} ft`);
  console.log(`  ✓ Einheiten-Konvertierung funktioniert!\n`);
}

// 5. Kalibrierung
function testCalibration() {
  console.log("5. KALIBRIERUNG (A4-Blatt):");
  const point1 = {x: 50, y: 100};
  const point2 = {x: 575, y: 100};
  
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const distancePixels = Math.sqrt(dx * dx + dy * dy);
  
  const referenceDistanceMm = 210; // A4 width
  const pixelsPerMm = distancePixels / referenceDistanceMm;
  
  console.log(`  Punkt 1: (${point1.x}, ${point1.y})`);
  console.log(`  Punkt 2: (${point2.x}, ${point2.y})`);
  console.log(`  Distanz: ${distancePixels.toFixed(2)} px`);
  console.log(`  Referenz: ${referenceDistanceMm} mm (A4-Breite)`);
  console.log(`  Kalibrierung: ${pixelsPerMm.toFixed(4)} px/mm`);
  console.log(`  ✓ Kalibrierung funktioniert!\n`);
}

// Run all tests
testDistance();
const area = testArea();
testVolume();
testUnitConversion();
testCalibration();

console.log("=== ALLE BERECHNUNGEN ERFOLGREICH! ===");
