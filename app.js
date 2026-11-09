/**
 * NutriTrack - Vanilla Calorie & Macro Tracker
 * Pure HTML, CSS, and JS (No external libraries, No Tailwind, No CSS Variables)
 */

(function () {
  'use strict';

  // --- Constants & Storage Keys ---
  const STORAGE_KEY = 'nutritrack_app_data_v1';
  const CIRCLE_RADIUS = 55;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ~345.575

  // Default initial configuration
  const DEFAULT_SETTINGS = {
    calorieGoal: 2000,
    proteinGoal: 140,
    carbsGoal: 220,
    fatGoal: 65,
    waterGoal: 8
  };

  // --- App State ---
  let state = {
    currentDate: getTodayString(),
    settings: { ...DEFAULT_SETTINGS },
    days: {}
  };

  // --- Utility Functions ---
  function getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDateDisplay(dateStr) {
    const today = getTodayString();
    
    // Parse parts to avoid UTC timezone offset issues
    const parts = dateStr.split('-');
    const targetDate = new Date(parts[0], parseInt(parts[1], 10) - 1, parts[2]);

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const compareDate = new Date(targetDate);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === todayDate.getTime()) {
      return 'Today';
    } else if (compareDate.getTime() === yesterdayDate.getTime()) {
      return 'Yesterday';
    } else if (compareDate.getTime() === tomorrowDate.getTime()) {
      return 'Tomorrow';
    }

    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return targetDate.toLocaleDateString(undefined, options);
  }

  function addDays(dateStr, daysCount) {
    const parts = dateStr.split('-');
    const d = new Date(parts[0], parseInt(parts[1], 10) - 1, parts[2]);
    d.setDate(d.getDate() + daysCount);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function generateId() {
    return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  // --- LocalStorage Management ---
  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          state.settings = { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) };
          state.days = parsed.days || {};
          return true;
        }
      }
    } catch (err) {
      console.error('Error loading data from localStorage:', err);
    }
    return false;
  }

  function saveToStorage() {
    try {
      const payload = {
        settings: state.settings,
        days: state.days
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
      showToast('Warning: Unable to save data to storage.');
    }
  }

  function seedSampleDataIfEmpty() {
    // If no days logged at all, seed today with realistic data so app isn't blank
    const dayKeys = Object.keys(state.days);
    if (dayKeys.length === 0) {
      const today = getTodayString();
      state.days[today] = {
        water: 4,
        meals: {
          breakfast: [
            {
              id: generateId(),
              name: 'Oatmeal with Blueberries & Honey',
              calories: 310,
              protein: 10,
              carbs: 58,
              fat: 5
            },
            {
              id: generateId(),
              name: 'Black Coffee',
              calories: 5,
              protein: 0.3,
              carbs: 0.5,
              fat: 0
            }
          ],
          lunch: [
            {
              id: generateId(),
              name: 'Grilled Chicken Salad with Olive Oil',
              calories: 450,
              protein: 42,
              carbs: 12,
              fat: 22
            }
          ],
          dinner: [],
          snack: [
            {
              id: generateId(),
              name: 'Greek Yogurt with Almonds',
              calories: 190,
              protein: 16,
              carbs: 9,
              fat: 8
            }
          ]
        }
      };

      // Also add some entries for previous 2 days for the trend chart
      const yesterday = addDays(today, -1);
      state.days[yesterday] = {
        water: 6,
        meals: {
          breakfast: [{ id: generateId(), name: 'Eggs & Whole Wheat Toast', calories: 380, protein: 22, carbs: 28, fat: 16 }],
          lunch: [{ id: generateId(), name: 'Turkey & Avocado Wrap', calories: 520, protein: 35, carbs: 45, fat: 18 }],
          dinner: [{ id: generateId(), name: 'Salmon with Brown Rice', calories: 650, protein: 44, carbs: 50, fat: 24 }],
          snack: [{ id: generateId(), name: 'Apple with Peanut Butter', calories: 230, protein: 5, carbs: 28, fat: 12 }]
        }
      };

      const twoDaysAgo = addDays(today, -2);
      state.days[twoDaysAgo] = {
        water: 7,
        meals: {
          breakfast: [{ id: generateId(), name: 'Protein Smoothie Bowl', calories: 420, protein: 30, carbs: 55, fat: 8 }],
          lunch: [{ id: generateId(), name: 'Quinoa Veggie Bowl', calories: 480, protein: 18, carbs: 68, fat: 14 }],
          dinner: [{ id: generateId(), name: 'Steak with Sweet Potato', calories: 710, protein: 55, carbs: 42, fat: 28 }],
          snack: [{ id: generateId(), name: 'Mixed Nuts', calories: 180, protein: 6, carbs: 6, fat: 16 }]
        }
      };

      saveToStorage();
    }
  }

  function getActiveDayData(dateStr) {
    if (!state.days[dateStr]) {
      state.days[dateStr] = {
        water: 0,
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: []
        }
      };
    }
    return state.days[dateStr];
  }

  // --- UI Notifications (Toast) ---
  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  // --- Rendering Functions ---

  function renderDate() {
    const labelEl = document.getElementById('date-label');
    const pickerEl = document.getElementById('date-picker');
    if (labelEl) labelEl.textContent = formatDateDisplay(state.currentDate);
    if (pickerEl) pickerEl.value = state.currentDate;
  }

  function renderSummary() {
    const dayData = getActiveDayData(state.currentDate);
    const goals = state.settings;

    // Calculate consumed totals
    let totalCal = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const meals = dayData.meals;
    Object.keys(meals).forEach(category => {
      meals[category].forEach(item => {
        totalCal += Number(item.calories) || 0;
        totalProtein += Number(item.protein) || 0;
        totalCarbs += Number(item.carbs) || 0;
        totalFat += Number(item.fat) || 0;
      });
    });

    // Round values
    totalCal = Math.round(totalCal);
    totalProtein = Math.round(totalProtein * 10) / 10;
    totalCarbs = Math.round(totalCarbs * 10) / 10;
    totalFat = Math.round(totalFat * 10) / 10;

    const calGoal = goals.calorieGoal || 2000;
    const remainingCal = calGoal - totalCal;
    const pct = Math.min(Math.round((totalCal / calGoal) * 100), 999);

    // Update Calories Card
    const remainingEl = document.getElementById('calories-remaining-val');
    const consumedEl = document.getElementById('calories-consumed-val');
    const goalEl = document.getElementById('calories-goal-val');
    const pctEl = document.getElementById('calories-pct-val');
    const statusBadge = document.getElementById('calorie-status-badge');
    const circle = document.getElementById('calorie-progress-circle');

    if (consumedEl) consumedEl.textContent = `${totalCal.toLocaleString()} kcal`;
    if (goalEl) goalEl.textContent = `${calGoal.toLocaleString()} kcal`;
    if (pctEl) pctEl.textContent = `${pct}%`;

    if (remainingEl) {
      if (remainingCal >= 0) {
        remainingEl.textContent = remainingCal.toLocaleString();
        document.querySelector('.calories-main-label').textContent = 'remaining';
      } else {
        remainingEl.textContent = '+' + Math.abs(remainingCal).toLocaleString();
        document.querySelector('.calories-main-label').textContent = 'over target';
      }
    }

    // Status Badge
    if (statusBadge) {
      if (totalCal > calGoal) {
        statusBadge.textContent = 'Over Target';
        statusBadge.className = 'badge badge-danger';
      } else if (pct >= 85) {
        statusBadge.textContent = 'Near Goal';
        statusBadge.className = 'badge badge-warning';
      } else {
        statusBadge.textContent = 'On Track';
        statusBadge.className = 'badge badge-success';
      }
    }

    // Circular Progress Ring
    if (circle) {
      circle.style.strokeDasharray = `${CIRCLE_CIRCUMFERENCE} ${CIRCLE_CIRCUMFERENCE}`;
      const ratio = Math.min(totalCal / calGoal, 1);
      const offset = CIRCLE_CIRCUMFERENCE - (ratio * CIRCLE_CIRCUMFERENCE);
      circle.style.strokeDashoffset = offset;

      if (totalCal > calGoal) {
        circle.setAttribute('stroke', '#ef4444'); // Red
      } else {
        circle.setAttribute('stroke', '#10b981'); // Emerald
      }
    }

    // Update Macros
    const pConsumedEl = document.getElementById('protein-consumed');
    const pGoalEl = document.getElementById('protein-goal');
    const pProgEl = document.getElementById('protein-progress');

    const cConsumedEl = document.getElementById('carbs-consumed');
    const cGoalEl = document.getElementById('carbs-goal');
    const cProgEl = document.getElementById('carbs-progress');

    const fConsumedEl = document.getElementById('fat-consumed');
    const fGoalEl = document.getElementById('fat-goal');
    const fProgEl = document.getElementById('fat-progress');

    if (pConsumedEl) pConsumedEl.textContent = totalProtein;
    if (pGoalEl) pGoalEl.textContent = goals.proteinGoal;
    if (pProgEl) pProgEl.style.width = `${Math.min(100, Math.round((totalProtein / (goals.proteinGoal || 1)) * 100))}%`;

    if (cConsumedEl) cConsumedEl.textContent = totalCarbs;
    if (cGoalEl) cGoalEl.textContent = goals.carbsGoal;
    if (cProgEl) cProgEl.style.width = `${Math.min(100, Math.round((totalCarbs / (goals.carbsGoal || 1)) * 100))}%`;

    if (fConsumedEl) fConsumedEl.textContent = totalFat;
    if (fGoalEl) fGoalEl.textContent = goals.fatGoal;
    if (fProgEl) fProgEl.style.width = `${Math.min(100, Math.round((totalFat / (goals.fatGoal || 1)) * 100))}%`;

    // Update Water
    renderWater();
  }

  function renderWater() {
    const dayData = getActiveDayData(state.currentDate);
    const waterGoal = state.settings.waterGoal || 8;
    const currentWater = dayData.water || 0;

    const fractionBadge = document.getElementById('water-fraction');
    const volumeLabel = document.getElementById('water-volume-label');
    const container = document.getElementById('water-glasses-container');

    if (fractionBadge) fractionBadge.textContent = `${currentWater} / ${waterGoal} glasses`;
    if (volumeLabel) volumeLabel.textContent = `${currentWater * 250} ml (${(currentWater * 0.25).toFixed(2)} L)`;

    if (container) {
      container.innerHTML = '';
      for (let i = 1; i <= waterGoal; i++) {
        const glass = document.createElement('div');
        glass.className = `water-glass-icon ${i <= currentWater ? 'filled' : ''}`;
        glass.title = `Glass ${i} (250ml)`;
        glass.innerHTML = '<div class="water-glass-fill"></div>';
        glass.addEventListener('click', () => {
          // If clicking the current level, reduce by 1, otherwise set to clicked glass
          if (dayData.water === i) {
            dayData.water = i - 1;
          } else {
            dayData.water = i;
          }
          saveToStorage();
          renderWater();
        });
        container.appendChild(glass);
      }
    }
  }

  function renderMeals() {
    const dayData = getActiveDayData(state.currentDate);
    const categories = ['breakfast', 'lunch', 'dinner', 'snack'];

    categories.forEach(category => {
      const listEl = document.getElementById(`${category}-items`);
      const calBadge = document.getElementById(`${category}-calories`);
      const items = dayData.meals[category] || [];

      let mealCalories = 0;
      items.forEach(it => {
        mealCalories += Number(it.calories) || 0;
      });

      if (calBadge) {
        calBadge.textContent = `${Math.round(mealCalories)} kcal`;
      }

      if (!listEl) return;

      if (items.length === 0) {
        listEl.innerHTML = `<div class="empty-meal-hint">No food logged for ${category} yet.</div>`;
        return;
      }

      listEl.innerHTML = '';
      items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'food-item-row';
        row.dataset.id = item.id;

        const p = item.protein !== undefined && item.protein !== '' ? `${item.protein}g P` : '0g P';
        const c = item.carbs !== undefined && item.carbs !== '' ? `${item.carbs}g C` : '0g C';
        const f = item.fat !== undefined && item.fat !== '' ? `${item.fat}g F` : '0g F';

        row.innerHTML = `
          <div class="food-item-info">
            <span class="food-item-name">${escapeHTML(item.name)}</span>
            <div class="food-item-macros">
              <span>${p}</span>
              <span>&bull;</span>
              <span>${c}</span>
              <span>&bull;</span>
              <span>${f}</span>
            </div>
          </div>
          <div class="food-item-right">
            <span class="food-item-cal">${Math.round(item.calories)} kcal</span>
            <button class="btn-item-delete" title="Delete entry" data-meal="${category}" data-id="${item.id}">&times;</button>
          </div>
        `;

        listEl.appendChild(row);
      });
    });

    // Attach delete handlers
    document.querySelectorAll('.btn-item-delete').forEach(btn => {
      btn.addEventListener('click', handleItemDelete);
    });
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  function handleItemDelete(e) {
    const meal = e.currentTarget.dataset.meal;
    const id = e.currentTarget.dataset.id;
    const dayData = getActiveDayData(state.currentDate);

    if (dayData.meals[meal]) {
      const idx = dayData.meals[meal].findIndex(i => i.id === id);
      if (idx !== -1) {
        const removed = dayData.meals[meal].splice(idx, 1);
        saveToStorage();
        renderSummary();
        renderMeals();
        renderWeeklyChart();
        if (removed && removed[0]) {
          showToast(`Removed "${removed[0].name}"`);
        }
      }
    }
  }

  // --- 7-Day Calorie Trend Chart (Pure Canvas) ---
  function renderWeeklyChart() {
    const canvas = document.getElementById('weekly-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Resize for crisp display on high DPI screens
    const width = rect.width || 380;
    const height = rect.height || 200;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Build the 7 days array ending at currentDate
    const daysArr = [];
    for (let i = 6; i >= 0; i--) {
      const dStr = addDays(state.currentDate, -i);
      const data = state.days[dStr];
      let cal = 0;
      if (data && data.meals) {
        Object.keys(data.meals).forEach(k => {
          (data.meals[k] || []).forEach(item => {
            cal += Number(item.calories) || 0;
          });
        });
      }

      // Format short weekday
      const parts = dStr.split('-');
      const dObj = new Date(parts[0], parseInt(parts[1], 10) - 1, parts[2]);
      const dayName = dObj.toLocaleDateString(undefined, { weekday: 'short' });

      daysArr.push({
        dateStr: dStr,
        dayName: dayName,
        calories: Math.round(cal),
        isCurrent: dStr === state.currentDate
      });
    }

    const goal = state.settings.calorieGoal || 2000;
    const maxCalorieValue = Math.max(...daysArr.map(d => d.calories), goal);
    const chartMax = Math.ceil((maxCalorieValue * 1.15) / 500) * 500 || 2500;

    const padding = { top: 25, bottom: 35, left: 20, right: 20 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Draw Goal Line
    const goalY = padding.top + chartHeight - (goal / chartMax) * chartHeight;
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.moveTo(padding.left, goalY);
    ctx.lineTo(width - padding.right, goalY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dashed line

    // Goal Label
    ctx.fillStyle = '#64748b';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${goal} goal`, width - padding.right, goalY - 4);

    // Bar dimensions
    const barWidth = Math.min(32, (chartWidth / daysArr.length) * 0.6);
    const step = chartWidth / daysArr.length;

    daysArr.forEach((day, index) => {
      const barX = padding.left + index * step + (step - barWidth) / 2;
      const barH = (day.calories / chartMax) * chartHeight;
      const barY = padding.top + chartHeight - barH;

      // Color selection
      let fillColor = '#10b981'; // green on-track
      if (day.calories > goal) {
        fillColor = '#ef4444'; // red over-goal
      } else if (day.calories === 0) {
        fillColor = '#e2e8f0'; // empty gray
      }

      // Draw Bar
      ctx.fillStyle = fillColor;
      drawRoundedRect(ctx, barX, barY, barWidth, Math.max(barH, 3), 4);
      ctx.fill();

      // If current selected date, draw outline highlight
      if (day.isCurrent) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, barX - 2, barY - 2, barWidth + 4, Math.max(barH, 3) + 4, 6);
        ctx.stroke();
      }

      // Draw Day Label below
      ctx.fillStyle = day.isCurrent ? '#0f172a' : '#64748b';
      ctx.font = day.isCurrent ? 'bold 11px -apple-system, sans-serif' : '11px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(day.dayName, barX + barWidth / 2, height - padding.bottom + 18);

      // Draw Calorie value text above bar
      if (day.calories > 0) {
        ctx.fillStyle = '#334155';
        ctx.font = '10px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(day.calories.toString(), barX + barWidth / 2, barY - 6);
      }
    });
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    if (height < radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x, y);
    ctx.closePath();
  }

  // --- Form & Action Handlers ---

  function handleFoodSubmit(e) {
    e.preventDefault();

    const nameInput = document.getElementById('food-name');
    const mealSelect = document.getElementById('food-meal');
    const calInput = document.getElementById('food-calories');
    const pInput = document.getElementById('food-protein');
    const cInput = document.getElementById('food-carbs');
    const fInput = document.getElementById('food-fat');

    const name = nameInput.value.trim();
    const meal = mealSelect.value;
    const calories = parseFloat(calInput.value);
    const protein = parseFloat(pInput.value) || 0;
    const carbs = parseFloat(cInput.value) || 0;
    const fat = parseFloat(fInput.value) || 0;

    if (!name || isNaN(calories) || calories < 0) {
      showToast('Please enter a valid food name and calories.');
      return;
    }

    const newItem = {
      id: generateId(),
      name: name,
      calories: calories,
      protein: protein,
      carbs: carbs,
      fat: fat
    };

    const dayData = getActiveDayData(state.currentDate);
    if (!dayData.meals[meal]) {
      dayData.meals[meal] = [];
    }
    dayData.meals[meal].push(newItem);

    saveToStorage();
    renderSummary();
    renderMeals();
    renderWeeklyChart();

    // Reset inputs
    nameInput.value = '';
    calInput.value = '';
    pInput.value = '';
    cInput.value = '';
    fInput.value = '';
    nameInput.focus();

    showToast(`Added "${name}" to ${meal}!`);
  }

  function handlePresetClick(btn) {
    const name = btn.dataset.name;
    const cal = parseFloat(btn.dataset.cal);
    const p = parseFloat(btn.dataset.p);
    const c = parseFloat(btn.dataset.c);
    const f = parseFloat(btn.dataset.f);
    const meal = document.getElementById('food-meal').value;

    const newItem = {
      id: generateId(),
      name: name,
      calories: cal,
      protein: p,
      carbs: c,
      fat: f
    };

    const dayData = getActiveDayData(state.currentDate);
    if (!dayData.meals[meal]) dayData.meals[meal] = [];
    dayData.meals[meal].push(newItem);

    saveToStorage();
    renderSummary();
    renderMeals();
    renderWeeklyChart();

    showToast(`Quick added "${name}" to ${meal}!`);
  }

  // --- Date Navigation Handlers ---

  function setupDateNavigation() {
    const prevBtn = document.getElementById('prev-day-btn');
    const nextBtn = document.getElementById('next-day-btn');
    const todayBtn = document.getElementById('today-btn');
    const pickerInput = document.getElementById('date-picker');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        state.currentDate = addDays(state.currentDate, -1);
        updateAllViews();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        state.currentDate = addDays(state.currentDate, 1);
        updateAllViews();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        state.currentDate = getTodayString();
        updateAllViews();
      });
    }

    if (pickerInput) {
      pickerInput.addEventListener('change', (e) => {
        if (e.target.value) {
          state.currentDate = e.target.value;
          updateAllViews();
        }
      });
    }
  }

  function updateAllViews() {
    renderDate();
    renderSummary();
    renderMeals();
    renderWeeklyChart();
  }

  // --- Settings & Data Backup Handlers ---

  function setupSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const openBtn = document.getElementById('open-settings-btn');
    const closeBtn = document.getElementById('close-settings-btn');
    const form = document.getElementById('settings-form');

    const calInput = document.getElementById('setting-cal-goal');
    const pInput = document.getElementById('setting-p-goal');
    const cInput = document.getElementById('setting-c-goal');
    const fInput = document.getElementById('setting-f-goal');
    const waterInput = document.getElementById('setting-water-goal');

    function populateModalInputs() {
      if (calInput) calInput.value = state.settings.calorieGoal;
      if (pInput) pInput.value = state.settings.proteinGoal;
      if (cInput) cInput.value = state.settings.carbsGoal;
      if (fInput) fInput.value = state.settings.fatGoal;
      if (waterInput) waterInput.value = state.settings.waterGoal;
    }

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        populateModalInputs();
        modal.classList.remove('hidden');
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        state.settings.calorieGoal = parseInt(calInput.value, 10) || 2000;
        state.settings.proteinGoal = parseInt(pInput.value, 10) || 140;
        state.settings.carbsGoal = parseInt(cInput.value, 10) || 220;
        state.settings.fatGoal = parseInt(fInput.value, 10) || 65;
        state.settings.waterGoal = parseInt(waterInput.value, 10) || 8;

        saveToStorage();
        modal.classList.add('hidden');
        updateAllViews();
        showToast('Daily targets successfully updated!');
      });
    }

    // Export Data (JSON Download)
    const exportBtn = document.getElementById('export-data-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `nutritrack_backup_${getTodayString()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('Backup downloaded successfully!');
      });
    }

    // Import Data (JSON Upload)
    const importInput = document.getElementById('import-data-input');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
          try {
            const importedData = JSON.parse(event.target.result);
            if (importedData && (importedData.days || importedData.settings)) {
              state.settings = { ...DEFAULT_SETTINGS, ...(importedData.settings || {}) };
              state.days = importedData.days || {};
              saveToStorage();
              updateAllViews();
              modal.classList.add('hidden');
              showToast('Data restored successfully!');
            } else {
              showToast('Invalid backup file format.');
            }
          } catch (err) {
            console.error('Import error:', err);
            showToast('Failed to parse backup JSON file.');
          }
        };
        reader.readAsText(file);
      });
    }

    // Clear All Data
    const clearBtn = document.getElementById('clear-data-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const confirmed = window.confirm('Are you sure you want to reset all log history and reset goals to default? This cannot be undone.');
        if (confirmed) {
          localStorage.removeItem(STORAGE_KEY);
          state.settings = { ...DEFAULT_SETTINGS };
          state.days = {};
          saveToStorage();
          modal.classList.add('hidden');
          updateAllViews();
          showToast('All data has been reset.');
        }
      });
    }
  }

  // --- Water Quick Controls ---
  function setupWaterButtons() {
    const minusBtn = document.getElementById('water-minus-btn');
    const plusBtn = document.getElementById('water-plus-btn');

    if (minusBtn) {
      minusBtn.addEventListener('click', () => {
        const dayData = getActiveDayData(state.currentDate);
        if (dayData.water > 0) {
          dayData.water -= 1;
          saveToStorage();
          renderWater();
        }
      });
    }

    if (plusBtn) {
      plusBtn.addEventListener('click', () => {
        const dayData = getActiveDayData(state.currentDate);
        dayData.water = (dayData.water || 0) + 1;
        saveToStorage();
        renderWater();
      });
    }
  }

  // --- Initialization ---
  function init() {
    loadFromStorage();
    seedSampleDataIfEmpty();

    renderDate();
    renderSummary();
    renderMeals();
    renderWeeklyChart();

    // Food form submission
    const foodForm = document.getElementById('food-form');
    if (foodForm) {
      foodForm.addEventListener('submit', handleFoodSubmit);
    }

    // Quick presets
    document.querySelectorAll('.preset-pill').forEach(btn => {
      btn.addEventListener('click', () => handlePresetClick(btn));
    });

    // Scroll to form button
    const scrollBtn = document.getElementById('scroll-to-add-btn');
    if (scrollBtn) {
      scrollBtn.addEventListener('click', () => {
        const target = document.getElementById('add-food-card');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          document.getElementById('food-name').focus();
        }
      });
    }

    // Setup interactive features
    setupDateNavigation();
    setupWaterButtons();
    setupSettingsModal();

    // Redraw canvas on window resize
    window.addEventListener('resize', () => {
      renderWeeklyChart();
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

