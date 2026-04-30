function average(values) {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  
  function getRecentChanges(history = []) {
    if (history.length < 2) {
      return {
        waterRise: 0,
        rainRise: 0,
        turbidityRise: 0,
        humidityRise: 0,
      };
    }
  
    const first = history[0];
    const last = history[history.length - 1];
  
    return {
      waterRise: (last.waterLevelCm ?? 0) - (first.waterLevelCm ?? 0),
      rainRise: (last.rainMm ?? 0) - (first.rainMm ?? 0),
      turbidityRise: (last.turbidity ?? 0) - (first.turbidity ?? 0),
      humidityRise: (last.humidity ?? 0) - (first.humidity ?? 0),
    };
  }
  
  function evaluateRisk(current, history = []) {
    const waterLevel = Number(current.waterLevelCm ?? 0);
    const rain = Number(current.rainMm ?? 0);
    const turbidity = Number(current.turbidity ?? 0);
    const humidity = Number(current.humidity ?? 0);
  
    const changes = getRecentChanges(history);
  
    const waterHistory = history
      .map((item) => Number(item.waterLevelCm ?? 0))
      .filter((value) => !isNaN(value));
  
    const rainHistory = history
      .map((item) => Number(item.rainMm ?? 0))
      .filter((value) => !isNaN(value));
  
    const turbidityHistory = history
      .map((item) => Number(item.turbidity ?? 0))
      .filter((value) => !isNaN(value));
  
    const humidityHistory = history
      .map((item) => Number(item.humidity ?? 0))
      .filter((value) => !isNaN(value));
  
    const avgWater = average(waterHistory);
    const avgRain = average(rainHistory);
    const avgTurbidity = average(turbidityHistory);
    const avgHumidity = average(humidityHistory);
  
    let score = 0;
    const reasons = [];
  
    // Nivel de agua actual
    if (waterLevel >= 120) {
      score += 60;
      reasons.push("Nivel de agua muy alto");
    } else if (waterLevel >= 80) {
      score += 30;
      reasons.push("Nivel de agua elevado");
    }
  
    // Lluvia actual
    if (rain >= 40) {
      score += 25;
      reasons.push("Lluvia intensa");
    } else if (rain >= 20) {
      score += 12;
      reasons.push("Lluvia moderada-alta");
    }
  
    // Turbidez actual
    if (turbidity >= 80) {
      score += 15;
      reasons.push("Turbidez elevada");
    } else if (turbidity >= 50) {
      score += 8;
      reasons.push("Turbidez anómala");
    }
  
    // Humedad actual
    if (humidity >= 85) {
      score += 10;
      reasons.push("Humedad muy alta");
    } else if (humidity >= 70) {
      score += 5;
      reasons.push("Humedad elevada");
    }
  
    // Comparación con comportamiento reciente
    if (waterHistory.length >= 3 && waterLevel > avgWater + 20) {
      score += 15;
      reasons.push("Nivel de agua claramente por encima del comportamiento reciente");
    } else if (waterHistory.length >= 3 && waterLevel > avgWater + 10) {
      score += 8;
      reasons.push("Nivel de agua por encima de la media reciente");
    }
  
    if (rainHistory.length >= 3 && rain > avgRain + 15) {
      score += 10;
      reasons.push("Lluvia superior al comportamiento reciente");
    }
  
    if (turbidityHistory.length >= 3 && turbidity > avgTurbidity + 20) {
      score += 8;
      reasons.push("Turbidez superior al comportamiento reciente");
    }
  
    if (humidityHistory.length >= 3 && humidity > avgHumidity + 15) {
      score += 6;
      reasons.push("Humedad superior al comportamiento reciente");
    }
  
    // Cambios rápidos
    if (changes.waterRise >= 20) {
      score += 30;
      reasons.push("Subida rápida del nivel de agua");
    } else if (changes.waterRise >= 10) {
      score += 15;
      reasons.push("Tendencia ascendente del nivel de agua");
    }
  
    if (changes.rainRise >= 15) {
      score += 10;
      reasons.push("Aumento rápido de la lluvia");
    } else if (changes.rainRise >= 8) {
      score += 5;
      reasons.push("Incremento apreciable de la lluvia");
    }
  
    if (changes.turbidityRise >= 20) {
      score += 8;
      reasons.push("Aumento rápido de la turbidez");
    }
  
    if (changes.humidityRise >= 15) {
      score += 6;
      reasons.push("Aumento rápido de la humedad");
    }
  
    // Combinaciones más peligrosas
    if (waterLevel >= 90 && rain >= 25) {
      score += 20;
      reasons.push("Combinación de nivel alto y lluvia");
    }
  
    if (waterLevel >= 80 && changes.waterRise >= 10) {
      score += 15;
      reasons.push("Nivel elevado con crecimiento rápido");
    }
  
    if (rain >= 20 && changes.waterRise >= 10) {
      score += 10;
      reasons.push("Lluvia significativa junto a subida del nivel");
    }
  
    if (waterLevel >= 80 && turbidity >= 60) {
      score += 10;
      reasons.push("Nivel elevado con turbidez alta");
    }
  
    if (rain >= 20 && humidity >= 70) {
      score += 8;
      reasons.push("Lluvia relevante con humedad elevada");
    }
  
    if (waterLevel >= 90 && humidity >= 75) {
      score += 8;
      reasons.push("Nivel alto con humedad muy elevada");
    }
  
    let risk = "OK";
    let label = "Normal";
  
    if (score >= 70) {
      risk = "ALERT";
      label = "Alerta";
    } else if (score >= 30) {
      risk = "WARN";
      label = "Vigilancia";
    }
  
    return {
      risk,
      label,
      score,
      reasons,
      summary: reasons.length
        ? reasons.join(", ")
        : "Valores dentro de la normalidad",
    };
  }
  
  module.exports = {
    evaluateRisk,
  };