// DOM Elements
const calcForm = document.getElementById('calc-form');
const startMonthSelect = document.getElementById('start-month');
const startYearInput = document.getElementById('start-year');
const retireMonthSelect = document.getElementById('retire-month');
const retireYearInput = document.getElementById('retire-year');
const totalMonthsInput = document.getElementById('total-months');
const btnCalcMonths = document.getElementById('btn-calc-months');

const baseWageOldInput = document.getElementById('base-wage-old');
const baseWageNewInput = document.getElementById('base-wage-new');
const baseWage20kInput = document.getElementById('base-wage-20k');
const baseWage23kInput = document.getElementById('base-wage-23k');

const m39AYearsInput = document.getElementById('m39-a-years');
const resM39AYearsLabel = document.getElementById('res-m39-a-years-label');
const barM39AYearsLabel = document.getElementById('bar-m39-a-years-label');
const resM39AAddLabel = document.getElementById('res-m39-a-add-label');

const m39BYearsInput = document.getElementById('m39-b-years');
const resM39BYearsLabel = document.getElementById('res-m39-b-years-label');
const barM39BYearsLabel = document.getElementById('bar-m39-b-years-label');
const barM39BLbl = document.getElementById('bar-lbl-m39-b');

const customWagesToggle = document.getElementById('custom-wages-toggle');
const customWagesContainer = document.getElementById('custom-wages-container');
const btnFillMax = document.getElementById('btn-fill-max');
const btnFillM39 = document.getElementById('btn-fill-m39');
const wagesGrid = document.getElementById('wages-grid');

// Results elements
const resStandardPension = document.getElementById('res-standard-pension');
const resStandardPct = document.getElementById('res-standard-pct');
const resStandardAvg = document.getElementById('res-standard-avg');

const resM39APension = document.getElementById('res-m39-a-pension');
const resM39APct = document.getElementById('res-m39-a-pct');
const resM39ABase = document.getElementById('res-m39-a-base');

const resM39BPension = document.getElementById('res-m39-b-pension');
const resM39BPct = document.getElementById('res-m39-b-pct');
const resM39BAvg = document.getElementById('res-m39-b-avg');

// Chart elements
const barStandard = document.getElementById('bar-standard');
const barM39A = document.getElementById('bar-m39-a');
const barM39B = document.getElementById('bar-m39-b');

const barValStandard = document.getElementById('bar-val-standard');
const barValM39A = document.getElementById('bar-val-m39-a');
const barValM39B = document.getElementById('bar-val-m39-b');

// Detail blocks & filters
const showDetailStd = document.getElementById('show-detail-std');
const showDetailM39A = document.getElementById('show-detail-m39-a');
const showDetailM39B = document.getElementById('show-detail-m39-b');

const detailBlockStd = document.getElementById('detail-block-std');
const detailBlockM39A = document.getElementById('detail-block-m39-a');
const detailBlockM39B = document.getElementById('detail-block-m39-b');

// Detail math values
const stdDetailMonths = document.getElementById('std-detail-months');
const stdDetailRate = document.getElementById('std-detail-rate');
const stdDetailAvgFormula = document.getElementById('std-detail-avg-formula');
const stdDetailCalc = document.getElementById('std-detail-calc');

const m39aDetailRate = document.getElementById('m39a-detail-rate');
const m39aDetailAvg = document.getElementById('m39a-detail-avg');
const m39aDetailCalc = document.getElementById('m39a-detail-calc');

const m39bDetailMonths = document.getElementById('m39b-detail-months');
const m39bDetailRate = document.getElementById('m39b-detail-rate');
const m39bDetailAvgFormula = document.getElementById('m39b-detail-avg-formula');
const m39bDetailCalc = document.getElementById('m39b-detail-calc');

const timelineBody = document.getElementById('timeline-body');

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
let isDarkTheme = false;

themeToggle.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    themeToggle.innerHTML = isDarkTheme ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Thai Month Names
const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

// Wage state helper
let last60MonthsWages = [];

// Init application
function init() {
    setupEventListeners();
    calculatePension();
}

function autoCalculateMonths() {
    const startMonth = parseInt(startMonthSelect.value);
    const startYear = parseInt(startYearInput.value);
    const retireMonth = parseInt(retireMonthSelect.value);
    const retireYear = parseInt(retireYearInput.value);

    if (startYear > retireYear || (startYear === retireYear && startMonth > retireMonth)) {
        return;
    }

    const yearsDiff = retireYear - startYear;
    const monthsDiff = retireMonth - startMonth;
    const totalMonths = (yearsDiff * 12) + monthsDiff + 1;

    totalMonthsInput.value = totalMonths;
}

function setupEventListeners() {
    // Date inputs trigger auto calculation of months and pension calculation
    const dateInputs = [startMonthSelect, startYearInput, retireMonthSelect, retireYearInput];
    dateInputs.forEach(input => {
        input.addEventListener('input', () => {
            autoCalculateMonths();
            if (customWagesToggle.checked) {
                generateWagesGrid();
            }
            calculatePension();
        });
    });

    // Other inputs only trigger pension calculation
    const otherInputs = [
        totalMonthsInput, baseWageOldInput, baseWageNewInput, 
        baseWage20kInput, baseWage23kInput, m39AYearsInput, m39BYearsInput
    ];
    otherInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input !== m39AYearsInput && input !== m39BYearsInput && customWagesToggle.checked) {
                generateWagesGrid();
            }
            calculatePension();
        });
    });

    // Calculate months button (keeps manual calculation helper)
    btnCalcMonths.addEventListener('click', () => {
        autoCalculateMonths();
        if (customWagesToggle.checked) {
            generateWagesGrid();
        }
        calculatePension();
    });

    // Custom wages toggle
    customWagesToggle.addEventListener('change', () => {
        if (customWagesToggle.checked) {
            customWagesContainer.classList.remove('hidden');
            generateWagesGrid();
        } else {
            customWagesContainer.classList.add('hidden');
        }
        calculatePension();
    });

    // Details filter checkboxes
    const filterToggles = [
        { cb: showDetailStd, block: detailBlockStd },
        { cb: showDetailM39A, block: detailBlockM39A },
        { cb: showDetailM39B, block: detailBlockM39B }
    ];
    filterToggles.forEach(item => {
        item.cb.addEventListener('change', () => {
            if (item.cb.checked) {
                item.block.classList.remove('hidden');
            } else {
                item.block.classList.add('hidden');
            }
        });
    });
}

// Helper function to get wage ceiling based on year schedule
function getCeilingForYear(year, ceilOld, ceilNew, ceil20k, ceil23k) {
    if (year <= 2568) {
        return ceilOld;
    } else if (year >= 2569 && year <= 2571) {
        return ceilNew;
    } else if (year >= 2572 && year <= 2574) {
        return ceil20k;
    } else { // 2575 onwards
        return ceil23k;
    }
}

// Generate wages grid inputs for the last 60 months
function generateWagesGrid() {
    wagesGrid.innerHTML = '';
    const retireMonth = parseInt(retireMonthSelect.value);
    const retireYear = parseInt(retireYearInput.value);
    
    const ceilOld = parseFloat(baseWageOldInput.value) || 15000;
    const ceilNew = parseFloat(baseWageNewInput.value) || 17500;
    const ceil20k = parseFloat(baseWage20kInput.value) || 20000;
    const ceil23k = parseFloat(baseWage23kInput.value) || 23000;

    last60MonthsWages = [];

    // Loop backwards for 60 months
    for (let i = 59; i >= 0; i--) {
        // Calculate year and month for this item
        let m = retireMonth - i;
        let y = retireYear;
        
        while (m < 0) {
            m += 12;
            y -= 1;
        }

        // Get default ceiling for this month
        const defaultWage = getCeilingForYear(y, ceilOld, ceilNew, ceil20k, ceil23k);
        last60MonthsWages.push({
            monthIndex: m,
            year: y,
            wage: defaultWage
        });

        // Create DOM element for input
        const wrapper = document.createElement('div');
        wrapper.className = 'wage-month-input';

        const label = document.createElement('label');
        label.textContent = `${THAI_MONTHS[m].substring(0, 3)}. ${y}`;
        label.htmlFor = `wage-input-${i}`;

        const input = document.createElement('input');
        input.type = 'number';
        input.id = `wage-input-${i}`;
        input.className = 'form-input';
        input.value = defaultWage;
        input.min = 0;
        input.max = 50000;
        input.dataset.index = 59 - i; // map to array index

        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            last60MonthsWages[index].wage = parseFloat(e.target.value) || 0;
            calculatePension();
        });

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        wagesGrid.appendChild(wrapper);
    }
}

// Fill all inputs in custom wage grid with a value or calculated max
function fillAllCustomWages(valueType) {
    const inputs = wagesGrid.querySelectorAll('input');
    const ceilOld = parseFloat(baseWageOldInput.value) || 15000;
    const ceilNew = parseFloat(baseWageNewInput.value) || 17500;
    const ceil20k = parseFloat(baseWage20kInput.value) || 20000;
    const ceil23k = parseFloat(baseWage23kInput.value) || 23000;

    inputs.forEach(input => {
        const index = parseInt(input.dataset.index);
        let value = 0;
        
        if (valueType === 'max') {
            const item = last60MonthsWages[index];
            value = getCeilingForYear(item.year, ceilOld, ceilNew, ceil20k, ceil23k);
        } else {
            value = valueType; // numeric value e.g. 4800
        }

        input.value = value;
        last60MonthsWages[index].wage = value;
    });

    calculatePension();
}

// Core pension calculation logic
function calculatePension() {
    // Retrieve inputs
    const totalMonths = parseInt(totalMonthsInput.value) || 0;
    const ceilOld = parseFloat(baseWageOldInput.value) || 15000;
    const ceilNew = parseFloat(baseWageNewInput.value) || 17500;
    const ceil20k = parseFloat(baseWage20kInput.value) || 20000;
    const ceil23k = parseFloat(baseWage23kInput.value) || 23000;
    const retireMonth = parseInt(retireMonthSelect.value);
    const retireYear = parseInt(retireYearInput.value);

    // 1. Calculate pension rate percentage
    let pensionPct = 20.0;
    let excessMonths = 0;
    let excessYears = 0;
    let excessPct = 0;

    if (totalMonths >= 180) {
        excessMonths = totalMonths - 180;
        excessYears = Math.floor(excessMonths / 12);
        excessPct = excessYears * 1.5;
        pensionPct = 20.0 + excessPct;
    } else {
        // Less than 15 years, pension rate remains 20% in theory, but in reality they get a lump sum
        pensionPct = 20.0;
    }

    // 2. Calculate average salary of the last 60 months
    let avgSalary = 0;
    let formulaHtml = '';
    let monthsTimeline = [];

    if (customWagesToggle.checked) {
        // Use custom wages
        let sum = 0;
        last60MonthsWages.forEach(item => {
            sum += item.wage;
            monthsTimeline.push({
                month: item.monthIndex,
                year: item.year,
                wage: item.wage,
                type: item.wage === 4800 ? 'ม.39' : 'ม.33'
            });
        });
        avgSalary = sum / 60;
        formulaHtml = `ผลรวมค่าจ้าง 60 เดือนสุดท้าย (${formatNumber(sum)} บาท) / 60 เดือน = ${formatNumber(avgSalary)} บาท`;
    } else {
        // Automatically calculate based on ceiling rules
        let countOld = 0;
        let countNew = 0;
        let count20k = 0;
        let count23k = 0;

        // Loop backwards for 60 months from retirement month/year
        for (let i = 0; i < 60; i++) {
            let m = retireMonth - i;
            let y = retireYear;
            
            while (m < 0) {
                m += 12;
                y -= 1;
            }

            const currentCeiling = getCeilingForYear(y, ceilOld, ceilNew, ceil20k, ceil23k);
            if (y <= 2568) {
                countOld++;
            } else if (y >= 2569 && y <= 2571) {
                countNew++;
            } else if (y >= 2572 && y <= 2574) {
                count20k++;
            } else {
                count23k++;
            }

            monthsTimeline.push({
                month: m,
                year: y,
                wage: currentCeiling,
                type: 'ม.33'
            });
        }

        const totalOldWage = countOld * ceilOld;
        const totalNewWage = countNew * ceilNew;
        const total20kWage = count20k * ceil20k;
        const total23kWage = count23k * ceil23k;
        const totalSum = totalOldWage + totalNewWage + total20kWage + total23kWage;
        avgSalary = totalSum / 60;

        // Construct mathematical formula text
        const parts = [];
        if (countOld > 0) parts.push(`(${formatNumber(ceilOld)} บาท × ${countOld} เดือน)`);
        if (countNew > 0) parts.push(`(${formatNumber(ceilNew)} บาท × ${countNew} เดือน)`);
        if (count20k > 0) parts.push(`(${formatNumber(ceil20k)} บาท × ${count20k} เดือน)`);
        if (count23k > 0) parts.push(`(${formatNumber(ceil23k)} บาท × ${count23k} เดือน)`);
        
        const combinedParts = parts.join(' + ');
        formulaHtml = `${combinedParts} = ${formatNumber(totalSum)} / 60 เดือน = ${formatNumber(avgSalary)} บาท`;
    }

    // 3. Compute Standard Pension
    const standardPension = avgSalary * (pensionPct / 100);

    // 4. Compute Scenario A (M.39 + X years, original base)
    const m39AYears = parseFloat(m39AYearsInput.value) || 5;
    const m39APct = pensionPct + (m39AYears * 1.5);
    const m39APension = avgSalary * (m39APct / 100);

    // 5. Compute Scenario B (M.39 X years immediately after Section 33, before retirement)
    // Mixed average: X*12 months of M39 (4,800) + (60 - X*12) months of Section 33 (from history)
    const m39BYears = parseFloat(m39BYearsInput.value) || 5;
    const m39BMonths = Math.min(Math.round(m39BYears * 12), 60);
    const s33MonthsToUse = 60 - m39BMonths;

    // Total months under Option B increases by the months contributed under M39
    const totalMonthsB = totalMonths + Math.round(m39BYears * 12);
    let pensionPctB = 20.0;
    if (totalMonthsB >= 180) {
        const excessMonthsB = totalMonthsB - 180;
        const excessYearsB = Math.floor(excessMonthsB / 12);
        pensionPctB = 20.0 + (excessYearsB * 1.5);
    }

    let sumB = m39BMonths * 4800;
    for (let i = 0; i < s33MonthsToUse; i++) {
        sumB += monthsTimeline[i].wage;
    }
    const avgSalaryB = sumB / 60;
    const m39BPension = avgSalaryB * (pensionPctB / 100);

    // 6. Update UI elements
    updateUI({
        totalMonths,
        excessMonths,
        excessYears,
        excessPct,
        pensionPct,
        avgSalary,
        formulaHtml,
        standardPension,
        m39AYears,
        m39APct,
        m39APension,
        m39BYears,
        m39BMonths,
        s33MonthsToUse,
        totalMonthsB,
        pensionPctB,
        avgSalaryB,
        m39BPension,
        monthsTimeline
    });
}

function updateUI(data) {
    // 1. Update metric values
    resStandardPension.textContent = formatCurrency(data.standardPension);
    resStandardPct.textContent = `${data.pensionPct.toFixed(1)}%`;
    resStandardAvg.textContent = formatCurrency(data.avgSalary);

    resM39APension.textContent = formatCurrency(data.m39APension);
    resM39APct.textContent = `${data.m39APct.toFixed(1)}%`;
    resM39ABase.textContent = formatCurrency(data.avgSalary);

    // Update Option A Years label dynamically
    resM39AYearsLabel.textContent = data.m39AYears;
    barM39AYearsLabel.textContent = data.m39AYears;
    resM39AAddLabel.textContent = `รับเพิ่ม (+${(data.m39AYears * 1.5).toFixed(1)}%):`;

    resM39BPension.textContent = formatCurrency(data.m39BPension);
    resM39BPct.textContent = `${data.pensionPctB.toFixed(1)}%`;
    resM39BAvg.textContent = formatCurrency(data.avgSalaryB);
    resM39BYearsLabel.textContent = data.m39BYears;
    barM39BYearsLabel.textContent = data.m39BYears;

    // Dynamically adjust Option B card warning classes and labels
    const bCard = document.getElementById('card-m39-b');
    const badgeB = document.getElementById('badge-m39-b');
    const lblBAvg = document.getElementById('lbl-m39-b-avg');
    const chartGroupB = document.getElementById('chart-group-m39-b');
    const barLabelB = document.getElementById('bar-lbl-m39-b');
    
    if (data.m39BYears >= 5) {
        bCard.className = 'card metric-card scenario-b-card warning-card';
        badgeB.className = 'card-badge bg-danger';
        badgeB.style.background = '';
        badgeB.style.color = '';
        badgeB.textContent = 'ม.39 (ทางเลือก B) - Trap!';
        lblBAvg.textContent = 'ฐานลดลงเหลือ:';
        barLabelB.innerHTML = `ม.39 (ทางเลือก B) - ส่งฐาน 4,800 ทันที <span id="bar-m39-b-years-label">${data.m39BYears}</span> ปี <span class="text-danger">(Section 39 Trap)</span>`;
    } else {
        bCard.className = 'card metric-card scenario-b-card';
        bCard.style.borderColor = '#f59e0b';
        badgeB.className = 'card-badge';
        badgeB.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        badgeB.style.color = 'white';
        badgeB.textContent = 'ม.39 (ทางเลือก B) - ฐานผสม';
        lblBAvg.textContent = 'ฐานเฉลี่ยผสม:';
        barLabelB.innerHTML = `ม.39 (ทางเลือก B) - ส่งฐาน 4,800 ทันที <span id="bar-m39-b-years-label">${data.m39BYears}</span> ปี (ฐานเฉลี่ยผสม)`;
    }

    // Highlight card depending on totalMonths
    const stdCard = document.querySelector('.standard-card');
    if (data.totalMonths < 180) {
        stdCard.classList.add('warning-card');
        stdCard.querySelector('.metric-label').innerHTML = `<span class="text-danger"><i class="fas fa-exclamation-circle"></i> จะได้รับเป็นเงินบำเหน็จ (จ่ายครั้งเดียว)</span>`;
    } else {
        stdCard.classList.remove('warning-card');
        stdCard.querySelector('.metric-label').textContent = 'ได้รับเงินบำนาญชราภาพเดือนละ';
    }

    // 2. Update Charts
    const maxVal = Math.max(data.standardPension, data.m39APension, data.m39BPension, 100);
    
    const stdWidth = (data.standardPension / maxVal) * 100;
    const m39AWidth = (data.m39APension / maxVal) * 100;
    const m39BWidth = (data.m39BPension / maxVal) * 100;

    barStandard.style.width = `${stdWidth}%`;
    barM39A.style.width = `${m39AWidth}%`;
    barM39B.style.width = `${m39BWidth}%`;

    barValStandard.textContent = formatCurrency(data.standardPension);
    barValM39A.textContent = formatCurrency(data.m39APension);
    barValM39B.textContent = formatCurrency(data.m39BPension);

    // 3. Update Calculation Explanations for all Options
    
    // Standard Option (ม.33)
    if (data.totalMonths >= 180) {
        stdDetailMonths.innerHTML = `${data.totalMonths} งวด <span class="text-success">(ส่งเงินสมทบเกิน 180 งวด มา ${data.excessMonths} งวด คิดเป็น ${data.excessYears} ปีที่เกิน)</span>`;
        stdDetailRate.innerHTML = `20% (15 ปีแรก) + (${data.excessYears} ปีที่เกิน × 1.5%) = <strong>${data.pensionPct.toFixed(1)}%</strong>`;
        stdDetailAvgFormula.innerHTML = data.formulaHtml;
        stdDetailCalc.innerHTML = `${formatNumber(data.avgSalary)} บาท × ${data.pensionPct.toFixed(1)}% = <strong>${formatCurrency(data.standardPension)} บาท/เดือน</strong>`;
    } else {
        stdDetailMonths.innerHTML = `${data.totalMonths} งวด <span class="text-danger">(ส่งเงินสมทบไม่ครบ 180 งวด)</span>`;
        stdDetailRate.innerHTML = `ได้รับเงินบำเหน็จ (สะสมชราภาพ)`;
        stdDetailAvgFormula.innerHTML = `ไม่มีสิทธิรับบำนาญรายเดือน`;
        stdDetailCalc.innerHTML = `จะได้รับเงินบำเหน็จสะสมก้อนเดียวตามจริง`;
    }

    // Option A
    m39aDetailRate.innerHTML = `${data.pensionPct.toFixed(1)}% (อัตราบำนาญ ม.33 เดิม) + (${data.m39AYears} ปี ม.39 × 1.5%) = <strong>${data.m39APct.toFixed(1)}%</strong>`;
    m39aDetailAvg.innerHTML = `คงฐานเดิมที่ดีที่สุดก่อนสมัคร ม.39 คือ <strong>${formatNumber(data.avgSalary)} บาท</strong>`;
    m39aDetailCalc.innerHTML = `${formatNumber(data.avgSalary)} บาท × ${data.m39APct.toFixed(1)}% = <strong>${formatCurrency(data.m39APension)} บาท/เดือน</strong>`;

    // Option B
    m39bDetailMonths.innerHTML = `${data.totalMonths} (ม.33) + ${data.m39BMonths} (ม.39) = <strong>${data.totalMonthsB} งวด</strong> <span class="text-success">(ส่งเงินสมทบเกิน 180 งวด มา ${Math.max(data.totalMonthsB - 180, 0)} งวด คิดเป็น ${Math.floor(Math.max(data.totalMonthsB - 180, 0) / 12)} ปีที่เกิน)</span>`;
    
    const excessMonthsB = Math.max(data.totalMonthsB - 180, 0);
    const excessYearsB = Math.floor(excessMonthsB / 12);
    m39bDetailRate.innerHTML = `20% (15 ปีแรก) + (${excessYearsB} ปีที่เกิน × 1.5%) = <strong>${data.pensionPctB.toFixed(1)}%</strong>`;
    
    // Calculate display of mixed formula dynamically
    let formulaString = '';
    if (data.m39BMonths > 0) {
        formulaString += `(4,800 บาท × ${data.m39BMonths} เดือน)`;
    }
    if (data.s33MonthsToUse > 0) {
        // Find the sum of Section 33 portion
        let sumS33 = 0;
        for (let i = 0; i < data.s33MonthsToUse; i++) {
            sumS33 += data.monthsTimeline[i].wage;
        }
        formulaString += (formulaString ? ' + ' : '') + `(${formatNumber(sumS33 / data.s33MonthsToUse)} บาท × ${data.s33MonthsToUse} เดือน)`;
    }
    m39bDetailAvgFormula.innerHTML = `${formulaString} = ${formatNumber(data.avgSalaryB * 60)} / 60 เดือน = <strong>${formatNumber(data.avgSalaryB)} บาท</strong>`;
    m39bDetailCalc.innerHTML = `${formatNumber(data.avgSalaryB)} บาท × ${data.pensionPctB.toFixed(1)}% = <strong>${formatCurrency(data.m39BPension)} บาท/เดือน</strong>`;

    // 4. Update the 60 Months Timeline Table
    timelineBody.innerHTML = '';
    
    // Sort timeline so that newest is at the top
    const timelineData = [...data.monthsTimeline];
    
    timelineData.forEach((item, index) => {
        const tr = document.createElement('tr');
        
        const tdIndex = document.createElement('td');
        tdIndex.textContent = index + 1;
        
        const tdDate = document.createElement('td');
        tdDate.textContent = `${THAI_MONTHS[item.month]} ${item.year}`;
        
        const tdType = document.createElement('td');
        const span = document.createElement('span');
        span.className = `status-pill ${item.type === 'ม.39' ? 'm39' : 'm33'}`;
        span.textContent = item.type;
        tdType.appendChild(span);
        
        const tdWage = document.createElement('td');
        tdWage.textContent = formatCurrency(item.wage);
        tdWage.style.fontWeight = '600';
        
        tr.appendChild(tdIndex);
        tr.appendChild(tdDate);
        tr.appendChild(tdType);
        tr.appendChild(tdWage);
        
        timelineBody.appendChild(tr);
    });
}

// Utility Formatting Functions
function formatCurrency(val) {
    return '฿' + val.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Utility formatting
function formatNumber(val) {
    return val.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Run init on load
window.addEventListener('DOMContentLoaded', init);
